# Agent Orchestration

## Objective

Use specialized roles without fragmenting product intent or allowing independent agents to approve their own work.

## Recommended Roles

| Role | Owns | Must not own |
|---|---|---|
| Repository explorer | Architecture, conventions, constraints, reusable assets | Visual direction or implementation |
| Design director | Design contract, hierarchy, responsive and state intent | Final code verification |
| Implementation engineer | Code and behavior under the approved contract | Self-approval of visual fidelity |
| Visual critic | Render comparison, semantic deltas, responsive composition | Silent code changes |
| Accessibility and interaction reviewer | Semantics, keyboard, focus, state, recovery | Pure aesthetic preference |
| Release verifier | Evidence matrix, commands, provenance, final gate | Implementing last-minute unreviewed changes |

Role contracts are in `agents/`.

## Handoff Contract

Every handoff contains:

- Objective and fidelity mode
- Current design contract version
- Exact route × viewport × state scope
- Files or evidence reviewed
- Decisions made
- Open blockers and assumptions
- Commands and actual results
- Next role’s acceptance condition

## Independence

The implementer should not be the only semantic reviewer. If only one agent/runtime is available, execute roles sequentially and deliberately reset perspective before review:

1. Finish implementation evidence.
2. Re-open the contract and captures as a critic.
3. Review without editing.
4. Record deltas.
5. Return to implementation only after the review is complete.

## Parallelism

Parallelize only independent work such as repository inventory, reference analysis, and accessibility reconnaissance. Do not parallelize edits to shared layout foundations without an integration owner and explicit boundaries.
