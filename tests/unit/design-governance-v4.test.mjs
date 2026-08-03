import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDesignGovernance } from '../../lib/design-governance-engine.mjs';

function validContract() {
  return {
    id: 'design-checkout-v1',
    context: { explored: true, artifacts: ['repo-map.json'], scope: 'single-system' },
    clarification: { questions: ['What is the rollback expectation?'], assumptions: [] },
    approaches: [
      { id: 'a', summary: 'Extend existing service', tradeoffs: ['lower migration cost'] },
      { id: 'b', summary: 'Create isolated service', tradeoffs: ['stronger isolation'] }
    ],
    recommendation: { approachId: 'a', rationale: 'Preserves current contracts and minimizes risk.' },
    design: {
      architecture: 'Extend the existing checkout boundary.',
      components: ['checkout-api', 'checkout-ui'],
      dataFlow: ['browser -> api -> database'],
      errorHandling: ['map conflict to recoverable UI'],
      testing: ['contract, integration, visual, rollback']
    },
    approval: { status: 'approved', actor: 'product-owner', at: '2026-07-27T10:00:00.000Z' },
    selfReview: { placeholderScan: 'pass', consistency: 'pass', scope: 'pass', ambiguity: 'pass' }
  };
}

test('complete design governance contract passes', () => {
  const report = auditDesignGovernance(validContract());
  assert.equal(report.status, 'pass');
  assert.equal(report.hardFailures.length, 0);
  assert.equal(report.score, 100);
});

test('missing alternatives and approval fail closed', () => {
  const contract = validContract();
  contract.approaches = [contract.approaches[0]];
  contract.approval = { status: 'pending' };
  const report = auditDesignGovernance(contract);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'INSUFFICIENT_APPROACHES'));
  assert.ok(report.hardFailures.some((item) => item.code === 'DESIGN_NOT_APPROVED'));
});

test('best-effort exception must be explicit and policy-authorized', () => {
  const contract = validContract();
  delete contract.approval;
  contract.bestEffortException = { reason: 'Emergency incident containment', scope: 'rollback-only', followUpRequired: true };
  const denied = auditDesignGovernance(contract);
  assert.equal(denied.status, 'fail');
  const allowed = auditDesignGovernance(contract, { allowBestEffortException: true });
  assert.equal(allowed.status, 'warning');
  assert.ok(allowed.warnings.some((item) => item.code === 'BEST_EFFORT_EXCEPTION_USED'));
});

test('self-review cannot pass with placeholders or ambiguous requirements', () => {
  const contract = validContract();
  contract.design.architecture = 'TBD later';
  contract.selfReview.ambiguity = 'fail';
  const report = auditDesignGovernance(contract);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'PLACEHOLDER_LANGUAGE'));
  assert.ok(report.hardFailures.some((item) => item.code === 'SELF_REVIEW_FAILED'));
});
