# Game Asset Direction — designing things that survive contact with the engine

A model can produce a beautiful asset image and still hand over something unusable: wrong
scale next to the avatar, a silhouette that dissolves at play distance, a palette that
belongs to a different game, and a triangle count nobody budgeted.

An asset is designed when it is **buildable, readable, on-style, and checkable in context**.

## The gate

```bash
npm run audit:game-assets -- --assets design/game-assets.json --frame-triangle-budget 250000
```

Per asset it requires:

| Field | Why it blocks |
| --- | --- |
| `class` | Routes the right budget and LOD expectations |
| `styleBinding` | Without it every asset drifts to its own style |
| `purpose` | What it does for the player, not what it looks like |
| `silhouette` | The shape that identifies it as a black shape at thumbnail size |
| `scale` | A number **and** a reference: "5.6 studs, about 1.1x avatar height" |
| `materials` | Surface treatment, not just base colour |
| `palette` | Binds the asset to one world |
| `storyDetails` | Wear, repairs, maker marks — the difference between made and generated |
| `budget` | Triangles, parts, texture size, or draw calls |
| `acceptance` | Which distance, which lighting, which shot proves it works |
| `inContextEvidence` | Verified in the scene, never on an empty turntable |

Across the set it also checks duplicate ids, mixed scale units, split style bindings,
palette sprawl, silhouette repetition, and the total triangle budget.

## Silhouette first

Players recognise assets as shapes before they see materials. Test every asset as a black
fill at 64px. If two assets are indistinguishable at that size, players will confuse them in
play, no matter how different their textures are.

Give each asset a distinct dominant shape or proportion:

- one **tall thin** thing, one **wide low** thing, one **compact dense** thing
- one asymmetric feature per asset that survives scaling down
- avoid giving three props the same bounding proportion

## Scale is a fact, not a feeling

State scale in the project's authoring unit with a comparison:

```text
5.6 studs tall, about 1.1x avatar height, base 1.2 studs wide
1.8 m tall, door height, fits through the 2 m corridor
3 tiles wide, blocks the 2-tile jump gap
```

Mixed units across a set is a blocker in practice even when each asset looks right alone —
that is how a chair ends up the size of a car.

## Story details are the anti-generic control

Generated assets look generated because they are uniform and unused. Two or more concrete
traces fix that:

- paint worn away exactly at hand height
- one plank replaced with fresher wood
- a mismatched repair pane
- salt bloom or rust starting at the ground contact

Each trace must be tied to the fiction. "Random scratches" is noise; "scratches where the
crane hook lands" is design.

## Budget the frame, not the asset

An asset that meets its own budget can still break the frame. Declare a frame budget and let
the set audit total it:

```json
{ "policy": { "frameTriangleBudget": 260000 }, "assets": [ ... ] }
```

Background and repeated assets deserve the tightest budgets, because they are drawn most.

## Prove it in context

The acceptance evidence must be a capture from the **gameplay camera**, at the **play
distance**, in the **real lighting**, next to the **avatar**. A hero render at 4K with studio
lighting proves nothing about whether a player can tell what the object is while running past
it at night.

Route the capture into the scene gate and the triage loop:

```bash
npm run audit:scene -- --image artifacts/asset-in-context.png --brief design/scene-brief.json
npm run vision:triage -- --ref design/asset-ref.png --cur artifacts/asset-in-context.png
```

## Templates and schema

- `templates/game-asset-spec.md` — fill-in spec for one asset
- `schemas/game-asset-spec.schema.json` — machine shape for a set
- `examples/game-assets.example.json` — a set that passes its own policy

Read `domains/GAME/graphics/` for the style pack that owns the look, and
`domains/GAME/systems/assets-pipeline.md` for how the files land in the engine.
