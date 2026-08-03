# Resilience and Distributed Failure Modes

## End-to-End Budget

Start with the user or job deadline. Allocate time across client, gateway, service, queue, database, and third party. A callee timeout longer than its caller budget is not protection.

For each remote operation define:

- Connection and operation timeout
- Cancellation propagation
- Maximum attempts
- Backoff and jitter
- Retryable error classes
- Idempotency
- Circuit-breaker thresholds and recovery
- Concurrency and queue limits
- Fallback or degraded behavior
- Telemetry and alerting

## Retry Amplification

Total attempts can multiply across layers. Three attempts in client, gateway, and service can produce 27 downstream attempts. Place retries in the layer with the best semantic context, disable redundant retries, and enforce one end-to-end attempt budget.

Never retry:

- Non-idempotent mutation without protection
- Authorization denial
- Deterministic validation failure
- Capacity overload without server guidance and backoff
- Request after caller cancellation

## Failure Isolation

- Bulkhead independent workloads and tenants.
- Bound queues and reject or shed load deliberately.
- Protect critical reads/writes from optional work.
- Use circuit breaking for sustained dependency failure.
- Keep health checks representative but inexpensive.
- Define cold-start, cache-miss, and failover behavior.

## Messaging

Review duplicate delivery, ordering, poison messages, dead-letter handling, replay, schema evolution, consumer lag, retention, deduplication, and side-effect idempotency. “Exactly once” usually depends on application semantics, not transport marketing.

## Cache Failure

Define stale tolerance, stampede protection, key versioning, invalidation, negative caching, tenant isolation, and behavior when cache is unavailable. A cache must not become the only copy of authoritative state.

## Game-Day Evidence

Exercise bounded scenarios in a safe environment:

- Dependency timeout
- Partial unavailability
- Queue backlog
- Database failover
- Cache loss
- Rate limiting
- Duplicate message
- Slow downstream response
- Deployment interruption

Record observed behavior, telemetry, alert delivery, operator action, user experience, recovery time, and follow-up risks.
