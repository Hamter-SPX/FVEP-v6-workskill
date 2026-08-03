# Visual Direction — IDE Prompt (Cursor / Codex with media)

Use this when the host can generate or display images (`npm run direction:runtime -- --image-gen true`).

Companion: `prompts/visual-direction-exploration-cli.md` · Full protocol: `references/visual-direction-exploration.md`

## Mission

Explore visible direction **before** profile, contract, plan, or code. Prefer pictures over prose.

## Turn A — options

1. `npm run direction:runtime -- --image-gen true` (and `--host cursor` or `codex` if known).
2. Inspect the reference screenshot(s). List observed / inferred / constraints.
3. Draft **2–3 theses** that differ on ≥2 personality axes. Reject near-duplicates.
4. **Generate one image per thesis** with the host tool (`GenerateImage` in Cursor; Codex `imagegen` when present). Pass `reference_image_paths` when supported. Save as `design/direction-options/direction-option-N.png`.
5. Show **1 / 2 / 3** inline. Also run `npm run direction:gallery` if comparison side-by-side helps or chat is unreliable.
6. **Stop.** Ask for a number. No spec, profile, plan, or code in this turn.

## Turn B — after a number

1. Write `design/visual-direction-spec.md` (scaffold with `direction:init` if needed).
2. Fill likes / thesis / personality / keep / change / non-goals.
3. **Stop** for **เริ่มเขียน** | **ปรับต่อ** | **เลือกใหม่**.
4. On **ปรับต่อ**: `npm run direction:iterate -- --from N --to Nb --image … --keep … --change …` then ask again.

## Turn C — only after 「เริ่มเขียน」

1. `npm run direction:sync`
2. Bind design contract + aesthetic profile.
3. Then plan / implement.
4. CI later: `npm run direction:gate -- --check-sync`

## Degraded IDE paths

| Situation | Action |
|---|---|
| GenerateImage missing/fails | Switch to CLI prompt pack / `--image-gen false`. State `IMAGEGEN_UNAVAILABLE`. Never invent screenshots. |
| Images exist, chat blank | `gallery-only` — open browser gallery; do not drop to prose-only. |
| No attachable reference | Still generate 3 distinct options from description; note `referenceNote`. |

## Prohibitions

- No implementation in Turn A or B.
- No preference only in chat — the `.md` spec is mandatory after a choice.
- Generated images are direction evidence, not baselines or production assets.
