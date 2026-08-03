import { clamp, finalizeAudit, makeFinding, nonEmpty, percentage, uniqueStrings } from './audit-utils.mjs';

const VALID_STATUSES = new Set(['open', 'mitigating', 'mitigated', 'accepted', 'closed']);

function level(value, fallback = 3) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1 || number > 5) return fallback;
  return number;
}

function normalizeRisk(raw, index) {
  const likelihood = level(raw?.likelihood);
  const impact = level(raw?.impact);
  const detectability = level(raw?.detectability);
  const status = VALID_STATUSES.has(String(raw?.status)) ? String(raw.status) : 'open';
  return {
    id: String(raw?.id ?? `risk-${index + 1}`),
    title: String(raw?.title ?? 'Unnamed risk'),
    likelihood,
    impact,
    detectability,
    rpn: likelihood * impact * detectability,
    status,
    hardBlocker: Boolean(raw?.hardBlocker),
    owner: nonEmpty(raw?.owner) ? String(raw.owner) : null,
    mitigations: uniqueStrings(raw?.mitigations),
    evidence: uniqueStrings(raw?.evidence),
    dueAt: raw?.dueAt ? String(raw.dueAt) : null,
    acceptance: raw?.acceptance && typeof raw.acceptance === 'object' ? structuredClone(raw.acceptance) : null
  };
}

export function evaluateRiskRegister(register = {}, policy = {}) {
  const risks = (Array.isArray(register?.risks) ? register.risks : []).map(normalizeRisk).sort((a, b) => b.rpn - a.rpn || a.id.localeCompare(b.id));
  const findings = [];
  const blockerRpn = clamp(policy.blockerRpn ?? 80, 1, 125);
  const highRpn = clamp(policy.highRpn ?? 45, 1, blockerRpn);
  let evidenceUnits = 0;
  let evidencePresent = 0;

  const seen = new Set();
  for (const risk of risks) {
    const riskPath = `risks.${risk.id}`;
    if (seen.has(risk.id)) findings.push(makeFinding('risk-id-duplicate', 'blocker', `Risk identifier ${risk.id} is duplicated.`, { path: riskPath, remediation: 'Assign a unique stable identifier.' }));
    seen.add(risk.id);

    evidenceUnits += 3;
    if (risk.owner) evidencePresent += 1;
    if (risk.mitigations.length) evidencePresent += 1;
    if (risk.evidence.length) evidencePresent += 1;

    if (!risk.owner) findings.push(makeFinding('risk-owner-missing', 'high', `Risk ${risk.id} has no accountable owner.`, { path: riskPath, remediation: 'Assign one accountable owner and escalation path.' }));
    if (['open', 'mitigating'].includes(risk.status) && !risk.mitigations.length) findings.push(makeFinding('risk-mitigation-missing', risk.rpn >= highRpn ? 'high' : 'medium', `Risk ${risk.id} has no mitigation plan.`, { path: riskPath }));
    if (!risk.evidence.length) findings.push(makeFinding('risk-evidence-missing', risk.status === 'closed' || risk.status === 'mitigated' ? 'high' : 'medium', `Risk ${risk.id} has no evidence supporting its current status.`, { path: riskPath }));
    if (risk.hardBlocker && !['mitigated', 'closed'].includes(risk.status)) findings.push(makeFinding('risk-hard-blocker-open', 'blocker', `Hard-blocking risk ${risk.id} remains ${risk.status}.`, { path: riskPath }));
    else if (risk.rpn >= blockerRpn && risk.status === 'open') findings.push(makeFinding('risk-exposure-critical', 'blocker', `Risk ${risk.id} has critical exposure RPN ${risk.rpn}.`, { path: riskPath }));
    else if (risk.rpn >= highRpn && ['open', 'mitigating'].includes(risk.status)) findings.push(makeFinding('risk-exposure-high', 'high', `Risk ${risk.id} has high exposure RPN ${risk.rpn}.`, { path: riskPath }));

    if (risk.status === 'accepted') {
      evidenceUnits += 2;
      if (nonEmpty(risk.acceptance?.approvedBy)) evidencePresent += 1;
      else findings.push(makeFinding('risk-acceptance-approval-missing', 'high', `Accepted risk ${risk.id} lacks approver provenance.`, { path: riskPath }));
      if (nonEmpty(risk.acceptance?.expiresAt)) evidencePresent += 1;
      else findings.push(makeFinding('risk-acceptance-expiry-missing', 'medium', `Accepted risk ${risk.id} has no expiry or review date.`, { path: riskPath }));
    }
  }

  if (!risks.length) findings.push(makeFinding('risk-register-empty', policy.required === false ? 'low' : 'high', 'The risk register contains no assessed risks.', { remediation: 'Record material product, security, data, operational, and release risks.' }));
  const report = finalizeAudit(findings, { evidenceCount: risks.length, evidenceConfidence: percentage(evidencePresent, evidenceUnits) });
  return { ...report, risks, policy: { blockerRpn, highRpn } };
}
