# Parallel Task Isolation

Parallelism is safe only when tasks are independent in both dependency and execution state. The task graph considers declared dependencies, files created/modified/tested, exclusive resources, and shared mutable state.

Ready tasks with no conflicts may share a wave. Conflicting tasks are separated even when their dependency edges would otherwise allow concurrency. Investigation can often run in parallel while implementation remains sequential.

Every parallel worker receives a focused brief and writes a bounded report. Workers do not inherit the entire controller history. Integration occurs only after conflict review and a full regression run. Speed never justifies concurrent edits to the same files, database fixture, browser port, generated artifact, or mutable environment.
