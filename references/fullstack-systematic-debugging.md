# Full-Stack Systematic Debugging

## Core Rule

Do not patch the most visible symptom. Locate the first failing boundary, state one falsifiable hypothesis, and collect evidence that can distinguish it from alternatives.

## Phase 1 — Reproduce and Stabilize

Record:

- Exact actor, tenant, permissions, inputs, route, device, and state
- Environment, build, configuration, feature flags, schema/migration version, and dependency versions
- Timestamp and correlation identifier
- Expected and observed behavior
- Reproduction frequency and scope

Stabilize randomness, time, data, cache, and asynchronous work where possible. If the issue is intermittent, increase evidence before changing code.

## Phase 2 — Build the Boundary Timeline

Collect evidence from each relevant layer:

```text
browser/client
→ CDN/load balancer
→ gateway/auth policy
→ application service
→ cache/queue/worker
→ database
→ third party
→ response and rendered state
```

For each boundary mark `pass`, `fail`, or `unknown`. The last confirmed pass and first confirmed fail define the highest-value investigation area.

## Phase 3 — Hypotheses

Each hypothesis contains:

- Precise statement
- Component or boundary
- Supporting evidence IDs
- Contradicting evidence IDs
- Predicted observation if true
- Falsification test
- Risk and cost of the test
- Status: open, rejected, or confirmed

A green health endpoint is weak contradictory evidence for a business-path timeout. Weight evidence by relevance, correlation, freshness, and confidence.

## Phase 4 — Minimal Test

Create the smallest test or probe that separates the leading hypothesis from the next alternative. Change one variable. Avoid bundles of speculative logging, configuration, and code changes that make the result uninterpretable.

## Phase 5 — Root-Cause Fix

Before code:

1. Write a failing regression test or reproducible probe.
2. Verify it fails for the expected reason.
3. Implement one fix at the originating cause.
4. Re-run the targeted test.
5. Re-run the original reproduction.
6. Re-run affected boundary, security, migration, and user-state regression cases.
7. Verify telemetry now distinguishes recurrence.

## Common Cross-Layer Traps

- Frontend retries hide a backend timeout and duplicate mutations.
- Gateway maps authorization failure to generic 500.
- ORM transaction retries replay external side effects.
- Cache returns stale policy or tenant state.
- Deployment mixes incompatible event or database versions.
- Health check bypasses the saturated pool used by real traffic.
- Logging changes timing and appears to “fix” a race.
- A broad exception handler converts failure to empty success.
- Old worker processes consume new payloads after API deployment.

## Stop Conditions

Stop speculative fixes when three attempts fail or each fix reveals a different coupled symptom. Revisit architecture, state ownership, and boundary contracts before a fourth attempt.
