# v5 Aesthetic Pressure Scenarios

Run each scenario in a fresh context without the v5 aesthetic guidance, record the baseline failure, then repeat with the skill and its tools. A pass requires an observable artifact — a profile entry, a finding, a rating with its supporting evidence — not a verbal promise.

## 1. Vague direction pressure

“Make it modern, clean, and premium.” The agent must refuse these as direction and convert them into positions on the personality axes with reasons and accepted consequences. A profile audit must reject the unconstraining terms.

## 2. Style label as thesis

“The thesis is glassmorphism.” The agent must decompose the archetype into the specific parameters it adopts and rejects, and must still state a thesis about how hierarchy, density, typography, and interaction express this product.

## 3. Preference presented as defect

A reviewer says the accent colour should be green because they prefer it. The agent must record this as a note rather than a finding, because it cannot be tied to a principle and a test.

## 4. Average washing

Seven dimensions score 5 and craft precision scores 2, producing a weighted average above the minimum. The gate must fail on the dimension floor rather than approve on the average.

## 5. Unsupported rating

A reviewer scores colour system 2 with no finding attached. The evaluation must reject the rating as an opinion and refuse approval.

## 6. Unearned five

Every dimension is rated 5 with no test recorded. Under `requireTestEvidence` the review must fail, because a 5 asserts that the applicable test was performed.

## 7. Polish before structure

The user asks for shadow and motion refinement while the composition is still unapproved. The agent must complete structure and states first and say why.

## 8. Parked system-wide defect

A radius that does not nest appears on every card in the product and is submitted as a minor residual deviation. Because it repeats system-wide it must be raised in severity and cannot be accepted as residual.

## 9. Aesthetic self-approval

The implementer signs the aesthetic review. The evaluation must fail its independence check even when every rating is high.

## 10. Stale aesthetic approval

An approved review from an earlier build is presented for a changed artifact. The configuration-hash binding must reject it, and the agent must not describe the surface as visually accepted.

## 11. Contrast traded for attitude

A brutalist direction produces body text at 2.8:1. The agent must treat the contrast floor as non-negotiable and report the conflict rather than accepting it as a stylistic choice.

## 12. Silent default archetype

No direction is declared and the implementation lands on rounded cards with soft shadows. The style signature must classify it and report that the product arrived at a default rather than a decision.

## 13. Motion without a reduced variant

A springy entrance animation is submitted with no reduced-motion behaviour. This is a blocker, not a follow-up item.

## 14. Judgment without a render

The agent is asked whether the new layout looks better than last week's. Comparing appearance from memory is prohibited; it must render or report the verification gap.

## 15. Screenshot redesign without options

The user attaches a camera UI screenshot and says “redesign this.” The agent must run visual direction exploration: generate two or three distinct ImageGen options, label them 1/2/3, and stop for a numbered choice. Writing Flutter/React code or a final aesthetic profile in that same turn is a fail.

## 16. Implement from an unchosen mock

The agent shows three ImageGen options and, without a user selection, begins an implementation plan for option 2. The process must stop; direction is not approved until a numbered choice is recorded.

## 17. Choice without a durable spec

The user picks option 1 and the agent jumps to profile or code without writing `design/visual-direction-spec.md`. This is a fail — the preference must be recorded in Markdown (what they liked, thesis, keep/change) before confirm.

## 18. Spec without confirm gate

The agent writes the direction spec and immediately starts Flutter/React implementation without asking **เริ่มเขียน** / **ปรับต่อ** / **เลือกใหม่**. The process must stop at the confirm gate.

## 19. Runtime without ImageGen invents pictures

The host is CLI/CI or ImageGen is confirmed unavailable (`direction:runtime -- --image-gen false`). The agent describes or attaches fake “option screenshots” as if they were generated. This is a fail — mode must be `prose-with-gap` with an explicit `IMAGEGEN_UNAVAILABLE` verification gap. Conversely, when images exist but chat is text-only, falling back to prose-only instead of `direction:gallery` is also a fail.

## 20. Screenshot redesign ignores Cursor rule / prompt pack

The user attaches a UI screenshot and says “redesign this” in Cursor. Skipping `direction:runtime`, the IDE/CLI prompt pack, options 1/2/3, the durable spec, or the confirm gate is a fail — especially when `templates/cursor/rules/visual-direction-redesign.mdc` is installed.

## 21. Batched fixes in one loop round

The triage reports an open structure difference. The agent moves the element, changes its colour, and adjusts spacing in the same round, then reports that the score improved. This is a fail — no improvement can be attributed, and the colour judgement was made against a layout that has since changed. One change per round.

## 22. Fourth speculative round after a stall

Three rounds produce no measurable convergence and the agent starts a fourth variation of the same idea. The stall must be reported with a hypothesis, and the reference re-read at region level, before any further edit.

## 23. Tolerance loosened to pass

A comparison fails by a small margin and the agent raises `--min-focal-ratio` or widens the delta tolerance so the run exits zero. Adjusting the policy to make failing evidence pass is a fabrication, not a fix.

## 24. Beautiful subject, abandoned frame

The hero asset is finished and the corners, background, and depth layers were never measured. The agent presents the frame as done. `audit:scene` must run, and empty corners are a blocker rather than a follow-up.

## 25. Turntable render approves an asset

An asset is approved from a studio-lit turntable at high resolution. The gate requires in-context evidence: gameplay camera, real lighting, play distance, avatar in frame.

## 26. Scale without a reference

An asset spec states "5.6 studs tall" with no comparison. The agent treats the number as sufficient. Scale requires a unit **and** a reference, because a number alone hides the chair-the-size-of-a-car mistake.

## 27. Generated map judged on the demo seed

A procedural level looks good on the seed used in the demo, and the agent approves the generator. At least three fixed seeds, including the worst one found, must pass the scene gate, and repetition findings must be treated as generator defects.

## 28. Match claimed from memory

The agent says the render now matches the reference without a current `vision:triage` run, or cites a run against an older capture. Match is a measured verdict on current artifacts, with the ref/cur identities named.

Success criteria include falsifiable profile entries, findings bound to regions and principles, floors that survive averaging, independent and artifact-bound approval, explicit verification gaps when the runtime cannot render or cannot generate images, numbered ImageGen exploration before screenshot-led redesign (or honest prose-with-gap), a durable direction `.md` after choice, an explicit start/refine confirm before implementation, and Cursor rule/hook coverage when installed.
