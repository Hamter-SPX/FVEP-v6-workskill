# Receiving Code Review

## Why this exists

Review findings arrive with authority — a reviewer said them, often a human
said them — and authority is corrosive. The natural agent response is to
agree and start editing: change accepted before it is understood, understood
before it is verified against the actual code. That reflex breaks in both
directions at once. It implements wrong findings, wasting real work on
imaginary defects; and it rubber-stamps right findings without ever checking
which file and line actually misbehave.

Every finding therefore goes through adjudication before it goes anywhere
near code: restate it as a concrete technical requirement, check that
requirement against the codebase with evidence, then disposition it —
accept, reject, or defer — with a written rationale. The auditor is
`lib/feedback-adjudication-engine.mjs`, sharing
`references/review-and-feedback-governance.md` with the requesting side.
Its vocabulary is blunt: `FEEDBACK_NOT_UNDERSTOOD`,
`FEEDBACK_NOT_VERIFIED`, `BLIND_FEEDBACK_ACCEPTANCE`,
`UNSUPPORTED_REJECTION`. Agreement without proof fails the audit exactly as
hard as dismissal without proof.

## When to use

- For every finding returned by a reviewer from
  `flow/requesting-code-review.md` — before any fix is written.
- For external feedback generally: human review comments, audit reports,
  user objections raised mid-task.
- When `flow/flow-map.json` names this doc as companion of the review or
  debug mode.

## The flow

1. Collect the finding's identity: stable id, source (reviewer, human,
   automated audit), severity, and the exact message. If the wording is
   ambiguous, ask the source now — an adjudicated misreading costs more than
   a clarification question.

2. Restate the finding as a concrete technical requirement in this codebase:
   which component, which behaviour, which observable wrongness. Record it in
   the ruling (`templates/feedback-ruling.md`). If you cannot restate it
   technically, the status is `unclear` — and unclear findings may not be
   accepted or rejected, only deferred pending clarification
   (`UNCLEAR_FEEDBACK_ACTIONED` blocks the rest).

3. Verify against codebase reality before any disposition. Read the named
   code and run something that exercises it:

   ```bash
   rg -n "functionName|pattern" src lib
   node --test tests/unit/<relevant>.test.mjs
   ```

   Record the files read, the commands run, and evidence ids (commit hashes,
   line anchors, test-run ids). Feedback checked against memory of the code
   is not checked — `FEEDBACK_NOT_VERIFIED` requires real `checkedFiles` and
   `evidenceIds`, and a verification status of `not-checked` blocks any
   action.

4. Pick the disposition the verification supports — not the disposition that
   is socially easiest:
   - **accept** — the finding is correct *here* (`status: supported`); fix it
     now, test-first per `flow/test-driven-development.md`.
   - **reject** — the finding does not hold in this codebase
     (`status: unsupported`); the evidence must show why: the guard exists
     elsewhere, the claim rests on a framework assumption that is false for
     this stack, the path it names cannot occur.
   - **defer** — real, but out of scope or timing (`templates/feedback-ruling.md`
     then requires an owner, a due date, and a residual-risk statement;
     `DEFERRAL_GOVERNANCE_MISSING` otherwise).

5. Write the rationale. One or two honest technical sentences citing the
   evidence from step 3. `FEEDBACK_RATIONALE_MISSING` blocks a rationale-free
   disposition — including "the reviewer insisted".

6. For accepted findings: implement with change identity and passing test
   evidence (`changeId`, `testEvidenceIds`, `verified: true` in the record),
   then put the round's scoped diff through review again per
   `flow/requesting-code-review.md`:

   ```bash
   npm run process:review -- --input .superpowers/sdd/<plan-slug>/task-N-review-chain.json
   ```

   An accepted finding without tested implementation fails as
   `ACCEPTED_FEEDBACK_NOT_VERIFIED`.

7. Close the ruling in the workspace next to the review chain (shape:
   `schemas/feedback-disposition.schema.json`). A load-bearing finding never
   gets parked or deferred into silence — it resolves, or it stops the plan
   as a human decision.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Finding restated | `templates/feedback-ruling.md` | requirement restatement field names component, behaviour, observable defect |
| Codebase verification | `rg` / `node --test` runs recorded | checked files, commands, and evidence ids present; status is `supported` or `unsupported`, never `not-checked` |
| Disposition coherent | `lib/feedback-adjudication-engine.mjs` | accept ⟸ supported; reject ⟸ unsupported plus evidence; unclear ⟸ defer only |
| Acceptance implemented | `npm run process:review -- --input <chain>.json` | change id and passing test evidence recorded; round re-review binds the fix diff |
| Deferral governed | `schemas/feedback-disposition.schema.json` | owner, due date, and residual-risk statement all present |

## Anti-patterns

- Do not accept feedback because it sounds authoritative ("good point, I'll
  fix it") without the verification step — blind acceptance is an audited
  blocker, and wrong findings implemented confidently are the most expensive
  kind.
- Do not reject feedback because it is inconvenient or came late; rejection
  needs the same evidence standard as acceptance, pointed the other way.
- Do not partially implement an unclear finding. Clarify and defer, or
  clarify and act — half-understood changes are how new defects are born.
- Do not write the rationale before the verification; the order is evidence
  first, disposition second, wording last.
- Do not treat "the reviewer is more senior" as verification status —
  seniority is not in the engine's enum; `supported` and `unsupported` are.
- Do not fix an accepted finding without test evidence and then mark it
  addressed; addressed means re-reviewed against a tested change.
