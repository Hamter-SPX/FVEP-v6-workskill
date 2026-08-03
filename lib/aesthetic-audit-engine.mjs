import fs from 'node:fs/promises';
import path from 'node:path';
import { finalizeProcessAudit, processFinding } from './process-audit-utils.mjs';
import { auditAestheticProfile } from './aesthetic-profile-engine.mjs';
import { analyzeColorSystem } from './color-harmony-engine.mjs';
import { analyzeTypography } from './typography-scale-engine.mjs';
import { analyzeSpacingSystem } from './spacing-rhythm-engine.mjs';
import { analyzeCraftPrecision } from './craft-precision-engine.mjs';
import { analyzeMotionSystem } from './motion-quality-engine.mjs';
import { analyzeStyleSignature } from './style-signature-engine.mjs';
import { evaluateAestheticReview, loadAestheticReview } from './aesthetic-review-engine.mjs';
import { enumerateCases } from './config.mjs';
import { fileExists } from './io.mjs';

/** Section weights for the mechanical half of the aesthetic score. */
export const DEFAULT_SECTION_WEIGHTS = Object.freeze({
  profile: 1,
  color: 1.5,
  typography: 1.5,
  spacing: 1.5,
  craft: 1,
  motion: 1,
  style: 1
});

const SECTION_RUNNERS = Object.freeze({
  profile: (input, policy) => auditAestheticProfile(input, policy),
  color: (input, policy) => analyzeColorSystem(input, policy),
  typography: (input, policy) => analyzeTypography(input, policy),
  spacing: (input, policy) => analyzeSpacingSystem(input, policy),
  craft: (input, policy) => analyzeCraftPrecision(input, policy),
  motion: (input, policy) => analyzeMotionSystem(input, policy),
  style: (input, policy) => analyzeStyleSignature(input, policy)
});

const MEASUREMENT_KEYS = Object.freeze(['color', 'typography', 'spacing', 'craft', 'motion', 'style']);

function round(value, digits = 2) { return Number(Number(value).toFixed(digits)); }

function reviewFailureReasons(review) {
  return [
    !review.decisionApproved ? `decision is ${review.decision}` : null,
    !review.configMatches ? 'review does not bind to the current artifact' : null,
    !review.fresh ? `review is ${review.ageHours} hours old` : null,
    !review.independent ? 'reviewer is also the implementer' : null,
    review.missingCases?.length ? `${review.missingCases.length} required cases were not reviewed` : null,
    review.blockers?.length ? `${review.blockers.length} blockers recorded` : null,
    review.floorViolations?.length ? `${review.floorViolations.length} dimensions below the floor of ${review.dimensionFloor}` : null,
    review.unsupportedRatings?.length ? `${review.unsupportedRatings.length} ratings lack the required supporting evidence` : null,
    review.parkedSystemWideDeviations?.length ? `${review.parkedSystemWideDeviations.length} system-wide deviations were parked as residual` : null,
    Number.isFinite(review.score) && Number.isFinite(review.minScore) && review.score < review.minScore
      ? `weighted score ${review.score} is below ${review.minScore}`
      : null
  ].filter(Boolean);
}

function foldReview(review, reviewWeight, findings) {
  return {
    weightedScore: reviewWeight * (Number(review.score ?? 0) / 100),
    assessedWeight: reviewWeight * (review.configMatches && review.fresh ? 1 : 0.25),
    evidenceCount: Number(review.evidenceCount ?? 0),
    finding: review.passed
      ? null
      : {
          ...processFinding(
            'AESTHETIC_REVIEW_NOT_APPROVED',
            'blocker',
            `The aesthetic review does not approve the current artifact: ${reviewFailureReasons(review).join('; ') || 'review failed'}.`,
            { detail: reviewFailureReasons(review) }
          ),
          section: 'review'
        }
  };
}

/**
 * Runs every mechanical aesthetic section that has input, then folds in the judgment review.
 * Sections without input are reported as skipped rather than scored, so a missing measurement
 * cannot raise the score.
 */
export function runAestheticAudit(input = {}, policy = {}) {
  const weights = { ...DEFAULT_SECTION_WEIGHTS, ...(policy.sectionWeights ?? {}) };
  const reviewWeight = Number(policy.reviewWeight ?? 3);
  const minScore = Number(policy.minScore ?? 80);
  const minConfidence = Number(policy.minConfidence ?? 70);

  const sections = {};
  const findings = [];
  let weightedScore = 0;
  let applicableWeight = 0;
  let assessedWeight = 0;
  let evidenceCount = 0;

  for (const [name, runner] of Object.entries(SECTION_RUNNERS)) {
    const sectionInput = input[name];
    const weight = Number(weights[name] ?? 1);
    if (sectionInput === undefined || sectionInput === null) {
      sections[name] = { status: 'skipped', score: null, evidenceCount: 0, evidenceConfidence: 0, findings: [] };
      applicableWeight += weight;
      continue;
    }
    let result;
    try { result = runner(sectionInput, policy[name] ?? {}); }
    catch (error) {
      result = finalizeProcessAudit([processFinding('AESTHETIC_SECTION_FAILED', 'blocker', `Aesthetic section ${name} failed to execute: ${error.message}`)], { schemaVersion: 1, evidenceCount: 0, evidenceConfidence: 0 });
    }
    sections[name] = result;
    applicableWeight += weight;
    assessedWeight += weight * (Number(result.evidenceConfidence ?? 0) / 100);
    weightedScore += weight * (Number(result.score ?? 0) / 100);
    evidenceCount += Number(result.evidenceCount ?? 0);
    for (const finding of result.findings ?? []) findings.push({ ...finding, section: name });
  }

  let review = null;
  if (policy.precomputedReview) {
    review = policy.precomputedReview;
    applicableWeight += reviewWeight;
    const folded = foldReview(review, reviewWeight, findings);
    weightedScore += folded.weightedScore;
    assessedWeight += folded.assessedWeight;
    evidenceCount += folded.evidenceCount;
    if (folded.finding) findings.push(folded.finding);
  } else if (input.review) {
    applicableWeight += reviewWeight;
    try {
      review = evaluateAestheticReview(input.review, policy.review ?? {});
      const folded = foldReview(review, reviewWeight, findings);
      weightedScore += folded.weightedScore;
      assessedWeight += folded.assessedWeight;
      evidenceCount += folded.evidenceCount;
      if (folded.finding) findings.push(folded.finding);
    } catch (error) {
      findings.push({ ...processFinding('AESTHETIC_REVIEW_INVALID', 'blocker', `Aesthetic review is invalid: ${error.message}`), section: 'review' });
    }
  } else if (policy.requireReview !== false) {
    applicableWeight += reviewWeight;
    findings.push({ ...processFinding('AESTHETIC_REVIEW_MISSING', 'high', 'No aesthetic review was supplied, so judgment-based dimensions are unverified.'), section: 'review' });
  }

  const score = applicableWeight > 0 ? round((weightedScore / applicableWeight) * 100) : 0;
  const evidenceConfidence = applicableWeight > 0 ? round((assessedWeight / applicableWeight) * 100) : 0;
  // Each section already subtracted its own finding penalties, so the aggregate reports the
  // weighted mean of section scores rather than charging the same findings a second time.
  const structure = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence });
  const passed = structure.ok && score >= minScore && evidenceConfidence >= minConfidence;

  return {
    ...structure,
    score,
    passed,
    minScore,
    minConfidence,
    sections,
    review,
    sectionWeights: weights,
    reviewWeight
  };
}

function parseCssPx(value) {
  const match = String(value ?? '').trim().match(/^(-?\d*\.?\d+)px$/i);
  return match ? Number(match[1]) : null;
}

/**
 * Maps a captured token profile into partial aesthetic measurement sections.
 * Used when `--tokens` supplies live token evidence without a hand-authored measurements file.
 */
export function aestheticInputFromTokenProfile(tokenPayload = {}) {
  const profile = tokenPayload.profile ?? tokenPayload;
  const colorValues = Object.keys(profile.colors ?? {});
  const backgroundValues = Object.keys(profile.backgroundColors ?? {});
  const radiiPx = [...new Set(Object.keys(profile.radii ?? {}).map(parseCssPx).filter((value) => Number.isFinite(value)))].sort((a, b) => a - b);
  const spacings = [...new Set(Object.keys(profile.spacings ?? {}).map(parseCssPx).filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b);
  const shadows = Object.keys(profile.shadows ?? {}).filter((value) => value && value !== 'none');
  const fontSizes = [...new Set(Object.keys(profile.fontSizes ?? {}).map(parseCssPx).filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b);
  const families = Object.keys(profile.fontFamilies ?? {});
  const input = {};

  if (backgroundValues.length || colorValues.length) {
    input.color = {
      neutrals: backgroundValues.length ? backgroundValues : colorValues,
      accents: colorValues.filter((value) => !backgroundValues.includes(value)).slice(0, 3),
      pairs: [],
      source: 'token-profile'
    };
  }
  if (fontSizes.length || families.length) {
    input.typography = {
      families,
      roles: fontSizes.map((sizePx, index) => ({
        name: `token-step-${index}`,
        sizePx,
        weight: 400,
        lineHeight: sizePx >= 24 ? 1.25 : 1.45
      })),
      source: 'token-profile'
    };
  }
  if (spacings.length) {
    input.spacing = {
      scale: spacings,
      observed: spacings.map((valuePx, index) => ({ region: `token-spacing-${index}`, valuePx })),
      source: 'token-profile'
    };
  }
  if (radiiPx.length || shadows.length) {
    input.craft = {
      radiiPx,
      shadows: shadows.slice(0, 6).map((value, index) => ({ name: `token-shadow-${index}`, value })),
      source: 'token-profile'
    };
  }
  return input;
}

/**
 * Loads profile, optional mechanical measurements, and the independent review from config paths,
 * then runs the aesthetic audit. Returns null when aesthetics are disabled so the quality gate
 * stays not-applicable for pipelines that never opted in.
 */
export async function loadAestheticEvidence(config, expectedConfigHash = null) {
  if (!config.aesthetics?.enabled) return null;

  const aesthetics = config.aesthetics;
  const input = {};
  const paths = { profilePath: null, measurementsPath: null, reviewPath: null, missing: [] };
  let measurementPolicy = {};
  const expectedCaseKeys = enumerateCases(config, { mode: 'current' }).map((item) => item.key);

  if (aesthetics.profilePath) {
    const profilePath = path.resolve(config.baseDir, aesthetics.profilePath);
    paths.profilePath = profilePath;
    if (await fileExists(profilePath)) {
      input.profile = JSON.parse(await fs.readFile(profilePath, 'utf8'));
    } else {
      paths.missing.push('profile');
    }
  } else {
    paths.missing.push('profile');
  }

  if (aesthetics.measurementsPath) {
    const measurementsPath = path.resolve(config.baseDir, aesthetics.measurementsPath);
    paths.measurementsPath = measurementsPath;
    if (await fileExists(measurementsPath)) {
      const measurements = JSON.parse(await fs.readFile(measurementsPath, 'utf8'));
      if (measurements.policy && typeof measurements.policy === 'object') measurementPolicy = measurements.policy;
      for (const key of MEASUREMENT_KEYS) {
        if (measurements[key] !== undefined) input[key] = measurements[key];
      }
      // Prefer the dedicated profilePath; fall back to an embedded profile in the measurements file.
      if (!input.profile && measurements.profile) input.profile = measurements.profile;
      if (!aesthetics.reviewPath && measurements.review) input.review = measurements.review;
    } else {
      paths.missing.push('measurements');
    }
  }

  const reviewEvidence = await loadAestheticReview(config, expectedConfigHash);
  if (aesthetics.reviewPath) {
    paths.reviewPath = reviewEvidence?.path ?? path.resolve(config.baseDir, aesthetics.reviewPath);
    if (!reviewEvidence || reviewEvidence.missing) paths.missing.push('review');
    else if (reviewEvidence.invalid) paths.missing.push('review');
    else if (reviewEvidence.review) input.review = reviewEvidence.review;
  }

  const reviewPolicy = {
    ...(measurementPolicy.review ?? {}),
    minScore: aesthetics.minScore,
    dimensionFloor: aesthetics.dimensionFloor,
    maxAgeHours: aesthetics.maxAgeHours,
    requireTestEvidence: aesthetics.requireTestEvidence,
    expectedConfigHash: aesthetics.requireMatchingConfigHash ? expectedConfigHash : null,
    expectedCaseKeys,
    weights: aesthetics.weights
  };

  // Prefer the already-evaluated review so case coverage and config binding are enforced once.
  const report = runAestheticAudit(input, {
    ...measurementPolicy,
    requireReview: aesthetics.requireReview,
    minScore: aesthetics.minScore,
    minConfidence: aesthetics.minConfidence,
    review: reviewPolicy,
    precomputedReview: reviewEvidence?.evaluation ?? null
  });

  if (reviewEvidence?.invalid) {
    const finding = processFinding('AESTHETIC_REVIEW_INVALID', 'blocker', `Aesthetic review is invalid: ${reviewEvidence.error}`);
    report.findings = [...report.findings, finding];
    report.hardFailures = [...report.hardFailures, finding];
    report.blockers = report.hardFailures;
    report.ok = false;
    report.passed = false;
    report.status = 'fail';
  }

  if (paths.missing.includes('profile')) {
    const finding = processFinding('AESTHETIC_PROFILE_MISSING', 'blocker', `Aesthetic profile is missing at ${paths.profilePath ?? 'aesthetics.profilePath'}.`);
    report.findings = [...report.findings, finding];
    report.hardFailures = [...report.hardFailures, finding];
    report.blockers = report.hardFailures;
    report.ok = false;
    report.passed = false;
    report.status = 'fail';
  }

  report.paths = paths;
  report.reviewEvidence = reviewEvidence;
  report.expectedCaseKeys = expectedCaseKeys;
  return report;
}
