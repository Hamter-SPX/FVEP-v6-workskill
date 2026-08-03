import { finalizeAudit, makeFinding, nonEmpty, percentage } from './audit-utils.mjs';

const DEFAULT_REQUIRED = Object.freeze(['authentication', 'authorization', 'inputValidation', 'secrets', 'auditLogging', 'encryptionInTransit']);

function controlState(control) {
  if (typeof control === 'string') return { status: control, evidence: [] };
  return { status: String(control?.status ?? 'missing'), evidence: Array.isArray(control?.evidence) ? control.evidence : [] };
}

export function auditSecurityContract(contract = {}, policy = {}) {
  const controls = contract?.controls && typeof contract.controls === 'object' ? contract.controls : {};
  const features = new Set((contract?.features ?? []).map(String));
  const required = new Set([...(policy.requiredControls ?? DEFAULT_REQUIRED)]);
  if (features.has('multi-tenant')) required.add('authorization');
  if (features.has('file-upload')) required.add('fileUploads');
  if (features.has('browser-session')) required.add('csrf');
  if (features.has('outbound-http')) required.add('ssrf');
  const findings = [];
  let checks = 0;
  let passed = 0;
  let evidenceUnits = 0;
  let evidencePresent = 0;

  for (const name of required) {
    const control = controlState(controls[name]);
    checks += 1;
    evidenceUnits += 1;
    if (control.evidence.length) evidencePresent += 1;
    if (control.status === 'implemented') passed += 1;
    else {
      let code = `security-control-${name}-incomplete`;
      let severity = 'blocker';
      let message = `Required security control ${name} is ${control.status}.`;
      if (name === 'authorization' && features.has('multi-tenant')) { code = 'security-object-authorization-incomplete'; message = 'Multi-tenant object authorization is not fully implemented and evidenced.'; }
      if (name === 'secrets') { code = 'security-secrets-control-missing'; message = 'Secrets storage, rotation, and exposure controls are not implemented.'; }
      if (name === 'fileUploads') { code = 'security-upload-control-incomplete'; message = 'File upload validation, storage isolation, malware handling, and content serving controls are incomplete.'; }
      if (control.status === 'partial' && !['authorization', 'secrets', 'fileUploads'].includes(name)) severity = 'high';
      findings.push(makeFinding(code, severity, message, { path: `controls.${name}` }));
    }
    if (control.status === 'implemented' && !control.evidence.length) findings.push(makeFinding('security-control-evidence-missing', 'medium', `Implemented control ${name} has no linked evidence.`, { path: `controls.${name}`, detail: name }));
  }

  for (const finding of contract?.findings ?? []) {
    const severity = String(finding?.severity ?? 'high');
    if (!['blocker', 'high', 'medium', 'low', 'info'].includes(severity)) continue;
    findings.push(makeFinding(String(finding?.code ?? 'security-declared-finding'), severity, String(finding?.message ?? 'Declared security finding.'), { path: finding?.path, detail: finding?.detail }));
  }

  const controlConfidence = percentage(evidencePresent, evidenceUnits);
  const coverageConfidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: Object.keys(controls).length, evidenceConfidence: Math.min(controlConfidence || 0, coverageConfidence || 0) });
  return { ...report, requiredControls: [...required], coverage: { required: checks, implemented: passed, confidence: coverageConfidence }, evidenceCoverage: { required: evidenceUnits, present: evidencePresent, confidence: controlConfidence } };
}
