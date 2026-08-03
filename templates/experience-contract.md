# Experience Contract

## Flow Identity

- ID:
- Owner:
- Criticality:
- User goal:
- Entry route/surface:
- Actor, role, tenant, and permissions:

## Frontend State Machine

| State | Trigger | Visible behavior | Accessible behavior | Exit/recovery |
|---|---|---|---|---|
| Default | | | | |
| Loading/pending | | | | |
| Empty | | | | |
| Validation error | | | | |
| Authorization denial | | | | |
| Conflict | | | | |
| Dependency/timeout | | | | |
| Success | | | | |
| Disabled/degraded | | | | |

## System Operations

| Operation ID | Boundary | Success | Errors | Retryable | Idempotency | Timeout |
|---|---|---|---|---|---|---|

## Error Mapping

| Machine code | UI state/message | User action | Telemetry | Support correlation |
|---|---|---|---|---|

## Mutation and Data

- Invariants:
- Transaction boundary:
- Concurrency/conflict strategy:
- Duplicate-delivery behavior:
- Cancellation behavior:
- Durable completion point:

## Budgets and Degradation

- Target latency:
- Maximum wait:
- Availability objective:
- Degraded behavior:
- Offline/reconnect behavior:

## Acceptance Evidence

List exact route × viewport × state, API/error, authorization-denial, data/concurrency, telemetry, and rollback cases required.
