# Assets pipeline

How art becomes runtime content.

## Typical asset classes

- Meshes / skeletons / LODs
- Textures / materials / atlases
- Animation clips and blend trees
- VFX graphs / particles
- Audio waves and sound banks
- Cinematics / cameras
- UI atlases and fonts

## Pipeline checks

- Naming and folder conventions
- Max size / memory budgets per platform
- Streaming and residency (what stays loaded)
- Source vs cooked/imported artifacts
- License / attribution for third-party packs

## Plugins / middleware (examples, not prescriptions)

- Physics, audio (FMOD/Wwise-class), animation retarget
- Terrain/foliage, cinematic sequencers
- Store SDKs, crash reporters, analytics

Record the actual plugin list for the project in `tools/plugins.md` (project-local).
