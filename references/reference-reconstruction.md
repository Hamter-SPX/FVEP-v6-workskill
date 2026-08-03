# Reference Reconstruction

## Observation vs. Inference

Create two columns before implementation.

**Observed:** visible composition, relative dimensions, wrapping, crop, alignment, icon style, contrast, states shown, and motion demonstrated.

**Inferred:** exact font, breakpoint, spacing token, component library, DOM structure, interaction not shown, hidden states, and source asset.

An inference may guide implementation but must remain labeled until verified.

## Extract Design DNA

### Composition

- Page regions and reading order
- Grid columns, gutters, max-width behavior, and alignment lines
- Relative dimensions and whitespace distribution
- Overlap, crop, asymmetry, and focal point

### Typography

- Family category and available alternatives
- Role hierarchy
- Weight, size, line height, tracking, case, and measure
- Wrapping and font-metric effects on geometry

### Color and Surface

- Semantic contrast relationships
- Border thickness and radius family
- Elevation, blur, gradient, texture, and background treatment

### Assets and Icons

- Identity, crop, aspect ratio, resolution, focal point, and treatment
- Icon family, stroke weight, fill, optical size, and baseline alignment

### Interaction

- Affordances and state changes visible in recordings
- Timing, direction, continuity, and interruption
- Keyboard and reduced-motion behavior that still must be designed when not shown

## Reconstruction Strategy

1. Build a wireframe matching region order and macro geometry.
2. Validate dimensions and responsive composition.
3. Match typography and wrapping.
4. Match assets and component proportions.
5. Match surface language.
6. Implement states and motion.
7. Apply optical corrections.

## Missing Asset Policy

Do not silently substitute a different image and claim exact fidelity. Report:

- Missing asset
- Substitute used, if approved
- Affected region
- Hierarchy or crop impact
- What is required for exact acceptance

## Ethical and Technical Boundaries

Reproduce interfaces only when the user has the right to do so. Do not copy proprietary assets, misleading branding, or authentication surfaces for deceptive use. Preserve asset licenses and attribution obligations.
