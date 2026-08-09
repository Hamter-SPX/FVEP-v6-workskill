import { lookupRemediationRule } from './remediation-rules.mjs';

const severityRank = Object.freeze({ blocker: 0, major: 1, minor: 2, warning: 3, info: 4 });

// Judge finding severities (fail|warn) map onto the plan vocabulary; a failed
// judgment fails the mobile gate, so it blocks.
const findingSeverity = Object.freeze({ fail: 'blocker', warn: 'warning' });

function formatValue(value) {
  if (value === null || value === undefined) return 'none';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function remediateFindings(findings, { caseKey = null } = {}) {
  return (findings ?? []).map((finding) => {
    const rule = lookupRemediationRule(finding?.rule);
    const ruleName = typeof finding?.rule === 'string' && finding.rule !== '' ? finding.rule : 'unknown';
    return item({
      severity: findingSeverity[finding?.severity] ?? 'warning',
      category: rule.category,
      caseKey,
      finding: `Judge rule ${ruleName} breached: expected ${formatValue(finding?.expected)}, observed ${formatValue(finding?.observed)}.`,
      likelyCause: rule.why,
      action: rule.action,
      verify: rule.verify
    });
  });
}

function item({ severity, category, caseKey = null, finding, likelyCause, action, verify }) {
  return { severity, category, case: caseKey, finding, likelyCause, action, verify };
}

function comparisonItems(section) {
  return (section?.comparisons ?? []).filter((entry) => ['blocker', 'major', 'minor'].includes(entry.severity)).map((entry) => {
    const missing = String(entry.reason ?? '').startsWith('missing-');
    return item({
      severity: entry.severity,
      category: 'visual',
      caseKey: entry.key,
      finding: missing ? `Required visual evidence is missing (${entry.reason}).` : `Visual comparison is ${entry.severity}; mismatch ${entry.mismatchRatio ?? 'unknown'}.`,
      likelyCause: missing ? 'Baseline/current capture was not generated or the artifact identity changed.' : 'Content, geometry, typography, assets, responsive composition, or rendering state differs.',
      action: missing ? 'Capture both reference and current evidence for the same deterministic route, viewport, and state.' : 'Open reference/current/diff together, inspect the largest coherent delta region, and fix macro geometry before surface polish.',
      verify: `Re-run comparison for ${entry.key} and perform semantic visual review.`
    });
  });
}

export function buildRemediationPlan(sections = {}) {
  const items = [...comparisonItems(sections.comparison)];
  if (sections.baseline && !sections.baseline.valid) items.push(item({
    severity: 'blocker', category: 'baseline-governance', caseKey: null,
    finding: sections.baseline.missingManifest ? 'Approved visual baseline manifest is missing.' : 'Visual baseline provenance or integrity is invalid.',
    likelyCause: !sections.baseline.configMatches ? 'The acceptance configuration changed after baseline approval.' : !sections.baseline.approvalValid ? 'Approval metadata is missing.' : 'One or more approved artifacts changed or disappeared.',
    action: 'Do not overwrite the baseline silently. Review current evidence, obtain explicit approval, and promote it with the baseline command so hashes and provenance are recorded.',
    verify: 'Run baseline verification and confirm file integrity, config hash, and approval metadata all pass.'
  }));
  for (const entry of sections.inspection ?? []) if (entry.horizontalOverflow || entry.ok === false) items.push(item({
    severity: 'blocker', category: 'responsive', caseKey: entry.key,
    finding: `Horizontal overflow detected${entry.overflowOffenderCount ? ` from ${entry.overflowOffenderCount} element(s)` : ''}.`,
    likelyCause: 'A child has a fixed/min-content width, transform, unbroken content, or viewport-relative sizing outside its container.',
    action: 'Identify the first overflowing ancestor/child pair and correct the width, min-width, wrapping, grid, or containment rule; do not hide overflow globally.',
    verify: `Re-inspect ${entry.key} at the failing width and adjacent regression widths.`
  }));
  for (const entry of sections.accessibility ?? []) if ((entry.blockingViolationCount ?? 0) > 0 || entry.ok === false) items.push(item({
    severity: 'blocker', category: 'accessibility', caseKey: entry.key,
    finding: `${entry.blockingViolationCount ?? 0} blocking accessibility violation(s).`,
    likelyCause: 'Semantic structure, accessible naming, keyboard behavior, focus, contrast, or state communication is incomplete.',
    action: 'Fix native semantics and task-blocking violations first, then rerun axe and manually complete the primary keyboard flow.',
    verify: `Run accessibility audit and keyboard probe again for ${entry.key}.`
  }));
  for (const entry of sections.performance ?? []) for (const failure of entry.budget?.hardFailures ?? []) items.push(item({
    severity: 'major', category: 'performance', caseKey: entry.key,
    finding: `${failure.metric} is ${failure.actual}, above budget ${failure.max}.`,
    likelyCause: 'Critical resources, rendering, hydration, layout instability, or main-thread work exceeds the declared route budget.',
    action: `Profile ${failure.metric}, identify the dominant resource or task, and make the smallest measured change that reduces it below ${failure.max}.`,
    verify: `Re-run the performance audit for ${entry.key} with the same deterministic state.`
  }));
  for (const entry of sections.interaction ?? []) {
    if ((entry.missingNameCount ?? 0) > 0) items.push(item({ severity: 'blocker', category: 'interaction', caseKey: entry.key, finding: `${entry.missingNameCount} interactive control(s) lack an accessible name.`, likelyCause: 'Icon-only or custom controls do not expose a programmatic label.', action: 'Use a correctly labelled native control or add a specific accessible name tied to the visible purpose.', verify: `Re-run interaction and accessibility inspection for ${entry.key}.` }));
    if ((entry.targetSizeViolationCount ?? 0) > 0) items.push(item({ severity: 'minor', category: 'interaction', caseKey: entry.key, finding: `${entry.targetSizeViolationCount} interactive target(s) are smaller than policy.`, likelyCause: 'Visual icon size is being used as the hit target without sufficient padding or spacing.', action: 'Increase the interactive hit area without distorting visual hierarchy, and preserve spacing between adjacent targets.', verify: `Re-run target-size inspection for ${entry.key}.` }));
  }
  for (const entry of sections.stateCrawler ?? []) {
    if ((entry.missingFocusFeedbackCount ?? 0) > 0) items.push(item({ severity: 'blocker', category: 'interaction-state', caseKey: entry.key, finding: `${entry.missingFocusFeedbackCount} control(s) expose no measurable focus feedback.`, likelyCause: 'Focus styling is absent, removed, or visually identical to the resting state.', action: 'Add a visible focus treatment using outline, shadow, border, or another non-ambiguous cue without relying on color alone.', verify: `Re-run state crawling and keyboard review for ${entry.key}.` }));
    if ((entry.missingHoverFeedbackCount ?? 0) > 0) items.push(item({ severity: 'minor', category: 'interaction-state', caseKey: entry.key, finding: `${entry.missingHoverFeedbackCount} control(s) expose no measurable hover feedback.`, likelyCause: 'Interactive affordance does not change on pointer hover.', action: 'Add restrained hover feedback appropriate to the component while retaining the focus treatment as the accessibility-critical state.', verify: `Re-run state crawling for ${entry.key}.` }));
  }
  if (sections.manualReview?.missing) items.push(item({ severity: 'blocker', category: 'semantic-review', caseKey: null, finding: 'Recorded semantic visual review is missing.', likelyCause: 'Automated evidence exists, but hierarchy, composition, content, asset fidelity, and responsive intent have not been explicitly approved.', action: 'Review every required route, viewport, and state using the semantic visual rubric, record ratings and residual deviations, then validate the review against the current config hash.', verify: 'Run the manual-review validator and confirm explicit approval, complete case coverage, freshness, and matching configuration.' }));
  else if (sections.manualReview?.evaluation && !sections.manualReview.evaluation.passed) items.push(item({ severity: 'blocker', category: 'semantic-review', caseKey: null, finding: `Semantic visual review did not pass (${sections.manualReview.evaluation.score ?? 0}/100).`, likelyCause: 'The review contains blockers, incomplete case coverage, stale evidence, config drift, or an explicit changes-requested decision.', action: 'Resolve every recorded blocker and missing case, recapture affected states, and obtain a fresh explicit approval.', verify: 'Validate the semantic review again against the current config and acceptance matrix.' }));
  if (sections.aesthetics) {
    if (sections.aesthetics.paths?.missing?.includes('profile')) {
      items.push(item({
        severity: 'blocker', category: 'aesthetics', caseKey: null,
        finding: 'Aesthetic profile required by the enabled aesthetic gate is missing.',
        likelyCause: 'aesthetics.enabled is true but aesthetics.profilePath does not resolve to a readable profile.',
        action: 'Author an aesthetic profile against schemas/aesthetic-profile.schema.json and point aesthetics.profilePath at it.',
        verify: 'Re-run the vision loop or audit:aesthetics and confirm the aesthetic gate receives a profile.'
      }));
    } else if (!sections.aesthetics.passed) {
      items.push(item({
        severity: 'blocker', category: 'aesthetics', caseKey: null,
        finding: `Aesthetic audit did not pass (${sections.aesthetics.score ?? 0}/100, confidence ${sections.aesthetics.evidenceConfidence ?? 0}%).`,
        likelyCause: 'Mechanical measurements, craft findings, missing review, stale review, or dimension floors failed the declared aesthetic direction.',
        action: 'Resolve every aesthetic finding against the declared profile, refresh the independent aesthetic review when required, and keep measurements bound to the current config hash.',
        verify: 'Run npm run audit:aesthetics and npm run aesthetics:review, then confirm the aesthetic gate passes in the run summary.'
      }));
    }
  }
  for (const entry of sections.engineering ?? []) if (entry.required && !entry.ok) items.push(item({ severity: 'blocker', category: 'engineering', caseKey: null, finding: `Required engineering check failed: ${entry.name}.`, likelyCause: 'The implementation violates the repository build, type, lint, or test contract.', action: `Inspect the command output for ${entry.name}, fix the first root-cause failure, and rerun the exact command.`, verify: `${entry.command} exits successfully without newly introduced warnings.` }));
  for (const check of sections.mobileChecks ?? []) items.push(...remediateFindings(check.findings, { caseKey: check.key }));

  const deduplicated = [];
  const seen = new Set();
  for (const candidate of items) {
    const fingerprint = [candidate.severity, candidate.category, candidate.case, candidate.finding].join('|');
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint); deduplicated.push(candidate);
  }
  deduplicated.sort((left, right) => (severityRank[left.severity] ?? 99) - (severityRank[right.severity] ?? 99) || String(left.case ?? '').localeCompare(String(right.case ?? '')) || left.category.localeCompare(right.category));
  deduplicated.forEach((entry, index) => { entry.id = `R${String(index + 1).padStart(3, '0')}`; entry.priority = index + 1; });
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), total: deduplicated.length, blockers: deduplicated.filter((entry) => entry.severity === 'blocker').length, majors: deduplicated.filter((entry) => entry.severity === 'major').length, items: deduplicated };
}
