# Visual Style Lexicon

## Purpose

This package prohibits style labels as design theses, and that prohibition stands: "make it modern and premium" is not a design direction because it constrains nothing and cannot be reviewed. But the absence of any shared vocabulary has its own cost. Agents cannot describe an existing design's character, cannot discuss a reference precisely, and cannot detect that a product has drifted into a style it never chose.

This lexicon resolves the tension by defining each archetype through its **measurable signature** rather than its mood. An archetype is a bundle of specific parameter positions. Used that way, "editorial" is a testable claim about type scale, measure, and grid, not a vibe.

## Rules of Use

1. An archetype is never a design thesis on its own. The thesis states how hierarchy, density, typography, and interaction express this product. The archetype is shorthand for the parameter bundle the thesis implies.
2. An archetype may be cited in a design contract only alongside the specific parameters adopted from it and the ones rejected.
3. Archetypes are descriptive when reviewing an existing artifact or reference, and prescriptive only after being decomposed into parameters.
4. No archetype overrides accessibility, task clarity, or the universal aesthetic principles.

## Archetypes

### Swiss / International

**Signature.** Strict modular grid with visible column structure. Neutral grotesque type with a small number of sizes and heavy reliance on weight and size contrast. Flat surfaces, minimal or no elevation. Asymmetric balance. Colour restricted to black, white, and one accent. Generous but strictly systematic spacing.

**Suits.** Content-led products, documentation, tools where clarity is the product.

**Failure mode.** Cold and undifferentiated; without a distinctive type choice or one strong composition decision, it reads as a default template rather than a choice.

### Editorial

**Signature.** Large type-scale ratio with a dominant display size, often a serif or a distinctive display face. Measure strictly controlled, typically 60–75 characters. Asymmetric multi-column composition with deliberate overlaps and crops. Large imagery. Whitespace used as pacing between sections rather than uniformly.

**Suits.** Marketing surfaces, long-form content, product storytelling.

**Failure mode.** Applied to dense functional interfaces, its scale and spacing push controls below the fold and make routine tasks slow.

### Neo-Minimal

**Signature.** Very small vocabulary: two to three type sizes, a mostly neutral palette with one accent, one radius, one or two elevation levels. Structure carried almost entirely by spacing and alignment. Motion limited to opacity and small translation.

**Suits.** Products where the content or data is the interest and the interface should recede.

**Failure mode.** Under-differentiated states and weak affordances. Minimalism frequently removes the contrast that hierarchy and interaction feedback depend on, so it must be checked hard against the greyscale and interaction-state tests.

### Utilitarian / Dense Professional

**Signature.** High information density, small type, tight row heights, rules and borders rather than whitespace for separation, tabular figures throughout, minimal radius, minimal elevation, keyboard-first interaction, colour reserved almost entirely for status.

**Suits.** Monitoring, trading, administration, developer tooling, anything used for hours at a time by trained users.

**Failure mode.** Illegible at small sizes, insufficient touch targets on any touch surface, and hostile to occasional users.

### Brutalist

**Signature.** Exposed structure, raw system or monospace type, hard edges with zero radius, high-contrast unmodulated colour, visible borders and rules, deliberate rejection of decoration and of comfortable spacing.

**Suits.** Products whose audience values directness and anti-commercial signalling; developer and creative tools; deliberate differentiation in a category of soft, rounded competitors.

**Failure mode.** Frequently trades accessibility for attitude. Contrast, focus visibility, and target size must be verified explicitly rather than assumed, because the style's visual language resembles unstyled markup.

### Soft / Rounded

**Signature.** Large radii throughout, warm-tinted neutrals, soft multi-layer shadows, generous padding, humanist or rounded type, springy motion with visible overshoot, illustration rather than photography.

**Suits.** Consumer products, education, health and wellbeing, anything reducing user anxiety.

**Failure mode.** The most common destination of unexamined defaults. Everything inside a rounded card with a soft shadow is the canonical generic output this package rejects. Using this archetype requires a specific reason and at least one differentiating decision.

### Glass / Translucent Layering

**Signature.** Backdrop blur with partial transparency, layered planes, luminous borders, saturated backgrounds showing through, strong dependence on depth ordering.

**Suits.** Overlay surfaces above rich content, media applications, environments where the layer beneath carries meaning.

**Failure mode.** Contrast becomes dependent on unpredictable background content, so text legibility cannot be guaranteed. Backdrop blur is expensive to render. Applied to an entire interface rather than to overlays, it is decorative and fails the anti-generic constraints.

### Bento / Modular Grid

**Signature.** Grid of variably sized rectangular cells with consistent gaps and radii, each cell holding one self-contained idea; cell size encodes importance.

**Suits.** Feature overviews, dashboards, summary surfaces where items are genuinely parallel.

**Failure mode.** Imposes equivalence on items that are not equivalent, and its uniform rhythm removes hierarchy. Requires deliberate size variation to carry priority, or it flattens into wallpaper.

### Retro-Digital

**Signature.** Monospace or pixel type, terminal colour conventions, visible cursors, scanline or CRT texture, high-contrast limited palette, deliberately mechanical motion.

**Suits.** Developer tools, technical products with a strong community identity, products deliberately signalling craft over polish.

**Failure mode.** Legibility at small sizes and in long-form reading; frequently fails contrast in its darker variants.

## Detecting Drift

An artifact can be measured against these signatures automatically using observable values — radius distribution, elevation count, chroma range, type-scale ratio, information density, and border-versus-whitespace separation. The purpose is not to score the product against a style but to answer two questions:

- **Is the artifact close to a declared archetype?** If a contract declares utilitarian density and the render measures as soft and spacious, the implementation has drifted from its direction.
- **Has the artifact fallen into an undeclared archetype?** A product with no stated direction that measures as soft-rounded has almost certainly arrived there by default rather than by decision, which is exactly what the anti-generic constraints exist to catch.

The classification is evidence for a review conversation, never an automatic verdict. Products legitimately blend archetypes — a utilitarian data core with an editorial marketing surface is a normal and correct combination.

## Related

- `references/aesthetic-principles.md` — the constraints every archetype must satisfy.
- `references/brand-personality-and-tone.md` — the axes an archetype expresses.
- `references/anti-generic-design.md` — the default patterns this vocabulary helps name.
- `references/design-director.md` — the prohibition on style labels as theses.
