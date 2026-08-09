# Using Git Worktrees

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Implementation belongs in an isolated workspace whose baseline is verified green
before the first change. This stub holds the structure; the full reasoning
arrives with the content task.

## When to use

- At the start of feature work that must not touch a protected branch.
- When `flow/flow-map.json` names this doc as a companion of the implement mode.

## The flow

1. Content task fills in the isolation sequence: classify the workspace, get
   consent before main or master, verify the baseline, then begin.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not delete a workspace the system does not own.
