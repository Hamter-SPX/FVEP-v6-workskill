# Visual Annotation Workflow

Use annotations when the user circles, boxes, arrows, numbers, or labels regions on a screenshot.

## Annotation Contract

For each mark record:

- Annotation ID
- Image and viewport
- Region bounds or visual landmark
- User instruction
- Matching DOM selector or component, if identified
- Ambiguity and assumption
- Planned change
- Regression surface
- Before/after evidence

## Resolution Order

1. Match the annotation to a stable product region.
2. Identify the owning component, not merely the nearest DOM node.
3. Interpret the requested visual change in the design contract.
4. Detect conflicts with responsive behavior, accessibility, or shared variants.
5. Apply the smallest coherent component/token change.
6. Re-render the annotated case and affected consumers.

## Ambiguity

A hand-drawn region can include several nested elements. Do not guess silently. If work must proceed without clarification, state the chosen ownership boundary and preserve an easy rollback.

## Multiple Annotations

Group annotations by shared cause. Several spacing marks may point to one container token; several button marks may point to one variant. Avoid independent local patches when a shared rule is responsible.

## Evidence

Final reporting links each annotation ID to the file/component changed and the accepted capture. An annotation is not complete because the marked pixel changed; its responsive and interaction behavior must remain valid.
