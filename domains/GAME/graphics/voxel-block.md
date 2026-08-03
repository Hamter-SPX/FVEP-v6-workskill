# Voxel / block

Cube or chunk-based worlds (Minecraft-class). Building, mining, and readable block IDs matter more than organic meshes.

## Pipeline pressure

- Chunk meshing, greedy meshing, LODs for distance
- Atlas or palette textures for block types
- Entity models may be blocky rigs or simple meshes on top of voxels
- Lighting often chunk-local or simplified GI

## UI tip

Inventory and hotbar must show block identity at a glance (icon = block type).
