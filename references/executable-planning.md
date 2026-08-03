# Executable Planning

An executable plan is a dependency graph of independently reviewable tasks. Each task declares exact files, produced and consumed interfaces, prerequisites, and the test-first sequence: write a failing test, verify the expected failure, implement minimally, verify GREEN, and commit.

Plan validation rejects duplicate IDs, unknown dependencies, cycles, missing interfaces, placeholders, and commands with no expected result. Task-graph analysis then detects shared files, exclusive resources, and mutable state so dependency-ready tasks can be partitioned into safe waves.

A plan is not a narrative estimate. It is a portable contract that a fresh implementer can execute without the conversation history. Exact values live in the task brief; later tasks consume named interfaces rather than implied behavior.
