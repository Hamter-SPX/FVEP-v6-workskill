# Graphics styles

Pick a **graphics language** separately from genre. Same genre can look voxel, realistic, or UGC-blocky.

| Style pack | Look / pipeline pressure |
|---|---|
| [`realistic-aaa.md`](realistic-aaa.md) | PBR, high LOD, cinematic lighting |
| [`stylized-cartoon.md`](stylized-cartoon.md) | Exaggerated forms, flat/painted shading |
| [`low-poly.md`](low-poly.md) | Faceted meshes, limited palette, cheap LODs |
| [`voxel-block.md`](voxel-block.md) | Minecraft-class cubes / chunk meshes |
| [`pixel-sprite.md`](pixel-sprite.md) | 2D pixel art, strict palette, integer scale |
| [`ugc-avatar-platform.md`](ugc-avatar-platform.md) | Roblox-class modular avatars + catalog parts |
| [`mobile-lightweight.md`](mobile-lightweight.md) | Aggressive batching, atlas, device tiers |

## Rules

1. Declare style **before** producing direction options 1/2/3 — theses must stay inside the style budget.
2. Do not mix incompatible pipelines in one novelty spend (e.g. photoreal skin + chunky voxel world) unless the GDD says hybrid on purpose.
3. UI/HUD chrome should match the world style (see `../systems/ui-hud.md`).
