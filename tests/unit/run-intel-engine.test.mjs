import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openIntelStore, sqliteAvailable } from '../../lib/run-intel-store.mjs';
import { analyzeRunIntel, recordRunIntel } from '../../lib/run-intel-engine.mjs';

function tmpOut(prefix = 'run-intel-engine-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();
// Dynamic timestamps (relative to the real clock) keep the window logic under
// test instead of pinning fixed dates that would age out of the window.
const isoAt = (daysBack) => new Date(now - daysBack * DAY_MS).toISOString();

// 5-run history, newest first: R1..R5 covering every insight pattern:
// - recurring: maxEmptyCells in 4 runs; streak: maxEmptyCells (4) + tapTargetSize (2)
// - correlation: visual-diff pinned to pixel-7; resolved: suspectBackground (clean in R1,R2)
// - regression: case 'checkout' passes in R2 then fails in R1
const RUNS = [
  { id: 'R1', gate: 'fail', at: isoAt(1), findings: [
    { source: 'mobile-checks', rule: 'maxEmptyCells', severity: 'fail', case_key: 'home', device: null },
    { source: 'mobile-checks', rule: 'tapTargetSize', severity: 'warn', case_key: 'cart', device: null },
    { source: 'comparison', rule: 'visual-diff', severity: 'blocker', case_key: 'checkout', device: 'pixel-7' },
  ] },
  { id: 'R2', gate: 'fail', at: isoAt(2), findings: [
    { source: 'mobile-checks', rule: 'maxEmptyCells', severity: 'fail', case_key: 'home', device: null },
    { source: 'mobile-checks', rule: 'tapTargetSize', severity: 'warn', case_key: 'cart', device: null },
  ] },
  { id: 'R3', gate: 'fail', at: isoAt(3), findings: [
    { source: 'mobile-checks', rule: 'maxEmptyCells', severity: 'fail', case_key: 'home', device: null },
    { source: 'mobile-checks', rule: 'suspectBackground', severity: 'warn', case_key: 'gallery', device: null },
    { source: 'comparison', rule: 'visual-diff', severity: 'major', case_key: 'checkout', device: 'pixel-7' },
  ] },
  { id: 'R4', gate: 'fail', at: isoAt(4), findings: [
    { source: 'mobile-checks', rule: 'maxEmptyCells', severity: 'fail', case_key: 'home', device: null },
    { source: 'mobile-checks', rule: 'suspectBackground', severity: 'warn', case_key: 'gallery', device: null },
  ] },
  { id: 'R5', gate: 'pass', at: isoAt(5), findings: [
    { source: 'mobile-checks', rule: 'suspectBackground', severity: 'warn', case_key: 'gallery', device: null },
  ] },
];

async function seedHistory(store, outputDir) {
  for (const run of [...RUNS].reverse()) { // oldest first: chronological inserts
    await store.recordRun({
      run_id: run.id,
      output_dir: outputDir,
      gate_outcome: run.gate,
      score: run.gate === 'pass' ? 90 : 40,
      blockers: 1,
      cases_count: 3,
      created_at: run.at,
    });
    await store.recordFindings(run.findings.map((f) => ({
      run_id: run.id,
      output_dir: outputDir,
      source: f.source,
      rule: f.rule,
      severity: f.severity,
      case_key: f.case_key,
      device: f.device,
      detail_json: '{}',
      created_at: run.at,
    })));
  }
}

for (const [label, opts] of [['sqlite', {}], ['jsonl', { forceJsonl: true }]]) {
  test(`analyzeRunIntel: 5-run history yields all 5 insight families (${label} mode)`, async (t) => {
    if (label === 'sqlite' && !(await sqliteAvailable())) {
      t.skip('node:sqlite unavailable in this engine');
      return;
    }
    const dir = tmpOut();
    const store = await openIntelStore(dir, opts);
    await seedHistory(store, dir);

    const analysis = await analyzeRunIntel(dir, { windowDays: 30, store });
    assert.equal(analysis.totals.runsInWindow, 5);
    assert.equal(analysis.totals.findingsInWindow, 11);
    assert.equal(analysis.totals.dbMode, store.mode);

    // (1) recurring
    const byRule = new Map(analysis.recurring.map((r) => [r.rule, r]));
    assert.equal(byRule.get('maxEmptyCells').occurrences, 4);
    assert.equal(byRule.get('maxEmptyCells').lastSeenRunId, 'R1');
    assert.deepEqual(byRule.get('maxEmptyCells').sources, ['mobile-checks']);
    assert.deepEqual(byRule.get('maxEmptyCells').cases, { home: 4 });
    assert.equal(byRule.get('suspectBackground').occurrences, 3);
    assert.equal(byRule.get('visual-diff').occurrences, 2);
    assert.equal(byRule.get('tapTargetSize').occurrences, 2);
    assert.ok(analysis.recurring[0].occurrences >= analysis.recurring.at(-1).occurrences); // sorted desc
    assert.match(byRule.get('maxEmptyCells').insight, /rule 'maxEmptyCells' เกิด 4 ครั้งใน 5 รัน/);
    assert.match(byRule.get('maxEmptyCells').insight, /ล่าสุด run R1/);

    // (2) streaks (>= 2 consecutive from the newest run)
    assert.deepEqual(
      analysis.streaks.map((s) => [s.rule, s.consecutiveFailures]),
      [['maxEmptyCells', 4], ['tapTargetSize', 2]],
    );
    assert.ok(analysis.streaks.every((s) => s.lastRunId === 'R1'));

    // (3) correlations: visual-diff only ever appears on pixel-7
    assert.equal(analysis.correlations.length, 1);
    const corr = analysis.correlations[0];
    assert.equal(corr.rule, 'visual-diff');
    assert.equal(corr.device, 'pixel-7');
    assert.equal(corr.ruleCount, 2);
    assert.equal(corr.totalRunsByDevice, 2);
    assert.equal(corr.ratio, 1);
    assert.match(corr.note, /visual-diff/);
    assert.match(corr.note, /pixel-7/);

    // (4) resolved: suspectBackground last failed at R3, clean for R1+R2
    assert.equal(analysis.resolved.length, 1);
    assert.equal(analysis.resolved[0].rule, 'suspectBackground');
    assert.equal(analysis.resolved[0].lastFailureRunId, 'R3');
    assert.equal(analysis.resolved[0].resolvedAfterRuns, 2);
    assert.match(analysis.resolved[0].note, /R3/);

    // (5) regressions: checkout passed (no findings) in R2, failed in R1
    const checkout = analysis.regressions.find((r) => r.case_key === 'checkout');
    assert.deepEqual(checkout.fromPassedToFailedRunIds, ['R2', 'R1']);

    await store.close();
  });
}

test('analyzeRunIntel on an empty store returns empty insights without throwing', async () => {
  const dir = tmpOut();
  const analysis = await analyzeRunIntel(dir); // opens + closes its own store
  assert.deepEqual(analysis.recurring, []);
  assert.deepEqual(analysis.streaks, []);
  assert.deepEqual(analysis.correlations, []);
  assert.deepEqual(analysis.resolved, []);
  assert.deepEqual(analysis.regressions, []);
  assert.equal(analysis.totals.runsInWindow, 0);
  assert.equal(analysis.totals.findingsInWindow, 0);
});

function mobileFixture(outputDir) {
  const config = { outputDir, capture: { type: 'ios-sim' } };
  const sections = {
    mobileChecks: [{
      key: 'home',
      label: 'Home',
      verdict: 'fail',
      findings: [
        { rule: 'maxEmptyCells', severity: 'fail', expected: 2, observed: 9 },
        { rule: 'tapTargetSize', severity: 'warn', expected: 44, observed: 30 },
      ],
      judgmentPath: null,
    }],
    comparison: {
      ok: false,
      blockers: 1,
      majors: 0,
      comparisons: [
        { key: 'home__iphone-14__home', severity: 'blocker', reason: 'maxMismatchRatio', mismatchRatio: 0.12 },
        { key: 'cart__pixel-7__cart', severity: 'accepted' }, // not recorded
        { key: 'cart__pixel-7__cart2', severity: 'minor' }, // not recorded
      ],
    },
  };
  const summary = {
    provenance: { runId: 'test-run-1' },
    generatedAt: isoAt(0),
    automatedGatePassed: false,
    quality: { score: 42 },
    remediation: { blockers: 1 },
  };
  return { config, sections, summary };
}

test('recordRunIntel: records run + flattened findings, idempotent per runId', async () => {
  const dir = tmpOut();
  const { config, sections, summary } = mobileFixture(dir);

  const first = await recordRunIntel(config, sections, summary);
  assert.equal(first.recordedRuns, 1);
  assert.equal(first.recordedFindings, 3);
  assert.deepEqual(first.warnings, []);

  const second = await recordRunIntel(config, sections, summary); // exact re-run
  assert.equal(second.recordedRuns, 1); // run row upserts
  assert.equal(second.recordedFindings, 0); // findings skip-dup
  assert.deepEqual(second.warnings, []);

  const store = await openIntelStore(dir);
  const runs = await store.listRuns({ outputDir: dir });
  assert.equal(runs.length, 1);
  assert.equal(runs[0].run_id, 'test-run-1'); // id taken from summary.provenance.runId
  assert.equal(runs[0].gate_outcome, 'fail');
  assert.equal(runs[0].score, 42);
  assert.equal(runs[0].cases_count, 1);

  const rows = await store.queryFindings({ outputDir: dir, limit: 100000 });
  assert.equal(rows.length, 3); // no duplicates after the second call
  const diffRow = rows.find((r) => r.source === 'comparison');
  assert.equal(diffRow.rule, 'visual-diff');
  assert.equal(diffRow.severity, 'blocker');
  assert.equal(diffRow.case_key, 'home__iphone-14__home');
  assert.equal(diffRow.device, 'iphone-14'); // mobile run key middle segment
  assert.equal(JSON.parse(diffRow.detail_json).mismatchRatio, 0.12);
  const mobileRows = rows.filter((r) => r.source === 'mobile-checks');
  assert.equal(mobileRows.length, 2);
  assert.ok(mobileRows.every((r) => r.device === null && r.case_key === 'home'));
  assert.equal(JSON.parse(mobileRows.find((r) => r.rule === 'maxEmptyCells').detail_json).observed, 9);
  assert.ok(rows.every((r) => r.run_id === 'test-run-1'));
  await store.close();
});

test('recordRunIntel on web capture keeps comparison device null', async () => {
  const dir = tmpOut();
  const config = { outputDir: dir }; // no capture.type → playwright (web)
  const sections = {
    comparison: {
      ok: false,
      blockers: 1,
      majors: 0,
      comparisons: [{ key: 'home__desktop__default', severity: 'blocker', reason: 'maxMismatchRatio', mismatchRatio: 0.2 }],
    },
  };
  const summary = { provenance: { runId: 'web-run-1' }, automatedGatePassed: false };
  const result = await recordRunIntel(config, sections, summary);
  assert.equal(result.recordedFindings, 1);

  const store = await openIntelStore(dir);
  const rows = await store.queryFindings({ outputDir: dir });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].device, null); // web viewports are not devices
  assert.equal(rows[0].rule, 'visual-diff');
  await store.close();
});

test('recordRunIntel never throws on a failing store — warns and reports zeros', async () => {
  const dir = tmpOut();
  const { config, sections, summary } = mobileFixture(dir);
  const failingStore = {
    async recordRun() { throw new Error('disk gone'); },
    async recordFindings() { throw new Error('disk gone'); },
    async queryFindings() { throw new Error('disk gone'); },
    async listRuns() { throw new Error('disk gone'); },
    close() { throw new Error('disk gone'); },
  };
  const result = await recordRunIntel(config, sections, summary, { store: failingStore });
  assert.equal(result.recordedRuns, 0);
  assert.equal(result.recordedFindings, 0); // dedupe read failed → insert skipped, no dupes possible
  assert.ok(result.warnings.length >= 2);
  assert.match(result.warnings[0], /record run test-run-1 failed/);
  assert.match(result.warnings[1], /dedupe query.*skipped/);
});

test('recordRunIntel never throws with a corrupt intel.sqlite (jsonl fallback)', async (t) => {
  if (!(await sqliteAvailable())) {
    t.skip('node:sqlite unavailable in this engine');
    return;
  }
  const dir = tmpOut();
  const intelDir = path.join(dir, '.fx', 'intel');
  fs.mkdirSync(intelDir, { recursive: true });
  fs.writeFileSync(path.join(intelDir, 'intel.sqlite'), Buffer.from('garbage — not a database'));

  const { config, sections, summary } = mobileFixture(dir);
  const result = await recordRunIntel(config, sections, summary); // must not reject
  assert.equal(result.recordedRuns, 1);
  assert.equal(result.recordedFindings, 3);
  assert.deepEqual(result.warnings, []);

  // The corrupt db was quarantined during open, so the recorder's data lives
  // in the JSONL fallback (a fresh store would open a new empty sqlite — known
  // no-migration posture from Task 1). Analyze through the fallback to prove it.
  const store = await openIntelStore(dir, { forceJsonl: true });
  const analysis = await analyzeRunIntel(dir, { windowDays: 30, store });
  assert.equal(analysis.totals.dbMode, 'jsonl');
  assert.equal(analysis.totals.runsInWindow, 1);
  assert.equal(analysis.totals.findingsInWindow, 3);
  await store.close();
});
