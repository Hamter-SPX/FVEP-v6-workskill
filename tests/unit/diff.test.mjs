import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyDiff, dimensionsMatch, normalizeMaskRectangles, pointInRectangle } from '../../lib/diff-policy.mjs';

test('dimension mismatch is always a blocker', () => {
  assert.equal(dimensionsMatch({ width: 100, height: 100 }, { width: 100, height: 101 }), false);
  assert.equal(classifyDiff({ dimensionsEqual: false, mismatchRatio: 0 }).severity, 'blocker');
});

test('numeric policy distinguishes accepted, minor, major, and blocker', () => {
  assert.equal(classifyDiff({ dimensionsEqual: true, mismatchRatio: 0 }).severity, 'accepted');
  assert.equal(classifyDiff({ dimensionsEqual: true, mismatchRatio: 0.001 }).severity, 'minor');
  assert.equal(classifyDiff({ dimensionsEqual: true, mismatchRatio: 0.01 }).severity, 'major');
  assert.equal(classifyDiff({ dimensionsEqual: true, mismatchRatio: 0.03 }).severity, 'blocker');
});

test('mask rectangles are normalized and use half-open coordinates', () => {
  const [mask] = normalizeMaskRectangles([{ x: 1.8, y: 2.2, width: 3.9, height: 4.1 }]);
  assert.deepEqual(mask, { x: 1, y: 2, width: 3, height: 4 });
  assert.equal(pointInRectangle(mask, 1, 2), true);
  assert.equal(pointInRectangle(mask, 4, 2), false);
});

test('perceptual policy distinguishes accepted, major, and blocker similarity', async () => {
  const { classifyPerceptual } = await import('../../lib/diff-policy.mjs');
  assert.equal(classifyPerceptual(0.99, { minSimilarity: 0.97, blockerSimilarity: 0.85 }).severity, 'accepted');
  assert.equal(classifyPerceptual(0.92, { minSimilarity: 0.97, blockerSimilarity: 0.85 }).severity, 'major');
  assert.equal(classifyPerceptual(0.70, { minSimilarity: 0.97, blockerSimilarity: 0.85 }).severity, 'blocker');
});
