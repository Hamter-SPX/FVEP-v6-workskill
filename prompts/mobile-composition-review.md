# Mobile Composition Review Prompt

Evaluate the narrow-width render as a designed composition, not a stacked desktop layout.

Check:

- Whether the primary task remains visible and reachable
- Navigation transformation and dismissal
- Reordering of primary versus secondary regions
- Text measure, wrapping, truncation, and density
- Control target size and adjacent spacing
- Data-grid, chart, media, and long-label strategy
- Sticky/fixed obstruction
- Horizontal overflow and first offending constraint
- Loading, empty, error, and open-overlay states
- Keyboard focus visibility inside compact navigation and dialogs

Return findings by severity with exact case, region, expected behavior, observed behavior, root-cause hypothesis, and regression widths to capture.
