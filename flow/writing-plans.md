# Writing Plans

## Why this exists

A plan is an executable contract, not a narrative estimate. A fresh implementer
— a subagent with no conversation history — must be able to finish every task
from the plan alone. That forces specificity: exact files to create, modify,
and test; exact interfaces produced and consumed; and a test-first step
sequence where every verification command names its expected result. Anything
vaguer defers thinking to implementation time, where it resurfaces as
improvised architecture and untraceable decisions.

Two engines enforce the contract. `lib/plan-quality-engine.mjs` audits the
plan itself — structure, placeholders, commands without expected results.
`lib/task-graph-engine.mjs` then analyses the task graph — duplicate IDs,
unknown dependencies, dependency cycles, and parallel-safety collisions where
two tasks touch the same files, exclusive resources, or shared mutable state.
The reasoning is in `references/executable-planning.md`.

## When to use

- Before any multi-step implementation, after an approved design and before
  the first edit — the plan consumes the design contract, it does not replace
  it.
- When `flow/flow-map.json` names this doc as a companion of the resolved
  mode (design-ui, implement).
- Before dispatching subagents or parallel work: the plan's task graph is what
  makes delegation safe.

## The flow

1. Write the plan header: `goal`, `architecture`, `techStack`, and
   `globalConstraints` — the rules that bind every task ("Observe RED before
   production code", "No new dependencies"). Constraints with no enforcement
   verb are decoration.

2. Decompose into tasks. Each task declares:
   - `id` and `dependsOn` — the dependency graph edges.
   - `files`: `create`, `modify`, `test` — real repo paths, not "some util
     file".
   - `interfaces`: `produces` and `consumes`, with names and signatures.
     Later tasks consume named interfaces, never implied behaviour.
   - `resources` and `sharedState` — so the graph analysis can flag unsafe
     parallel waves.

3. Write each task's steps bite-sized, one action per step, in the TDD order:
   `write-failing-test` → `verify-red` → `implement` → `verify-green` →
   `commit`. Every `verify-*` step carries an exact `command` and an
   `expected` result — the RED step names the expected failure signature, the
   GREEN step names the expected pass.

4. Apply the no-placeholders rule across the whole plan. If a step came from
   the spec, the spec's real value appears in the step — exact endpoints,
   exact copy, exact numbers. "Handle errors appropriately" is a placeholder;
   "return 409 with `{\"error\":\"slug-taken\"}`" is a step.

5. Close each task with its own commit step, so the history is reviewable task
   by task and a failing task can be abandoned without contaminating finished
   ones.

6. Validate before execution begins:

   ```bash
   npm run process:plan -- --input .fvep/plan.json
   ```

   The command runs both engines and fails on placeholder steps, unknown
   dependencies, cycles, and commands with no expected result.
   `examples/process/implementation-plan.json` is a passing example of the
   full shape.

7. Fix every finding in the plan, not during execution. A blocker at
   validation time costs minutes; the same defect discovered by an implementer
   mid-task costs a restart.

8. Emit the per-task briefs the implementers will consume —
   `templates/task-brief.md` defines the fields, including the exact RED
   command and expected failure for the task's first cycle.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Plan validates | `npm run process:plan -- --input .fvep/plan.json` | exits 0: no placeholders, no unknown deps, no cycles, no parallel collisions |
| Structure | `lib/plan-quality-engine.mjs` via the plan command | goal, architecture, stack, and constraints present; every task has files, interfaces, and a commit step |
| Graph safety | `lib/task-graph-engine.mjs` via the plan command | dependency graph acyclic; shared files, resources, and mutable state partitioned into safe waves |
| Executability | `.fvep/plan.json` | a stranger can run every step from the plan alone — verified by reading, not by hoping |

## Anti-patterns

- Do not write plan steps that name no real file or no expected failure —
  "verify red" without a command and signature is not a step.
- Do not hide placeholders ("configure as appropriate", "add tests") in
  otherwise concrete plans; the validator fails them, and for good reason.
- Do not make one task swallow three concerns because they feel related;
  bite-sized tasks are what make reviews and rollbacks cheap.
- Do not declare tasks independent when they share files or mutable state —
  the graph analysis will catch it, and so will a merge conflict.
- Do not treat validation findings as implementation-time guidance; the plan
  is wrong until the command exits 0.
- Do not start execution from an unvalidated plan "to save time"; the
  validator is the cheapest reviewer this plan will ever have.
