# Visual Direction — CLI Prompt (text / headless / no ImageGen)

Use this when ImageGen is unavailable or the session is file/command driven (`npm run direction:runtime -- --image-gen false`).

Companion: `prompts/visual-direction-exploration-ide.md` · Full protocol: `references/visual-direction-exploration.md`

## Mission

Still run numbered direction choice + durable spec + confirm gate. **Do not invent pictures.** Prefer files and CLI over chat chrome.

## Bootstrap

```bash
npm run direction:runtime -- --image-gen false
npm run direction:init -- --product "<name>" --audience "<who>"
```

## Turn A — options (prose-with-gap)

1. Inspect any on-disk reference under `design/` (or record that none was attached).
2. Draft **2–3 theses** that differ on ≥2 personality axes.
3. Present as numbered prose:

```text
1 — <thesis> · axes moved: …
2 — <thesis> · axes moved: …
3 — <thesis> · axes moved: …
VERIFICATION GAP: IMAGEGEN_UNAVAILABLE on this runtime — options are text theses, not screenshots.
```

4. Optional: `npm run direction:gallery` with thesis cards and **image-pending** placeholders (label clearly).
5. **Stop.** Ask for a number. No plan or code.

If image files already exist on disk from another machine, switch to gallery-only:

```bash
npm run direction:gallery -- \
  --option '1|<thesis>|design/direction-options/direction-option-1.png' \
  --option '2|<thesis>|design/direction-options/direction-option-2.png' \
  --option '3|<thesis>|design/direction-options/direction-option-3.png'
```

Paste the `file://` link. Do **not** collapse to prose-only while files exist.

## Turn B — after a number

```bash
# Edit design/visual-direction-spec.md (selected option, likes, thesis, axes, keep/change)
```

Stop for **เริ่มเขียน** | **ปรับต่อ** | **เลือกใหม่**.

On **ปรับต่อ**:

```bash
npm run direction:iterate -- \
  --from 2 --to 2b \
  --image design/direction-options/direction-option-2b.png \
  --keep '…' --change '…' --note '…'
```

## Turn C — only after 「เริ่มเขียน」

```bash
npm run direction:sync
npm run direction:gate -- --check-sync
# then plan / implement
```

## CI

Do not explore in CI. Require a confirmed spec:

```bash
npm run direction:gate -- --check-sync
```

## Prohibitions

- Never describe fake screenshots or “as if generated” imagery.
- Never skip the `.md` spec or the confirm gate.
- Never implement before **เริ่มเขียน**.
