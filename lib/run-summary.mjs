import path from 'node:path';
import { buildQualityGateSummary } from './gate-engine.mjs';
import { buildRemediationPlan } from './remediation.mjs';
import { createRunProvenance } from './provenance.mjs';
import { renderRunDashboard } from './dashboard-report.mjs';
import { appendRunHistory } from './history-engine.mjs';
import { writeJsonAtomic, writeTextAtomic } from './io.mjs';
import { enumerateCases } from './config.mjs';

const failures = (items = []) => items.filter((item) => item.ok === false).length;

function summarizeManualReview(section) {
  if (!section) return null;
  if (section.missing) return { path: section.path, missing: true, status: 'missing', passed: false };
  if (!section.evaluation) return { path: section.path, missing: false, status: 'invalid-or-unassessed', passed: false };
  const evaluation = section.evaluation;
  return {
    path: section.path,
    missing: false,
    status: evaluation.passed ? 'pass' : 'fail',
    passed: Boolean(evaluation.passed),
    score: evaluation.score,
    minScore: evaluation.minScore,
    reviewer: evaluation.reviewer,
    reviewedAt: evaluation.reviewedAt,
    configMatches: evaluation.configMatches,
    fresh: evaluation.fresh,
    ageHours: evaluation.ageHours,
    blockers: evaluation.blockers?.length ?? 0,
    cases: evaluation.evidenceCount ?? 0
  };
}

function summarizeSections(sections) {
  const capture = sections.capture ? { total: sections.capture.length, failed: failures(sections.capture) } : null;
  const inspection = sections.inspection ? {
    total: sections.inspection.length,
    failed: failures(sections.inspection),
    overflowCases: sections.inspection.filter((item) => item.horizontalOverflow).length,
    overlapCases: sections.inspection.filter((item) => (item.blockingOverlapCount ?? 0) > 0).length,
    clippedTextCases: sections.inspection.filter((item) => (item.textClippingCount ?? 0) > 0).length
  } : null;
  const accessibility = sections.accessibility ? {
    total: sections.accessibility.length,
    failed: failures(sections.accessibility),
    blockingViolations: sections.accessibility.reduce((sum, item) => sum + (item.blockingViolationCount ?? 0), 0),
    incomplete: sections.accessibility.reduce((sum, item) => sum + (item.incompleteCount ?? 0), 0),
    invisibleFocusStops: sections.accessibility.reduce((sum, item) => sum + (item.keyboardProbe?.invisibleFocusCount ?? 0), 0)
  } : null;
  const interaction = sections.interaction ? {
    total: sections.interaction.length,
    failed: failures(sections.interaction),
    missingNames: sections.interaction.reduce((sum, item) => sum + (item.missingNameCount ?? 0), 0),
    targetSizeViolations: sections.interaction.reduce((sum, item) => sum + (item.targetSizeViolationCount ?? 0), 0),
    nestedInteractive: sections.interaction.reduce((sum, item) => sum + (item.nestedInteractiveCount ?? 0), 0),
    duplicateIds: sections.interaction.reduce((sum, item) => sum + (item.duplicateIdCount ?? 0), 0)
  } : null;
  const stateCrawler = sections.stateCrawler ? {
    total: sections.stateCrawler.length,
    failed: failures(sections.stateCrawler),
    elements: sections.stateCrawler.reduce((sum, item) => sum + (item.itemCount ?? 0), 0),
    missingFocusFeedback: sections.stateCrawler.reduce((sum, item) => sum + (item.missingFocusFeedbackCount ?? 0), 0),
    missingHoverFeedback: sections.stateCrawler.reduce((sum, item) => sum + (item.missingHoverFeedbackCount ?? 0), 0)
  } : null;
  const performance = sections.performance ? {
    total: sections.performance.length,
    failed: failures(sections.performance),
    hardFailures: sections.performance.reduce((sum, item) => sum + (item.budget?.hardFailures?.length ?? 0), 0),
    warnings: sections.performance.reduce((sum, item) => sum + (item.budget?.warnings?.length ?? 0), 0),
    averageScore: sections.performance.length ? Number((sections.performance.reduce((sum, item) => sum + Number(item.budget?.score ?? 0), 0) / sections.performance.length).toFixed(2)) : null,
    averageConfidence: sections.performance.length ? Number((sections.performance.reduce((sum, item) => sum + Number(item.budget?.confidence ?? 0), 0) / sections.performance.length).toFixed(2)) : null
  } : null;
  const engineering = sections.engineering ? {
    total: sections.engineering.length,
    requiredFailures: sections.engineering.filter((item) => item.required && !item.ok).length,
    optionalFailures: sections.engineering.filter((item) => !item.required && !item.ok).length
  } : null;
  const comparison = sections.comparison ? {
    ok: sections.comparison.ok,
    total: sections.comparison.total,
    blockers: sections.comparison.blockers,
    majors: sections.comparison.majors,
    minors: sections.comparison.minors,
    accepted: sections.comparison.accepted,
    unverified: sections.comparison.unverified,
    averagePerceptualSimilarity: sections.comparison.averagePerceptualSimilarity,
    averageVisualScore: sections.comparison.averageVisualScore,
    reportHtml: sections.comparison.reportHtml
  } : null;
  const tokens = sections.tokens ? {
    current: sections.tokens.current?.length ?? 0,
    reference: sections.tokens.reference?.length ?? 0,
    comparisons: sections.tokens.comparisons?.length ?? 0,
    maxDriftScore: sections.tokens.comparisons?.length ? Math.max(...sections.tokens.comparisons.map((item) => Number(item.driftScore ?? 0))) : null,
    averageSimilarityScore: sections.tokens.comparisons?.length ? Number((sections.tokens.comparisons.reduce((sum, item) => sum + Number(item.similarityScore ?? 0), 0) / sections.tokens.comparisons.length).toFixed(2)) : null,
    reportPath: sections.tokens.reportPath ?? null
  } : null;
  const mobileChecks = sections.mobileChecks ? {
    total: sections.mobileChecks.length,
    failed: sections.mobileChecks.filter((item) => item.verdict === 'fail').length
  } : null;
  const breakpoints = sections.breakpoints ? {
    enabled: Boolean(sections.breakpoints.enabled),
    candidateCount: sections.breakpoints.candidateCount ?? 0,
    overflowSampleCount: sections.breakpoints.overflowSampleCount ?? 0,
    reportPath: sections.breakpoints.reportPath ?? null
  } : null;
  const baseline = sections.baseline ? { valid: Boolean(sections.baseline.valid), missingManifest: Boolean(sections.baseline.missingManifest), checked: sections.baseline.checked ?? 0, changed: sections.baseline.changed?.length ?? 0, missing: sections.baseline.missing?.length ?? 0, configMatches: Boolean(sections.baseline.configMatches), approvalValid: Boolean(sections.baseline.approvalValid), manifestPath: sections.baseline.manifestPath ?? null } : null;
  const manualReview = summarizeManualReview(sections.manualReview);
  const aesthetics = sections.aesthetics ? {
    passed: Boolean(sections.aesthetics.passed),
    status: sections.aesthetics.status ?? (sections.aesthetics.passed ? 'pass' : 'fail'),
    score: sections.aesthetics.score ?? null,
    evidenceConfidence: sections.aesthetics.evidenceConfidence ?? null,
    findings: sections.aesthetics.findings?.length ?? 0,
    blockers: sections.aesthetics.hardFailures?.length ?? 0,
    reviewPassed: sections.aesthetics.review?.passed ?? null,
    missingPaths: sections.aesthetics.paths?.missing ?? []
  } : null;
  return { capture, inspection, accessibility, interaction, stateCrawler, performance, engineering, comparison, tokens, mobileChecks, breakpoints, baseline, manualReview, aesthetics };
}

function gateRow(name, gate) {
  const coverage = gate.coverage?.confidence ?? gate.evidenceConfidence ?? '—';
  const missing = Array.isArray(gate.coverage?.missing) ? gate.coverage.missing.length : Array.isArray(gate.coverage?.incompleteFamilies) ? gate.coverage.incompleteFamilies.length : '—';
  return `| ${name} | ${gate.status} | ${gate.score ?? '—'} | ${gate.weight} | ${gate.evidenceStatus} | ${coverage} | ${missing} |`;
}

function remediationMarkdown(remediation) {
  const rows = remediation.items.map((entry) => `| ${entry.id} | ${entry.severity} | ${entry.category} | ${entry.case ?? 'global'} | ${entry.finding.replaceAll('|', '\\|')} | ${entry.action.replaceAll('|', '\\|')} | ${entry.verify.replaceAll('|', '\\|')} |`).join('\n');
  return `# Frontend Remediation Plan\n\n- Generated: ${remediation.generatedAt}\n- Findings: ${remediation.total}\n- Blockers: ${remediation.blockers}\n- Majors: ${remediation.majors}\n\n| ID | Severity | Category | Case | Finding | Action | Verification |\n|---|---|---|---|---|---|---|\n${rows || '| — | — | — | — | No automated findings | — | — |'}\n`;
}

function releaseDecision(quality, manualReview) {
  if (!quality.passed) return 'blocked-by-automated-or-semantic-evidence';
  if (manualReview?.evaluation?.passed) return 'approved-by-recorded-semantic-visual-review';
  return 'requires-human-semantic-visual-approval';
}

function historyMarkdown(history) {
  if (!history) return '- History tracking: disabled or unavailable';
  const analysis = history.analysis ?? {};
  return `- History trend: **${analysis.trend ?? 'unknown'}**\n- Stagnation detected: **${analysis.stagnant ? 'YES' : 'NO'}**\n- Score delta: **${analysis.scoreDelta ?? '—'}**\n- Recorded runs: **${history.recordCount ?? 0}**`;
}

export async function writeRunSummary(config, sections, options = {}) {
  const generatedAt = new Date().toISOString();
  const provenance = options.provenance ?? createRunProvenance(config);
  // Web (playwright) runs always carry visual/runtime applicability — exactly
  // as before. Mobile (ios-sim|android) runs cannot produce web runtime or
  // comparison evidence, so those gates drop out; if a mobile compare ever
  // runs, a present comparison re-applies the visual gate.
  const isWebCapture = (config.capture?.type ?? 'playwright') === 'playwright';
  const applicability = {
    visual: isWebCapture || sections.comparison != null,
    responsive: config.inspection.enabled || config.breakpoints.enabled,
    accessibility: config.accessibility.enabled,
    runtime: isWebCapture,
    engineering: config.engineeringChecks.length > 0,
    performance: config.performance.enabled,
    interaction: config.interaction.enabled || config.stateCrawler.enabled,
    aesthetic: config.aesthetics.enabled
  };
  const quality = buildQualityGateSummary(sections, {
    ...config.quality,
    mode: config.mode,
    maxTokenDriftScore: config.tokens.maxDriftScore,
    baselineRequired: config.baseline.enabled,
    aestheticRequired: config.aesthetics.enabled,
    expectedCaseKeys: enumerateCases(config, { mode: 'current' }).map((item) => item.key),
    evidenceRequirements: {
      interaction: config.interaction.enabled,
      stateCrawler: config.stateCrawler.enabled
    },
    applicability
  });
  const remediation = buildRemediationPlan(sections);
  const sectionSummaries = summarizeSections(sections);
  const summary = {
    schemaVersion: 2,
    generatedAt,
    configPath: config.configPath,
    mode: config.mode,
    provenance,
    quality,
    sections: sectionSummaries,
    remediation: { total: remediation.total, blockers: remediation.blockers, majors: remediation.majors },
    automatedGatePassed: quality.passed,
    semanticVisualReviewRequired: true,
    semanticVisualReviewPassed: Boolean(sections.manualReview?.evaluation?.passed),
    releaseDecision: releaseDecision(quality, sections.manualReview)
  };

  let history = null;
  if (config.history?.enabled) {
    const result = await appendRunHistory(config, summary, { maxRecords: config.history.maxRecords });
    history = { historyPath: result.historyPath, analysis: result.analysis, recordCount: result.records.length };
    summary.history = history;
  }

  const reportsDir = path.join(config.outputDir, 'reports');
  const jsonPath = path.join(reportsDir, 'run-summary.json');
  const markdownPath = path.join(reportsDir, 'run-summary.md');
  const htmlPath = path.join(reportsDir, 'run-summary.html');
  const remediationJsonPath = path.join(reportsDir, 'remediation.json');
  const remediationMarkdownPath = path.join(reportsDir, 'remediation.md');
  const provenancePath = path.join(reportsDir, 'provenance.json');

  const gateRows = Object.entries(quality.gates).map(([name, gate]) => gateRow(name, gate)).join('\n');
  const manualStatus = sectionSummaries.manualReview?.status ?? 'missing';
  const markdown = `# Frontend Vision Loop Run Summary\n\n- Generated: ${generatedAt}\n- Run ID: \`${provenance.runId}\`\n- Automated quality gate: **${quality.passed ? 'PASS' : 'FAIL'}**\n- Quality score: **${quality.score}/100 (${quality.grade})**\n- Evidence confidence: **${quality.confidence}%**\n- Release decision: **${summary.releaseDecision}**\n- Semantic visual review: **${manualStatus.toUpperCase()}**\n- Config: \`${config.configPath}\`\n\n## Quality gates\n\n| Gate | Status | Score | Weight | Evidence |\n|---|---:|---:|---:|---|\n${gateRows}\n\n## Evidence summary\n\n\`\`\`json\n${JSON.stringify(sectionSummaries, null, 2)}\n\`\`\`\n\n## Iteration history\n\n${historyMarkdown(history)}\n\n## Remediation\n\n- Findings: ${remediation.total}\n- Blockers: ${remediation.blockers}\n- Majors: ${remediation.majors}\n\n> Automated success is not a claim of pixel-perfect or production-ready quality. Final approval requires current captures, semantic hierarchy review, content and asset fidelity review, interaction verification, and documented residual deviations.\n`;

  await writeJsonAtomic(jsonPath, summary);
  await writeJsonAtomic(remediationJsonPath, remediation);
  if (config.reports.provenance) await writeJsonAtomic(provenancePath, provenance);
  if (config.reports.markdown) {
    await writeTextAtomic(markdownPath, markdown);
    if (config.reports.remediation) await writeTextAtomic(remediationMarkdownPath, remediationMarkdown(remediation));
  }
  if (config.reports.html) await writeTextAtomic(htmlPath, renderRunDashboard({ summary, remediation }));

  return {
    ...summary,
    remediation,
    jsonPath,
    markdownPath: config.reports.markdown ? markdownPath : null,
    htmlPath: config.reports.html ? htmlPath : null,
    remediationJsonPath,
    remediationMarkdownPath: config.reports.markdown && config.reports.remediation ? remediationMarkdownPath : null,
    provenancePath: config.reports.provenance ? provenancePath : null,
    historyPath: history?.historyPath ?? null
  };
}
