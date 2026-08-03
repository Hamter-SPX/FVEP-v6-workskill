# Migration from v1 to v2

## Configuration

Set `version` to `2` and review the new policy sections:

- `interaction`
- `stateCrawler`
- `performance`
- `tokens`
- `breakpoints`
- `quality`
- `baseline`
- `manualReview`
- `history`

The normalizer supplies defaults, but exact-reference mode now enables baseline governance by default. Promote an approved baseline before expecting the full gate to pass.

## Semantic Review

The review file now requires:

- Explicit top-level decision
- Current configuration hash
- Complete route × viewport × state coverage
- Ratings for all eight dimensions
- No unresolved blockers for approval

Generate the correct skeleton with `npm run review:create`.

## Quality Decision

v2 separates quality score from evidence confidence. Available checks can score well while missing checks keep confidence below policy. Final release also requires recorded semantic approval.

## Tooling

New commands add performance, interaction inventory, state crawling, breakpoint discovery, token drift, baseline verification, review validation, and CI quality enforcement. Existing capture, compare, inspect, accessibility, engineering, and vision-loop commands remain available.
