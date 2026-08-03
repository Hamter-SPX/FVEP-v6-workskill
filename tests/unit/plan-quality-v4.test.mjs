import test from 'node:test';
import assert from 'node:assert/strict';
import { auditImplementationPlan } from '../../lib/plan-quality-engine.mjs';

function task(id, dependsOn = [], produces = [], consumes = []) {
  return {
    id,
    title: `Task ${id}`,
    dependsOn,
    files: { create: [`lib/${id}.mjs`], modify: [], test: [`tests/${id}.test.mjs`] },
    interfaces: { produces, consumes },
    steps: [
      { kind: 'write-failing-test', detail: `Write failing test for ${id}.` },
      { kind: 'verify-red', command: `node --test tests/${id}.test.mjs`, expected: 'FAIL because the behavior is missing' },
      { kind: 'implement', detail: `Implement ${id} minimally.` },
      { kind: 'verify-green', command: `node --test tests/${id}.test.mjs`, expected: 'PASS with zero failures' },
      { kind: 'commit', command: `git add lib/${id}.mjs tests/${id}.test.mjs && git commit -m "feat: ${id}"`, expected: 'Commit created' }
    ]
  };
}

function validPlan() {
  return {
    id: 'plan-v4',
    goal: 'Build a deterministic process kernel.',
    architecture: 'Pure engines with thin CLI adapters.',
    techStack: ['Node.js 20', 'node:test'],
    globalConstraints: ['No production code before RED evidence.'],
    tasks: [
      task('router', [], ['routeProcessSkills(context)'], []),
      task('orchestrator', ['router'], ['runProcessAudit(config)'], ['routeProcessSkills(context)'])
    ]
  };
}

test('complete plan with resolved interfaces passes', () => {
  const report = auditImplementationPlan(validPlan());
  assert.equal(report.status, 'pass');
  assert.equal(report.hardFailures.length, 0);
  assert.deepEqual(report.executionOrder, ['router', 'orchestrator']);
});

test('dependency cycles and unknown dependencies block execution', () => {
  const plan = validPlan();
  plan.tasks[0].dependsOn = ['orchestrator'];
  plan.tasks.push(task('release', ['missing'], [], []));
  const report = auditImplementationPlan(plan);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'DEPENDENCY_CYCLE'));
  assert.ok(report.hardFailures.some((item) => item.code === 'UNKNOWN_DEPENDENCY'));
});

test('undefined consumed interfaces and vague steps fail', () => {
  const plan = validPlan();
  plan.tasks[1].interfaces.consumes.push('missingInterface()');
  plan.tasks[1].steps[2].detail = 'Add appropriate error handling later';
  const report = auditImplementationPlan(plan);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'UNRESOLVED_INTERFACE'));
  assert.ok(report.hardFailures.some((item) => item.code === 'VAGUE_OR_PLACEHOLDER_STEP'));
});

test('missing RED or GREEN verification blocks a task', () => {
  const plan = validPlan();
  plan.tasks[0].steps = plan.tasks[0].steps.filter((step) => !['verify-red', 'verify-green'].includes(step.kind));
  const report = auditImplementationPlan(plan);
  assert.ok(report.hardFailures.some((item) => item.code === 'MISSING_REQUIRED_STEP'));
});
