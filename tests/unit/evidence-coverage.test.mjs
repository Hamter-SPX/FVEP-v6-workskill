import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCaseCoverage, combineCoverage } from '../../lib/evidence-coverage.mjs';

test('case coverage distinguishes complete, missing, unexpected, and duplicate evidence', () => {
  const coverage = evaluateCaseCoverage(
    [{ key: 'home__mobile__default' }, { key: 'home__mobile__default' }, { key: 'home__desktop__default' }, { key: 'other__desktop__default' }],
    ['home__mobile__default', 'home__tablet__default', 'home__desktop__default']
  );
  assert.equal(coverage.expected, 3);
  assert.equal(coverage.covered, 2);
  assert.equal(coverage.ratio, 2 / 3);
  assert.deepEqual(coverage.missing, ['home__tablet__default']);
  assert.deepEqual(coverage.unexpected, ['other__desktop__default']);
  assert.deepEqual(coverage.duplicates, ['home__mobile__default']);
  assert.equal(coverage.complete, false);
});

test('combined coverage preserves the weakest required evidence family', () => {
  const combined = combineCoverage([
    { name: 'interaction', required: true, coverage: { ratio: 1, expected: 2, covered: 2, missing: [] } },
    { name: 'state-crawler', required: true, coverage: { ratio: 0.5, expected: 2, covered: 1, missing: ['b'] } },
    { name: 'optional-probe', required: false, coverage: { ratio: 0, expected: 2, covered: 0, missing: ['a', 'b'] } }
  ]);
  assert.equal(combined.ratio, 0.75);
  assert.equal(combined.complete, false);
  assert.deepEqual(combined.incompleteFamilies, ['state-crawler']);
});
