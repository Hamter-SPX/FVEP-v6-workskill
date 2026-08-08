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

test('evaluateMetrics — threshold table covers all six rule keys', () => {
  const cases = [
    {
      rule: 'maxEmptyCells', thresholds: { maxEmptyCells: 1 },
      mutate: (m) => { m.occupancy.emptyCells = [{ col: 0, row: 0, ratio: 0 }, { col: 1, row: 0, ratio: 0.01 }]; },
      observed: 2
    },
    { rule: 'minAlignment', thresholds: { minAlignment: 0.9 }, mutate: null, observed: 0.6 },
    { rule: 'maxDarkShare', thresholds: { maxDarkShare: 0.4 }, mutate: null, observed: 0.5 },
    { rule: 'minDarkShare', thresholds: { minDarkShare: 0.6 }, mutate: null, observed: 0.5 },
    { rule: 'maxLightShare', thresholds: { maxLightShare: 0.4 }, mutate: null, observed: 0.5 },
    { rule: 'minLightShare', thresholds: { minLightShare: 0.6 }, mutate: null, observed: 0.5 }
  ];
  for (const { rule, thresholds, mutate, observed } of cases) {
    const m = structuredClone(baseMetrics);
    if (mutate) mutate(m);
    const findings = evaluateMetrics(m, thresholds);
    assert.equal(findings.length, 1, rule);
    assert.equal(findings[0].rule, rule);
    assert.equal(findings[0].severity, 'fail');
    assert.equal(findings[0].observed, observed);
  }
  // Same six keys at generous bounds → no findings.
  assert.deepEqual(evaluateMetrics(baseMetrics, {
    maxEmptyCells: 99, minAlignment: 0, maxDarkShare: 1, minDarkShare: 0, maxLightShare: 1, minLightShare: 0
  }), []);
});

test('evaluateMetrics — invalid severity throws TypeError', () => {
  assert.throws(() => evaluateMetrics(baseMetrics, { maxEmptyCells: { value: 1, severity: 'info' } }), /severity/);
});

test('evaluateMetrics — alignment.score null skips minAlignment (never a failure)', () => {
  const m = structuredClone(baseMetrics);
  m.alignment = { vertical: null, horizontal: null, score: null };
  const findings = evaluateMetrics(m, { minAlignment: 0.9 });
  assert.equal(findings.length, 0);
  assert.equal(judgeMetrics({ metrics: m, thresholds: { minAlignment: 0.9 } }).verdict, 'pass');
});

const assertInvalidMetricsPayload = (fn) => assert.throws(
  fn,
  (err) => err instanceof TypeError && err.message.startsWith('invalid metrics payload')
);

test('judgeMetrics — malformed metrics payload throws invalid metrics payload', () => {
  for (const bad of [{}, { occupancy: { cells: [] } }, null]) {
    assertInvalidMetricsPayload(() => judgeMetrics({ metrics: bad, thresholds: { maxEmptyCells: 1 } }));
  }
});

test('evaluateMetrics — malformed metrics payload throws invalid metrics payload (never a silent PASS)', () => {
  for (const bad of [{}, { occupancy: { cells: [] } }, null]) {
    assertInvalidMetricsPayload(() => evaluateMetrics(bad, {}));
    assertInvalidMetricsPayload(() => evaluateMetrics(bad, { maxEmptyCells: 99 }));
  }
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

test('validateVerdictRecord — requires schema_version 1, judged_by, known keys, ISO judged_at', () => {
  const rec = buildVerdictRecord({ mode: 'human', caseLabel: 'chat', verdict: 'pass', judgedBy: 'jirawat' });
  assert.equal(validateVerdictRecord(rec), rec);
  assert.throws(() => validateVerdictRecord({ ...rec, schema_version: 2 }), /schema_version/);
  const { schema_version: _v, ...noVersion } = rec;
  assert.throws(() => validateVerdictRecord(noVersion), /schema_version/);
  assert.throws(() => validateVerdictRecord({ ...rec, judged_by: '' }), /judged_by/);
  const { judged_by: _j, ...noJudge } = rec;
  assert.throws(() => validateVerdictRecord(noJudge), /judged_by/);
  assert.throws(() => validateVerdictRecord({ ...rec, extra_stuff: true }), /unknown key/);
  assert.throws(() => validateVerdictRecord({ ...rec, judged_at: '2026-08-08 00:00:00' }), /judged_at/);
  assert.throws(() => validateVerdictRecord({ ...rec, judged_at: 'Sat Aug 08 2026' }), /judged_at/);
});
