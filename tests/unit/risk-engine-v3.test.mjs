import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRiskRegister } from '../../lib/risk-engine.mjs';

test('risk register ranks exposure, preserves hard blockers, and penalizes missing ownership', () => {
  const report = evaluateRiskRegister({ risks: [
    { id: 'R-1', title: 'Cross-tenant data exposure', likelihood: 4, impact: 5, detectability: 5, status: 'open', hardBlocker: true, mitigations: ['Object authorization test'], evidence: ['security/audit.json'] },
    { id: 'R-2', title: 'Slow export', likelihood: 2, impact: 2, detectability: 2, status: 'open', owner: 'Data Team', mitigations: ['Queue export'], evidence: [] }
  ] });
  assert.equal(report.status, 'fail');
  assert.equal(report.blockers.length, 1);
  assert.equal(report.risks[0].id, 'R-1');
  assert.equal(report.risks[0].rpn, 100);
  assert.ok(report.findings.some((finding) => finding.code === 'risk-owner-missing'));
  assert.ok(report.evidenceConfidence < 100);
});

test('accepted or mitigated risks require evidence and expiry to avoid false closure', () => {
  const report = evaluateRiskRegister({ risks: [
    { id: 'R-3', title: 'Legacy cipher', likelihood: 3, impact: 4, detectability: 3, status: 'accepted', owner: 'Security', acceptance: { approvedBy: 'CISO' }, mitigations: [], evidence: [] }
  ] });
  assert.equal(report.status, 'warning');
  assert.ok(report.findings.some((finding) => finding.code === 'risk-acceptance-expiry-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'risk-evidence-missing'));
});
