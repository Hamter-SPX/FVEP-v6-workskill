import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProcessGate } from '../../lib/process-gate-engine.mjs';

function section(score = 100, confidence = 100) {
  return { status: 'pass', score, evidenceConfidence: confidence, hardFailures: [], findings: [] };
}

function complete() {
  return {
    routing: section(), design: section(), plan: section(), workspace: section(),
    tdd: section(), review: section(), claims: section(), ledger: section()
  };
}

test('complete process evidence passes with separate quality and confidence', () => {
  const report = evaluateProcessGate(complete());
  assert.equal(report.status, 'pass');
  assert.equal(report.qualityScore, 100);
  assert.equal(report.evidenceConfidence, 100);
  assert.equal(report.releaseEligible, true);
});

test('missing required section blocks even when available scores are perfect', () => {
  const sections = complete();
  delete sections.review;
  const report = evaluateProcessGate(sections);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'REQUIRED_PROCESS_SECTION_MISSING'));
  assert.equal(report.qualityScore, 100);
  assert.ok(report.evidenceConfidence < 100);
});

test('hard failure in one section survives weighted aggregation', () => {
  const sections = complete();
  sections.tdd = { ...section(), status: 'fail', hardFailures: [{ code: 'RED_MISSING', severity: 'blocker', message: 'missing red' }] };
  const report = evaluateProcessGate(sections);
  assert.equal(report.releaseEligible, false);
  assert.ok(report.hardFailures.some((item) => item.code === 'PROCESS_SECTION_HARD_FAILURE'));
});

test('low confidence fails release without rewriting measured quality', () => {
  const sections = complete();
  sections.workspace = section(100, 40);
  const report = evaluateProcessGate(sections, { minConfidence: 90 });
  assert.equal(report.qualityScore, 100);
  assert.ok(report.evidenceConfidence < 90);
  assert.equal(report.releaseEligible, false);
});
