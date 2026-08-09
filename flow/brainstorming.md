# Brainstorming

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Exploration before implementation: compare at least two approaches with real
trade-offs, get an explicit approval, and only then build. This stub holds the
structure; the full reasoning arrives with the content task.

## When to use

- When a request opens a new design space: "ออกแบบ ui", "รีดีไซน์", "make it look",
  a new feature with no agreed direction yet.
- When `flow/flow-map.json` names this doc for the resolved mode (design-ui,
  design-game).

## The flow

1. Content task fills in the exact explore → compare → approve sequence bound to
   the direction and design-governance engines.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not present near-duplicate options as a choice.
