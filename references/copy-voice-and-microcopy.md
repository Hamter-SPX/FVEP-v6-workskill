# Copy Voice and Microcopy

## Purpose

Text is most of what a user actually reads, and it is reviewed here only for correctness — whether labels are accurate, whether data is right, whether error messages map to real failures. Correct copy in the wrong register still damages the product: a precise error message written in bureaucratic language undermines a friendly product, and a playful confirmation on a destructive action undermines trust.

This reference defines voice as a small set of positions, matching the personality axes, and specifies the microcopy patterns where those positions become visible.

## Voice Axes

Voice is the verbal expression of the personality profile. It should be derived from that profile, not chosen separately.

| Axis | One end | Other end |
|---|---|---|
| Person | Second person, direct address, contractions | Impersonal, subject-free, no contractions |
| Register | Everyday vocabulary, short sentences | Domain terminology, precise qualification |
| Density | Minimal words, labels over sentences | Fuller explanation, more context inline |
| Certainty | Definite statements | Hedged and qualified where accuracy demands it |
| Humour | Occasional levity in safe moments | None |

Voice is constant across the product. Tone varies by moment, following the state table in `references/brand-personality-and-tone.md`.

## Microcopy Patterns

### Buttons and Actions

- Label the outcome, not the mechanism. "Save changes" beats "Submit"; "Create project" beats "OK".
- The label must match the heading of the thing it acts on, so the user can connect the two.
- Confirmation dialogs use verbs on both options. "Delete project" and "Keep project" are unambiguous where "Yes" and "No" require re-reading the question.
- Destructive labels name the object and the consequence.
- Never use "Click here". The label is the link.

### Headings

- A heading states what the section contains, not what the feature is called internally.
- Headings should be scannable in isolation: a user reading only headings should understand the page structure.
- Sentence case reads faster than title case for interface text and is more forgiving of long labels.

### Form Labels and Help

- Labels are persistent and visible. Placeholder text is not a label — it disappears on focus, fails accessibility, and is frequently mistaken for a filled value.
- Help text appears before the user makes the mistake, not only after. If a password has requirements, state them before the first attempt.
- Optional fields are marked rather than required ones when most fields are required, and the reverse when most are optional. Mark the minority.
- Do not explain the obvious. A field labelled "Email" does not need help text saying "Enter your email."

### Errors

An error message has three jobs: say what happened, say what it affects, and say what to do next.

- Be specific about the cause. "Something went wrong" gives the user nothing to act on.
- Never blame the user. "That email is already registered" rather than "You entered an invalid email."
- Never expose internal identifiers, stack traces, or raw codes as the primary message. A correlation identifier for support is useful as secondary text.
- Place the message where the problem is. A field error belongs at the field; a form-level error belongs at the form.
- If recovery is possible, the message contains the recovery action.

### Empty States

- Say what belongs here and why it is empty.
- Distinguish "you have not created anything yet" from "your filter matched nothing" from "this failed to load." These are three different situations with three different actions and they are frequently collapsed into one generic message.
- Offer the action that resolves the emptiness.
- Do not apologise for an empty state that is simply the starting condition.

### Loading and Progress

- Where progress is measurable, show real progress.
- Where it is not, show activity without a fabricated percentage. A progress bar that does not track real work is a lie the user will notice.
- For long operations, say what is happening and whether they can leave.

### Confirmations

- Confirm proportionately. A saved field does not need a celebration.
- Confirm where the action happened, not in a corner of the screen.
- Confirmation should be dismissible and should not block the next action.

### Numbers, Dates, and Units

- Format numbers for the reader's locale, and use tabular figures wherever they are compared.
- Relative time is friendlier for recent events; absolute time is required for anything auditable. Show both where the distinction matters, typically relative text with an absolute value on hover or as secondary text.
- Always state units. A bare number in a metrics context is ambiguous.
- Truncate long values in a way that preserves the identifying part, and make the full value retrievable.

## Content Realism

Placeholder content that is shorter, tidier, and more uniform than reality hides most layout defects. Copy review therefore requires realistic content:

- Real-length strings, including the longest plausible values.
- Real data distributions, including zero, one, very many, and error rows.
- Real names, including those that are long, non-Latin, or contain characters that affect wrapping.
- Real numbers, including negatives, very large values, and missing values.

Lorem ipsum and clean sample data are acceptable during exploration only, and never in an artifact submitted for visual acceptance.

## Localization Constraints

- Text expands substantially in translation. Layouts tuned to English string lengths break, and the failure appears as wrapping, truncation, and misalignment rather than as a text defect.
- Do not assemble sentences from concatenated fragments; grammar and word order differ across languages.
- Avoid embedding meaning in word order or in idioms that will not survive translation.

## Evaluation Rubric

Score from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.

| Dimension | 5 means |
|---|---|
| Voice consistency | Every surface reads as written by one author at the declared position on each axis |
| Tone appropriateness | Register shifts correctly by state, with no levity during failure or destruction |
| Action clarity | Every control states its outcome; confirmations are unambiguous |
| Error usefulness | Errors state cause, impact, and next action without blaming the user or leaking internals |
| Content realism | Rendered content reflects real length, distribution, and edge cases |
| Formatting | Numbers, dates, and units are correctly formatted, aligned, and unambiguous |

Blockers: misleading action labels, error messages that give no path to recovery, fabricated progress, placeholder copy presented as finished content, and playful language on a destructive confirmation.

## Related

- `references/brand-personality-and-tone.md` — the personality this voice expresses and the state tone table.
- `references/experience-design-to-system-contract.md` — error classification and recovery states.
- `references/typographic-system-quality.md` — how content length interacts with measure and wrapping.
- `references/aesthetic-scoring-anchors.md` — the 0–5 anchor definitions.
