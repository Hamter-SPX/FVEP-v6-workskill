import path from 'node:path';
import { finalizeProcessAudit, nonEmpty, processFinding } from './process-audit-utils.mjs';

function samePath(left, right) {
  if (!left || !right) return false;
  return path.resolve(String(left)) === path.resolve(String(right));
}

function ownedWorktree(topLevel) {
  if (!topLevel) return false;
  const segments = path.resolve(String(topLevel)).split(path.sep);
  return segments.includes('.worktrees') || segments.includes('worktrees');
}

export function classifyWorkspace(snapshot = {}, policy = {}) {
  const findings = [];
  const protectedBranches = new Set((policy.protectedBranches ?? ['main', 'master']).map(String));
  let mode = 'unknown';
  let cleanupOwned = false;
  let creationAllowed = true;

  if (snapshot.isGitRepo !== true) {
    mode = snapshot.isolatedCopy === true ? 'isolated-copy' : 'non-git';
    findings.push(processFinding('NON_GIT_ISOLATION', snapshot.isolatedCopy === true ? 'low' : 'high', snapshot.isolatedCopy === true ? 'Work is isolated by copy, not by git worktree.' : 'Directory is not a git repository and isolation cannot be proven.'));
  } else if (nonEmpty(snapshot.superprojectWorkingTree)) {
    mode = 'submodule';
  } else if (snapshot.gitDir && snapshot.gitCommonDir && !samePath(snapshot.gitDir, snapshot.gitCommonDir)) {
    mode = snapshot.detached === true || !nonEmpty(snapshot.branch) ? 'linked-worktree-detached' : 'linked-worktree';
    cleanupOwned = ownedWorktree(snapshot.topLevel);
  } else {
    mode = snapshot.detached === true || !nonEmpty(snapshot.branch) ? 'normal-repo-detached' : 'normal-repo';
  }

  const branch = String(snapshot.branch ?? '');
  if (snapshot.isGitRepo === true && protectedBranches.has(branch) && policy.allowProtectedBranchImplementation !== true) {
    findings.push(processFinding('PROTECTED_BRANCH_IMPLEMENTATION', 'blocker', `Implementation on protected branch ${branch} is not authorized.`, { remediation: 'Create or enter an isolated feature worktree.' }));
  }

  if (snapshot.requestedWorktreePath && ownedWorktree(snapshot.requestedWorktreePath) && snapshot.worktreeContainerIgnored !== true) {
    creationAllowed = false;
    findings.push(processFinding('WORKTREE_CONTAINER_NOT_IGNORED', 'blocker', 'Project-local worktree container is not confirmed ignored.', { path: snapshot.requestedWorktreePath, remediation: 'Add the container to .gitignore and verify with git check-ignore before creation.' }));
  }

  if (mode.includes('detached')) findings.push(processFinding('DETACHED_HEAD', 'medium', 'Workspace is detached; integration requires creating a named branch.'));
  if (mode === 'linked-worktree' && !cleanupOwned) findings.push(processFinding('HOST_OWNED_WORKTREE', 'low', 'Linked worktree is outside project-owned worktree containers and must not be removed automatically.'));

  const report = finalizeProcessAudit(findings, { evidenceCount: Object.keys(snapshot).length });
  const implementationAllowed = report.hardFailures.length === 0 && (snapshot.isGitRepo === true || snapshot.isolatedCopy === true);
  return {
    ...report,
    mode,
    branch: branch || null,
    implementationAllowed,
    creationAllowed: creationAllowed && !report.hardFailures.some((item) => item.code === 'WORKTREE_CONTAINER_NOT_IGNORED'),
    cleanupOwned,
    cleanupAllowed: cleanupOwned && report.hardFailures.length === 0,
    destructiveActionsRequireExplicitConfirmation: true
  };
}
