# Using One Framework

## Why this exists

One Framework treats the conversation itself as a governed surface. Every
substantial request belongs to one operating mode, and each mode is a contract:
what the phase may do, what it must not do yet, which gates produce its
evidence, and what must be true before it ends. The ten modes and their flow
bindings live in `flow/flow-map.json`; the resolver and the exit auditor live in
`lib/mode-engine.mjs`.

Routing exists for one economic reason: fixing work that was done in the wrong
mode costs far more than the seconds it takes to ask which mode applies. An
"implementation" that skipped design must be thrown away, not patched. A "bug
fix" attempted through the design flows produces a redesign, not a root cause.
The router in `lib/skill-router-engine.mjs` therefore emits blockers rather
than silently inventing missing approvals, plans, or isolation — a blocked
route is a signal to create the missing artifact, not permission to skip the
discipline. See `references/skill-routing-and-precedence.md`.

This doc is the entry point. It turns a raw request into a named mode, a flow
doc, and a set of evidence gates. Every other flow in `flow/` assumes this
routing already happened.

## When to use

- At the start of every substantial request — before reading or editing
  anything, decide which mode the work belongs to.
- When the request carries a trigger phrase: "implement", "เพิ่มฟีเจอร์",
  "ออกแบบ ui", "ช่วยรีดีไซน์", "มันพัง", "ทำไมช้า", "ก่อน merge", "ขอ review",
  "พร้อมส่ง", "ทำต่อจากเดิม". Let the resolver confirm what the phrase implies
  instead of trusting the first impression.
- When a phase ends — re-route instead of drifting into the next mode
  unannounced.
- After context loss — re-resolve from the ledger and the resolver, never from
  memory.

## The flow

1. Restate the request in one sentence the user would accept. If you cannot
   restate it, ask before resolving anything.

2. Resolve the mode with the user's own words:

   ```bash
   npm run mode -- resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย"
   ```

   The output carries `mode`, `confidence`, `flow`, and `flowCompanions`, all
   read from `flow/flow-map.json`. When no keyword signal is found or two
   candidates tie, `needsConfirmation` is set and the command exits 1.

3. On exit 1, ask the user which mode applies. Do not pick one to keep moving —
   the resolver refusing is the system working, not failing.

4. Bind the process disciplines the work requires:

   ```bash
   npm run process:route -- --input .fvep/request.json
   ```

   The request record declares kind, stage, creative scope, approvals, plan
   availability, isolation need, and shared-state risk
   (`examples/process/request.feature.json` shows the shape). The router orders
   the disciplines so upstream decisions cannot be bypassed: design before
   plan, isolation before implementation, verification before claims.

5. Open the flow doc named in step 2 and follow it exactly. Companion docs
   apply the moment their own triggers appear in the conversation — the
   implement mode, for example, activates `flow/writing-plans.md`,
   `flow/using-git-worktrees.md`, and `flow/test-driven-development.md`
   together, not optionally.

6. Only now write code, docs, or designs. A mode and flow named after edits
   begin is routing theatre.

7. Before any completion claim, close the mode through its exit check:

   ```bash
   npm run mode -- check --mode implement --state .fvep/mode-state.json
   ```

The mode map, for orientation when the resolver output needs a sanity check:

| Mode | Flow doc | Companions |
|---|---|---|
| analyze | `flow/using-one-framework.md` | — |
| design-ui | `flow/brainstorming.md` | `flow/writing-plans.md` |
| design-game | `flow/brainstorming.md` | `flow/writing-plans.md` |
| match-ref | `flow/verification-before-completion.md` | — |
| implement | `flow/subagent-driven-development.md` | `flow/executing-plans.md`, `flow/test-driven-development.md`, `flow/using-git-worktrees.md`, `flow/dispatching-parallel-agents.md` |
| debug | `flow/systematic-debugging.md` | `flow/receiving-code-review.md` |
| review | `flow/requesting-code-review.md` | `flow/receiving-code-review.md` |
| ship | `flow/verification-before-completion.md` | `flow/finishing-a-development-branch.md` |
| author-skill | `flow/writing-skills.md` | — |
| recover | `flow/using-one-framework.md` | — |

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Mode resolved | `npm run mode -- resolve "<request>"` | mode, confidence, and flow are printed; ambiguous requests exit 1 until the user confirms |
| Flow doc exists | `flow/flow-map.json` | every mode maps to a real doc, enforced by `node --test tests/unit/flow-docs.test.mjs` |
| Disciplines bound | `npm run process:route -- --input .fvep/request.json` | report status is pass, or blockers are named before work begins |
| Mode closed | `npm run mode -- check --mode <id> --state .fvep/mode-state.json` | `ok=true` before any completion claim |

## Anti-patterns

- Do not skip routing because the task looks small — "งานเล็กไม่ต้อง route" is
  how wrong-mode rework starts, and rework is never small.
- Do not resolve the mode from memory after a context reset; re-run the
  resolver and trust its output over recall.
- Do not treat `flowCompanions` as optional reading once their triggers appear.
- Do not treat a blocked route report as advisory; a blocker names a missing
  artifact, and the fix is creating it.
- Do not announce a mode without being able to show the resolve output it came
  from.
- Do not begin edits in one mode and re-label the work as another afterwards.
