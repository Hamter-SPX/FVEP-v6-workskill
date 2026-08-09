# Finishing a Development Branch

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Integration is a human decision: the agent verifies, presents the allowed
options without choosing one, executes only the user's pick, and cleans up
safely. This stub holds the structure; the full reasoning arrives with the
content task.

## When to use

- When implementation is complete, tests pass, and the work must be merged,
  discarded, or kept.
- When `flow/flow-map.json` names this doc as a companion of the ship mode.

## The flow

1. Content task fills in the option presentation, execution, and cleanup
   ownership rules.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not select merge, push, cleanup, or discard on the user's behalf.
