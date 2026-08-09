# Receiving Code Review

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Feedback is verified against the codebase before it is accepted. Agreement
without verification is theater, and rejection without evidence is the same
failure with the opposite sign. This stub holds the structure; the full
reasoning arrives with the content task.

## When to use

- Whenever review findings arrive — before responding, changing code, or
  dismissing any finding.
- When `flow/flow-map.json` names this doc for the resolved mode (review) or as
  a companion (debug).

## The flow

1. Content task fills in the disposition contract: restate, check files, run
   commands, then accept, reject, or defer with rationale.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not implement feedback that was never verified against the code.
