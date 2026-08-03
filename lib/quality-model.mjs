const DEFAULT_GATE_WEIGHTS = Object.freeze({
  visual: 30,
  responsive: 15,
  accessibility: 15,
  runtime: 10,
  engineering: 15,
  performance: 10,
  interaction: 5,
  aesthetic: 10
});

const STATUS_SCORES = Object.freeze({ pass: 100, warning: 70, fail: 0, skipped: 0, unknown: 0 });
const ASSESSED_STATUSES = new Set(['pass', 'warning', 'fail']);
const VALID_STATUSES = new Set([...ASSESSED_STATUSES, 'skipped', 'unknown', 'not-applicable']);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeWeight(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new RangeError(`Gate weight for ${name} must be a non-negative number.`);
  return number;
}

function grade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function scoreQualityGates(gates = {}, policy = {}) {
  if (!gates || typeof gates !== 'object' || Array.isArray(gates)) throw new TypeError('gates must be an object.');
  const weights = { ...DEFAULT_GATE_WEIGHTS, ...(policy.weights ?? {}) };
  const minScore = Number(policy.minScore ?? 85);
  const minConfidence = Number(policy.minConfidence ?? 80);
  const failOnAnyGateFailure = policy.failOnAnyGateFailure !== false;
  if (![minScore, minConfidence].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
    throw new RangeError('minScore and minConfidence must be between 0 and 100.');
  }

  const normalized = {};
  let applicableWeight = 0;
  let assessedWeight = 0;
  let weightedScore = 0;
  const failedGates = [];
  const hardFailures = [];

  for (const [name, rawGate] of Object.entries(gates)) {
    const gate = rawGate && typeof rawGate === 'object' ? rawGate : { status: String(rawGate ?? 'unknown') };
    const status = String(gate.status ?? 'unknown');
    if (!VALID_STATUSES.has(status)) throw new TypeError(`Unsupported gate status for ${name}: ${status}.`);
    const weight = normalizeWeight(gate.weight ?? weights[name] ?? 0, name);
    const explicitMissingEvidence = gate.evidenceCount !== undefined && Number(gate.evidenceCount) <= 0;
    const assessed = ASSESSED_STATUSES.has(status) && !explicitMissingEvidence;
    const score = status === 'not-applicable' ? null : clamp(Number(gate.score ?? STATUS_SCORES[status] ?? 0), 0, 100);
    const evidenceConfidence = status === 'not-applicable' ? null : assessed ? clamp(Number(gate.evidenceConfidence ?? 100), 0, 100) : 0;
    const evidenceStatus = status === 'not-applicable' ? 'not-applicable' : assessed ? (evidenceConfidence < 100 ? 'partial' : 'present') : 'missing';

    if (status !== 'not-applicable') {
      applicableWeight += weight;
      if (assessed) assessedWeight += weight * (evidenceConfidence / 100);
      weightedScore += weight * (score / 100);
    }
    if (status === 'fail') {
      failedGates.push(name);
      if (gate.hard) hardFailures.push(name);
    }
    normalized[name] = {
      ...gate,
      status,
      weight,
      score,
      evidenceStatus,
      evidenceConfidence,
      evidenceCount: gate.evidenceCount === undefined ? null : Math.max(0, Number(gate.evidenceCount) || 0)
    };
  }

  const score = applicableWeight > 0 ? (weightedScore / applicableWeight) * 100 : 0;
  const confidence = applicableWeight > 0 ? (assessedWeight / applicableWeight) * 100 : 0;
  const passed = hardFailures.length === 0
    && (!failOnAnyGateFailure || failedGates.length === 0)
    && score >= minScore
    && confidence >= minConfidence;

  return {
    schemaVersion: 1,
    score: Number(score.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    grade: grade(score),
    passed,
    minScore,
    minConfidence,
    failOnAnyGateFailure,
    failedGates,
    hardFailures,
    gates: normalized
  };
}

export { DEFAULT_GATE_WEIGHTS };
