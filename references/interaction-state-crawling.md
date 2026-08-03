# Interaction State Crawling

## Purpose

Default screenshots hide interaction quality. State crawling measures whether visible controls provide distinguishable hover and focus feedback.

## States and Properties

For each visible interactive element, the crawler records selected computed-style properties in:

- Resting state
- Hover state
- Focus state

Properties include text/background/border color, border width, shadow, outline, opacity, transform, decoration, and filter.

## Policy

- Missing measurable focus feedback is blocking.
- Missing hover feedback is normally a warning.
- Disabled controls are excluded from feedback requirements.
- Computed-style change is evidence of a change, not proof that the change is perceptible or accessible.

Complete manual keyboard review remains required for the primary task.

## Interaction Inventory

The companion inventory checks:

- Accessible names
- Hit-target dimensions
- Nested interactive controls
- Duplicate IDs
- Visibility, disabled state, and tab index

Use native elements whenever possible. A clickable generic element requires complete semantics, keyboard activation, focus, state, and disabled behavior; adding only a role is insufficient.

## Screenshots

Element-state screenshots are optional because they can create many artifacts. Enable them for component-library review or when computed styles do not explain a visual defect.
