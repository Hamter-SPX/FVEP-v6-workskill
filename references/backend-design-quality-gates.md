# Backend Design Quality Gates

## Product Gate

- Operations map to explicit user or operator outcomes.
- Error semantics support designed recovery states.
- Long-running behavior, cancellation, and duplicate submissions are defined.
- Administrative behavior has audit and least-privilege rules.

## Domain Gate

- Invariants are named and tested.
- Commands, queries, events, and ownership are unambiguous.
- Concurrency and conflict behavior are explicit.
- Partial failure cannot silently violate business truth.

## API Gate

- Stable operation identities and structured errors exist.
- Authentication and authorization semantics are explicit.
- Pagination, filtering, ordering, versioning, idempotency, and rate limits are defined where applicable.
- Baseline/current compatibility is evaluated.

## Data Gate

- Transaction boundary and isolation assumptions are documented.
- Unique, foreign-key, and check constraints enforce suitable invariants.
- Migrations are compatible, bounded, observable, verifiable, and reversible at the declared risk level.
- Retention, deletion, backup, and restore responsibilities are defined.

## Security Gate

- Threat model covers entry points, actors, assets, trust boundaries, tenant boundaries, and abuse cases.
- Authorization is tested negatively.
- Inputs are constrained; outputs are safely encoded.
- Secrets and credentials are stored, rotated, and redacted correctly.
- Audit events are durable and access-controlled.

## Reliability Gate

- Every remote operation is bounded by timeout and cancellation.
- Retries are safe, limited, jittered, and fit the caller budget.
- Circuit breaking, bulkheading, overload, and fallback behavior are appropriate.
- Queues have deduplication, poison-message, backlog, and replay strategies.

## Observability Gate

- Critical flows have structured events, useful metrics, traces, correlation, SLOs, alerts, dashboards, runbooks, and owners.
- Telemetry distinguishes dependency, policy, validation, data, and internal failures.
- Sensitive data is excluded or minimized.

## Delivery Gate

- Deployment ordering and compatibility window are executable.
- Feature flags have ownership and removal criteria.
- Rollback includes data and contract compatibility, not only old binaries.
- Final commands and outcomes are current and attributable to the reviewed build.
