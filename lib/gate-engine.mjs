import { scoreQualityGates } from './quality-model.mjs';
import { combineCoverage, evaluateCaseCoverage } from './evidence-coverage.mjs';

function severityScore(comparisons) {
  if (!comparisons.length) return 0;
  const values = comparisons.map((entry) => {
    if (Number.isFinite(entry.perceptual?.similarity)) return entry.perceptual.similarity * 100;
    return entry.severity === 'accepted' ? 100 : entry.severity === 'minor' ? 85 : entry.severity === 'major' ? 50 : 0;
  });
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function missingGate(hard = false) { return { status: 'skipped', score: 0, evidenceCount: 0, evidenceConfidence: 0, hard }; }
function notApplicableGate() { return { status: 'not-applicable', score: null, evidenceCount: 0, evidenceConfidence: null, hard: false }; }

/** Shapes an aesthetic audit report into a gate. A report that did not pass never reports pass. */
export function toAestheticGate(report, options = {}) {
  if (!report) return missingGate(Boolean(options.hard));
  const severity = report.hardFailures.length ? 'fail' : report.warnings.length ? 'warning' : 'pass';
  return {
    status: report.passed ? severity : severity === 'pass' ? 'warning' : severity,
    score: Number(report.score ?? 0),
    evidenceCount: Number(report.evidenceCount ?? 0),
    evidenceConfidence: Number(report.evidenceConfidence ?? 0),
    hard: Boolean(options.hard),
    blockers: report.hardFailures.length,
    warnings: report.warnings.length
  };
}

function coverageFor(entries, policy) {
  const expectedCaseKeys = policy.expectedCaseKeys ?? [];
  return expectedCaseKeys.length ? evaluateCaseCoverage(entries, expectedCaseKeys) : null;
}

function coverageConfidence(coverage, fallback = 100) {
  return coverage ? coverage.confidence : fallback;
}

function attachCoverage(gate, coverage) {
  if (!coverage) return gate;
  return { ...gate, coverage, evidenceConfidence: coverage.confidence };
}

function runtimeEvidence(sections) {
  const all = [];
  for (const name of ['capture', 'inspection', 'accessibility', 'performance', 'interaction', 'stateCrawler', 'tokens']) {
    const section = sections[name];
    const entries = Array.isArray(section) ? section : Array.isArray(section?.current) ? section.current : [];
    for (const entry of entries) if (entry.runtimeSummary) all.push(entry);
  }
  const unique = new Map(all.map((entry) => [entry.runtimePath ?? `${entry.key}:${entry.startedAt ?? ''}`, entry]));
  return [...unique.values()];
}

export function buildQualityGateSummary(sections = {}, policy = {}) {
  const applicability = policy.applicability ?? {};
  const comparisons = sections.comparison?.comparisons ?? [];
  const verifiedComparisons = comparisons.filter((item) => !['unverified', 'not-applicable'].includes(item.severity));
  const unverifiedCount = comparisons.length - verifiedComparisons.length;
  let visual = verifiedComparisons.length ? {
    status: (sections.comparison.blockers ?? verifiedComparisons.filter((item) => item.severity === 'blocker').length) > 0 || (sections.comparison.majors ?? verifiedComparisons.filter((item) => item.severity === 'major').length) > 0 ? 'fail'
      : (sections.comparison.minors ?? verifiedComparisons.filter((item) => item.severity === 'minor').length) > 0 || unverifiedCount > 0 ? 'warning' : 'pass',
    score: severityScore(verifiedComparisons), evidenceCount: verifiedComparisons.length, hard: policy.mode === 'exact-reference'
  } : missingGate(policy.mode === 'exact-reference');
  if (visual.status !== 'skipped') {
    const visualCoverage = coverageFor(verifiedComparisons, policy);
    if (visualCoverage) {
      visual.coverage = visualCoverage;
      visual.evidenceConfidence = visualCoverage.confidence;
    } else {
      const comparisonTotal = Math.max(verifiedComparisons.length + unverifiedCount, Number(sections.comparison?.total ?? 0));
      visual.evidenceConfidence = comparisonTotal > 0 ? (verifiedComparisons.length / comparisonTotal) * 100 : 0;
    }
  }
  const manualVisual = sections.manualReview?.evaluation ?? null;
  if (manualVisual) {
    const manualStatus = manualVisual.passed ? 'pass' : 'fail';
    const manualCoverage = coverageFor(manualVisual.cases ?? [], policy);
    const manualFreshnessConfidence = manualVisual.configMatches && manualVisual.fresh ? 100 : 25;
    const manualConfidence = Math.min(manualFreshnessConfidence, coverageConfidence(manualCoverage));
    if (visual.status === 'skipped') {
      if (policy.mode === 'exact-reference') {
        visual = { status: 'fail', score: 0, evidenceCount: Number(manualVisual.evidenceCount ?? 0), evidenceConfidence: 0, hard: true, reason: 'exact-reference-requires-automated-comparison', manualCoverage };
      } else {
        visual = { status: manualStatus, score: Number(manualVisual.score ?? 0), evidenceCount: Number(manualVisual.evidenceCount ?? 0), evidenceConfidence: manualConfidence, coverage: manualCoverage, hard: true };
      }
    } else {
      visual.score = visual.score * 0.6 + Number(manualVisual.score ?? 0) * 0.4;
      visual.evidenceCount += Number(manualVisual.evidenceCount ?? 0);
      visual.evidenceConfidence = Math.max(Number(visual.evidenceConfidence ?? 0), manualConfidence);
      if (manualCoverage) visual.manualCoverage = manualCoverage;
      if (manualStatus === 'fail') visual.status = 'fail';
    }
    if (visual.evidenceConfidence === undefined) visual.evidenceConfidence = manualConfidence;
  }
  const tokenComparisons = sections.tokens?.comparisons ?? [];
  if (visual.status !== 'skipped' && tokenComparisons.length) {
    const averageTokenSimilarity = tokenComparisons.reduce((sum, item) => sum + Number(item.similarityScore ?? 0), 0) / tokenComparisons.length;
    visual.score = visual.score * 0.85 + averageTokenSimilarity * 0.15;
    if (tokenComparisons.some((item) => Number(item.driftScore ?? 0) > Number(policy.maxTokenDriftScore ?? 20)) && visual.status === 'pass') visual.status = 'warning';
    visual.evidenceCount += tokenComparisons.length;
  }
  if (policy.baselineRequired) {
    const baseline = sections.baseline;
    if (!baseline?.valid) {
      visual = { ...visual, status: 'fail', hard: true, evidenceConfidence: Math.min(Number(visual.evidenceConfidence ?? 0), baseline ? 50 : 0), baselineStatus: baseline?.missingManifest ? 'missing' : 'invalid' };
    } else {
      visual.evidenceCount += 1;
      visual.baselineStatus = 'valid';
    }
  }

  const inspection = sections.inspection ?? [];
  const breakpointEvidence = sections.breakpoints?.enabled ? sections.breakpoints : null;
  const responsiveEvidenceCount = inspection.length + (breakpointEvidence ? 1 : 0);
  const responsiveFailure = inspection.some((item) => item.ok === false || item.horizontalOverflow || (item.blockingOverlapCount ?? 0) > 0) || Number(breakpointEvidence?.overflowSampleCount ?? 0) > 0;
  const responsiveCoverage = coverageFor(inspection, policy);
  const responsive = responsiveEvidenceCount ? attachCoverage({
    status: responsiveFailure ? 'fail' : 'pass',
    score: responsiveFailure ? 0 : 100,
    evidenceCount: responsiveEvidenceCount, evidenceConfidence: coverageConfidence(responsiveCoverage), hard: true
  }, responsiveCoverage) : missingGate(true);

  const accessibilityEvidence = sections.accessibility ?? [];
  const accessibilityCoverage = coverageFor(accessibilityEvidence, policy);
  const accessibility = accessibilityEvidence.length ? attachCoverage({
    status: accessibilityEvidence.some((item) => item.ok === false || (item.blockingViolationCount ?? 0) > 0) ? 'fail' : accessibilityEvidence.some((item) => (item.violationCount ?? 0) > 0) ? 'warning' : 'pass',
    score: accessibilityEvidence.length ? (accessibilityEvidence.filter((item) => item.ok !== false && (item.blockingViolationCount ?? 0) === 0).length / accessibilityEvidence.length) * 100 : 0,
    evidenceCount: accessibilityEvidence.length, evidenceConfidence: coverageConfidence(accessibilityCoverage), hard: true
  }, accessibilityCoverage) : missingGate(true);

  const runtimeItems = runtimeEvidence(sections);
  const runtimeCoverage = coverageFor(runtimeItems, policy);
  const runtime = runtimeItems.length ? attachCoverage({
    status: runtimeItems.some((item) => item.runtimeSummary?.status === 'fail') ? 'fail' : 'pass',
    score: (runtimeItems.filter((item) => item.runtimeSummary?.status === 'pass').length / runtimeItems.length) * 100,
    evidenceCount: runtimeItems.length, evidenceConfidence: coverageConfidence(runtimeCoverage), hard: true
  }, runtimeCoverage) : missingGate(true);

  const engineeringEvidence = sections.engineering ?? [];
  const requiredEngineering = engineeringEvidence.filter((item) => item.required !== false);
  const engineering = engineeringEvidence.length ? {
    status: requiredEngineering.some((item) => !item.ok) ? 'fail' : engineeringEvidence.some((item) => !item.ok) ? 'warning' : 'pass',
    score: (engineeringEvidence.filter((item) => item.ok).length / engineeringEvidence.length) * 100,
    evidenceCount: engineeringEvidence.length, evidenceConfidence: 100, hard: true
  } : missingGate(true);

  const performanceEvidence = sections.performance ?? [];
  const performanceCoverage = coverageFor(performanceEvidence, policy);
  const measuredPerformanceConfidence = performanceEvidence.length ? performanceEvidence.reduce((sum, item) => sum + Number(item.budget?.confidence ?? 100), 0) / performanceEvidence.length : 0;
  const performance = performanceEvidence.length ? {
    status: performanceEvidence.some((item) => item.ok === false || (item.budget?.hardFailures ?? []).length) ? 'fail' : performanceEvidence.some((item) => (item.budget?.warnings ?? []).length) ? 'warning' : 'pass',
    score: performanceEvidence.reduce((sum, item) => sum + Number(item.budget?.score ?? (item.ok ? 100 : 0)), 0) / performanceEvidence.length,
    evidenceCount: performanceEvidence.length,
    evidenceConfidence: Number((measuredPerformanceConfidence * (performanceCoverage?.ratio ?? 1)).toFixed(2)),
    coverage: performanceCoverage, hard: false
  } : missingGate(false);

  const interactionEvidence = sections.interaction ?? [];
  const stateCrawlerEvidence = sections.stateCrawler ?? [];
  const interactionCount = interactionEvidence.length + stateCrawlerEvidence.length;
  const interactionFailure = interactionEvidence.some((item) => item.ok === false || (item.missingNameCount ?? 0) > 0) || stateCrawlerEvidence.some((item) => item.ok === false || (item.missingFocusFeedbackCount ?? 0) > 0);
  const interactionWarning = interactionEvidence.some((item) => (item.targetSizeViolationCount ?? 0) > 0) || stateCrawlerEvidence.some((item) => (item.missingHoverFeedbackCount ?? 0) > 0);
  const interactionFamilies = [];
  const interactionRequirements = policy.evidenceRequirements ?? {};
  if (interactionRequirements.interaction !== false) interactionFamilies.push({ name: 'interaction', required: true, coverage: coverageFor(interactionEvidence, policy) ?? { ratio: interactionEvidence.length ? 1 : 0, complete: interactionEvidence.length > 0, expected: 0, covered: interactionEvidence.length, missing: [] } });
  if (interactionRequirements.stateCrawler !== false) interactionFamilies.push({ name: 'state-crawler', required: true, coverage: coverageFor(stateCrawlerEvidence, policy) ?? { ratio: stateCrawlerEvidence.length ? 1 : 0, complete: stateCrawlerEvidence.length > 0, expected: 0, covered: stateCrawlerEvidence.length, missing: [] } });
  const interactionCoverage = combineCoverage(interactionFamilies);
  const interaction = interactionCount ? {
    status: interactionFailure ? 'fail' : interactionWarning ? 'warning' : 'pass',
    score: ((interactionEvidence.filter((item) => item.ok !== false).length + stateCrawlerEvidence.filter((item) => item.ok !== false).length) / interactionCount) * 100,
    evidenceCount: interactionCount, evidenceConfidence: interactionCoverage.confidence, coverage: interactionCoverage, hard: true
  } : missingGate(true);

  // The aesthetic gate is opt-in. Without evidence and without policy.aestheticRequired it stays
  // out of the score entirely, so runs that never asked for an aesthetic audit are not penalized.
  const aestheticReport = sections.aesthetics ?? null;
  const aestheticRequired = policy.aestheticRequired === true;
  let aesthetic = null;
  if (aestheticReport) {
    aesthetic = toAestheticGate(aestheticReport, { hard: aestheticRequired });
    const aestheticCoverage = coverageFor(aestheticReport.review?.cases ?? [], policy);
    if (aestheticCoverage) {
      aesthetic.coverage = aestheticCoverage;
      aesthetic.evidenceConfidence = Math.min(Number(aesthetic.evidenceConfidence ?? 100), aestheticCoverage.confidence);
    }
  } else if (aestheticRequired) {
    // Required-but-absent evidence must fail, not sit as a hard skip that can still
    // leave the aggregate score and confidence above policy floors.
    aesthetic = { status: 'fail', score: 0, evidenceCount: 0, evidenceConfidence: 0, hard: true };
  } else {
    aesthetic = notApplicableGate();
  }

  const gates = { visual, responsive, accessibility, runtime, engineering, performance, interaction, aesthetic };
  for (const name of Object.keys(gates)) if (applicability[name] === false) gates[name] = notApplicableGate();
  return scoreQualityGates(gates, policy);
}
