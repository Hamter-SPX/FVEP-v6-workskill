import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDebugSession } from '../../lib/debug-session-engine.mjs';

function validSession() {
  return {
    id: 'incident-1',
    reproduction: {
      stable: true,
      steps: ['submit duplicate order'],
      expected: 'one order',
      observed: 'two orders',
      environmentHash: 'env-1',
      buildId: 'build-1'
    },
    evidence: [
      { id: 'e1', boundary: 'browser', observation: 'one request', confidence: 1 },
      { id: 'e2', boundary: 'api', observation: 'one mutation accepted', confidence: 1 },
      { id: 'e3', boundary: 'worker', observation: 'message processed twice', confidence: 1 }
    ],
    boundaries: [
      { id: 'browser', order: 1, status: 'pass', evidence: ['e1'] },
      { id: 'api', order: 2, status: 'pass', evidence: ['e2'] },
      { id: 'worker', order: 3, status: 'fail', evidence: ['e3'] },
      { id: 'database', order: 4, status: 'unknown', evidence: [] }
    ],
    hypotheses: [
      {
        id: 'h1',
        status: 'confirmed',
        statement: 'Worker lacks idempotency guard.',
        boundary: 'worker',
        supportingEvidence: ['e3'],
        contradictingEvidence: [],
        predictedObservation: 'same delivery id creates two writes',
        falsificationTest: 'replay the same delivery id against an isolated worker'
      }
    ],
    experiments: [
      { id: 'x1', hypothesisId: 'h1', variablesChanged: 1, result: 'prediction-observed', evidence: ['e3'] }
    ],
    fixAttempts: [
      {
        number: 1,
        hypothesisId: 'h1',
        rootCauseBoundary: 'worker',
        regressionRedVerified: true,
        changeId: 'commit-fix',
        targetedGreenVerified: true,
        originalReproductionPasses: true,
        affectedRegressionsPass: true,
        telemetryDistinguishesRecurrence: true
      }
    ]
  };
}

test('evidence-localized confirmed root cause and verified fix passes', () => {
  const report = auditDebugSession(validSession());
  assert.equal(report.status, 'pass');
  assert.equal(report.lastConfirmedGood, 'api');
  assert.equal(report.firstConfirmedBad, 'worker');
  assert.equal(report.nextAction, 'complete-verification');
});

test('multiple active hypotheses and bundled experiment variables fail', () => {
  const session = validSession();
  session.hypotheses = [
    { ...session.hypotheses[0], status: 'active' },
    { ...session.hypotheses[0], id: 'h2', status: 'active' }
  ];
  session.experiments[0].variablesChanged = 3;
  const report = auditDebugSession(session);
  assert.ok(report.hardFailures.some((item) => item.code === 'MULTIPLE_ACTIVE_HYPOTHESES'));
  assert.ok(report.hardFailures.some((item) => item.code === 'EXPERIMENT_NOT_MINIMAL'));
});

test('missing pass-to-fail boundary localization blocks a fix', () => {
  const session = validSession();
  session.boundaries = session.boundaries.map((boundary) => ({ ...boundary, status: 'unknown' }));
  const report = auditDebugSession(session);
  assert.ok(report.hardFailures.some((item) => item.code === 'FAILING_BOUNDARY_NOT_LOCALIZED'));
});

test('fix without regression RED or confirmed hypothesis is speculative', () => {
  const session = validSession();
  session.hypotheses[0].status = 'active';
  session.fixAttempts[0].regressionRedVerified = false;
  const report = auditDebugSession(session);
  assert.ok(report.hardFailures.some((item) => item.code === 'FIX_WITHOUT_CONFIRMED_HYPOTHESIS'));
  assert.ok(report.hardFailures.some((item) => item.code === 'REGRESSION_RED_MISSING'));
});

test('fourth failed fix attempt requires architecture escalation', () => {
  const session = validSession();
  session.fixAttempts = [1, 2, 3, 4].map((number) => ({
    ...session.fixAttempts[0],
    number,
    originalReproductionPasses: false,
    affectedRegressionsPass: false
  }));
  const report = auditDebugSession(session);
  assert.ok(report.hardFailures.some((item) => item.code === 'ARCHITECTURE_ESCALATION_REQUIRED'));

  session.architectureEscalation = { triggered: true, decision: 'move idempotency ownership to write boundary', approvedBy: 'system-owner' };
  const escalated = auditDebugSession(session);
  assert.ok(!escalated.hardFailures.some((item) => item.code === 'ARCHITECTURE_ESCALATION_REQUIRED'));
});
