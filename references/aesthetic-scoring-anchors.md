# Aesthetic Scoring Anchors

## Purpose

The semantic visual review rates eight dimensions from 0 to 5 but defines only what 5 means. Everything between 0 and 4 is left to the reviewer, which makes scores unstable across agents and across sessions, and makes a threshold policy meaningless. A reviewer who reads "5 means the primary task is immediately clear" has no basis for choosing between 2 and 3 when it partly is.

This reference supplies the missing anchors. It defines a general scale, then per-dimension anchors for the aesthetic review, then the rules for converting scores into a decision.

## The General Scale

Every rating uses the same underlying meaning. The dimension-specific tables below are instances of it.

| Score | Meaning | Action implied |
|---|---|---|
| 5 | Exemplary. Fully satisfies the dimension. No observable defects. Could be used as a reference for other work. | None |
| 4 | Sound. Satisfies the dimension. Minor observations exist but none changes meaning, hierarchy, or task completion. | Optional refinement |
| 3 | Acceptable with defects. Works, but at least one observable defect degrades the experience without preventing the task. | Should fix before release |
| 2 | Deficient. Multiple defects, or one defect significant enough that users will notice and be slowed. | Must fix |
| 1 | Failing. The dimension is largely unaddressed. The design does not satisfy its basic requirement. | Must fix; likely rework |
| 0 | Absent or blocking. The dimension cannot be evaluated because the required work does not exist, or its state blocks task completion. | Blocker |

Two rules apply to every rating:

- **A score below 3 requires at least one recorded finding** with region, expected condition, and observed condition. A low score with no findings is an opinion.
- **A score of 5 requires that the applicable tests were actually performed**, not that no defect happened to be noticed. Naming the test in the notes is the evidence.

## Aesthetic Review Dimensions

The aesthetic review complements the semantic visual review. The semantic review asks whether the interface communicates the right thing; the aesthetic review asks whether it is well made and whether it expresses its declared character.

### Compositional Balance

Visual weight distribution, grouping, alignment discipline, and whether structure resolves before detail.

| Score | Condition |
|---|---|
| 5 | Survives the blur test with hierarchy intact; weight distributed so no region reads as tipping; few, consistent alignment edges; every element aligns to something |
| 4 | Balance holds; one or two elements align to nothing or a minor region reads slightly heavy |
| 3 | Structure is readable but a region is visibly unbalanced, or several distinct alignment edges make the layout feel loose |
| 2 | Grouping does not match content structure, or the composition reads as unfinished in a primary region |
| 1 | No discernible compositional system; elements placed independently |
| 0 | Layout is broken, overlapping, or clipped such that composition cannot be assessed |

### Craft Precision

Optical alignment, radius nesting, shadow consistency, border treatment, icon and image handling, micro-typography.

| Score | Condition |
|---|---|
| 5 | Optical corrections applied; radii nest correctly; one consistent light source with layered shadows; icons share a family and optical size; typographic characters correct |
| 4 | One or two isolated craft defects that do not repeat across the system |
| 3 | A craft defect repeats across several components, such as a radius that does not nest or an inconsistent icon optical size |
| 2 | Multiple repeating craft defects; shadows imply conflicting light sources or elevation is decorative |
| 1 | Craft is generally unaddressed; values appear chosen per element |
| 0 | Rendering artifacts prevent assessment |

### Colour System

Palette construction, perceptual evenness, semantic role assignment, contrast, theme handling.

| Score | Condition |
|---|---|
| 5 | Perceptually even neutral ramp with deliberate temperature; one dominant accent; all colour resolves through semantic roles; contrast satisfied against real rendered backgrounds; themes tuned independently |
| 4 | System is coherent; a minor contrast pair sits near its floor or one value bypasses a role |
| 3 | An uneven ramp step, a second accent competing for primary status, or a text pair below its contrast floor in a secondary region |
| 2 | Parallel colour systems present, or status conveyed by hue alone, or a primary text pair fails contrast |
| 1 | No colour system; values applied ad hoc |
| 0 | Colour renders incorrectly, or theme is broken such that the palette cannot be assessed |

### Typographic System

Scale distinguishability, role definition, line height behaviour, measure, wrapping, numeric treatment.

| Score | Condition |
|---|---|
| 5 | Small scale with clearly distinguishable steps; every size maps to a role; line height varies with size and measure; measure controlled in characters; tabular figures where compared; wrapping verified under content pressure |
| 4 | System is sound; one near-miss pair or one region exceeding comfortable measure |
| 3 | Several sizes without clear roles, a constant line height across the scale, or long-form measure materially over the comfortable range |
| 2 | Scale steps largely indistinguishable, or hierarchy unreadable, or wrapping breaks under realistic content |
| 1 | No type system; sizes chosen per component |
| 0 | Text is unreadable, missing, or the font failed to load such that typography cannot be assessed |

### Spatial Rhythm

Spacing scale conformance, proximity grouping, nesting, whitespace purpose, vertical rhythm, responsive spacing.

| Score | Condition |
|---|---|
| 5 | All spacing resolves to the scale; between-group gaps clearly exceed within-group gaps everywhere; nesting decreases spacing; intervals repeat; macro spacing compresses at narrow widths |
| 4 | One or two off-scale values, or a single group whose spacing ratio is ambiguous |
| 3 | Off-scale values recur, or a form or list has ambiguous proximity grouping, or whitespace is present without structural purpose |
| 2 | Proximity grouping inverted in a primary region, or density inappropriate to the task |
| 1 | No spacing system; gaps chosen per element |
| 0 | Spacing collapse, overflow, or overlap prevents assessment |

### Motion Quality

Purpose, timing, easing, choreography, interruption, reduced-motion parity, performance.

| Score | Condition |
|---|---|
| 5 | Every animation serves a defined function; duration scales with distance; easing matches direction; choreography preserves hierarchy; interruption reverses from current state; reduced motion implemented and reviewed; frame rate holds |
| 4 | Motion is sound; one transition uses a duration or curve slightly out of family |
| 3 | A single easing curve applied across all motion, or an entrance and exit that do not differentiate, or unbounded stagger |
| 2 | Decorative motion without function, non-interruptible motion on a frequent action, or animation of layout properties causing visible frame drops |
| 1 | Motion largely unconsidered or absent where continuity requires it |
| 0 | Motion blocks input, hides a required state, or reduced-motion handling is absent |

Where a surface genuinely has no motion by design, record the dimension as not applicable rather than scoring it.

### Brand Expression

Whether the artifact expresses its declared personality profile, and whether the novelty budget is spent deliberately.

| Score | Condition |
|---|---|
| 5 | Render matches the declared position on every personality axis; the novelty budget is spent in identifiable positions; the product survives the substitution test |
| 4 | Character is present and consistent; one surface sits slightly off the declared position |
| 3 | Character is present but inconsistent across routes, or the distinguishing decision is weak |
| 2 | Render does not express the declared profile, or personality varies by which surface was built when |
| 1 | No discernible character; the design would suit any product in any category |
| 0 | No personality profile declared, so expression cannot be evaluated |

### Copy Voice

Voice consistency, tone by state, action clarity, error usefulness, content realism, formatting.

| Score | Condition |
|---|---|
| 5 | One consistent voice at the declared positions; tone shifts correctly by state; actions state outcomes; errors give cause, impact, and next action; content is realistic; numbers, dates, and units correctly formatted |
| 4 | Voice is consistent; one label or message sits slightly off register |
| 3 | Voice varies noticeably between surfaces, or a generic error message appears, or empty-state variants are collapsed into one |
| 2 | Multiple misleading or mechanism-named actions, or errors without recovery paths, or placeholder copy in a reviewed artifact |
| 1 | Copy largely unconsidered; labels internal or inconsistent throughout |
| 0 | Fabricated progress, misleading destructive labels, or messaging that blocks recovery |

## Weighting and Decision

Dimensions are not equally important. Default weights, adjustable by policy:

| Dimension | Weight |
|---|---|
| Compositional balance | 1.5 |
| Typographic system | 1.5 |
| Spatial rhythm | 1.5 |
| Colour system | 1.5 |
| Craft precision | 1.0 |
| Motion quality | 1.0 |
| Brand expression | 1.0 |
| Copy voice | 1.0 |

The weighted score is the weighted mean of the ratings expressed as a percentage of the maximum. Approval requires all of:

- no blockers recorded;
- no dimension scored below the configured floor, which defaults to 3;
- the weighted score at or above the configured minimum;
- every required case reviewed;
- the review bound to the current artifact and configuration.

A high weighted average never compensates for a dimension below its floor. Averaging is how a serious single defect disappears into an acceptable-looking number.

## Residual Deviations

A defect may be accepted without being fixed when it is recorded with its exact region, the observable difference, the user impact, the reason acceptance is safe, and whether the same deviation repeats system-wide. A deviation that repeats system-wide is not residual; it is a system defect and must be raised in severity.

## Related

- `references/aesthetic-principles.md` — the principles and tests these dimensions measure.
- `references/semantic-visual-review.md` — the complementary semantic review.
- `references/motion-quality-standards.md` — the motion rubric in full.
- `references/copy-voice-and-microcopy.md` — the copy rubric in full.
