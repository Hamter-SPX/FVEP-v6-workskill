import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRegion, compareRegionGeometry } from '../../lib/region-engine.mjs';

test('region requires selector or rectangle and normalizes policy', () => {
  assert.throws(() => normalizeRegion({ name: 'hero' }, 0), /selector or rect/i);
  assert.deepEqual(normalizeRegion({ name: 'hero', selector: 'main > section', weight: 2 }, 0), { name: 'hero', selector: 'main > section', rect: null, weight: 2, required: true, maxMismatchRatio: null, minPerceptualSimilarity: null });
});

test('region geometry comparison classifies displacement and dimension mismatch', () => {
  assert.equal(compareRegionGeometry({ x: 10, y: 10, width: 100, height: 80 }, { x: 11, y: 12, width: 100, height: 80 }, 2).severity, 'accepted');
  assert.equal(compareRegionGeometry({ x: 10, y: 10, width: 100, height: 80 }, { x: 30, y: 10, width: 100, height: 80 }, 2).severity, 'major');
  assert.equal(compareRegionGeometry({ x: 10, y: 10, width: 100, height: 80 }, { x: 10, y: 10, width: 120, height: 80 }, 2).severity, 'blocker');
});
