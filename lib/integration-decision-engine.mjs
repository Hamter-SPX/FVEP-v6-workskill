import { finalizeProcessAudit, nonEmpty, processFinding } from './process-audit-utils.mjs';

function optionsFor(workspace = {}) {
  const detached = workspace.mode?.includes('detached') || !nonEmpty(workspace.branch);
  return detached ? ['push-pr', 'keep-as-is'] : ['merge-local', 'push-pr', 'keep-as-is'];
}

export function prepareIntegrationDecision(context = {}, policy = {}) {
  const findings = [];
  const workspace = context.workspace ?? {};
  const verification = context.verification ?? {};
  const allowedOptions = optionsFor(workspace);
  const decision = context.decision;

  if (!decision) {
    return {
      schemaVersion: 4,
      status: 'decision-required',
      ok: true,
      score: 100,
      evidenceCount: verification.fullSuitePass === true ? 1 : 0,
      evidenceConfidence: verification.fresh === true ? 100 : 0,
      findings: [], hardFailures: [], blockers: [], warnings: [],
      selectedOption: null,
      allowedOptions,
      cleanupAllowed: false,
      destructiveActionsRequireExactConfirmation: true
    };
  }

  const option = String(decision.option ?? '');
  if (!nonEmpty(decision.actor) || !nonEmpty(decision.at)) findings.push(processFinding('INTEGRATION_DECISION_IDENTITY_MISSING', 'blocker', 'Integration decision requires actor and timestamp.'));
  if (!allowedOptions.includes(option) && option !== 'discard') findings.push(processFinding('INTEGRATION_OPTION_NOT_ALLOWED', 'blocker', `Option ${option || '<missing>'} is not allowed for this workspace state.`));

  if (['merge-local', 'push-pr'].includes(option)) {
    if (verification.fullSuitePass !== true) findings.push(processFinding('INTEGRATION_TESTS_NOT_PASSING', 'blocker', 'Integration requires a passing full test suite.'));
    if (verification.fresh !== true || !nonEmpty(verification.artifactHash)) findings.push(processFinding('INTEGRATION_VERIFICATION_STALE', 'blocker', 'Integration requires fresh evidence bound to the current artifact.'));
  }

  if (option === 'merge-local') {
    if (!nonEmpty(context.baseBranch)) findings.push(processFinding('BASE_BRANCH_MISSING', 'blocker', 'Local merge requires confirmed base branch.'));
    if (!nonEmpty(workspace.branch) || workspace.mode?.includes('detached')) findings.push(processFinding('MERGE_FROM_DETACHED_HEAD', 'blocker', 'Detached workspace cannot merge locally without creating a branch.'));
  }

  if (option === 'push-pr' && context.remote?.configured !== true) findings.push(processFinding('REMOTE_NOT_CONFIGURED', 'blocker', 'Push/PR option requires a configured remote.'));

  if (decision.cleanupRequested === true) {
    if (workspace.cleanupOwned !== true) findings.push(processFinding('WORKSPACE_CLEANUP_NOT_OWNED', 'blocker', 'Automatic cleanup is allowed only for project-owned worktrees.'));
    if (option === 'merge-local' && verification.mergedResultPass !== true) findings.push(processFinding('MERGED_RESULT_NOT_VERIFIED', 'blocker', 'Worktree cleanup after merge requires a passing test run on the merged result.'));
  }

  if (option === 'discard') {
    if (decision.confirmation !== 'discard') findings.push(processFinding('DISCARD_CONFIRMATION_INVALID', 'blocker', 'Discard requires the exact confirmation token “discard”.'));
    if (!Array.isArray(context.commitInventory) || context.commitInventory.length === 0 || !nonEmpty(workspace.topLevel)) findings.push(processFinding('DISCARD_INVENTORY_INCOMPLETE', 'blocker', 'Discard requires commit inventory and workspace path.'));
    if (workspace.cleanupOwned !== true) findings.push(processFinding('DISCARD_WORKSPACE_NOT_OWNED', 'blocker', 'This system cannot automatically discard a host-owned workspace.'));
  }

  const report = finalizeProcessAudit(findings, { evidenceCount: Object.keys(verification).length + 1, evidenceConfidence: verification.fresh === true ? 100 : 50 });
  return {
    ...report,
    status: report.hardFailures.length ? 'fail' : 'ready',
    selectedOption: option || null,
    allowedOptions,
    cleanupAllowed: decision.cleanupRequested === true && workspace.cleanupOwned === true && report.hardFailures.length === 0,
    destructiveActionsRequireExactConfirmation: true,
    executionIsStillExplicit: true,
    policy: { ...policy }
  };
}
