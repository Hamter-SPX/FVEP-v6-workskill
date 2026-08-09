# Superpowers Adaptation Matrix — v6

This document maps every installed Superpowers process skill to an **original adaptation** in Full-Stack Vision Engineering Pro v6. The package does not claim to supersede Superpowers for every kind of work. It is more specialized and more machine-verifiable for frontend, backend, risk, debugging, and release governance because each principle is represented by a deterministic engine and evidence contract.

v6 (One Framework) adds the conversation-level flow layer: each discipline also ships as a readable flow doc under `flow/` (state **shipped** in the table below), bound into the ten operating modes via `flow/flow-map.json` and surfaced by `npm run mode`. The full happy path across all gates is documented in `GOLDEN_PATH.md`.

| Superpowers skill | Principle retained | Original adaptation | Deterministic engine or artifact | v6 flow doc (state) | Added domain strength |
|---|---|---|---|---|---|
| `using-superpowers` | Route through applicable disciplines before acting | Task-context router with precedence, blockers, constraints, and ordered routes | `skill-router-engine.mjs`, request schema, `process:route` | `flow/using-one-framework.md` — shipped | Routes frontend/full-stack/security/incident work without relying on prompt memory |
| `brainstorming` | Explore context, compare approaches, obtain approval before implementation | Machine-audited design contract with context artifacts, alternatives, recommendation, approval, and self-review | `design-governance-engine.mjs` | `flow/brainstorming.md` — shipped | Connects UX direction to architecture, data, errors, and testing |
| `writing-plans` | Produce executable, exact, test-first plans | Plan graph validates exact files, interfaces, dependencies, commands, expected failures, and commits | `plan-quality-engine.mjs`, `task-graph-engine.mjs` | `flow/writing-plans.md` — shipped | Detects cycles and unsafe parallel file/resource collisions |
| `using-git-worktrees` | Isolate feature work and verify the baseline | Read-only workspace classifier distinguishes worktree, submodule, detached head, protected branch, and cleanup ownership | `workspace-safety-engine.mjs`, `process:workspace` | `flow/using-git-worktrees.md` — shipped | Prevents automatic removal of host-owned workspaces and silent protected-branch work |
| `test-driven-development` | Observe RED before production code, then GREEN and refactor | Hash- and timestamp-bound TDD cycle with behavior identity and high-risk negative controls | `tdd-evidence-engine.mjs`, `process:tdd` | `flow/test-driven-development.md` — shipped | Separates real test-first proof from tests written after implementation |
| `systematic-debugging` | Reproduce, localize, hypothesize, test minimally, fix root cause | Boundary evidence graph, one active hypothesis, one-variable experiment, regression RED, and architecture breaker | `debug-session-engine.mjs` | `flow/systematic-debugging.md` — shipped | Links browser, API, queue, worker, database, and provider evidence |
| `dispatching-parallel-agents` | Parallelize only independent domains | Conflict-aware task waves based on dependencies, files, exclusive resources, and shared mutable state | `task-graph-engine.mjs` | `flow/dispatching-parallel-agents.md` — shipped | Admits parallel analysis while blocking unsafe concurrent implementation |
| `subagent-driven-development` | Fresh implementer per task, review after each task, bounded fix loop, final review | Host-neutral role contracts, task briefs, diff packages, implementer reports, dual-verdict reviews, recovery ledger, and five-round breaker | review engine, ledger engine, roles/prompts/templates | `flow/subagent-driven-development.md` — shipped | Preserves coordination evidence even when the host provides different agent APIs |
| `executing-plans` | Execute a validated plan sequentially with checkpoints | Inline execution mode uses the same task graph, TDD, ledger, review, and verification contracts | process orchestrator and ledger | `flow/executing-plans.md` — shipped | Provides equivalent gates when no subagent runtime exists |
| `requesting-code-review` | Review early and before merge | Review package binds requirement hash, base/head identity, diff hash, files, tests, and reviewer identity | `review-governance-engine.mjs`, `process:review` | `flow/requesting-code-review.md` — shipped | Requires separate spec and quality verdicts and a final whole-change review |
| `receiving-code-review` | Verify feedback against codebase reality before accepting it | Feedback disposition records restatement, checked files, commands, evidence, accept/reject/defer rationale, and implementation proof | `feedback-adjudication-engine.mjs` | `flow/receiving-code-review.md` — shipped | Blocks performative acceptance, unsupported rejection, and unmanaged deferral |
| `verification-before-completion` | Evidence before every success claim | Claim type maps to required evidence types, freshness, scope, status, and artifact hash | `claim-verification-engine.mjs` | `flow/verification-before-completion.md` — shipped | Governs visual-match, security-gates-pass, bug-fixed, and production-ready language |
| `finishing-a-development-branch` | Verify, present integration options, execute only the user's choice, clean safely | Integration contract exposes allowed options and validates actor, verification, base branch, remote, cleanup ownership, and exact discard confirmation | `integration-decision-engine.mjs`, `process:integration` | `flow/finishing-a-development-branch.md` — shipped | Integration remains human-owned and destructive actions fail closed |
| `writing-skills` | Author skills through failing pressure scenarios and conformance checks | Skill conformance engine audits frontmatter, trigger quality, references, process coverage, pressure tests, TDD evidence, and release artifacts | `skill-conformance-engine.mjs`, v4 pressure scenarios | `flow/writing-skills.md` — shipped | The package self-audits its own discovery and deployment surface |

## Cross-skill improvements

Superpowers skills are intentionally modular. The package adds a cross-skill evidence fabric:

- a hash-linked ledger carries state across context loss;
- every task is bound to an approved design and executable plan;
- TDD and debugging proof feed reviewer evidence rather than living in prose;
- review findings cannot disappear silently;
- completion claims are checked against current artifact hashes;
- the process gate is a required hard gate inside the full-stack release decision;
- frontend visual quality and backend risk remain separately scored while process confidence uses a weakest-link model.

This specialization is the source of the improvement: the process is not merely recommended; it is represented by data that can be validated, reported, versioned, and blocked in CI.
