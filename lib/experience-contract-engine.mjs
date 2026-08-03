import { finalizeAudit, makeFinding, nonEmpty, percentage, uniqueStrings } from './audit-utils.mjs';

const REQUIRED_CRITICAL_STATES = Object.freeze(['default', 'loading', 'error', 'success']);

export function auditExperienceContract(contract = {}, policy = {}) {
  const flows = Array.isArray(contract?.flows) ? contract.flows : [];
  const findings = [];
  let checks = 0;
  let passed = 0;
  const seen = new Set();

  for (const [index, raw] of flows.entries()) {
    const id = String(raw?.id ?? `flow-${index + 1}`);
    const path = `flows.${id}`;
    if (seen.has(id)) findings.push(makeFinding('experience-flow-id-duplicate', 'blocker', `Flow identifier ${id} is duplicated.`, { path }));
    seen.add(id);
    const critical = raw?.critical !== false;
    const states = new Set(uniqueStrings(raw?.frontend?.states));
    const backendErrors = uniqueStrings(raw?.backend?.errors);
    const mappings = raw?.errorMappings && typeof raw.errorMappings === 'object' ? raw.errorMappings : {};

    for (const state of critical ? REQUIRED_CRITICAL_STATES : ['default', 'success']) {
      checks += 1;
      if (states.has(state)) passed += 1;
      else findings.push(makeFinding('experience-state-missing', state === 'error' && critical ? 'high' : 'medium', `Flow ${id} lacks the ${state} UI state.`, { path, detail: state }));
    }

    for (const errorCode of backendErrors) {
      checks += 1;
      if (nonEmpty(mappings[errorCode])) passed += 1;
      else findings.push(makeFinding('experience-error-unmapped', critical ? 'high' : 'medium', `Backend error ${errorCode} has no explicit UI mapping in flow ${id}.`, { path, detail: errorCode }));
    }

    const operations = uniqueStrings(raw?.backend?.operations);
    checks += 1;
    if (operations.length) passed += 1;
    else findings.push(makeFinding('experience-backend-operation-missing', critical ? 'high' : 'medium', `Flow ${id} does not identify backend operations.`, { path }));

    checks += 1;
    if (nonEmpty(raw?.frontend?.route)) passed += 1;
    else findings.push(makeFinding('experience-route-missing', 'high', `Flow ${id} has no frontend route or surface identifier.`, { path }));

    checks += 2;
    if (nonEmpty(raw?.authentication)) passed += 1;
    else findings.push(makeFinding('experience-authentication-missing', critical ? 'high' : 'medium', `Flow ${id} does not declare authentication expectations.`, { path }));
    if (nonEmpty(raw?.authorization)) passed += 1;
    else findings.push(makeFinding('experience-authorization-missing', critical ? 'blocker' : 'high', `Flow ${id} does not declare authorization rules.`, { path, remediation: 'Declare subject, resource, action, and policy decision semantics.' }));

    checks += 1;
    if (Number.isFinite(Number(raw?.latencyBudgetMs)) && Number(raw.latencyBudgetMs) > 0) passed += 1;
    else findings.push(makeFinding('experience-latency-budget-missing', 'medium', `Flow ${id} has no latency budget.`, { path }));

    if (raw?.mutation) {
      const mutation = raw.mutation;
      const retrying = Number(mutation.retries ?? 0) > 0;
      const optimistic = Boolean(mutation.optimistic);
      checks += 2;
      if (!retrying && !optimistic || Boolean(mutation.idempotencyKey)) passed += 1;
      else findings.push(makeFinding('experience-optimistic-idempotency-missing', 'blocker', `Flow ${id} retries or applies optimistic mutation without an idempotency key.`, { path }));
      if (!optimistic || nonEmpty(mutation.conflictStrategy)) passed += 1;
      else findings.push(makeFinding('experience-conflict-strategy-missing', 'high', `Optimistic flow ${id} lacks a conflict reconciliation strategy.`, { path }));
    }

    checks += 2;
    if (nonEmpty(raw?.degradedBehavior)) passed += 1;
    else findings.push(makeFinding('experience-degraded-behavior-missing', critical ? 'medium' : 'low', `Flow ${id} has no degraded-mode behavior.`, { path }));
    if (uniqueStrings(raw?.analytics).length) passed += 1;
    else findings.push(makeFinding('experience-analytics-missing', 'low', `Flow ${id} has no success/failure instrumentation contract.`, { path }));

    if (raw?.destructive) {
      checks += 2;
      if (raw.destructive.confirmation === true) passed += 1;
      else findings.push(makeFinding('experience-destructive-confirmation-missing', 'high', `Destructive flow ${id} has no confirmation contract.`, { path }));
      if (raw.destructive.undo === true || nonEmpty(raw.destructive.recovery)) passed += 1;
      else findings.push(makeFinding('experience-destructive-recovery-missing', 'high', `Destructive flow ${id} has no undo or recovery path.`, { path }));
    }
  }

  if (!flows.length) findings.push(makeFinding('experience-contract-empty', policy.required === false ? 'low' : 'blocker', 'No critical user flows are declared.'));
  const confidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: flows.length, evidenceConfidence: confidence });
  return { ...report, flows: flows.length, coverage: { requiredChecks: checks, satisfiedChecks: passed, confidence } };
}
