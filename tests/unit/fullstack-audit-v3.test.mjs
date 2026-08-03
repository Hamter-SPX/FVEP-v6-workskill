import test from 'node:test';
import assert from 'node:assert/strict';
import { runFullstackAudit } from '../../lib/fullstack-audit-engine.mjs';

const problem = { type: 'object', required: ['code'], properties: { code: { type: 'string' } } };

test('fullstack audit correlates design, API, data, security, resilience, observability, dependencies, and risks', () => {
  const report = runFullstackAudit({
    process: { processGate: { status: 'pass', releaseEligible: true, qualityScore: 98, evidenceConfidence: 100, evidenceCount: 8, hardFailures: [], blockers: [] } },
    frontend: { score: 96, confidence: 100, passed: true },
    experience: { flows: [{ id: 'profile', critical: true, userGoal: 'Edit profile', frontend: { route: '/profile', states: ['default', 'loading', 'error', 'success'] }, backend: { operations: ['PATCH /profile'], errors: ['VALIDATION'] }, errorMappings: { VALIDATION: 'field-errors' }, authentication: 'required', authorization: 'self', mutation: { optimistic: false, retries: 0, idempotencyKey: true }, latencyBudgetMs: 1000, degradedBehavior: 'Keep edits', analytics: ['profile_saved'] }] },
    api: { current: { openapi: '3.1.0', security: [{ bearerAuth: [] }], paths: { '/profile': { patch: { operationId: 'updateProfile', parameters: [{ in: 'header', name: 'Idempotency-Key' }], responses: { '200': { description: 'OK' }, '400': { description: 'Bad', content: { 'application/problem+json': { schema: problem } } } } } } } } },
    architecture: { components: [{ id: 'web', owner: 'Web', criticality: 'high', trustZone: 'public', replicas: 2, slo: { availability: 99.9 }, fallback: 'cached shell' }, { id: 'api', owner: 'API', criticality: 'critical', trustZone: 'private', replicas: 2, slo: { availability: 99.9 }, fallback: 'read-only mode' }], edges: [{ from: 'web', to: 'api', protocol: 'https', authentication: 'bearer', authorization: 'policy', encryption: true, timeoutMs: 1000 }] },
    migrations: { migrations: [] },
    security: { controls: { authentication: { status: 'implemented', evidence: ['auth.e2e'] }, authorization: { status: 'implemented', evidence: ['authz.e2e'] }, inputValidation: { status: 'implemented', evidence: ['validation.test'] }, secrets: { status: 'implemented', evidence: ['vault-policy'] }, auditLogging: { status: 'implemented', evidence: ['audit-log.test'] }, encryptionInTransit: { status: 'implemented', evidence: ['tls-scan'] } } },
    sourceFiles: [{ path: 'src/safe.js', content: 'export const add = (a, b) => a + b;' }],
    resilience: { operations: [{ id: 'update-profile', critical: true, method: 'PATCH', timeoutMs: 800, retries: 0, idempotent: true, circuitBreaker: true, fallback: 'preserve edit', callerBudgetMs: 1000 }] },
    observability: { flows: [{ id: 'profile', critical: true, owner: 'API', logs: ['profile.updated'], metrics: ['profile_update_latency'], traces: ['profile-span'], correlation: true, slo: { objective: 99.9, windowDays: 30 }, alerts: ['burn-rate'], runbook: 'runbooks/profile.md', dashboard: 'dashboards/profile' }] },
    dependencies: { manifest: { dependencies: { zod: '4.0.0' } }, lockfilePresent: true },
    risks: { risks: [{ id: 'R1', title: 'Profile service outage', likelihood: 2, impact: 3, detectability: 2, status: 'mitigated', owner: 'API', mitigations: ['Fallback'], evidence: ['game-day'] }] }
  }, { quality: { minScore: 80, minConfidence: 80, failOnAnyGateFailure: false }, applicability: { data: false } });
  assert.equal(report.quality.passed, true);
  assert.equal(report.sections.security.status, 'pass');
  assert.equal(report.sections.api.status, 'pass');
  assert.ok(report.quality.score >= 80);
});

test('API breaking changes and source blockers survive aggregation', () => {
  const report = runFullstackAudit({
    api: { baseline: { openapi: '3.1.0', paths: { '/users': { get: { operationId: 'listUsers', responses: { '200': { description: 'OK' } } } } } }, current: { openapi: '3.1.0', paths: {} } },
    security: { controls: {} },
    sourceFiles: [{ path: 'src/config.js', content: 'const password = "super-secret-password";' }]
  }, { quality: { minScore: 0, minConfidence: 0, failOnAnyGateFailure: false }, applicability: { process: false, frontend: false, experience: false, architecture: false, data: false, resilience: false, observability: false, dependencies: false, risks: false } });
  assert.equal(report.quality.passed, false);
  assert.ok(report.quality.hardFailures.includes('api'));
  assert.ok(report.quality.hardFailures.includes('security'));
  assert.ok(report.sections.api.compatibility.breakingChanges.length > 0);
  assert.ok(report.sections.sourceRisk.blockers.length > 0);
});
