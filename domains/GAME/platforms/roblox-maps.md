# Roblox maps (Places)

How to think about **maps** on Roblox: a playable Place inside an Experience, built in Studio, joined by avatars.

## Vocabulary (keep these straight)

| Term | Meaning |
|---|---|
| Experience | The product players find on the platform |
| Place | One map/level/world file players can be in |
| Workspace | The 3D world root (parts, terrain, models) |
| Teleport | Move players between Places (or reserved servers) |
| Streaming | Load world around the player so large maps stay playable |

One Experience often has **many Places** (lobby → match → hub → shop world).

## Map types (common)

- Lobby / hub
- Obby / parkour course
- Tycoon / simulator layout
- Roleplay town / mall / school
- Battle arena / battlegrounds
- Story chapter Place
- Showcase / gallery map

Declare the type before art direction — UI and spawn rules differ hard.

## Map checklist

### Layout

- Spawn location(s) and safe first view
- Pathing: where new players should walk in the first 20 seconds
- Landmarks readable at distance (silhouette + colour)
- Kill/void planes and soft boundaries
- Seating, queues, and social hang spots if social

### World building

- Terrain vs parts vs MeshParts — pick a dominant language
- Material/colour vocabulary consistent with [`../../graphics/ugc-avatar-platform.md`](../../graphics/ugc-avatar-platform.md)
- Scale vs R15/R6 avatars (doorways, rails, cover height)
- Collision: CanCollide / CanQuery / invisible walls documented
- Lighting + atmosphere + fog so mobile stays readable

### Performance (maps die here first)

- Part / instance count and draw calls
- Unanchored physics spam
- Transparent overdraw and giant meshes
- Sounds and lights per zone
- StreamingEnabled + intentional streaming radius / priorities
- Mobile smoke-test on a mid device, not only Studio on PC

### Gameplay hooks in the map

- Checkpoints / stage markers (obby)
- Collectible or drop pads (simulator)
- Capture points / lanes (arena)
- NPC markers and interaction prompts
- Clear “what do I do next?” without a wall of text

### Multi-Place flow

- Lobby Place → match Place teleport contract
- Loading screens / teleport UI copy
- Data that must persist across Places (profile, currency)
- Failures: teleport failed, reserved server full

## UI that belongs to the map

- Hotbar / tools if tools are map verbs
- Stage / money / timer HUD that does not hide landmarks
- Map or minimap only if the space is large enough to need it
- Shop boards in-world vs ScreenGui — pick one primary pattern

Direction for menus: `../../../DESIGN/README.md` + distinctness gate.  
Match a locked HUD mock: `ascii-map` / `layout-structure`.

## Studio / tools (class)

- Roblox Studio (terrain, lighting, explorer hierarchy)
- Packages / packages for reused buildings
- Plugins for alignment, litter scatter, lighting presets (inventory in project `tools/`)
- Team Create rules: who owns lighting vs who owns gameplay scripts

## Deliverables for a map task

```text
game/maps/<place-name>/
  brief.md          # type, fantasy, win condition, target device
  blockout.md       # greybox notes + spawn/paths
  art-pass.md       # palette, landmarks, references
  perf-budget.md    # instance/streaming/lights targets
  ui-notes.md       # HUD/boards tied to this Place
```

## Related packs

- Experience wrapper: [`../../genres/ugc-platform.md`](../../genres/ugc-platform.md)
- Graphics: [`../../graphics/ugc-avatar-platform.md`](../../graphics/ugc-avatar-platform.md)
- Live ops / sessions: [`../../genres/multiplayer-liveops.md`](../../genres/multiplayer-liveops.md)
- Perf: [`../../systems/performance-platforms.md`](../../systems/performance-platforms.md)
