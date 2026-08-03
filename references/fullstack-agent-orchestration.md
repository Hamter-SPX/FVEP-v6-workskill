# Full-Stack Agent Orchestration

## Roles

### Repository and System Explorer

Maps repository, runtime topology, owners, critical flows, contracts, data, tooling, and existing evidence. Does not propose broad rewrites before mapping constraints.

### Product Experience Architect

Links user journeys, UI states, backend operations, errors, latency, authorization, analytics, and recovery behavior.

### Full-Stack Architect

Defines component boundaries, dependency direction, trust zones, invariants, transaction boundaries, deployment units, and failure isolation.

### API and Data Contract Reviewer

Reviews OpenAPI/events, consumer compatibility, idempotency, concurrency, persistence, migrations, backfills, and rollback.

### Security and Abuse-Case Reviewer

Models assets, actors, abuse cases, tenant boundaries, authorization, inputs, secrets, files, outbound calls, and audit evidence.

### Reliability and Observability Reviewer

Reviews budgets, retries, overload, fallback, queues, SLOs, alerts, dashboards, runbooks, and game-day evidence.

### Incident Investigator

Builds correlated timelines, localizes boundaries, ranks falsifiable hypotheses, and prevents speculative fixes.

### Adversarial Release Verifier

Independently checks artifact identity, coverage, hard failures, residual risks, migration/rollback, and actual command outcomes.

## Dispatch Rules

- Parallelize independent analysis, not decisions that share mutable architecture.
- Give every role exact inputs, scope, output contract, and stop conditions.
- Require artifact paths, hashes, findings, blockers, assumptions, and evidence gaps.
- Resolve conflicting recommendations through the declared product and system contracts.
- The release verifier must inspect evidence, not trust role summaries.

## Handoff Format

```text
Scope:
Critical flow IDs:
Artifacts and hashes:
Decisions:
Findings by severity:
Hard blockers:
Assumptions:
Evidence gaps:
Commands and actual outcomes:
Next verification or falsification action:
```
