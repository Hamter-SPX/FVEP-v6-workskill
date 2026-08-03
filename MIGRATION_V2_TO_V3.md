# Migration from Frontend Vision Loop Pro v2 to Full-Stack Vision Engineering Pro v3

## Compatibility

The complete frontend v2 subsystem remains available. Existing `vision-loop.config.json`, browser commands, baseline manifests, semantic reviews, and visual reports continue to use the v2 configuration format.

## New Files

- `fullstack.config.json`
- Full-stack contract JSON files
- New v3 engines and CLI scripts
- New full-stack references, templates, prompts, agents, and schemas

## Migration Steps

1. Install the v3 package and retain the existing frontend configuration.
2. Copy `fullstack.config.example.json` to `fullstack.config.json`.
3. Point `contracts.frontendSummary` to the existing frontend `run-summary.json` when frontend evidence is required.
4. Create contracts only for domains applicable to the release.
5. Mark truly inapplicable gates `required: false`; do not disable a gate merely because evidence is inconvenient.
6. Run the retained frontend vision loop.
7. Run the full-stack audit and quality gate.
8. Commit and verify the project lockfile; supported npm lockfiles are checked against the reviewed manifest.
9. Add the full-stack quality gate to CI after project-specific paths and policies are reviewed.

## Package Name and Version

- v2 package: `frontend-vision-loop-pro` `2.0.0`
- v3 package: `fullstack-vision-engineering-pro` `3.0.0`
