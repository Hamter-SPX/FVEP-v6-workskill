import test from 'node:test';
import assert from 'node:assert/strict';
import { auditObservabilityContract } from '../../lib/observability-engine.mjs';

test('observability audit exposes missing correlation, SLO, alert, runbook, and critical-flow coverage', () => {
  const report = auditObservabilityContract({ flows: [
    { id: 'checkout', critical: true, owner: 'Commerce', logs: ['order.started'], metrics: ['orders_total'], traces: [], correlation: false, slo: null, alerts: [], runbook: null, dashboard: null },
    { id: 'search', critical: false, owner: 'Discovery', logs: ['search.completed'], metrics: ['search_latency'], traces: ['search-span'], correlation: true, slo: { objective: 99.9, windowDays: 30 }, alerts: ['latency-burn'], runbook: 'runbooks/search.md', dashboard: 'dashboards/search' }
  ] });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'observability-correlation-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'observability-slo-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'observability-runbook-missing'));
  assert.ok(report.coverage.confidence < 100);
});
