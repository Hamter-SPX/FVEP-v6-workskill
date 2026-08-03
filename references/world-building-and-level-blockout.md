# World Building and Level Blockout

A map is a machine for producing player experiences. It is judged by what players do in it,
then by how it looks. Both are checkable.

## Blockout before beauty

Build the level in untextured grey geometry first, with real collision and real player
movement. The blockout is approved on:

- **Traversal** — can the player get everywhere the design intends, at the intended cost?
- **Sightlines** — what is visible from each spawn, each objective, each choke?
- **Metrics** — jump height, step height, corridor width, door height, cover height, all
  stated as numbers in the project unit and reused everywhere.
- **Composition** — run `npm run audit:scene` on the establishing shots now. Empty corners
  and missing depth layers are cheap to fix in grey boxes.
- **Time-to-fun** — how many seconds from spawn to the first intended moment?

Nothing gets a material until the blockout is approved. Materials on a bad blockout only
make the problem more expensive to admit.

## Layout languages

| Layout | Reads as | Watch for |
| --- | --- | --- |
| Corridor / linear | Directed story pacing | Dead ends that feel like bugs |
| Hub and spoke | Player-chosen order | Hub becoming a loading screen with walls |
| Loop / arena | Continuous flow, PvP | Symmetry that erases landmarks |
| Open field | Freedom, exploration | Featureless middle, navigation by minimap only |
| Vertical tower | Escalating tension | Fall punishment without fall recovery |
| Grid / tile | Generated content, puzzles | Repetition findings from the scene gate |

## Landmarks and legibility

Players navigate by silhouette, not by map. Every region needs:

- one **landmark** visible from outside the region, unique in silhouette and colour role
- one **local anchor** the player uses to orient inside the region
- a **material or palette shift** at the boundary so the transition is felt

If two regions photograph the same at thumbnail size, players will get lost in them.

## Guiding attention without signage

Ranked by subtlety:

1. Light — players walk toward brighter, warmer, and moving light
2. Contrast and value — the objective sits at the highest local contrast
3. Leading lines — rails, pipes, cracks, and roads that point
4. Colour role — the interactive accent used *only* on interactive things
5. Motion — flags, steam, birds, particles at the intended destination
6. Explicit signage — the fallback, not the plan

## Generated maps

When a script generates the map, review the generator, not one lucky output:

```bash
# capture the same fixed seeds every round
npm run audit:scene -- --image artifacts/seed-01.png --brief design/scene-brief.json
npm run audit:scene -- --image artifacts/seed-07.png --brief design/scene-brief.json
npm run audit:scene -- --image artifacts/seed-13.png --brief design/scene-brief.json
```

Rules:

- Seeds are fixed and recorded. An unseeded generator cannot be reviewed or regression-tested.
- Test the worst seed you can find, not the demo seed.
- Guarantee invariants in code: reachability, minimum room count, no soft-locks, spawn
  distance from objectives. Assert them in tests, not by eye.
- Vary rotation, prop sets, wear, and lighting per instance, or the tiling finding fires and
  players see the pattern within minutes.
- Hand-place the moments that carry the fiction. Fully procedural worlds read as texture.

## Performance is part of the layout

Occlusion is designed, not discovered. Break long sightlines with geometry the fiction
justifies. Keep the drawn set bounded per region, and decide streaming boundaries while the
blockout is still grey. Retro-fitting occlusion into an open plan costs a redesign.

## Handoff

The level is done when:

- the blockout metrics document exists and matches the built geometry,
- `npm run audit:scene` passes on every establishing shot and on the worst seed,
- `npm run audit:game-assets` passes for the set used in the level,
- the frame budget holds on the target device, measured, not estimated,
- and `npm run vision:triage` matches the approved reference for the key shots.

Platform specifics live in `domains/GAME/platforms/`.
