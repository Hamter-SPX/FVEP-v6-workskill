# Migration from v4 to v5

v5 preserves the entire v4 command surface, contracts, and gates. It adds an aesthetic direction layer: a positive model of visual quality with measurable audits and an independent judgment review. Nothing in an existing v4 pipeline stops working, and the new gate is opt-in.

## What changed

| Area | v4 | v5 |
|---|---|---|
| Visual judgment | Anti-generic heuristics plus eight semantic dimensions with only "5 means" defined | Universal principles with nine observable tests, plus anchors for every level from 0 to 5 |
| Aesthetic direction | An unexpanded phrase in the design contract | A validated aesthetic profile with axis positions, reasons, consequences, and a novelty budget |
| Colour | Token drift detection only | Perceptual ramp evenness, contrast floors, harmony classification, and theme derivation checks |
| Typography | Structural criteria in prose | Step distinguishability, role coverage, line-height curve, and measure in characters |
| Spacing | Not measured | Scale conformance, proximity ratios, nesting, and responsive compression |
| Craft | Named as "optical refinement" | Nested radii, shadow light-source consistency, borders, icons, and micro-typography |
| Motion | Purpose only | Duration families, easing character, choreography, interruption, and reduced-motion parity |
| Style vocabulary | Prohibited as vague | A lexicon of nine archetypes defined by measurable signatures, with drift detection |
| Copy | Correctness only | Voice axes, tone by state, and microcopy patterns |
| Gate | Seven frontend gates | An eighth `aesthetic` gate, not-applicable until you opt in |

## 1. Update the package identity

The package version is now `5.0.0`. Documentation, conformance, and the validation suite all check for it.

## 2. Nothing is required yet

Without configuration, `aesthetics.enabled` is `false` and the aesthetic gate reports `not-applicable`, which does not affect the quality score or confidence. A v4 pipeline upgraded to v5 produces the same gate result it produced before.

## 3. Opt in when you want the gate

Add to `vision-loop.config.json`:

```json
{
  "aesthetics": {
    "enabled": true,
    "profilePath": "design/aesthetic-profile.json",
    "measurementsPath": "artifacts/vision-loop/reports/aesthetic-measurements.json",
    "reviewPath": "design/aesthetic-review.json",
    "minScore": 80,
    "dimensionFloor": 3,
    "requireTestEvidence": true
  }
}
```

`enabled` requires `profilePath`, because a gate with no declared direction has nothing to verify against. With aesthetics enabled, `vision-loop` loads the profile, optional measurements, and review into the run summary. Missing required evidence fails the aesthetic gate rather than leaving a silent skip.

## 4. Write the aesthetic profile

Copy `templates/aesthetic-profile.md` or start from `examples/aesthetic-profile.example.json`. Take a position from 1 to 5 on each personality axis, with a reason and the design consequences you accept. Declare the novelty budget, the system intents, and the voice.

The profile audit rejects entries that cannot be checked against a render, including the unconstraining terms this package has always prohibited.

## 5. Run the audits

```bash
npm run audit:aesthetics -- --input aesthetic-audit.json
npm run aesthetics:review -- --config vision-loop.config.json
```

The first is mechanical and produces facts. The second validates the judgment review. Run the mechanical audit first so reviewers do not spend attention on defects a measurement already found.

## 6. Add the review to your review chain

The aesthetic review follows the same independence rule as every other review: the implementer cannot approve it. It binds to the configuration hash of the artifact reviewed, so a stale review cannot approve a changed artifact.

Three rules will fail a review that would have passed under a plain average:

- a dimension below the floor fails regardless of the weighted score;
- a rating below 3 without a supporting finding is rejected as an opinion;
- a deviation marked system-wide cannot be parked as residual.

With `requireTestEvidence` enabled, a rating of 5 also requires at least one recorded test.

## Compatibility notes

- Every v4 script, schema, contract, and report shape is unchanged.
- `schemas/design-contract.schema.json` gains optional `audience`, `aestheticProfile`, `emotionalTone`, `copyVoice`, and typed `motion` properties. Existing contracts remain valid.
- `DEFAULT_GATE_WEIGHTS` gains `aesthetic: 10`. Existing weights are unchanged, and scoring normalizes by applicable weight, so gate results do not move until you opt in.
- `references/design-director.md` still prohibits style labels as design theses. The style lexicon does not change that rule; it supplies measurable parameter bundles for describing and detecting style, not a substitute for a thesis.
- The all-in-one bundle is now `FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md`. The v4 bundle is not regenerated.
