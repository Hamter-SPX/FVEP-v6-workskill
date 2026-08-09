# Using One Framework

> Stub: this file defines the routing contract and proves the flow-doc structure.
> Task 2 replaces it with the full version. Nothing here is final prose.

## Why this exists

One Framework v6 turns the conversation itself into a governed surface: every
substantial request is routed to an operating mode, and every mode is bound to one
flow doc in `flow/flow-map.json`. Routing exists because fixing work done in the
wrong mode costs far more than asking which mode applies.

This doc is the entry point. It names how a request becomes a mode, a flow doc,
and a set of evidence gates. The other thirteen flows assume this routing already
happened.

## When to use

- At the start of every substantial request — before reading or editing anything,
  decide which mode the work belongs to. Routing costs seconds; wrong-mode rework
  costs hours.
- When the request carries a trigger keyword: "ช่วยรีดีไซน์", "implement",
  "มันพัง", "ก่อน merge", "ทำต่อจากเดิม" — let the resolver confirm what the
  keyword implies instead of trusting the first impression.
- When the current phase ends — re-route instead of drifting into the next mode.
- After context loss — re-resolve from the ledger and the resolver, never from memory.

## The flow

1. Restate the request in one sentence the user would accept.

2. Resolve the mode and read the flow doc the engine names:

   ```bash
   npm run mode -- resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย"
   ```

   The output carries `mode`, `confidence`, `flow`, and `flowCompanions`, all read
   from `flow/flow-map.json` by `lib/mode-engine.mjs`.

3. If the resolver exits 1 (no signal or ambiguous), ask the user which mode
   applies. Do not guess a mode to keep moving.

4. Name the disciplines the work will require:

   ```bash
   npm run process:route -- --input request.json
   ```

5. Open the flow doc named in step 2 and follow it exactly. Companion docs apply
   the moment their own triggers appear in the conversation.

6. Before any completion claim, close the mode through its exit check:

   ```bash
   npm run mode -- check --mode <id> --state state.json
   ```

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Mode resolved | `npm run mode -- resolve "<request>"` | mode, confidence, and flow are printed; ambiguous requests exit 1 until confirmed |
| Flow doc exists | `flow/flow-map.json` | every mode maps to a real doc, enforced by `node --test tests/unit/flow-docs.test.mjs` |
| Mode closed | `npm run mode -- check --mode <id> --state state.json` | verdict is mode-closed or mode-closable-with-notes before any claim |

## Anti-patterns

- Do not skip routing for "small" tasks — the rework after a wrong-mode edit is
  never small.
- Do not resolve the mode from memory after a context reset; re-run the resolver
  and trust its output over recall.
- Do not treat `flowCompanions` as optional reading once their triggers appear.
- Do not announce a mode without being able to show the resolve output it came
  from.
