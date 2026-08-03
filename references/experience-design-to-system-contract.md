# Experience Design to System Contract

## Principle

Product design is not limited to the default screen. Every user-visible state is the projection of backend state, policy, latency, failure, and recovery semantics. The experience contract prevents attractive interfaces from concealing undefined system behavior.

## Flow Contract

For each important flow capture:

1. **User goal:** what outcome the user is trying to achieve.
2. **Entry and identity:** route, deep link, role, tenant, permissions, device, and connectivity context.
3. **Frontend state machine:** default, loading, empty, validation, authorization denial, conflict, dependency failure, timeout, success, disabled, retrying, and degraded states as applicable.
4. **Backend operations:** operation IDs, commands, queries, events, and jobs involved.
5. **Error vocabulary:** stable machine codes, user-safe messages, field associations, retryability, and support correlation.
6. **Mutation semantics:** optimistic or pessimistic, idempotency, cancellation, conflict detection, and recovery.
7. **Budgets:** response target, maximum wait, polling/retry cadence, and progressive feedback.
8. **Accessibility:** focus, announcement, keyboard, touch, reduced motion, and non-color status cues.
9. **Instrumentation:** success/failure analytics, logs, traces, and service metrics.
10. **Acceptance evidence:** route × viewport × state captures and backend/error-path tests.

## Error-to-UI Mapping

Never map every backend failure to a generic toast. Classify failures:

| Failure | UI responsibility | System responsibility |
|---|---|---|
| Validation | Associate field or explain request issue | Stable field/code contract |
| Authentication expired | Preserve work, reauthenticate safely | Session refresh and replay policy |
| Authorization denied | Explain unavailable action without data leakage | Resource/action policy and audit event |
| Version conflict | Show changed data and reconciliation path | Version token, conflict payload, no silent overwrite |
| Rate limited | Communicate retry timing | Retry-After and bounded client behavior |
| Timeout | Preserve state and offer safe retry | Correlation, idempotency, bounded operation |
| Dependency unavailable | Provide degraded path or status | Circuit breaker, fallback, alerting |
| Unknown internal failure | Provide correlation and recovery | Structured problem response and incident telemetry |

## Latency as Design Input

Latency budgets determine design:

- Under immediate-response threshold: direct feedback without artificial loading.
- Noticeable delay: stable loading state and disabled duplicate action.
- Long-running operation: progress, cancellation, background continuation, and return path.
- Unknown duration: do not show fabricated percentage progress.
- Retryable background work: display durable status from server state, not only client memory.

## Optimistic Interaction Gate

Optimistic behavior is allowed only when:

- Duplicate submission is safe or protected by idempotency.
- Server conflict is detectable.
- Reconciliation is defined.
- Failure can restore or clearly correct the UI.
- Authorization cannot change between optimistic display and commit without a safe denial path.

## Design Review Questions

- What does the user see if every dependency fails independently?
- Is the error actionable and safe?
- Can the user distinguish pending, complete, failed, and unknown?
- Does refresh or navigation lose critical progress?
- Are destructive actions reversible or explicitly confirmed?
- Does mobile preserve the same task priority under reduced space and unreliable connectivity?
- Can support correlate the user-visible failure to backend evidence?
