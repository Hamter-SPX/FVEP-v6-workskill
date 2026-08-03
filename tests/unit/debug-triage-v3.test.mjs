import test from 'node:test';
import assert from 'node:assert/strict';
import { rankIncidentHypotheses } from '../../lib/debug-triage-engine.mjs';

test('incident triage ranks evidence-backed hypotheses and localizes the first failing boundary', () => {
  const report = rankIncidentHypotheses({
    incident: { id: 'INC-7', symptoms: ['Checkout returns 502'], affectedFlows: ['checkout'] },
    evidence: [
      { id: 'E1', component: 'web', boundary: 'browser->api', state: 'pass', observation: 'Request emitted with correlation id', confidence: 0.9, correlationId: 'abc' },
      { id: 'E2', component: 'gateway', boundary: 'gateway->orders', state: 'fail', observation: 'Upstream connect timeout', confidence: 0.95, correlationId: 'abc' },
      { id: 'E3', component: 'orders', boundary: 'orders->db', state: 'unknown', observation: 'No trace span received', confidence: 0.7, correlationId: 'abc' },
      { id: 'E4', component: 'gateway', boundary: 'gateway->orders', state: 'pass', observation: 'Health endpoint is green', confidence: 0.4, correlationId: 'health' }
    ],
    hypotheses: [
      { id: 'H1', statement: 'Orders service connection pool exhausted', boundary: 'gateway->orders', supportingEvidence: ['E2', 'E3'], contradictingEvidence: ['E4'], falsificationTest: 'Inspect pool saturation and open connections', status: 'open' },
      { id: 'H2', statement: 'Browser request malformed', boundary: 'browser->api', supportingEvidence: [], contradictingEvidence: ['E1'], falsificationTest: 'Replay captured request', status: 'open' }
    ]
  });
  assert.equal(report.suspectedBoundary, 'gateway->orders');
  assert.equal(report.rankedHypotheses[0].id, 'H1');
  assert.ok(report.rankedHypotheses[0].score > report.rankedHypotheses[1].score);
  assert.equal(report.rootCauseConfirmed, false);
  assert.ok(report.nextActions.some((action) => action.includes('pool saturation')));
});
