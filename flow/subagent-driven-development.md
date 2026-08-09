# Subagent-Driven Development

## Why this exists

A plan executed entirely inside one conversation has no separation between the
claim and the check: the same context writes the code, writes the tests, and
declares the work good. Subagent-driven development rebuilds that separation
with roles. One task is executed by one fresh implementer who receives a
bounded brief and nothing else; the output is judged by an independent reviewer
who receives a bounded change package and nothing else; critical or important
findings pass through a bounded fix loop; a final reviewer judges the whole
change. The role contract lives in `references/subagent-task-lifecycle.md`;
the auditor that enforces it is `lib/review-governance-engine.mjs`.

Fresh context per task is a feature, not overhead. Because the implementer
reads the brief rather than the chat history, the brief must be complete and
every artifact must be real. Coordination state — which task sits where in the
loop, how many fix rounds have burned — lives in an append-only ledger (see
`references/context-recovery-ledger.md`), so a compacted or restarted session
recovers position from the ledger and git history instead of from memory.

## When to use

- The implement mode in `flow/flow-map.json` names this doc its primary flow:
  a validated, task-decomposed plan plus a host that can dispatch subagents.
- Any multi-task change where an independent verdict per task matters more
  than raw velocity.
- Not for single-line fixes, and not when no subagent runtime exists — that
  case runs the same plan through `flow/executing-plans.md`.

## The flow

1. Take the next task in the plan's execution order and write its brief from
   `templates/task-brief.md` into the workspace
   (`.superpowers/sdd/<plan-slug>/task-N-brief.md`). The brief is the
   implementer's entire world: files to create, modify, and test; interfaces
   consumed and produced; the RED command with its expected failure; the GREEN
   command with its expected result; non-goals; and the durable report path.

2. Capture the base identity — `git rev-parse HEAD` — so the later change
   package has an honest base, and classify the workspace:

   ```bash
   npm run process:workspace -- --output .superpowers/sdd/<plan-slug>/workspace.json
   ```

   First task of the plan also establishes isolation per
   `flow/using-git-worktrees.md`.

3. Mark the task in-progress in the workspace ledger `progress.md`, then
   dispatch one fresh implementer with the brief file and nothing else. Do not
   paste conversation history into the dispatch prompt — the brief template
   forbids it, because the brief is the source of truth.

4. The implementer works test-first per `flow/test-driven-development.md`,
   commits with a focused message, and writes the report named in the brief:
   changes, commands with real output, commit hash, and factual concerns. The
   returned summary is exactly: status, commit hash, one-line test summary,
   concerns.

5. Assemble the review package from `templates/review-package.md`: brief hash,
   base and head identities, diff hash over the bounded file list, test
   evidence, implementer report hash, and known concerns. Dispatch an
   independent reviewer who receives this package — not the implementer's
   runtime and not your impressions.

6. The reviewer returns two explicit verdicts — spec (does the change satisfy
   the brief's acceptance behavior) and quality (is the change well-made) —
   plus findings with stable ids, severity, location, and load-bearing status,
   and a list of what could not be verified.

7. Record the chain in the workspace (shape:
   `examples/process/review-chain.json`) and audit it:

   ```bash
   npm run process:review -- --input .superpowers/sdd/<plan-slug>/task-N-review-chain.json
   ```

   Exit 1 means the loop is unfinished. `SELF_REVIEW_FORBIDDEN`,
   `UNBOUNDED_CHANGE_PACKAGE`, and `OPEN_BLOCKING_REVIEW_FINDING` are the
   common blockers.

8. Run the fix loop for critical and important findings — at most five rounds,
   the policy default in `lib/review-governance-engine.mjs`:
   - Rounds 1–3 resume the same implementer: context is warm and cheap.
   - Rounds 4–5 require a fresh implementer or a capability escalation; the
     engine raises `FIX_LOOP_ESCALATION_MISSING` when late rounds reuse the
     original implementer.
   - Every round carries its own test evidence and a scoped re-review bound to
     the round's diff — otherwise `FIX_ROUND_REVIEW_MISSING` blocks.
   - Round 5 is the circuit breaker: adjudicate instead of grinding. A finding
     may be parked with a written technical ruling, but a load-bearing finding
     cannot be parked — it stops the plan and becomes a human plan-conflict
     decision.

9. Mark the task complete in the ledger. Task states move in order —
   in-progress → red-verified → green-verified → reviewed (or fix-loop) →
   complete — and sequence or hash gaps fail the ledger audit in
   `lib/process-ledger-engine.mjs`. Commit the brief, report, and review chain
   beside the code they govern.

10. After the last task, run the final whole-change review: an independent
    reviewer reads the cumulative diff and returns one verdict bound to the
    full diff hash. `FINAL_REVIEW_MISSING` or `FINAL_REVIEW_NOT_INDEPENDENT`
    means the plan is not done regardless of per-task greens.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Brief complete | `templates/task-brief.md` | every field filled; RED/GREEN commands literal, with expected results; report path set |
| TDD honored | `npm run process:tdd -- --input <tdd-cycles>.json` | RED observed before production code; chronology, identity, and hashes pass |
| Review chain valid | `npm run process:review -- --input <chain>.json` | pass; spec and quality verdicts both present; reviewer differs from implementer |
| Fix loop bounded | `lib/review-governance-engine.mjs` policy | five rounds maximum; rounds 4–5 use fresh ownership or capability escalation; each round re-reviewed |
| Ledger complete | `npm run process:audit -- --config process.config.json` | hash-chained, gapless events covering every task transition |
| Final whole review | `npm run process:review -- --input <chain>.json` | independent final reviewer, verdict bound to the full diff hash, pass |

## Anti-patterns

- Do not reuse one implementer across independent tasks to "save context" — if
  the brief cannot stand alone, the task is wrong-sized, not the runtime.
- Do not paste conversation history into a brief or a review package; both are
  bounded artifacts with hashes, and unbounded ones fail the engine.
- Do not let the implementer review their own change, even "just this small
  one" — self-review is a blocker, not a smell.
- Do not extend the fix loop past five rounds quietly; the breaker is the plan
  telling you the requirement, not the code, is wrong.
- Do not park a load-bearing finding to finish on schedule — parked is a
  ruling, not a resolution.
- Do not recover mid-plan from chat memory after compaction; rebuild position
  from `progress.md`, the process ledger, and git history.
