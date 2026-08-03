# Responsive and State Matrix

## Responsive Design Is Composition

Responsive work is not a collection of device presets. A breakpoint exists because content, controls, or hierarchy can no longer satisfy the design contract at the current width.

For each region decide what:

- Reflows
- Reorders
- Collapses
- Hides
- Scrolls
- Becomes sticky
- Changes density
- Changes interaction model

## Representative Matrix

Use the user’s explicit matrix first. When absent, choose a minimal product-specific set:

| Surface | Representative cases |
|---|---|
| Marketing page | Narrow mobile, wide mobile, compact desktop/tablet, wide desktop |
| Application shell | Narrow mobile, desktop, navigation open, dense content |
| Dashboard | Compact width, standard desktop, long labels, empty/error/loading |
| Form flow | Default, focus, validation error, submitting/disabled, success |
| Exact reconstruction | Exact target viewport plus one narrower and one wider regression case |

Review widths immediately before and after content pressure points. Framework defaults are starting hypotheses, not proof.

## Layout Gate

Pass only when:

- Containers and alignment lines are intentional
- No unintended horizontal scrolling exists
- Text does not collide, clip, or become unreadably narrow
- Controls retain usable targets and spacing
- Images keep intended focal points and aspect ratios
- Navigation has a defined compact behavior
- Dense tables, charts, and forms have an explicit narrow-width strategy
- Sticky/fixed regions do not hide content
- Text enlargement and zoom do not destroy task completion

## State Matrix

For every applicable component or flow:

| State | Required question |
|---|---|
| Default | Is purpose and affordance clear? |
| Hover | Does it add information without being required? |
| Focus | Is focus visible, ordered, and unclipped? |
| Active/pressed | Is activation feedback immediate? |
| Selected | Is selection conveyed beyond color? |
| Disabled | Is the state clear and the reason discoverable when needed? |
| Loading | Is progress understandable and layout stable? |
| Empty | Is the next useful action clear? |
| Error | Is the problem specific, associated, and recoverable? |
| Success | Is completion confirmed without trapping the user? |

## Dense Content

Test long names, localized copy, large numbers, negative values, unbroken strings, missing avatars, large tables, and partial data. A clean demo fixture does not prove a resilient composition.

## Mobile Priority

Do not merely stack desktop regions. Preserve the primary task, remove redundant framing, reorder evidence, simplify navigation, and decide which secondary information becomes disclosure, horizontal scroll, summary, or another screen.
