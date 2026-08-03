import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from './io.mjs';
import { enumerateCases } from './config.mjs';

export const REVIEW_DIMENSIONS = Object.freeze(['hierarchy', 'composition', 'typography', 'colorSurface', 'contentFidelity', 'assetFidelity', 'responsiveComposition', 'interactionClarity']);
const DEFAULT_WEIGHTS = Object.freeze({ hierarchy: 1.5, composition: 1.5, typography: 1, colorSurface: 1, contentFidelity: 1.5, assetFidelity: 1, responsiveComposition: 1.5, interactionClarity: 1 });

export function validateSemanticVisualReview(review) {
  if (!review || typeof review !== 'object' || Array.isArray(review)) throw new TypeError('Semantic visual review must be an object.');
  if (!review.reviewer || typeof review.reviewer !== 'string') throw new TypeError('Semantic visual review requires reviewer.');
  if (!['approved', 'changes-requested', 'rejected'].includes(review.decision)) throw new TypeError('Semantic visual review decision must be approved, changes-requested, or rejected.');
  if (!review.reviewedAt || !Number.isFinite(new Date(review.reviewedAt).valueOf())) throw new TypeError('Semantic visual review requires a valid reviewedAt timestamp.');
  if (!Array.isArray(review.cases) || review.cases.length === 0) throw new TypeError('Semantic visual review requires at least one case.');
  const keys = new Set();
  for (const [index, item] of review.cases.entries()) {
    if (!item.key || typeof item.key !== 'string') throw new TypeError(`Review case ${index} requires key.`);
    if (keys.has(item.key)) throw new Error(`Duplicate semantic review case: ${item.key}`); keys.add(item.key);
    if (!item.ratings || typeof item.ratings !== 'object') throw new TypeError(`Review case ${item.key} requires ratings.`);
    for (const dimension of REVIEW_DIMENSIONS) {
      const value = Number(item.ratings[dimension]);
      if (!Number.isFinite(value) || value < 0 || value > 5) throw new RangeError(`Review case ${item.key} rating ${dimension} must be between 0 and 5.`);
    }
    if (item.blockers !== undefined && !Array.isArray(item.blockers)) throw new TypeError(`Review case ${item.key} blockers must be an array.`);
  }
  return review;
}

export function evaluateSemanticVisualReview(review, policy = {}) {
  validateSemanticVisualReview(review);
  const weights = { ...DEFAULT_WEIGHTS, ...(policy.weights ?? {}) };
  const minScore = Number(policy.minScore ?? 85);
  const expectedConfigHash = policy.expectedConfigHash ?? null;
  const configMatches = expectedConfigHash ? review.configHash === expectedConfigHash : true;
  const expectedCaseKeys = [...new Set((policy.expectedCaseKeys ?? []).map(String))].sort();
  const reviewedCaseKeys = [...new Set(review.cases.map((item) => item.key))].sort();
  const reviewedSet = new Set(reviewedCaseKeys); const expectedSet = new Set(expectedCaseKeys);
  const missingCases = expectedCaseKeys.filter((key) => !reviewedSet.has(key));
  const unexpectedCases = expectedCaseKeys.length ? reviewedCaseKeys.filter((key) => !expectedSet.has(key)) : [];
  const decisionApproved = review.decision === 'approved';
  const maxAgeHours = Number(policy.maxAgeHours ?? 24);
  const ageHours = (Date.now() - new Date(review.reviewedAt).valueOf()) / 3_600_000;
  const fresh = !Number.isFinite(maxAgeHours) || maxAgeHours <= 0 || ageHours <= maxAgeHours;
  const cases = review.cases.map((item) => {
    let weighted = 0; let totalWeight = 0;
    for (const dimension of REVIEW_DIMENSIONS) { const weight = Number(weights[dimension] ?? 1); totalWeight += weight; weighted += (Number(item.ratings[dimension]) / 5) * weight; }
    return { key: item.key, score: totalWeight ? (weighted / totalWeight) * 100 : 0, blockers: item.blockers ?? [], notes: item.notes ?? [] };
  });
  const score = cases.length ? cases.reduce((sum, item) => sum + item.score, 0) / cases.length : 0;
  const blockers = cases.flatMap((item) => item.blockers.map((blocker) => ({ key: item.key, blocker })));
  const caseDecisionFailures = review.cases.filter((item) => item.decision && item.decision !== 'accepted').map((item) => ({ key: item.key, decision: item.decision }));
  return {
    schemaVersion: 2,
    passed: decisionApproved && configMatches && fresh && missingCases.length === 0 && blockers.length === 0 && caseDecisionFailures.length === 0 && score >= minScore,
    score: Number(score.toFixed(2)), minScore, evidenceCount: cases.length,
    decision: review.decision, decisionApproved, configMatches, fresh, ageHours: Number(ageHours.toFixed(2)),
    expectedCaseCount: expectedCaseKeys.length, reviewedCaseCount: reviewedCaseKeys.length,
    missingCases, unexpectedCases, blockers, caseDecisionFailures, cases,
    reviewer: review.reviewer, reviewedAt: review.reviewedAt
  };
}

export async function loadSemanticVisualReview(config, expectedConfigHash = null) {
  if (!config.manualReview?.path) return null;
  const reviewPath = path.resolve(config.baseDir, config.manualReview.path);
  if (!await fileExists(reviewPath)) return { path: reviewPath, missing: true, evaluation: null };
  const review = JSON.parse(await fs.readFile(reviewPath, 'utf8'));
  const evaluation = evaluateSemanticVisualReview(review, {
    minScore: config.manualReview.minScore,
    maxAgeHours: config.manualReview.maxAgeHours,
    expectedConfigHash: config.manualReview.requireMatchingConfigHash ? expectedConfigHash : null,
    expectedCaseKeys: enumerateCases(config, { mode: 'current' }).map((item) => item.key),
    weights: config.manualReview.weights
  });
  return { path: reviewPath, missing: false, review, evaluation };
}
