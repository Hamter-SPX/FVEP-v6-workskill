# Roles

Each pack answers the same three questions for one role: **what you own**, **which gates you
must pass**, and **which references you read before touching anything**.

Roles are not job titles. If one agent does all of them, it still passes all of their gates.

| Pack | Use when |
|---|---|
| [`frontend-engineer.md`](frontend-engineer.md) | Rendered surfaces, state matrices, accessibility, runtime cost |
| [`backend-engineer.md`](backend-engineer.md) | Domain boundaries, APIs, transactions, resilience |
| [`security-engineer.md`](security-engineer.md) | AuthN/AuthZ, threat models, data classification, supply chain |
| [`data-engineer.md`](data-engineer.md) | Schemas, migrations, backfills, invariants, analytics contracts |
| [`platform-sre.md`](platform-sre.md) | Deploys, SLOs, observability, rollback, incident readiness |
| [`qa-engineer.md`](qa-engineer.md) | Test strategy, evidence quality, negative controls, regressions |
| [`product-designer.md`](product-designer.md) | Flows, states, information architecture, experience contracts |
| [`visual-designer.md`](visual-designer.md) | Direction, palette, type, spacing, craft, style signature |
| [`game-designer.md`](game-designer.md) | Fantasy, loops, economy, level intent, difficulty |
| [`gameplay-engineer.md`](gameplay-engineer.md) | Controls, feel, netcode, systems code, frame budget |
| [`technical-artist.md`](technical-artist.md) | Pipeline, shaders, LODs, lighting, asset budgets |

## Routing

```text
task → role pack(s) → their required gates → run the gates → report with evidence
```

More than one pack usually applies. A "make the checkout page prettier" task is
`visual-designer` plus `frontend-engineer`; if it touches payment state it is also
`backend-engineer` and `security-engineer`.

## The rule every pack shares

A role's opinion is not evidence. Each pack lists commands that produce evidence, and the
completion report cites those results — not the fact that the role looked at it.
