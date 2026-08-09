# Writing Skills

> Stub — the full version is written by the v6 flow content task for this doc.
> Only the required structure is fixed here; no prose below is final.

## Why this exists

A skill earns its guidance by surviving pressure scenarios, and every rule it
states is enforced by an engine or test — never by prose alone. This stub holds
the structure; the full reasoning arrives with the content task.

## When to use

- When authoring or editing a skill: new sections, gates, references, or tests.
- When `flow/flow-map.json` names this doc for the resolved mode (author-skill).

## The flow

1. Content task fills in the pressure-scenario-first authoring loop and the
   conformance requirements.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Structure | `node --test tests/unit/flow-docs.test.mjs` | This doc passes the flow-doc lint |

## Anti-patterns

- Do not treat this stub as the final flow — the content task replaces it.
- Do not add guidance that no gate or test enforces.
