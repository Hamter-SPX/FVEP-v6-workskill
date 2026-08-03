import { finalizeAudit, makeFinding, nonEmpty, percentage } from './audit-utils.mjs';

const CRITICAL = new Set(['critical', 'high']);

function detectCycles(componentIds, edges) {
  const adjacency = new Map([...componentIds].map((id) => [id, []]));
  for (const edge of edges) if (adjacency.has(edge.from) && adjacency.has(edge.to)) adjacency.get(edge.from).push(edge.to);
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  const cycles = [];

  function visit(node) {
    if (visiting.has(node)) {
      const index = stack.indexOf(node);
      cycles.push([...stack.slice(index), node]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    for (const next of adjacency.get(node) ?? []) visit(next);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }
  for (const id of componentIds) visit(id);
  const unique = new Map(cycles.map((cycle) => [cycle.join('->'), cycle]));
  return [...unique.values()];
}

export function auditArchitectureContract(contract = {}, policy = {}) {
  const components = Array.isArray(contract?.components) ? contract.components : [];
  const edges = Array.isArray(contract?.edges) ? contract.edges : [];
  const findings = [];
  const byId = new Map();
  let checks = 0;
  let passed = 0;

  for (const [index, raw] of components.entries()) {
    const id = String(raw?.id ?? `component-${index + 1}`);
    if (byId.has(id)) findings.push(makeFinding('architecture-component-id-duplicate', 'blocker', `Component identifier ${id} is duplicated.`, { path: `components.${id}` }));
    byId.set(id, { ...raw, id, criticality: String(raw?.criticality ?? 'medium'), replicas: Number(raw?.replicas ?? 1) });
  }

  for (const component of byId.values()) {
    const path = `components.${component.id}`;
    checks += 2;
    if (nonEmpty(component.owner)) passed += 1;
    else findings.push(makeFinding('architecture-owner-missing', CRITICAL.has(component.criticality) ? 'high' : 'medium', `Component ${component.id} has no accountable owner.`, { path }));
    if (!CRITICAL.has(component.criticality) || nonEmpty(component.slo)) passed += 1;
    else findings.push(makeFinding('architecture-slo-missing', 'high', `Critical component ${component.id} has no SLO.`, { path }));

    if (CRITICAL.has(component.criticality)) {
      checks += 1;
      if (component.replicas > 1 || nonEmpty(component.fallback)) passed += 1;
      else findings.push(makeFinding('architecture-critical-spof', 'high', `Critical component ${component.id} has one replica and no fallback.`, { path, remediation: 'Define redundancy, failover, or an explicit accepted risk.' }));
    }
  }

  for (const [index, raw] of edges.entries()) {
    const edge = { ...raw, from: String(raw?.from ?? ''), to: String(raw?.to ?? '') };
    const path = `edges.${index}`;
    const source = byId.get(edge.from);
    const target = byId.get(edge.to);
    if (!source || !target) {
      findings.push(makeFinding('architecture-edge-dangling', 'blocker', `Dependency edge ${edge.from || '?'} -> ${edge.to || '?'} references an unknown component.`, { path }));
      continue;
    }
    checks += 1;
    if (Number.isFinite(Number(edge.timeoutMs)) && Number(edge.timeoutMs) > 0) passed += 1;
    else findings.push(makeFinding('architecture-edge-timeout-missing', CRITICAL.has(source.criticality) || CRITICAL.has(target.criticality) ? 'high' : 'medium', `Edge ${edge.from} -> ${edge.to} has no timeout contract.`, { path }));

    if (String(source.trustZone ?? '') !== String(target.trustZone ?? '')) {
      checks += 3;
      if (nonEmpty(edge.authentication)) passed += 1;
      else findings.push(makeFinding('architecture-trust-auth-missing', 'blocker', `Trust-boundary edge ${edge.from} -> ${edge.to} lacks authentication.`, { path }));
      if (nonEmpty(edge.authorization)) passed += 1;
      else findings.push(makeFinding('architecture-trust-authorization-missing', 'high', `Trust-boundary edge ${edge.from} -> ${edge.to} lacks authorization semantics.`, { path }));
      if (edge.encryption === true || ['https', 'tls', 'mtls'].includes(String(edge.protocol).toLowerCase())) passed += 1;
      else findings.push(makeFinding('architecture-trust-encryption-missing', 'blocker', `Trust-boundary edge ${edge.from} -> ${edge.to} is not declared encrypted.`, { path }));
    }
  }

  for (const cycle of detectCycles(new Set(byId.keys()), edges)) findings.push(makeFinding('architecture-cycle-detected', policy.allowCycles ? 'medium' : 'high', `Dependency cycle detected: ${cycle.join(' -> ')}.`, { detail: cycle }));
  if (!components.length) findings.push(makeFinding('architecture-contract-empty', policy.required === false ? 'low' : 'blocker', 'Architecture contract contains no components.'));

  const confidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: components.length + edges.length, evidenceConfidence: confidence });
  return { ...report, componentCount: components.length, edgeCount: edges.length, coverage: { requiredChecks: checks, satisfiedChecks: passed, confidence } };
}
