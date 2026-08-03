# CI and Release Policy

## Branch Evidence

Intermediate branches may run the automated-only gate:

```bash
npm run vision-loop -- --config vision-loop.config.json
npm run quality-gate -- --config vision-loop.config.json --automated-only
```

This proves automated evidence policy only. It is not final semantic approval.

## Release Evidence

A release pipeline should require:

1. Deterministic target application is running.
2. Baseline verification passes when enabled.
3. Complete vision loop passes.
4. Semantic review file validates against the current config hash and full case matrix.
5. Final quality gate passes without `--automated-only`.
6. Evidence artifacts are retained.

## Artifact Retention

Retain at minimum:

- Current/reference/diff images
- Capture metadata
- Comparison JSON and HTML
- Accessibility, interaction, state, performance, inspection, and token reports
- Baseline manifest
- Semantic review
- Run summary, remediation, provenance, and history

## Failure Policy

Do not auto-update the baseline on CI failure. Upload the evidence and require review. A changed baseline is a product acceptance decision, not a test-repair operation.

## Secrets and Data

Use deterministic non-sensitive fixtures. Screenshots, DOM text, network URLs, console messages, and storage state may contain sensitive information. Configure safe accounts and scrub evidence before external sharing.
