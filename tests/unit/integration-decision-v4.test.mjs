import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareIntegrationDecision } from '../../lib/integration-decision-engine.mjs';

function context() {
  return {
    workspace: { mode: 'linked-worktree', branch: 'feature/v4', topLevel: '/repo/.worktrees/v4', cleanupOwned: true, detached: false },
    baseBranch: 'main',
    verification: { fullSuitePass: true, mergedResultPass: null, fresh: true, artifactHash: 'build-a' },
    commitInventory: ['abc123 feat: v4'],
    remote: { configured: true }
  };
}

test('no decision returns options without silently choosing', () => {
  const report = prepareIntegrationDecision(context());
  assert.equal(report.status, 'decision-required');
  assert.equal(report.selectedOption, null);
  assert.deepEqual(report.allowedOptions, ['merge-local', 'push-pr', 'keep-as-is']);
});

test('merge requires explicit actor decision and fresh full-suite evidence', () => {
  const input = context();
  input.decision = { option: 'merge-local', actor: 'owner', at: '2026-07-27T12:00:00.000Z' };
  const report = prepareIntegrationDecision(input);
  assert.equal(report.status, 'ready');
  assert.equal(report.selectedOption, 'merge-local');

  input.verification.fresh = false;
  const stale = prepareIntegrationDecision(input);
  assert.ok(stale.hardFailures.some((item) => item.code === 'INTEGRATION_VERIFICATION_STALE'));
});

test('cleanup is forbidden for host-owned worktree', () => {
  const input = context();
  input.workspace.cleanupOwned = false;
  input.decision = { option: 'merge-local', actor: 'owner', at: '2026-07-27T12:00:00.000Z', cleanupRequested: true };
  const report = prepareIntegrationDecision(input);
  assert.ok(report.hardFailures.some((item) => item.code === 'WORKSPACE_CLEANUP_NOT_OWNED'));
});

test('discard requires exact token and complete destructive inventory', () => {
  const input = context();
  input.decision = { option: 'discard', actor: 'owner', at: '2026-07-27T12:00:00.000Z', confirmation: 'yes' };
  const denied = prepareIntegrationDecision(input);
  assert.ok(denied.hardFailures.some((item) => item.code === 'DISCARD_CONFIRMATION_INVALID'));

  input.decision.confirmation = 'discard';
  const allowed = prepareIntegrationDecision(input);
  assert.equal(allowed.status, 'ready');
  assert.equal(allowed.selectedOption, 'discard');
});

test('detached workspace cannot offer local merge', () => {
  const input = context();
  input.workspace.mode = 'linked-worktree-detached';
  input.workspace.branch = '';
  const report = prepareIntegrationDecision(input);
  assert.deepEqual(report.allowedOptions, ['push-pr', 'keep-as-is']);
});
