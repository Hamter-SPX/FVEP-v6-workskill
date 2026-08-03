# Game Asset Spec — <asset name>

> One asset, specified so it can be built, budgeted, and checked in context.
> Audit with `npm run audit:game-assets -- --assets design/game-assets.json`.

## Identity

- **id:** `class.family.variant` (stable, lowercase, dot-separated)
- **name:**
- **class:** character | creature | prop | weapon | vehicle | environment | architecture | terrain | vfx | ui | audio | animation
- **styleBinding:** which graphics pack and aesthetic profile this obeys

## Intent

- **purpose:** what it does for the player, in one sentence
- **fiction:** who made it, who uses it, why it is here

## Form

- **silhouette:** the dominant shape and the one feature that survives at 64px
- **scale:** number + unit + reference (for example `5.6 studs tall, about 1.1x avatar height`)
- **materials:** surface treatment, not only base colour
- **palette:** which palette roles it uses and which it must never use

## Story details

At least two concrete traces tied to the fiction:

1.
2.
3.

## Engine

- **budget:** triangles / parts / texture size / draw calls
- **lod:** what drops at which distance
- **variants:** states, damage levels, seasonal or event skins
- **attachments / sockets:**
- **collision:**

## Acceptance

How this asset is proven, with distance and lighting:

- Silhouette legible at 64px thumbnail
- Reads as <its role> from <N> units in <lighting>
- Does not clip or fight <adjacent asset / animation>

## In-context evidence

- **inContextEvidence:** which capture proves it — gameplay camera, real lighting, play
  distance, avatar in frame. A turntable render does not count.

## Sign-off

- Direction approved by:
- In-context capture:
- Scene gate result:
- Set audit result:
