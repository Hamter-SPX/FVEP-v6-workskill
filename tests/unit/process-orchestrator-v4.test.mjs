import test from 'node:test';
import assert from 'node:assert/strict';
import { createLedgerEvent } from '../../lib/process-ledger-engine.mjs';
import { runProcessAudit } from '../../lib/process-orchestrator.mjs';

function ledger() {
  const first = createLedgerEvent({ sequence: 1, type: 'initialize', actor: 'controller', at: '2026-07-27T10:00:00.000Z', previousHash: null, data: { planId: 'plan-1', state: 'requested' } });
  return [first];
}

function input() {
  return {
    request: { kind: 'feature', creative: true, multiStep: true, hasApprovedDesign: true, hasImplementationPlan: true, subagentsAvailable: false, needsIsolation: true, stage: 'implementation' },
    design: {
      id: 'design-1', context: { explored: true, artifacts: ['repo-map.json'], scope: 'single-system' },
      clarification: { questions: ['rollback?'], assumptions: [] },
      approaches: [{ id: 'a', summary: 'extend', tradeoffs: ['low risk'] }, { id: 'b', summary: 'replace', tradeoffs: ['higher cost'] }],
      recommendation: { approachId: 'a', rationale: 'preserves contracts' },
      design: { architecture: 'extend', components: ['a'], dataFlow: ['a -> b'], errorHandling: ['recover'], testing: ['unit'] },
      approval: { status: 'approved', actor: 'owner', at: '2026-07-27T09:00:00.000Z' },
      selfReview: { placeholderScan: 'pass', consistency: 'pass', scope: 'pass', ambiguity: 'pass' }
    },
    plan: {
      id: 'plan-1', goal: 'add process', architecture: 'pure engine', techStack: ['Node'], globalConstraints: ['TDD'],
      tasks: [{
        id: 't1', dependsOn: [], files: { create: ['lib/x.mjs'], modify: [], test: ['tests/x.test.mjs'] },
        interfaces: { produces: [], consumes: [] },
        steps: [
          { kind: 'write-failing-test', detail: 'write behavior test' },
          { kind: 'verify-red', command: 'node --test tests/x.test.mjs', expected: 'FAIL because behavior is missing' },
          { kind: 'implement', detail: 'implement behavior minimally' },
          { kind: 'verify-green', command: 'node --test tests/x.test.mjs', expected: 'PASS with zero failures' },
          { kind: 'commit', command: 'git commit -am feat', expected: 'commit created' }
        ]
      }]
    },
    workspace: { isGitRepo: true, gitDir: '/repo/.git/worktrees/x', gitCommonDir: '/repo/.git', branch: 'feature/x', topLevel: '/repo/.worktrees/x', worktreeContainerIgnored: true },
    ledger: ledger(),
    tdd: [{
      id: 'cycle-1', behaviorId: 'b1', requirementRef: 'spec#b1', risk: 'normal', test: { file: 'tests/x.test.mjs', name: 'works' },
      red: { command: 'node --test tests/x.test.mjs', exitStatus: 1, failureKind: 'behavior-missing', expectedFailureSignature: 'missing', observedFailureSignature: 'behavior missing', outputHash: 'r', testHash: 't', productionHash: 'p1', at: '2026-07-27T10:00:00.000Z' },
      production: { changeId: 'c1', productionHash: 'p2', at: '2026-07-27T10:01:00.000Z' },
      green: { command: 'node --test tests/x.test.mjs', exitStatus: 0, passCount: 1, outputHash: 'g', testHash: 't', productionHash: 'p2', at: '2026-07-27T10:02:00.000Z' },
      refactor: { changed: false }
    }],
    review: {
      taskId: 't1', brief: { hash: 'brief' }, changePackage: { baseId: 'a', headId: 'b', diffHash: 'diff', bounded: true, files: ['lib/x.mjs'] },
      implementer: { id: 'impl', reportHash: 'report', testEvidenceIds: ['cycle-1'] },
      reviews: [{ id: 'r1', kind: 'task-review', round: 0, reviewerId: 'reviewer', briefHash: 'brief', diffHash: 'diff', specVerdict: 'pass', qualityVerdict: 'pass', findings: [] }],
      findings: [], fixRounds: [],
      finalReview: { id: 'fr', reviewerId: 'final', diffHash: 'diff', verdict: 'pass', residualFindingIds: [] }
    },
    claims: [{ id: 'claim-1', type: 'tests-pass', artifactHash: 'build-1', evidenceIds: ['ev-test'] }],
    evidence: [{ id: 'ev-test', type: 'test-run', generatedAt: '2026-07-27T11:50:00.000Z', artifactHash: 'build-1', status: 'pass', exitStatus: 0, failures: 0, scope: 'full-suite' }]
  };
}

test('orchestrator runs every required process section and emits next action', () => {
  const report = runProcessAudit(input(), { claims: { now: '2026-07-27T12:00:00.000Z' } });
  assert.equal(report.status, 'pass');
  assert.equal(report.processGate.releaseEligible, true);
  assert.ok(report.sections.taskGraph);
  assert.ok(report.nextActions.includes('request-integration-decision'));
});

test('ledger can drive resumable state without conversation history', () => {
  const data = input();
  const report = runProcessAudit(data, { claims: { now: '2026-07-27T12:00:00.000Z' } });
  assert.equal(report.recovery.planId, 'plan-1');
  assert.equal(report.recovery.state, 'requested');
  assert.equal(report.recovery.recoverable, true);
});

test('orchestrator accepts schema-friendly wrapper objects from process contract files', () => {
  const data = input();
  data.ledger = { events: data.ledger };
  data.tdd = { cycles: data.tdd };
  data.claims = { claims: data.claims };
  data.evidence = { evidence: data.evidence };
  const report = runProcessAudit(data, { claims: { now: '2026-07-27T12:00:00.000Z' } });
  assert.equal(report.status, 'pass');
  assert.equal(report.recovery.recoverable, true);
});
