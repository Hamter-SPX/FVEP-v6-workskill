const SEVERITY_ORDER = Object.freeze({ blocker: 0, high: 1, medium: 2, low: 3, info: 4 });
const PENALTIES = Object.freeze({ blocker: 45, high: 18, medium: 7, low: 2, info: 0 });

export function clamp(value, min = 0, max = 100) {
  const number = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(number) ? number : min));
}

export function asArray(value) {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

export function nonEmpty(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

export function makeFinding(code, severity, message, details = {}) {
  if (!Object.hasOwn(SEVERITY_ORDER, severity)) throw new TypeError(`Unsupported finding severity: ${severity}`);
  return {
    code: String(code),
    severity,
    message: String(message),
    ...(details.path ? { path: String(details.path) } : {}),
    ...(details.detail !== undefined ? { detail: details.detail } : {}),
    ...(details.remediation ? { remediation: String(details.remediation) } : {}),
    ...(details.evidence ? { evidence: asArray(details.evidence).map(String) } : {})
  };
}

export function sortFindings(findings = []) {
  return [...findings].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99) || String(a.code).localeCompare(String(b.code)) || String(a.path ?? '').localeCompare(String(b.path ?? '')));
}

export function finalizeAudit(findings = [], options = {}) {
  const sorted = sortFindings(findings);
  const blockers = sorted.filter((finding) => finding.severity === 'blocker');
  const highs = sorted.filter((finding) => finding.severity === 'high');
  const mediums = sorted.filter((finding) => finding.severity === 'medium');
  const lows = sorted.filter((finding) => finding.severity === 'low');
  const penalty = sorted.reduce((sum, finding) => sum + (PENALTIES[finding.severity] ?? 0), 0);
  const score = clamp(Number(options.baseScore ?? 100) - penalty);
  const evidenceCount = Math.max(0, Number(options.evidenceCount ?? 0) || 0);
  const evidenceConfidence = clamp(options.evidenceConfidence ?? (evidenceCount > 0 ? 100 : 0));
  const status = blockers.length > 0 ? 'fail' : sorted.some((finding) => ['high', 'medium', 'low'].includes(finding.severity)) ? 'warning' : 'pass';
  return {
    schemaVersion: Number(options.schemaVersion ?? 3),
    status,
    ok: status !== 'fail',
    score,
    evidenceCount,
    evidenceConfidence: Number(evidenceConfidence.toFixed(2)),
    findings: sorted,
    blockers,
    highs,
    warnings: [...highs, ...mediums, ...lows]
  };
}

export function percentage(passed, total) {
  if (total <= 0) return 0;
  return Number(((passed / total) * 100).toFixed(2));
}

export function uniqueStrings(values = []) {
  return [...new Set(asArray(values).filter(nonEmpty).map((value) => String(value)))];
}
