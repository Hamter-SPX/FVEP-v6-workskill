import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReviewChain } from '../../lib/review-governance-engine.mjs';

function validChain() {
  return {
    taskId: 'task-1',
    brief: { id: 'brief-1', hash: 'brief-hash', requirements: ['implement idempotency guard'] },
    changePackage: {
      baseId: 'base-1', headId: 'head-1', diffHash: 'diff-hash', bounded: true,
      files: ['lib/worker.mjs', 'tests/worker.test.mjs']
    },
    implementer: { id: 'agent-implementer', reportHash: 'report-hash', testEvidenceIds: ['tdd-cycle-1'] },
    reviews: [
      {
        id: 'review-1', kind: 'task-review', round: 0, reviewerId: 'agent-reviewer',
        briefHash: 'brief-hash', diffHash: 'diff-hash', specVerdict: 'pass', qualityVerdict: 'pass', findings: []
      }
    ],
    findings: [],
    fixRounds: [],
    finalReview: {
      id: 'final-review-1', reviewerId: 'agent-final-reviewer', diffHash: 'diff-hash',
      verdict: 'pass', residualFindingIds: []
    }
  };
}

test('independent dual-verdict task review and final review pass', () => {
  const report = auditReviewChain(validChain());
  assert.equal(report.status, 'pass');
  assert.equal(report.independentReview, true);
  assert.equal(report.openBlockingFindings, 0);
});

test('implementer cannot approve their own task or final review', () => {
  const chain = validChain();
  chain.reviews[0].reviewerId = chain.implementer.id;
  chain.finalReview.reviewerId = chain.implementer.id;
  const report = auditReviewChain(chain);
  assert.ok(report.hardFailures.some((item) => item.code === 'SELF_REVIEW_FORBIDDEN'));
  assert.ok(report.hardFailures.some((item) => item.code === 'FINAL_REVIEW_NOT_INDEPENDENT'));
});

test('missing spec or quality verdict and unbounded diff fail', () => {
  const chain = validChain();
  chain.changePackage.bounded = false;
  chain.reviews[0].specVerdict = null;
  chain.reviews[0].qualityVerdict = null;
  const report = auditReviewChain(chain);
  assert.ok(report.hardFailures.some((item) => item.code === 'UNBOUNDED_CHANGE_PACKAGE'));
  assert.ok(report.hardFailures.some((item) => item.code === 'SPEC_VERDICT_MISSING'));
  assert.ok(report.hardFailures.some((item) => item.code === 'QUALITY_VERDICT_MISSING'));
});

test('open critical or important finding blocks task completion', () => {
  const chain = validChain();
  chain.reviews[0].specVerdict = 'fail';
  chain.reviews[0].findings = ['f1'];
  chain.findings = [{ id: 'f1', severity: 'important', loadBearing: true, status: 'open', message: 'missing authorization check' }];
  const report = auditReviewChain(chain);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'OPEN_BLOCKING_REVIEW_FINDING'));
});

test('fix loop is capped at five rounds and each round needs scoped re-review', () => {
  const chain = validChain();
  chain.fixRounds = Array.from({ length: 6 }, (_, index) => ({
    round: index + 1,
    implementerId: index < 3 ? 'agent-implementer' : 'agent-escalated',
    baseId: `base-${index + 1}`,
    headId: `head-${index + 1}`,
    testEvidenceIds: [`test-${index + 1}`],
    reReviewId: index < 5 ? `re-${index + 1}` : null
  }));
  chain.reviews.push(...chain.fixRounds.slice(0, 5).map((round) => ({
    id: round.reReviewId,
    kind: 're-review', round: round.round, reviewerId: 'agent-reviewer',
    briefHash: 'brief-hash', diffHash: `diff-${round.round}`, specVerdict: 'pass', qualityVerdict: 'pass', findings: []
  })));
  const report = auditReviewChain(chain);
  assert.ok(report.hardFailures.some((item) => item.code === 'FIX_LOOP_LIMIT_EXCEEDED'));
  assert.ok(report.hardFailures.some((item) => item.code === 'FIX_ROUND_REVIEW_MISSING'));
});

test('finding cannot be parked before breaker unless a human resolves a plan conflict', () => {
  const chain = validChain();
  chain.findings = [{
    id: 'f1', severity: 'important', loadBearing: false, status: 'parked',
    parkedAtRound: 2, ruling: 'leave it', planConflict: false
  }];
  const report = auditReviewChain(chain);
  assert.ok(report.hardFailures.some((item) => item.code === 'PREMATURE_FINDING_ADJUDICATION'));

  chain.findings[0].planConflict = true;
  chain.findings[0].humanDecision = { actor: 'owner', decision: 'plan-governs', at: '2026-07-27T10:00:00.000Z' };
  const allowed = auditReviewChain(chain);
  assert.ok(!allowed.hardFailures.some((item) => item.code === 'PREMATURE_FINDING_ADJUDICATION'));
});
