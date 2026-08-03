import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyWorkspace } from '../../lib/workspace-safety-engine.mjs';

test('linked worktree is detected separately from submodule', () => {
  const worktree = classifyWorkspace({
    isGitRepo: true,
    gitDir: '/repo/.git/worktrees/feature',
    gitCommonDir: '/repo/.git',
    superprojectWorkingTree: '',
    branch: 'feature/process',
    topLevel: '/repo/.worktrees/feature',
    worktreeContainerIgnored: true
  });
  assert.equal(worktree.mode, 'linked-worktree');
  assert.equal(worktree.implementationAllowed, true);
  assert.equal(worktree.cleanupOwned, true);

  const submodule = classifyWorkspace({
    isGitRepo: true,
    gitDir: '/repo/sub/.git',
    gitCommonDir: '/repo/.git/modules/sub',
    superprojectWorkingTree: '/repo',
    branch: 'feature/sub',
    topLevel: '/repo/sub'
  });
  assert.equal(submodule.mode, 'submodule');
});

test('implementation on protected branch fails closed without authorization', () => {
  const report = classifyWorkspace({
    isGitRepo: true,
    gitDir: '/repo/.git',
    gitCommonDir: '/repo/.git',
    branch: 'main',
    topLevel: '/repo'
  });
  assert.equal(report.status, 'fail');
  assert.equal(report.implementationAllowed, false);
  assert.ok(report.hardFailures.some((item) => item.code === 'PROTECTED_BRANCH_IMPLEMENTATION'));
});

test('non-git isolated copy is explicit and cannot claim worktree protection', () => {
  const report = classifyWorkspace({ isGitRepo: false, isolatedCopy: true, topLevel: '/tmp/copy' });
  assert.equal(report.mode, 'isolated-copy');
  assert.equal(report.implementationAllowed, true);
  assert.equal(report.cleanupOwned, false);
  assert.ok(report.warnings.some((item) => item.code === 'NON_GIT_ISOLATION'));
});

test('unignored project-local worktree container blocks creation', () => {
  const report = classifyWorkspace({
    isGitRepo: true,
    gitDir: '/repo/.git',
    gitCommonDir: '/repo/.git',
    branch: 'develop',
    topLevel: '/repo',
    requestedWorktreePath: '/repo/.worktrees/new-feature',
    worktreeContainerIgnored: false
  });
  assert.equal(report.creationAllowed, false);
  assert.ok(report.hardFailures.some((item) => item.code === 'WORKTREE_CONTAINER_NOT_IGNORED'));
});
