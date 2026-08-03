import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFeedbackDisposition } from '../../lib/feedback-adjudication-engine.mjs';

function validAccepted() {
  return {
    findingId: 'review-f1',
    source: 'external-reviewer',
    requirementRestatement: 'Ensure the resource-level authorization check runs before mutation.',
    verification: {
      status: 'supported',
      checkedFiles: ['lib/orders.mjs'],
      commands: ['node --test tests/orders.test.mjs'],
      evidenceIds: ['code-line-44', 'test-red-1']
    },
    disposition: 'accept',
    rationale: 'Current mutation path checks role but not resource ownership.',
    implementation: { changeId: 'commit-fix', testEvidenceIds: ['tdd-cycle-auth'], verified: true }
  };
}

test('verified supported feedback can be accepted and implemented', () => {
  const report = auditFeedbackDisposition(validAccepted());
  assert.equal(report.status, 'pass');
  assert.equal(report.disposition, 'accept');
});

test('blind acceptance without codebase verification fails', () => {
  const record = validAccepted();
  record.verification = { status: 'not-checked', checkedFiles: [], commands: [], evidenceIds: [] };
  const report = auditFeedbackDisposition(record);
  assert.ok(report.hardFailures.some((item) => item.code === 'FEEDBACK_NOT_VERIFIED'));
  assert.ok(report.hardFailures.some((item) => item.code === 'BLIND_FEEDBACK_ACCEPTANCE'));
});

test('rejection requires unsupported evidence and technical rationale', () => {
  const record = validAccepted();
  record.disposition = 'reject';
  record.verification.status = 'supported';
  record.rationale = '';
  delete record.implementation;
  const report = auditFeedbackDisposition(record);
  assert.ok(report.hardFailures.some((item) => item.code === 'UNSUPPORTED_REJECTION'));
  assert.ok(report.hardFailures.some((item) => item.code === 'FEEDBACK_RATIONALE_MISSING'));
});

test('unclear feedback cannot be partially implemented', () => {
  const record = validAccepted();
  record.verification.status = 'unclear';
  record.disposition = 'accept';
  const report = auditFeedbackDisposition(record);
  assert.ok(report.hardFailures.some((item) => item.code === 'UNCLEAR_FEEDBACK_ACTIONED'));
});

test('deferred finding requires owner due date and residual risk', () => {
  const record = validAccepted();
  record.disposition = 'defer';
  record.verification.status = 'supported';
  delete record.implementation;
  record.deferral = { owner: '', dueAt: '', residualRisk: '' };
  const report = auditFeedbackDisposition(record);
  assert.ok(report.hardFailures.some((item) => item.code === 'DEFERRAL_GOVERNANCE_MISSING'));
});
