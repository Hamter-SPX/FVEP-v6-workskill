import { finalizeProcessAudit, nonEmpty, processFinding, unique } from './process-audit-utils.mjs';

const BLOCKING_SEVERITIES = new Set(['critical', 'important']);
const VERDICTS = new Set(['pass', 'fail']);

export function auditReviewChain(chain = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const maxFixRounds = Number(policy.maxFixRounds ?? 5);
  const implementerId = String(chain.implementer?.id ?? '');

  if (!nonEmpty(chain.taskId)) findings.push(processFinding('REVIEW_TASK_ID_MISSING', 'blocker', 'Review chain requires a task id.'));
  if (!nonEmpty(chain.brief?.hash)) findings.push(processFinding('TASK_BRIEF_HASH_MISSING', 'blocker', 'Task brief hash is required.'));
  if (!nonEmpty(chain.changePackage?.baseId) || !nonEmpty(chain.changePackage?.headId) || !nonEmpty(chain.changePackage?.diffHash)) findings.push(processFinding('CHANGE_PACKAGE_INCOMPLETE', 'blocker', 'Change package requires base, head, and diff hash.'));
  if (chain.changePackage?.bounded !== true || !Array.isArray(chain.changePackage?.files) || chain.changePackage.files.length === 0) findings.push(processFinding('UNBOUNDED_CHANGE_PACKAGE', 'blocker', 'Review requires a bounded change package with explicit files.'));
  if (!implementerId || !nonEmpty(chain.implementer?.reportHash) || !Array.isArray(chain.implementer?.testEvidenceIds) || chain.implementer.testEvidenceIds.length === 0) findings.push(processFinding('IMPLEMENTER_REPORT_INCOMPLETE', 'blocker', 'Implementer identity, report hash, and test evidence are required.'));
  else evidenceCount += chain.implementer.testEvidenceIds.length + 1;

  const reviews = Array.isArray(chain.reviews) ? chain.reviews : [];
  if (reviews.length === 0) findings.push(processFinding('TASK_REVIEW_MISSING', 'blocker', 'At least one independent task review is required.'));
  const reviewById = new Map();
  for (const [index, review] of reviews.entries()) {
    const path = `reviews[${index}]`;
    const id = String(review?.id ?? '');
    if (!id || reviewById.has(id)) findings.push(processFinding('REVIEW_ID_INVALID', 'blocker', 'Review ids must be present and unique.', { path }));
    else reviewById.set(id, review);
    if (!nonEmpty(review?.reviewerId)) findings.push(processFinding('REVIEWER_ID_MISSING', 'blocker', 'Review requires reviewer identity.', { path }));
    if (String(review?.reviewerId ?? '') === implementerId) findings.push(processFinding('SELF_REVIEW_FORBIDDEN', 'blocker', 'Implementer cannot approve their own change.', { path }));
    if (!VERDICTS.has(review?.specVerdict)) findings.push(processFinding('SPEC_VERDICT_MISSING', 'blocker', 'Review requires an explicit specification verdict.', { path }));
    if (!VERDICTS.has(review?.qualityVerdict)) findings.push(processFinding('QUALITY_VERDICT_MISSING', 'blocker', 'Review requires an explicit code-quality verdict.', { path }));
    if (review?.briefHash !== chain.brief?.hash) findings.push(processFinding('REVIEW_BRIEF_HASH_MISMATCH', 'blocker', 'Review is not bound to the current task brief.', { path }));
    if (review?.kind === 'task-review' && review?.diffHash !== chain.changePackage?.diffHash) findings.push(processFinding('REVIEW_DIFF_HASH_MISMATCH', 'blocker', 'Task review is not bound to the reviewed change package.', { path }));
    evidenceCount += 1;
  }

  const fixRounds = Array.isArray(chain.fixRounds) ? chain.fixRounds : [];
  if (fixRounds.length > maxFixRounds) findings.push(processFinding('FIX_LOOP_LIMIT_EXCEEDED', 'blocker', `Review fix loop exceeds the ${maxFixRounds}-round circuit breaker.`));
  const seenRounds = new Set();
  for (const [index, round] of fixRounds.entries()) {
    const path = `fixRounds[${index}]`;
    const number = Number(round?.round);
    if (!Number.isInteger(number) || number < 1 || number > maxFixRounds || seenRounds.has(number)) findings.push(processFinding('FIX_ROUND_NUMBER_INVALID', 'blocker', 'Fix rounds must be unique integers within policy.', { path }));
    seenRounds.add(number);
    if (!nonEmpty(round?.baseId) || !nonEmpty(round?.headId) || !Array.isArray(round?.testEvidenceIds) || round.testEvidenceIds.length === 0) findings.push(processFinding('FIX_ROUND_EVIDENCE_MISSING', 'blocker', 'Each fix round requires bounded change identity and covering tests.', { path }));
    const reReview = reviewById.get(String(round?.reReviewId ?? ''));
    if (!reReview || reReview.kind !== 're-review' || Number(reReview.round) !== number) findings.push(processFinding('FIX_ROUND_REVIEW_MISSING', 'blocker', 'Every fix round requires a matching scoped re-review.', { path }));
    if (number >= 4 && String(round?.implementerId ?? '') === implementerId) findings.push(processFinding('FIX_LOOP_ESCALATION_MISSING', 'high', 'Rounds four and five should use fresh implementation ownership or capability escalation.', { path }));
    evidenceCount += Array.isArray(round?.testEvidenceIds) ? round.testEvidenceIds.length : 0;
  }

  const reviewFindings = Array.isArray(chain.findings) ? chain.findings : [];
  const findingIds = new Set();
  let openBlockingFindings = 0;
  for (const [index, finding] of reviewFindings.entries()) {
    const path = `findings[${index}]`;
    const id = String(finding?.id ?? '');
    if (!id || findingIds.has(id)) findings.push(processFinding('REVIEW_FINDING_ID_INVALID', 'blocker', 'Review finding ids must be present and unique.', { path }));
    findingIds.add(id);
    if (BLOCKING_SEVERITIES.has(finding?.severity) && finding?.status === 'open') {
      openBlockingFindings += 1;
      findings.push(processFinding('OPEN_BLOCKING_REVIEW_FINDING', 'blocker', `Open ${finding.severity} finding ${id} blocks task completion.`, { path, detail: finding?.message }));
    }
    if (finding?.status === 'addressed' && !nonEmpty(finding?.reReviewId)) findings.push(processFinding('ADDRESSED_FINDING_NOT_REREVIEWED', 'blocker', 'Addressed finding requires scoped re-review evidence.', { path }));
    if (finding?.status === 'parked') {
      const humanPlanDecision = finding?.planConflict === true && nonEmpty(finding?.humanDecision?.actor) && nonEmpty(finding?.humanDecision?.decision) && nonEmpty(finding?.humanDecision?.at);
      if (Number(finding?.parkedAtRound ?? 0) < maxFixRounds && !humanPlanDecision) findings.push(processFinding('PREMATURE_FINDING_ADJUDICATION', 'blocker', 'Finding may be parked before the circuit breaker only through an explicit human plan-conflict decision.', { path }));
      if (!nonEmpty(finding?.ruling)) findings.push(processFinding('PARKED_FINDING_RULING_MISSING', 'blocker', 'Parked finding requires a technical ruling.', { path }));
      if (finding?.loadBearing === true) findings.push(processFinding('LOAD_BEARING_FINDING_PARKED', 'blocker', 'Load-bearing finding cannot be parked while dependent work or integration continues.', { path }));
    }
  }

  const finalReview = chain.finalReview;
  if (policy.requireFinalReview !== false) {
    if (!finalReview) findings.push(processFinding('FINAL_REVIEW_MISSING', 'blocker', 'Whole-change final review is required.'));
    else {
      if (String(finalReview.reviewerId ?? '') === implementerId) findings.push(processFinding('FINAL_REVIEW_NOT_INDEPENDENT', 'blocker', 'Final reviewer must be independent from the implementer.'));
      if (!nonEmpty(finalReview?.reviewerId) || !nonEmpty(finalReview?.diffHash) || !VERDICTS.has(finalReview?.verdict)) findings.push(processFinding('FINAL_REVIEW_INCOMPLETE', 'blocker', 'Final review requires reviewer, diff hash, and explicit verdict.'));
      if (finalReview?.diffHash !== chain.changePackage?.diffHash) findings.push(processFinding('FINAL_REVIEW_DIFF_MISMATCH', 'blocker', 'Final review is not bound to the full reviewed change package.'));
      if (finalReview?.verdict === 'fail') findings.push(processFinding('FINAL_REVIEW_FAILED', 'blocker', 'Final review verdict is fail.'));
      for (const id of unique(finalReview?.residualFindingIds ?? [])) if (!findingIds.has(id)) findings.push(processFinding('FINAL_REVIEW_UNKNOWN_FINDING', 'high', `Final review references unknown finding ${id}.`));
      evidenceCount += 1;
    }
  }

  const report = finalizeProcessAudit(findings, { evidenceCount, evidenceConfidence: evidenceCount ? 100 : 0 });
  return {
    ...report,
    independentReview: !report.hardFailures.some((item) => ['SELF_REVIEW_FORBIDDEN', 'FINAL_REVIEW_NOT_INDEPENDENT'].includes(item.code)),
    openBlockingFindings,
    fixRoundCount: fixRounds.length,
    reviewerIds: unique([...reviews.map((item) => item?.reviewerId), finalReview?.reviewerId]),
    policy: { maxFixRounds, requireFinalReview: policy.requireFinalReview !== false }
  };
}
