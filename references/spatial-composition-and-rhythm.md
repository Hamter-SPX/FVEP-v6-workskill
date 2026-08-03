# Spatial Composition and Rhythm

## Purpose

Spacing is the primary carrier of structure. Before a user reads a label, spacing has already told them what belongs to what. When the spacing system encodes the content hierarchy, the interface feels organized; when spacing is uniform or arbitrary, the user must read everything to understand anything.

This reference covers the spacing scale, proximity grouping, grid behaviour, density, and the whitespace decisions that most often separate considered work from assembled work.

## The Spacing Scale

Use a small set of values derived from a base unit, typically 4 or 8 pixels. A scale that grows roughly geometrically at the larger end is easier to use than a purely linear one, because the useful distinctions at large sizes are proportionally larger.

A working scale is around eight to ten values. Two failure modes:

- **Too many values**, or values off the scale entirely, means spacing is being chosen per component. The symptom is that nothing aligns across pages.
- **Too few values** forces the same gap to express both "same group" and "different section," collapsing the structural signal.

Every off-scale spacing value in the render should be traceable to a deliberate optical correction. Otherwise it is drift.

## Proximity Encodes Structure

The rule is simple and it is violated constantly: **the gap between groups must be clearly larger than the gap inside a group.**

- A label sitting closer to the field below it than to its own field is the single most common spacing defect in forms, and it inverts the meaning.
- A section heading spaced equally from the section above and the section below belongs to neither.
- Items in a list separated by the same gap that separates the list from the next block read as one undifferentiated run.

As a working ratio, the between-group gap should be roughly twice the within-group gap, adjusted so both land on the scale. What matters is that the difference is unambiguous at a glance.

Nesting should be visible in the spacing: outer padding larger than inner padding, section gaps larger than group gaps, group gaps larger than element gaps. When these invert at any level, the perceived structure inverts with them.

## Whitespace

Whitespace is not emptiness to be filled or added. It is the instrument that produces grouping, emphasis, and pace.

- **Macro whitespace** separates major regions and sets the overall density character.
- **Micro whitespace** separates elements within a group and does most of the work of legibility.

Two symmetric failures:

- **Cramped.** Elements touching their containers, text running to the edge of its surface, controls without breathing room. Reads as unfinished and increases error rates.
- **Vacant.** Very large gaps that do not correspond to structural boundaries, oversized margins on dense content, or a layout that forces scrolling past emptiness to reach the primary task. Whitespace that does not improve hierarchy is a defect, not restraint.

The test is whether removing a given gap would change what appears grouped. If not, it is decoration.

## Grid and Alignment

- A grid exists to produce shared edges. Its value is that elements across unrelated components line up.
- Every element should align to something. An element that aligns to nothing draws attention without meaning.
- Alignment edges should be few. A layout with many distinct left edges reads as disordered even when each element is individually placed with care.
- Optical alignment overrides geometric alignment where they differ, most often with text inside padded containers and with elements that have significant internal whitespace.
- Container padding and grid gutters must be reconciled. Nesting a gridded container inside a padded one commonly produces a doubled edge inset that misaligns content against the header above it.

Full-bleed and contained regions can alternate, but the content inside a full-bleed region should still resolve to the same measure and alignment as contained regions, or the page will read as two layouts.

## Density

Density is a product decision, not a style preference. It follows from how much information the user needs simultaneously and how long they spend in the interface.

- **Dense** suits professional tools, monitoring, and data work where scanning many values at once is the task. Dense layouts need tighter spacing, smaller type, and stronger reliance on alignment and rules rather than whitespace for separation.
- **Comfortable** suits transactional and consumer flows where each step is discrete.
- **Spacious** suits marketing, onboarding, and terminal moments where a single message dominates.

A product may use different densities in different regions, provided the density is consistent within a region and the transition happens at a structural boundary. Mixing densities inside one region reads as inconsistency.

The common error is applying marketing-page spacing to a data-heavy region, which pushes information below the fold and forces scrolling for work that should be visible at once.

## Vertical Rhythm

Consistent vertical intervals let the eye move down a page without re-orienting.

- Space between sections should come from a small number of values, and the same structural relationship should get the same value everywhere.
- Space is generally set once, in one direction, rather than as competing margins from both neighbours. Collapsing and doubled margins are a frequent source of intervals that do not match the scale.
- Text line boxes should resolve to values compatible with the spacing scale, or every text block introduces a fractional offset.

## Responsive Behaviour

Spacing is not a constant across viewports.

- Macro spacing should decrease at narrow widths. Desktop section gaps applied on mobile waste a large fraction of a small screen.
- Micro spacing should stay roughly constant, because it is governed by legibility and touch target requirements rather than available space.
- Container padding scales with viewport; component padding largely does not.
- Reordering at narrow widths must preserve grouping. A group whose members separate across a breakpoint has lost its structural signal.

## Evaluation Checklist

- Do all spacing values resolve to the scale, and is every exception a documented optical correction?
- Is the between-group gap clearly larger than the within-group gap everywhere?
- Does nesting depth correspond to decreasing spacing?
- Does every element align to a shared edge, and is the number of distinct edges small?
- Is whitespace doing structural work, or is it filling space?
- Is density appropriate to the task and consistent within each region?
- Do vertical intervals repeat, and do they come from the scale?
- Does macro spacing compress at narrow widths while micro spacing holds?
- Do groups survive responsive reordering intact?

## Related

- `references/aesthetic-principles.md` — grouping, rhythm, and balance as perceptual principles.
- `references/typographic-system-quality.md` — line boxes and their interaction with the spacing scale.
- `references/responsive-and-state-matrix.md` — the viewport and state coverage requirements.
- `references/visual-craft-standards.md` — optical corrections.
