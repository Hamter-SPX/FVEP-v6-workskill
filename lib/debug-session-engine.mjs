import { finalizeProcessAudit, nonEmpty, processFinding, unique } from './process-audit-utils.mjs';

function boundaryLocalization(boundaries = []) {
  const ordered = [...boundaries].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
  const firstFailIndex = ordered.findIndex((item) => item?.status === 'fail');
  if (firstFailIndex < 0) return { ordered, lastConfirmedGood: null, firstConfirmedBad: null };
  const previousPasses = ordered.slice(0, firstFailIndex).filter((item) => item?.status === 'pass');
  return {
    ordered,
    lastConfirmedGood: previousPasses.at(-1)?.id ?? null,
    firstConfirmedBad: ordered[firstFailIndex]?.id ?? null
  };
}

export function auditDebugSession(session = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const maxFixAttempts = Number(policy.maxFixAttempts ?? 3);

  if (!nonEmpty(session.id)) findings.push(processFinding('DEBUG_SESSION_ID_MISSING', 'blocker', 'Debug session requires an id.'));
  const reproduction = session.reproduction ?? {};
  const stable = reproduction.stable === true;
  const intermittentStrategy = reproduction.stable === false && Number(reproduction.sampleCount ?? 0) >= Number(policy.minimumIntermittentSamples ?? 3) && nonEmpty(reproduction.monitoringEvidence);
  if (!stable && !intermittentStrategy) findings.push(processFinding('REPRODUCTION_NOT_STABILIZED', 'blocker', 'Issue requires stable reproduction or an explicit intermittent evidence strategy.'));
  for (const field of ['expected', 'observed', 'environmentHash', 'buildId']) if (!nonEmpty(reproduction[field])) findings.push(processFinding('REPRODUCTION_CONTEXT_MISSING', 'high', `Reproduction requires ${field}.`, { path: `reproduction.${field}` }));
  if (stable && (!Array.isArray(reproduction.steps) || reproduction.steps.length === 0)) findings.push(processFinding('REPRODUCTION_STEPS_MISSING', 'blocker', 'Stable reproduction requires exact steps.'));

  const evidence = Array.isArray(session.evidence) ? session.evidence : [];
  const evidenceIds = new Set(evidence.map((item) => String(item?.id ?? '')).filter(Boolean));
  evidenceCount += evidence.length;
  const boundaries = Array.isArray(session.boundaries) ? session.boundaries : [];
  for (const [index, boundary] of boundaries.entries()) {
    if (!['pass', 'fail', 'unknown'].includes(boundary?.status)) findings.push(processFinding('BOUNDARY_STATUS_INVALID', 'blocker', 'Boundary status must be pass, fail, or unknown.', { path: `boundaries[${index}]` }));
    for (const id of unique(boundary?.evidence ?? [])) if (!evidenceIds.has(id)) findings.push(processFinding('BOUNDARY_EVIDENCE_UNKNOWN', 'high', `Boundary references unknown evidence ${id}.`, { path: `boundaries[${index}]` }));
  }
  const localization = boundaryLocalization(boundaries);
  if (!localization.firstConfirmedBad || !localization.lastConfirmedGood) findings.push(processFinding('FAILING_BOUNDARY_NOT_LOCALIZED', 'blocker', 'Debugging must identify the last confirmed-good and first confirmed-bad boundaries.'));

  const hypotheses = Array.isArray(session.hypotheses) ? session.hypotheses : [];
  const active = hypotheses.filter((item) => item?.status === 'active');
  if (active.length > 1) findings.push(processFinding('MULTIPLE_ACTIVE_HYPOTHESES', 'blocker', 'Only one hypothesis may be actively tested at a time.', { detail: active.map((item) => item.id) }));
  const byHypothesis = new Map(hypotheses.map((item) => [String(item?.id ?? ''), item]));
  for (const [index, hypothesis] of hypotheses.entries()) {
    if (!nonEmpty(hypothesis?.statement) || !nonEmpty(hypothesis?.predictedObservation) || !nonEmpty(hypothesis?.falsificationTest)) findings.push(processFinding('HYPOTHESIS_NOT_FALSIFIABLE', 'blocker', 'Every hypothesis requires a statement, predicted observation, and falsification test.', { path: `hypotheses[${index}]` }));
    for (const id of [...unique(hypothesis?.supportingEvidence ?? []), ...unique(hypothesis?.contradictingEvidence ?? [])]) if (!evidenceIds.has(id)) findings.push(processFinding('HYPOTHESIS_EVIDENCE_UNKNOWN', 'high', `Hypothesis references unknown evidence ${id}.`, { path: `hypotheses[${index}]` }));
    if (hypothesis?.status === 'confirmed' && unique(hypothesis?.supportingEvidence ?? []).length === 0) findings.push(processFinding('CONFIRMED_HYPOTHESIS_UNSUPPORTED', 'blocker', 'Confirmed hypothesis requires supporting evidence.', { path: `hypotheses[${index}]` }));
  }

  const experiments = Array.isArray(session.experiments) ? session.experiments : [];
  for (const [index, experiment] of experiments.entries()) {
    if (!byHypothesis.has(String(experiment?.hypothesisId ?? ''))) findings.push(processFinding('EXPERIMENT_HYPOTHESIS_UNKNOWN', 'blocker', 'Experiment must target a declared hypothesis.', { path: `experiments[${index}]` }));
    if (Number(experiment?.variablesChanged) !== 1) findings.push(processFinding('EXPERIMENT_NOT_MINIMAL', 'blocker', 'Experiment must change exactly one variable.', { path: `experiments[${index}]` }));
    if (!nonEmpty(experiment?.result)) findings.push(processFinding('EXPERIMENT_RESULT_MISSING', 'high', 'Experiment result is required.', { path: `experiments[${index}]` }));
  }

  const attempts = Array.isArray(session.fixAttempts) ? session.fixAttempts : [];
  for (const [index, attempt] of attempts.entries()) {
    const hypothesis = byHypothesis.get(String(attempt?.hypothesisId ?? ''));
    if (hypothesis?.status !== 'confirmed') findings.push(processFinding('FIX_WITHOUT_CONFIRMED_HYPOTHESIS', 'blocker', 'Fix attempt requires a confirmed hypothesis.', { path: `fixAttempts[${index}]` }));
    if (attempt?.regressionRedVerified !== true) findings.push(processFinding('REGRESSION_RED_MISSING', 'blocker', 'Fix attempt requires a failing regression test or probe before code changes.', { path: `fixAttempts[${index}]` }));
    if (localization.firstConfirmedBad && attempt?.rootCauseBoundary !== localization.firstConfirmedBad) findings.push(processFinding('FIX_NOT_AT_FIRST_FAILING_BOUNDARY', 'high', 'Fix targets a boundary different from the first confirmed failure.', { path: `fixAttempts[${index}].rootCauseBoundary`, detail: { expected: localization.firstConfirmedBad, observed: attempt?.rootCauseBoundary } }));
    if (!nonEmpty(attempt?.changeId)) findings.push(processFinding('FIX_CHANGE_ID_MISSING', 'high', 'Fix attempt requires a change identity.', { path: `fixAttempts[${index}]` }));
    if (attempt?.targetedGreenVerified !== true || attempt?.originalReproductionPasses !== true || attempt?.affectedRegressionsPass !== true) findings.push(processFinding('FIX_VERIFICATION_INCOMPLETE', 'blocker', 'Fix must pass targeted test, original reproduction, and affected regressions.', { path: `fixAttempts[${index}]` }));
    if (attempt?.telemetryDistinguishesRecurrence !== true) findings.push(processFinding('RECURRENCE_TELEMETRY_MISSING', 'medium', 'Telemetry should distinguish recurrence of the root cause.', { path: `fixAttempts[${index}]` }));
  }

  if (attempts.length > maxFixAttempts) {
    const escalation = session.architectureEscalation;
    if (escalation?.triggered !== true || !nonEmpty(escalation?.decision) || !nonEmpty(escalation?.approvedBy)) findings.push(processFinding('ARCHITECTURE_ESCALATION_REQUIRED', 'blocker', `More than ${maxFixAttempts} fix attempts requires an explicit architecture escalation and ownership decision.`));
  }

  evidenceCount += boundaries.length + hypotheses.length + experiments.length + attempts.length;
  const report = finalizeProcessAudit(findings, { evidenceCount, evidenceConfidence: evidenceCount ? 100 : 0 });
  const verifiedFix = attempts.some((attempt) => attempt?.targetedGreenVerified === true && attempt?.originalReproductionPasses === true && attempt?.affectedRegressionsPass === true);
  const nextAction = report.hardFailures.length ? 'investigate-blockers' : verifiedFix ? 'complete-verification' : active.length === 1 ? 'run-minimal-experiment' : 'form-single-hypothesis';
  return {
    ...report,
    lastConfirmedGood: localization.lastConfirmedGood,
    firstConfirmedBad: localization.firstConfirmedBad,
    activeHypothesisIds: active.map((item) => item.id),
    fixAttemptCount: attempts.length,
    nextAction,
    policy: { maxFixAttempts, ...policy }
  };
}
