# Full-Stack Vision Engineering Pro v3 Design

## Objective

Extend Frontend Vision Loop Pro v2 into a production full-stack engineering skill suite without weakening its visual evidence system. The suite must connect product design, frontend states, API contracts, backend services, data changes, security controls, resilience, observability, incident diagnosis, and release approval through explicit contracts and current evidence.

## Scope

The package retains every v2 frontend capability and adds nine independently testable domains:

1. Experience contracts connecting user journeys and UI states to backend operations and failures.
2. API contract quality and backward-compatibility analysis.
3. Architecture boundary, ownership, trust-boundary, and dependency-risk analysis.
4. Database migration and transaction-safety review.
5. Application security control and source-risk review.
6. Resilience policy review for timeouts, retries, idempotency, circuit breaking, and degradation.
7. Observability coverage for logs, metrics, traces, SLOs, alerts, and correlation.
8. Evidence-led incident triage and root-cause hypothesis ranking.
9. Adversarial full-stack release gates separating measured quality from evidence confidence.

## Architecture

The existing frontend vision system remains a bounded subsystem. New pure analysis engines accept JSON contracts or evidence and return deterministic findings. CLI adapters load configuration and artifacts, invoke engines, and emit JSON/Markdown reports. A full-stack gate engine combines domain gates through the existing weighted quality model while preserving hard failures and missing-evidence penalties.

The design deliberately avoids pretending to perform live security scanning, database execution, or distributed tracing when those systems are not connected. Offline engines validate declared contracts and local source evidence; live integrations are represented as explicit evidence inputs. Missing live evidence lowers confidence rather than becoming an inferred pass.

## Core Contracts

### Experience contract

Each critical user flow declares frontend route, user goal, API operations, UI states, backend errors, error-to-UI mappings, latency budget, authentication and authorization expectations, mutation semantics, analytics, and degraded behavior.

### API contract

OpenAPI-compatible JSON is audited for operation identity, security declaration, success and error schemas, idempotency, pagination, correlation, rate-limit semantics, and compatibility against an approved baseline.

### Architecture contract

Components declare type, owner, criticality, data classification, trust zone, SLO, dependencies, interfaces, and fallbacks. Edges declare protocol, authentication, authorization, encryption, timeout, and data movement.

### Migration contract

Each database change declares operation type, expand-contract phase, lock expectations, backfill bounds, compatibility window, rollback, verification, backup, and ownership.

### Security contract

Controls and findings cover authentication, object-level and function-level authorization, input handling, output encoding, CSRF, SSRF, secrets, file upload, rate limiting, audit logging, encryption, and dependency governance.

### Observability contract

Critical flows declare required logs, metrics, traces, correlation, SLOs, burn-rate alerts, dashboards, runbooks, and ownership.

### Incident evidence

Evidence items record timestamp, source, component, boundary, observation, confidence, correlation identifiers, and links. Hypotheses must list supporting and contradicting evidence, falsification tests, and current status.

## Quality Model

Each domain returns status, score, evidence count, evidence confidence, hard failures, warnings, and findings. Release approval requires:

- No unresolved hard failure.
- No blocker-risk finding.
- Minimum weighted quality score.
- Minimum weighted evidence confidence.
- Required critical-flow coverage.
- Current configuration and artifact provenance.
- Frontend visual approval when a rendered surface is in scope.

## Security and Safety Boundaries

Static source-risk scanning is heuristic and never described as proof of absence. No secret values are emitted in reports. Potential credentials are redacted. Destructive migration execution, penetration testing, production traffic manipulation, and live chaos testing are outside automatic execution unless the user explicitly connects safe tooling and scope.

## Error Handling

Invalid contracts fail closed with precise path-level errors. Unsupported evidence is marked unsupported, not zero. Duplicate identifiers, dangling dependencies, stale baselines, partial flow coverage, and ambiguous ownership are reported explicitly.

## Testing Strategy

- Unit tests for every normalization, scoring, graph, compatibility, and triage rule.
- Regression tests for hard-failure preservation and missing-evidence confidence.
- CLI smoke tests for every executable.
- Static package validation for frontmatter, references, JSON, syntax, checksums, manifest, and archive integrity.
- Pressure scenarios testing time pressure, authority pressure, sunk cost, partial evidence, and unsafe release demands.

## Deliverables

- Updated `SKILL.md`, README files, architecture and security documents.
- New full-stack engines, CLI scripts, configuration, schemas, examples, prompts, agents, references, and templates.
- Updated validation, manifest, checksums, all-in-one documentation, migration guide, and release ZIP.
