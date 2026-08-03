import path from 'node:path';
import { runCaseMatrix } from './browser-runner.mjs';
import { artifactPaths } from './artifacts.mjs';
import { writeJsonAtomic } from './io.mjs';

function duplicateIds(elements) {
  const counts = new Map();
  for (const element of elements) if (element.id) counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id).sort();
}

export function evaluateInteractionInventory(elements = [], policy = {}) {
  const minTargetWidth = Math.max(1, Number(policy.minTargetWidth ?? 24));
  const minTargetHeight = Math.max(1, Number(policy.minTargetHeight ?? 24));
  const visibleInteractive = elements.filter((entry) => entry.visible !== false && entry.interactive !== false);
  const missingNames = visibleInteractive.filter((entry) => !entry.disabled && !String(entry.accessibleName ?? '').trim());
  const targetSizeViolations = visibleInteractive.filter((entry) => !entry.disabled && (Number(entry.width) < minTargetWidth || Number(entry.height) < minTargetHeight));
  const nestedInteractive = visibleInteractive.filter((entry) => entry.nestedInteractive);
  const duplicates = duplicateIds(elements);
  const blocking = [];
  if (policy.failOnMissingAccessibleName !== false && missingNames.length) blocking.push('missing-accessible-name');
  if (policy.failOnNestedInteractive !== false && nestedInteractive.length) blocking.push('nested-interactive-control');
  if (policy.failOnDuplicateIds !== false && duplicates.length) blocking.push('duplicate-id');
  if (targetSizeViolations.length > Number(policy.maxTargetSizeViolations ?? 0)) blocking.push('target-size-policy');
  return {
    schemaVersion: 1,
    passed: blocking.length === 0,
    blocking,
    totalInteractive: visibleInteractive.length,
    missingNameCount: missingNames.length,
    targetSizeViolationCount: targetSizeViolations.length,
    nestedInteractiveCount: nestedInteractive.length,
    duplicateIds: duplicates,
    missingNames,
    targetSizeViolations,
    nestedInteractive
  };
}

export async function inspectInteractionsAll(config, { baseUrl, headed = false, filters = {} } = {}) {
  if (!config.interaction?.enabled) return [];
  const results = await runCaseMatrix(config, async ({ page, caseDefinition }) => {
    const elements = await page.evaluate(({ selector, maxElements }) => {
      const candidates = [...document.querySelectorAll(selector)].slice(0, maxElements);
      const getName = (element) => {
        const aria = element.getAttribute('aria-label'); if (aria?.trim()) return aria.trim();
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
          const text = labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();
          if (text) return text;
        }
        if (element instanceof HTMLInputElement && element.id) {
          const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`); if (label?.textContent?.trim()) return label.textContent.trim();
        }
        if (element.closest('label')?.textContent?.trim()) return element.closest('label').textContent.trim();
        for (const value of [element.getAttribute('alt'), element.getAttribute('title'), element.getAttribute('value'), element.textContent]) if (value?.replace(/\s+/g, ' ').trim()) return value.replace(/\s+/g, ' ').trim();
        return '';
      };
      return candidates.map((element, index) => {
        const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
        const nativeInteractive = ['a', 'button', 'input', 'select', 'textarea', 'summary'].includes(element.tagName.toLowerCase());
        const role = element.getAttribute('role');
        const roleInteractive = ['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option', 'slider', 'spinbutton', 'textbox', 'combobox'].includes(role);
        const nested = Boolean(element.querySelector('a,button,input,select,textarea,summary,[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])'));
        return {
          index,
          tag: element.tagName.toLowerCase(), id: element.id || null, role,
          interactive: nativeInteractive || roleInteractive || element.tabIndex >= 0,
          accessibleName: getName(element).slice(0, 300),
          visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0,
          disabled: element.matches(':disabled,[aria-disabled="true"]'),
          tabIndex: element.tabIndex,
          width: rect.width, height: rect.height,
          nestedInteractive: nested,
          pointerEvents: style.pointerEvents,
          text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 200)
        };
      });
    }, { selector: config.interaction.selector, maxElements: config.interaction.maxElements });
    const evaluation = evaluateInteractionInventory(elements, config.interaction);
    const paths = artifactPaths(config.outputDir, caseDefinition);
    await writeJsonAtomic(paths.interactionJson, { schemaVersion: 1, key: caseDefinition.key, inspectedAt: new Date().toISOString(), policy: config.interaction, elements, evaluation });
    return { key: caseDefinition.key, interactionPath: paths.interactionJson, elements, ...evaluation, ok: evaluation.passed };
  }, { mode: 'current', baseUrl, headed, filters, label: 'interaction' });
  const reportPath = path.join(config.outputDir, 'reports', 'interaction.json');
  await writeJsonAtomic(reportPath, { schemaVersion: 1, generatedAt: new Date().toISOString(), policy: config.interaction, results });
  results.reportPath = reportPath;
  return results;
}
