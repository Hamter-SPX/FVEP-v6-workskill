# Motion Quality Standards

## Purpose

The rest of this package asks only whether motion has a purpose. That prevents decorative animation but does not produce motion that feels good. Motion quality is the difference between an interface that feels responsive and one that feels sluggish or nervous, and it is judged on timing, easing, continuity, and interruption behaviour — all of which are specifiable and reviewable.

Motion is the last layer. Static geometry, hierarchy, and states must pass before motion polish begins. Animating a broken layout hides the defect rather than fixing it.

## What Motion Is For

Every animation must serve one of these functions. Anything else is decoration.

- **Continuity.** Showing where an element came from or went, so the user maintains a spatial model. Expanding a card into a detail view, or a list item sliding out as it is removed.
- **Feedback.** Confirming that an input was received. The press state of a button, the ripple of a tap, the shake of a rejected form.
- **Status.** Communicating that work is in progress and roughly how much remains.
- **Attention.** Directing focus to a change the user did not initiate, such as a newly arrived notification.
- **Expression.** A small, deliberate amount of brand character, confined to non-blocking moments.

Expression is the only optional category and has the smallest budget. It must never be on the critical path of a frequent task.

## Duration

Duration is a function of distance travelled and the size of the moving element. A large element crossing a long distance at the same duration as a small one moving a short distance will feel fast; the reverse feels sluggish.

Working families:

| Class | Range | Use |
|---|---|---|
| Instant | 50–100 ms | Colour and opacity changes on hover and press |
| Short | 150–200 ms | Small local transitions, tooltips, small expansions |
| Medium | 250–350 ms | Panels, sheets, dialogs, larger reveals |
| Long | 400–500 ms | Full-screen transitions, complex choreography |

Above roughly 500 ms an interface transition begins to feel like waiting rather than moving. Below roughly 100 ms it reads as a jump rather than a transition — acceptable for feedback, not for continuity.

Entrances are generally slower than exits. The user needs time to absorb something arriving, but something leaving has already been decided and holding it on screen delays the next action.

Repeated interactions demand shorter durations. Motion that is delightful the first time becomes an obstacle the fiftieth time.

## Easing

Easing carries most of the perceived character. A single easing curve applied to everything is the most common motion defect after unmotivated animation.

- **Linear** is correct only for continuous, non-physical motion such as a spinner or progress fill. Applied to positional motion it reads as mechanical.
- **Ease-out** — fast start, slow settle — is the default for entrances and for anything responding to a user action. It feels immediate because it commits to the motion at once.
- **Ease-in** — slow start, fast finish — suits exits, where the element accelerates away.
- **Ease-in-out** suits movement between two on-screen positions where both ends are visible.
- **Spring** physics produce natural motion and handle interruption gracefully, since a spring can be redirected mid-flight from its current velocity. Springs are preferred for gesture-driven and directly manipulated interfaces. Overshoot must be small for functional motion; a pronounced bounce reads as playful and is a brand decision, not a default.

Properties that change together should share easing and duration, or the element will appear to come apart during the transition.

## Choreography

When several elements move at once, their relationship must remain legible.

- **Stagger** delays each item in a sequence by a small offset, typically 20–50 ms, so a list reads as arriving in order rather than as one block. Total stagger should stay within the perceptual window; a long list staggered fully will keep the last item waiting far too long, so cap the number of staggered items and let the remainder arrive together.
- **Shared element continuity** requires that the element genuinely persist. Cross-fading between two different elements at the same position is not continuity and reads as a flicker.
- **Hierarchy in motion.** The primary element leads; supporting elements follow. Everything moving simultaneously at the same speed removes the hierarchy the static design established.
- **Direction must be consistent.** If a panel enters from the right, it exits to the right. Inconsistent direction destroys the spatial model the motion was meant to build.

## Interruption

Interruption behaviour is where most motion implementations fail, and it is highly visible.

- An animation must be interruptible at any point. A user who taps twice should not wait for the first animation to complete.
- Reversal starts from the current position and current velocity, not from the endpoint. Snapping to the end and then playing the reverse is the characteristic defect.
- Motion must never block input. A control participating in an entrance animation should be interactive from the first frame.
- Enter and exit must be able to overlap. Requiring the exit to finish before the entrance begins produces a visible empty gap.

## Performance

- Animate only compositor-friendly properties — transform and opacity. Animating layout properties forces reflow and produces frame drops that are perceived as cheapness, not as a technical issue.
- Long lists and complex scenes need their animation scope bounded.
- Motion must hold its frame rate on the slowest supported device. Motion that stutters is worse than no motion.

## Reduced Motion

A reduced-motion preference is a requirement, not an enhancement.

- Remove or substantially reduce movement, parallax, scaling, and rotation.
- Keep opacity transitions and instantaneous state changes so feedback is not lost. Removing all transition can make an interface feel broken.
- Reduced motion must preserve every meaning the motion carried. If a transition was the only signal that a panel replaced another, the reduced variant needs a different signal.
- Both variants must be captured and reviewed. A reduced-motion path that was never rendered is a verification gap.

## Evaluation Rubric

Score each dimension from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.

| Dimension | 5 means |
|---|---|
| Purpose | Every animation serves continuity, feedback, status, attention, or a budgeted expressive moment |
| Timing | Duration scales with distance and element size; entrances and exits are differentiated; nothing exceeds the perceptual window |
| Easing | Curves match the direction and character of each motion; no unmotivated linear positional motion; co-moving properties share curves |
| Choreography | Multiple moving elements preserve hierarchy and direction; stagger is bounded and ordered |
| Interruption | Motion is interruptible, reverses from current state, never blocks input, and permits overlap |
| Reduced motion | The reduced variant preserves all meaning, is implemented, and has been rendered and reviewed |
| Performance | Compositor-friendly properties only; frame rate holds on the slowest supported device |

Blockers: motion that blocks input, motion that cannot be interrupted on a frequent action, absent reduced-motion handling, or motion that hides a state the user must perceive.

## Related

- `references/aesthetic-principles.md` — the perceptual basis for continuity and attention.
- `references/accessibility-and-interaction.md` — reduced motion as an accessibility requirement.
- `references/performance-and-runtime.md` — frame budget and runtime measurement.
- `references/aesthetic-scoring-anchors.md` — the 0–5 anchor definitions.
