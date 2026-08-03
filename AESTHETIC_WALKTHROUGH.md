# Aesthetic Direction Walkthrough

End-to-end path from a declared direction to a scored aesthetic gate. Use the bundled examples first; swap paths once a real product profile exists.

## 0. Preconditions

- Node 20+
- Package installed / available at the skill root
- Optional: a running app URL only if you also want live `vision-loop` captures

## 0b. Screenshot redesign — visible options first

If the user sent a UI screenshot and asked to redesign:

1. Follow `references/visual-direction-exploration.md` / `prompts/visual-direction-exploration.md`.
2. Run `npm run direction:runtime` first; pass `--image-gen true|false` from the actual tool list.
3. Generate options **1 / 2 / 3** with the host ImageGen tool when the plan allows it (pass the screenshot as a reference image when supported). If ImageGen is unavailable, use prose-with-gap and state the gap — do not invent images.
4. If the user could not attach a screenshot, or chat cannot show images, run `npm run direction:gallery` and open the browser page so the three options are still visible as pictures.
5. Stop and wait for a numbered choice.
6. Write `design/visual-direction-spec.md` from `templates/visual-direction-spec.md` (what they liked / thesis / keep / change). Optionally scaffold first with `npm run direction:init`.
7. Stop again and wait for **เริ่มเขียน** | **ปรับต่อ** | **เลือกใหม่**. On **ปรับต่อ**, run `npm run direction:iterate` (keep/change + option `Nb` image) and ask again.
8. Only after **เริ่มเขียน** continue to profile + contract below (`npm run direction:sync` can push the filled spec into `aesthetic-profile.json`; use `--check` / `direction:gate -- --check-sync` to detect drift or missing confirm).

Thai summary: `references/visual-direction-exploration_TH.md`.

Prompt pack: `prompts/visual-direction-prompt-pack.md` (IDE vs CLI).  
Filled example: `examples/direction-camera/`.  
Cursor install: `npm run direction:cursor-install`.

## 1. Author the aesthetic profile

```bash
cp templates/aesthetic-profile.md design/aesthetic-profile.md
# or start from JSON:
cp examples/aesthetic-profile.example.json design/aesthetic-profile.json
```

Every personality axis needs a 1–5 value, a reason, and accepted consequences. Keep the novelty budget to at most two positions unless you record why more are justified.

## 2. Attach it to the design contract

Point `aestheticProfile` at the profile path and keep the visual thesis product-specific:

```bash
cp examples/design-contract.example.json design/design-contract.json
```

## 3. Mechanical audit (no browser required)

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
```

Expected: `passed: true`, section scores present, review folded in.

From live tokens only (fills empty sections):

```bash
npm run audit:aesthetics -- \
  --profile design/aesthetic-profile.json \
  --tokens artifacts/vision-loop/reports/token-profile.current.json \
  --no-require-review
```

## 4. Independent aesthetic review

```bash
cp examples/aesthetic-review.example.json design/aesthetic-review.json
# set reviewedAt to now, configHash to the current provenance hash, cases to your matrix
npm run aesthetics:review -- --config vision-loop.config.json
```

The reviewer must not be the implementer. Ratings below 3 need findings; a 5 needs a performed test.

## 5. Enable the gate in config

```json
{
  "aesthetics": {
    "enabled": true,
    "profilePath": "design/aesthetic-profile.json",
    "measurementsPath": "design/aesthetic-measurements.json",
    "reviewPath": "design/aesthetic-review.json",
    "minScore": 80,
    "minConfidence": 70,
    "dimensionFloor": 3,
    "requireMatchingConfigHash": true
  }
}
```

## 6. Run the vision loop

```bash
npm run vision-loop -- --config vision-loop.config.json
```

Look for:

```text
Aesthetic gate: pass
```

in stdout and `quality.gates.aesthetic` inside `artifacts/vision-loop/reports/run-summary.json`.

Missing required evidence fails the aesthetic gate. Use `--skip-aesthetics` only while debugging other families.

## 7. Read remediation and history

- `artifacts/vision-loop/reports/remediation.md` — actionable aesthetic blockers
- `artifacts/vision-loop/reports/run-history.json` — includes `aestheticScore` / `aestheticStatus` per run
- `artifacts/vision-loop/reports/run-summary.html` — gate cards including aesthetic

## Failure modes worth forcing once

| Fault | Expected |
|---|---|
| `enabled: true` without profile file | Aesthetic gate `fail`, remediation category `aesthetics` |
| Review omits a configured case | `missingCases` non-empty, audit does not pass |
| Reviewer equals implementer | Independence failure |
| Stale `reviewedAt` or wrong `configHash` | Freshness / binding failure |

## Related

- `references/aesthetic-direction-protocol.md`
- `references/aesthetic-principles.md`
- `MIGRATION_V4_TO_V5.md`
- `references/aesthetic-direction-protocol_TH.md`
