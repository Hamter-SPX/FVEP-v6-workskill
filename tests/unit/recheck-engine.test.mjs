import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  UNIVERSAL_CHECKS,
  auditRecheckRecord,
  buildRecheckPlan,
  formatRecheckPlan,
  formatRecheckReport
} from '../../lib/recheck-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function completeRecord(overrides = {}) {
  return {
    mode: 'match-ref',
    artifactIdentity: ['artifacts/cur.png@sha256:2f1a', 'design/ref.png@sha256:9c04'],
    independentReviewer: false,
    claims: [
      { statement: 'The photo region now sits at the reference position', evidence: ['vision:triage round 4 output', 'layout-structure check exit 0'] },
      { statement: 'No other region moved', evidence: ['triage zone delta table'] }
    ],
    checks: [
      { id: 'identity', performed: true, observation: 'Re-captured cur.png after the last edit; hash changed from 8b21 to 2f1a' },
      { id: 'claim-binding', performed: true, observation: 'Both claims map to a triage run from this capture' },
      { id: 'counter-evidence', performed: true, observation: 'Checked whether the match came from a loosened tolerance; policy is unchanged' },
      { id: 'blind-spots', performed: true, observation: 'Only the default breakpoint was compared' },
      { id: 'language', performed: true, observation: 'Replaced "pixel-perfect" with the measured delta' }
    ],
    counterExamples: [
      { claim: 'The photo region matches', attemptedFalsification: 'Re-ran triage with a tighter tolerance', result: 'Still matched' },
      { claim: 'No other region moved', attemptedFalsification: 'Inspected the four largest zone deltas', result: 'All below tolerance' },
      { claim: 'The capture is current', attemptedFalsification: 'Compared file mtime against the last edit', result: 'Capture is newer' }
    ],
    blindSpots: ['Mobile breakpoint was never captured', 'Dark theme was not compared'],
    issuesFound: [{ summary: 'Caption baseline was 2px low', resolved: true }],
    residualRisk: 'Only the desktop breakpoint is proven; mobile is unverified',
    whatWouldChangeMyMind: 'A triage run at the mobile breakpoint returning a structure finding',
    verdict: 'issues-fixed',
    ...overrides
  };
}

test('the universal checks cover evidence, claims, adversarial work, coverage, and honesty', () => {
  const categories = new Set(UNIVERSAL_CHECKS.map((check) => check.category));
  for (const expected of ['evidence', 'claims', 'adversarial', 'coverage', 'honesty']) {
    assert.ok(categories.has(expected), `missing category ${expected}`);
  }
});

test('the plan combines universal checks, mode checks, and fresh re-runs', () => {
  const plan = buildRecheckPlan({ mode: 'design-game' });
  const categories = plan.checks.map((check) => check.category);
  assert.ok(categories.includes('mode'));
  assert.ok(categories.includes('fresh-verification'));
  assert.ok(plan.checks.some((check) => check.command?.includes('audit:scene')));
  assert.equal(plan.mode, 'design-game');
  assert.match(formatRecheckPlan(plan), /RE-CHECK PLAN — design-game/);
});

test('self-review demands more falsification attempts than independent review', () => {
  assert.equal(buildRecheckPlan({ mode: 'implement' }).minCounterExamples, 3);
  assert.equal(buildRecheckPlan({ mode: 'implement', independentReviewer: true }).minCounterExamples, 2);
});

test('quick depth trims the plan but keeps identity and honesty', () => {
  const plan = buildRecheckPlan({ mode: 'analyze', depth: 'quick' });
  const ids = plan.checks.map((check) => check.id);
  assert.ok(ids.includes('identity'));
  assert.ok(ids.includes('language'));
  assert.ok(!ids.some((id) => id.startsWith('rerun:')));
});

test('a complete record passes the audit', () => {
  const result = auditRecheckRecord(completeRecord());
  assert.equal(result.ok, true, result.findings.map((f) => `${f.code}: ${f.message}`).join('; '));
  assert.equal(result.counts.boundClaims, 2);
  assert.match(formatRecheckReport(result), /RE-CHECK AUDIT/);
});

test('an unbound claim is a blocker', () => {
  const record = completeRecord();
  record.claims.push({ statement: 'Performance is unaffected', evidence: [] });
  const result = auditRecheckRecord(record);
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((finding) => finding.code === 'RECHECK_CLAIM_UNBOUND'));
});

test('absolute language and impressions are caught', () => {
  const overstated = auditRecheckRecord(completeRecord({
    claims: [{ statement: 'The layout is pixel-perfect and production-ready', evidence: ['one screenshot'] }]
  }));
  assert.ok(overstated.findings.some((finding) => finding.code === 'RECHECK_CLAIM_OVERSTATED'));

  const impression = auditRecheckRecord(completeRecord({
    claims: [{ statement: 'It looks fine now', evidence: ['a', 'b'] }]
  }));
  assert.ok(impression.findings.some((finding) => finding.code === 'RECHECK_CLAIM_IMPRESSION'));
});

test('a check marked performed without an observation is a blocker', () => {
  const record = completeRecord();
  record.checks.push({ id: 'regression', performed: true });
  const result = auditRecheckRecord(record);
  assert.ok(result.findings.some((finding) => finding.code === 'RECHECK_CHECK_WITHOUT_OBSERVATION'));
});

test('a shallow re-check without falsification cannot pass', () => {
  const result = auditRecheckRecord({
    mode: 'implement',
    artifactIdentity: ['src/app.ts@sha256:11'],
    claims: [{ statement: 'The feature works', evidence: ['npm test'] }],
    checks: [{ id: 'identity', performed: true, observation: 'read the file' }],
    counterExamples: [],
    blindSpots: [],
    verdict: 'clean'
  });
  const codes = result.findings.map((finding) => finding.code);
  assert.equal(result.ok, false);
  assert.equal(result.verdict, 'recheck-insufficient');
  assert.ok(codes.includes('RECHECK_TOO_SHALLOW'));
  assert.ok(codes.includes('RECHECK_NO_ADVERSARIAL_PASS'));
  assert.ok(codes.includes('RECHECK_CLEAN_WITHOUT_SEARCH'));
  assert.ok(codes.includes('RECHECK_BLIND_SPOTS_MISSING'));
});

test('a clean verdict with open issues is rejected', () => {
  const result = auditRecheckRecord(completeRecord({
    verdict: 'clean',
    issuesFound: [{ summary: 'Focus ring missing on the primary button', resolved: false }]
  }));
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes('RECHECK_CLEAN_WITH_OPEN_ISSUES'));
  assert.ok(codes.includes('RECHECK_ISSUES_UNRESOLVED'));
});

test('self-review without a disconfirming observation is flagged', () => {
  const result = auditRecheckRecord(completeRecord({ whatWouldChangeMyMind: '' }));
  assert.ok(result.findings.some((finding) => finding.code === 'RECHECK_SELF_REVIEW_WITHOUT_DISCONFIRMER'));
});

test('missing artifact identity blocks the audit', () => {
  const result = auditRecheckRecord(completeRecord({ artifactIdentity: [] }));
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((finding) => finding.code === 'RECHECK_ARTIFACT_IDENTITY_MISSING'));
});

test('the shipped example record passes and the CLI reports it', async () => {
  const recordPath = path.join(root, 'examples/recheck.example.json');
  const record = JSON.parse(await fs.readFile(recordPath, 'utf8'));
  const result = auditRecheckRecord(record, record.policy ?? {});
  assert.equal(result.ok, true, result.findings.map((f) => `${f.code}: ${f.message}`).join('; '));

  const script = path.join(root, 'scripts/recheck.mjs');
  const plan = spawnSync(process.execPath, [script, 'plan', '--mode', 'ship'], { encoding: 'utf8' });
  assert.equal(plan.status ?? 0, 0, plan.stderr);
  assert.match(plan.stdout, /RE-CHECK PLAN — ship/);

  const audit = spawnSync(process.execPath, [script, 'audit', '--record', recordPath], { encoding: 'utf8' });
  assert.equal(audit.status ?? 0, 0, audit.stdout + audit.stderr);
  assert.match(audit.stdout, /recheck-passed/);
});
