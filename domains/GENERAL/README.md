# GENERAL

Cross-cutting work that is not owned by a single product shape.

## Packs

| Topic | Start here |
|---|---|
| Process / routing | `../../references/process-kernel-overview.md` |
| Design before code | `../../references/design-before-implementation.md` |
| Plans / TDD / debug | `../../references/executable-planning.md`, `tdd-evidence-protocol.md`, `scientific-debugging-protocol.md` |
| Review / claims | `../../references/review-and-feedback-governance.md`, `verification-and-claim-governance.md` |
| Security / data / resilience | `../../references/application-security-and-threat-modeling.md` and sibling fullstack refs |
| Release / integration | `../../references/fullstack-release-and-rollback.md`, `integration-and-cleanup.md` |
| Skill authoring | `../../references/skill-authoring-conformance.md` |

## Use GENERAL when

- The task is process, verification, infra, or docs without a single UI surface
- Multiple domains share the same gate (e.g. release evidence)
- You are extending this skill itself

Domain folders (`GAME`, `APPLICATION`, `DESIGN`) still defer to GENERAL for hard process laws.
