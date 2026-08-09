# Dispatching Parallel Agents

## Why this exists

Parallel dispatch is earned by the graph, not granted by the number of idle
agents. `lib/task-graph-engine.mjs` partitions a validated plan into waves:
tasks inside one wave are pairwise free of file, resource, and shared-state
conflicts, and waves run in dependency order. Two tasks that touch the same
file, claim the same exclusive resource, or read and write the same mutable
state are not parallel work — they are one sequential task wearing two hats.

The wave computation is not a separate ceremony. It runs inside
`npm run process:plan`, so the same validation that gates the plan also names
the legal concurrency. Speed is the side effect; reviewable, replayable order
is the point — a wave boundary is where evidence integrates before more work
is allowed to depend on it.

## When to use

- Two or more dependency-ready tasks whose files, resources, and mutable state
  are provably disjoint in the plan declarations.
- Independent reconnaissance roles (inventory, reference analysis,
  accessibility reconnaissance) as scoped in
  `references/agent-orchestration.md`.
- Never when "independence" comes from careful timing, sequential luck, or one
  agent promising to be careful inside another agent's files.

## The flow

1. Declare independence in the plan itself. Every task lists its full
   `files.create` / `files.modify` / `files.test` paths plus its `resources`
   and `sharedState` entries (shape:
   `examples/process/implementation-plan.json`). Undeclared sharing is how
   "independent" tasks corrupt each other; the graph can only check what the
   plan admits. The engine treats the following signals as parallel-forbidding
   conflicts:

   | Shared signal in the plan | Why it forbids parallel execution |
   |---|---|
   | Same path in `files.create`, `files.modify`, or `files.test` | both diffs write it — one writer's change lands inside the other's bounded review package |
   | Same entry in `resources` (a port, a browser instance, a fixture database) | resources are exclusive by policy; two holders means one silently broken run |
   | Same entry in `sharedState` (global config, environment, feature flags) | one task's reads observe the other's half-written state — tests lie green |
   | Task B consumes an interface task A produces, with no `dependsOn` edge | the graph believes them independent; the missing edge means the parallelism is fake |

2. Run the wave analysis:

   ```bash
   npm run process:plan -- --input <plan>.json
   ```

   Read the `graph` section: `waves`, `executionOrder`, `conflicts`, and
   `parallelizableTaskCount`. A cycle (`TASK_GRAPH_CYCLE`) is a blocker. The
   pairs listed under `PARALLEL_CONFLICTS_DETECTED` are the ones the engine
   refused to co-schedule — that is the engine working, not failing.

3. Dispatch only within a single wave: one conflict-free task set, one fresh
   implementer per task, one brief per task. Wave-mates cannot negotiate
   boundaries at runtime, so their contracts must already exist as declared
   interfaces before dispatch. Briefs, reports, review packages, and the fix
   loop follow `flow/subagent-driven-development.md` unchanged.

4. Wait for the whole wave. Integrate the per-task commits, then verify the
   wave as a unit before anything downstream is unlocked: the full suite plus
   each task's own GREEN command.

   ```bash
   npm test
   ```

5. Keep the ledger serial even when the work is not. Append wave-start and
   wave-complete events plus each task's transitions in a single deterministic
   order (task-id order within the wave), so replay produces one true history;
   `lib/process-ledger-engine.mjs` treats sequence gaps as blockers, and
   concurrent appends are where gaps come from. The human mirror `progress.md`
   records the same wave boundary.

6. Dispatch the next wave only after the previous one verifies. If a wave
   fails, dependent work does not start on a red base — the failure enters the
   fix loop and adjudication rules of
   `flow/subagent-driven-development.md` first.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Graph passes | `npm run process:plan -- --input <plan>.json` | status pass; no cycle; conflicts known and wave-separated |
| Wave conflict-free | `lib/task-graph-engine.mjs` wave output | every task pair in the dispatched wave shares no file, resource, or shared-state entry |
| Per-task contract | `flow/subagent-driven-development.md` | fresh implementer, bounded brief, report file, dual-verdict review per task |
| Wave verified | `npm test` plus each task's GREEN command | green before the next wave is dispatched |
| Ledger serial | `npm run process:audit -- --config process.config.json` | gapless, hash-chained events even across concurrent work |

## Anti-patterns

- Do not parallelize tasks that share files or state and promise to be
  careful — the engine already told you the truth.
- Do not dispatch across waves; dependency order exists because later waves
  consume earlier interfaces.
- Do not let wave-mates negotiate file or boundary ownership in chat at
  runtime; the contract belongs in the plan before dispatch.
- Do not start the next wave on an unverified wave, even when the failing part
  looks unrelated.
- Do not shrink declared file, resource, or shared-state lists to manufacture
  parallelism — that forges the evidence the gate relies on.
- Do not parallelize edits to shared layout foundations without an integration
  owner and explicit boundaries (`references/agent-orchestration.md`).
