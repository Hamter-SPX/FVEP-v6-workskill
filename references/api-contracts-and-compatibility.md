# API Contracts and Compatibility

## Contract Requirements

Each operation should declare:

- Stable operation ID
- Authentication and authorization expectation
- Request parameters and body constraints
- Success responses
- Structured 4xx and relevant 5xx responses
- Stable machine error code and correlation identifier
- Idempotency semantics for mutations
- Concurrency token where lost updates are possible
- Pagination, filtering, sorting, and maximum limits for collections
- Rate-limit behavior and retry timing
- Deprecation and versioning metadata when applicable

## Compatibility Rules

Treat these as breaking unless a versioned migration proves otherwise:

- Removing a path or method
- Removing a previously documented response used by consumers
- Adding a required request field or header
- Narrowing accepted enum values or formats
- Changing a field type, unit, meaning, or nullability
- Renaming fields without dual-read/dual-write compatibility
- Changing authorization in a way that invalidates existing valid clients without migration
- Changing ordering, pagination cursor, idempotency, or retry semantics
- Reusing an error code for a different condition

Usually additive:

- New optional request field
- New response field when consumers tolerate unknown fields
- New endpoint
- New non-breaking error detail under a stable code

Compatibility is consumer behavior, not schema appearance. Consumer-driven contract tests are stronger than producer-only confidence.

## Error Model

Use a consistent problem shape containing at least:

- Human-safe title
- HTTP status
- Stable machine code
- Correlation identifier
- Optional field errors
- Optional retryability or retry timing

Do not expose stack traces, SQL, secrets, internal hostnames, or policy-sensitive resource existence.

## Idempotency

For create/command operations that can be retried:

- Accept an idempotency key scoped to actor and operation.
- Persist outcome or in-progress state for an appropriate window.
- Return the same semantic result for duplicate delivery.
- Define behavior when payload differs for the same key.
- Prevent a gateway and client from independently multiplying attempts.

## Deployment Sequence

For a breaking conceptual change use:

1. Add backward-compatible producer behavior.
2. Deploy consumers able to read old and new.
3. Observe adoption and error telemetry.
4. Move production writes/reads.
5. Verify no legacy consumers remain.
6. Remove old behavior in a separately reviewed release.

## Review Evidence

- Baseline and current contract hashes
- Breaking-change report
- Consumer inventory and owners
- Contract-test results
- Canary/compatibility telemetry
- Deprecation schedule
- Rollback behavior
