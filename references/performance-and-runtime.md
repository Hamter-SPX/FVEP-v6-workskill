# Performance and Runtime

## Measure Before Claiming

Do not state that a change is fast, optimized, or improves Core Web Vitals without measurement in a representative environment.

## Review Areas

### Media

- Intrinsic dimensions prevent layout shift
- Responsive sources match rendered sizes
- Modern formats and compression are appropriate
- Priority and lazy loading reflect visual importance
- Crops and focal points remain correct

### Fonts

- Required weights are limited
- Subsetting and loading strategy are intentional
- Fallback metrics reduce layout shift
- Font failure preserves hierarchy and readability

### JavaScript

- Route-level payload is understood
- Client boundaries are no broader than necessary
- Heavy dependencies have evidence-based justification
- Expensive render loops and unnecessary state updates are avoided
- Long lists, tables, and charts use appropriate rendering strategies

### Network and Data

- Duplicate requests are removed
- Waterfalls are understood
- Loading and cache behavior match freshness needs
- Error and retry behavior are bounded

### Layout and Motion

- Asynchronous media, fonts, banners, and content do not create avoidable shift
- Animation uses appropriate properties
- Motion does not trigger repeated layout work

## Runtime Evidence

The tool layer records:

- Console errors and assertions
- Uncaught page errors
- Failed requests
- HTTP error responses

Configure explicit allow-patterns for known benign messages. Do not disable the entire runtime gate because one third-party message is noisy.

## Performance Completion Language

Use one of:

- Measured and passed the stated budget
- Measured; residual issue documented
- Not measured in this environment

Never use “optimized” as a substitute for evidence.
