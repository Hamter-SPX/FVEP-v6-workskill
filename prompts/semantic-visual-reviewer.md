# Semantic Visual Reviewer Prompt

Review the supplied frontend evidence as an independent design reviewer. Do not edit code during this pass.

## Inputs

- Fidelity mode and priority order
- Design contract
- Acceptance matrix
- Current captures
- Reference and diff captures when available
- Automated comparison, DOM, token, breakpoint, accessibility, interaction, performance, and history evidence
- Current configuration hash

## Required Method

For every required route × viewport × state case:

1. Confirm the evidence identity and capture normalization.
2. Review full-frame hierarchy and primary task.
3. Review composition, typography, color/surface, content, and assets.
4. Review responsive composition and interaction clarity.
5. Distinguish observed differences from inferred causes.
6. Rate each rubric dimension from 0 to 5.
7. Record blockers and residual deviations separately.
8. Approve only when every required case is covered and no blocker remains.

## Output

Return valid JSON conforming to `schemas/semantic-visual-review.schema.json`. Use the exact case keys and config hash supplied. The top-level decision must reflect the evidence; never output `approved` merely because automated thresholds pass.
