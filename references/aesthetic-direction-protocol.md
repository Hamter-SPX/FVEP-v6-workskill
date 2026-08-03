# Aesthetic Direction Protocol

## Purpose

The aesthetic references describe principles, craft, colour, typography, space, motion, personality, style, and voice. This protocol says how they are used inside the governed process: when direction is set, what artifact records it, how it is verified, and where it binds to the existing gates.

## Where This Sits

Aesthetic direction is part of design, not a separate phase. It happens inside step 2 of the workflow, before implementation, and it is verified inside step 6 alongside the vision loop.

```text
route the work
→ inspect context and existing design system
→ explore visual direction with ImageGen options when redesigning from screenshots
→ establish the aesthetic profile          (this protocol)
→ compare approaches and approve a design
→ implement
→ run the vision loop and the aesthetic audit   (this protocol)
→ semantic visual review and aesthetic review   (this protocol)
→ gate
```

When the user attached UI screenshots and asked to redesign or restyle, complete `references/visual-direction-exploration.md` **before** writing the aesthetic profile: generate two or three distinct images, wait for a numbered choice, write `visual-direction-spec.md`, wait for **เริ่มเขียน** / **ปรับต่อ** / **เลือกใหม่**, then bind the confirmed choice into the profile. Preference without a visible option set and a durable spec is not an explored direction.

## 1. Explore Visible Direction When Redesigning

If the trigger in `references/visual-direction-exploration.md` applies, run that protocol first. Do not author the profile from an unchosen ImageGen batch or from a single unselected mock.

## 2. Establish the Aesthetic Profile

Before proposing a direction, inspect what already exists. A product with an established design system has already made most of these decisions, and the profile documents them rather than reinventing them. Overriding an existing system requires an explicit reason.

The profile records:

- **Personality positions** on each axis from `references/brand-personality-and-tone.md`, with reasons and accepted consequences.
- **Style parameters**, optionally naming an archetype from `references/visual-style-lexicon.md` alongside the specific parameters adopted and rejected.
- **Novelty budget** — where distinctiveness is spent, stated in one sentence per position.
- **System intents** — the intended shape of the colour, type, spacing, elevation, radius, and motion systems.
- **Voice positions** on the axes from `references/copy-voice-and-microcopy.md`.
- **Non-goals** — the directions explicitly rejected, which prevents rediscovering them later.

Store it against `schemas/aesthetic-profile.schema.json`. The profile is referenced by the design contract; it is not duplicated inside it.

A profile is only useful if it is falsifiable. Every position must be checkable against a render. If a reviewer cannot say whether an artifact matches, the entry is decoration and must be rewritten.

## 3. Derive the Design Contract

The design contract consumes the profile and states the concrete decisions for the surfaces being built: composition, typography, surfaces, components, states, responsive rules, motion, and acceptance cases.

The visual thesis remains a statement about this product, not a style label. The profile supplies the character the thesis expresses; the archetype, if named, supplies shorthand for a parameter bundle. Neither replaces the thesis.

## 4. Implement

Implementation follows the normal plan and test-first discipline. Two ordering rules apply specifically to aesthetic work:

- Structure before surface. Composition, hierarchy, and states must be correct before colour, elevation, and craft refinement.
- Static before motion. Motion polish begins only after static geometry passes.

## 5. Audit Mechanically

Run the aesthetic audit against the rendered artifact. It measures what can be measured without judgment:

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
npm run audit:aesthetics -- --profile aesthetic-profile.json --tokens artifacts/vision-loop/reports/token-profile.current.json --no-require-review
```

`--tokens` fills empty mechanical sections from a captured token profile; it never overwrites hand-authored measurements. Prefer a combined `--input` (or `--measurements`) once measurements are stable.

The audit covers colour ramp evenness and contrast, type scale distinguishability and role count, spacing scale conformance and vocabulary size, radius nesting, shadow light-source consistency, elevation vocabulary, motion duration and easing families, and the style signature of the artifact against the declared archetype.

Mechanical findings are facts. They do not require a reviewer to agree, and they should be fixed before a human or agent reviewer spends attention on judgment-based dimensions.

## 6. Review by Judgment

The aesthetic review covers what cannot be measured. It operates on current renders, one per required case, and uses the tests in `references/aesthetic-principles.md` rather than unaided impression. Each of the eight aesthetic dimensions is rated using the anchors in `references/aesthetic-scoring-anchors.md`.

The review is recorded against `schemas/aesthetic-review.schema.json` and is bound to the configuration hash of the artifact reviewed, so a stale review cannot approve a changed artifact.

The reviewer may not be the implementer. This follows the existing review independence rule and applies to aesthetic verdicts exactly as it applies to spec and quality verdicts.

## 7. Gate

The aesthetic evidence contributes a dedicated `aesthetic` gate to the frontend quality summary. It is not folded into the visual gate, because visual comparison answers a different question — fidelity to a reference — and averaging the two would let a high comparison score conceal poor craft.

The gate fails when a blocker is recorded, when any dimension falls below its floor, when the weighted score is below policy, when required cases are missing, or when the review does not bind to the current artifact.

## Degraded Operation

When the runtime cannot render the interface, the aesthetic review cannot be performed. Record it as a verification gap rather than as a pass. Specifically:

- Without a browser, mechanical audits can still run against a declared profile and static token sources, but measurements taken from source rather than from a render must be labelled as inferred.
- Without a reviewer independent of the implementer, the review is recorded as ungoverned and the gate does not pass on it.
- Comparing appearance from memory instead of a current render remains prohibited.

## Anti-Patterns

- Treating the aesthetic profile as a mood statement rather than a set of checkable positions.
- Naming a style archetype as the design thesis.
- Running the aesthetic review before the semantic review, which spends judgment on surfaces whose content or hierarchy is still wrong.
- Polishing craft on a layout whose composition has not been approved.
- Accepting a low dimension score because the weighted average is acceptable.
- Recording a rating of 5 without having performed the applicable test.

## Related

- `references/visual-direction-exploration.md` — ImageGen option sets before profile authorship.
- `references/aesthetic-principles.md` — the model and its tests.
- `references/aesthetic-scoring-anchors.md` — rating anchors, weights, and the decision rule.
- `references/design-before-implementation.md` — the governing design gate.
- `references/vision-loop-protocol.md` — the rendering and comparison loop this runs alongside.
