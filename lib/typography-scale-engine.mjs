import { finalizeProcessAudit, processFinding } from './process-audit-utils.mjs';

const COMFORTABLE_MEASURE = Object.freeze({ min: 45, max: 75, hardMax: 85, hardMin: 30 });

function round(value, digits = 3) { return Number(Number(value).toFixed(digits)); }

function uniqueSizes(sizes = []) {
  return [...new Set(sizes.map(Number).filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b);
}

/**
 * Derives the step ratios of a type scale and reports the pairs that fall below the
 * distinguishable floor described in references/typographic-system-quality.md.
 */
export function analyzeScaleSteps(sizes = [], minStepRatio = 1.12) {
  const ordered = uniqueSizes(sizes);
  const steps = [];
  for (let index = 1; index < ordered.length; index += 1) {
    const ratio = ordered[index] / ordered[index - 1];
    steps.push({ from: ordered[index - 1], to: ordered[index], ratio: round(ratio), distinguishable: ratio >= minStepRatio });
  }
  const ratios = steps.map((step) => step.ratio);
  const meanRatio = ratios.length ? ratios.reduce((sum, value) => sum + value, 0) / ratios.length : null;
  const consistency = ratios.length > 1 && meanRatio
    ? round(Math.max(0, 100 - (Math.sqrt(ratios.reduce((sum, value) => sum + (value - meanRatio) ** 2, 0) / ratios.length) / meanRatio) * 100), 2)
    : 100;
  return { sizes: ordered, steps, meanRatio: meanRatio === null ? null : round(meanRatio), consistency, nearMisses: steps.filter((step) => !step.distinguishable) };
}

/** Expected line-height multiplier for a size, used to detect a constant multiplier applied across the scale. */
export function expectedLineHeight(sizePx) {
  const size = Number(sizePx);
  if (!Number.isFinite(size) || size <= 0) return null;
  if (size >= 40) return 1.15;
  if (size >= 28) return 1.25;
  if (size >= 20) return 1.35;
  if (size >= 14) return 1.55;
  return 1.45;
}

export function analyzeTypography(input = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const minStepRatio = Number(policy.minStepRatio ?? 1.12);
  const maxSizes = Number(policy.maxSizes ?? 7);
  const maxFamilies = Number(policy.maxFamilies ?? 2);
  const lineHeightTolerance = Number(policy.lineHeightTolerance ?? 0.18);

  const roles = Array.isArray(input.roles) ? input.roles : [];
  const declaredSizes = Array.isArray(input.sizes) && input.sizes.length ? input.sizes : roles.map((role) => role.sizePx);
  const scale = analyzeScaleSteps(declaredSizes, minStepRatio);

  if (scale.sizes.length >= 2) {
    evidenceCount += 1;
    for (const step of scale.nearMisses) {
      findings.push(processFinding('TYPE_STEP_INDISTINGUISHABLE', 'medium', `Type sizes ${step.from} and ${step.to} differ by a ratio of ${step.ratio}, below the distinguishable floor of ${minStepRatio}.`, { remediation: 'Merge the two steps or widen the interval so the difference reads as a level rather than an error.' }));
    }
    if (scale.sizes.length > maxSizes) {
      findings.push(processFinding('TYPE_SCALE_TOO_LARGE', 'medium', `${scale.sizes.length} distinct sizes are in use but policy allows ${maxSizes}. A scale this large is applied per component rather than by role.`, { detail: scale.sizes }));
    }
  } else {
    findings.push(processFinding('TYPE_SCALE_MISSING', 'high', 'Fewer than two type sizes were supplied, so the scale could not be assessed.'));
  }

  if (!roles.length) {
    findings.push(processFinding('TYPE_ROLES_UNDEFINED', 'high', 'No typographic roles are declared. A scale without roles drifts, because the next author must guess which size means which level.'));
  } else {
    evidenceCount += 1;
    const namedSizes = new Set(roles.map((role) => Number(role.sizePx)).filter(Number.isFinite));
    const unassigned = scale.sizes.filter((size) => !namedSizes.has(size));
    if (unassigned.length) {
      findings.push(processFinding('TYPE_SIZE_WITHOUT_ROLE', 'medium', 'Sizes appear in the system without a named role.', { detail: unassigned }));
    }
    const multipliers = [];
    for (const role of roles) {
      const size = Number(role.sizePx);
      const lineHeight = Number(role.lineHeight);
      if (!Number.isFinite(size) || !Number.isFinite(lineHeight) || lineHeight <= 0) continue;
      const multiplier = lineHeight > 4 ? lineHeight / size : lineHeight;
      multipliers.push(round(multiplier));
      const expected = expectedLineHeight(size);
      if (expected !== null && Math.abs(multiplier - expected) > lineHeightTolerance) {
        findings.push(processFinding('TYPE_LINE_HEIGHT_OFF_CURVE', 'low', `Role ${role.name ?? size} uses a line-height multiplier of ${round(multiplier)} where roughly ${expected} suits ${size}px.`, { path: role.name ? String(role.name) : undefined }));
      }
    }
    if (multipliers.length >= 3 && new Set(multipliers).size === 1) {
      findings.push(processFinding('TYPE_LINE_HEIGHT_CONSTANT', 'medium', 'A single line-height multiplier is applied across the whole scale. Line height must tighten as size grows and loosen as it shrinks.'));
    }
    const weights = [...new Set(roles.map((role) => Number(role.weight)).filter(Number.isFinite))].sort((a, b) => a - b);
    for (let index = 1; index < weights.length; index += 1) {
      if (weights[index] - weights[index - 1] < 100) {
        findings.push(processFinding('TYPE_WEIGHT_STEP_INDISTINGUISHABLE', 'low', `Weights ${weights[index - 1]} and ${weights[index]} differ by less than one full step and will read as a rendering artifact.`));
      }
    }
  }

  const families = [...new Set((input.families ?? roles.map((role) => role.family)).filter(Boolean).map(String))];
  if (families.length > maxFamilies) {
    findings.push(processFinding('TYPE_FAMILY_COUNT_HIGH', 'medium', `${families.length} type families are in use but policy allows ${maxFamilies}.`, { detail: families }));
  }

  const measures = Array.isArray(input.measures) ? input.measures : [];
  const measureResults = [];
  for (const measure of measures) {
    const characters = Number(measure.characters);
    if (!Number.isFinite(characters)) continue;
    evidenceCount += 1;
    const withinComfort = characters >= COMFORTABLE_MEASURE.min && characters <= COMFORTABLE_MEASURE.max;
    measureResults.push({ region: String(measure.region ?? 'unnamed'), characters: round(characters, 1), withinComfort });
    if (characters > COMFORTABLE_MEASURE.hardMax) {
      findings.push(processFinding('TYPE_MEASURE_TOO_WIDE', 'medium', `Measure in ${measure.region ?? 'a region'} is ${round(characters, 1)} characters, beyond the ${COMFORTABLE_MEASURE.hardMax}-character limit where line return begins to fail.`, { path: measure.region ? String(measure.region) : undefined, remediation: 'Constrain the container by a maximum width expressed in characters.' }));
    } else if (!withinComfort && characters > COMFORTABLE_MEASURE.max) {
      findings.push(processFinding('TYPE_MEASURE_WIDE', 'low', `Measure in ${measure.region ?? 'a region'} is ${round(characters, 1)} characters, above the comfortable reading range.`));
    } else if (characters < COMFORTABLE_MEASURE.hardMin) {
      findings.push(processFinding('TYPE_MEASURE_TOO_NARROW', 'low', `Measure in ${measure.region ?? 'a region'} is ${round(characters, 1)} characters, narrow enough to force ragged spacing.`));
    }
  }

  if (input.comparesNumbers === true && input.tabularFigures !== true) {
    findings.push(processFinding('TYPE_FIGURES_NOT_TABULAR', 'medium', 'Numbers are compared or updated in place without tabular figures, so columns will shimmer and misalign.'));
  }
  if (input.syntheticWeights === true) {
    findings.push(processFinding('TYPE_SYNTHETIC_WEIGHT', 'medium', 'Synthesized bold or italic is in use. Load the real weight or change the design.'));
  }
  if (input.fallbackMetricsMatched === false) {
    findings.push(processFinding('TYPE_FALLBACK_METRICS_MISMATCHED', 'low', 'Fallback metrics do not match the web font, so layout will shift on font load.'));
  }

  const report = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount > 0 ? 100 : 0 });
  return { ...report, scale, families, measures: measureResults, roleCount: roles.length };
}
