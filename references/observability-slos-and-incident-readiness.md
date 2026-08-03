# Observability, SLOs, and Incident Readiness

## Flow-Oriented Telemetry

Instrument critical flows, not only components. A useful evidence chain answers:

- Which actor and flow was attempted?
- Which build and configuration handled it?
- Which policy decision occurred?
- Which boundary consumed most time?
- Which dependency or invariant failed?
- What user-visible result occurred?
- Can all signals be joined by correlation or trace identity?

## Structured Logs

Use stable event names and allow-listed fields. Include build, environment, component, operation, outcome, duration, error code, policy decision category, and correlation identifier as appropriate. Exclude credentials, raw tokens, payment data, secret material, and unrestricted request bodies.

## Metrics

Cover:

- Traffic and business throughput
- Error rate by stable code
- Latency distribution
- Saturation, concurrency, queue depth, pool wait, and resource pressure
- Retry, timeout, circuit-breaker, fallback, and rate-limit behavior
- Migration/backfill progress and failures
- Product outcome and abandonment where appropriate

## Traces

Propagate context across browser/server, gateway, service, queue, worker, cache, database, and third party when technically possible. Span names should describe operations, not dynamic identifiers. Record safe attributes that distinguish tenant class, result category, retry attempt, and dependency.

## SLOs and Alerts

A critical flow needs:

- Service-level indicator
- Objective and window
- Error-budget policy
- Fast and slow burn alerts
- Owner and escalation
- Dashboard and runbook

Alert on user impact and exhaustion risk, not every low-level anomaly. A dashboard without an action path is not incident readiness.

## Runbook Content

- Symptoms and impact
- First checks using correlation and build identity
- Dependency and boundary map
- Safe mitigations and their risks
- Rollback and feature-control instructions
- Data integrity checks
- Escalation and communication
- Recovery verification

## Evidence Confidence

Telemetry configuration is not proof that signals arrive. Verify with controlled requests, failure tests, alert delivery, dashboard queries, and incident/game-day records tied to the reviewed build.
