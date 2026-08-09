# Subagent-Driven Development

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

Fresh implementers per task, review after each task, a bounded fix loop, and a
final whole-change review — coordination stays evidence-based even when the host
hosting this skill offers different agent APIs. This stub holds the structure;
the full reasoning arrives with the content task.

## When to use

- When a validated plan has multiple tasks and a subagent runtime is available.
- When `flow/flow-map.json` names this doc for the resolved mode (implement).

## The flow

1. Content task fills in the brief → implement → review → fix-loop sequence with
   its discharge and escalation rules.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not let one implementer carry context across independent tasks by default.
