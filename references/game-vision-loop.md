# Game Vision Loop — from fantasy to a frame that matches the reference

The frontend vision loop compares a rendered UI against a reference. Games need the same
discipline with three extra pressures: the camera moves, the world extends past the frame,
and everything has a runtime budget.

## The loop

```text
1  Fantasy        one sentence: what the player is doing and feeling
2  Direction      2–3 distinct visual options → user picks → aesthetic profile
3  Style pack     domains/GAME/graphics/<style>.md becomes the binding contract
4  Scene brief    layers, focal point, lighting, palette, story details
5  Blockout       grey geometry only — composition, scale, traversal
6  Scene gate     npm run audit:scene on the blockout, fail closed
7  Asset pass     specs → npm run audit:game-assets → build
8  In-context     capture from the gameplay camera, real lighting, play distance
9  Triage         npm run vision:triage ref vs cur, fix one thing, repeat
10 Match          triage returns verdict=match on current artifacts
```

Steps 5 and 6 are the ones teams skip and then pay for. Composition problems are nearly free
to fix in grey boxes and brutally expensive after materials and lighting.

## Direction before assets

Never start modelling from "make it look good". Run visual direction exploration
(`references/visual-direction-exploration.md`) and get a numbered choice, then write the
aesthetic profile. For games the profile also fixes:

- **camera** — distance, FOV, and whether the player ever sees the asset closer than X
- **readability rule** — what must stay legible at play distance and at what size
- **palette roles** — which colours mean interactive, dangerous, decorative, background
- **budget class** — the platform's frame budget, which then constrains every asset

A palette role that is not enforced becomes a bug report later: players will try to interact
with decorative props that used the interactive accent.

## Camera-first evaluation

Every visual claim is made from a camera the player actually uses:

| Shot | Purpose |
| --- | --- |
| Default gameplay camera | The only shot that can approve readability |
| Combat/action distance | Proves silhouettes survive motion and clutter |
| Night or worst-case lighting | Proves the palette still separates |
| Wide establishing | Proves the scene gate: corners, depth layers, focal |
| Thumbnail 64px | Proves silhouette identity |

A hero beauty shot may exist for marketing. It never approves the design.

## Frame budget as a design constraint

Declare the budget before authoring, not after profiling:

```json
{ "policy": { "frameTriangleBudget": 260000, "maxStyleBindings": 1 } }
```

When the set audit exceeds the budget, cut density on background assets or add LODs. Do not
approve the set and hope the profiler is kind.

## Procedural and script-generated worlds

When a map is generated rather than hand-placed, the generator is the artefact under review:

- Fix the seed and capture the same seeds every round, or you cannot compare anything.
- Run the scene gate on at least three seeds, including the worst one you can find.
- Repetition findings are a generator problem, not an art problem: vary rotation, prop set,
  wear, and lighting per instance.
- Keep a rejected-seed list. A generator that only looks good on the demo seed is not done.

See `references/world-building-and-level-blockout.md` for blockout and generator rules and
`domains/GAME/platforms/roblox-maps.md` for platform specifics.

## Multiplayer and live surfaces

Visual evidence must include the states players actually see: other players present, UI at
maximum information density, network-degraded states, and the moments after a live event
changes the scene. A frame that only holds together empty is not shipped-quality.

## Claim discipline

Say the look is achieved only when, on current artifacts:

- `npm run audit:scene` passes on the establishing shot,
- `npm run audit:game-assets` passes for the set in that shot,
- `npm run vision:triage` returns `verdict=match` against the approved reference.

Anything less is progress, reported as progress.
