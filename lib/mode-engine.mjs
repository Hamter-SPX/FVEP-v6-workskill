/**
 * Operating modes.
 *
 * A mode is not a personality switch. It is a contract: what this phase of work is allowed
 * to do, what it must not do yet, which gates produce its evidence, and what has to be true
 * before it can end. Modes exist so an agent cannot drift from "let me look at this" into
 * "I rewrote your layout" without crossing a visible boundary.
 */

import { finalizeProcessAudit, processFinding, unique } from './process-audit-utils.mjs';

function mode(definition) {
  return Object.freeze({
    ...definition,
    triggers: Object.freeze([...(definition.triggers ?? [])]),
    strongTriggers: Object.freeze([...(definition.strongTriggers ?? [])]),
    allows: Object.freeze([...(definition.allows ?? [])]),
    forbids: Object.freeze([...(definition.forbids ?? [])]),
    gates: Object.freeze((definition.gates ?? []).map((gate) => Object.freeze({ ...gate }))),
    entry: Object.freeze([...(definition.entry ?? [])]),
    exit: Object.freeze([...(definition.exit ?? [])]),
    recheck: Object.freeze([...(definition.recheck ?? [])]),
    references: Object.freeze([...(definition.references ?? [])])
  });
}

export const MODES = Object.freeze({
  analyze: mode({
    id: 'analyze',
    title: 'Analyze',
    purpose: 'Understand the system, the request, and the risk before anything is changed.',
    strongTriggers: ['วิเคราะห์', 'ตรวจสอบให้หน่อย', 'analyse', 'analyze', 'investigate', 'explain how'],
    triggers: ['ดูให้หน่อย', 'อ่านโค้ด', 'สรุปให้', 'review the codebase', 'what does this do', 'assess', 'audit the'],
    allows: ['Reading any file', 'Running read-only commands', 'Asking clarifying questions', 'Writing findings and notes'],
    forbids: ['Editing production files', 'Creating branches or commits', 'Proposing an implementation as if it were approved'],
    gates: [
      { command: 'npm run process:route -- --input request.json', why: 'Name the disciplines this work will require.' }
    ],
    entry: [],
    exit: [
      'The request is restated in one sentence the user would accept',
      'The relevant files, contracts, and constraints are named',
      'Open questions and risks are listed, with what is unknown marked unknown'
    ],
    recheck: [
      'Re-read the original request and check the restatement did not quietly narrow it',
      'Name at least one way the current understanding could be wrong',
      'Confirm every factual claim about the codebase came from a file that was actually opened'
    ],
    references: ['references/skill-routing-and-precedence.md', 'references/risk-discovery-and-adversarial-review.md']
  }),

  'design-ui': mode({
    id: 'design-ui',
    title: 'Design UI/UX',
    purpose: 'Choose a visual and interaction direction that can be checked against a render.',
    strongTriggers: ['ออกแบบ ui', 'รีดีไซน์', 'redesign', 'restyle', 'ปรับ ui', 'เปลี่ยนดีไซน์', 'make it look'],
    triggers: ['ดีไซน์', 'design the', 'ux', 'ทำให้สวย', 'visual direction', 'สวยขึ้น', 'ปรับหน้าตา'],
    allows: ['Direction exploration', 'Aesthetic profile authorship', 'State and flow design', 'Non-production mockups'],
    forbids: [
      'Writing production UI code before an explicit เริ่มเขียน confirmation',
      'Presenting near-duplicate options as a choice',
      'Recording the chosen look only in chat'
    ],
    gates: [
      { command: 'npm run direction:runtime', why: 'Decide how options can be presented in this host.' },
      { command: 'npm run direction:distinctness -- --options design/direction-options/options.json', why: 'Block near-duplicate options before the user sees them.' },
      { command: 'npm run direction:gate -- --spec design/visual-direction-spec.md', why: 'Prove the direction was chosen and confirmed.' }
    ],
    entry: ['A reference, screenshot, or written intent for the surface'],
    exit: [
      'Two or three distinct options were presented and one was chosen by number',
      'design/visual-direction-spec.md exists and records what stays and what changes',
      'The user confirmed เริ่มเขียน, or the mode ends without implementation'
    ],
    recheck: [
      'Confirm the options differed on at least two personality axes, not only in accent colour',
      'Check every profile entry against a render: anything unverifiable is not direction',
      'Confirm no production code was written before the confirmation'
    ],
    references: ['references/visual-direction-exploration.md', 'references/aesthetic-direction-protocol.md', 'references/anti-generic-design.md']
  }),

  'match-ref': mode({
    id: 'match-ref',
    title: 'Match Reference',
    purpose: 'Close the gap between the reference the user wants and the render that exists.',
    strongTriggers: ['ให้เหมือนต้นฉบับ', 'ทำให้ตรงกับรูป', 'match the reference', 'ไม่เหมือนรูป', 'ยังไม่เหมือน', 'ตามรูปนี้'],
    triggers: ['เทียบรูป', 'compare to the ref', 'pixel perfect', 'ให้ตรงกับดีไซน์', 'ยังไม่ถูกใจ', 'แก้ให้เหมือน'],
    allows: ['Capturing current renders', 'Measuring differences', 'One targeted change per round'],
    forbids: [
      'Changing more than one variable per round',
      'Loosening tolerances so a failing comparison passes',
      'Claiming a match without a current triage run'
    ],
    gates: [
      { command: 'npm run vision:triage -- --ref <ref.png> --cur <cur.png> --history .fx/triage-history.json', why: 'Rank differences and get one next change.' }
    ],
    entry: ['A reference image', 'A current capture of the built surface'],
    exit: [
      'vision:triage returns verdict=match on current artifacts',
      'or the remaining residual is stated and the user accepts it',
      'or a stall is reported with a hypothesis instead of a fourth guess'
    ],
    recheck: [
      'Confirm the cur capture is from after the last change, not before it',
      'Confirm each round changed exactly one thing and the ledger shows it',
      'Confirm no tolerance or policy value was edited to produce the pass'
    ],
    references: ['references/visual-delta-triage.md', 'references/vision-loop-protocol.md']
  }),

  'design-game': mode({
    id: 'design-game',
    title: 'Design Game Content',
    purpose: 'Design scenes, levels, maps, and assets that survive the engine and the play camera.',
    strongTriggers: ['ออกแบบเกม', 'ทำแมพ', 'สร้างแมพ', 'design a level', 'game asset', 'ทำฉาก', 'roblox map'],
    triggers: ['เกม', 'level design', 'blockout', 'asset', 'ฉาก', 'vfx', 'sfx', 'ตัวละคร', 'props'],
    allows: ['Scene briefs', 'Blockout geometry', 'Asset specs', 'Style pack selection', 'Budget declaration'],
    forbids: [
      'Materials and lighting before the blockout passes the scene gate',
      'Approving an asset from a turntable render',
      'Stating a size without a unit and a comparison reference'
    ],
    gates: [
      { command: 'npm run audit:scene -- --image artifacts/frame.png --brief design/scene-brief.json', why: 'The frame must be finished in every corner, not only at the subject.' },
      { command: 'npm run audit:game-assets -- --assets design/game-assets.json', why: 'Each asset must be buildable, budgeted, on-style, and proven in context.' }
    ],
    entry: ['A one-sentence player fantasy', 'A chosen graphics style pack'],
    exit: [
      'The scene gate passes on the establishing shot and the worst procedural seed',
      'The asset set passes with the frame budget applied',
      'In-context captures exist from the gameplay camera at play distance'
    ],
    recheck: [
      'View every asset as a black silhouette at 64px and confirm none are confusable',
      'Confirm each scale statement names a reference such as avatar height',
      'Confirm gameplay-critical VFX and SFX still read when three of them overlap'
    ],
    references: ['references/game-vision-loop.md', 'references/scene-completeness.md', 'references/game-asset-direction.md', 'references/world-building-and-level-blockout.md']
  }),

  implement: mode({
    id: 'implement',
    title: 'Implement',
    purpose: 'Build the approved change as a complete vertical slice with test-first evidence.',
    strongTriggers: ['เริ่มเขียน', 'implement', 'ลงมือทำ', 'เขียนโค้ดเลย', 'build it', 'ทำเลย'],
    triggers: ['เพิ่มฟีเจอร์', 'add a feature', 'สร้างหน้า', 'refactor', 'แก้ให้รองรับ', 'ทำต่อ'],
    allows: ['Editing source', 'Writing tests first', 'Running the suite', 'Committing on a safe branch'],
    forbids: [
      'Production behaviour before an observed RED test',
      'Implementing on a protected branch',
      'Starting without a validated plan for multi-step work'
    ],
    gates: [
      { command: 'npm run process:workspace -- --snapshot workspace.json', why: 'Do not implement on a protected or borrowed workspace.' },
      { command: 'npm run process:plan -- --plan implementation-plan.json', why: 'Exact files, interfaces, and the test-first cycle.' },
      { command: 'npm run process:tdd -- --evidence tdd-evidence.json', why: 'RED before production behaviour, GREEN bound to the changed artifact.' }
    ],
    entry: ['An approved design', 'A validated implementation plan', 'A safe workspace'],
    exit: [
      'Every planned task is implemented with RED/GREEN evidence',
      'The relevant domain gates pass on current artifacts',
      'Nothing was left half-wired behind a flag without saying so'
    ],
    recheck: [
      'Re-run the full suite from a clean state, not from the last incremental run',
      'Read the diff as a reviewer would and find the weakest part of it',
      'Confirm every state and error path in the plan actually exists in the code'
    ],
    references: ['references/executable-planning.md', 'references/tdd-evidence-protocol.md', 'references/fullstack-operating-model.md']
  }),

  debug: mode({
    id: 'debug',
    title: 'Debug',
    purpose: 'Locate the failing boundary before changing anything.',
    strongTriggers: ['บั๊ก', 'พัง', 'error', 'ไม่ทำงาน', 'debug', 'crash', 'ทำไมมันไม่'],
    triggers: ['fix the bug', 'incident', 'exception', 'หาสาเหตุ', 'เพี้ยน', 'ผลลัพธ์ผิด'],
    allows: ['Reproduction attempts', 'Instrumentation', 'Bisecting', 'One-variable experiments'],
    forbids: [
      'Fixing a symptom before the boundary is localized',
      'Changing several things to see what helps',
      'A fourth speculative fix without architectural review'
    ],
    gates: [
      { command: 'npm run debug:triage -- --evidence incident-evidence.json', why: 'Structure the hypotheses and the evidence behind them.' },
      { command: 'npm run process:tdd -- --evidence tdd-evidence.json', why: 'A regression test must fail before the fix lands.' }
    ],
    entry: ['A reproduction, or an explicit statement that reproduction is not yet stable'],
    exit: [
      'The last confirmed-good and first confirmed-bad boundary is named',
      'A regression test failed before the fix and passes after it',
      'The root cause is stated, distinct from the symptom'
    ],
    recheck: [
      'Confirm the fix would have failed the regression test before it was applied',
      'Look for the same defect class elsewhere in the codebase',
      'Confirm the explanation accounts for every observed symptom, not just the loudest one'
    ],
    references: ['references/scientific-debugging-protocol.md', 'references/fullstack-systematic-debugging.md']
  }),

  review: mode({
    id: 'review',
    title: 'Review',
    purpose: 'Judge someone else\'s change on both specification and quality, with findings that cite evidence.',
    strongTriggers: ['รีวิว', 'review this', 'ตรวจงาน', 'code review', 'ช่วยดูโค้ด'],
    triggers: ['pr', 'pull request', 'ตรวจให้หน่อย', 'critique', 'วิจารณ์'],
    allows: ['Reading the bounded diff', 'Running the suite', 'Recording findings with severity'],
    forbids: [
      'Reviewing your own implementation',
      'Raising a preference as a defect',
      'Approving while a load-bearing finding is parked'
    ],
    gates: [
      { command: 'npm run process:review -- --chain review-chain.json', why: 'Independence, dual verdicts, and bounded fix loops.' },
      { command: 'npm run aesthetics:review -- --config vision-loop.config.json', why: 'For rendered surfaces, judgment bound to the current artifact.' }
    ],
    entry: ['A bounded change package', 'The brief it claims to implement'],
    exit: [
      'A spec verdict and a quality verdict are both recorded',
      'Every finding names region, expected, observed, and the rule violated',
      'Critical and important findings are fixed and re-reviewed, or explicitly ruled on'
    ],
    recheck: [
      'Separate what you observed from what you inferred, and label the inferences',
      'Check whether any finding is really a preference with no rule behind it',
      'Confirm you verified the reviewer claims against the codebase rather than trusting them'
    ],
    references: ['references/review-and-feedback-governance.md', 'references/aesthetic-scoring-anchors.md']
  }),

  ship: mode({
    id: 'ship',
    title: 'Ship',
    purpose: 'Convert finished work into a release decision the user makes with full evidence.',
    strongTriggers: ['ปล่อยงาน', 'merge', 'deploy', 'release', 'ส่งงาน', 'pr เลย'],
    triggers: ['พร้อมส่ง', 'ship it', 'ปิดงาน', 'rollout', 'ขึ้น production'],
    allows: ['Running release gates', 'Packaging evidence', 'Presenting integration options'],
    forbids: [
      'Selecting merge, push, cleanup, or discard for the user',
      'Claiming completion from stale or unscoped evidence',
      'Cleaning a workspace the system does not own'
    ],
    gates: [
      { command: 'npm run process:audit -- --config process.config.json', why: 'Process evidence is a hard release gate.' },
      { command: 'npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json', why: 'Domain evidence must be current and passing.' },
      { command: 'npm run process:integration -- --decision integration-decision.json', why: 'The integration choice belongs to the user.' }
    ],
    entry: ['Passing gates on current artifacts', 'A completed review chain'],
    exit: [
      'The completion report follows the contract, including residual risks and gaps',
      'The allowed integration options are presented without one being chosen',
      'Rollback is described and has been exercised at least once'
    ],
    recheck: [
      'Confirm each claim word — finished, fixed, matched, secure — is backed by a named run',
      'Confirm the evidence is from the current artifact hash, not an earlier one',
      'State what was not verified as plainly as what was'
    ],
    references: ['references/verification-and-claim-governance.md', 'references/fullstack-release-and-rollback.md', 'references/integration-and-cleanup.md']
  }),

  'author-skill': mode({
    id: 'author-skill',
    title: 'Author Skill',
    purpose: 'Change this skill, or another skill, without weakening the guarantees it makes.',
    strongTriggers: ['แก้สกิล', 'พัฒนาสกิล', 'edit the skill', 'skill.md', 'เขียนสกิล', 'authoring a skill'],
    triggers: ['add a gate', 'เพิ่มเกต', 'rule', 'prompt pack', 'ปรับ reference'],
    allows: ['Editing skill files', 'Adding engines, gates, references, and tests', 'Regenerating the bundle'],
    forbids: [
      'Adding guidance with no gate or test behind it',
      'Weakening a check so existing work passes',
      'Shipping a reference the skill surface never mentions'
    ],
    gates: [
      { command: 'npm test', why: 'Every engine keeps its unit coverage.' },
      { command: 'npm run validate', why: 'Required files, syntax, dangerous patterns, CLI smoke tests, bundled examples.' },
      { command: 'npm run skill:conformance', why: 'Metadata, references, pressure coverage, and CLI identity.' },
      { command: 'npm run docs:all-in-one', why: 'The combined reference stays in sync with its sources.' }
    ],
    entry: ['A named failure the change is supposed to prevent'],
    exit: [
      'The new behaviour has a test that fails without it',
      'validate passes with zero errors',
      'The pressure scenarios cover the failure mode being prevented'
    ],
    recheck: [
      'Confirm the new rule is enforced by code, not only described in Markdown',
      'Confirm no existing gate was relaxed to make the suite green',
      'Read the new documentation as a first-time user and find the sentence that would confuse them'
    ],
    references: ['references/skill-authoring-conformance.md', 'references/verification-and-claim-governance.md']
  }),

  recover: mode({
    id: 'recover',
    title: 'Recover Context',
    purpose: 'Resume work whose context was lost, without re-deciding what was already decided.',
    strongTriggers: ['ทำต่อจากเดิม', 'กลับมาทำต่อ', 'resume', 'context หาย', 'continue the previous', 'ต่องานเก่า'],
    triggers: ['ค้างไว้', 'where were we', 'สรุปที่ทำไปแล้ว', 'pick up', 'งานเก่า'],
    allows: ['Reading the ledger and artifacts', 'Reconstructing state', 'Asking the user to confirm the resumed phase'],
    forbids: [
      'Re-deciding an approved design from memory',
      'Assuming an unfinished phase is finished',
      'Discarding artifacts that look stale without checking'
    ],
    gates: [
      { command: 'npm run process:audit -- --config process.config.json', why: 'Read which phases already have evidence and which are open.' }
    ],
    entry: ['Access to the process ledger or the artifacts on disk'],
    exit: [
      'The current phase is identified with the evidence that proves it',
      'Open decisions are listed and returned to the user, not guessed',
      'Work resumes in the correct mode rather than restarting'
    ],
    recheck: [
      'Confirm every "already done" claim maps to an artifact that exists now',
      'Confirm no approval was inferred from a conversation summary alone',
      'List what the ledger cannot tell you, so the gap is visible'
    ],
    references: ['references/context-recovery-ledger.md', 'references/process-kernel-overview.md']
  })
});

export const MODE_IDS = Object.freeze(Object.keys(MODES));

export function listModes() {
  return MODE_IDS.map((id) => MODES[id]);
}

export function getMode(id) {
  const key = String(id ?? '').trim().toLowerCase();
  if (!Object.hasOwn(MODES, key)) {
    throw new RangeError(`Unknown mode "${id}". Known modes: ${MODE_IDS.join(', ')}.`);
  }
  return MODES[key];
}

function countMatches(haystack, needles) {
  const matched = [];
  for (const needle of needles) {
    if (haystack.includes(String(needle).toLowerCase())) matched.push(needle);
  }
  return matched;
}

/**
 * Picks the mode a request belongs to. Ambiguity is reported rather than resolved silently,
 * because entering the wrong mode is how an agent ends up editing code during a question.
 */
export function resolveMode(requestText, options = {}) {
  const text = String(requestText ?? '').toLowerCase();
  const scored = listModes().map((candidate) => {
    const strong = countMatches(text, candidate.strongTriggers);
    const weak = countMatches(text, candidate.triggers);
    return {
      id: candidate.id,
      title: candidate.title,
      score: strong.length * 3 + weak.length,
      matched: unique([...strong, ...weak])
    };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const [top, second] = scored;
  const fallback = String(options.fallback ?? 'analyze');
  const noSignal = top.score === 0;
  const ambiguous = !noSignal && second && top.score - second.score < 2;

  return {
    mode: noSignal ? fallback : top.id,
    confidence: noSignal ? 'none' : ambiguous ? 'low' : top.score >= 3 ? 'high' : 'medium',
    needsConfirmation: noSignal || ambiguous,
    reason: noSignal
      ? `No mode trigger matched, so the safe default is ${fallback}. Confirm the mode before acting.`
      : ambiguous
        ? `"${top.id}" and "${second.id}" scored within one point. Ask which one applies before acting.`
        : `Matched: ${top.matched.join(', ')}.`,
    candidates: scored.filter((candidate) => candidate.score > 0).slice(0, 3)
  };
}

/** Checks whether a mode is allowed to end. Missing evidence keeps the mode open. */
export function auditModeExit(input = {}, policy = {}) {
  const target = getMode(input.mode);
  const findings = [];
  const completed = unique(input.completedGates ?? []);
  const confirmations = unique(input.confirmations ?? []);
  const artifacts = unique(input.artifacts ?? []);
  const violations = unique(input.performedForbidden ?? []);
  let evidenceCount = completed.length + artifacts.length + confirmations.length;

  const gateSatisfied = (gate) => completed.some((entry) => {
    const value = String(entry).toLowerCase();
    return value === gate.command.toLowerCase() || gate.command.toLowerCase().includes(value) || value.includes(gate.command.split(' -- ')[0].toLowerCase());
  });

  const missingGates = target.gates.filter((gate) => !gateSatisfied(gate));
  if (missingGates.length && policy.allowMissingGates !== true) {
    findings.push(processFinding(
      'MODE_GATE_NOT_RUN',
      'blocker',
      `Mode "${target.id}" cannot close: ${missingGates.length} required gate(s) were not run.`,
      { detail: missingGates.map((gate) => ({ command: gate.command, why: gate.why })) }
    ));
  }

  for (const violation of violations) {
    findings.push(processFinding(
      'MODE_FORBIDDEN_ACTION',
      'blocker',
      `Mode "${target.id}" forbids this and it was performed: ${violation}.`,
      { remediation: 'Undo or disclose the action, then re-enter the correct mode.' }
    ));
  }

  const requiredConfirmations = unique(policy.requiredConfirmations ?? (target.id === 'design-ui' ? ['เริ่มเขียน'] : []));
  const missingConfirmations = requiredConfirmations.filter((needed) => !confirmations.includes(needed));
  if (missingConfirmations.length) {
    findings.push(processFinding(
      'MODE_CONFIRMATION_MISSING',
      'blocker',
      `Mode "${target.id}" requires explicit user confirmation: ${missingConfirmations.join(', ')}.`
    ));
  }

  const requiredArtifacts = unique(policy.requiredArtifacts ?? []);
  const missingArtifacts = requiredArtifacts.filter((artifact) => !artifacts.includes(artifact));
  if (missingArtifacts.length) {
    findings.push(processFinding(
      'MODE_ARTIFACT_MISSING',
      'high',
      `Expected artifacts were not produced: ${missingArtifacts.join(', ')}.`
    ));
  }

  if (input.recheckPerformed !== true) {
    findings.push(processFinding(
      'MODE_RECHECK_NOT_PERFORMED',
      policy.recheckSeverity ?? 'high',
      `Mode "${target.id}" was closed without the re-check pass.`,
      { remediation: `Run: npm run recheck -- plan --mode ${target.id}, perform the checks, then record the result.` }
    ));
  } else evidenceCount += target.recheck.length;

  const audit = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount ? 100 : 0 });
  return {
    ...audit,
    mode: target.id,
    verdict: audit.hardFailures.length ? 'mode-open' : audit.warnings.length ? 'mode-closable-with-notes' : 'mode-closed',
    missingGates: missingGates.map((gate) => gate.command),
    exitConditions: [...target.exit]
  };
}

function bullets(title, items, marker = '-') {
  if (!items.length) return [];
  return ['', title, ...items.map((item) => `  ${marker} ${item}`)];
}

/** Terminal card for a mode: the contract, on one screen. */
export function formatModeCard(target) {
  const definition = typeof target === 'string' ? getMode(target) : target;
  const lines = [
    `=== MODE: ${definition.title.toUpperCase()} (${definition.id}) ===`,
    definition.purpose
  ];
  lines.push(...bullets('ALLOWED', [...definition.allows]));
  lines.push(...bullets('FORBIDDEN', [...definition.forbids], '×'));
  if (definition.entry.length) lines.push(...bullets('ENTRY REQUIRES', [...definition.entry]));
  if (definition.gates.length) {
    lines.push('', 'GATES');
    for (const gate of definition.gates) lines.push(`  $ ${gate.command}`, `    ${gate.why}`);
  }
  lines.push(...bullets('EXIT WHEN', [...definition.exit]));
  lines.push(...bullets('RE-CHECK BEFORE CLOSING', [...definition.recheck]));
  lines.push(...bullets('READ', [...definition.references]));
  return `${lines.join('\n')}\n`;
}

export function formatModeList() {
  const lines = ['=== OPERATING MODES ===', ''];
  for (const definition of listModes()) {
    lines.push(`${definition.id.padEnd(13)} ${definition.purpose}`);
  }
  lines.push('', 'npm run mode -- show <id>            print the full contract');
  lines.push('npm run mode -- resolve "<request>"  pick the mode for a request');
  lines.push('npm run mode -- check --mode <id> --state state.json');
  return `${lines.join('\n')}\n`;
}
