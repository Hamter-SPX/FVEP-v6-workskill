# Application Security and Threat Modeling

## Threat Model Inputs

Capture:

- Assets and security objectives
- Human, service, administrative, and adversarial actors
- Entry points and exposed protocols
- Trust boundaries and privilege transitions
- Authentication and authorization decisions
- Data classifications and secret locations
- Third parties and supply-chain execution
- Abuse cases and business-logic fraud
- Detection and response expectations

## Authorization Matrix

For every sensitive action record:

| Subject | Action | Resource | Context | Decision | Enforcement point | Negative test |
|---|---|---|---|---|---|---|

Test cross-tenant, cross-user, stale-role, guessed-ID, bulk, nested-resource, export, and administrative variants. Middleware presence is not proof that every resource query is scoped correctly.

## Input and Output Boundaries

- Parse into typed structures with length, range, enum, and format limits.
- Reject unknown or ambiguous fields when appropriate.
- Use parameterized database access.
- Use argument-vector process execution instead of shell interpolation.
- Canonicalize and constrain file paths.
- Constrain outbound URL schemes, hosts, addresses, redirects, ports, and response size.
- Encode output for its rendering context.
- Sanitize only when rich content is an intentional product requirement.

## Session and Browser Controls

Review cookie scope, SameSite, Secure, HttpOnly, CSRF defense, origin checking, token storage, refresh rotation, logout invalidation, clickjacking defense, content security policy, CORS, and cacheability of sensitive responses.

## File Uploads

Define file type verification by content, size limits, decompression limits, filename handling, storage isolation, malware policy, image/document re-encoding, serving headers, access control, retention, and deletion. Never execute or serve user content from an application origin without deliberate isolation.

## Secrets

- Store in approved secret management.
- Use short-lived workload identity where possible.
- Restrict access and audit retrieval.
- Rotate after suspected exposure.
- Redact logs, errors, screenshots, build output, and reports.
- Treat a committed secret as exposed even after deletion from the latest revision.

## Threat-Model Exit Criteria

- Material abuse cases have preventive and detective controls.
- Authorization negative tests exist.
- High-risk entry points have bounded input and resource use.
- Secrets and restricted data cannot enter normal telemetry.
- Residual risks have owners, evidence, expiry, and review triggers.

Static source rules are triage aids, not certification.
