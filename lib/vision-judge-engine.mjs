/**
 * Vision judge slot — one verdict schema, three judge modes:
 *   metrics (threshold gates), model (vision-capable agent package),
 *   human (explicit human verdict). All verdicts share one record shape.
 */
export const VERDICTS = ['pass', 'warn', 'fail'];

const SEVERITIES = ['warn', 'fail'];

// Strict record shape — mirrors schemas/vision-judgment.schema.json
// (additionalProperties: false).
const RECORD_KEYS = new Set([
  'schema_version', 'case_label', 'mode', 'verdict', 'findings',
  'metrics_ref', 'capture_ref', 'judged_by', 'judged_at', 'goal'
]);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function ruleSeverity(raw) {
  if (raw && typeof raw === 'object' && 'severity' in raw) {
    if (!SEVERITIES.includes(raw.severity)) {
      throw new TypeError(`severity must be ${SEVERITIES.join('|')}`);
    }
    return { value: raw.value, severity: raw.severity };
  }
  return { value: raw, severity: 'fail' };
}

export function evaluateMetrics(metrics, thresholds = {}) {
  const findings = [];
  const occ = metrics?.occupancy;
  const align = metrics?.alignment;
  const con = metrics?.contrast;

  // Standing rule (no threshold required): the engine-estimated background is
  // "suspect" (gradient border / modal ring / fully-occupied grid) — all other
  // occupancy-derived metrics may be skewed, so warn unconditionally.
  if (occ?.suspectBackground === true) {
    findings.push({
      rule: 'suspectBackground',
      severity: 'warn',
      expected: 'stable background estimate',
      observed: { share: occ.backgroundShare ?? null, suspect: true }
    });
  }

  const rules = [
    ['maxEmptyCells', () => (occ ? occ.emptyCells.length : 0), 'max'],
    ['minAlignment', () => align?.score, 'min'],
    ['maxDarkShare', () => con?.darkShare, 'max'],
    ['minDarkShare', () => con?.darkShare, 'min'],
    ['maxLightShare', () => con?.lightShare, 'max'],
    ['minLightShare', () => con?.lightShare, 'min']
  ];

  for (const [rule, readObserved, direction] of rules) {
    if (!(rule in thresholds)) continue;
    const { value: expected, severity } = ruleSeverity(thresholds[rule]);
    const observed = readObserved();
    if (observed === null || observed === undefined) continue; // alignment.score=null (no edges) means SKIP, not fail
    const breached = direction === 'max' ? observed > expected : observed < expected;
    if (breached) {
      findings.push({ rule, severity, expected, observed });
    }
  }
  return findings;
}

function verdictFromFindings(findings) {
  if (findings.some((f) => f.severity === 'fail')) return 'fail';
  if (findings.some((f) => f.severity === 'warn')) return 'warn';
  return 'pass';
}

export function buildVerdictRecord({
  mode, caseLabel, goal, verdict, findings = [], metricsRef, captureRef, judgedBy, judgedAt
}) {
  if (!VERDICTS.includes(verdict)) throw new TypeError(`verdict must be ${VERDICTS.join('|')}`);
  return {
    schema_version: 1,
    case_label: caseLabel ?? 'screen',
    mode,
    verdict,
    findings,
    metrics_ref: metricsRef ?? null,
    capture_ref: captureRef ?? null,
    judged_by: judgedBy ?? mode,
    judged_at: judgedAt ?? new Date().toISOString(),
    goal: goal ?? null
  };
}

export function judgeMetrics({ metrics, thresholds = {}, caseLabel, goal, metricsRef, captureRef }) {
  const findings = evaluateMetrics(metrics, thresholds);
  return buildVerdictRecord({
    mode: 'metrics', caseLabel, goal,
    verdict: verdictFromFindings(findings), findings,
    metricsRef, captureRef, judgedBy: 'metrics-engine'
  });
}

export function validateVerdictRecord(parsed) {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new TypeError('verdict record must be an object');
  }
  if (typeof parsed.case_label !== 'string' || parsed.case_label === '') {
    throw new TypeError('case_label is required (string)');
  }
  if (!VERDICTS.includes(parsed.verdict)) {
    throw new TypeError(`verdict must be ${VERDICTS.join('|')}`);
  }
  if (typeof parsed.judged_at !== 'string' || !ISO_DATE_RE.test(parsed.judged_at) || Number.isNaN(Date.parse(parsed.judged_at))) {
    throw new TypeError('judged_at must be an ISO date string');
  }
  if (!Array.isArray(parsed.findings)) {
    throw new TypeError('findings must be an array');
  }
  if (parsed.schema_version !== 1) {
    throw new TypeError('schema_version must be 1');
  }
  if (typeof parsed.judged_by !== 'string' || parsed.judged_by === '') {
    throw new TypeError('judged_by is required (string)');
  }
  for (const key of Object.keys(parsed)) {
    if (!RECORD_KEYS.has(key)) throw new TypeError(`unknown key in verdict record: ${key}`);
  }
  return parsed;
}
