# Executing Plans

## Why this exists

Some hosts have no subagent runtime. The plan is still the contract. This flow
executes the same validated task graph inline, in this conversation, one task
at a time, with checkpoints standing in for the implementer/reviewer handoff.
The tasks, files, interfaces, and RED/GREEN commands do not change — only the
labor pool does. The plan format is described in
`references/executable-planning.md`; its machine check is
`npm run process:plan`.

Inline execution trades dispatch cost for a different risk profile: context is
free but honesty is expensive. Without explicit checkpoints the session drifts,
tasks smear together, and review becomes self-congratulation. Two rules keep
the drift out: a checkpoint after every N tasks with no exceptions, and a
written adversarial recheck before anything is called done.

## When to use

- Executing a validated multi-task plan in a host with no Task/subagent tool.
- Small plans where dispatch overhead outweighs the independence gain — the
  same ledger and review records still apply.
- `flow/flow-map.json` names this doc a companion of the implement mode;
  expect it beside `flow/test-driven-development.md` and alongside
  `flow/subagent-driven-development.md`, which defines the contracts this doc
  reproduces inline.

## The flow

1. Validate the plan before touching code:

   ```bash
   npm run process:plan -- --input <plan>.json
   ```

   The report combines the quality audit with task-graph analysis; a fail
   stops here. Fix the plan, not the report.

2. Initialize the workspace ledger (`progress.md` or the process-ledger event
   stream — the same vocabulary as subagent-driven development) and mark the
   first task in-progress. Inline execution changes who does the work, not
   which transitions are legal.

3. Execute exactly one task, in its declared step order: write the failing
   test, verify RED for the stated reason, implement the minimum, verify GREEN
   with the stated result, commit (shape:
   `examples/process/implementation-plan.json`). Run the task's own commands
   and record their real output.

4. Never merge tasks. A commit that closes two tasks proves neither: each
   task's RED/GREEN pair is observed only for its own scope, and the combined
   diff cannot be reviewed against either brief. One task, one evidence pair,
   one commit.

5. Record the TDD evidence and audit it:

   ```bash
   npm run process:tdd -- --input <tdd-cycles>.json
   ```

   Shape: `examples/process/tdd-cycles.json`. A pass here is what turns "I
   tested first" from a claim into evidence.

6. Self-review with a deliberate perspective reset: finish the implementation
   evidence, re-open the task's acceptance behavior as a critic, review
   without editing, record deltas, and return to implementation only after the
   review is complete (independence contract:
   `references/agent-orchestration.md`). One runtime does not waive the review;
   it makes the review an act of discipline instead of an act of scheduling.

7. Checkpoint after every N tasks — N is fixed when the plan is approved
   (default 3) and does not stretch because tasks ran long. At each
   checkpoint, run the full suite and the adversarial recheck:

   ```bash
   npm test
   npm run recheck -- plan --mode implement
   ```

   The recheck prints the implement-mode checks and the questions to answer in
   writing: what is being claimed, what proves it, how it would look if wrong,
   and what was never examined. Write the answers into the ledger; a task is
   done only when its tests pass and its recheck answers exist.

8. On context loss, recover position from the ledger, git history, and the
   plan file — resume at the last verified transition and re-verify the last
   task's GREEN command before continuing. Never reconstruct position from
   chat memory (`references/context-recovery-ledger.md`).

9. After the last task, record the whole-change final review in a review
   chain (shape: `examples/process/review-chain.json`) and audit it:

   ```bash
   npm run process:review -- --input <chain>.json
   ```

   Inline execution waives the reviewer runtime, not the reviewer verdict.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Plan valid | `npm run process:plan -- --input <plan>.json` | quality and graph audits pass; no cycles; every command has an expected result |
| RED observed | the task's verify-RED command | fails for the stated reason before any production code |
| GREEN observed | the task's verify-GREEN command | passes with the stated result, run under the task's own scope |
| TDD chain | `npm run process:tdd -- --input <cycles>.json` | chronology, identity, and hashes pass |
| Checkpoint held | `npm run recheck -- plan --mode implement` + `npm test` | written recheck answers in the ledger; full suite green at the checkpoint interval |
| Whole-change review | `npm run process:review -- --input <chain>.json` | final review recorded with an explicit pass verdict |

## Anti-patterns

- Do not merge tasks to save time — two tasks in one commit means neither
  task's acceptance behavior was ever proven on its own.
- Do not skip a task's RED command because "the suite will catch it"; the
  suite is the checkpoint gate, not the task gate.
- Do not raise the checkpoint interval mid-plan when tasks run long; the
  interval is a plan decision, not a mood.
- Do not review while editing — the perspective reset only works when the
  critic phase touches nothing.
- Do not let the ledger fall behind the code and backfill it at the end; an
  append-only record written retroactively is fiction.
- Do not treat inline execution as license to skip the review-chain record or
  the final whole-change review.
