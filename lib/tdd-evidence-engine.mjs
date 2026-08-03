import { finalizeProcessAudit, nonEmpty, processFinding } from './process-audit-utils.mjs';

function time(value) {
  const parsed = Date.parse(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function cyclePath(index, suffix = '') {
  return `cycles[${index}]${suffix ? `.${suffix}` : ''}`;
}

export function auditTddCycles(cyclesInput = [], policy = {}) {
  const cycles = Array.isArray(cyclesInput) ? cyclesInput : [];
  const findings = [];
  const summaries = [];
  let evidenceCount = 0;

  if (cycles.length === 0 && policy.required !== false) findings.push(processFinding('TDD_CYCLES_MISSING', 'blocker', 'At least one TDD cycle is required.'));

  for (const [index, cycle] of cycles.entries()) {
    const local = [];
    const path = cyclePath(index);
    for (const [field, value] of [
      ['id', cycle?.id], ['behaviorId', cycle?.behaviorId], ['requirementRef', cycle?.requirementRef],
      ['test.file', cycle?.test?.file], ['test.name', cycle?.test?.name]
    ]) if (!nonEmpty(value)) local.push(processFinding('TDD_IDENTITY_MISSING', 'blocker', `TDD cycle requires ${field}.`, { path: `${path}.${field}` }));

    const redAt = time(cycle?.red?.at);
    const implementationAt = time(cycle?.production?.at);
    const greenAt = time(cycle?.green?.at);
    if (redAt === null || implementationAt === null || greenAt === null) local.push(processFinding('TDD_TIMESTAMP_INVALID', 'blocker', 'RED, implementation, and GREEN timestamps must be valid.', { path }));
    else if (!(redAt < implementationAt && implementationAt < greenAt)) local.push(processFinding('RED_NOT_BEFORE_IMPLEMENTATION', 'blocker', 'RED evidence must precede implementation and GREEN evidence.', { path }));

    if (Number(cycle?.red?.exitStatus) === 0) local.push(processFinding('RED_DID_NOT_FAIL', 'blocker', 'RED command exited successfully; it did not demonstrate missing behavior.', { path: `${path}.red` }));
    if (cycle?.red?.failureKind !== 'behavior-missing') local.push(processFinding('INVALID_RED_FAILURE_KIND', 'blocker', 'RED failure must be caused by the missing behavior, not syntax, dependency, or infrastructure failure.', { path: `${path}.red.failureKind` }));
    if (!nonEmpty(cycle?.red?.expectedFailureSignature) || !String(cycle?.red?.observedFailureSignature ?? '').includes(String(cycle?.red?.expectedFailureSignature ?? ''))) local.push(processFinding('RED_SIGNATURE_MISMATCH', 'blocker', 'Observed RED failure does not match the expected behavior failure signature.', { path: `${path}.red` }));

    if (Number(cycle?.green?.exitStatus) !== 0 || Number(cycle?.green?.passCount ?? 0) < 1) local.push(processFinding('GREEN_NOT_VERIFIED', 'blocker', 'GREEN evidence must show the target command passed with at least one test.', { path: `${path}.green` }));
    if (!nonEmpty(cycle?.red?.outputHash) || !nonEmpty(cycle?.green?.outputHash)) local.push(processFinding('TEST_OUTPUT_HASH_MISSING', 'high', 'RED and GREEN command outputs require hashes.', { path }));
    if (!nonEmpty(cycle?.red?.testHash) || cycle?.red?.testHash !== cycle?.green?.testHash) local.push(processFinding('TEST_IDENTITY_CHANGED', 'blocker', 'RED and GREEN must bind to the same test identity unless a separately reviewed refinement is recorded.', { path }));
    if (!nonEmpty(cycle?.red?.productionHash) || !nonEmpty(cycle?.production?.productionHash) || cycle.red.productionHash === cycle.production.productionHash || cycle.production.productionHash !== cycle?.green?.productionHash) local.push(processFinding('PRODUCTION_CHANGE_NOT_PROVEN', 'blocker', 'Evidence must prove production code changed after RED and that GREEN ran against the changed production state.', { path }));

    if (String(cycle?.risk ?? 'normal') === 'high') {
      const negative = cycle?.negativeControl;
      if (!negative || negative.status !== 'failed-as-expected' || !nonEmpty(negative.command) || !nonEmpty(negative.outputHash)) local.push(processFinding('NEGATIVE_CONTROL_REQUIRED', 'blocker', 'High-risk behavior requires a mutation, revert, or equivalent negative control that fails as expected.', { path }));
      else evidenceCount += 1;
    }

    if (cycle?.refactor?.changed === true) {
      if (!nonEmpty(cycle.refactor.command) || Number(cycle.refactor.exitStatus) !== 0 || time(cycle.refactor.at) === null || (greenAt !== null && time(cycle.refactor.at) < greenAt)) local.push(processFinding('REFACTOR_VERIFICATION_MISSING', 'blocker', 'Refactoring requires a fresh passing verification after the GREEN state.', { path: `${path}.refactor` }));
      else evidenceCount += 1;
    }

    findings.push(...local);
    evidenceCount += [cycle?.red, cycle?.production, cycle?.green].filter(Boolean).length;
    summaries.push({
      id: cycle?.id ?? null,
      behaviorId: cycle?.behaviorId ?? null,
      classification: local.some((item) => ['RED_NOT_BEFORE_IMPLEMENTATION', 'RED_DID_NOT_FAIL', 'INVALID_RED_FAILURE_KIND'].includes(item.code)) ? 'test-after-or-invalid' : local.some((item) => item.severity === 'blocker') ? 'incomplete' : 'test-first',
      accepted: !local.some((item) => item.severity === 'blocker'),
      findingCodes: local.map((item) => item.code)
    });
  }

  const report = finalizeProcessAudit(findings, { evidenceCount, evidenceConfidence: cycles.length ? 100 : 0 });
  return {
    ...report,
    cycles: summaries,
    acceptedCycles: summaries.filter((item) => item.accepted).length,
    rejectedCycles: summaries.filter((item) => !item.accepted).length,
    policy: { highRiskNegativeControlRequired: true, ...policy }
  };
}
