const ORDER = Object.freeze({ blocker: 0, high: 1, medium: 2, low: 3, info: 4 });
const PENALTY = Object.freeze({ blocker: 50, high: 18, medium: 7, low: 2, info: 0 });

export function processFinding(code, severity, message, details = {}) {
  if (!Object.hasOwn(ORDER, severity)) throw new TypeError(`Unsupported severity: ${severity}`);
  return {
    code: String(code),
    severity,
    message: String(message),
    ...(details.path ? { path: String(details.path) } : {}),
    ...(details.detail !== undefined ? { detail: details.detail } : {}),
    ...(details.remediation ? { remediation: String(details.remediation) } : {}),
    ...(details.evidence ? { evidence: [...new Set([].concat(details.evidence).map(String))] } : {})
  };
}

export function finalizeProcessAudit(findings = [], options = {}) {
  const ordered = [...findings].sort((a, b) => (ORDER[a.severity] ?? 99) - (ORDER[b.severity] ?? 99) || a.code.localeCompare(b.code) || String(a.path ?? '').localeCompare(String(b.path ?? '')));
  const hardFailures = ordered.filter((item) => item.severity === 'blocker');
  const warnings = ordered.filter((item) => item.severity !== 'blocker' && item.severity !== 'info');
  const penalty = ordered.reduce((sum, item) => sum + (PENALTY[item.severity] ?? 0), 0);
  const score = Math.max(0, Math.min(100, Number(options.baseScore ?? 100) - penalty));
  const status = hardFailures.length > 0 ? (options.blockedStatus ? 'blocked' : 'fail') : warnings.length > 0 ? 'warning' : 'pass';
  return {
    schemaVersion: Number(options.schemaVersion ?? 4),
    status,
    ok: hardFailures.length === 0,
    score,
    evidenceCount: Math.max(0, Number(options.evidenceCount ?? 0)),
    evidenceConfidence: Math.max(0, Math.min(100, Number(options.evidenceConfidence ?? 100))),
    findings: ordered,
    hardFailures,
    blockers: hardFailures,
    warnings
  };
}

export function nonEmpty(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

export function containsPlaceholder(value) {
  return /\b(TODO|TBD|FIXME|implement later|fill in details|add appropriate|write tests for the above|similar to task)\b/i.test(String(value ?? ''));
}

export function unique(values = []) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null && String(value).trim()).map(String))];
}
