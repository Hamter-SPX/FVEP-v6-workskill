# Brand Personality and Emotional Tone

## Purpose

The design contract already requires a visual thesis. What it has not required is a statement of the character that thesis expresses. Without it, "emotional and brand character" remains an unexamined phrase and every downstream decision — type weight, corner radius, motion energy, copy register — is made by default rather than by intent.

This reference makes personality specifiable as a small set of positions on named axes, each with concrete design consequences, so that two agents given the same profile produce compatible work and a reviewer can say whether an artifact matches its declared character.

Personality is a design input, not a design goal. It never outranks task clarity or accessibility.

## The Axes

Each axis is a continuum. Take a position on each, and state it as a value rather than an adjective, because adjectives are where design direction goes vague.

### Serious ←→ Playful

How much levity the product permits.

| | Serious | Playful |
|---|---|---|
| Type | Restrained weights, tight tracking, few sizes | Wider weight range, expressive display face |
| Shape | Small radii or square corners | Large radii, rounded and organic forms |
| Colour | Restrained chroma, few accents | Higher chroma, wider accent range |
| Motion | Minimal, functional, low overshoot | Springy, visible overshoot, expressive stagger |
| Copy | Direct and declarative | Conversational, occasional humour |
| Illustration | Diagrammatic or none | Character-driven, colourful |

### Warm ←→ Clinical

How much human presence the surface conveys.

| | Warm | Clinical |
|---|---|---|
| Neutrals | Warm-tinted greys | Cool or pure neutral greys |
| Type | Humanist letterforms, generous line height | Geometric or grotesque, tighter line height |
| Imagery | People, hands, physical texture | Diagrams, abstractions, product surfaces |
| Density | More generous spacing | Tighter, more information per screen |
| Copy | Second person, contractions | Precise, impersonal, terminology-first |

### Understated ←→ Expressive

How much visual force the design applies.

| | Understated | Expressive |
|---|---|---|
| Contrast | Narrow range, small accents | Wide range, large accent surfaces |
| Type scale | Small ratio, few levels | Large ratio, dominant display sizes |
| Surface | Flat, minimal elevation | Gradients, layering, texture |
| Composition | Regular grid | Asymmetry, overlap, deliberate crops |

### Dense ←→ Spacious

How much information is presented at once. This axis is largely determined by the task rather than chosen freely: monitoring and professional tools need density; onboarding and decision moments need space.

### Established ←→ Novel

How much the design relies on convention. This is the novelty budget from `references/aesthetic-principles.md` expressed as a position. Established products in high-stakes categories should sit conservatively; the position determines how much of the interface may depart from convention, not whether the departure is allowed.

## Emotional Tone by State

Personality is constant. Tone varies by moment, and this is where most products are inconsistent — a friendly product that turns bureaucratic the moment something fails has not designed its tone.

| Moment | Required tone | Design consequence |
|---|---|---|
| First run | Welcoming, low demand | Progressive disclosure, one visible next step, no upfront configuration wall |
| Routine task | Invisible | No celebration, no interruption, minimal motion |
| Waiting | Honest | Real progress where measurable; never a fabricated percentage |
| Empty | Instructive, not apologetic | Explain what belongs here and offer the action that creates it |
| Recoverable error | Calm and specific | State what happened, what it affects, and the exact next action; never blame the user |
| Destructive confirmation | Serious and unambiguous | Name the object and the consequence; require deliberate confirmation; no playful language |
| Success on a significant action | Proportionate acknowledgement | Confirm and move on; reserve celebration for genuinely significant completions |
| Unrecoverable failure | Accountable | Say what is known, what is not, and how to get help or preserve work |

Two rules govern all of these. Never celebrate routine actions — repeated congratulation becomes noise and then irritation. Never turn playful during failure or destruction; levity at those moments reads as not taking the user's situation seriously.

## Writing the Profile

A personality profile states a position on each axis, the reason, and the specific consequences accepted. It must be falsifiable: a reviewer should be able to look at a render and say whether it matches.

Weak: "Modern, clean, and professional with a friendly touch."

Usable: "Serious 4 of 5 and clinical 4 of 5, because users are reviewing financial reconciliations where errors are expensive and a casual surface would undermine confidence. Consequences: neutral cool greys, one restrained accent used only for the primary action, small radii, tabular figures throughout, motion limited to feedback and continuity with no overshoot, copy in precise domain terminology without contractions. Warmth appears only in onboarding and empty states."

The second version can be checked against a screenshot. The first cannot.

## Conflicts

Personality yields to everything above it:

1. Accessibility and task completion.
2. The universal aesthetic principles.
3. Personality and brand.
4. Novelty and expression.

A playful position does not license low contrast. A clinical position does not license hostile error messages. When a personality decision would violate a higher level, record the conflict and resolve it in favour of the higher level.

## Evaluation Checklist

- Does the design contract state a position on each axis, with reasons?
- Are the consequences specific enough to check against a render?
- Does the rendered artifact actually express the declared position, or is the profile aspirational?
- Is personality consistent across routes, or does it vary by which surface was built when?
- Does tone shift correctly by state, including failure and destructive moments?
- Does any personality decision compromise accessibility or task clarity?

## Related

- `references/aesthetic-principles.md` — the layer personality sits on top of.
- `references/visual-style-lexicon.md` — style archetypes and their measurable signatures.
- `references/copy-voice-and-microcopy.md` — the verbal expression of the same personality.
- `references/design-director.md` — where the design contract is authored.
