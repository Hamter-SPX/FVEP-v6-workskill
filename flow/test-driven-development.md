# Test-Driven Development

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Production behaviour starts with an observed failing test. The RED is evidence;
a test written after the code proves nothing about the behaviour's origin. This
stub holds the structure; the full reasoning arrives with the content task.

## When to use

- For every production behaviour change, including bug fixes (as a regression
  RED first).
- When `flow/flow-map.json` names this doc as a companion of the implement or
  debug mode.

## The flow

1. Content task fills in the RED → GREEN → refactor cycle bound to the TDD
   evidence contract.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not claim test-first without the failing output observed and recorded.
