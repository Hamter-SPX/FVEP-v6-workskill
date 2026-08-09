# GOLDEN_PATH.md — The Solo Fullstack Happy Path

This is the shortest honest route from "one person with an idea" to "small
production-grade change whose every claim has evidence behind it". Walk it
once end to end and you will have touched every discipline the framework
enforces: routing, design governance, executable planning, isolated
workspaces, test-first implementation, independent review, claim-bound
verification, and the full-stack evidence gate.

**What this is not.** The golden path is not an app generator and not a
scaffolder. Nothing in it types your code for you. It is a discipline plus a
deterministic toolbox: you and your agent do the thinking, the framework
makes the thinking *visible* and refuses to certify what it cannot see. It
also cannot make lying impossible — every approval timestamp, review verdict,
and integration decision is *recorded*, and a determined author can record
fiction. What the path does do is make honest work cheap and sloppy work
loud: a skipped gate shows up as a named blocker in a committed report, not
as a shrug in chat.

**When to walk it.** A self-contained change one person can finish in a few
hours with full evidence: a feature slice, a hardening pass, a small service.
For bigger arcs, split into golden-path-sized slices and run the path once
per slice.

**The ground rule.** Gates are ordered because upstream decisions are cheaper
than downstream rework. Never "borrow" a later gate's artifact for an earlier
gate — if gate 3 fails you do not touch test evidence, you fix the plan.

## The gates at a glance

Spec §5 counts eight gates; the table numbers nine rows because it inserts
the **optional visual-direction pre-gate** between routing and design.
Non-visual work skips gate 1 explicitly.

| # | Gate | Command(s) | Produced artifact | Exit condition | Flow doc |
|---|---|---|---|---|---|
| 0 | Route | `npm run mode -- resolve "<the request in your own words>"` then `npm run process:route -- --input .fvep/request.json` | `.fvep/request.json`; route report | Mode, confidence, and flow doc printed (ambiguous requests exit 1 until *you* confirm); route report names blockers or binds skills. Read `status`, not just `$?` — a `blocked` report still exits 0 | `flow/using-one-framework.md` |
| 1 | Direction (optional — visual UI work only) | `npm run direction:runtime`, `npm run direction:init -- --product "<surface>" --primary-task "<task>"`, `npm run direction:distinctness -- --options design/direction-options/options.json`, close with `npm run direction:gate -- --dir .` | `design/visual-direction-spec.md`, direction options, approval trail | Direction gate exits 0 with an explicit recorded approval (**เริ่มเขียน**) for one option | `flow/brainstorming.md` |
| 2 | Design contract | Write `.fvep/design.json` (shape: `examples/process/design.approved.json`), record approval, then re-run `npm run process:route -- --input .fvep/request.json` | `.fvep/design.json` with `approval.status = approved` | Re-routed report shows no `DESIGN_APPROVAL_REQUIRED` hard failure; the design section of the gate-6 audit passes | `flow/brainstorming.md` |
| 3 | Plan | `npm run process:plan -- --input .fvep/plan.json --output .fvep/reports/plan.report.json` | `.fvep/plan.json`; plan report | Report exits 0: every task has files, interfaces, and RED→GREEN→commit steps; dependency graph acyclic | `flow/writing-plans.md` (multi-task? also `flow/subagent-driven-development.md` + `flow/dispatching-parallel-agents.md`) |
| 4 | Isolation | `npm run process:workspace -- --cwd <your repo> --output .fvep/reports/workspace.report.json` | workspace report (+ worktree/branch you created) | `implementationAllowed: true`, no `PROTECTED_BRANCH_IMPLEMENTATION` / `WORKTREE_CONTAINER_NOT_IGNORED` blockers | `flow/using-git-worktrees.md` |
| 5 | Implement (TDD loops) | Per task: write failing test → run it (RED) → implement → run it (GREEN) → commit; record cycles; then `npm run process:tdd -- --input .fvep/tdd-evidence.json --output .fvep/reports/tdd.report.json` and `npm run process:review -- --input .fvep/review-chain.json` | source + tests; `.fvep/tdd-evidence.json`; `.fvep/review-chain.json` | TDD report exits 0, every cycle classified `test-first`; review chain validates with a reviewer identity distinct from the implementer | `flow/test-driven-development.md`, `flow/executing-plans.md`, `flow/requesting-code-review.md` |
| 6 | Quality gate | `npm run process:audit -- --config .fvep/process.config.json`, then `npm run audit:fullstack -- --config fullstack.config.json`, then `npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json` | process report (JSON+MD); full-stack report (JSON+MD) | Process audit exits 0 (`releaseEligible`); full-stack gate prints `PASS`; quality-gate exits 0 with `Hard failures: none` | `flow/verification-before-completion.md` |
| 7 | Verify claims | `.fvep/claims.json` + `.fvep/evidence.json` (checked inside the gate-6 process audit, freshness window `policy.claims`); adversarial self-pass via `npm run recheck -- plan --mode ship` then `npm run recheck -- audit --record .fvep/recheck.json` | claims bound to passing evidence; re-check record | Every claim has fresh, passing, artifact-hash-bound evidence; re-check audit exits 0 | `flow/verification-before-completion.md` |
| 8 | Integrate | `npm run process:integration -- --input .fvep/integration.json` | integration decision report | `status: decision-required` with `allowedOptions` listed — **you** then merge / PR / keep / discard explicitly. The engine never merges for you | `flow/finishing-a-development-branch.md` |

Gates 7 and 8 are deliberately human-shaped: the tools assemble and validate
the decision inputs (freshness, hashes, allowed options), the judgment is
yours and the record says so.

## The `.fvep/` contracts, minimal

The path needs one directory of small JSON contracts. Each is a mini version
of a fully-worked example under `examples/process/` — copy the shape, keep it
honest.

`.fvep/request.json` — what the router needs to know at gate 0 (see
`examples/process/request.feature.json`):

```json
{
  "kind": "feature",
  "stage": "implementation",
  "creative": true,
  "multiStep": true,
  "hasApprovedDesign": true,
  "hasImplementationPlan": true,
  "subagentsAvailable": false,
  "needsIsolation": true,
  "hasUnexpectedBehavior": false,
  "independentDomains": 1,
  "parallelImplementationHasSharedFiles": false,
  "sharedMutableState": false
}
```

`hasApprovedDesign` / `hasImplementationPlan` start `false` at gate 0 and
flip `true` only when gates 2 and 3 produced the real artifacts — the file
tells the truth about *now*, not about *eventually*.

`.fvep/plan.json` — one task of an executable plan (see
`examples/process/implementation-plan.json`):

```json
{
  "id": "plan-my-feature",
  "goal": "Add a slugify helper with a pinned behavioral contract.",
  "architecture": "Single pure ES module consumed by a node:test suite.",
  "techStack": ["Node.js 20", "ES modules", "node:test"],
  "globalConstraints": ["Observe RED before production code"],
  "tasks": [
    {
      "id": "task-1",
      "dependsOn": [],
      "files": { "create": ["src/slug.js"], "modify": [], "test": ["test/slug.test.mjs"] },
      "interfaces": {
        "produces": [{ "name": "slugify", "signature": "slugify(value, { maxLength } = {}) -> string" }],
        "consumes": []
      },
      "resources": [],
      "sharedState": [],
      "steps": [
        { "kind": "write-failing-test", "detail": "Pin the contract in test/slug.test.mjs." },
        { "kind": "verify-red", "command": "node --test test/slug.test.mjs", "expected": "FAIL with 'Cannot find module' for src/slug.js" },
        { "kind": "implement", "detail": "Implement the normalization pipeline." },
        { "kind": "verify-green", "command": "node --test test/slug.test.mjs", "expected": "PASS, zero failures" },
        { "kind": "commit", "command": "git commit -m \"feat: add slugify helper\"", "expected": "One focused commit" }
      ]
    }
  ]
}
```

`.fvep/tdd-evidence.json` — one RED→GREEN cycle (see
`examples/process/tdd-cycles.json`). Hashes bind the evidence to what
actually ran; compute them cheaply, e.g. `sha256sum test/slug.test.mjs`:

```json
{
  "cycles": [
    {
      "id": "cycle-1",
      "behaviorId": "slugify-contract",
      "requirementRef": "plan-my-feature#task-1",
      "risk": "normal",
      "test": { "file": "test/slug.test.mjs", "name": "slugify contract" },
      "red": {
        "command": "node --test test/slug.test.mjs",
        "exitStatus": 1,
        "failureKind": "behavior-missing",
        "expectedFailureSignature": "Cannot find module",
        "observedFailureSignature": "Cannot find module '…/src/slug.js' imported from '…/test/slug.test.mjs'",
        "outputHash": "<sha256 of the captured RED output>",
        "testHash": "<sha256 of test/slug.test.mjs>",
        "productionHash": "<sha256 of production state before the change>",
        "at": "2026-08-09T09:28:46.000Z"
      },
      "production": {
        "changeId": "3ee16c4",
        "productionHash": "<sha256 of src/slug.js>",
        "at": "2026-08-09T09:29:20.000Z"
      },
      "green": {
        "command": "node --test test/slug.test.mjs",
        "exitStatus": 0,
        "passCount": 5,
        "outputHash": "<sha256 of the captured GREEN output>",
        "testHash": "<sha256 of test/slug.test.mjs>",
        "productionHash": "<sha256 of src/slug.js>",
        "at": "2026-08-09T09:29:31.000Z"
      },
      "refactor": { "changed": false }
    }
  ]
}
```

The engine checks chronology (RED strictly before implementation strictly
before GREEN), identity (the test did not silently change mid-cycle), proof
of change (`red.productionHash` differs from `production.productionHash`,
which equals `green.productionHash`), and — for `risk: "high"` behaviors — a
negative control that fails as expected.

`fullstack.config.json` — scope the gate to what is actually true. A tiny
library has no API surface and no database; it says so, and the gate
re-normalizes over the applicable sections. Copy
`fullstack.config.example.json` and adjust:

```json
{
  "gates": {
    "frontend": { "required": false },
    "api": { "required": false },
    "data": { "required": false },
    "security": { "required": true, "hard": true },
    "dependencies": { "required": true, "hard": true },
    "process": { "required": true, "hard": true }
  },
  "policies": {
    "security": { "requiredControls": ["inputValidation"] }
  }
}
```

Scoping honestly means *naming why a gate does not apply* — "no HTTP surface"
is a fact, "I did not feel like it" is a confession. Two things you may not
do: mark a gate `required: false` while the system it protects exists, or
lower `quality.minScore` / `quality.minConfidence` to turn a red gate green.

## When the path goes wrong

**A gate goes red.** Read the report, not the vibes: every `process:*` and
audit command emits JSON with `hardFailures` / `findings` whose codes name
the missing artifact — codes like `DESIGN_APPROVAL_REQUIRED`,
`IMPLEMENTATION_PLAN_REQUIRED`, `PROTECTED_BRANCH_IMPLEMENTATION`,
`TEST_IDENTITY_CHANGED`, `CLAIM_EVIDENCE_STALE`. The fix is almost never
inside the failing gate —
a red TDD gate is a missing RED observation, not a TDD-policy problem; a red
full-stack gate lists exactly which section's evidence is absent. Fix the
evidence, re-run the same command, keep both reports. If a route report comes
back `status: "blocked"` with exit code 0, that is the router working —
create the artifact it names instead of arguing.

**The plan breaks mid-run.** Stop editing. The ledger (`.fvep/ledger.json`)
is the source of truth, not your memory of "where we were" — re-resolve the
mode with `npm run mode -- resolve "ทำต่อจากเดิม"` and rebuild current state
from the ledger. Then: if behavior surprised you, switch modes and run
`flow/systematic-debugging.md` before touching the plan — patching blind
makes the next state unrecoverable. If the plan itself was wrong, write the
break into the ledger (`note` / `supersede` events), revise
`.fvep/plan.json`, re-run `npm run process:plan -- --input .fvep/plan.json`,
and resume from the broken task — tasks that already produced green cycles
stay green, do not re-execute them for ritual purity.
`flow/executing-plans.md` owns the checkpoint discipline that makes this
cheap.

**Review pushback.** Fix rounds are cheap; arguing is not. Take findings one
round at a time, re-verify after each, and let `.fvep/review-chain.json`
record the round(s); the engine enforces independence and escalating
fresh-eyes rules (`FIX_LOOP_ESCALATION_MISSING`) so you do not grade your own
homework forever. If you disagree with a finding, the disagreement needs
evidence — a test, a trace, a contract — not eloquence
(`flow/receiving-code-review.md`). If the pushback amounts to a spec change,
walk backwards: a different brief means a new design approval (gate 2) and a
re-planned change (gate 3), and downstream evidence whose identity bound to
the old brief/diff must be rebuilt, not re-labeled.

## Proof it walks

`examples/golden-path/` contains a real toy project (one pure JS helper,
five tests) driven through gates 0–6 with the real commands above — every
output tail pasted into `examples/golden-path/README.md`, committed contracts
under `examples/golden-path/.fvep/`, and a passing quality gate with zero
hard failures. Gates 7–8 are documented there with their real commands and
left as the human decisions they are.
