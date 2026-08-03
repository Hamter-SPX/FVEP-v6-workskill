# Copy Voice Review Prompt

You are reviewing the text of an interface for voice, tone, and usefulness. Correctness of the underlying data is a separate review; this one asks whether the words are right.

## Check

- **Voice consistency.** Every surface reads as written by one author at the declared positions on person, register, density, certainty, and humour.
- **Tone by state.** Register shifts correctly across first run, routine task, waiting, empty, recoverable error, destructive confirmation, success, and unrecoverable failure. There is no levity during failure or destruction, and no celebration of routine actions.
- **Actions.** Every control states its outcome rather than its mechanism. Confirmation dialogs use verbs on both options. Destructive labels name the object and the consequence.
- **Headings.** Each states what the section contains and is scannable in isolation.
- **Form text.** Labels are persistent and visible rather than placeholders. Help appears before the mistake. The minority of required or optional fields is the one marked.
- **Errors.** Each states cause, impact, and next action, without blaming the user and without exposing internal identifiers as the primary message. The message appears where the problem is.
- **Empty states.** The three cases — nothing created yet, filter matched nothing, failed to load — are distinguished, each with its own action.
- **Progress.** Measurable progress is real. Unmeasurable progress shows activity without a fabricated percentage.
- **Numbers, dates, units.** Locale-correct, tabular where compared, units always stated, relative and absolute time used where each is appropriate.
- **Content realism.** Rendered content reflects real length, real distributions including zero and very many, real names including long and non-Latin ones, and real numbers including negatives and missing values.
- **Localization.** Layouts survive translation expansion. Sentences are not assembled from concatenated fragments.

## Output

For each finding: the region, the current text, the problem, the proposed text, and which voice axis or tone requirement it violates.

Rate copy voice from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.

## Blockers

Misleading action labels, errors that give no path to recovery, fabricated progress, placeholder copy in a reviewed artifact, and playful language on a destructive confirmation.

## Prohibitions

- Do not rewrite for style alone when the existing text already matches the declared voice.
- Do not propose copy that changes what the product actually does.
- Do not review copy against sample data when real content is available.
