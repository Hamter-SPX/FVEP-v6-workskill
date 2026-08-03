import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from './io.mjs';
import { enumerateCases } from './config.mjs';

export const AESTHETIC_DIMENSIONS = Object.freeze([
  'compositionalBalance', 'craftPrecision', 'colorSystem', 'typographicSystem',
  'spatialRhythm', 'motionQuality', 'brandExpression', 'copyVoice'
]);

export const REQUIRED_AESTHETIC_DIMENSIONS = Object.freeze(AESTHETIC_DIMENSIONS.filter((name) => name !== 'motionQuality'));

/** Default weights from references/aesthetic-scoring-anchors.md. */
export const DEFAULT_AESTHETIC_WEIGHTS = Object.freeze({
  compositionalBalance: 1.5,
  typographicSystem: 1.5,
  spatialRhythm: 1.5,
  colorSystem: 1.5,
  craftPrecision: 1,
  motionQuality: 1,
  brandExpression: 1,
  copyVoice: 1
});

const RECOGNIZED_TESTS = new Set(['blur', 'five-second', 'greyscale', 'alignment-audit', 'removal', 'inventory', 'interval', 'substitution', 'content-pressure']);

function ratingValue(value) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 5) return Number.NaN;
  return number;
}

export function validateAestheticReview(review) {
  if (!review || typeof review !== 'object' || Array.isArray(review)) throw new TypeError('Aesthetic review must be an object.');
  if (!review.reviewer || typeof review.reviewer !== 'string') throw new TypeError('Aesthetic review requires reviewer.');
  if (!['approved', 'changes-requested', 'rejected'].includes(review.decision)) throw new TypeError('Aesthetic review decision must be approved, changes-requested, or rejected.');
  if (!review.reviewedAt || !Number.isFinite(new Date(review.reviewedAt).valueOf())) throw new TypeError('Aesthetic review requires a valid reviewedAt timestamp.');
  if (!Array.isArray(review.cases) || review.cases.length === 0) throw new TypeError('Aesthetic review requires at least one case.');
  const keys = new Set();
  for (const [index, item] of review.cases.entries()) {
    if (!item.key || typeof item.key !== 'string') throw new TypeError(`Aesthetic review case ${index} requires key.`);
    if (keys.has(item.key)) throw new Error(`Duplicate aesthetic review case: ${item.key}`);
    keys.add(item.key);
    if (!item.ratings || typeof item.ratings !== 'object') throw new TypeError(`Aesthetic review case ${item.key} requires ratings.`);
    for (const dimension of REQUIRED_AESTHETIC_DIMENSIONS) {
      const value = ratingValue(item.ratings[dimension]);
      if (value === null || Number.isNaN(value)) throw new RangeError(`Aesthetic review case ${item.key} rating ${dimension} must be a number between 0 and 5.`);
    }
    if (Number.isNaN(ratingValue(item.ratings.motionQuality))) throw new RangeError(`Aesthetic review case ${item.key} rating motionQuality must be null or a number between 0 and 5.`);
    for (const extra of Object.keys(item.ratings)) {
      if (!AESTHETIC_DIMENSIONS.includes(extra)) throw new TypeError(`Aesthetic review case ${item.key} has an unrecognized dimension: ${extra}.`);
    }
    if (item.blockers !== undefined && !Array.isArray(item.blockers)) throw new TypeError(`Aesthetic review case ${item.key} blockers must be an array.`);
    for (const finding of item.findings ?? []) {
      if (!AESTHETIC_DIMENSIONS.includes(finding?.dimension)) throw new TypeError(`Aesthetic review case ${item.key} has a finding with an unrecognized dimension.`);
      for (const field of ['region', 'expected', 'observed']) {
        if (!finding?.[field] || typeof finding[field] !== 'string') throw new TypeError(`Aesthetic review case ${item.key} findings require ${field}.`);
      }
    }
    for (const test of item.testsPerformed ?? []) {
      if (!RECOGNIZED_TESTS.has(String(test))) throw new TypeError(`Aesthetic review case ${item.key} names an unrecognized test: ${test}.`);
    }
  }
  return review;
}

/**
 * Scores an aesthetic review. Unlike a plain weighted mean, a dimension below the floor fails the
 * review outright, because averaging is how a single serious defect disappears into an acceptable number.
 */
export function evaluateAestheticReview(review, policy = {}) {
  validateAestheticReview(review);
  const weights = { ...DEFAULT_AESTHETIC_WEIGHTS, ...(policy.weights ?? {}) };
  const minScore = Number(policy.minScore ?? 80);
  const dimensionFloor = Number(policy.dimensionFloor ?? 3);
  const requireFindingsBelowFloor = policy.requireFindingsBelowFloor !== false;
  const requireTestEvidence = Boolean(policy.requireTestEvidence ?? false);
  const expectedConfigHash = policy.expectedConfigHash ?? null;
  const configMatches = expectedConfigHash ? review.configHash === expectedConfigHash : true;
  const expectedCaseKeys = [...new Set((policy.expectedCaseKeys ?? []).map(String))].sort();
  const reviewedCaseKeys = [...new Set(review.cases.map((item) => item.key))].sort();
  const reviewedSet = new Set(reviewedCaseKeys);
  const missingCases = expectedCaseKeys.filter((key) => !reviewedSet.has(key));
  const unexpectedCases = expectedCaseKeys.length ? reviewedCaseKeys.filter((key) => !expectedCaseKeys.includes(key)) : [];
  const decisionApproved = review.decision === 'approved';
  const maxAgeHours = Number(policy.maxAgeHours ?? 24);
  const ageHours = (Date.now() - new Date(review.reviewedAt).valueOf()) / 3_600_000;
  const fresh = !Number.isFinite(maxAgeHours) || maxAgeHours <= 0 || ageHours <= maxAgeHours;
  const independent = !review.implementer || review.implementer !== review.reviewer;

  const floorViolations = [];
  const unsupportedRatings = [];
  const cases = review.cases.map((item) => {
    let weighted = 0;
    let totalWeight = 0;
    const dimensions = {};
    for (const dimension of AESTHETIC_DIMENSIONS) {
      const value = ratingValue(item.ratings[dimension]);
      if (value === null) { dimensions[dimension] = null; continue; }
      const weight = Number(weights[dimension] ?? 1);
      totalWeight += weight;
      weighted += (value / 5) * weight;
      dimensions[dimension] = value;
      if (value < dimensionFloor) floorViolations.push({ key: item.key, dimension, value, floor: dimensionFloor });
      if (requireFindingsBelowFloor && value < 3 && !(item.findings ?? []).some((finding) => finding.dimension === dimension)) {
        unsupportedRatings.push({ key: item.key, dimension, value, reason: 'rating-below-3-without-finding' });
      }
      if (requireTestEvidence && value === 5 && !(item.testsPerformed ?? []).length) {
        unsupportedRatings.push({ key: item.key, dimension, value, reason: 'rating-5-without-recorded-test' });
      }
    }
    const systemWide = (item.residualDeviations ?? []).filter((deviation) => deviation.systemWide === true);
    return {
      key: item.key,
      score: totalWeight ? Number((((weighted / totalWeight) * 100)).toFixed(2)) : 0,
      dimensions,
      blockers: item.blockers ?? [],
      findings: item.findings ?? [],
      systemWideDeviations: systemWide,
      testsPerformed: item.testsPerformed ?? [],
      notes: item.notes ?? []
    };
  });

  const score = cases.length ? Number((cases.reduce((sum, item) => sum + item.score, 0) / cases.length).toFixed(2)) : 0;
  const blockers = cases.flatMap((item) => item.blockers.map((blocker) => ({ key: item.key, blocker })));
  const blockingFindings = cases.flatMap((item) => item.findings.filter((finding) => finding.severity === 'blocker').map((finding) => ({ key: item.key, ...finding })));
  const parkedSystemWide = cases.flatMap((item) => item.systemWideDeviations.map((deviation) => ({ key: item.key, ...deviation })));
  const caseDecisionFailures = review.cases.filter((item) => item.decision && item.decision !== 'accepted').map((item) => ({ key: item.key, decision: item.decision }));

  const passed = decisionApproved
    && configMatches
    && fresh
    && independent
    && missingCases.length === 0
    && blockers.length === 0
    && blockingFindings.length === 0
    && floorViolations.length === 0
    && unsupportedRatings.length === 0
    && parkedSystemWide.length === 0
    && caseDecisionFailures.length === 0
    && score >= minScore;

  return {
    schemaVersion: 1,
    passed,
    score,
    minScore,
    dimensionFloor,
    evidenceCount: cases.length,
    decision: review.decision,
    decisionApproved,
    configMatches,
    fresh,
    independent,
    ageHours: Number(ageHours.toFixed(2)),
    expectedCaseCount: expectedCaseKeys.length,
    reviewedCaseCount: reviewedCaseKeys.length,
    missingCases,
    unexpectedCases,
    blockers,
    blockingFindings,
    floorViolations,
    unsupportedRatings,
    parkedSystemWideDeviations: parkedSystemWide,
    caseDecisionFailures,
    cases,
    reviewer: review.reviewer,
    reviewedAt: review.reviewedAt
  };
}

export async function loadAestheticReview(config, expectedConfigHash = null) {
  if (!config.aesthetics?.reviewPath) return null;
  const reviewPath = path.resolve(config.baseDir, config.aesthetics.reviewPath);
  if (!await fileExists(reviewPath)) return { path: reviewPath, missing: true, evaluation: null };
  const review = JSON.parse(await fs.readFile(reviewPath, 'utf8'));
  try {
    const evaluation = evaluateAestheticReview(review, {
      minScore: config.aesthetics.minScore,
      dimensionFloor: config.aesthetics.dimensionFloor,
      maxAgeHours: config.aesthetics.maxAgeHours,
      requireTestEvidence: config.aesthetics.requireTestEvidence,
      expectedConfigHash: config.aesthetics.requireMatchingConfigHash ? expectedConfigHash : null,
      expectedCaseKeys: enumerateCases(config, { mode: 'current' }).map((item) => item.key),
      weights: config.aesthetics.weights
    });
    return { path: reviewPath, missing: false, review, evaluation };
  } catch (error) {
    return {
      path: reviewPath,
      missing: false,
      review,
      evaluation: null,
      error: error.message,
      invalid: true
    };
  }
}
