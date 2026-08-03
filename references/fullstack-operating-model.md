# Full-Stack Operating Model

## Purpose

A full-stack feature is one user outcome implemented across multiple technical boundaries. Treating frontend, API, service, database, and operations as separate tickets creates gaps precisely where failures occur. This operating model keeps one critical flow, one evidence chain, and one release decision.

## Critical-Flow Unit of Work

Define work around a user or operator goal, not a technical layer. A critical flow should identify:

- Triggering actor and identity context
- User-visible route or entry point
- Ordered backend operations
- Resources and data classifications touched
- Authorization decisions
- Transaction and consistency boundaries
- Third-party and infrastructure dependencies
- Expected latency and availability
- UI states and recovery behavior
- Logs, metrics, traces, analytics, SLO, alerts, dashboard, and runbook
- Rollout and rollback constraints

A layer can be locally correct while the flow is globally broken. Acceptance therefore follows the entire path.

## Evidence Layers

| Layer | Evidence examples | What it does not prove |
|---|---|---|
| Static | Types, lint, schema, source-risk rules | Runtime behavior or security absence |
| Unit | Domain invariant and pure behavior tests | Boundary wiring or deployment configuration |
| Contract | API/schema compatibility and consumer tests | Production dependency behavior |
| Integration | Service, database, queue, and authorization wiring | Browser experience or production scale |
| End-to-end | Critical user journey | Every failure mode or concurrency edge |
| Visual | Screenshot, DOM, interaction, responsive evidence | Backend correctness or authorization |
| Operational | Logs, metrics, traces, SLOs, alerts, game days | Product usability or contract compatibility |
| Release | Build identity, config hash, migrations, rollback proof | Future behavior after unreviewed change |

Quality is the result observed in available evidence. Confidence is how complete, current, representative, and attributable that evidence is.

## Change Classification

### Local

One bounded component, no public contract, no persistent data change, no trust-boundary change. Still requires tests and final verification.

### Boundary

Changes request/response shape, event, job payload, authorization, cache key, query, or dependency behavior. Requires baseline/current comparison and consumer evidence.

### Stateful

Changes schema, invariant, transaction, ordering, migration, retention, or backfill. Requires compatibility, rollout ordering, verification, and rollback.

### Systemic

Changes identity, trust zones, critical dependency, deployment topology, SLO, queue semantics, or multiple services. Requires architecture review, threat/failure model, and adversarial release verification.

## Handoff Contract

Every handoff between agents or teams contains:

- Scope and critical flow IDs
- Input artifact paths and hashes
- Assumptions and unsupported evidence
- Decisions already approved
- Findings by severity
- Hard blockers
- Exact commands and outcomes
- Residual risk owner and review date
- Next falsification or verification action

Narrative confidence is not a handoff artifact.

## Completion Test

Ask one question: **Can a reviewer trace the final build from user action through authorization, data mutation, dependency behavior, UI response, telemetry, and rollback using current evidence?**

If any segment is inferred, the release confidence remains incomplete.
