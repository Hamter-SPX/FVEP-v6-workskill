# Data Privacy and Classification

## Classification

Classify data at collection and at every boundary:

- Public
- Internal
- Confidential
- Restricted or regulated

Record purpose, owner, subjects, retention, allowed processors, regions, encryption, access policy, logging policy, and deletion behavior.

## Minimization

- Collect only fields necessary for an explicit purpose.
- Avoid copying sensitive data into analytics, logs, caches, search indexes, events, and test fixtures.
- Prefer identifiers or derived signals over raw sensitive values.
- Do not retain payloads merely because storage is available.

## Access and Tenant Isolation

- Enforce tenant/resource scope server-side.
- Include denied-case tests for direct object references, enumeration, bulk operations, exports, and administrative paths.
- Separate support access from normal user access and audit elevation.
- Do not reveal whether an unauthorized resource exists.

## Retention and Deletion

Define:

- Retention duration and legal/business basis
- Deletion trigger
- Soft-delete and hard-delete semantics
- Backup expiry and restore implications
- Derived copies and downstream processor deletion
- Audit evidence that does not reintroduce deleted sensitive content

## Telemetry and Debugging

Telemetry should retain correlation and diagnosis value without sensitive payloads. Use allow-listed fields, structured redaction, access controls, and sampling. Incident evidence must not become an uncontrolled data export.

## Review Gate

A data flow is incomplete when classification, purpose, owner, retention, access, encryption, and deletion are unknown. Missing privacy evidence lowers release confidence and may be a hard blocker for restricted data.
