# Visual Delta Triage — ref vs cur, in the right order

`ref` is the image the user actually wants. `cur` is what you produced and they rejected.
Noticing that they differ is not the skill. Knowing **which difference to fix first**, and
fixing exactly one thing per round, is the skill.

## Why order matters

A wrong colour on a correctly placed element is a small problem. A correct colour on a
wrongly placed element is still wrong. If you repaint before you re-place, you throw away
the only round where the paint judgement would have been valid.

Fix in perceptual dependency order:

```text
1 structure   where things are, what leads the eye
2 proportion  how big things are relative to each other
3 value       lightness structure, shadow anchors, highlight accents
4 colour      hue and saturation binding to the palette
5 density     how much detail lives in each region
6 polish      residual differences you may accept and stop
```

Never skip upward. Never fix stage 4 while stage 1 is open.

## The loop

```bash
# 1. Measure both frames and rank every difference
npm run vision:triage -- --ref design/ref.png --cur artifacts/cur.png \
  --regions .fx/regions.json --history .fx/triage-history.json

# 2. Read NEXT SINGLE CHANGE. Apply only that change.

# 3. Re-capture cur, then run the same command again.
```

The command exits `1` while the frames still differ, so an agent loop can keep going until
it exits `0`. Every round is appended to the history ledger.

## One variable per round

Batching fixes destroys attribution. If you change position, colour, and spacing in one
round and the result improves slightly, you have learned nothing about which change helped
and you cannot undo the one that hurt.

The report always names one change. Apply that one. Re-measure.

## The stall rule

If three consecutive rounds do not reduce `totalDelta` by at least `0.02`, the loop is
stalled. Stalling is not a reason to try harder in the same direction — it means the
hypothesis is wrong:

- Re-read the reference at region level, not as a whole picture.
- Restate what the user asked for in one sentence and check it against the reference.
- Ask whether the current structure can ever reach the reference, or whether it needs to
  be rebuilt instead of nudged.

Report the stall to the user rather than silently starting a fourth speculative round.

## Reading the evidence

- **Delta heatmap** — one digit per zone, `0` identical, `9` far off. Clusters tell you
  whether the problem is local (one element) or global (exposure, palette, scale).
- **Focal shift** — if the reference's densest zone is `C4` and yours is `A1`, the eye is
  being led somewhere else. That is a structure defect, no matter how nice `A1` looks.
- **Zone colour delta** — measured on mean RGB per zone, so it survives noise and texture.
- **Zone detail delta** — negative means the reference has material there that you
  abandoned; positive means you are busier than the reference and stealing attention.

## Pairing with the other tools

| Question | Tool |
| --- | --- |
| Which difference do I fix first? | `npm run vision:triage` |
| Exactly how far did this one region move? | `npm run layout-structure -- check` |
| What does this crop look like as characters I can reason over? | `npm run ascii-map` |
| Is the frame finished in every corner? | `npm run audit:scene` |
| Does the whole surface hold together aesthetically? | `npm run audit:aesthetics` |

Triage tells you the order. The region tools tell you the amount. The scene gate tells you
whether the parts nobody looked at are finished.

## Claim discipline

"Matched" is a measured verdict, not an impression. You may say the render matches the
reference only when `vision:triage` returns `verdict=match` on the **current** artifacts,
and you can name the ref/cur files that produced it. See
`references/verification-and-claim-governance.md`.
