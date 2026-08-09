# Brainstorming

## Why this exists

Implementation locks in whatever direction was in the agent's head at the
moment the first file was written. If that direction was never examined, the
project pays for it as a rewrite. Brainstorming exists to make direction a
decision with evidence: explore the context, compare at least two real
approaches with trade-offs and a recommendation, obtain an explicit approval,
and only then build. `references/design-before-implementation.md` states the
rule this flow enforces — no implementation before an approved design.

A choice is only a choice when the options are genuinely different. Three
layouts that differ only in accent colour are one option presented three
times; that is how "user picked one" becomes theatre. Approval is also a
separate fact from authorship — the contract records who approved and when,
not just what was written.

## When to use

- When a request opens a design space: "ออกแบบ ui", "รีดีไซน์", "design a
  scene", "make it look premium", or any new feature with no agreed direction.
- When `flow/flow-map.json` names this doc for the resolved mode
  (design-ui, design-game).
- When an old direction no longer fits and the user signals change. Skip this
  flow only when an approved design contract already binds the surface and the
  request is execution inside it.

## The flow

1. Explore the context. Read the repository, the existing screens, the brand
   constraints, and any attached references. Record what was observed, what
   was inferred, and what is missing or conflicting. Ask the user to close
   material gaps — assumptions that stay invisible become disputes later.

2. For visual work, resolve the host's presentation plan first:

   ```bash
   npm run direction:runtime
   ```

   This classifies Cursor / CLI / CI and decides whether options are shown as
   inline images or through a browser gallery. Pass `--image-gen false` when
   image generation is unavailable so the plan records the gap honestly. The
   full channel rules are in `references/visual-direction-exploration.md`.

3. Scaffold the durable design artifacts:

   ```bash
   npm run direction:init -- --product "<surface>" --primary-task "<task>"
   ```

   This creates `design/visual-direction-spec.md`,
   `design/aesthetic-profile.json`, `design/design-contract.json`, and
   `design/direction-options/` — the files the approval will bind.

4. Draft two or three distinct theses, then gate them **before** showing the
   user:

   ```bash
   npm run direction:distinctness -- --options design/direction-options/options.json
   ```

   The gate fails near-duplicates and options without a novelty concept. Fix
   the set until it passes; only then present options 1 / 2 / 3 and stop for a
   numbered choice.

5. Compare the approaches as a written record, not chat: for each option, the
   summary, the trade-offs, and the costs; then one recommendation with
   rationale. `examples/design-contract.example.json` (frontend) and
   `examples/process/design.approved.json` (process) show the bound shape;
   `templates/design-contract.md` is the authoring skeleton.

6. Write the chosen direction into the spec and contract, then stop again for
   the approval gate: **เริ่มเขียน | ปรับต่อ | เลือกใหม่**.
   On **ปรับต่อ**, iterate and re-present; on **เลือกใหม่**, return to step 4.
   Only **เริ่มเขียน** records approval — actor and timestamp — into
   `design/design-contract.json`.

7. Self-review the approved contract before handing it downstream: no
   placeholder language ("make it scalable", "add error handling"), internally
   consistent priorities, scope named, and — for frontend work — hierarchy,
   responsive composition, states, and visual acceptance defined.

8. Hand off to `flow/writing-plans.md`. The plan consumes the approved
   contract; it does not re-open the direction.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Options are distinct | `npm run direction:distinctness -- --options design/direction-options/options.json` | exits 0 before any option is shown to the user |
| Approval recorded | `design/design-contract.json` | actor, timestamp, and selected approach present — shape per `examples/process/design.approved.json` |
| No implementation before approval | `references/design-before-implementation.md` | first production edit happens strictly after the recorded **เริ่มเขียน** |
| Presentation plan resolved | `npm run direction:runtime` | visual options were shown through the channel the runtime supports |

## Anti-patterns

- Do not implement before an approved design exists — the redesign-after-code
  path is the most expensive route to the same screen.
- Do not present near-duplicate options as a choice; one layout in three hues
  is one option.
- Do not treat a numbered pick as approval of the written contract — the
  **เริ่มเขียน** gate is separate and explicit.
- Do not write the contract with placeholder phrases the plan cannot execute.
- Do not self-approve on the user's behalf; approval without a recorded actor
  is no approval.
- Do not fall back to prose-only options when images can be produced — open
  the browser gallery instead.
