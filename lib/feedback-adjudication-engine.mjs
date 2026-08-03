import { finalizeProcessAudit, nonEmpty, processFinding } from './process-audit-utils.mjs';

const VERIFICATION_STATUSES = new Set(['supported', 'unsupported', 'unclear', 'not-checked']);
const DISPOSITIONS = new Set(['accept', 'reject', 'defer']);

export function auditFeedbackDisposition(record = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const verification = record.verification ?? {};
  const status = String(verification.status ?? 'not-checked');
  const disposition = String(record.disposition ?? '');

  if (!nonEmpty(record.findingId)) findings.push(processFinding('FEEDBACK_FINDING_ID_MISSING', 'blocker', 'Feedback record requires a finding id.'));
  if (!nonEmpty(record.requirementRestatement)) findings.push(processFinding('FEEDBACK_NOT_UNDERSTOOD', 'blocker', 'Feedback must be restated as a concrete technical requirement before action.'));
  if (!VERIFICATION_STATUSES.has(status)) findings.push(processFinding('FEEDBACK_VERIFICATION_STATUS_INVALID', 'blocker', 'Verification status is invalid.'));
  if (!DISPOSITIONS.has(disposition)) findings.push(processFinding('FEEDBACK_DISPOSITION_INVALID', 'blocker', 'Disposition must be accept, reject, or defer.'));

  const checkedFiles = Array.isArray(verification.checkedFiles) ? verification.checkedFiles : [];
  const commands = Array.isArray(verification.commands) ? verification.commands : [];
  const evidenceIds = Array.isArray(verification.evidenceIds) ? verification.evidenceIds : [];
  evidenceCount += checkedFiles.length + commands.length + evidenceIds.length;
  if (status === 'not-checked' || checkedFiles.length === 0 || evidenceIds.length === 0) findings.push(processFinding('FEEDBACK_NOT_VERIFIED', 'blocker', 'Feedback must be checked against codebase reality with evidence.'));
  if (!nonEmpty(record.rationale)) findings.push(processFinding('FEEDBACK_RATIONALE_MISSING', 'blocker', 'Disposition requires a technical rationale.'));

  if (status === 'unclear' && disposition !== 'defer') findings.push(processFinding('UNCLEAR_FEEDBACK_ACTIONED', 'blocker', 'Unclear feedback cannot be accepted or rejected until clarified.'));

  if (disposition === 'accept') {
    if (status !== 'supported') findings.push(processFinding('BLIND_FEEDBACK_ACCEPTANCE', 'blocker', 'Accepted feedback must be verified as technically supported.'));
    if (!nonEmpty(record.implementation?.changeId) || record.implementation?.verified !== true || !Array.isArray(record.implementation?.testEvidenceIds) || record.implementation.testEvidenceIds.length === 0) findings.push(processFinding('ACCEPTED_FEEDBACK_NOT_VERIFIED', 'blocker', 'Accepted feedback requires implemented change identity and passing test evidence.'));
    else evidenceCount += record.implementation.testEvidenceIds.length + 1;
  }

  if (disposition === 'reject') {
    if (status !== 'unsupported') findings.push(processFinding('UNSUPPORTED_REJECTION', 'blocker', 'Rejected feedback must be verified as unsupported for this codebase.'));
    if (evidenceIds.length === 0) findings.push(processFinding('REJECTION_EVIDENCE_MISSING', 'blocker', 'Rejection requires technical evidence.'));
  }

  if (disposition === 'defer') {
    const deferral = record.deferral ?? {};
    if (!nonEmpty(deferral.owner) || !nonEmpty(deferral.dueAt) || !nonEmpty(deferral.residualRisk)) findings.push(processFinding('DEFERRAL_GOVERNANCE_MISSING', 'blocker', 'Deferred feedback requires owner, due date, and residual-risk statement.'));
    else evidenceCount += 1;
  }

  const report = finalizeProcessAudit(findings, { evidenceCount, evidenceConfidence: evidenceCount ? 100 : 0 });
  return {
    ...report,
    findingId: record.findingId ?? null,
    source: record.source ?? null,
    verificationStatus: status,
    disposition: disposition || null,
    actionAllowed: report.hardFailures.length === 0,
    policy: { requireCodebaseVerification: true, ...policy }
  };
}
