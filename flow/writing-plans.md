# Writing Plans

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

A plan is an executable contract: exact files, interfaces, and test-first steps,
with no placeholders that defer thinking to implementation time. This stub holds
the structure; the full reasoning arrives with the content task.

## When to use

- Before any multi-step implementation; after an approved direction and before
  the first edit.
- When `flow/flow-map.json` names this doc as a companion of the resolved mode
  (design-ui, implement).

## The flow

1. Content task fills in the exact plan structure: goal, architecture, global
   constraints, and tasks with Files, Interfaces, and TDD steps.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not write plan steps that name no real file or no expected failure.
