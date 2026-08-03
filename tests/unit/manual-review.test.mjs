import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSemanticVisualReview, REVIEW_DIMENSIONS, validateSemanticVisualReview } from '../../lib/manual-review-engine.mjs';

// Freshness is evaluated against the default 24-hour window, so the fixture timestamp must stay relative.
const review = {
  schemaVersion: 1,
  reviewer: 'vision-agent',
  reviewedAt: new Date(Date.now() - 60_000).toISOString(),
  configHash: 'abc',
  decision: 'approved',
  cases: [{
    key: 'home__desktop__default',
    ratings: { hierarchy: 5, composition: 4, typography: 4, colorSurface: 4, contentFidelity: 5, assetFidelity: 4, responsiveComposition: 4, interactionClarity: 4 },
    blockers: [], notes: ['Strong hierarchy']
  }]
};

test('semantic visual review validates contract and produces weighted score', () => {
  assert.doesNotThrow(() => validateSemanticVisualReview(review));
  const result = evaluateSemanticVisualReview(review, { minScore: 80, expectedConfigHash: 'abc' });
  assert.equal(result.passed, true);
  assert.ok(result.score >= 80);
  assert.equal(result.evidenceCount, 1);
});

test('semantic visual review rejects stale configuration and blockers', () => {
  const blocked = structuredClone(review); blocked.cases[0].blockers = ['Primary CTA is obscured'];
  assert.equal(evaluateSemanticVisualReview(blocked, { expectedConfigHash: 'abc' }).passed, false);
  assert.equal(evaluateSemanticVisualReview(review, { expectedConfigHash: 'different' }).configMatches, false);
});

test('semantic visual review requires explicit approval and complete expected case coverage', () => {
  const review = {
    reviewer: 'Design Lead',
    reviewedAt: new Date().toISOString(),
    decision: 'approved',
    configHash: 'abc',
    cases: [{ key: 'home__desktop__default', ratings: Object.fromEntries(REVIEW_DIMENSIONS.map((key) => [key, 5])), blockers: [] }]
  };
  const incomplete = evaluateSemanticVisualReview(review, { expectedConfigHash: 'abc', expectedCaseKeys: ['home__desktop__default', 'home__mobile__default'] });
  assert.equal(incomplete.passed, false);
  assert.deepEqual(incomplete.missingCases, ['home__mobile__default']);
  const complete = evaluateSemanticVisualReview({ ...review, cases: [...review.cases, { key: 'home__mobile__default', ratings: Object.fromEntries(REVIEW_DIMENSIONS.map((key) => [key, 5])), blockers: [] }] }, { expectedConfigHash: 'abc', expectedCaseKeys: ['home__desktop__default', 'home__mobile__default'] });
  assert.equal(complete.passed, true);
  const rejected = evaluateSemanticVisualReview({ ...review, decision: 'changes-requested' }, { expectedConfigHash: 'abc', expectedCaseKeys: ['home__desktop__default'] });
  assert.equal(rejected.passed, false);
  assert.equal(rejected.decisionApproved, false);
});
