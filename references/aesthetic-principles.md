# Universal Aesthetic Principles

## Purpose

The rest of this package tells an agent what to reject. This reference tells it what to build toward. Anti-generic heuristics prevent the worst output; they do not produce work that people find attractive. A positive model is required so that visual judgment is reproducible rather than a matter of the reviewing agent's mood.

The model here is deliberately universal. It describes perceptual and cognitive regularities that hold across products, audiences, and eras, so it stays valid without trend data or audience research. Audience-specific and brand-specific direction sits on top of this layer and may never contradict it.

## Why Humans Perceive Something as Well Designed

Three mechanisms explain most of the reaction people label as taste.

**Processing fluency.** People experience the ease of decoding an image as a property of the image. An interface that resolves quickly into structure feels calm, competent, and trustworthy. One that requires effort to parse feels cheap even when every individual element is well made. Fluency is the single largest lever on perceived quality, and it is measurable: how long does it take to name the primary action, the content type, and the reading order.

**Perceptual organization.** Vision groups before it reads. Proximity, similarity, continuity, closure, and common region decide what belongs together, and they decide it faster than any label. When grouping produced by spacing and alignment agrees with the logical structure of the content, the design feels ordered. When they disagree, the user feels friction they cannot name and attributes it to the product.

**Typicality with controlled novelty.** Preference peaks where a design is as novel as possible while remaining recognizable. Pure convention reads as forgettable; unanchored novelty reads as broken. The resolution is to keep structure conventional and place novelty in a small number of deliberate positions.

Aesthetic judgment in this package is therefore not "what the reviewer likes." It is whether these three mechanisms are satisfied, and each has an observable test.

## The Seven Principles

Every principle below has a failure mode in both directions. Overcorrection is as much a defect as neglect.

### 1. Fluency

Structure must resolve before detail. A viewer should identify the region layout, the primary task, and the reading order before noticing any styling decision.

- Too little: competing entry points, unclear reading order, decoration that outranks content.
- Too much: a layout so uniform that nothing is emphasized and scanning has no anchor.

### 2. Grouping

Related things must look related through position and alignment before any container, border, or background is introduced.

- Too little: uniform spacing between all elements so the viewer must read labels to infer structure.
- Too much: nested containers that box every group, producing visual noise and wasted edge space.

Space is the primary grouping tool. A border or surface is justified only when proximity and alignment cannot express the relationship, most often when groups interleave or when a region genuinely floats above the page.

### 3. Balance

Visual weight must be distributed so the composition does not feel like it is tipping. Weight is driven by size, contrast, colour saturation, density, and isolation — not by area alone. A small, high-contrast element balances a large, low-contrast one.

- Too little: heavy elements clustered on one side with empty space opposite, reading as an unfinished layout.
- Too much: mirror symmetry everywhere, which reads as static and institutional and removes hierarchy.

Asymmetric balance is usually correct for product interfaces because it permits hierarchy. Symmetry is appropriate for terminal moments such as empty states, confirmations, and authentication.

### 4. Proportion

Sizes and spaces should come from a small, coherent set of related values rather than arbitrary numbers. What matters is that the relationships are systematic and that adjacent steps are distinguishable. A scale whose steps are too close produces hierarchy the eye cannot detect; one whose steps are too far produces jumps that break continuity.

- Too little: values chosen per component, so nothing lines up across pages.
- Too much: a scale applied so rigidly that dense data regions inherit spacing meant for marketing pages.

### 5. Contrast

Difference must be large enough to read as intentional. Two type sizes that differ slightly, two greys that differ slightly, or two weights that differ slightly all read as errors rather than distinctions. When two things are different, make them clearly different; when they are the same, make them identical.

- Too little: near-miss values that look like mistakes and flatten hierarchy.
- Too much: many simultaneous accents, each demanding attention, so none wins.

A useful constraint: one dominant accent per view, with additional colours reserved for semantic status rather than emphasis.

### 6. Rhythm

Repetition of spacing, size, and structural motifs creates the sense that a page was made by one hand. Rhythm also supports scanning, because a predictable interval lets the eye move without re-orienting.

- Too little: every section spaced differently, so the page feels assembled from unrelated parts.
- Too much: identical blocks repeated without variation, which reads as templated and causes the viewer to stop reading.

Break rhythm intentionally and rarely, at the point where you want attention.

### 7. Unity with Variety

The whole must read as one system, with variation carrying meaning. Every deviation should be traceable to a reason: a different content type, a different priority, a different state.

- Too little: multiple parallel visual systems in one product, usually the trace of separate authorship.
- Too much: total uniformity, which removes the viewer's ability to tell important from routine.

## The Novelty Budget

Distinctiveness is required — an interface that could belong to any product has failed — but it must be spent deliberately.

Reserve conventional treatment for anything load-bearing: navigation patterns, form behaviour, iconography for standard actions, and the meaning of colour for status. Spend novelty on a small number of positions, typically one or two per product: a distinctive type treatment, a specific composition or grid decision, a signature data visualization, or a particular use of imagery.

Record where the novelty is spent. If it cannot be named in one sentence, the design is either generic or scattered.

## Operational Tests

These convert the principles into observations that a reviewing agent can actually perform on a rendered capture. Each test names the principle it interrogates.

| Test | Method | Reveals |
|---|---|---|
| Blur test | View the render heavily blurred | Balance, grouping, whether hierarchy survives without reading |
| Five-second test | Look, look away, state the primary task | Fluency |
| Greyscale test | Remove all colour | Whether hierarchy depends on colour alone |
| Alignment audit | Trace every vertical and horizontal edge | Grouping, unity, hidden near-miss values |
| Removal test | Delete each decorative element in turn | Whether decoration carries meaning |
| Inventory test | Count distinct type sizes, weights, colours, radii, shadows | Contrast discipline, unity |
| Interval test | Measure the gaps between sibling groups | Rhythm, whether spacing encodes structure |
| Substitution test | Replace logo and copy with another product's | Novelty budget, whether anything is specific |
| Content-pressure test | Render with the longest and shortest plausible content | Whether proportion and rhythm are real or coincidental |

A finding produced by one of these tests is observable and can be stated as expected-versus-observed. A finding that cannot be tied to a test is a preference and must be recorded as such.

## Resolving Conflicts

When principles collide, apply this order:

1. Accessibility and task completion.
2. Fluency — the primary task must remain immediately identifiable.
3. Grouping — structure must match content.
4. Contrast and balance.
5. Rhythm, proportion, and unity.
6. Novelty.

Novelty is last. A distinctive design that costs the user comprehension is not a trade-off, it is a defect.

## What This Does Not License

These principles justify a design decision; they do not justify a change without evidence. A finding must still name the region, the observed condition, the expected condition, and the principle violated. "This feels unbalanced" is not reviewable. "The right column carries all high-contrast elements while the left half is empty below the fold, so the composition reads as unfinished at 1440 width" is.

Nor do these principles override an approved design contract. When the contract deliberately violates a principle, the deviation is recorded with its reason and is not a finding.

## Related

- `references/aesthetic-scoring-anchors.md` — how to convert these judgments into 0–5 ratings.
- `references/visual-craft-standards.md` — the micro-level execution these principles depend on.
- `references/anti-generic-design.md` — the negative constraints that complement this model.
- `references/design-evaluation-rubric.md` — the structural review criteria.
