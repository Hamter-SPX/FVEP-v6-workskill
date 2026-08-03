# Full-Stack Vision Engineering Pro v4 Design

## Objective

Upgrade v3 from a collection of evidence-driven domain audits into a complete engineering operating system that governs how an agent discovers work, designs it, plans it, isolates it, implements it with test-first evidence, reviews it independently, debugs failures scientifically, recovers after context loss, and prepares a safe integration decision.

The package must retain every v3 frontend, backend, security, reliability, observability, risk, and release capability. Version 4 adds a deterministic process kernel inspired by the strongest reusable ideas across the installed Superpowers skills, but adapts them to this suite's artifact, risk, and provenance model rather than copying prose or depending on a specific agent host.

## Approaches Considered

### A. Documentation-only adaptation

Add more Markdown instructions and role prompts. This is low risk and portable, but agents can still skip stages, forge completion language, lose state after context compaction, or approve their own changes. It does not meet the user's request for a materially more advanced package.

### B. Thin orchestration scripts

Add task and review commands around existing audits. This improves repeatability but leaves design, TDD, debugging, review independence, and integration state as loosely coupled conventions.

### C. Integrated process kernel — selected

Add deterministic contracts, state machines, validators, ledgers, review governance, evidence chaining, and CLIs that connect the entire development lifecycle to the existing full-stack quality gates. Documentation explains judgment; code enforces mechanical constraints; evidence records prove what happened.

## Core Principles

1. **Skills are routed before action.** A task is classified by observable triggers, and required process capabilities are selected before implementation.
2. **Design precedes implementation.** New behavior requires a reviewed design contract or a documented emergency exception with bounded scope and follow-up evidence.
3. **Plans are executable contracts.** Tasks declare files, interfaces, dependencies, tests, commands, outputs, and stop conditions. Placeholders and contradictory interfaces fail validation.
4. **Isolation is explicit.** Work records whether it is in a linked worktree, normal repository, detached environment, or non-git isolated copy. Main-branch implementation is blocked unless explicitly authorized.
5. **Progress survives context loss.** An append-only ledger is the source of truth for task state, evidence, fix rounds, decisions, and recovery.
6. **Production behavior requires RED evidence.** A TDD cycle is not accepted unless the expected failing observation predates the passing observation and both bind to the behavior, command, code identity, and artifact hashes.
7. **Debugging follows evidence boundaries.** A fix cannot enter implementation until reproduction, boundary localization, one falsifiable hypothesis, and a minimal experiment exist.
8. **Review is independent and scoped.** The implementer cannot approve the same change. Review requires both specification compliance and code-quality verdicts against a bounded change package.
9. **Feedback is evaluated, not obeyed blindly.** Findings move through verified, accepted, rejected, deferred, fixed, and re-reviewed states with technical evidence and rulings.
10. **Fix loops have circuit breakers.** Task review remediation is capped. Persisting load-bearing findings block downstream work rather than creating infinite churn.
11. **Completion claims map to fresh evidence.** “Tests pass,” “secure,” “matched,” and “production-ready” each have explicit proof requirements and freshness policies.
12. **Integration remains a human-owned decision.** The system prepares safe options and evidence; it never silently merges, pushes, deletes, or discards work.

## Architecture

### Process contracts

JSON contracts describe:

- Work request and skill-routing context
- Design/spec approval
- Implementation plan and task graph
- Workspace identity and ownership
- Progress ledger events
- TDD cycles
- Debugging sessions
- Review packages and review records
- Findings and adjudication
- Verification claims
- Integration decisions

Every contract includes a schema version, stable identifiers, timestamps, actor identity, source artifact references, and cryptographic hashes where the referenced artifact is available.

### Deterministic engines

The new engines are pure where practical:

- `skill-router-engine.mjs` selects mandatory and optional process capabilities from task signals.
- `design-governance-engine.mjs` validates discovery, alternatives, design contracts, approvals, and self-review.
- `plan-quality-engine.mjs` validates task completeness, dependency graphs, interface consistency, and step quality.
- `task-graph-engine.mjs` identifies sequential and parallel-safe lanes by dependencies, files, resources, and shared state.
- `workspace-safety-engine.mjs` classifies repository/worktree state and computes safe actions without mutating by default.
- `process-ledger-engine.mjs` validates append-only lifecycle transitions and reconstructs resumable state.
- `tdd-evidence-engine.mjs` validates RED–GREEN–REFACTOR evidence and negative controls.
- `debug-session-engine.mjs` enforces reproduction, boundaries, hypotheses, experiments, attempt caps, and regression evidence.
- `review-governance-engine.mjs` enforces reviewer independence, dual verdicts, scoped diffs, fix rounds, and final review.
- `feedback-adjudication-engine.mjs` records technical verification and finding dispositions.
- `claim-verification-engine.mjs` maps completion claims to fresh evidence.
- `integration-decision-engine.mjs` prepares safe merge/PR/keep/discard decisions and cleanup ownership.
- `process-gate-engine.mjs` combines all process gates while preserving hard failures and confidence gaps.

### Orchestration

`process-orchestrator.mjs` loads process contracts and ledger events, evaluates the current stage, emits permitted next actions, and writes JSON/Markdown reports. It does not create autonomous subagents itself; instead it produces focused role briefs and review packages usable by any host that supports agents. This keeps the suite portable while preserving strict handoff contracts.

### Connection to v3

The existing full-stack audit remains the technical product gate. The v4 process report becomes an optional or required input to the full-stack release gate. A release can have excellent measured product quality but still fail when the work lacks current TDD, review, debugging, or integration evidence.

## Lifecycle State Model

```text
requested
→ routed
→ discovered
→ designed
→ approved
→ planned
→ workspace-ready
→ task-in-progress
→ task-red-verified
→ task-green-verified
→ task-reviewed
→ task-complete
→ final-reviewed
→ release-verified
→ integration-ready
```

Alternate states include `blocked`, `needs-context`, `fix-loop`, `architecture-escalation`, `deferred-with-ruling`, and `kept-as-is`. State transitions are append-only. Events cannot rewrite history or move backward without an explicit supersession event.

## Review Model

Each task review requires:

- Task brief hash
- Base/head identity or equivalent bounded artifact set
- Implementer report
- Test evidence
- Reviewer identity distinct from implementer identity
- Specification verdict
- Quality verdict
- Findings with severity and load-bearing classification

Critical and important findings enter a maximum five-round fix loop. Rounds one through three may resume the original implementer; rounds four and five require fresh ownership or capability escalation. At the cap, every residual finding receives a recorded ruling. A real load-bearing finding blocks dependent tasks and final integration.

A final whole-change review is separate from task reviews and evaluates interactions, deferred findings, architecture, security, operational risk, and requirements coverage.

## TDD Evidence Model

A behavior cycle records:

- Behavior identifier and requirement reference
- Test file and test name
- RED command, exit status, expected failure signature, output hash, source hash, timestamp
- GREEN command, exit status, pass signature, output hash, source hash, timestamp
- Production change identity
- Refactor verification command and result when applicable
- Negative control or mutation evidence for high-risk behavior

A passing test without prior expected RED evidence is classified as test-after, not TDD. A failing command caused by syntax, missing dependencies, or an unrelated test does not satisfy RED.

## Debugging Model

A debugging session must record:

1. Stable reproduction or an explicit intermittent-evidence strategy
2. Environment and change identity
3. Boundary timeline with pass/fail/unknown states
4. Last confirmed-good and first confirmed-bad boundaries
5. One active falsifiable hypothesis
6. A minimal experiment changing one variable
7. Experiment outcome and updated hypothesis status
8. Failing regression test or probe before the fix
9. Root-cause fix and targeted verification
10. Original reproduction and affected-regression verification

Three failed fix attempts trigger architecture escalation. The engine prevents a fourth speculative patch until the session records a revised architecture or state-ownership decision.

## Workspace Safety

The suite detects:

- Non-git directory
- Normal repository checkout
- Linked worktree
- Submodule
- Detached HEAD
- Main/master or protected branch
- Project-local worktree ownership
- Whether the worktree container is ignored

Mutation commands are dry-run by default. Creation, merge, push, deletion, and discard require explicit action flags. Discard additionally requires an exact confirmation token and a recorded commit/workspace inventory.

## Error Handling

- Invalid lifecycle transitions fail closed and report allowed transitions.
- Missing evidence remains missing; it never becomes a zero-valued pass.
- Unknown process schema versions are rejected.
- Conflicting plan interfaces and dependency cycles block execution.
- Unsupported git environments produce a safe non-mutating plan.
- Stale evidence reduces confidence or fails hard claims according to policy.
- Reviewer/implementer identity collision blocks independent review.

## Testing Strategy

- Write new unit tests before every v4 engine.
- Capture RED evidence showing missing modules or missing behavior.
- Add regression tests for lifecycle bypass, forged TDD, self-review, stale evidence, parallel file conflicts, fix-loop overflow, speculative debugging, unsafe cleanup, and integration without fresh verification.
- Keep all 91 v3 tests green.
- Add CLI help smoke tests and package-validator coverage.
- Run a self-audit of this skill package with the new skill-conformance and process gates.
- Package, extract to a clean directory, and rerun unit, syntax, CLI, JSON, reference, checksum, and archive-integrity checks.

## Scope Boundaries

Version 4 does not claim to create host-native subagents, browser tools, git remotes, CI credentials, or production infrastructure when those capabilities are absent. It generates validated briefs, packages, state, and evidence contracts for available hosts. Live integration remains explicit and evidence-backed.

## Success Criteria

- Existing v3 tests remain green.
- New process-kernel tests pass with no skipped cases.
- Every installed Superpowers skill has a documented adaptation or an explicit reason it is host-specific.
- The release gate can fail a technically green project for missing process evidence without rewriting technical quality scores.
- A fresh process can resume from ledger state without conversation history.
- The final ZIP verifies from a clean extraction and includes English/Thai READMEs, migration guide, adaptation matrix, schemas, examples, CLIs, unit tests, pressure scenarios, checksums, manifest, and validation report.
