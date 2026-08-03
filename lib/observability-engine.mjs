import { finalizeAudit, makeFinding, nonEmpty, percentage, uniqueStrings } from './audit-utils.mjs';

const REQUIRED_FIELDS = Object.freeze(['logs', 'metrics', 'traces', 'correlation', 'slo', 'alerts', 'runbook', 'dashboard', 'owner']);

export function auditObservabilityContract(contract = {}, policy = {}) {
  const flows = Array.isArray(contract?.flows) ? contract.flows : [];
  const findings = [];
  let checks = 0;
  let passed = 0;

  for (const [index, flow] of flows.entries()) {
    const id = String(flow?.id ?? `flow-${index + 1}`);
    const path = `flows.${id}`;
    const critical = flow?.critical !== false;
    for (const field of REQUIRED_FIELDS) {
      checks += 1;
      const value = flow?.[field];
      const ok = field === 'correlation' ? value === true
        : ['logs', 'metrics', 'traces', 'alerts'].includes(field) ? uniqueStrings(value).length > 0
          : nonEmpty(value);
      if (ok) { passed += 1; continue; }
      let code = `observability-${field}-missing`;
      let severity = critical ? 'high' : 'medium';
      if (field === 'correlation') severity = critical ? 'blocker' : 'high';
      if (field === 'slo') severity = critical ? 'blocker' : 'high';
      if (field === 'runbook') severity = critical ? 'high' : 'medium';
      findings.push(makeFinding(code, severity, `Flow ${id} lacks required ${field} coverage.`, { path }));
    }
    if (flow?.slo && (!Number.isFinite(Number(flow.slo.objective)) || !Number.isFinite(Number(flow.slo.windowDays)))) findings.push(makeFinding('observability-slo-invalid', 'high', `Flow ${id} SLO must declare objective and windowDays.`, { path }));
    if (flow?.logs?.some?.((entry) => /password|token|secret|authorization/i.test(String(entry)))) findings.push(makeFinding('observability-sensitive-log-risk', 'high', `Flow ${id} logging contract may include sensitive fields.`, { path }));
  }

  if (!flows.length) findings.push(makeFinding('observability-contract-empty', policy.required === false ? 'low' : 'blocker', 'No critical flows are declared for observability coverage.'));
  const confidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: flows.length, evidenceConfidence: confidence });
  return { ...report, flowCount: flows.length, coverage: { required: checks, satisfied: passed, confidence } };
}
