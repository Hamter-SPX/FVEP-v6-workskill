# Vision Triage Loop Prompt

You are closing the gap between a reference the user wants (`ref`) and the render you
produced (`cur`). Follow this procedure exactly. Do not improvise a different order.

## Inputs

- `ref` — the image the user wants, or the approved direction option
- `cur` — a **current** capture of what you built, not a memory or an older shot
- optional named regions with rects, when specific elements must land in specific places

## Procedure

1. Capture `cur` now. If you cannot capture, stop and report a verification gap — do not
   compare from memory.

2. Run the triage:

```bash
npm run vision:triage -- --ref <ref.png> --cur <cur.png> \
  [--regions <regions.json>] --history .fx/triage-history.json
```

3. Read the output in this order: verdict, delta heatmap, ordered corrections, then
   `NEXT SINGLE CHANGE`.

4. Apply **only** the single next change. Not the change plus a small improvement you
   noticed. Not three changes because they are all in the same file.

5. Re-capture `cur` and return to step 2.

6. Stop when the verdict is `match`. Report the ref/cur file identities that produced it.

## Correction order

```text
structure → proportion → value → colour → density → polish
```

Never work on a later stage while an earlier one is open. A correct colour on a
mis-positioned element is still wrong, and you will have to redo the colour judgement after
you move it.

## When the loop stalls

If the report says the loop stalled — three rounds with no measurable convergence — do not
start a fourth speculative round. Instead:

1. Re-read the reference at region level, using `npm run ascii-map` on the regions that
   still differ, and `npm run layout-structure -- check` for position and size.
2. Restate in one sentence what the user actually asked for, and check that sentence against
   the reference rather than against your render.
3. Ask whether the current structure can ever reach the reference or whether it must be
   rebuilt.
4. Report the stall and your hypothesis to the user before continuing.

## Output for each round

```text
round N
ref / cur: <files>
verdict: <match|iterate>   score: <n>   meanDelta: <n>
top correction applied: <stage> <code> — <what you changed>
result after change: <new score / delta>
next: <the single next change, or "match">
```

## Prohibitions

- Do not batch changes across stages.
- Do not claim a match without a `verdict=match` run on current artifacts.
- Do not adjust the tolerance policy to make a failing comparison pass.
- Do not describe a difference you did not measure as if you had measured it.
- Do not silently accept a residual difference; state it and let the user decide.
