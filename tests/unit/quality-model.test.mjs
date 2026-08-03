import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreQualityGates } from '../../lib/quality-model.mjs';

test('quality model weights evidence, confidence, and hard failures', () => {
  const result = scoreQualityGates({
    visual: { status: 'pass', score: 94, evidenceCount: 3 },
    responsive: { status: 'warning', score: 72, evidenceCount: 2 },
    accessibility: { status: 'fail', score: 40, hard: true, evidenceCount: 1 },
    runtime: { status: 'pass', evidenceCount: 2 },
    engineering: { status: 'pass', evidenceCount: 4 },
    performance: { status: 'skipped', evidenceCount: 0 },
    interaction: { status: 'pass', score: 90, evidenceCount: 2 }
  }, { minScore: 85, minConfidence: 80 });
  assert.equal(result.passed, false);
  assert.deepEqual(result.hardFailures, ['accessibility']);
  assert.ok(result.score > 60 && result.score < 90);
  assert.ok(result.confidence < 100);
  assert.equal(result.gates.performance.evidenceStatus, 'missing');
});

test('not-applicable gates do not reduce confidence', () => {
  const result = scoreQualityGates({
    visual: { status: 'pass' },
    responsive: { status: 'pass' },
    accessibility: { status: 'pass' },
    runtime: { status: 'pass' },
    engineering: { status: 'pass' },
    performance: { status: 'not-applicable' },
    interaction: { status: 'pass' }
  });
  assert.equal(result.confidence, 100);
  assert.equal(result.passed, true);
});

test('partial evidence confidence reduces overall confidence without rewriting quality score', () => {
  const result = scoreQualityGates({
    visual: { status: 'pass', score: 96, evidenceCount: 2, evidenceConfidence: 50, hard: true },
    responsive: { status: 'not-applicable' }
  }, { weights: { visual: 100, responsive: 0 }, minScore: 90, minConfidence: 80 });
  assert.equal(result.score, 96);
  assert.equal(result.confidence, 50);
  assert.equal(result.passed, false);
  assert.equal(result.gates.visual.evidenceConfidence, 50);
});
