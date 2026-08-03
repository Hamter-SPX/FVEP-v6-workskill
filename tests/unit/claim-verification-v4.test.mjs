import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCompletionClaims } from '../../lib/claim-verification-engine.mjs';

const now = '2026-07-27T12:00:00.000Z';

function evidence() {
  return [
    { id: 'tests-1', type: 'test-run', generatedAt: '2026-07-27T11:50:00.000Z', artifactHash: 'build-a', status: 'pass', exitStatus: 0, failures: 0, scope: 'full-suite' },
    { id: 'build-1', type: 'build-run', generatedAt: '2026-07-27T11:51:00.000Z', artifactHash: 'build-a', status: 'pass', exitStatus: 0, scope: 'production' },
    { id: 'visual-1', type: 'visual-review', generatedAt: '2026-07-27T11:52:00.000Z', artifactHash: 'build-a', status: 'pass', blockers: 0, coverage: 100, currentRender: true },
    { id: 'security-1', type: 'security-audit', generatedAt: '2026-07-27T11:53:00.000Z', artifactHash: 'build-a', status: 'pass', hardFailures: 0 },
    { id: 'threat-1', type: 'threat-model', generatedAt: '2026-07-27T11:54:00.000Z', artifactHash: 'build-a', status: 'pass' },
    { id: 'process-1', type: 'process-gate', generatedAt: '2026-07-27T11:55:00.000Z', artifactHash: 'build-a', status: 'pass', hardFailures: 0 },
    { id: 'release-1', type: 'fullstack-gate', generatedAt: '2026-07-27T11:56:00.000Z', artifactHash: 'build-a', status: 'pass', hardFailures: 0 },
    { id: 'review-1', type: 'final-review', generatedAt: '2026-07-27T11:57:00.000Z', artifactHash: 'build-a', status: 'pass' },
    { id: 'rollback-1', type: 'rollback-proof', generatedAt: '2026-07-27T11:58:00.000Z', artifactHash: 'build-a', status: 'pass' }
  ];
}

test('fresh test and build claims bound to current artifact pass', () => {
  const report = auditCompletionClaims([
    { id: 'c1', type: 'tests-pass', artifactHash: 'build-a', evidenceIds: ['tests-1'] },
    { id: 'c2', type: 'build-passes', artifactHash: 'build-a', evidenceIds: ['build-1'] }
  ], evidence(), { now });
  assert.equal(report.status, 'pass');
  assert.equal(report.verifiedClaims, 2);
});

test('stale or mismatched evidence cannot support a claim', () => {
  const items = evidence();
  items[0].generatedAt = '2026-07-20T10:00:00.000Z';
  const report = auditCompletionClaims([
    { id: 'c1', type: 'tests-pass', artifactHash: 'build-b', evidenceIds: ['tests-1'] }
  ], items, { now, maxAgeHours: 24 });
  assert.ok(report.hardFailures.some((item) => item.code === 'CLAIM_EVIDENCE_STALE'));
  assert.ok(report.hardFailures.some((item) => item.code === 'CLAIM_ARTIFACT_MISMATCH'));
});

test('visual match requires current render, full coverage, and no blockers', () => {
  const items = evidence();
  items.find((item) => item.id === 'visual-1').coverage = 50;
  const report = auditCompletionClaims([
    { id: 'c1', type: 'visual-match', artifactHash: 'build-a', evidenceIds: ['visual-1'] }
  ], items, { now });
  assert.ok(report.hardFailures.some((item) => item.code === 'VISUAL_CLAIM_UNSUPPORTED'));
});

test('absolute secure claim is rejected while security-gates-pass can be proven', () => {
  const absolute = auditCompletionClaims([
    { id: 'c1', type: 'secure', artifactHash: 'build-a', evidenceIds: ['security-1', 'threat-1'] }
  ], evidence(), { now });
  assert.ok(absolute.hardFailures.some((item) => item.code === 'ABSOLUTE_SECURITY_CLAIM_UNSUPPORTED'));

  const bounded = auditCompletionClaims([
    { id: 'c2', type: 'security-gates-pass', artifactHash: 'build-a', evidenceIds: ['security-1', 'threat-1'] }
  ], evidence(), { now });
  assert.equal(bounded.status, 'pass');
});

test('production-ready requires full technical process review and rollback evidence', () => {
  const complete = auditCompletionClaims([
    { id: 'c1', type: 'production-ready', artifactHash: 'build-a', evidenceIds: ['tests-1', 'build-1', 'process-1', 'release-1', 'review-1', 'rollback-1'] }
  ], evidence(), { now });
  assert.equal(complete.status, 'pass');

  const incomplete = auditCompletionClaims([
    { id: 'c2', type: 'production-ready', artifactHash: 'build-a', evidenceIds: ['tests-1', 'build-1'] }
  ], evidence(), { now });
  assert.ok(incomplete.hardFailures.some((item) => item.code === 'PRODUCTION_READY_EVIDENCE_INCOMPLETE'));
});
