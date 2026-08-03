import test from 'node:test';
import assert from 'node:assert/strict';
import { auditApiContract, compareApiContracts } from '../../lib/api-contract-engine.mjs';

const problemSchema = { type: 'object', required: ['type', 'title', 'status', 'code'], properties: { type: { type: 'string' }, title: { type: 'string' }, status: { type: 'integer' }, code: { type: 'string' } } };

test('API audit detects missing operation identity, security, error schema, and mutation idempotency', () => {
  const report = auditApiContract({ openapi: '3.1.0', paths: {
    '/orders': { post: { responses: { '201': { description: 'Created' }, '400': { description: 'Bad request' } } } }
  } }, { requireSecurity: true, requireMutationIdempotency: true });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'api-operation-id-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'api-security-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'api-error-schema-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'api-idempotency-missing'));
});

test('API compatibility comparison blocks removed operations and newly required request fields', () => {
  const baseline = { openapi: '3.1.0', paths: {
    '/users': { get: { operationId: 'listUsers', responses: { '200': { description: 'OK' } } } },
    '/orders': { post: { operationId: 'createOrder', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['sku'], properties: { sku: { type: 'string' } } } } } }, responses: { '201': { description: 'Created' }, '400': { description: 'Bad', content: { 'application/problem+json': { schema: problemSchema } } } } } }
  } };
  const current = { openapi: '3.1.0', paths: {
    '/orders': { post: { operationId: 'createOrder', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['sku', 'quantity'], properties: { sku: { type: 'string' }, quantity: { type: 'integer' } } } } } }, responses: { '201': { description: 'Created' } } } }
  } };
  const report = compareApiContracts(baseline, current);
  assert.equal(report.compatible, false);
  assert.ok(report.breakingChanges.some((change) => change.code === 'api-operation-removed' && change.path === 'GET /users'));
  assert.ok(report.breakingChanges.some((change) => change.code === 'api-request-required-field-added' && change.detail === 'quantity'));
  assert.ok(report.breakingChanges.some((change) => change.code === 'api-response-removed' && change.detail === '400'));
});
