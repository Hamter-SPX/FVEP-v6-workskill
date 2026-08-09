# Systematic Debugging

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Reproduce, localize the failing boundary, hold one hypothesis at a time, change
one variable per experiment, and fix the root cause rather than the symptom.
This stub holds the structure; the full reasoning arrives with the content task.

## When to use

- On any failure report: "มันพัง", "error", "ไม่ทำงาน", unexpected output,
  regressions after a change.
- When `flow/flow-map.json` names this doc for the resolved mode (debug).

## The flow

1. Content task fills in the reproduce → hypothesize → experiment → root-cause
   sequence bound to the debug engines.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not change several things at once "to see what helps".
