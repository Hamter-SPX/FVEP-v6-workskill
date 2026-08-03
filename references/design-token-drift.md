# Design Token Drift

## Purpose

Token drift identifies when a surface diverges from an approved reference or design system even if individual screenshots look acceptable.

## Evidence Collected

- Root CSS custom properties
- Font families and sizes
- Text and background colors
- Border radii
- Shadows
- Margin, padding, and gap primitives

The extractor records frequency maps from declared selectors. Comparison reports missing, extra, and changed variables plus primitive-set similarity.

## Interpretation

A high drift score can indicate:

- Parallel color or spacing systems
- Page-specific arbitrary values
- Unintended theme mismatch
- New component variants that bypass tokens
- Reference/current loaded with different fonts or themes

Drift is diagnostic. A legitimate redesign can intentionally change tokens, but the design contract and baseline must reflect the decision.

## Review Procedure

1. Confirm reference and current use the same theme and font-loading state.
2. Inspect changed semantic variables before raw primitive values.
3. Group repeated primitive differences by component or token family.
4. Fix source tokens or variants rather than repeated leaf declarations.
5. Re-extract profiles and verify screenshot regressions.

## Stored Reference Profiles

Approved token profiles can be promoted with the visual baseline. When no live reference URL is available, the system loads those stored profiles for drift comparison.
