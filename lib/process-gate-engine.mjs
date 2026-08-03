import { processFinding } from './process-audit-utils.mjs';

const DEFAULT_REQUIRED = Object.freeze(['routing', 'design', 'plan', 'workspace', 'tdd', 'review', 'claims', 'ledger']);

function clamp(value) {
  const n = Number(value);
  return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
}

export function evaluateProcessGate(sectionsInput = {}, policy = {}) {
  const sections = sectionsInput && typeof sectionsInput === 'object' ? sectionsInput : {};
  const required = Array.isArray(policy.requiredSections) ? policy.requiredSections.map(String) : [...DEFAULT_REQUIRED];
  const weights = { ...Object.fromEntries(required.map((name) => [name, 1])), ...(policy.weights ?? {}) };
  const minScore = Number(policy.minScore ?? 90);
  const minConfidence = Number(policy.minConfidence ?? 90);
  const hardFailures = [];
  const sectionSummaries = {};
  let weightedScore = 0;
  let presentWeight = 0;
  const confidences = [];

  for (const name of required) {
    const section = sections[name];
    const weight = Math.max(0, Number(weights[name] ?? 1));
    if (!section) {
      hardFailures.push(processFinding('REQUIRED_PROCESS_SECTION_MISSING', 'blocker', `Required process section ${name} is missing.`, { path: name }));
      confidences.push(0);
      sectionSummaries[name] = { status: 'missing', score: null, evidenceConfidence: 0, hardFailureCount: 0 };
      continue;
    }
    const score = clamp(section.score ?? 0);
    const confidence = clamp(section.evidenceConfidence ?? 0);
    weightedScore += score * weight;
    presentWeight += weight;
    confidences.push(confidence);
    const sectionHard = Array.isArray(section.hardFailures) ? section.hardFailures : Array.isArray(section.blockers) ? section.blockers : [];
    if (section.status === 'fail' || section.status === 'blocked' || sectionHard.length > 0) hardFailures.push(processFinding('PROCESS_SECTION_HARD_FAILURE', 'blocker', `Process section ${name} contains a hard failure.`, { path: name, detail: sectionHard.map((item) => item?.code ?? item?.message ?? String(item)) }));
    sectionSummaries[name] = { status: section.status ?? 'unknown', score, evidenceConfidence: confidence, hardFailureCount: sectionHard.length };
  }

  const qualityScore = presentWeight > 0 ? Number((weightedScore / presentWeight).toFixed(2)) : 0;
  const evidenceConfidence = confidences.length ? Number(Math.min(...confidences).toFixed(2)) : 0;
  if (qualityScore < minScore) hardFailures.push(processFinding('PROCESS_SCORE_BELOW_THRESHOLD', 'blocker', `Process quality score ${qualityScore} is below ${minScore}.`));
  if (evidenceConfidence < minConfidence) hardFailures.push(processFinding('PROCESS_CONFIDENCE_BELOW_THRESHOLD', 'blocker', `Process evidence confidence ${evidenceConfidence} is below ${minConfidence}.`));

  const releaseEligible = hardFailures.length === 0;
  return {
    schemaVersion: 4,
    status: releaseEligible ? 'pass' : 'fail',
    ok: releaseEligible,
    releaseEligible,
    qualityScore,
    score: qualityScore,
    evidenceConfidence,
    evidenceCount: Object.keys(sections).length,
    hardFailures,
    blockers: hardFailures,
    warnings: [],
    findings: hardFailures,
    sections: sectionSummaries,
    policy: { requiredSections: required, weights, minScore, minConfidence }
  };
}
