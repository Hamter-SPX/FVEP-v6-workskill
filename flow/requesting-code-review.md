# Requesting Code Review

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Review happens early and always before merge, with findings that cite evidence
and a review package bound to the exact change that was judged. This stub holds
the structure; the full reasoning arrives with the content task.

## When to use

- After implementation completes any task or the whole change, and always before
  merge.
- When `flow/flow-map.json` names this doc for the resolved mode (review).

## The flow

1. Content task fills in the review-package assembly, dual verdicts, and the
   rules for who may review what.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not review your own implementation.
