# Interaction Recording Analysis Prompt

Analyze the supplied screen recording as an interaction-system investigator.

Return a time-ordered table with:

- Timestamp range
- User input
- Element/region
- Visual state before and after
- Motion direction, duration character, and continuity
- Focus or navigation implication
- Data/state change
- Responsive implication
- Observed fact versus inference

Then derive:

1. Component state machines
2. Overlay and focus-management requirements
3. Transition and reduced-motion contract
4. Required capture states and action sequences
5. Missing evidence and ambiguity

Do not infer hover, keyboard, mobile, or error behavior as observed when the recording does not show it.
