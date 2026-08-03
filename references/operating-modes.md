# Operating Modes

A mode is not a personality. It is a contract for a phase of work: what it may do, what it
must not do **yet**, which gates produce its evidence, and what has to be true before it can
end.

Modes exist because the most common failure is drift — a question turns into a refactor, a
direction exploration turns into production code, a bug report turns into a redesign. Each of
those crossings should be visible.

```bash
npm run mode -- list
npm run mode -- show design-ui
npm run mode -- resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย"
npm run mode -- check --mode match-ref --state .fx/mode-state.json
```

## The ten modes

| Mode | Purpose | Ends when |
| --- | --- | --- |
| `analyze` | Understand before changing | The request is restated, risks and unknowns are listed |
| `design-ui` | Choose a checkable visual direction | An option was chosen by number and confirmed with เริ่มเขียน |
| `match-ref` | Close the gap to a reference | `vision:triage` returns `verdict=match`, or the residual is accepted |
| `design-game` | Scenes, levels, maps, assets | Scene and asset gates pass with in-context captures |
| `implement` | Build the approved change | Every planned task has RED/GREEN evidence |
| `debug` | Locate the failing boundary | Root cause named, regression test failed then passed |
| `review` | Judge someone else's change | Spec verdict and quality verdict both recorded |
| `ship` | Turn work into a release decision | Options presented, none chosen for the user |
| `author-skill` | Change this skill safely | New behaviour has a test that fails without it |
| `recover` | Resume lost context | Current phase identified from artifacts, not memory |

## Entering a mode

`npm run mode -- resolve "<request>"` scores the request against Thai and English triggers and
returns the mode, a confidence level, and whether confirmation is needed. It exits non-zero
when the signal is absent or two modes are within one point, because entering the wrong mode
is how an agent edits code during a question.

The safe default is `analyze`. It is the only mode that is always safe to enter without asking.

## Leaving a mode

`npm run mode -- check --mode <id> --state state.json` refuses to close a mode when:

- a required gate was never run,
- a forbidden action was performed,
- a required confirmation is missing (for example เริ่มเขียน before implementation),
- or the re-check pass did not happen.

```json
{
  "completedGates": ["npm run vision:triage"],
  "confirmations": [],
  "artifacts": ["artifacts/cur.png"],
  "performedForbidden": [],
  "recheckPerformed": true
}
```

## Mode transitions

Modes are not a pipeline; they are a stack you should cross deliberately.

```text
analyze  → design-ui | design-game | implement | debug
design-ui → implement          (only after เริ่มเขียน)
design-game → implement | match-ref
implement → debug | review
debug → implement
review → implement | ship
ship → recover                 (if the decision is deferred)
recover → any                  (once the phase is identified)
```

Announce the crossing. "I am moving from analyze to implement" is a sentence the user can
stop, and that is the point.

## Modes do not replace the router

`npm run process:route` still selects the disciplines and blockers for the underlying work.
Modes sit above it as the human-facing contract. A mode says what this phase is for; the
router says which evidence that phase cannot skip.

## The re-check is part of every mode

No mode closes without the adversarial pass in `references/recheck-protocol.md`. Each mode
contributes its own checks — for `design-game` that includes viewing every asset as a black
silhouette at 64px; for `match-ref` it includes confirming no tolerance was loosened to
produce the pass.
