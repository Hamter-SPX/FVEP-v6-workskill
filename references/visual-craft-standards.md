# Visual Craft Standards

## Purpose

Craft is the layer below composition. A design can satisfy every structural rubric and still read as amateur because of misaligned optical centres, shadows that describe an impossible light source, or radii that do not nest. These defects are individually small and collectively decisive: they are the difference most people describe as "polished" without being able to point at a cause.

Craft findings are always minor severity on their own. They become major when they repeat across a system, because repetition converts a detail into a visible pattern.

## Optical Versus Geometric Alignment

Measured centre and perceived centre differ. Align to what the eye sees.

- **Icon in a circular or square button.** Glyphs with heavy mass on one side sit off-centre when centred geometrically. Play, chevron, and send icons typically need a shift of roughly 1–2 px toward the visual mass at 24 px sizes.
- **Text baseline against an icon.** Centring an icon box against a line box leaves the icon looking high, because the line box includes descender space. Align to cap height or x-height, not to the line box.
- **Round versus flat shapes.** Circles and other curved shapes must overshoot flat shapes slightly to appear the same size. A circular avatar next to a square thumbnail of identical measured height reads as smaller.
- **Punctuation and quotes at the start of a line.** Hanging them into the margin keeps the text edge optically straight.
- **Triangular and asymmetric glyphs.** Centre by visual mass, not bounding box.

The verification method is the alignment audit: trace every edge in the render and confirm that the edges the eye follows are the ones the layout intends.

## Nested Radii

An inner corner inside an outer corner must be smaller by the padding between them, or the two curves will not run parallel and the gap will visibly pinch at the corner.

```text
innerRadius = outerRadius − padding
```

When the result is zero or negative, the inner element is square. Applying the same radius to a card and to a control inside it is one of the most common and most visible craft errors. It is also mechanically detectable, which makes it a good automated check.

Keep the radius family small: typically one small value for controls, one medium for cards, one large for sheets, plus fully round for pills and avatars. A radius appearing once in a system is either a mistake or an undocumented decision.

## Elevation and Shadow

Shadow describes a light source. One interface has one light source, conventionally above and slightly forward. Every shadow must be consistent with it.

- Vertical offset is positive and grows with elevation. Horizontal offset stays at zero unless the product deliberately models an off-axis light, in which case it is the same sign and ratio everywhere.
- Blur grows faster than offset as elevation increases. Higher objects cast softer, larger shadows.
- Opacity decreases as blur increases. A large shadow at the same opacity as a small one reads as smoke.
- A realistic shadow is two layers: a tight, darker contact shadow describing occlusion near the object, and a wide, lighter ambient shadow. A single mid-blur shadow is the signature of unconsidered elevation.
- Shadow colour should carry the surface hue rather than being neutral black at low opacity, which greys the underlying colour and reads as dirty.
- Elevation must correspond to real layering. A card that does not float above the canvas in the interaction model should not float visually.

An elevation system needs few levels. Rest, raised, overlay, and modal are usually sufficient. More levels than distinguishable steps means the extra levels are decorative.

## Borders and Hairlines

- A border is a boundary, not decoration. If removing it does not lose information, it was decoration.
- Borders and shadows are alternative ways to separate a surface from its background. Using both on the same element is usually redundant and produces a heavy, dated edge.
- Hairlines must survive device pixel ratio. A sub-pixel border renders inconsistently across displays and produces the appearance of uneven line weight down a list.
- Border colour should be a low-contrast step of the surface colour rather than a separate grey, or the boundary will not track theme changes.

## Gradient Quality

- Gradients interpolated in sRGB pass through a desaturated middle when the endpoints differ in hue. Interpolating in a perceptual space keeps the midpoint saturated and avoids the characteristic muddy band.
- Banding appears on large, low-contrast gradients. Adding a subtle noise layer or increasing the colour distance between stops removes it.
- A gradient must have a reason: describing depth, directing attention, or expressing a brand element. A gradient applied to a surface because a flat colour looked plain is decoration and is rejected by the anti-generic constraints.

## Imagery and Icons

- Icons within a family share stroke weight, terminal style, corner treatment, and optical size. Mixing families is visible immediately even to untrained viewers.
- Optical size matters more than bounding box. A 24 px bounding box containing a 16 px glyph sits next to a 24 px bounding box containing a 22 px glyph as an obvious inconsistency.
- Image crops must preserve the subject's focal point across every aspect ratio the layout produces. Verify at the narrowest and widest rendered ratio, not only at the design ratio.
- Photographic treatment — colour grading, contrast, grain, and overlay — must be consistent, or the product reads as assembled from stock sources.
- Images require intrinsic dimensions in markup so that layout does not shift during load. This is both a craft and a performance concern.

## Micro-Typography

- Use tabular figures wherever numbers are compared vertically or update in place. Proportional figures in a table cause columns to shimmer and misalign.
- Headline-sized text needs tighter tracking than body text; small text and uppercase text need looser tracking. A single tracking value across the scale is visible at the extremes.
- Use true typographic characters: correct quotation marks, apostrophes, en dashes for ranges, em dashes or spaced en dashes for interruptions, and a multiplication sign rather than the letter x for dimensions.
- Prevent single-word final lines in headlines by binding the last two words with a non-breaking space.
- Avoid faux bold and faux italic. Synthesized weights are visibly distorted; load the real weight or change the design.
- Do not hyphenate or justify short measures. Justified text at narrow widths produces uneven word spacing that damages fluency.

## Verification

Craft defects that are mechanically detectable should be detected mechanically rather than reviewed by eye. The following are available through the aesthetic audit surface:

| Defect | Detection |
|---|---|
| Non-nesting radii | Compare parent radius, padding, and child radius |
| Inconsistent shadow light source | Compare horizontal offset sign and offset-to-blur ratio across the shadow set |
| Single-layer shadows at high elevation | Count shadow layers per elevation level |
| Off-scale spacing values | Compare observed spacing against the declared spacing scale |
| Near-miss type sizes | Detect adjacent scale steps below the minimum distinguishable ratio |
| Redundant border plus shadow | Detect elements carrying both on the same edge |
| Excess radius or elevation vocabulary | Count distinct values against the policy maximum |

Everything else in this reference is reviewed visually against a current render and reported with region, expected condition, and observed condition.

## Related

- `references/aesthetic-principles.md` — the perceptual model these details serve.
- `references/color-system-and-perception.md` — perceptual colour handling for gradients and shadows.
- `references/typographic-system-quality.md` — the type scale that micro-typography operates inside.
- `references/design-token-drift.md` — how these values are detected as tokens.
