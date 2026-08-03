# Visual Direction Exploration Prompt

You are exploring visual direction for a product surface **before** writing an aesthetic profile, design contract, plan, or implementation.

## Trigger

The user supplied UI screenshot(s) and/or asked to redesign or restyle the look. Follow `references/visual-direction-exploration.md`.

## Required Method

### Turn A — options

0. **Resolve the runtime** with `npm run direction:runtime` (or `resolveDirectionRuntime`). If `GenerateImage` / `imagegen` is in your tool list, re-run with `--image-gen true`. If not, use `--image-gen false` and follow `prose-with-gap` — never invent images.
1. **Inspect the reference.** List observed structure, critical controls, density, and constraints. Do not drop the primary task.
2. **Draft 2–3 theses** that differ on at least two personality axes from `references/brand-personality-and-tone.md`. Reject near-duplicates.
3. **Follow the runtime plan:**
   - `inline-and-gallery` — generate with the host image tool (`GenerateImage` in Cursor); show 1/2/3 in chat; optionally open the gallery.
   - `gallery-only` — generate files, then `npm run direction:gallery`; paste the `file://` link; do not drop to prose-only.
   - `prose-with-gap` — numbered theses only; state `IMAGEGEN_UNAVAILABLE`; optional placeholder gallery.
   - `ci-gate-only` — do not explore; require a confirmed spec via `direction:gate`.
4. **Present options as 1 / 2 / 3** with a one-sentence difference each.
5. **Stop.** Ask which number to use. Do not write the direction spec, profile, plan, or code in this turn.

### Turn B — after the user picks a number

1. **Always write** `design/visual-direction-spec.md` from `templates/visual-direction-spec.md` (or the project’s design-docs path).
2. Fill: selected option, what they liked (concrete), thesis, personality draft, keep/change/non-goals, linked artifact paths.
3. **Stop for confirm.** Ask them to reply with one of:
   - **เริ่มเขียน** — accept spec; next turn binds profile + contract, then plan/implement
   - **ปรับต่อ** — they name changes; run `npm run direction:iterate`, revise the `.md` only; no code
   - **เลือกใหม่** — return to Turn A
4. Do **not** implement in Turn B.

### Turn C — only after 「เริ่มเขียน」

Switch to `prompts/aesthetic-direction.md` and `agents/design-director.md`:

- Build a falsifiable aesthetic profile from the direction spec (`npm run direction:sync` may push personality / thesis / likes into `design/aesthetic-profile.json`).
- Update the design contract; link the spec path as direction evidence.
- Record `selectedOption: 1|2|3` and the chosen image filename.
- Optionally keep CI honest with `npm run direction:sync -- --check` and `npm run direction:gate -- --check-sync`.
- Then propose / execute the implementation plan.

## Image Prompt Shape (per option)

Include: device/frame, primary task still visible, concrete type/surface/density/accent decisions for this thesis, what must remain from the reference, and what must change. Ban empty words: modern, clean, premium, sleek, elegant, professional.

## Degraded Mode

- **No attachable reference screenshot:** still follow the runtime plan from the user’s description; open the browser gallery when images exist; note the missing reference.
- **Chat cannot display images:** do not switch to prose-only — open `design/direction-options/index.html` in the browser (`gallery-only`).
- **Image generation unavailable:** mode `prose-with-gap` — record `IMAGEGEN_UNAVAILABLE`; never describe fake screenshots; still wait for a numbered choice.

## Prohibitions

- Do not proceed to code after showing options without a selection.
- Do not proceed to code after writing the spec without **เริ่มเขียน**.
- Do not keep the preference only in chat — the `.md` spec is mandatory after a choice.
- Do not treat generated images as production assets or exact-reference baselines.
- Do not invent product features absent from the reference unless requested.
- Do not generate more than three options unless the user asks for another round.
