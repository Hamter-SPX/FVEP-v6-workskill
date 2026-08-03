import path from 'node:path';
import { artifactPaths, safeSegment } from './artifacts.mjs';
import { runCaseMatrix } from './browser-runner.mjs';
import { ensureParent, writeJsonAtomic } from './io.mjs';

const STYLE_PROPERTIES = Object.freeze(['color', 'backgroundColor', 'borderColor', 'borderWidth', 'boxShadow', 'outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset', 'opacity', 'transform', 'textDecorationLine', 'filter']);

export function compareStyleSnapshots(base = {}, state = {}) {
  const keys = [...new Set([...Object.keys(base), ...Object.keys(state)])].sort();
  const changed = keys.filter((property) => String(base[property] ?? '') !== String(state[property] ?? '')).map((property) => ({ property, from: base[property] ?? null, to: state[property] ?? null }));
  return { changed, changedProperties: changed.map((item) => item.property), changedCount: changed.length };
}

export function evaluateStateFeedback(items = []) {
  const results = items.map((item) => ({ ...item, hoverDelta: compareStyleSnapshots(item.base, item.hover), focusDelta: compareStyleSnapshots(item.base, item.focus) }));
  const missingHoverFeedback = results.filter((item) => !item.disabled && item.hoverDelta.changedCount === 0);
  const missingFocusFeedback = results.filter((item) => !item.disabled && item.focusDelta.changedCount === 0);
  return { passed: missingFocusFeedback.length === 0, items: results, missingHoverFeedback, missingFocusFeedback };
}

async function styleSnapshot(locator) {
  return locator.evaluate((element, properties) => {
    const style = getComputedStyle(element); const output = {};
    for (const property of properties) output[property] = style[property];
    return output;
  }, STYLE_PROPERTIES);
}

export async function crawlInteractionStatesAll(config, { baseUrl, headed = false, filters = {} } = {}) {
  if (!config.stateCrawler?.enabled) return [];
  return runCaseMatrix(config, async ({ page, caseDefinition }) => {
    const candidates = await page.evaluate(({ selector, maxElements }) => {
      const domPath = (element) => {
        if (element.id) return `#${CSS.escape(element.id)}`;
        const parts = [];
        let current = element;
        while (current instanceof Element && current !== document.documentElement) {
          const tag = current.tagName.toLowerCase(); const siblings = current.parentElement ? [...current.parentElement.children].filter((item) => item.tagName === current.tagName) : [];
          parts.unshift(`${tag}${siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : ''}`); current = current.parentElement;
        }
        return ['html', ...parts].join('>');
      };
      return [...document.querySelectorAll(selector)].filter((element) => {
        const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      }).slice(0, maxElements).map((element, index) => ({ index, selector: domPath(element), id: element.id || null, tag: element.tagName.toLowerCase(), disabled: element.matches(':disabled,[aria-disabled="true"]'), text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120) }));
    }, { selector: config.stateCrawler.selector, maxElements: config.stateCrawler.maxElements });

    const items = [];
    for (const candidate of candidates) {
      const locator = page.locator(candidate.selector).first();
      try {
        const base = await styleSnapshot(locator);
        let hover = base; let focus = base; const errors = [];
        try { await locator.hover({ timeout: config.runtime.timeoutMs }); hover = await styleSnapshot(locator); } catch (error) { errors.push({ state: 'hover', message: error.message }); }
        try { await locator.focus({ timeout: config.runtime.timeoutMs }); focus = await styleSnapshot(locator); } catch (error) { errors.push({ state: 'focus', message: error.message }); }
        const item = { key: `${candidate.index}-${safeSegment(candidate.id || candidate.text || candidate.tag)}`, ...candidate, base, hover, focus, errors };
        if (config.stateCrawler.captureElementScreenshots) {
          const screenshotPath = path.join(config.outputDir, 'state-crawler', caseDefinition.key, `${item.key}.png`);
          await ensureParent(screenshotPath);
          try { await locator.screenshot({ path: screenshotPath, animations: config.capture.animations, caret: config.capture.caret }); item.screenshotPath = screenshotPath; } catch (error) { item.errors.push({ state: 'screenshot', message: error.message }); }
        }
        items.push(item);
      } catch (error) {
        items.push({ key: `${candidate.index}-${safeSegment(candidate.id || candidate.text || candidate.tag)}`, ...candidate, base: {}, hover: {}, focus: {}, errors: [{ state: 'base', message: error.message }] });
      }
    }
    const evaluation = evaluateStateFeedback(items);
    const paths = artifactPaths(config.outputDir, caseDefinition);
    await writeJsonAtomic(paths.stateCrawlerJson, { schemaVersion: 1, key: caseDefinition.key, crawledAt: new Date().toISOString(), policy: config.stateCrawler, evaluation });
    return { key: caseDefinition.key, stateCrawlerPath: paths.stateCrawlerJson, missingHoverFeedbackCount: evaluation.missingHoverFeedback.length, missingFocusFeedbackCount: evaluation.missingFocusFeedback.length, itemCount: items.length, ok: evaluation.passed, evaluation };
  }, { mode: 'current', baseUrl, headed, filters, label: 'state-crawler' });
}
