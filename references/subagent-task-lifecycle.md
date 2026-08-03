# Subagent Task Lifecycle

The host-neutral lifecycle is controller → implementer → independent task reviewer → bounded fix loop → final reviewer. The package supplies role contracts and artifacts but does not itself create subagents.

The controller extracts one task brief, records the base identity, and dispatches one implementer. The implementer records changes, tests, commits, and concerns. The reviewer receives the brief, implementer report, and bounded diff package—not the entire conversation—and returns both spec and quality verdicts.

Critical or important findings enter a maximum five-round loop. Rounds one through three preserve implementation context; later rounds require fresh ownership or capability escalation. Each fix has tests and a scoped re-review. At the breaker, load-bearing findings stop the plan. A final independent review covers the whole change.
