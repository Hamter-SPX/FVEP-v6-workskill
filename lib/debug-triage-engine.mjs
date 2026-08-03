import { clamp, makeFinding, sortFindings } from './audit-utils.mjs';

function confidence(value) { return clamp(Number(value ?? 0.5), 0, 1); }

function boundaryScores(evidence) {
  const scores = new Map();
  for (const item of evidence) {
    if (!item?.boundary) continue;
    const weight = confidence(item.confidence);
    const delta = item.state === 'fail' ? weight : item.state === 'pass' ? -weight * 0.5 : 0;
    scores.set(String(item.boundary), (scores.get(String(item.boundary)) ?? 0) + delta);
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]);
}

export function rankIncidentHypotheses(input = {}, policy = {}) {
  const evidence = Array.isArray(input?.evidence) ? input.evidence : [];
  const hypotheses = Array.isArray(input?.hypotheses) ? input.hypotheses : [];
  const evidenceById = new Map(evidence.map((item, index) => [String(item?.id ?? `evidence-${index + 1}`), item]));
  const findings = [];
  const suspectedBoundary = boundaryScores(evidence)[0]?.[0] ?? null;

  const rankedHypotheses = hypotheses.map((raw, index) => {
    const id = String(raw?.id ?? `hypothesis-${index + 1}`);
    let rawScore = 0;
    const missingEvidence = [];
    for (const evidenceId of raw?.supportingEvidence ?? []) {
      const item = evidenceById.get(String(evidenceId));
      if (!item) missingEvidence.push(String(evidenceId));
      else rawScore += confidence(item.confidence);
    }
    for (const evidenceId of raw?.contradictingEvidence ?? []) {
      const item = evidenceById.get(String(evidenceId));
      if (!item) missingEvidence.push(String(evidenceId));
      else rawScore -= confidence(item.confidence);
    }
    if (raw?.boundary && raw.boundary === suspectedBoundary) rawScore += 0.35;
    if (!raw?.falsificationTest) findings.push(makeFinding('debug-falsification-test-missing', 'high', `Hypothesis ${id} has no falsification test.`, { path: `hypotheses.${id}` }));
    for (const evidenceId of missingEvidence) findings.push(makeFinding('debug-evidence-reference-missing', 'high', `Hypothesis ${id} references unknown evidence ${evidenceId}.`, { path: `hypotheses.${id}`, detail: evidenceId }));
    const score = Number(clamp((rawScore + 2) * 25, 0, 100).toFixed(2));
    return {
      id,
      statement: String(raw?.statement ?? 'Unnamed hypothesis'),
      boundary: raw?.boundary ? String(raw.boundary) : null,
      status: String(raw?.status ?? 'open'),
      score,
      rawScore: Number(rawScore.toFixed(4)),
      supportingEvidence: (raw?.supportingEvidence ?? []).map(String),
      contradictingEvidence: (raw?.contradictingEvidence ?? []).map(String),
      falsificationTest: raw?.falsificationTest ? String(raw.falsificationTest) : null
    };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const top = rankedHypotheses[0] ?? null;
  const topHasContradiction = top ? top.contradictingEvidence.some((id) => evidenceById.has(id)) : true;
  const rootCauseConfirmed = Boolean(top && top.status === 'confirmed' && top.supportingEvidence.length > 0 && !topHasContradiction && top.score >= Number(policy.confirmationScore ?? 80));
  const nextActions = [];
  if (top?.falsificationTest && !rootCauseConfirmed) nextActions.push(`Test hypothesis ${top.id}: ${top.falsificationTest}`);
  if (suspectedBoundary) nextActions.push(`Collect synchronized logs, metrics, and traces on boundary ${suspectedBoundary} using one correlation identifier.`);
  if (!evidence.some((item) => item?.correlationId)) nextActions.push('Add or recover a correlation identifier before drawing a cross-component conclusion.');

  return {
    schemaVersion: 3,
    incidentId: String(input?.incident?.id ?? 'incident'),
    suspectedBoundary,
    rootCauseConfirmed,
    rankedHypotheses,
    findings: sortFindings(findings),
    nextActions,
    evidenceCount: evidence.length,
    hypothesisCount: hypotheses.length,
    conclusion: rootCauseConfirmed ? `Root cause confirmed by hypothesis ${top.id}.` : 'Root cause is not confirmed; continue falsification-led investigation.'
  };
}
