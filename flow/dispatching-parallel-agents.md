# Dispatching Parallel Agents

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Parallelism is admitted only where domains are independent: no shared mutable
state, no file collisions, no exclusive resources claimed twice. This stub holds
the structure; the full reasoning arrives with the content task.

## When to use

- When two or more tasks could run concurrently and their independence can be
  shown from the plan graph.
- When `flow/flow-map.json` names this doc as a companion of the implement mode.

## The flow

1. Content task fills in the wave-based dispatch rules and the collision checks
   that block unsafe concurrency.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not parallelize tasks that share files or state "carefully".
