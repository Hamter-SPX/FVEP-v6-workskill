# Game Feel and Juice

"It feels good" is the vaguest praise in game development and one of the most engineerable
properties in it. Feel is made of numbers, and the numbers can be recorded, tuned, and
regression-tested.

## The response chain

Every action passes through the same chain. Each link has a budget:

```text
input read → buffer window → state change → first visual frame → audio attack → camera reaction → settle
```

If the chain takes longer than roughly 100 ms to produce its first feedback, players describe
the game as laggy even when the simulation is correct. The first feedback does not have to be
the full effect — it has to be *something*, on the first frame.

## The numbers worth declaring

| Parameter | What it fixes |
| --- | --- |
| Input buffer window | Presses during animation that would otherwise be dropped |
| Coyote time | Jumps that "should have worked" at ledge edges |
| Cancel window | The difference between committed and sluggish |
| Hit stop | Weight and impact, at the cost of responsiveness if overused |
| Screen shake amplitude and decay | Impact, at the cost of readability if overused |
| Camera lag and lookahead | Whether the player can see where they are going |
| Animation anticipation | Whether attacks are fair to react to |

Record these in the design, not in scattered magic numbers. When a player says the controls
feel bad, you want a table to tune, not a hunt.

## Juice has a budget

Every effect that adds feel also adds noise. Rank them by information value:

1. Effects that tell the player something they need (hit confirmed, damage taken)
2. Effects that reward the player for something they did well
3. Effects that make the world feel alive
4. Effects that exist because they looked good in isolation

The fourth category is where frames and readability go to die. When the screen is at its
busiest, categories 3 and 4 should be the first to reduce.

## Measure, do not vibe

- Capture input-to-first-frame latency on the **target device**, in the **worst frame**, not
  the average.
- Record the 1% low frame time, not the average frame rate. Players feel the low.
- Test feel in the worst realistic scene: many actors, full VFX, full ambience.
- Regression-test the numbers players notice. A refactor that silently changed the cancel
  window is a gameplay bug, not a code change.

## Accessibility is part of feel

Screen shake and heavy camera motion make some players ill. Provide a reduction setting and
verify the game is still readable with it on — including the effects that were carrying
information through motion.

## Where it plugs in

- Asset-level requirements: `references/vfx-and-sfx-direction.md`
- Frame budget and profiling: `domains/GAME/systems/performance-platforms.md`
- Netcode and authority: `domains/ROLES/gameplay-engineer.md`
- Motion in interfaces, which follows different rules: `references/motion-quality-standards.md`
