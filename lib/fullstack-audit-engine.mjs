import { auditApiContract, compareApiContracts } from './api-contract-engine.mjs';
import { auditArchitectureContract } from './architecture-risk-engine.mjs';
import { auditDependencyManifest } from './dependency-risk-engine.mjs';
import { auditExperienceContract } from './experience-contract-engine.mjs';
import { buildFullstackGate } from './fullstack-gate-engine.mjs';
import { auditMigrationPlan } from './migration-risk-engine.mjs';
import { auditObservabilityContract } from './observability-engine.mjs';
import { auditResilienceContract } from './resilience-engine.mjs';
import { evaluateRiskRegister } from './risk-engine.mjs';
import { auditSecurityContract } from './security-review-engine.mjs';
import { scanSourceFiles } from './source-risk-scanner.mjs';
import { sortFindings } from './audit-utils.mjs';

function notApplicable() { return { status: 'not-applicable', score: null, evidenceConfidence: null, evidenceCount: 0, blockers: [], findings: [] }; }


function normalizeProcessReport(report) {
  if (!report) return null;
  const gate = report.processGate ?? report;
  const blockers = Array.isArray(gate.hardFailures) ? gate.hardFailures : Array.isArray(gate.blockers) ? gate.blockers : [];
  const releaseEligible = gate.releaseEligible === true || (gate.status === 'pass' && blockers.length === 0);
  return {
    schemaVersion: 4,
    status: releaseEligible ? 'pass' : 'fail',
    ok: releaseEligible,
    releaseEligible,
    score: Number(gate.qualityScore ?? gate.score ?? (releaseEligible ? 100 : 0)),
    evidenceConfidence: Number(gate.evidenceConfidence ?? 0),
    evidenceCount: Number(gate.evidenceCount ?? Object.keys(gate.sections ?? {}).length ?? 0),
    findings: Array.isArray(gate.findings) ? gate.findings : blockers,
    hardFailures: blockers,
    blockers
  };
}

function mergeSecurity(security, sourceRisk) {
  if (!security && !sourceRisk) return null;
  const findings = sortFindings([...(security?.findings ?? []), ...(sourceRisk?.findings ?? [])]);
  const blockers = findings.filter((finding) => finding.severity === 'blocker');
  const status = blockers.length ? 'fail' : findings.length ? 'warning' : 'pass';
  const weighted = [security, sourceRisk].filter(Boolean);
  const score = weighted.length ? weighted.reduce((sum, item) => sum + Number(item.score ?? 0), 0) / weighted.length : 0;
  const evidenceConfidence = weighted.length ? weighted.reduce((sum, item) => sum + Number(item.evidenceConfidence ?? 0), 0) / weighted.length : 0;
  return { schemaVersion: 3, status, ok: status !== 'fail', score: Number(score.toFixed(2)), evidenceConfidence: Number(evidenceConfidence.toFixed(2)), evidenceCount: weighted.reduce((sum, item) => sum + Number(item.evidenceCount ?? 0), 0), findings, blockers };
}

function aggregateApi(apiInput, policy) {
  if (!apiInput?.current) return null;
  const audit = auditApiContract(apiInput.current, policy);
  const compatibility = apiInput.baseline ? compareApiContracts(apiInput.baseline, apiInput.current) : null;
  if (!compatibility || compatibility.compatible) return { ...audit, compatibility };
  const findings = sortFindings([...audit.findings, ...compatibility.breakingChanges]);
  const blockers = findings.filter((finding) => finding.severity === 'blocker');
  return { ...audit, status: 'fail', ok: false, score: Math.min(audit.score, 40), findings, blockers, compatibility, evidenceCount: audit.evidenceCount + 1 };
}

export function runFullstackAudit(input = {}, options = {}) {
  const applicability = options.applicability ?? {};
  const sections = {};
  sections.process = applicability.process === false ? notApplicable() : normalizeProcessReport(input.process);
  sections.frontend = applicability.frontend === false ? notApplicable() : (input.frontend ?? null);
  sections.experience = applicability.experience === false ? notApplicable() : input.experience ? auditExperienceContract(input.experience, options.policies?.experience) : null;
  sections.api = applicability.api === false ? notApplicable() : aggregateApi(input.api, options.policies?.api);
  sections.architecture = applicability.architecture === false ? notApplicable() : input.architecture ? auditArchitectureContract(input.architecture, options.policies?.architecture) : null;
  sections.data = applicability.data === false ? notApplicable() : input.migrations ? auditMigrationPlan(input.migrations, options.policies?.data) : null;
  const security = applicability.security === false ? notApplicable() : input.security ? auditSecurityContract(input.security, options.policies?.security) : null;
  const sourceRisk = applicability.security === false ? notApplicable() : Array.isArray(input.sourceFiles) ? scanSourceFiles(input.sourceFiles, options.policies?.sourceScan) : null;
  sections.securityContract = security;
  sections.sourceRisk = sourceRisk;
  sections.security = applicability.security === false ? notApplicable() : mergeSecurity(security, sourceRisk);
  sections.resilience = applicability.resilience === false ? notApplicable() : input.resilience ? auditResilienceContract(input.resilience, options.policies?.resilience) : null;
  sections.observability = applicability.observability === false ? notApplicable() : input.observability ? auditObservabilityContract(input.observability, options.policies?.observability) : null;
  sections.dependencies = applicability.dependencies === false ? notApplicable() : input.dependencies ? auditDependencyManifest(input.dependencies, options.policies?.dependencies) : null;
  sections.risks = applicability.risks === false ? notApplicable() : input.risks ? evaluateRiskRegister(input.risks, options.policies?.risks) : null;
  const quality = buildFullstackGate(sections, { ...(options.quality ?? {}), gates: options.gates });
  const findings = sortFindings(Object.entries(sections).flatMap(([gate, section]) => (section?.findings ?? []).map((finding) => ({ gate, ...finding }))));
  return { schemaVersion: 4, generatedAt: new Date().toISOString(), project: input.project ?? null, sections, quality, findings };
}
