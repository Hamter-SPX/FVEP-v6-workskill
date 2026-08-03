import test from 'node:test';
import assert from 'node:assert/strict';
import { auditExperienceContract } from '../../lib/experience-contract-engine.mjs';

test('experience contract blocks unmapped backend failures and unsafe optimistic mutations', () => {
  const report = auditExperienceContract({ flows: [{
    id: 'checkout', critical: true, userGoal: 'Place an order',
    frontend: { route: '/checkout', states: ['default', 'loading', 'success'] },
    backend: { operations: ['POST /orders'], errors: ['OUT_OF_STOCK', 'PAYMENT_DECLINED'] },
    errorMappings: { PAYMENT_DECLINED: 'payment-error' },
    authentication: 'required', authorization: null,
    mutation: { optimistic: true, retries: 2, idempotencyKey: false, conflictStrategy: null },
    latencyBudgetMs: 1500
  }] });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'experience-error-unmapped' && finding.detail === 'OUT_OF_STOCK'));
  assert.ok(report.findings.some((finding) => finding.code === 'experience-optimistic-idempotency-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'experience-authorization-missing'));
  assert.ok(report.coverage.confidence < 100);
});

test('complete critical flow passes with explicit UI, error, latency, auth, and mutation semantics', () => {
  const report = auditExperienceContract({ flows: [{
    id: 'profile-update', critical: true, userGoal: 'Update profile',
    frontend: { route: '/profile', states: ['default', 'loading', 'error', 'success', 'disabled'] },
    backend: { operations: ['PATCH /users/{id}'], errors: ['VALIDATION_FAILED', 'VERSION_CONFLICT'] },
    errorMappings: { VALIDATION_FAILED: 'field-errors', VERSION_CONFLICT: 'conflict-dialog' },
    authentication: 'required', authorization: 'self-or-admin',
    mutation: { optimistic: false, retries: 0, idempotencyKey: true, conflictStrategy: 'etag' },
    latencyBudgetMs: 1000, degradedBehavior: 'Preserve edits and allow retry', analytics: ['profile_update_success']
  }] });
  assert.equal(report.status, 'pass');
  assert.equal(report.blockers.length, 0);
  assert.equal(report.coverage.confidence, 100);
});
