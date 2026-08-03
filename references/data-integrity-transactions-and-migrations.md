# Data Integrity, Transactions, and Migrations

## Invariant-First Design

Write invariants before choosing queries or ORM calls. Examples:

- An order total equals the sum of accepted line items under one pricing version.
- A reservation cannot reduce available inventory below zero.
- A user cannot access records outside authorized tenancy.
- A payment transition cannot move from terminal success back to pending.
- An event is published once logically even if transport delivery is duplicated.

Enforce invariants at the strongest practical layer: domain logic, transaction, unique/check/foreign-key constraint, and idempotency record. Tests alone do not enforce production concurrency.

## Transaction Review

For each mutation define:

- Read set and write set
- Isolation and locking assumptions
- Expected contention
- Uniqueness and ordering constraints
- Retry behavior for serialization/deadlock failures
- External side effects
- Partial-commit recovery
- Event publication strategy

Avoid holding database transactions open across remote calls. Use an outbox or compensating workflow when persistence and message publication must be coordinated.

## Concurrency Patterns

- **Optimistic concurrency:** version/ETag check, explicit conflict response, user or service reconciliation.
- **Pessimistic locking:** bounded lock scope, timeout, consistent lock ordering, contention telemetry.
- **Idempotency record:** key, actor scope, payload fingerprint, status, outcome, expiry.
- **Unique constraint:** preferred for race-safe uniqueness instead of pre-check alone.
- **Inbox/outbox:** deduplicate consumed messages and atomically record produced events with state.

## Migration Safety

### Expand

Add compatible schema or behavior. New columns should often begin nullable or with a safe server-side default. Add indexes using online/concurrent mechanisms where supported.

### Migrate

Deploy code that can read old and new representations. Backfill in bounded batches with checkpoints, rate limits, idempotency, progress telemetry, and stop conditions.

### Contract

Only remove old shape after consumer and data verification. Destructive cleanup is a separate release with an explicit compatibility window.

## Backfill Gate

A large backfill requires:

- Estimated rows and data volume
- Batch size and ordering key
- Checkpoint and resume behavior
- Idempotent update rule
- Load and lock budget
- Replica/CDC impact
- Progress, error, and lag metrics
- Verification query and sampled semantic checks
- Abort and rollback procedure

## Rollback Reality

Code rollback is not data rollback. Verify:

- Old code can read new schema and values.
- New writes do not create states old code rejects.
- Removed columns/tables can be restored or remain untouched through the rollback window.
- Queued messages and events remain compatible.
- Backfill can stop and resume without duplication.

## Migration Evidence

- Query plan and lock behavior on representative data
- Staging or shadow execution results
- Batch duration and load profile
- Constraint validation results
- Counts and semantic samples before/after
- Deployment-order rehearsal
- Rollback rehearsal or explicit irreversible-risk approval
