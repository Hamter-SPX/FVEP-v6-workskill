# Aesthetic Direction Prompt

You are establishing the declared visual character for a product surface, before any implementation begins.

## Prerequisite

If `references/visual-direction-exploration.md` applies (screenshot redesign, restyle request, or missing profile for a new visual direction), complete that protocol first — including a numbered user choice, a written `visual-direction-spec.md`, and an explicit **เริ่มเขียน** confirm — before continuing here. Use `prompts/visual-direction-exploration.md` for those turns.

## Required Method

1. **Inspect first.** Find the existing design system, tokens, typefaces, component library, and any prior direction. A product with an established system has already made most of these decisions. Overriding one requires an explicit reason. If a visual option was selected, treat that image plus the reference screenshot as binding direction evidence.
2. **State the positions.** Take a position from 1 to 5 on each axis in `references/brand-personality-and-tone.md`: serious to playful, warm to clinical, understated to expressive, dense to spacious, established to novel. Each position needs a reason grounded in the task and the stakes, and a list of design consequences you accept. When an exploration option was chosen, the positions must match that thesis.
3. **Spend the novelty budget.** Name at most three positions where this product will be distinctive, and say what the decision is at each. Everything load-bearing stays conventional.
4. **Declare the systems.** State the intended shape of the colour, type, spacing, shape, and motion systems: neutral temperature and step count, accent count, harmony, type scale ratio and role count, maximum measure, spacing base unit and scale, radius family, elevation levels, duration families, easings, and reduced-motion support.
5. **Name the style parameters.** You may cite an archetype from `references/visual-style-lexicon.md`, but only alongside the specific parameters you adopt from it and the ones you reject. The archetype is never the thesis.
6. **Set the voice.** Take a position on each axis in `references/copy-voice-and-microcopy.md`, and state the required tone for first run, empty, waiting, error, destructive confirmation, and success.
7. **Record non-goals.** Name the directions you rejected (including the unchosen exploration options), so they are not rediscovered later.

## Output

Valid JSON against `schemas/aesthetic-profile.schema.json`, followed by a short prose summary of the direction and the single sentence that states where the novelty is spent. If exploration ran, include which option number was selected and the chosen image filename in the prose summary.

## Quality Bar

Every entry must be falsifiable. A reviewer looking at a screenshot must be able to say whether the artifact matches. Rewrite any entry that cannot be checked.

## Prohibitions

- Do not use unconstraining terms such as modern, clean, premium, sleek, elegant, or professional as direction.
- Do not name a style archetype as the visual thesis.
- Do not declare a position that compromises accessibility or task clarity.
- Do not spread the novelty budget across many positions; that reads as inconsistency rather than character.
- Do not invent a direction when an established system already answers the question.
- Do not skip visual direction exploration when the user sent a redesign screenshot and no profile exists yet.
