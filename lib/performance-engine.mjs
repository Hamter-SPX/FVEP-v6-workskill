import path from 'node:path';
import { runCaseMatrix } from './browser-runner.mjs';
import { artifactPaths } from './artifacts.mjs';
import { writeJsonAtomic } from './io.mjs';

function normalizeBudget(metric, raw) {
  if (raw === null || raw === false) return null;
  const value = typeof raw === 'number' ? { max: raw } : raw;
  const max = Number(value?.max);
  if (!Number.isFinite(max) || max < 0) throw new RangeError(`Performance budget ${metric}.max must be a non-negative number.`);
  return { metric, max, hard: Boolean(value.hard), weight: Math.max(0, Number(value.weight ?? 1) || 1) };
}

export function evaluatePerformanceBudgets(metrics = {}, budgets = {}, { failOnWarnings = false } = {}) {
  const checks = []; const hardFailures = []; const warnings = [];
  let weightedScore = 0; let totalWeight = 0; let assessedWeight = 0;
  for (const [metric, rawBudget] of Object.entries(budgets)) {
    const budget = normalizeBudget(metric, rawBudget); if (!budget) continue;
    totalWeight += budget.weight;
    const actual = Number(metrics[metric]);
    if (!Number.isFinite(actual)) { checks.push({ ...budget, actual: null, status: 'unknown', score: 0 }); continue; }
    assessedWeight += budget.weight;
    const ratio = budget.max === 0 ? (actual === 0 ? 1 : Infinity) : actual / budget.max;
    const passed = actual <= budget.max;
    const score = passed ? 100 : Math.max(0, 100 - Math.min(100, 20 + (ratio - 1) * 80));
    const item = { ...budget, actual, ratio: Number(ratio.toFixed(4)), status: passed ? 'pass' : budget.hard ? 'fail' : 'warning', score: Number(score.toFixed(2)) };
    checks.push(item); weightedScore += budget.weight * (score / 100);
    if (!passed) (budget.hard ? hardFailures : warnings).push(item);
  }
  const score = totalWeight ? (weightedScore / totalWeight) * 100 : 100;
  const confidence = totalWeight ? (assessedWeight / totalWeight) * 100 : 100;
  return {
    schemaVersion: 1,
    passed: hardFailures.length === 0 && (!failOnWarnings || warnings.length === 0),
    score: Number(score.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    hardFailures,
    warnings,
    checks
  };
}

export async function auditPerformanceAll(config, { baseUrl, headed = false, filters = {} } = {}) {
  if (!config.performance?.enabled) return [];
  const results = await runCaseMatrix(config, async ({ page, caseDefinition }) => {
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const paint = Object.fromEntries(performance.getEntriesByType('paint').map((entry) => [entry.name, entry.startTime]));
      const perf = globalThis.__FVL_PERFORMANCE__ ?? { lcp: 0, cls: 0, longTasks: [] };
      const transferBytes = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      const jsTransferBytes = resources.filter((entry) => entry.initiatorType === 'script' || /\.m?js(?:\?|$)/i.test(entry.name)).reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      return {
        lcpMs: Number(perf.lcp || 0), cls: Number(perf.cls || 0),
        inpMs: Math.max(0, ...(perf.events ?? []).map((entry) => Number(entry.duration || 0))),
        fcpMs: Number(paint['first-contentful-paint'] || 0),
        domContentLoadedMs: Number(nav?.domContentLoadedEventEnd || 0),
        loadMs: Number(nav?.loadEventEnd || 0),
        ttfbMs: Number(nav?.responseStart || 0),
        longTaskTotalMs: (perf.longTasks ?? []).reduce((sum, item) => sum + Number(item.duration || 0), 0),
        longTaskCount: (perf.longTasks ?? []).length,
        transferBytes, jsTransferBytes, requestCount: resources.length,
        domNodes: document.getElementsByTagName('*').length,
        imageCount: document.images.length,
        imageMissingDimensions: [...document.images].filter((image) => !image.getAttribute('width') && !image.getAttribute('height') && getComputedStyle(image).aspectRatio === 'auto').length
      };
    });
    const budget = evaluatePerformanceBudgets(metrics, config.performance.budgets, { failOnWarnings: config.performance.failOnWarnings });
    const paths = artifactPaths(config.outputDir, caseDefinition);
    await writeJsonAtomic(paths.performanceJson, { schemaVersion: 1, key: caseDefinition.key, auditedAt: new Date().toISOString(), metrics, budget });
    return { key: caseDefinition.key, performancePath: paths.performanceJson, metrics, budget, ok: budget.passed };
  }, { mode: 'current', baseUrl, headed, filters, label: 'performance' });
  const reportPath = path.join(config.outputDir, 'reports', 'performance.json');
  await writeJsonAtomic(reportPath, { schemaVersion: 1, generatedAt: new Date().toISOString(), budgets: config.performance.budgets, results });
  results.reportPath = reportPath;
  return results;
}
