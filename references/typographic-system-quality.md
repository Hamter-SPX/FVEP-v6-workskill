# Typographic System Quality

## Purpose

Typography carries most of the content and therefore most of the perceived quality. It is also the dimension where small systematic errors compound fastest: a scale with indistinguishable steps, a line height that ignores size, or a measure that runs too wide will degrade every screen in the product simultaneously.

This reference defines what a good type system looks like structurally, so it can be evaluated without reference to a specific typeface.

## The Scale

A type scale is a small set of sizes with a consistent relationship. Two properties determine whether it works.

**Step distinguishability.** Adjacent steps must differ enough that the difference reads as intentional. A ratio near 1.0 between neighbouring sizes produces hierarchy the eye cannot detect, and the result looks like an error rather than a level. As a working floor, adjacent steps should differ by at least about 12 percent, and the steps that carry real hierarchy — body against section heading, section heading against page title — should differ considerably more.

**Step count.** Most products need five to seven sizes. Beyond that, the extra sizes are not carrying distinct roles and will be applied inconsistently. A system with a dozen sizes in the render is almost always the trace of per-component decisions rather than a system.

Ratio-based scales are the common construction: each step multiplies the previous by a fixed ratio. Smaller ratios suit dense, information-heavy products where many levels must coexist; larger ratios suit editorial and marketing surfaces with few levels and strong contrast. A single ratio applied from caption to hero often produces a display size that is too large or a caption that is too small, so scales are frequently ratio-based in the body range and hand-tuned at the extremes. That is acceptable when the tuned values are documented; it is a defect when it happens per component.

## Roles

Sizes are not the system. Roles are. Each role fixes size, weight, line height, tracking, and colour role together:

- Display or hero, used at most once per view.
- Page title.
- Section heading.
- Subsection or card heading.
- Body.
- Secondary or supporting body.
- Caption, label, and metadata.
- Numeric and data.

A design that lists sizes but not roles will drift, because the next component author must guess which size means "section heading."

Weight participates in hierarchy alongside size. Two levels can be distinguished by weight at the same size, which is often better in dense interfaces than adding another size. Weight steps must also be distinguishable: adjacent weights that differ slightly read as a rendering artifact.

## Line Height

Line height is a function of size and measure, not a constant.

- Large text needs proportionally tighter line height. A display size at body line height looks loose and disconnected.
- Small text needs proportionally looser line height to stay readable.
- Longer measures need more line height so the eye can find the next line start.

As practical ranges: display and headline text sits near 1.1–1.25, body text near 1.5–1.65, and dense UI labels near 1.3–1.4. A single line-height multiplier applied across the whole scale is visible at both ends.

Line height must also participate in the vertical spacing system. If line boxes do not resolve to values compatible with the spacing scale, every text block will introduce a small offset that breaks alignment across columns.

## Measure

Measure is the line length in characters. Comfortable continuous reading sits between roughly 45 and 75 characters; beyond about 85 the eye loses the line return and comprehension drops.

- Long-form content must be constrained by a maximum width expressed in characters rather than pixels, so it holds across type sizes.
- Interface text in wide layouts is the most common violation: a description that spans a full 1440-pixel container will exceed 120 characters and read poorly even though nothing appears broken.
- Very short measures, below about 35 characters, force excessive hyphenation and ragged spacing.

## Rag and Wrapping

- Left-aligned text with a ragged right edge is the default. The rag should be soft and irregular; a rag that forms a shape or produces a sequence of near-equal lines draws attention.
- Headlines wrap at meaningful points. A headline that breaks between an article and its noun reads as an accident. Balanced wrapping or explicit break control is warranted for short, prominent text.
- A single word alone on the final line of a paragraph or headline is a defect and is fixed by binding the last two words.
- Text must be verified at the longest and shortest plausible content, and in every supported language. Layouts tuned to one string length break under real content.

## Pairing

Most products need one typeface. A second is justified when two content types genuinely differ in function — for example a text face for reading and a monospace face for code and identifiers.

When pairing, the two faces should either clearly contrast in classification or share a designer or skeleton. Two similar-but-different faces read as a mistake. Pairs must also be checked for matching x-height and apparent size, because two faces at the same nominal size frequently do not look the same size, requiring an optical size adjustment.

Variable fonts reduce the loading cost of multiple weights and permit optical size axes that adjust letterforms for their rendered size. Where an optical size axis exists, use it rather than scaling a single design across the whole range.

## Fallbacks and Loading

- The fallback stack must have metrics close to the web font, or the layout will shift when the font loads.
- Font loading strategy must not produce invisible text during load on the primary content.
- Numeric-heavy interfaces must specify tabular figures explicitly, since most faces default to proportional figures.

## Evaluation Checklist

- Are adjacent scale steps clearly distinguishable, with no near-miss pairs?
- Is the number of distinct sizes in the render small enough to be a system?
- Does every size correspond to a named role?
- Does line height vary with size and measure rather than being constant?
- Is long-form measure constrained in characters, and does interface text avoid running to full container width?
- Do headlines wrap at meaningful points, with no single-word final lines?
- Are numbers tabular wherever they are compared or updated in place?
- Does the layout survive the longest plausible string in every supported language?
- Do fallback metrics prevent a visible shift on font load?

## Related

- `references/aesthetic-principles.md` — contrast and proportion as perceptual principles.
- `references/visual-craft-standards.md` — micro-typography details.
- `references/spatial-composition-and-rhythm.md` — how line boxes interact with the spacing scale.
- `references/design-evaluation-rubric.md` — the structural typography criteria.
