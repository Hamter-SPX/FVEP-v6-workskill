/**
 * Re-check: the adversarial pass an agent runs against its own work before presenting it.
 *
 * Most bad output is not produced by a model that cannot do the work. It is produced by a
 * model that stopped one step early — it did the work, formed an impression that it was
 * fine, and reported the impression. A re-check replaces that impression with a short,
 * hostile examination: what exactly am I claiming, what proves each claim, how would I know
 * if I were wrong, and what did I never look at?
 *
 * `buildRecheckPlan` produces the checks. `auditRecheckRecord` proves they were really done.
 */

import { containsPlaceholder, finalizeProcessAudit, nonEmpty, processFinding, unique } from './process-audit-utils.mjs';
import { MODES, getMode } from './mode-engine.mjs';

/** Words that promise more than evidence usually supports. */
const ABSOLUTE_LANGUAGE = /\b(guaranteed|definitely|certainly|always works|never fails|fully secure|completely|100%|pixel[- ]perfect|production[- ]ready|bulletproof|flawless|perfectly matches)\b/i;

const HEDGE_WITHOUT_SUBSTANCE = /\b(should work|looks fine|seems correct|probably fine|i think it works)\b/i;

export const UNIVERSAL_CHECKS = Object.freeze([
  {
    id: 'identity',
    category: 'evidence',
    instruction: 'Confirm the artifacts you are judging are the ones that exist now. Re-capture, re-read, or re-hash rather than trusting the version in your context.',
    evidence: 'file hash, timestamp, or a fresh capture path'
  },
  {
    id: 'claim-inventory',
    category: 'claims',
    instruction: 'Write down every claim you are about to make in the final message, as separate sentences. A claim you cannot write down is a claim you cannot support.',
    evidence: 'the list of claims'
  },
  {
    id: 'claim-binding',
    category: 'claims',
    instruction: 'Bind each claim to the specific command output, file, or capture that proves it. Any claim left unbound must be deleted or downgraded to "not verified".',
    evidence: 'claim → evidence mapping'
  },
  {
    id: 'counter-evidence',
    category: 'adversarial',
    instruction: 'Take your two strongest claims and actively try to falsify them. Ask what observation would prove each one false, then go look for that observation.',
    evidence: 'what you tried and what you found'
  },
  {
    id: 'assumptions',
    category: 'adversarial',
    instruction: 'List what you assumed without checking: an API shape, a default, a config value, a user intention. Verify the two that would hurt most if wrong.',
    evidence: 'assumption → verified or still assumed'
  },
  {
    id: 'blind-spots',
    category: 'coverage',
    instruction: 'Name what you never looked at: states, breakpoints, error paths, corners of the frame, other call sites, other seeds. Silence about a region is not evidence about it.',
    evidence: 'the list of unexamined areas'
  },
  {
    id: 'regression',
    category: 'coverage',
    instruction: 'Name what this change could have broken that you did not test, then test the most likely one.',
    evidence: 'the run and its outcome'
  },
  {
    id: 'language',
    category: 'honesty',
    instruction: 'Read your summary and downgrade every sentence that is more confident than its evidence. "Matched" and "secure" and "done" are measured verdicts, not impressions.',
    evidence: 'the sentences you changed'
  }
]);

function normalizeArtifacts(artifacts) {
  if (!artifacts) return [];
  if (Array.isArray(artifacts)) return artifacts.map(String).filter(Boolean);
  return Object.entries(artifacts).map(([key, value]) => `${key}=${value}`);
}

/**
 * Builds the ordered re-check plan for a mode: universal checks, the mode's own checks, and
 * the commands that must be re-run against current artifacts.
 */
export function buildRecheckPlan(input = {}, policy = {}) {
  const modeId = input.mode ? getMode(input.mode).id : null;
  const definition = modeId ? MODES[modeId] : null;
  const depth = String(input.depth ?? policy.depth ?? 'standard');
  const artifacts = normalizeArtifacts(input.artifacts);

  const universal = depth === 'quick'
    ? UNIVERSAL_CHECKS.filter((check) => ['identity', 'claim-binding', 'language'].includes(check.id))
    : [...UNIVERSAL_CHECKS];

  const modeChecks = (definition?.recheck ?? []).map((instruction, index) => ({
    id: `${modeId}-${index + 1}`,
    category: 'mode',
    instruction,
    evidence: 'what you observed when you performed it'
  }));

  const reruns = (definition?.gates ?? []).map((gate) => ({
    id: `rerun:${gate.command.split(' ')[2] ?? gate.command}`,
    category: 'fresh-verification',
    instruction: `Re-run against current artifacts: ${gate.command}`,
    command: gate.command,
    evidence: 'exit status and the decisive line of output'
  }));

  const checks = [...universal, ...modeChecks, ...(depth === 'quick' ? [] : reruns)];

  return {
    schemaVersion: 1,
    mode: modeId,
    depth,
    artifacts,
    minCounterExamples: Number(policy.minCounterExamples ?? (input.independentReviewer === true ? 2 : 3)),
    checks,
    stopRule: 'If any check produces an issue, fix it before presenting. Do not present the work and mention the issue as a footnote.',
    questions: [
      'What is the single most likely way this is wrong?',
      'What did the user ask for that I quietly did not do?',
      'If a hostile reviewer opened this in thirty seconds, what would they find first?'
    ]
  };
}

function claimIssues(claim, index) {
  const findings = [];
  const label = nonEmpty(claim?.statement) ? `"${String(claim.statement).slice(0, 60)}"` : `claim #${index + 1}`;
  const evidence = unique(claim?.evidence ?? []);

  if (!nonEmpty(claim?.statement)) {
    findings.push(processFinding('RECHECK_CLAIM_EMPTY', 'blocker', `Claim #${index + 1} has no statement.`));
    return findings;
  }
  if (containsPlaceholder(claim.statement)) {
    findings.push(processFinding('RECHECK_CLAIM_PLACEHOLDER', 'blocker', `Claim ${label} contains placeholder language.`));
  }
  if (!evidence.length) {
    findings.push(processFinding(
      'RECHECK_CLAIM_UNBOUND',
      'blocker',
      `Claim ${label} has no evidence bound to it.`,
      { remediation: 'Bind it to a command output, file, or capture, or delete the claim from the report.' }
    ));
  }
  if (ABSOLUTE_LANGUAGE.test(claim.statement) && evidence.length < 2) {
    findings.push(processFinding(
      'RECHECK_CLAIM_OVERSTATED',
      'high',
      `Claim ${label} uses absolute language with thin evidence.`,
      { remediation: 'Either add the evidence that earns the word, or state the limit plainly.' }
    ));
  }
  if (HEDGE_WITHOUT_SUBSTANCE.test(claim.statement)) {
    findings.push(processFinding(
      'RECHECK_CLAIM_IMPRESSION',
      'high',
      `Claim ${label} reports an impression rather than an observation.`,
      { remediation: 'Replace it with what you ran and what it returned, or drop it.' }
    ));
  }
  return findings;
}

/**
 * Audits a completed re-check record. This is the gate that stops a re-check from becoming
 * a checkbox: a check cannot be "performed" without an observation, and a clean verdict
 * cannot exist without an adversarial attempt behind it.
 */
export function auditRecheckRecord(record = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;

  let modeId = null;
  if (nonEmpty(record.mode)) {
    try {
      modeId = getMode(record.mode).id;
      evidenceCount += 1;
    } catch {
      findings.push(processFinding('RECHECK_MODE_UNKNOWN', 'high', `Re-check names an unknown mode: ${record.mode}.`));
    }
  } else {
    findings.push(processFinding('RECHECK_MODE_MISSING', 'high', 'Re-check does not say which mode it closes.'));
  }

  const artifacts = normalizeArtifacts(record.artifactIdentity ?? record.artifacts);
  if (!artifacts.length) {
    findings.push(processFinding(
      'RECHECK_ARTIFACT_IDENTITY_MISSING',
      'blocker',
      'Re-check does not identify the artifacts it examined.',
      { remediation: 'Record file paths with hashes, timestamps, or capture identities so freshness is checkable.' }
    ));
  } else evidenceCount += artifacts.length;

  const claims = Array.isArray(record.claims) ? record.claims : [];
  if (!claims.length) {
    findings.push(processFinding(
      'RECHECK_CLAIMS_MISSING',
      'blocker',
      'Re-check lists no claims, so nothing was actually examined.',
      { remediation: 'Write down every sentence you intend to tell the user, then bind each one to evidence.' }
    ));
  } else {
    claims.forEach((claim, index) => findings.push(...claimIssues(claim, index)));
    evidenceCount += claims.reduce((sum, claim) => sum + unique(claim?.evidence ?? []).length, 0);
  }

  const checks = Array.isArray(record.checks) ? record.checks : [];
  const performed = checks.filter((check) => check?.performed === true);
  for (const check of performed) {
    if (!nonEmpty(check.observation)) {
      findings.push(processFinding(
        'RECHECK_CHECK_WITHOUT_OBSERVATION',
        'blocker',
        `Check "${check.id ?? 'unnamed'}" is marked performed but records no observation.`,
        { remediation: 'A performed check produces something you saw. Write it down or mark the check as not performed.' }
      ));
    }
  }
  const minChecks = Number(policy.minChecks ?? 4);
  if (performed.length < minChecks) {
    findings.push(processFinding(
      'RECHECK_TOO_SHALLOW',
      'blocker',
      `Only ${performed.length} check(s) were performed; at least ${minChecks} are required for a real re-check.`,
      { remediation: 'Run npm run recheck -- plan --mode <mode> and work the list.' }
    ));
  } else evidenceCount += performed.length;

  const independent = record.independentReviewer === true;
  const minCounterExamples = Number(policy.minCounterExamples ?? (independent ? 2 : 3));
  const counterExamples = (Array.isArray(record.counterExamples) ? record.counterExamples : [])
    .filter((entry) => nonEmpty(entry?.claim) && nonEmpty(entry?.attemptedFalsification) && nonEmpty(entry?.result));
  if (counterExamples.length < minCounterExamples) {
    findings.push(processFinding(
      'RECHECK_NO_ADVERSARIAL_PASS',
      'blocker',
      `${counterExamples.length} falsification attempt(s) recorded; ${minCounterExamples} are required${independent ? '' : ' when the author re-checks their own work'}.`,
      { remediation: 'For each strong claim, state what observation would prove it false, then go look for that observation.' }
    ));
  } else evidenceCount += counterExamples.length;

  const blindSpots = unique(record.blindSpots ?? []);
  if (!blindSpots.length) {
    findings.push(processFinding(
      'RECHECK_BLIND_SPOTS_MISSING',
      'high',
      'No blind spots were recorded. Every piece of work has areas that were not examined.',
      { remediation: 'Name the states, paths, seeds, or regions you did not look at, so the gap is visible to the user.' }
    ));
  } else evidenceCount += blindSpots.length;

  const issues = Array.isArray(record.issuesFound) ? record.issuesFound : [];
  const unresolved = issues.filter((issue) => issue?.resolved !== true);
  const verdict = String(record.verdict ?? '').toLowerCase();

  if (!['clean', 'issues-found', 'issues-fixed', 'blocked'].includes(verdict)) {
    findings.push(processFinding('RECHECK_VERDICT_INVALID', 'blocker', 'Verdict must be one of: clean, issues-found, issues-fixed, blocked.'));
  }
  if (verdict === 'clean' && !counterExamples.length) {
    findings.push(processFinding(
      'RECHECK_CLEAN_WITHOUT_SEARCH',
      'blocker',
      'A clean verdict requires evidence that you looked for problems, not only that you did not notice any.'
    ));
  }
  if (verdict === 'clean' && unresolved.length) {
    findings.push(processFinding(
      'RECHECK_CLEAN_WITH_OPEN_ISSUES',
      'blocker',
      `Verdict is clean while ${unresolved.length} issue(s) remain unresolved.`
    ));
  }
  if (unresolved.length && policy.allowUnresolvedIssues !== true) {
    findings.push(processFinding(
      'RECHECK_ISSUES_UNRESOLVED',
      'high',
      `${unresolved.length} issue(s) found by the re-check are still open.`,
      {
        detail: unresolved.map((issue) => issue?.summary ?? issue),
        remediation: 'Fix them before presenting. Do not present the work with the issue as a footnote.'
      }
    ));
  }

  if (!nonEmpty(record.residualRisk) && !unique(record.residualRisks ?? []).length) {
    findings.push(processFinding(
      'RECHECK_RESIDUAL_RISK_MISSING',
      'medium',
      'No residual risk was stated. "Nothing could go wrong" is itself a finding worth doubting.'
    ));
  } else evidenceCount += 1;

  if (!independent && !nonEmpty(record.whatWouldChangeMyMind)) {
    findings.push(processFinding(
      'RECHECK_SELF_REVIEW_WITHOUT_DISCONFIRMER',
      'high',
      'When the author re-checks their own work, they must state what would change their mind.',
      { remediation: 'Write the observation that would make you withdraw the main claim.' }
    ));
  }

  const audit = finalizeProcessAudit(findings, {
    schemaVersion: 1,
    evidenceCount,
    evidenceConfidence: artifacts.length ? 100 : 40
  });

  return {
    ...audit,
    mode: modeId,
    verdict: audit.hardFailures.length
      ? 'recheck-insufficient'
      : audit.warnings.length
        ? 'recheck-passed-with-notes'
        : 'recheck-passed',
    counts: {
      claims: claims.length,
      boundClaims: claims.filter((claim) => unique(claim?.evidence ?? []).length > 0).length,
      checksPerformed: performed.length,
      counterExamples: counterExamples.length,
      blindSpots: blindSpots.length,
      issuesFound: issues.length,
      issuesOpen: unresolved.length
    }
  };
}

export function formatRecheckPlan(plan) {
  const lines = [
    `=== RE-CHECK PLAN${plan.mode ? ` — ${plan.mode}` : ''} (${plan.depth}) ===`,
    'Work this list before you present anything. A check you skip is a claim you cannot make.',
    ''
  ];
  let index = 1;
  for (const check of plan.checks) {
    lines.push(`${String(index).padStart(2)}. [${check.category}] ${check.instruction}`);
    if (check.command) lines.push(`    $ ${check.command}`);
    lines.push(`    record: ${check.evidence}`);
    index += 1;
  }
  lines.push(
    '',
    `Falsification attempts required: ${plan.minCounterExamples}`,
    '',
    'Ask yourself, in writing:'
  );
  for (const question of plan.questions) lines.push(`  - ${question}`);
  lines.push('', plan.stopRule);
  return `${lines.join('\n')}\n`;
}

export function formatRecheckReport(result) {
  const lines = [
    `=== RE-CHECK AUDIT${result.mode ? ` — ${result.mode}` : ''} ===`,
    `verdict=${result.verdict}  ok=${result.ok}  score=${result.score}`,
    `claims=${result.counts.boundClaims}/${result.counts.claims} bound  checks=${result.counts.checksPerformed}  falsification=${result.counts.counterExamples}  blindSpots=${result.counts.blindSpots}  issues=${result.counts.issuesOpen}/${result.counts.issuesFound} open`
  ];
  const actionable = (result.findings ?? []).filter((finding) => finding.severity !== 'info');
  if (actionable.length) {
    lines.push('', 'findings:');
    for (const finding of actionable) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.message}`);
      if (finding.remediation) lines.push(`  fix: ${finding.remediation}`);
    }
  } else {
    lines.push('', 'The re-check is complete and honest. Present the work.');
  }
  return `${lines.join('\n')}\n`;
}
