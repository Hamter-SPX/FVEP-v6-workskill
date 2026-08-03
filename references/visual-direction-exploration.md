# Visual Direction Exploration

## Purpose

When the user supplies a screenshot or asks to redesign a surface, text-only direction is too weak. Generate two or three **visible** alternatives, let the user pick one, **write a durable Markdown spec of what they liked**, get an explicit confirm to start or refine, then bind that choice into the aesthetic profile and design contract.

This protocol sits **before** `references/aesthetic-direction-protocol.md` profile authorship. It does not replace mechanical aesthetic audit or independent aesthetic review.

## When It Is Required

Run this protocol when **any** of the following is true:

- The user attached one or more UI screenshots and asked to redesign, restyle, or improve the look.
- The user asked for visual options, moodboards, or “show me styles”.
- Fidelity mode is `original-direction` or `brand-consistent` and no approved aesthetic profile exists yet for the surface.
- Stakeholders disagree on look and need a shared visual choice.

Skip it when:

- An approved aesthetic profile and design contract already bind the surface and the user asked only for a bug fix or non-visual change.
- The user already named a single locked direction with checkable parameters **and** a written direction spec already exists.

## Presentation channels

Always prefer **visible images**, never prose-only when images can be produced.

| Situation | What to do |
|---|---|
| Chat can show generated images (Cursor IDE, Codex with inline media) | Generate 1/2/3 with ImageGen and show them in chat. Optionally also write the browser gallery. |
| User **cannot attach / send** a reference screenshot | Still invent distinct theses from their description; generate 3 images; **open a browser gallery** so they can compare as pictures. Record `referenceNote: user could not attach screenshot`. |
| Runtime **cannot display images in chat** (CLI, headless Codex, text-only) | Generate (or locate) the 3 image files, then run `npm run direction:gallery` / `writeDirectionGallery` and **open the HTML page in the default browser**. Paste the `file://` link in chat. |
| Image generation unavailable | Record a verification gap. Build the gallery page with thesis cards and “image pending” placeholders, open it if useful, and still wait for a numbered choice — but state clearly that pictures were not generated. |

Do **not** fall back to text-only options when ImageGen succeeded but chat cannot show the files — open the browser gallery instead.

## Runtime adapter (Cursor / Codex / CLI / CI)

Before generating options, resolve the host presentation plan:

```bash
npm run direction:runtime
# Agent with GenerateImage in its tool list:
npm run direction:runtime -- --image-gen true --host cursor
# CLI / host without ImageGen:
npm run direction:runtime -- --image-gen false
```

| Host | Typical signals | Default plan |
|---|---|---|
| **cursor** | `CURSOR_VERSION`, `CURSOR_PROJECT_DIR` | Attempt `GenerateImage`; show inline; optional gallery |
| **codex** | `CODEX_HOME`, `CODEX_THREAD_ID` | Confirm image tool; if chat is text-only → gallery-only |
| **cli** | no IDE signals | No ImageGen — prose theses + explicit `IMAGEGEN_UNAVAILABLE` gap |
| **ci** | `CI` / `GITHUB_ACTIONS` | No exploration — `direction:gate` only |

Rules:

1. Node **cannot** see the agent tool list. If `GenerateImage` / `imagegen` is present, the agent must pass `--image-gen true` (or `DIRECTION_IMAGE_GEN=true`).
2. If ImageGen is absent or fails, use mode `prose-with-gap` — numbered theses + a clear verification gap. **Never invent or describe fake screenshots.**
3. If images exist but chat cannot display them, use `gallery-only` (`npm run direction:gallery`) — do not drop to prose-only.
4. CI never runs exploration; it only checks a confirmed spec.

Engine: `lib/direction-runtime-engine.mjs`.

## Prompt pack (IDE vs CLI)

| Plan | Open |
|---|---|
| ImageGen available (Cursor/Codex) | `prompts/visual-direction-exploration-ide.md` |
| No ImageGen / headless CLI | `prompts/visual-direction-exploration-cli.md` |
| Index | `prompts/visual-direction-prompt-pack.md` |

## End-to-end example

`examples/direction-camera/` — Field Camera redesign with confirmed spec, profile, contract, one 「ปรับต่อ」 round, and passing `direction:gate -- --check-sync`.

## Cursor rule + hook

```bash
npm run direction:cursor-install -- --dir /path/to/app
```

Installs `.cursor/rules/visual-direction-redesign.mdc` (always-on agent rule) and a `beforeSubmitPrompt` hook that reminds on redesign/screenshot prompts. See `templates/cursor/README.md`.

## Method

```text
inspect reference image(s) and product task
  (if no attachable screenshot: note the gap, continue from description)
→ draft 2–3 direction theses (distinct on personality / density / craft axes)
→ generate one image per thesis (ImageGen / host image tool)
→ present options labeled 1, 2, 3
    · in chat when the surface can show images
    · AND/OR open design/direction-options/index.html in the browser
→ STOP and wait for the user’s numbered choice
→ write design/visual-direction-spec.md (what they liked / thesis / keep / change)
→ STOP and wait for confirm: เริ่มเขียน | ปรับต่อ | เลือกใหม่
→ on เริ่มเขียน: author aesthetic profile + design contract from the spec
→ only then plan / implement
```

### 1. Inspect

Read the reference image(s). Separate:

- **Observed** — layout regions, controls, hierarchy, density, colour temperature, type roles, chrome vs content.
- **Inferred** — brand personality guesses, audience.
- **Constraints** — platform (iOS/Android/web), safe areas, existing design system, accessibility floors.

Do not invent features that are not in the reference unless the user asked for them.

### 2. Draft Distinct Theses

Produce **two or three** theses. Each must differ on at least two of:

- serious ↔ playful
- warm ↔ clinical
- understated ↔ expressive
- dense ↔ spacious
- established ↔ novel

Trivial variants (same layout, only accent hue changed) do not count as separate options. Each thesis gets:

- a one-line visual thesis
- a **clear novelty concept** (one new idea that is checkable — not “modern/clean/premium”)
- the personality deltas vs the reference
- what stays from the reference (structure, task, critical controls)
- what changes (surface, type, chrome, motion character)

### Distinctness gate (required before presenting)

Before showing options 1/2/3, write `design/direction-options/options.json` and run:

```bash
npm run direction:distinctness -- --options design/direction-options/options.json
```

If the gate fails (`ok=false` / `fail-similar-or-weak-novelty`), **do not present** that set. Redesign theses until they:

1. differ on ≥2 personality axes with meaningful separation, and
2. each carry a distinct novelty concept.

A result that still looks like near-duplicates **does not meet this skill’s visual-direction standard**, even if three images were generated.

### 3. Generate Images

Use the host **image generation** tool (for example Cursor `GenerateImage`) once per thesis.

Prompt rules:

- Describe a **full-bleed mobile or product UI frame** matching the reference device class unless the user asked otherwise.
- Preserve the primary task and critical controls from the reference so the option is a redesign, not a different product.
- Encode the thesis in concrete visual terms (density, type weight, surface treatment, accent discipline) — never only “modern” or “premium”.
- Pass the user’s reference image(s) as `reference_image_paths` when the tool supports them.
- Label the file clearly (`direction-option-1.png`, …).

If generation fails or is unavailable, present the theses as numbered prose options and state the gap. Do not pretend images exist.

### 4. Present and Stop

Show the images inline (or paths) with:

```text
1 — <thesis>
2 — <thesis>
3 — <thesis>
```

Ask which number to take, or what to adjust. **Do not** write implementation plans, Flutter/React code, a final aesthetic profile, or the direction spec until the user selects a number (or explicitly says to proceed with a stated option).

When chat cannot show the images, or the user could not send a reference screenshot, call:

```bash
npm run direction:gallery -- \
  --option '1|<thesis>|path/to/direction-option-1.png' \
  --option '2|<thesis>|path/to/direction-option-2.png' \
  --option '3|<thesis>|path/to/direction-option-3.png' \
  --reference-note 'User could not attach a reference screenshot' 
```

This writes `design/direction-options/index.html` and opens it in the default browser so the three options are still visible as pictures.

### 5. Write the Direction Spec (always)

After the user picks an option, **always** write a Markdown spec using `templates/visual-direction-spec.md`.

Default path: `design/visual-direction-spec.md` (create `design/` if needed). If the repo already uses another design-docs folder, place it there and link it from the design contract.

The spec must record:

- selected option number, timestamp, chosen image, reference screenshot(s)
- **what they liked** in concrete checkable terms (hierarchy, density, colour, type, surface, motion, tone)
- direction thesis (one sentence)
- draft personality positions
- keep vs change vs non-goals (including unchosen options)
- linked paths for profile and contract (to be filled next)

This file is the durable preference record. Do not keep the choice only in chat history.

### 6. Confirm Gate (always)

In the same turn as writing the spec (or immediately after), present the summary and **stop again**. Ask the user to reply with exactly one of:

| Reply | Meaning |
|---|---|
| **เริ่มเขียน** | Spec accepted — proceed to aesthetic profile, design contract, then plan/implement |
| **ปรับต่อ** | Spec not final — user names what to change; revise the `.md` (and regenerate options if needed); do not implement |
| **เลือกใหม่** | Return to step 4 with a new or revised option set |

When the user says **ปรับต่อ**, record the round instead of overwriting history silently:

```bash
npm run direction:iterate -- \
  --from 2 --to 2b \
  --image design/direction-options/direction-option-2b.png \
  --keep 'Layout structure from option 2' \
  --change 'Icons only — system glyphs' \
  --note 'เหลือ layout แก้แค่ icon'
```

This appends `## Iteration History`, updates the chosen image, writes `design/direction-iterations.json`, and clears the เริ่มเขียน checkbox so confirm must happen again.

**Do not** start an implementation plan or production code until the user says **เริ่มเขียน** (or an unambiguous equivalent such as “go ahead and implement from this spec”).

### 7. Bind After Confirm

Only after **เริ่มเขียน**:

1. Author `schemas/aesthetic-profile.schema.json` from the direction spec (or run `npm run direction:sync` to push personality / thesis / likes into `design/aesthetic-profile.json`).
2. Author / update the design contract with `aestheticProfile`, visual thesis, composition, type, surfaces, states, and acceptance cases.
3. Point the contract at the direction spec path as direction evidence.
4. Optionally run `npm run direction:sync -- --check` in CI to fail when the profile drifts from the spec.
5. Optionally run `npm run direction:gate -- --check-sync` on UI PRs so merge requires confirm = เริ่มเขียน (no browser).
6. Then offer / execute the implementation plan.

For greenfield scaffolding before exploration:

```bash
npm run direction:init -- --product "Camera app" --audience "field photographers"
```

Generated images are **direction evidence**, not production assets and not proof of pixel fidelity. Exact-reference fidelity still requires captures and comparison in the vision loop.

## Anti-Patterns

- Generating one image and treating it as approved direction without a choice.
- Generating three near-identical images.
- Implementing Flutter/UI code in the same turn as the first option set.
- Recording the choice only in chat without a `.md` spec.
- Jumping from option selection straight to code without the confirm gate (**เริ่มเขียน** / **ปรับต่อ** / **เลือกใหม่**).
- Using ImageGen output as an exact-reference baseline.
- Asking “do you like it?” without numbered options.
- Falling back to prose-only options when ImageGen produced files but chat cannot display them — open the browser gallery instead.
- Skipping exploration when the user sent a screenshot and asked to redesign.

## Related

- `templates/visual-direction-spec.md` — durable preference / direction record.
- `lib/direction-runtime-engine.mjs` / `npm run direction:runtime` — Cursor/Codex/CLI/CI presentation adapter.
- `prompts/visual-direction-prompt-pack.md` — IDE vs CLI operator prompts.
- `examples/direction-camera/` — filled end-to-end camera direction artifacts.
- `templates/cursor/` / `npm run direction:cursor-install` — Cursor rule + redesign hook.
- `lib/direction-gallery-engine.mjs` / `npm run direction:gallery` — browser gallery when chat cannot show images.
- `lib/direction-init-engine.mjs` / `npm run direction:init` — scaffold design artifacts for IDE / CLI / CI.
- `lib/direction-spec-sync-engine.mjs` / `npm run direction:sync` — sync or `--check` drift between spec and aesthetic profile.
- `lib/direction-iterate-engine.mjs` / `npm run direction:iterate` — 「ปรับต่อ」 keep/change rounds with option `Nb` images.
- `lib/direction-gate-engine.mjs` / `npm run direction:gate` — PR/CI confirm gate without a browser.
- `prompts/visual-direction-exploration.md` — shared operator prompt for this step.
- `references/aesthetic-direction-protocol.md` — profile and gate after confirm.
- `agents/design-director.md` — owns this step for redesign work.
- `AESTHETIC_WALKTHROUGH.md` — end-to-end including optional ImageGen exploration.
