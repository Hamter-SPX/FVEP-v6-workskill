# Evidence Provenance

## Purpose

Evidence is trustworthy only when its origin is identifiable. Each run records configuration identity, Git state when available, and runtime environment.

## Recorded Fields

- Run ID and timestamp
- Canonical configuration hash
- Config path
- Git commit, branch, and dirty status when available
- Node version
- Operating system, architecture, release, CPU count, and memory

## Configuration Identity

The hash includes acceptance-relevant runtime, capture, diff, accessibility, inspection, interaction, state-crawler, performance, token, breakpoint, quality, baseline, manual-review, engineering-check, and route/state settings.

Changing an acceptance-relevant setting creates a different identity. This prevents a review or baseline generated under an easier policy from silently approving a stricter or different run.

## Reproducibility Limits

A matching configuration hash does not prove identical external data, browser binary, fonts, network responses, or operating-system rendering. Record deterministic data fixtures and dependency versions where exact reproducibility matters.

## Reporting

Always report:

- Exact command
- Configuration identity
- Target URL and selected filters
- Artifact paths
- Actual outcome
- Environment or tool limitations

Do not paraphrase an unexecuted command as a successful check.
