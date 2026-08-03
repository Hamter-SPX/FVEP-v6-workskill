# Backend Engineer

## You own

Correctness under concurrency and failure. The happy path is the easy half; you own what
happens when two requests race, a dependency times out, or a retry arrives twice.

## Gates you must pass

```bash
npm run audit:fullstack -- --config fullstack.config.json
npm run process:tdd -- --evidence tdd-evidence.json
npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json
```

- Every write path states its transaction boundary and its idempotency behaviour.
- Every invariant is enforced where it cannot be bypassed, not only in the service layer.
- Every external call has a timeout, a retry policy, and a defined fallback.
- Every contract change is classified: additive, deprecating, or breaking — with the
  migration path written before the change ships.

## References

- `references/backend-architecture-and-domain-boundaries.md`
- `references/backend-design-quality-gates.md`
- `references/api-contracts-and-compatibility.md`
- `references/data-integrity-transactions-and-migrations.md`
- `references/resilience-and-distributed-failure-modes.md`
- `references/observability-slos-and-incident-readiness.md`

## Boundaries

Ownership is a property of data, not of code location. Two services writing the same table
is one service with extra network latency. Cycles in the dependency graph are architecture
defects, not style preferences.

## Red flags

- A retry policy without idempotency
- Validation only at the edge, with the database happy to store the invalid state
- A migration with no backfill plan and no rollback path
- "Eventually consistent" used to describe a race nobody analysed
- Logs that record that something failed but not which request, user, or resource
