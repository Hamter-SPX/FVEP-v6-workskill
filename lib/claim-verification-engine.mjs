import { finalizeProcessAudit, nonEmpty, processFinding, unique } from './process-audit-utils.mjs';

const TYPE_REQUIREMENTS = Object.freeze({
  'tests-pass': ['test-run'],
  'build-passes': ['build-run'],
  'visual-match': ['visual-review'],
  'security-gates-pass': ['security-audit', 'threat-model'],
  'production-ready': ['test-run', 'build-run', 'process-gate', 'fullstack-gate', 'final-review', 'rollback-proof'],
  'bug-fixed': ['regression-test', 'reproduction-verification']
});

function hoursBetween(then, now) {
  const left = Date.parse(String(then ?? ''));
  const right = Date.parse(String(now ?? ''));
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  return (right - left) / 3_600_000;
}

function passedEvidence(item) {
  return item?.status === 'pass' && (item?.exitStatus === undefined || Number(item.exitStatus) === 0) && Number(item?.hardFailures ?? 0) === 0;
}

export function auditCompletionClaims(claimsInput = [], evidenceInput = [], policy = {}) {
  const claims = Array.isArray(claimsInput) ? claimsInput : [];
  const evidence = Array.isArray(evidenceInput) ? evidenceInput : [];
  const evidenceById = new Map(evidence.map((item) => [String(item?.id ?? ''), item]));
  const findings = [];
  const summaries = [];
  const now = policy.now ?? new Date().toISOString();
  const maxAgeHours = Number(policy.maxAgeHours ?? 24);
  let evidenceCount = 0;

  if (claims.length === 0 && policy.required === true) findings.push(processFinding('COMPLETION_CLAIMS_MISSING', 'blocker', 'Required completion claims are missing.'));

  for (const [index, claim] of claims.entries()) {
    const local = [];
    const path = `claims[${index}]`;
    const type = String(claim?.type ?? '');
    const ids = unique(claim?.evidenceIds ?? []);
    if (!nonEmpty(claim?.id) || !nonEmpty(type) || !nonEmpty(claim?.artifactHash)) local.push(processFinding('CLAIM_IDENTITY_INCOMPLETE', 'blocker', 'Claim requires id, type, and artifact hash.', { path }));
    if (type === 'secure') local.push(processFinding('ABSOLUTE_SECURITY_CLAIM_UNSUPPORTED', 'blocker', 'An absolute “secure” claim cannot be proven; use bounded “security-gates-pass” language.', { path }));
    if (!Object.hasOwn(TYPE_REQUIREMENTS, type) && type !== 'secure') local.push(processFinding('CLAIM_TYPE_UNSUPPORTED', 'blocker', `Unsupported completion claim type: ${type}.`, { path }));
    if (ids.length === 0) local.push(processFinding('CLAIM_EVIDENCE_MISSING', 'blocker', 'Claim has no evidence references.', { path }));

    const items = [];
    for (const id of ids) {
      const item = evidenceById.get(id);
      if (!item) {
        local.push(processFinding('CLAIM_EVIDENCE_UNKNOWN', 'blocker', `Claim references unknown evidence ${id}.`, { path }));
        continue;
      }
      items.push(item);
      evidenceCount += 1;
      const age = hoursBetween(item.generatedAt, now);
      if (age === null || age < 0 || age > maxAgeHours) local.push(processFinding('CLAIM_EVIDENCE_STALE', 'blocker', `Evidence ${id} is missing a valid current timestamp or exceeds the freshness window.`, { path, detail: { ageHours: age, maxAgeHours } }));
      if (item.artifactHash !== claim.artifactHash) local.push(processFinding('CLAIM_ARTIFACT_MISMATCH', 'blocker', `Evidence ${id} is bound to a different artifact.`, { path, detail: { expected: claim.artifactHash, observed: item.artifactHash } }));
      if (!passedEvidence(item)) local.push(processFinding('CLAIM_EVIDENCE_NOT_PASSING', 'blocker', `Evidence ${id} does not report a passing result.`, { path }));
    }

    const requiredTypes = TYPE_REQUIREMENTS[type] ?? [];
    const availableTypes = new Set(items.map((item) => item.type));
    const missingTypes = requiredTypes.filter((required) => !availableTypes.has(required));
    if (missingTypes.length) {
      const code = type === 'production-ready' ? 'PRODUCTION_READY_EVIDENCE_INCOMPLETE' : 'CLAIM_REQUIRED_EVIDENCE_TYPE_MISSING';
      local.push(processFinding(code, 'blocker', `Claim ${type} lacks required evidence types: ${missingTypes.join(', ')}.`, { path }));
    }

    if (type === 'tests-pass') {
      const testRuns = items.filter((item) => item.type === 'test-run');
      if (!testRuns.some((item) => item.scope === 'full-suite' && Number(item.failures ?? 0) === 0)) local.push(processFinding('TEST_CLAIM_UNSUPPORTED', 'blocker', 'Tests-pass claim requires a fresh full-suite run with zero failures.', { path }));
    }
    if (type === 'visual-match') {
      const visual = items.find((item) => item.type === 'visual-review');
      if (!visual || visual.currentRender !== true || Number(visual.coverage ?? 0) < 100 || Number(visual.blockers ?? 0) > 0) local.push(processFinding('VISUAL_CLAIM_UNSUPPORTED', 'blocker', 'Visual-match claim requires a current render, complete required-case coverage, and zero blockers.', { path }));
    }
    if (type === 'security-gates-pass') {
      const security = items.find((item) => item.type === 'security-audit');
      const threat = items.find((item) => item.type === 'threat-model');
      if (!passedEvidence(security) || !passedEvidence(threat)) local.push(processFinding('SECURITY_GATE_CLAIM_UNSUPPORTED', 'blocker', 'Security-gates-pass requires passing current security audit and threat model evidence.', { path }));
    }

    findings.push(...local);
    summaries.push({ id: claim?.id ?? null, type, verified: !local.some((item) => item.severity === 'blocker'), findingCodes: local.map((item) => item.code) });
  }

  const report = finalizeProcessAudit(findings, { evidenceCount, evidenceConfidence: claims.length ? (summaries.filter((item) => item.verified).length / claims.length) * 100 : 0 });
  return {
    ...report,
    claims: summaries,
    verifiedClaims: summaries.filter((item) => item.verified).length,
    rejectedClaims: summaries.filter((item) => !item.verified).length,
    policy: { maxAgeHours, now }
  };
}
