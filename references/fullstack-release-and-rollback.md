# Full-Stack Release and Rollback

## Release Unit

A release decision applies to an exact build, configuration, contract set, migration set, feature-control state, and evidence bundle. A test result from another revision is not current evidence.

## Pre-Release Sequence

1. Freeze the reviewed contract and configuration identities.
2. Verify unit, contract, integration, end-to-end, visual, security, migration, and engineering checks as applicable.
3. Verify API and event compatibility.
4. Verify migration order, lock/load budget, backfill controls, and rollback window.
5. Verify dashboards, alerts, runbooks, owners, and correlation.
6. Review hard failures and accepted risks.
7. Rehearse or reason explicitly through interruption after each deployment step.
8. Record final commands and outcomes.

## Progressive Delivery

Use canary, staged rollout, feature flags, or traffic shaping when risk warrants. Define:

- Entry criteria
- Cohort or traffic percentage
- Observation duration
- Success and abort metrics
- Automatic and manual stop conditions
- Data compatibility throughout rollout
- Flag owner and removal date

## Rollback Contract

Rollback must cover:

- Application binaries
- Frontend assets and cached clients
- API/event contract compatibility
- Database schema and data written by the new version
- Queued work and scheduled jobs
- Cache keys and serialized values
- Feature flags and configuration
- Third-party state changes

For irreversible operations, define forward recovery and require explicit approval before release.

## Post-Release Verification

Verify real critical-flow telemetry, error codes, latency, saturation, authorization denials, data invariants, queue lag, migration progress, and user-visible behavior. Absence of alerts is not sufficient if alert coverage is unverified.

## Decision States

- **Approved:** required gates pass, confidence meets policy, no hard failures.
- **Conditionally approved:** only when policy explicitly permits bounded residual risk with owner, expiry, and rollback readiness.
- **Blocked:** any hard failure, blocker risk, insufficient confidence, incompatible contract, unsafe migration, or missing rollback evidence.
