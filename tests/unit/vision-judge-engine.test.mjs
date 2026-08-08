import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERDICTS,
  evaluateMetrics,
  judgeMetrics,
  validateVerdictRecord,
  buildVerdictRecord
} from '../../lib/vision-judge-engine.mjs';

const baseMetrics = {
  dimensions: { width: 80, height: 40 },
  occupancy: { grid: { cols: 8, rows: 5 }, cells: new Array(40).fill(0.5), emptyCells: [], balance: { centerX: 0, centerY: 0 } },
  density: { mean: 0.05 },
  palette: { colors: [], harmony: 'complementary' },
  alignment: { vertical: 0.6, horizontal: null, score: 0.6 },
  contrast: { bins: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], darkShare: 0.5, lightShare: 0.5, midShare: 0 }
};

test('VERDICTS has exactly pass/warn/fail', () => {
  assert.deepEqual([...VERDICTS].sort(), ['fail', 'pass', 'warn']);
});

test('evaluateMetrics — no thresholds → no findings', () => {
  assert.deepEqual(evaluateMetrics(baseMetrics, {}), []);
});

test('evaluateMetrics — suspectBackground warns unconditionally', () => {
  const m = structuredClone(baseMetrics);
  m.occupancy = { ...m.occupancy, suspectBackground: true, backgroundShare: 0.22 };
  const findings = evaluateMetrics(m, {});
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, 'suspectBackground');
  assert.equal(findings[0].severity, 'warn');
});

test('evaluateMetrics — maxEmptyCells fail when exceeded', () => {
  const m = structuredClone(baseMetrics);
  m.occupancy.emptyCells = [{ col: 0, row: 0, ratio: 0 }, { col: 1, row: 0, ratio: 0.01 }];
  const findings = evaluateMetrics(m, { maxEmptyCells: 1 });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, 'maxEmptyCells');
  assert.equal(findings[0].severity, 'fail');
  assert.equal(findings[0].observed, 2);
});

test('evaluateMetrics — severity object form honored (warn)', () => {
  const m = structuredClone(baseMetrics);
  m.alignment = { vertical: 0.3, horizontal: null, score: 0.3 };
  const findings = evaluateMetrics(m, { minAlignment: { value: 0.5, severity: 'warn' } });
  assert.equal(findings[0]?.severity, 'warn');
});

test('judgeMetrics — fail dominates warn dominates pass', () => {
  const bad = structuredClone(baseMetrics);
  bad.occupancy.emptyCells = [{ col: 0, row: 0, ratio: 0 }];
  const vFail = judgeMetrics({ metrics: bad, thresholds: { maxEmptyCells: 0 }, caseLabel: 'chat', goal: 'dense list' });
  assert.equal(vFail.verdict, 'fail');
  const vWarn = judgeMetrics({ metrics: bad, thresholds: { maxEmptyCells: { value: 0, severity: 'warn' } } });
  assert.equal(vWarn.verdict, 'warn');
  const vPass = judgeMetrics({ metrics: baseMetrics, thresholds: { maxEmptyCells: 5 } });
  assert.equal(vPass.verdict, 'pass');
});

test('buildVerdictRecord + validateVerdictRecord round-trip', () => {
  const rec = buildVerdictRecord({
    mode: 'metrics', caseLabel: 'chat', goal: 'g',
    verdict: 'pass', findings: [], metricsRef: '.fx/metrics.json', captureRef: '.fx/cur.png', judgedBy: 'metrics-engine'
  });
  assert.equal(rec.schema_version, 1);
  assert.equal(rec.mode, 'metrics');
  assert.equal(validateVerdictRecord(rec), rec);
  assert.throws(() => validateVerdictRecord({ ...rec, verdict: 'meh' }), /verdict/);
  assert.throws(() => validateVerdictRecord({ ...rec, judged_at: 'not-a-date' }), /judged_at/);
  assert.throws(() => validateVerdictRecord({ verdict: 'pass' }), /case_label/);
});
