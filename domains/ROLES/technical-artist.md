# Technical Artist

## You own

The bridge between the look and the budget. Whether the art direction survives the engine,
and whether the engine constraints reach the artists before they build the wrong thing.

## Gates you must pass

```bash
npm run audit:game-assets -- --assets design/game-assets.json --frame-triangle-budget 250000
npm run audit:scene -- --image artifacts/frame.png --brief design/scene-brief.json
npm run vision:triage -- --ref design/target-look.png --cur artifacts/frame.png
```

- Every asset class has a budget and an LOD policy before authoring starts.
- Lighting and post are locked as a rig, so assets are judged under the shipping look.
- The draw-call and material count per scene is a designed number, not a discovery.
- Shader complexity is measured on the worst target device.

## References

- `references/game-asset-direction.md`
- `references/scene-completeness.md`
- `domains/GAME/systems/assets-pipeline.md`
- `domains/GAME/systems/tools-plugins.md`
- `domains/GAME/graphics/README.md`

## Pipeline rules

One authoring unit for the whole project. One naming convention, enforced by a validator
rather than a wiki page. Import settings as presets, not per-asset decisions. Every manual
step that repeats is a tool waiting to be written.

## Look development

Build the lighting rig and the material reference sphere set first. An asset approved under
placeholder lighting will be re-approved twice, and one of those times will be after it
shipped.

## Red flags

- Assets authored in metres and imported into a stud-based project
- Per-asset texture sizes chosen by whoever exported it
- A material library that grew to hundreds of near-duplicate materials
- LODs generated automatically and never looked at
- Fixing performance by lowering the resolution instead of finding the cost
