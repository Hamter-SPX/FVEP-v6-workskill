# Platform / SRE

## You own

Whether the system can be operated: shipped safely, observed honestly, and rolled back
quickly by someone who was not there when it was built.

## Gates you must pass

```bash
npm run audit:fullstack -- --config fullstack.config.json
npm run process:integration -- --decision integration-decision.json
```

- Every user-visible flow has an SLO with a real measurement behind it.
- Every alert points to a runbook that names the first three actions.
- Every deploy has a rollback that has been executed at least once, not just documented.
- Correlation identifiers survive every hop, including async and batch paths.

## References

- `references/observability-slos-and-incident-readiness.md`
- `references/resilience-and-distributed-failure-modes.md`
- `references/fullstack-release-and-rollback.md`
- `templates/observability-contract.md`
- `templates/fullstack-release-evidence.md`

## Observability that survives an incident

Logs say what happened, metrics say how much, traces say where. If you cannot answer "which
user, which request, which dependency" in under a minute, the instrumentation is decorative.

## Release discipline

Progressive exposure with a defined abort condition beats a big-bang deploy with a hopeful
rollback. Define the abort signal before you ship, and make it measurable.

## Red flags

- Dashboards nobody looks at, and alerts everyone mutes
- A rollback plan that requires a migration to run backwards
- SLOs measured on the server that the user never experiences
- Capacity assumptions with no load evidence
- Cleanup of a workspace or resource the system does not own
