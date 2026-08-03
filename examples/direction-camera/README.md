# Example: Camera capture UI direction (end-to-end)

Filled artifacts for a one-handed camera redesign. Use as a teaching fixture — not a live app.

## What is here

| File | Role |
|---|---|
| `visual-direction-spec.md` | Chosen option **2b** after one 「ปรับต่อ」 round; confirm = **เริ่มเขียน** |
| `aesthetic-profile.json` | Bound personality / systems / novelty budget |
| `design-contract.json` | Acceptance contract pointing at this folder |
| `direction-iterations.json` | Machine ledger for the icon-only refine round |
| `direction-options/README.md` | Where ImageGen PNGs would land |
| `direction-runtime.json` | Example Cursor + ImageGen runtime plan |

## Reproduce the CLI path

From the skill root:

```bash
npm run direction:runtime -- --image-gen false --host cli
npm run direction:gate -- --dir examples/direction-camera --spec visual-direction-spec.md --profile aesthetic-profile.json --check-sync
npm run direction:sync -- --dir examples/direction-camera --spec visual-direction-spec.md --profile aesthetic-profile.json --check
```

Expected: gate and sync `--check` pass.

## Story (short)

1. User attached a dense stock camera UI and asked to redesign.
2. Agent showed options 1 / 2 / 3 (spacious chrome won as **2**).
3. User said **ปรับต่อ** — keep layout, fix icons only → recorded as **2b**.
4. User said **เริ่มเขียน** → profile + contract bound; implementation may start.

## IDE vs CLI prompts

- With ImageGen: `prompts/visual-direction-exploration-ide.md`
- Without: `prompts/visual-direction-exploration-cli.md`
