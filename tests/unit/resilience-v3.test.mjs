import test from 'node:test';
import assert from 'node:assert/strict';
import { auditResilienceContract } from '../../lib/resilience-engine.mjs';

test('resilience audit blocks missing timeouts and retries of non-idempotent mutations', () => {
  const report = auditResilienceContract({ operations: [
    { id: 'charge-card', critical: true, method: 'POST', timeoutMs: null, retries: 3, idempotent: false, idempotencyKey: false, backoff: null, jitter: false, circuitBreaker: false, fallback: null, callerBudgetMs: 2000 },
    { id: 'get-profile', critical: true, method: 'GET', timeoutMs: 5000, retries: 4, nestedRetryDepth: 2, backoff: 'exponential', jitter: true, circuitBreaker: false, fallback: null, callerBudgetMs: 3000 }
  ] });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'resilience-timeout-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'resilience-non-idempotent-retry'));
  assert.ok(report.findings.some((finding) => finding.code === 'resilience-retry-amplification'));
  assert.ok(report.findings.some((finding) => finding.code === 'resilience-timeout-exceeds-budget'));
});
