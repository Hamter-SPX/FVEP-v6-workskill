# Game Designer

## You own

The fantasy and the loop that delivers it. Not the feature list — the sentence a player would
use to describe what they just did, and whether they want to do it again.

## Gates you must pass

```bash
npm run audit:scene -- --image artifacts/frame.png --brief design/scene-brief.json
npm run audit:game-assets -- --assets design/game-assets.json
```

- The core loop is written as a loop: action → feedback → reward → new capability → action.
- Time-to-fun is measured in seconds from launch, not assumed.
- Every system states what it takes from the player and what it gives back.
- Difficulty is a curve you designed, not the accident of what was easy to build.

## References

- `references/game-vision-loop.md`
- `references/world-building-and-level-blockout.md`
- `references/scene-completeness.md`
- `domains/GAME/README.md` and the genre pack that matches
- `templates/scene-brief.md`

## Economy and progression

Every currency needs a source, a sink, and a reason a player would choose to hold it. A
progression system with only sources becomes inflation; only sinks becomes a chore. Write the
numbers down and simulate them before shipping them.

## Level intent

Each space states its intent before it is built: what the player learns, what they are
afraid of, what they will remember. See the blockout reference — the intent is what the
blockout review is checked against.

## Red flags

- A feature list with no loop connecting the features
- Tutorial as a wall of text because the level does not teach
- Difficulty tuned only by the person who built the encounter
- Monetisation designed after the loop, then bolted through it
- Calling a mechanic fun before anyone outside the team has played it
