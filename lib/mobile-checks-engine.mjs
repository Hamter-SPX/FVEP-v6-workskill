/**
 * Mobile checks — per-case vision metrics + judge verdicts for the mobile
 * vision loop (capture.type ios-sim|android). Reads current artifacts written
 * by captureAllMobile and writes <key>.mobile.judgment.json into the
 * metadata folder, next to the schemaVersion-2 capture metadata.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { artifactPaths } from './artifacts.mjs';
import { ensureParent, writeJsonAtomic } from './io.mjs';
import { computeVisionMetrics } from './vision-metrics-engine.mjs';
import { judgeMetrics } from './vision-judge-engine.mjs';

export async function runMobileChecks(config, { filters = {} } = {}) {
  if (!['ios-sim', 'android'].includes(config.capture?.type)) {
    throw new TypeError(`runMobileChecks requires capture.type ios-sim|android, got ${config.capture?.type}`);
  }
  const cases = (config.mobile?.cases ?? []).filter((c) => {
    if (filters.route && c.label !== filters.route) return false;
    if (filters.case && c.key !== filters.case) return false;
    return true;
  });
  const thresholds = config.mobile?.judge?.thresholds ?? {};
  const results = [];
  for (const c of cases) {
    const paths = artifactPaths(config.outputDir, { routeName: c.label, viewportName: 'mobile', stateName: c.key });
    if (!fs.existsSync(paths.currentPng)) {
      results.push({
        key: c.key,
        label: c.label,
        verdict: 'fail',
        findings: [{ rule: 'missingCapture', severity: 'fail', expected: 'captured PNG', observed: null }],
        metricsPath: null,
        judgmentPath: null
      });
      continue;
    }
    const pngBytes = fs.readFileSync(paths.currentPng);
    const png = PNG.sync.read(pngBytes);
    const metrics = computeVisionMetrics({ width: png.width, height: png.height, data: png.data }, { cols: 8, rows: 5 });
    metrics.source = {
      sha256: crypto.createHash('sha256').update(pngBytes).digest('hex'),
      width: png.width,
      height: png.height
    };
    const verdictRecord = judgeMetrics({
      metrics,
      thresholds,
      caseLabel: c.label,
      goal: `mobile case ${c.key}`,
      metricsRef: null,
      captureRef: paths.currentPng
    });
    const judgmentPath = path.join(
      config.outputDir,
      'metadata',
      `${path.basename(paths.currentPng).replace(/\.png$/, '')}.mobile.judgment.json`
    );
    await ensureParent(judgmentPath);
    await writeJsonAtomic(judgmentPath, verdictRecord);
    results.push({
      key: c.key,
      label: c.label,
      verdict: verdictRecord.verdict,
      findings: verdictRecord.findings,
      metricsPath: null,
      judgmentPath
    });
  }
  return results;
}
