# VFX and SFX Direction

Effects and sound are the two systems most often treated as decoration and most often
responsible for a game feeling cheap, unreadable, or exhausting. Both carry information, and
both are judged in the worst case, never in isolation.

## The gate

```bash
npm run audit:game-assets -- --assets design/game-assets.json
```

Effects and sound have their own required fields on top of the universal ones:

| Class | Extra requirements |
| --- | --- |
| `vfx` | `timing`, `readability`, `gameplayRole` |
| `audio` | `layers`, `mixBus`, `repetitionPlan`, `redundantCue` |
| `animation` | `timing`, `cancelWindow`, `telegraph` |

A sound is exempt from silhouette, scale, and materials — it is sized in time, not in studs.

## VFX: information first, spectacle second

Every effect declares whether it is **gameplay-critical** or **decorative**. That single
decision drives everything else:

- Critical effects own the interactive palette role. Decorative effects may never borrow it.
- Critical effects must survive overlap. Test with three firing at once, not one on a black
  background.
- Critical effects have short, readable timing. An effect that outlives its meaning becomes
  clutter that hides the next piece of information.

Declare timing as numbers: attack, hold, decay in milliseconds. "Snappy" is not timing.

### Readability tests

1. **Overlap test** — three simultaneous instances; can you still read the enemy silhouette?
2. **Distance test** — at play distance, does it read as one shape or as noise?
3. **Colour-blind test** — if the effect means danger, does it still mean danger in greyscale?
4. **Worst-background test** — the same effect over the brightest and darkest areas of the map.

### Budget

Particles, overdraw, and draw calls belong in the spec. Overdraw is the usual killer on
mobile: additive layers stacked over a full screen height will cost more than the geometry
underneath them.

## SFX: layers, mix, and fatigue

A single flat sample is why effects feel weak. Build every sound in three layers:

- **attack** — the transient that tells the player it happened, typically under 20 ms
- **body** — the material identity: iron, wood, flesh, magic
- **tail** — the space it happened in, shortened or lengthened to signal weight

### The mix is part of the design

Declare the bus and the ducking rule. Which sounds may duck ambience, by how much, and for
how long. Which sounds may never be ducked, because they carry information the player cannot
lose — usually damage, low health, and objective cues.

### Repetition fatigue

The sound a player hears five hundred times per session needs a plan: variation count, pitch
and volume randomisation ranges, and a round-robin rule that never repeats the same sample
twice in a row. Test it by triggering ten in a row and listening for the pattern.

### Never audio-only

Any information carried by sound needs a visual or haptic partner. Players play muted, in
noisy rooms, and with hearing loss. The `redundantCue` field exists so this is a design
decision rather than an accessibility bug found later.

## Animation: feel is numbers

Anticipation, action, and recovery in milliseconds. The cancel window is the difference
between responsive and sluggish, and it is a number too — see
`references/game-feel-and-juice.md`.

The telegraph is what an opponent or the player reads *before* the effect lands. Without it,
a fair fight feels random.

## Prove it in the fight, not on the turntable

In-context evidence for effects and sound means the worst realistic moment: several actors,
full ambience, the busiest background in the level, at the default camera and mix. A hero
capture of one effect on a black background proves nothing about readability.
