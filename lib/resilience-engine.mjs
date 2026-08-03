import { finalizeAudit, makeFinding, nonEmpty, percentage } from './audit-utils.mjs';

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'DELETE']);

export function auditResilienceContract(contract = {}, policy = {}) {
  const operations = Array.isArray(contract?.operations) ? contract.operations : [];
  const findings = [];
  const amplificationLimit = Number(policy.maxAmplifiedAttempts ?? 10);
  let checks = 0;
  let passed = 0;

  for (const [index, operation] of operations.entries()) {
    const id = String(operation?.id ?? `operation-${index + 1}`);
    const path = `operations.${id}`;
    const critical = operation?.critical !== false;
    const timeout = Number(operation?.timeoutMs ?? 0);
    const retries = Math.max(0, Number(operation?.retries ?? 0));
    const method = String(operation?.method ?? 'GET').toUpperCase();

    checks += 1;
    if (timeout > 0) passed += 1;
    else findings.push(makeFinding('resilience-timeout-missing', critical ? 'blocker' : 'high', `Operation ${id} has no explicit timeout.`, { path }));

    if (Number(operation?.callerBudgetMs ?? 0) > 0 && timeout > Number(operation.callerBudgetMs)) findings.push(makeFinding('resilience-timeout-exceeds-budget', 'high', `Operation ${id} timeout ${timeout}ms exceeds caller budget ${operation.callerBudgetMs}ms.`, { path }));

    if (retries > 0) {
      checks += 2;
      if (!MUTATION_METHODS.has(method) || operation?.idempotent === true || operation?.idempotencyKey === true) passed += 1;
      else findings.push(makeFinding('resilience-non-idempotent-retry', 'blocker', `Operation ${id} retries a non-idempotent ${method} without an idempotency key.`, { path }));
      if (nonEmpty(operation?.backoff) && operation?.jitter === true) passed += 1;
      else findings.push(makeFinding('resilience-retry-backoff-incomplete', 'high', `Operation ${id} retries without both backoff and jitter.`, { path }));

      const depth = Math.max(1, Number(operation?.nestedRetryDepth ?? 1));
      const amplifiedAttempts = Math.pow(retries + 1, depth);
      if (amplifiedAttempts > amplificationLimit) findings.push(makeFinding('resilience-retry-amplification', 'high', `Operation ${id} can amplify to ${amplifiedAttempts} attempts across ${depth} retry layers.`, { path, detail: amplifiedAttempts }));
    }

    if (critical) {
      checks += 2;
      if (operation?.circuitBreaker === true) passed += 1;
      else findings.push(makeFinding('resilience-circuit-breaker-missing', 'high', `Critical operation ${id} has no circuit-breaker policy.`, { path }));
      if (nonEmpty(operation?.fallback) || operation?.degradeGracefully === true) passed += 1;
      else findings.push(makeFinding('resilience-fallback-missing', 'high', `Critical operation ${id} has no fallback or graceful degradation contract.`, { path }));
    }
  }

  if (!operations.length) findings.push(makeFinding('resilience-contract-empty', policy.required === false ? 'low' : 'blocker', 'No service operations are declared for resilience review.'));
  const confidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: operations.length, evidenceConfidence: confidence });
  return { ...report, operationCount: operations.length, policy: { maxAmplifiedAttempts: amplificationLimit }, coverage: { requiredChecks: checks, satisfiedChecks: passed, confidence } };
}
