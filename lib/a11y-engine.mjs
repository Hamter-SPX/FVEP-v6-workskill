import { createRequire } from 'node:module';
import { artifactPaths } from './artifacts.mjs';
import { runCaseMatrix } from './browser-runner.mjs';
import { writeJsonAtomic } from './io.mjs';
const require = createRequire(import.meta.url);

function axePath() {
  try { return require.resolve('axe-core/axe.min.js'); }
  catch { throw new Error('axe-core is not installed. Run `npm install` inside the suite directory.'); }
}
function compactNode(node) { return { target: node.target, html: node.html?.slice(0, 600), failureSummary: node.failureSummary, impact: node.impact, any: node.any?.map(({ id, message, impact }) => ({ id, message, impact })), all: node.all?.map(({ id, message, impact }) => ({ id, message, impact })), none: node.none?.map(({ id, message, impact }) => ({ id, message, impact })) }; }
function compactRule(rule) { return { id: rule.id, impact: rule.impact, tags: rule.tags, description: rule.description, help: rule.help, helpUrl: rule.helpUrl, nodes: rule.nodes.map(compactNode) }; }

function positiveCssLength(value) {
  const number = Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(number) && number > 0;
}

export function evaluateKeyboardProbe(items = []) {
  const invisibleFocus = items.filter((item) => {
    const indicator = item.focusIndicator ?? {};
    const visibleOutline = indicator.outlineStyle !== 'none' && positiveCssLength(indicator.outlineWidth);
    const visibleShadow = indicator.boxShadow && indicator.boxShadow !== 'none';
    return item.visible && !visibleOutline && !visibleShadow;
  });
  const offscreenFocus = items.filter((item) => item.visible && item.inViewport === false);
  return { passed: invisibleFocus.length === 0 && offscreenFocus.length === 0, invisibleFocus, offscreenFocus };
}

async function keyboardProbe(page, limit) {
  if (limit <= 0) return [];
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  const result = []; const seen = new Set();
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press('Tab');
    const item = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || element === document.body) return null;
      const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
      const selector = element.id ? `#${CSS.escape(element.id)}` : `${element.tagName.toLowerCase()}${element.getAttribute('name') ? `[name="${element.getAttribute('name')}"]` : ''}`;
      return {
        selector,
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        ariaLabel: element.getAttribute('aria-label'),
        text: (element.innerText || element.getAttribute('value') || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        tabIndex: element.tabIndex,
        visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
        inViewport: rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth,
        rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        focusIndicator: { outline: style.outline, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor, outlineOffset: style.outlineOffset, boxShadow: style.boxShadow }
      };
    });
    if (!item) break;
    const fingerprint = `${item.selector}|${item.text}`;
    if (seen.has(fingerprint)) break;
    seen.add(fingerprint); result.push(item);
  }
  return result;
}

export async function auditA11yAll(config, { baseUrl, headed = false, filters = {} } = {}) {
  if (!config.accessibility.enabled) return [];
  const script = axePath();
  return runCaseMatrix(config, async ({ page, caseDefinition, runtimeEvents }) => {
    await page.addScriptTag({ path: script });
    const raw = await page.evaluate(async ({ tags, disabledRules, excludeSelectors }) => {
      const rules = Object.fromEntries(disabledRules.map((id) => [id, { enabled: false }]));
      const context = excludeSelectors.length ? { exclude: excludeSelectors.map((selector) => [selector]) } : document;
      return globalThis.axe.run(context, { runOnly: { type: 'tag', values: tags }, rules, resultTypes: ['violations', 'incomplete', 'passes', 'inapplicable'] });
    }, { tags: config.accessibility.tags, disabledRules: config.accessibility.disabledRules, excludeSelectors: config.accessibility.excludeSelectors });
    const violations = raw.violations.map(compactRule); const incomplete = raw.incomplete.map(compactRule);
    const blockingViolations = violations.filter((rule) => config.accessibility.failImpacts.includes(rule.impact));
    const keyboard = await keyboardProbe(page, config.accessibility.keyboardProbeLimit);
    const keyboardEvaluation = evaluateKeyboardProbe(keyboard);
    const keyboardBlocks = (config.accessibility.failOnInvisibleFocus && keyboardEvaluation.invisibleFocus.length > 0)
      || (config.accessibility.failOnOffscreenFocus && keyboardEvaluation.offscreenFocus.length > 0);
    const paths = artifactPaths(config.outputDir, caseDefinition);
    const output = {
      schemaVersion: 2,
      key: caseDefinition.key,
      auditedAt: new Date().toISOString(),
      url: raw.url,
      testEngine: raw.testEngine,
      counts: { violations: violations.length, blockingViolations: blockingViolations.length, incomplete: incomplete.length, passes: raw.passes.length, inapplicable: raw.inapplicable.length, keyboardStops: keyboard.length, invisibleFocus: keyboardEvaluation.invisibleFocus.length, offscreenFocus: keyboardEvaluation.offscreenFocus.length },
      violations,
      incomplete,
      keyboardProbe: keyboard,
      keyboardEvaluation,
      runtimeEvents
    };
    await writeJsonAtomic(paths.accessibilityJson, output);
    return {
      accessibilityPath: paths.accessibilityJson,
      violationCount: violations.length,
      blockingViolationCount: blockingViolations.length,
      incompleteCount: incomplete.length,
      keyboardStopCount: keyboard.length,
      invisibleFocusCount: keyboardEvaluation.invisibleFocus.length,
      offscreenFocusCount: keyboardEvaluation.offscreenFocus.length,
      ok: blockingViolations.length === 0 && !keyboardBlocks
    };
  }, { mode: 'current', baseUrl, headed, filters, label: 'a11y' });
}
