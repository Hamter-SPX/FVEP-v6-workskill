import { executeActions } from './actions.mjs';
import { runtimeEvidencePath } from './artifacts.mjs';
import { createRuntimeCollector, summarizeRuntime } from './browser-runtime.mjs';
import { enumerateCases } from './config.mjs';
import { writeJsonAtomic } from './io.mjs';

async function loadPlaywright() {
  try { return await import('playwright'); }
  catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') throw new Error('Playwright is not installed. Run `npm install` and `npx playwright install chromium` inside the suite directory.');
    throw error;
  }
}

async function installInitScripts(context, config, caseDefinition) {
  const runtime = config.runtime;
  const state = caseDefinition.state;
  if (config.performance?.enabled) {
    await context.addInitScript(() => {
      const store = { lcp: 0, cls: 0, longTasks: [], layoutShifts: [], events: [] };
      Object.defineProperty(globalThis, '__FVL_PERFORMANCE__', { value: store, configurable: false, enumerable: false, writable: false });
      try { performance.setResourceTimingBufferSize?.(5000); } catch { /* Browser may not expose this API. */ }
      const observe = (type, callback, options = {}) => {
        try {
          const observer = new PerformanceObserver((list) => callback(list.getEntries()));
          observer.observe({ type, buffered: true, ...options });
        } catch { /* Entry type may not be supported in this browser. */ }
      };
      observe('largest-contentful-paint', (entries) => { for (const entry of entries) store.lcp = Math.max(store.lcp, Number(entry.startTime || 0)); });
      observe('layout-shift', (entries) => {
        for (const entry of entries) if (!entry.hadRecentInput) { store.cls += Number(entry.value || 0); store.layoutShifts.push({ value: Number(entry.value || 0), startTime: Number(entry.startTime || 0) }); }
      });
      observe('longtask', (entries) => { for (const entry of entries) store.longTasks.push({ startTime: Number(entry.startTime || 0), duration: Number(entry.duration || 0), name: entry.name || 'longtask' }); });
      observe('event', (entries) => { for (const entry of entries) if (Number(entry.duration || 0) >= 40) store.events.push({ name: entry.name, startTime: Number(entry.startTime || 0), duration: Number(entry.duration || 0), interactionId: Number(entry.interactionId || 0) }); }, { durationThreshold: 40 });
    });
  }
  if (runtime.freezeTime || Number.isInteger(runtime.randomSeed)) {
    await context.addInitScript(({ freezeTime, randomSeed }) => {
      if (freezeTime) {
        const fixedMilliseconds = new Date(freezeTime).valueOf();
        if (Number.isFinite(fixedMilliseconds)) {
          const NativeDate = globalThis.Date;
          class FixedDate extends NativeDate {
            constructor(...args) { super(...(args.length ? args : [fixedMilliseconds])); }
            static now() { return fixedMilliseconds; }
          }
          Object.setPrototypeOf(FixedDate, NativeDate);
          globalThis.Date = FixedDate;
        }
      }
      if (Number.isInteger(randomSeed)) {
        let seed = randomSeed >>> 0;
        Math.random = () => {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          return seed / 4294967296;
        };
      }
    }, { freezeTime: runtime.freezeTime, randomSeed: runtime.randomSeed });
  }

  if (Object.keys(state.localStorage).length || Object.keys(state.sessionStorage).length) {
    await context.addInitScript(({ localValues, sessionValues }) => {
      try { for (const [key, value] of Object.entries(localValues)) localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch { /* Origin may not expose storage. */ }
      try { for (const [key, value] of Object.entries(sessionValues)) sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch { /* Origin may not expose storage. */ }
    }, { localValues: state.localStorage, sessionValues: state.sessionStorage });
  }
}

async function addStateCookies(context, caseDefinition) {
  if (!caseDefinition.state.cookies.length) return;
  const origin = new URL(caseDefinition.url).origin;
  const cookies = caseDefinition.state.cookies.map((cookie) => {
    if (cookie.url || cookie.domain) return cookie;
    return { ...cookie, url: origin };
  });
  await context.addCookies(cookies);
}

async function waitForStableAssets(page, capture) {
  if (capture.waitForFonts) await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  if (capture.waitForImages) {
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(async (image) => {
        if (!image.complete) await new Promise((resolve) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); });
        try { await image.decode(); } catch { /* Broken image remains evidence. */ }
      }));
    });
  }
}

async function waitForReady(page, caseDefinition, timeoutMs) {
  if (caseDefinition.readySelector) await page.locator(caseDefinition.readySelector).first().waitFor({ state: 'visible', timeout: timeoutMs });
  if (caseDefinition.readyScript) {
    await page.waitForFunction((source) => {
      try { return Boolean(globalThis.eval(source)); } catch { return false; }
    }, caseDefinition.readyScript, { timeout: timeoutMs });
  }
}

export async function runCaseMatrix(config, worker, {
  mode = 'current', baseUrl, headed = false, label = 'run', filters = {}, continueOnError = true
} = {}) {
  const playwright = await loadPlaywright();
  const browserType = playwright[config.runtime.browser];
  if (!browserType) throw new Error(`Unsupported Playwright browser: ${config.runtime.browser}`);
  const browser = await browserType.launch({ headless: !(headed || config.runtime.headed) });
  const cases = enumerateCases(config, { ...filters, mode, baseUrl });
  const results = [];

  try {
    for (const caseDefinition of cases) {
      const startedAt = new Date().toISOString();
      const started = performance.now();
      const context = await browser.newContext({
        viewport: { width: caseDefinition.viewport.width, height: caseDefinition.viewport.height },
        deviceScaleFactor: caseDefinition.viewport.deviceScaleFactor ?? config.runtime.deviceScaleFactor,
        colorScheme: config.runtime.colorScheme,
        locale: config.runtime.locale,
        timezoneId: config.runtime.timezoneId,
        reducedMotion: config.runtime.reducedMotion,
        userAgent: config.runtime.userAgent ?? undefined,
        extraHTTPHeaders: config.runtime.extraHTTPHeaders
      });
      context.setDefaultTimeout(config.runtime.timeoutMs);
      context.setDefaultNavigationTimeout(config.runtime.timeoutMs);
      await installInitScripts(context, config, caseDefinition);
      await addStateCookies(context, caseDefinition);
      const page = await context.newPage();
      const runtimeEvents = createRuntimeCollector(page);
      process.stdout.write(`[${label}] ${caseDefinition.key}\n`);

      try {
        const navigationResponse = await page.goto(caseDefinition.url, { waitUntil: caseDefinition.waitUntil, timeout: config.runtime.timeoutMs });
        await waitForReady(page, caseDefinition, config.runtime.timeoutMs);
        await executeActions(page, caseDefinition.state.actions);
        await waitForReady(page, caseDefinition, config.runtime.timeoutMs);
        await waitForStableAssets(page, config.capture);
        const deterministicStyles = [
          'html{scroll-behavior:auto!important}',
          config.capture.animations === 'disabled' ? '*,*::before,*::after{animation-delay:0s!important;animation-duration:0s!important;transition-delay:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}' : '',
          config.capture.caret === 'hide' ? '*{caret-color:transparent!important}' : '',
          ...(config.capture.hideSelectors ?? []).map((selector) => `${selector}{visibility:hidden!important}`),
          config.capture.style ?? ''
        ].filter(Boolean).join('\n');
        if (deterministicStyles) await page.addStyleTag({ content: deterministicStyles });
        if (caseDefinition.settleMs > 0) await page.waitForTimeout(caseDefinition.settleMs);

        const workerResult = await worker({ page, context, caseDefinition, runtimeEvents, navigation: navigationResponse ? { status: navigationResponse.status(), statusText: navigationResponse.statusText(), url: navigationResponse.url() } : null });
        const runtimeSummary = summarizeRuntime(runtimeEvents, config.runtime);
        const runtimePath = runtimeEvidencePath(config.outputDir, caseDefinition, label);
        await writeJsonAtomic(runtimePath, { schemaVersion: 1, key: caseDefinition.key, label, capturedAt: new Date().toISOString(), events: runtimeEvents, summary: runtimeSummary });
        const ok = runtimeSummary.status === 'pass' && workerResult?.ok !== false;
        results.push({ key: caseDefinition.key, ok, runtimePath, runtimeSummary, startedAt, durationMs: Math.round(performance.now() - started), ...workerResult });
      } catch (error) {
        const runtimeSummary = summarizeRuntime(runtimeEvents, config.runtime);
        const runtimePath = runtimeEvidencePath(config.outputDir, caseDefinition, `${label}-failed`);
        await writeJsonAtomic(runtimePath, { schemaVersion: 1, key: caseDefinition.key, label, capturedAt: new Date().toISOString(), events: runtimeEvents, summary: runtimeSummary, error: { name: error.name, message: error.message, stack: error.stack } });
        results.push({ key: caseDefinition.key, ok: false, runtimePath, runtimeSummary, startedAt, durationMs: Math.round(performance.now() - started), error: { name: error.name, message: error.message, stack: error.stack } });
        if (!continueOnError) throw error;
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  return results;
}
