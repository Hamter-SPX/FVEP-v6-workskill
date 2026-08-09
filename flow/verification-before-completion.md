# Verification Before Completion

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Every success claim — finished, fixed, matched, passing — is bound to a named
run on the current artifact, and what was not verified is stated as plainly as
what was. This stub holds the structure; the full reasoning arrives with the
content task.

## When to use

- Before any completion, fix, match, or release claim; also at the end of a
  match-reference loop.
- When `flow/flow-map.json` names this doc for the resolved mode (match-ref,
  ship).

## The flow

1. Content task fills in the claim-to-evidence mapping, freshness, and scope
   rules.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not assert success from stale or unscoped evidence.
