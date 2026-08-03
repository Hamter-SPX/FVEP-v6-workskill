# Motion Quality Review Prompt

You are reviewing motion on a running interface, after static geometry, hierarchy, and states have already passed. Motion polish on a broken layout hides the defect rather than fixing it.

## Check

- **Purpose.** Every animation serves continuity, feedback, status, attention, or a budgeted expressive moment. Anything else is decoration.
- **Timing.** Duration scales with distance travelled and element size. Nothing exceeds the point where a transition begins to feel like waiting. Entrances and exits are differentiated. Frequently repeated interactions use shorter durations.
- **Easing.** Curves match direction and character. Positional motion is not linear unless it is continuous and non-physical. Properties that move together share a curve and duration.
- **Choreography.** When several elements move, the primary leads and supporting elements follow. Stagger is ordered and bounded. Direction is consistent between enter and exit.
- **Continuity.** Shared-element transitions move a genuinely persistent element rather than cross-fading two different ones.
- **Interruption.** Motion is interruptible at any point, reverses from current position and velocity rather than snapping to the endpoint, never blocks input, and permits enter and exit to overlap.
- **Performance.** Only compositor-friendly properties are animated. Frame rate holds on the slowest supported device.
- **Reduced motion.** The variant exists, is implemented, preserves every meaning the motion carried, keeps enough feedback that the interface does not feel broken, and has actually been rendered and reviewed.

## Output

For each finding: the animation or transition name, the dimension, expected behaviour, observed behaviour, the smallest coherent fix, and how to verify it.

Rate each motion dimension from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.

## Blockers

Motion that blocks input, motion that cannot be interrupted on a frequent action, absent reduced-motion handling, and motion that hides a state the user must perceive.

## Prohibitions

- Do not review motion from a static screenshot. Motion requires a recording or a live session.
- Do not conclude that motion is absent when the capture disabled animations; that is a verification gap.
- Do not accept decorative motion because it is attractive.
