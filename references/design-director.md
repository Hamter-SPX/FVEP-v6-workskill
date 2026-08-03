# Design Director

## Product Before Decoration

Start with the product question: what must the user understand or accomplish, in what order, under what constraints? Visual direction exists to clarify that task.

Define:

- Audience and context of use
- Primary task and decision
- Most important evidence or content
- Expected information density
- Emotional and brand character
- Trust, urgency, safety, and error-recovery needs

## Fidelity Modes

### Exact Reference

Priority order:

1. Required content and assets
2. Composition and geometry
3. Typography and spacing
4. Surface language
5. Interaction and motion
6. Optical refinement

Do not call the result exact when brand constraints, missing assets, or unavailable fonts force visible deviation.

### Brand-Consistent

Preserve brand tokens, typography, component language, density, copy style, and interaction conventions while borrowing useful composition patterns. Document every intentional departure from the external reference.

### Original Direction

Choose one specific visual thesis tied to product goals. Examples of a thesis are not style labels such as modern or premium; they state how hierarchy, density, typography, and interaction express the product.

## Design Contract Decisions

### Composition

Specify shell, reading order, dominant axis, grid, max width, gutters, alignment lines, intentional asymmetry, crop behavior, whitespace distribution, and density.

### Typography

Specify display, heading, body, label, caption, and numeric roles. Include family, fallback, weight, size, line height, tracking, case, measure, wrapping, and truncation behavior.

### Surface Language

Use semantic roles: canvas, surface, elevated surface, text, muted text, border, primary, success, warning, and danger. Define radius family, border weight, elevation, blur, gradient, and texture only where conceptually justified.

### Components

Map primitives, composed components, page composition, and state ownership. A component must answer: what does it do, how is it used, what does it depend on, and which variants are valid?

### Motion

Motion communicates relationship, state, continuity, and feedback. Define duration family, easing character, interruption behavior, and reduced-motion behavior. Static geometry must pass before motion polish begins.

## Design Review Questions

- Is the primary action visually dominant?
- Does every strong accent have a semantic reason?
- Does the interface communicate grouping through proximity and alignment before containment?
- Is density appropriate for the task?
- Are repeated patterns truly consistent?
- Does the visual language remain coherent in edge states?
- Can mobile users complete the same primary task without hidden assumptions?
- Is the result recognizable as this product rather than generic software?
