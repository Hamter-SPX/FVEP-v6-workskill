import { containsPlaceholder, finalizeProcessAudit, nonEmpty, processFinding } from './process-audit-utils.mjs';

const DESIGN_SECTIONS = Object.freeze(['architecture', 'components', 'dataFlow', 'errorHandling', 'testing']);
const SELF_REVIEW = Object.freeze(['placeholderScan', 'consistency', 'scope', 'ambiguity']);

export function auditDesignGovernance(contract = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;

  if (contract.context?.explored !== true) findings.push(processFinding('CONTEXT_NOT_EXPLORED', 'blocker', 'Project context was not explored before design.'));
  else evidenceCount += 1;
  if (!Array.isArray(contract.context?.artifacts) || contract.context.artifacts.length === 0) findings.push(processFinding('CONTEXT_EVIDENCE_MISSING', 'high', 'Context exploration has no artifact references.'));
  else evidenceCount += contract.context.artifacts.length;

  const approaches = Array.isArray(contract.approaches) ? contract.approaches : [];
  const minimumApproaches = Number(policy.minimumApproaches ?? 2);
  if (approaches.length < minimumApproaches) findings.push(processFinding('INSUFFICIENT_APPROACHES', 'blocker', `Design must compare at least ${minimumApproaches} viable approaches.`));
  for (const [index, approach] of approaches.entries()) {
    if (!nonEmpty(approach?.summary) || !Array.isArray(approach?.tradeoffs) || approach.tradeoffs.length === 0) findings.push(processFinding('INCOMPLETE_APPROACH', 'high', 'Each design approach requires a summary and trade-offs.', { path: `approaches[${index}]` }));
    else evidenceCount += 1;
  }

  if (!nonEmpty(contract.recommendation?.approachId) || !approaches.some((item) => String(item?.id) === String(contract.recommendation?.approachId))) findings.push(processFinding('INVALID_RECOMMENDATION', 'blocker', 'Recommendation must select a declared approach.'));
  if (!nonEmpty(contract.recommendation?.rationale)) findings.push(processFinding('RECOMMENDATION_RATIONALE_MISSING', 'high', 'Recommendation requires a technical rationale.'));

  for (const section of DESIGN_SECTIONS) {
    if (!nonEmpty(contract.design?.[section])) findings.push(processFinding('DESIGN_SECTION_MISSING', 'blocker', `Design section ${section} is required.`, { path: `design.${section}` }));
    else evidenceCount += 1;
  }

  const serialized = JSON.stringify(contract.design ?? {});
  if (containsPlaceholder(serialized)) findings.push(processFinding('PLACEHOLDER_LANGUAGE', 'blocker', 'Design contains placeholder or vague implementation language.'));

  const approved = contract.approval?.status === 'approved' && nonEmpty(contract.approval?.actor) && nonEmpty(contract.approval?.at);
  const exception = nonEmpty(contract.bestEffortException?.reason) && nonEmpty(contract.bestEffortException?.scope) && contract.bestEffortException?.followUpRequired === true;
  if (!approved) {
    if (exception && policy.allowBestEffortException === true) findings.push(processFinding('BEST_EFFORT_EXCEPTION_USED', 'medium', 'Design approval was bypassed under an explicit best-effort exception.', { detail: contract.bestEffortException }));
    else findings.push(processFinding('DESIGN_NOT_APPROVED', 'blocker', 'Design requires explicit approval before implementation.'));
  } else evidenceCount += 1;

  const failedReview = SELF_REVIEW.filter((key) => contract.selfReview?.[key] !== 'pass');
  if (failedReview.length > 0) findings.push(processFinding('SELF_REVIEW_FAILED', 'blocker', 'Design self-review did not pass every required check.', { detail: failedReview }));
  else evidenceCount += SELF_REVIEW.length;

  return finalizeProcessAudit(findings, { evidenceCount, evidenceConfidence: evidenceCount > 0 ? 100 : 0 });
}
