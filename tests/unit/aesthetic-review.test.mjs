import test from 'node:test';
import assert from 'node:assert/strict';
import { AESTHETIC_DIMENSIONS, evaluateAestheticReview, REQUIRED_AESTHETIC_DIMENSIONS, validateAestheticReview } from '../../lib/aesthetic-review-engine.mjs';

function ratings(value = 5, overrides = {}) {
  return { ...Object.fromEntries(AESTHETIC_DIMENSIONS.map((name) => [name, value])), ...overrides };
}

function review(overrides = {}) {
  return {
    schemaVersion: 1,
    reviewer: 'aesthetic-critic',
    implementer: 'implementation-engineer',
    reviewedAt: new Date(Date.now() - 60_000).toISOString(),
    decision: 'approved',
    configHash: 'abc',
    cases: [{ key: 'home__desktop__default', decision: 'accepted', ratings: ratings(5), testsPerformed: ['blur', 'greyscale'], blockers: [], findings: [] }],
    ...overrides
  };
}

test('review validation requires every dimension except motion', () => {
  assert.doesNotThrow(() => validateAestheticReview(review()));
  for (const dimension of REQUIRED_AESTHETIC_DIMENSIONS) {
    const item = review();
    delete item.cases[0].ratings[dimension];
    assert.throws(() => validateAestheticReview(item), RangeError, dimension);
  }
  const motionOmitted = review();
  motionOmitted.cases[0].ratings.motionQuality = null;
  assert.doesNotThrow(() => validateAestheticReview(motionOmitted));
});

test('review validation rejects unrecognized dimensions and tests', () => {
  const unknownDimension = review();
  unknownDimension.cases[0].ratings.vibes = 5;
  assert.throws(() => validateAestheticReview(unknownDimension), TypeError);
  const unknownTest = review();
  unknownTest.cases[0].testsPerformed = ['squint-really-hard'];
  assert.throws(() => validateAestheticReview(unknownTest), TypeError);
});

test('a clean review passes and scores', () => {
  const result = evaluateAestheticReview(review(), { expectedConfigHash: 'abc', expectedCaseKeys: ['home__desktop__default'] });
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
  assert.equal(result.evidenceCount, 1);
});

test('a dimension below the floor fails regardless of the weighted average', () => {
  const item = review();
  item.cases[0].ratings = ratings(5, { craftPrecision: 2 });
  item.cases[0].findings = [{ dimension: 'craftPrecision', region: 'card', expected: 'nested radii', observed: 'equal radii', severity: 'minor' }];
  const result = evaluateAestheticReview(item, { expectedConfigHash: 'abc' });
  assert.ok(result.score > 90);
  assert.equal(result.passed, false);
  assert.deepEqual(result.floorViolations.map((entry) => entry.dimension), ['craftPrecision']);
});

test('a low rating without a supporting finding is an opinion, not a review', () => {
  const item = review();
  item.cases[0].ratings = ratings(5, { colorSystem: 2 });
  const result = evaluateAestheticReview(item, { expectedConfigHash: 'abc' });
  assert.ok(result.unsupportedRatings.some((entry) => entry.reason === 'rating-below-3-without-finding'));
  assert.equal(result.passed, false);
});

test('a rating of 5 without a recorded test can be required to fail', () => {
  const item = review();
  item.cases[0].testsPerformed = [];
  const lenient = evaluateAestheticReview(item, { expectedConfigHash: 'abc' });
  assert.equal(lenient.passed, true);
  const strict = evaluateAestheticReview(item, { expectedConfigHash: 'abc', requireTestEvidence: true });
  assert.equal(strict.passed, false);
  assert.ok(strict.unsupportedRatings.some((entry) => entry.reason === 'rating-5-without-recorded-test'));
});

test('the implementer cannot approve their own aesthetic review', () => {
  const result = evaluateAestheticReview(review({ implementer: 'aesthetic-critic' }), { expectedConfigHash: 'abc' });
  assert.equal(result.independent, false);
  assert.equal(result.passed, false);
});

test('stale configuration, missing cases, and parked system-wide deviations block approval', () => {
  const stale = evaluateAestheticReview(review(), { expectedConfigHash: 'different' });
  assert.equal(stale.configMatches, false);
  assert.equal(stale.passed, false);

  const incomplete = evaluateAestheticReview(review(), { expectedConfigHash: 'abc', expectedCaseKeys: ['home__desktop__default', 'home__mobile__default'] });
  assert.deepEqual(incomplete.missingCases, ['home__mobile__default']);
  assert.equal(incomplete.passed, false);

  const parked = review();
  parked.cases[0].residualDeviations = [{ severity: 'minor', region: 'buttons', description: 'Radius does not nest', systemWide: true, acceptedReason: 'Cosmetic' }];
  const result = evaluateAestheticReview(parked, { expectedConfigHash: 'abc' });
  assert.equal(result.parkedSystemWideDeviations.length, 1);
  assert.equal(result.passed, false);
});
