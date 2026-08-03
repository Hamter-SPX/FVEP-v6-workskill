import { scoreQualityGates } from './quality-model.mjs';
import { DEFAULT_FULLSTACK_GATES, DEFAULT_FULLSTACK_WEIGHTS } from './fullstack-config.mjs';

function normalizedSection(name, section, gatePolicy) {
  if (!section) {
    if (gatePolicy.required) return { status: 'fail', score: 0, evidenceCount: 0, evidenceConfidence: 0, hard: gatePolicy.hard, reason: 'required-evidence-missing' };
    return { status: 'not-applicable', score: null, evidenceCount: 0, evidenceConfidence: null, hard: false };
  }
  if (name === 'frontend' && section.status === undefined) {
    return {
      status: section.passed ? 'pass' : 'fail',
      score: Number(section.score ?? 0),
      evidenceConfidence: Number(section.confidence ?? 0),
      evidenceCount: Number(section.evidenceCount ?? 1),
      hard: gatePolicy.hard,
      source: 'frontend-vision-quality-summary'
    };
  }
  const blockers = Array.isArray(section.blockers) ? section.blockers : [];
  const status = blockers.length ? 'fail' : String(section.status ?? (section.ok === true ? 'pass' : section.ok === false ? 'fail' : 'unknown'));
  return {
    status,
    score: status === 'not-applicable' ? null : Number(section.score ?? (status === 'pass' ? 100 : status === 'warning' ? 70 : 0)),
    evidenceConfidence: status === 'not-applicable' ? null : Number(section.evidenceConfidence ?? 0),
    evidenceCount: Number(section.evidenceCount ?? 0),
    hard: gatePolicy.hard,
    blockerCount: blockers.length
  };
}

export function buildFullstackGate(sections = {}, policy = {}) {
  const gatePolicies = {};
  for (const [name, defaults] of Object.entries(DEFAULT_FULLSTACK_GATES)) gatePolicies[name] = { ...defaults, ...(policy.gates?.[name] ?? {}) };
  const gates = {};
  for (const name of Object.keys(DEFAULT_FULLSTACK_GATES)) gates[name] = normalizedSection(name, sections[name], gatePolicies[name]);
  const result = scoreQualityGates(gates, {
    weights: { ...DEFAULT_FULLSTACK_WEIGHTS, ...(policy.weights ?? {}) },
    minScore: policy.minScore ?? 90,
    minConfidence: policy.minConfidence ?? 90,
    failOnAnyGateFailure: policy.failOnAnyGateFailure !== false
  });
  const blockers = [];
  for (const [name, section] of Object.entries(sections)) for (const finding of section?.blockers ?? []) blockers.push({ gate: name, ...finding });
  return { ...result, schemaVersion: 4, blockers, releaseDecision: result.passed ? 'approved-by-fullstack-evidence-gate' : 'blocked-by-fullstack-evidence-gate' };
}
