# Frontend Engineering Gates

## Repository Fit

Before implementation:

- Read package scripts, framework configuration, routing, data fetching, state patterns, CSS strategy, test setup, and deployment constraints.
- Reuse existing primitives, tokens, utilities, icons, and component conventions.
- Avoid introducing another framework, UI kit, state library, styling strategy, or animation dependency for convenience.
- Preserve public interfaces unless migration is part of the approved scope.

## Component Architecture

Pass only when:

- Components have one understandable responsibility
- State ownership is deliberate
- Repeated behavior uses variants or composition
- Page-specific composition remains near the page
- Shared primitives are stable and domain-neutral
- Data transformation and side effects are separated when that improves testability
- Props and events form a clear interface
- Giant components, deeply coupled contexts, and duplicated one-off styling are avoided

Do not extract merely because markup appears twice. Extract when it creates a stable concept, variant contract, or test boundary.

## Styling and Tokens

Pass only when:

- Semantic tokens express roles rather than raw appearance
- Spacing, type, radii, borders, shadows, and motion use coherent scales
- Global styles are minimal and intentional
- Specificity is controlled
- Responsive rules live with the concept they govern
- Arbitrary values are limited to justified optical corrections
- Theme behavior is predictable
- Browser defaults are accepted or normalized deliberately

Repeated arbitrary values indicate a missing token or component variant.

## Data and State

Handle relevant loading, refetching, empty collections, partial data, long labels, validation errors, network failures, permission restrictions, pending actions, optimistic rollback, and stale/conflicting data.

Use deterministic fixtures for captures and tests.

## Testing Layers

Use the repository’s existing tools:

- Unit tests for pure behavior and transformations
- Component tests for variants, state, and interaction
- Integration tests for routed or data-connected flows
- End-to-end tests for the primary task
- Visual regression tests for stable high-value surfaces
- Build and hydration checks for server-rendered applications

Visual screenshots complement behavior tests; they do not replace them.

## Verification Matrix

| Check | Evidence |
|---|---|
| Dependency health | Existing lockfile respected; install succeeds |
| Type safety | Typecheck exits successfully |
| Static analysis | Lint exits successfully |
| Behavior | Relevant tests pass |
| Build | Production build succeeds |
| Runtime | Target routes have no blocking console, page, or network failures |
| Visual | Final acceptance captures exist |
| Accessibility | Automated scan plus manual primary-flow review |
| Responsive | Required viewport/state matrix reviewed |
| Performance | Relevant measurements or an explicit unmeasured gap |

Classify new warnings. Do not dismiss them automatically.
