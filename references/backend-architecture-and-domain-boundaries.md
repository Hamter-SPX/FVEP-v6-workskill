# Backend Architecture and Domain Boundaries

## Boundary Quality

A strong boundary has a clear purpose, owner, vocabulary, input/output contract, invariant set, failure behavior, and operational responsibility. A weak boundary leaks storage models, shares mutable state, requires synchronized deployments, or leaves policy decisions ambiguous.

## Component Contract

For each component define:

- Stable identifier and type
- Business capability
- Owner and escalation
- Criticality and SLO
- Trust zone and data classification
- Public interfaces and consumers
- Persistence owned
- Dependencies and timeout budgets
- Scaling unit and concurrency model
- Failure isolation and fallback
- Deployment and rollback unit

## Dependency Direction

Prefer dependencies that follow business capability and ownership. Avoid cycles because they create:

- Coordinated releases
- Ambiguous ownership
- Cascading retries
- Transactional coupling
- Difficult incident localization
- Inability to degrade one capability independently

When a cycle is intentional, document why, define a stable protocol, and test independent failure of every edge.

## Domain and Persistence

- One service should own mutation rules for its authoritative data.
- Shared databases require explicit table ownership and migration coordination.
- Read models may be duplicated, but source-of-truth and staleness must be explicit.
- Cross-domain transaction assumptions require a protocol: saga, outbox, compensating action, or deliberate atomic boundary.
- Events describe completed facts; commands request actions. Do not use ambiguous payloads as both.

## Trust Boundaries

Every edge crossing a trust zone declares:

- Authentication mechanism and identity propagation
- Authorization decision point and policy semantics
- Encryption in transit
- Input validation and output constraints
- Timeout and request-size limits
- Rate and concurrency controls
- Data classification and minimization
- Audit requirements

Network location alone is not trust.

## Architecture Smells

- A central service owns unrelated domain rules
- Multiple components write the same authoritative records
- Public API shape mirrors database rows
- Critical synchronous call chains exceed the user latency budget
- Queue consumers are not idempotent
- Cache invalidation depends on unversioned keys
- Health checks do not exercise critical dependencies
- One component has many incoming critical dependencies, one replica, and no fallback
- Feature flags become permanent divergent architectures
- Error handling converts all failures into successful empty responses

## Decision Record

For material decisions record context, forces, alternatives, decision, consequences, validation evidence, and reversal trigger. A decision record is not a retrospective justification; it is a falsifiable engineering commitment.
