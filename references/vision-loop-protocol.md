# Vision Loop Protocol

## Objective

Convert visual judgment into a repeatable engineering loop. Pixel comparison helps locate changes, but the acceptance target is correct composition, hierarchy, content, interaction, responsiveness, accessibility, and visual language.

## Capture Preconditions

A comparison is invalid unless target and current render are normalized as far as possible:

- Same viewport dimensions and device-pixel ratio
- Same route, query, user role, theme, locale, timezone, and data state
- Same scroll position
- Fonts and images loaded
- Skeletons, transitions, and entrance animations settled
- Time, random values, live counters, rotating content, and ads stabilized
- Browser zoom at 100 percent
- No debug overlay, cursor, selection, or focus ring unless the tested state requires it

A deterministic capture must not silently change product behavior. Time freezing, seeded randomness, masks, disabled animations, and fixture data are declared evidence settings.

## Comparison Strength

Use the strongest available method:

1. Overlay or rapid flicker for alignment and geometry
2. Side-by-side at identical scale for composition and hierarchy
3. Automated pixel diff for normalized regression detection
4. Region crops for typography, icons, controls, and dense local deltas
5. DOM and computed-style inspection after a visual delta is observed

Automated diff is diagnostic. Anti-aliasing, font rasterization, media, and dynamic data create noise. Exclude only proven dynamic regions and keep every mask narrow.

## Delta Ledger

Record:

| Field | Meaning |
|---|---|
| Case | Route, viewport, state, theme, and role |
| Region | Header, hero, card, table, form, footer, overlay, etc. |
| Category | Content, asset, structure, geometry, responsive, typography, surface, state, motion, accessibility |
| Severity | Blocker, major, or minor |
| Expected | Reference or contract behavior |
| Observed | Current behavior |
| Cause hypothesis | Specific content, DOM, CSS, token, asset, or state cause |
| Fix | Smallest coherent change |
| Regression surface | Cases likely to be affected |
| Evidence | Capture, diff, DOM record, audit, or command result |
| Status | Open, improved, accepted, or deferred with reason |

### Blocker

- Missing primary region, content, or required asset
- Broken route or primary interaction
- Unusable clipping, overlap, horizontal overflow, or unreadable content
- Wrong responsive composition
- Missing required state
- Accessibility issue that blocks task completion
- Capture dimensions or state cannot be normalized

### Major

- Incorrect hierarchy, grid, density, type scale, or component proportions
- Primary surface language materially wrong
- Large asset crop/aspect mismatch
- Interaction contradicts target or contract
- Repeated design-system inconsistency

### Minor

- Small spacing, radius, border, shadow, icon alignment, or subtle color discrepancy
- Difference does not alter hierarchy, comprehension, or task completion

## Iteration Discipline

Each loop changes one coherent cause group. Do not change unrelated geometry, typography, colors, and motion in one pass because the next render cannot attribute improvement or regression.

After a change:

1. Re-render the exact failing case.
2. Confirm the intended delta improved.
3. Inspect neighboring regions.
4. Re-run affected responsive and interaction cases.
5. Update the ledger.

## Original-Design Review

Without a reference image, compare the render against the design contract:

- Is the primary task identifiable within seconds?
- Is one hierarchy dominant rather than many competing accents?
- Does spacing reveal relationships?
- Does typography create clear levels without excessive sizes or weights?
- Do colors have semantic roles?
- Are cards, borders, gradients, shadows, and motion concept-driven?
- Does mobile preserve task priority rather than merely stack desktop?
- Are loading, empty, error, and focus states designed with equal care?
- Does the surface look specific to this product?

## Tool-Degraded Operation

- Browser and screenshots available: final capture is mandatory.
- Screenshot available, no automated diff: use same-scale side-by-side, crops, and ledger.
- Reference available, current render unavailable: implement cautiously and mark visual verification incomplete.
- No visual tooling: structural and engineering work may continue, but fidelity and visual completion remain unverified.
