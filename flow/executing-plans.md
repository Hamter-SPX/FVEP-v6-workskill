# Executing Plans

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

When no subagent runtime exists, the plan still executes with the same task
graph, TDD, review, and verification contracts — inline, sequentially, with
checkpoints. This stub holds the structure; the full reasoning arrives with the
content task.

## When to use

- When executing a validated plan in a single session instead of dispatching
  implementers.
- When `flow/flow-map.json` names this doc as a companion of the implement mode.

## The flow

1. Content task fills in the inline execution loop with its checkpoint and
   evidence rules.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not skip checkpoints because execution is inline.
