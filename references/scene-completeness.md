# Scene Completeness — finish every corner, not only the subject

The most common failure in generated and hand-built scenes is the same: a strong subject in
the middle of a frame that was abandoned everywhere else. Flat corners, a background that is
one grey wall, the same crate copy-pasted eight times, and a value range that never reaches
real black or real white.

A frame is finished when a player can look anywhere in it and find something that belongs.

## The gate

```bash
npm run audit:scene -- --image artifacts/frame.png --brief design/scene-brief.json --grid 8x5
```

It measures the frame zone by zone and blocks on:

| Code | Meaning |
| --- | --- |
| `SCENE_EMPTY_CORNER` | A corner zone carries almost no detail |
| `SCENE_DEAD_ZONES` | Too much of the frame is below the detail floor |
| `SCENE_NO_FOCAL_HIERARCHY` | Nothing leads the eye; the frame is uniform mush |
| `SCENE_ISOLATED_SUBJECT` | One zone holds nearly all detail and the rest reads unfinished |
| `SCENE_VALUE_STRUCTURE_FLAT` | No real darks or no real highlights |
| `SCENE_TILING_REPETITION` | Near-identical zones betray copy-paste modules |

Detail is measured as edge density, local luminance variance, and colourfulness — so noise
alone does not pass, and a busy flat texture does not rescue an empty composition.

## Reading the heatmap

```text
detail heatmap (0 empty → 9 dense):
211112
138831
147741
211112
```

Corners at `2` with a centre at `8` is the classic abandoned frame. What you want is a
frame where the lowest zone is still inhabited and the focal zone leads by a clear margin —
roughly a 1.4x to 4x ratio over the median, not 12x.

## The brief comes first

Measurement proves detail exists. The brief proves it was designed. A scene brief must
declare:

- **fantasy** — the moment in one concrete sentence, not praise words
- **layers** — what occupies foreground, midground, and background, each named
- **focalPoint** — the subject and how the eye is led to it
- **lighting** — key direction, mood, and where the shadow anchors are
- **palette** — binding to the aesthetic profile
- **storyDetails** — at least three traces that prove the space is used: wear at hand
  height, a repair, a stain, an object someone left behind
- **negativeSpace** — where quiet is intentional, so the gate does not treat it as neglect

Empty space is allowed when you declared it. Empty space you forgot about is a defect.

## Filling corners without noise

Detail is not clutter. Ranked from cheapest to most expensive:

1. **Lighting falloff and shadow** — gives depth with no new geometry
2. **Atmospheric layers** — haze, rain veils, dust shafts separating the depth planes
3. **Framing geometry** — a beam, branch, or wall edge that occludes and holds the corner
4. **Story props** — inhabited traces, placed where a person would actually leave them
5. **Background silhouettes** — city, treeline, or structure that continues the world

If you fill corners with random props and the repetition finding fires, you added clutter
rather than composition. Vary rotation, wear, and lighting between repeated modules.

## Product surfaces, not only games

The same gate applies to marketing pages, dashboards, and game UI screens, with
`--allow-flat-background` when a deliberate flat backdrop is the direction. In that mode a
flat backdrop stops being a blocker but is still reported, so the choice stays visible.

## Loop position

```text
scene brief → blockout → audit:scene (fail closed) → asset pass → audit:scene again
   → in-context capture → vision:triage against the reference → match
```

Run the gate on the blockout **before** anyone spends hours on materials. An empty corner is
cheap to fix in blockout and expensive to fix after lighting is baked.
