import test from 'node:test';
import assert from 'node:assert/strict';
import { routeProcessSkills } from '../../lib/skill-router-engine.mjs';

test('routes bugfix through debugging before TDD and verification', () => {
  const report = routeProcessSkills({
    kind: 'bugfix',
    hasUnexpectedBehavior: true,
    hasImplementationPlan: true,
    subagentsAvailable: false,
    needsIsolation: true,
    stage: 'implementation'
  });
  assert.equal(report.status, 'pass');
  assert.deepEqual(report.required.slice(0, 4), [
    'using-superpowers',
    'systematic-debugging',
    'writing-plans',
    'using-git-worktrees'
  ]);
  assert.ok(report.required.includes('test-driven-development'));
  assert.ok(report.required.indexOf('systematic-debugging') < report.required.indexOf('test-driven-development'));
  assert.ok(report.required.includes('verification-before-completion'));
});

test('routes creative feature through brainstorming and planning before execution', () => {
  const report = routeProcessSkills({
    kind: 'feature',
    creative: true,
    multiStep: true,
    hasApprovedDesign: false,
    stage: 'discovery'
  });
  assert.equal(report.status, 'blocked');
  assert.deepEqual(report.required.slice(0, 3), ['using-superpowers', 'brainstorming', 'writing-plans']);
  assert.ok(report.hardFailures.some((item) => item.code === 'DESIGN_APPROVAL_REQUIRED'));
});

test('routes independent domains to parallel analysis but never parallel implementation with shared files', () => {
  const report = routeProcessSkills({
    kind: 'feature',
    hasApprovedDesign: true,
    hasImplementationPlan: true,
    subagentsAvailable: true,
    independentDomains: 3,
    parallelImplementationHasSharedFiles: true,
    stage: 'implementation'
  });
  assert.ok(report.recommended.includes('dispatching-parallel-agents'));
  assert.ok(report.constraints.includes('parallel-analysis-only'));
  assert.ok(report.required.includes('subagent-driven-development'));
});

test('skill authoring requires writing-skills and TDD', () => {
  const report = routeProcessSkills({ kind: 'skill-authoring', stage: 'implementation', hasApprovedDesign: true, hasImplementationPlan: true });
  assert.ok(report.required.includes('writing-skills'));
  assert.ok(report.required.includes('test-driven-development'));
});
