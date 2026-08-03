import test from 'node:test';
import assert from 'node:assert/strict';
import { auditTddCycles } from '../../lib/tdd-evidence-engine.mjs';

function validCycle(overrides = {}) {
  return {
    id: 'cycle-1',
    behaviorId: 'reject-empty-email',
    requirementRef: 'spec#email-validation',
    risk: 'normal',
    test: { file: 'tests/email.test.mjs', name: 'rejects empty email' },
    red: {
      command: 'node --test tests/email.test.mjs',
      exitStatus: 1,
      failureKind: 'behavior-missing',
      expectedFailureSignature: 'Email required',
      observedFailureSignature: 'expected Email required, received undefined',
      outputHash: 'red-output',
      testHash: 'test-v1',
      productionHash: 'prod-v1',
      at: '2026-07-27T10:00:00.000Z'
    },
    production: { changeId: 'commit-abc', productionHash: 'prod-v2', at: '2026-07-27T10:01:00.000Z' },
    green: {
      command: 'node --test tests/email.test.mjs',
      exitStatus: 0,
      passCount: 1,
      outputHash: 'green-output',
      testHash: 'test-v1',
      productionHash: 'prod-v2',
      at: '2026-07-27T10:02:00.000Z'
    },
    refactor: { changed: false },
    ...overrides
  };
}

test('valid RED GREEN cycle passes and preserves behavior identity', () => {
  const report = auditTddCycles([validCycle()]);
  assert.equal(report.status, 'pass');
  assert.equal(report.acceptedCycles, 1);
  assert.equal(report.cycles[0].classification, 'test-first');
});

test('test-after evidence and timestamp inversion fail', () => {
  const cycle = validCycle();
  cycle.red.at = '2026-07-27T10:03:00.000Z';
  const report = auditTddCycles([cycle]);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'RED_NOT_BEFORE_IMPLEMENTATION'));
});

test('unrelated RED failures and unchanged production hashes do not count', () => {
  const cycle = validCycle();
  cycle.red.failureKind = 'dependency-error';
  cycle.production.productionHash = 'prod-v1';
  cycle.green.productionHash = 'prod-v1';
  const report = auditTddCycles([cycle]);
  assert.ok(report.hardFailures.some((item) => item.code === 'INVALID_RED_FAILURE_KIND'));
  assert.ok(report.hardFailures.some((item) => item.code === 'PRODUCTION_CHANGE_NOT_PROVEN'));
});

test('high-risk behavior requires a negative control or mutation check', () => {
  const report = auditTddCycles([validCycle({ risk: 'high' })]);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'NEGATIVE_CONTROL_REQUIRED'));

  const passed = auditTddCycles([validCycle({
    risk: 'high',
    negativeControl: { kind: 'revert-production-change', status: 'failed-as-expected', command: 'node --test tests/email.test.mjs', outputHash: 'negative-output' }
  })]);
  assert.equal(passed.status, 'pass');
});

test('refactor requires a fresh passing verification', () => {
  const cycle = validCycle({ refactor: { changed: true } });
  const report = auditTddCycles([cycle]);
  assert.ok(report.hardFailures.some((item) => item.code === 'REFACTOR_VERIFICATION_MISSING'));
});
