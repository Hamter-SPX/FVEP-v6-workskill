# v5 TDD Deployment Evidence

This record summarizes the observed RED–GREEN–REFACTOR evidence for the aesthetic direction layer. It records the durable release-facing summary; the per-command logs were retained during construction.

## Baseline

Before v5 production changes, the imported v4 suite was run and did **not** pass cleanly. One test failed:

```text
✖ semantic visual review validates contract and produces weighted score
  AssertionError: false !== true
  tests/unit/manual-review.test.mjs:21
```

The fixture pinned `reviewedAt` to a fixed date while the engine evaluates freshness against a rolling 24-hour window, so the test began failing once that date passed. This was a genuine defect in the inherited suite rather than a consequence of the v5 work, and it was fixed first so that a clean regression baseline existed. After the fix the suite passed and became the baseline.

## Task 1 — perceptual colour engine

**RED:** tests failed because `color-harmony-engine.mjs` did not exist. Scenarios covered hex and functional parsing, OKLCH separation of lightness from hue, symmetric WCAG contrast, ramp evenness against a clustered ramp, harmony classification, contrast floors, hue-only status, accent competition, and inverted dark themes.
**GREEN:** targeted tests passed 8/8.

## Task 2 — typography and spacing engines

**RED:** tests failed for absent scale-step distinguishability, role coverage, line-height curve, measure limits, tabular figures, spacing scale conformance, proximity ratios, nesting direction, and responsive compression.
**GREEN:** targeted tests passed 12/12.

## Task 3 — craft and motion engines

**RED:** tests demonstrated missing detection for non-nesting radii, multi-layer shadow parsing across colour functions, conflicting light sources, single-layer high elevation, mixed icon families, duration families, linear positional motion, animated layout properties, non-interruptible motion, uniform easing, and unbounded stagger. A separate RED case showed that a 1000 ms spinner was wrongly flagged as an over-long transition, which produced the `continuous` exemption.
**GREEN:** targeted tests passed 15/15.

## Task 4 — style signature and classification

**RED:** tests failed because the signature normalizer and archetype classifier were absent. The strongest case asserted that every archetype prototype must classify as itself, which would fail silently on any prototype error.
**GREEN:** targeted tests passed 7/7, including the round-trip assertion across all nine archetypes.

## Task 5 — profile and review governance

**RED:** tests showed no rejection of unconstraining language, positions without reasons or consequences, density contradicting its axis, declined reduced-motion support, dimensions below the floor, ratings below 3 without findings, ratings of 5 without recorded tests, implementer self-approval, stale configuration hashes, missing cases, and system-wide deviations parked as residual.
**GREEN:** targeted tests passed 17/17.

## Task 6 — audit aggregation and gate integration

**RED:** tests failed because the aggregation engine and the `aesthetic` gate did not exist, and because sections without input were scored as passing rather than skipped. A regression test asserted that an existing v4 gate summary with no aesthetic evidence must remain unchanged, which failed while the gate defaulted to missing rather than not-applicable.
**GREEN:** targeted tests passed 7/7; the eighth gate stays out of the score until it is supplied or required; the bundled example audits at 96.65 with every section passing.

## Task 7 — documentation, schemas, and conformance

**RED:** conformance failed because the aesthetic references were not surfaced on the skill, `audit:aesthetics` was absent from the CLI contract, and package identity still reported v4.
**GREEN:** conformance passed with full aesthetic-reference coverage; the complete suite passed after every task, and the packaged artifact was verified from a clean extraction.

## Refactor and regression discipline

The full suite was rerun after each GREEN state. Two engine changes came from RED evidence rather than from review comment: the continuous-motion duration exemption, and the not-applicable default for the aesthetic gate. Documentation and examples were treated as behavior — the bundled example is asserted to pass its own audit, so a drifting engine or a drifting example fails the suite rather than passing silently.

Release verification is recorded separately in `VALIDATION_REPORT.json` and `UPGRADE_REPORT_V5_TH.md`.
