# GAME

Domain pack for game work. Games share UI/UX needs with apps, but add worlds, systems, assets, tools — and **many graphics languages**.

## Always on for game work

- The loop from fantasy to a matching frame: [`../../references/game-vision-loop.md`](../../references/game-vision-loop.md)
- Visual direction: `../../references/visual-direction-exploration.md`
- Distinct options gate: `npm run direction:distinctness`
- Frame finished in every corner: `npm run audit:scene` — [`../../references/scene-completeness.md`](../../references/scene-completeness.md)
- Assets that survive the engine: `npm run audit:game-assets` — [`../../references/game-asset-direction.md`](../../references/game-asset-direction.md)
- Maps, blockouts, and generators: [`../../references/world-building-and-level-blockout.md`](../../references/world-building-and-level-blockout.md)
- Ref↔cur correction order: `npm run vision:triage` — [`../../references/visual-delta-triage.md`](../../references/visual-delta-triage.md)
- Region-level fidelity: `npm run ascii-map`, `npm run layout-structure`
- Role packs for the people doing the work: [`../ROLES/game-designer.md`](../ROLES/game-designer.md), [`../ROLES/gameplay-engineer.md`](../ROLES/gameplay-engineer.md), [`../ROLES/technical-artist.md`](../ROLES/technical-artist.md)

## How to pick packs

```text
1) genre   (what you play)
2) graphics (how it looks / asset pipeline)
3) systems (UI, assets, gameplay, audio, tools, platforms)
```

Example: Minecraft-like → `genres/voxel-sandbox` + `graphics/voxel-block`  
Example: Roblox experience → `genres/ugc-platform` + `graphics/ugc-avatar-platform`  
Example: Roblox **map/Place** → add `platforms/roblox-maps`  
Example: GTA-like → `genres/open-world-action` + `graphics/realistic-aaa` (or stylized if you choose)

## Genres (load only what matches)

| Genre pack | Examples of shape |
|---|---|
| [`genres/open-world-action.md`](genres/open-world-action.md) | GTA-like: city, vehicles, missions, wanted |
| [`genres/rpg.md`](genres/rpg.md) | Stats, inventory depth, quest graph, dialogue |
| [`genres/puzzle-casual.md`](genres/puzzle-casual.md) | Short loops, juice, level packs |
| [`genres/hypercasual-mobile.md`](genres/hypercasual-mobile.md) | One-thumb, instant retry, tiny download |
| [`genres/multiplayer-liveops.md`](genres/multiplayer-liveops.md) | Sessions, economy sync, seasons |
| [`genres/simulation-strategy.md`](genres/simulation-strategy.md) | Systems, economy, fog-of-war / maps |
| [`genres/platform-fighting.md`](genres/platform-fighting.md) | Precision feel, combat frames, VFX readability |
| [`genres/voxel-sandbox.md`](genres/voxel-sandbox.md) | Minecraft-class: blocks, craft, build |
| [`genres/ugc-platform.md`](genres/ugc-platform.md) | Roblox-class: avatars, catalog, experiences |

## Graphics styles (many looks)

See [`graphics/README.md`](graphics/README.md) — realistic, stylized, low-poly, voxel/block, pixel, UGC avatar, mobile lightweight.

## Platforms (map / store / tooling specifics)

| Pack | Covers |
|---|---|
| [`platforms/roblox-maps.md`](platforms/roblox-maps.md) | Roblox Places: layout, streaming, teleports, map perf, Studio flow |

## Systems (shared across genres)

| System pack | Covers |
|---|---|
| [`systems/ui-hud.md`](systems/ui-hud.md) | Menus, HUD, readability in motion |
| [`systems/assets-pipeline.md`](systems/assets-pipeline.md) | Models, textures, anim, VFX, streaming |
| [`systems/gameplay.md`](systems/gameplay.md) | Controllers, missions, rules, balance data |
| [`systems/audio.md`](systems/audio.md) | Music, SFX, dialogue, mix buses |
| [`systems/tools-plugins.md`](systems/tools-plugins.md) | Engine plugins, middleware, editors |
| [`systems/performance-platforms.md`](systems/performance-platforms.md) | Budgets, consoles/PC/mobile, cert |

## Suggested artifact roots in a game project

```text
game/
  design/           # GDDs, mission briefs
  ui/               # HUD/menu specs + direction options
  assets/           # art sources (often LFS)
  systems/          # gameplay docs + tables
  tools/            # editor scripts, plugins list
```

## What is enforced versus what is guidance

The genre, graphics, systems, and platform notes are a **map + checklists**. They do not replace the engine, DCC tools, or a full GDD.

Three things in this domain are enforced by executable gates, and they fail closed:

```bash
npm run audit:scene        # the frame is finished everywhere, not only at the subject
npm run audit:game-assets  # every asset is buildable, budgeted, on-style, and proven in context
npm run vision:triage      # ref↔cur differences ranked, one change per round, stall detection
```
