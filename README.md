# Full-Stack Vision Engineering Pro v6.0.0

A production-oriented **Agent Skill + local engineering toolkit** that joins four systems in one governed release workflow:

1. **Frontend Vision Engineering** — rendered, responsive, accessible, interactive, and performance-aware UI verification.
2. **Aesthetic Direction** — a positive, perception-grounded model of visual quality with measurable colour, type, spacing, craft, motion, and style audits and an independent judgment review. Screenshot redesigns start with ImageGen options 1–2–3 before profile authorship.
3. **Full-Stack Risk Engineering** — API, architecture, data, security, resilience, observability, dependency, incident, and release gates.
4. **Deterministic Process Kernel** — task routing, design approval, executable plans, workspace isolation, TDD proof, scientific debugging, independent review, recovery ledgers, claim verification, and human-owned integration decisions.

The process kernel is an original adaptation of the strongest patterns found across the installed Superpowers skill set. It does not copy those skills into one prompt. It turns the patterns into contracts, deterministic engines, CLI checks, schemas, examples, pressure scenarios, and hard release gates tailored to full-stack and frontend engineering.

## What v5 adds

Earlier versions could tell an agent what to reject — card grids, glow, glass, oversized hero copy, decorative motion. That prevents the worst output but does not produce work people find attractive, and it left "emotional and brand character" as an unexamined phrase.

v5 supplies the positive model. It is deliberately universal, describing perceptual regularities that hold across products and eras rather than trends or audience research:

- **Principles with tests.** Fluency, grouping, balance, proportion, contrast, rhythm, and unity, each with an observable test — blur, five-second, greyscale, alignment audit, removal, inventory, interval, substitution, and content pressure — so a finding is evidence rather than an impression.
- **Anchors for every level.** The 0–5 scale previously defined only what 5 meant. Every level now has a definition, a dimension floor, and a rule that a weighted average never compensates for a dimension below it.
- **A falsifiable direction.** The aesthetic profile records positions on five personality axes with reasons and accepted consequences, a bounded novelty budget, system intents, and voice. Unconstraining terms such as modern, clean, or premium are rejected by the profile audit.
- **Measurement where measurement is possible.** Perceptual colour ramps in OKLCH, contrast floors, type-step distinguishability, measure in characters, spacing conformance and proximity ratios, nested radii, shadow light-source consistency, motion duration and easing families, and style-signature drift against a declared archetype.
- **Governed judgment.** A rating below 3 requires a recorded finding; a rating of 5 requires a performed test; the implementer cannot approve their own aesthetic review; and a system-wide deviation cannot be parked as residual.

## Why the process gate is materially stronger

A technically strong build can still fail release when its process evidence is weak. The process gate is required and hard by default, so none of these can be averaged away:

- missing design approval for creative work;
- plan dependencies or interfaces that are invalid;
- production code written before the failing test;
- speculative debugging without boundary evidence;
- implementer self-review or incomplete reviewer verdicts;
- open critical/important findings;
- stale verification or an artifact-hash mismatch;
- silent merge, cleanup, or discard decisions.

Quality and confidence remain separate:

```text
Quality score       = what the assessed evidence says
Evidence confidence = how complete, current, scoped, independent, and artifact-bound the evidence is
```

## One Framework — the Flow Layer (v6)

v6 puts the whole discipline under a single umbrella: every process pattern the kernel enforces also ships as a readable, conversation-level **flow doc** — fourteen original docs under `flow/`, each in the same contract shape (Why → When → Steps → Evidence gates → Anti-patterns) and each bound to the deterministic engines that judge its evidence. The ten operating modes resolve to their governing flow through `flow/flow-map.json`, and `npm run mode -- resolve` / `show` names the flow doc for the work at hand, so the same framework governs the conversation, the artifacts, and the gates.

Start at `flow/README.md` for the map of all fourteen flows. For the shortest honest end-to-end pass — route, design, plan, isolate, TDD, review, quality gate, verify, integrate — walk `GOLDEN_PATH.md`, backed by a live command log over a real toy repo in `examples/golden-path/`.

## Requirements

- Node.js 20 or later
- The repository or isolated copy under review
- JSON contracts for the enabled process and domain gates
- A runnable application and Playwright browser for live frontend evidence
- Real database, telemetry, deployment, or security tooling when those claims are required

This package does not provide a subagent runtime, browser, git remote, production environment, database, or telemetry service by itself. It can create and validate the artifacts those capabilities must produce, but it cannot invent unavailable evidence.

## Install

```bash
unzip fullstack-vision-engineering-pro-v6.0.0.zip
cd fullstack-vision-engineering-pro-v5
./setup.sh
```

Windows PowerShell:

```powershell
Expand-Archive .\fullstack-vision-engineering-pro-v6.0.0.zip -DestinationPath .
Set-Location .\fullstack-vision-engineering-pro-v5
.\setup.ps1
```

Manual installation:

```bash
npm install --ignore-scripts --no-audit --no-fund
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json
cp examples/process/process.config.json process.config.json
cp fullstack.config.example.json fullstack.config.json
npm run validate
# if the skill directory is read-only:
npm run validate -- --output /tmp/VALIDATION_REPORT.json
```
## Quick start: governed process

The safe example contracts are in `examples/process/`.

```bash
npm run process:route -- --input examples/process/request.feature.json
npm run process:plan -- --input examples/process/implementation-plan.json
npm run process:tdd -- --input examples/process/tdd-cycles.json
npm run process:review -- --input examples/process/review-chain.json
npm run process:audit -- --config examples/process/process.config.json
```

Generated evidence:

```text
examples/process/artifacts/process-report.json
examples/process/artifacts/process-report.md
```

The report exposes required sections, quality score, weakest-link evidence confidence, blockers, recovery state, and permitted next actions.

## Quick start: frontend and full stack

```bash
npm run vision-loop -- --config vision-loop.config.json
npm run audit:fullstack -- --config fullstack.config.json
npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json
```

`fullstack.config.json` now accepts:

```json
{
  "version": 4,
  "contracts": {
    "processReport": "artifacts/process/process-report.json",
    "frontendSummary": "artifacts/vision-loop/reports/run-summary.json"
  },
  "gates": {
    "process": { "required": true, "hard": true }
  },
  "quality": {
    "weights": { "process": 15 },
    "minScore": 90,
    "minConfidence": 90
  }
}
```

## Process commands

| Command | Purpose |
|---|---|
| `npm run process:route` | Select process skills and binding constraints from task context |
| `npm run process:workspace` | Classify worktree, submodule, protected branch, and cleanup ownership |
| `npm run process:plan` | Validate task dependencies, files, interfaces, and test-first steps |
| `npm run process:tdd` | Prove RED chronology, GREEN identity, hashes, and high-risk negative controls |
| `npm run process:review` | Validate independent dual-verdict review, findings, fix loops, and final review |
| `npm run process:integration` | Validate an explicit merge/PR/keep/discard decision without executing it |
| `npm run process:audit` | Combine all process evidence and write JSON/Markdown reports |

## Aesthetic commands

| Command | Purpose |
|---|---|
| `npm run audit:aesthetics` | Measure colour, typography, spacing, craft, motion, and style signature against a declared profile |
| `npm run aesthetics:review` | Validate an independent aesthetic review against dimension floors, supporting findings, independence, and artifact binding |
| `npm run vision-loop` | Capture, inspect, compare, load semantic + aesthetic evidence, and write the run summary |

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
npm run vision-loop -- --config vision-loop.config.json
```

Step-by-step: `AESTHETIC_WALKTHROUGH.md`. Thai summaries: `references/aesthetic-direction-protocol_TH.md`, `references/aesthetic-principles_TH.md`, `references/visual-direction-exploration_TH.md`.

Screenshot redesign flow: `references/visual-direction-exploration.md` — generate options 1/2/3 with ImageGen, wait for a choice, then bind the aesthetic profile.

The mechanical audit runs first and produces facts. The judgment review follows and covers what cannot be measured. Enable the gate in `vision-loop.config.json`:

```json
{
  "aesthetics": {
    "enabled": true,
    "profilePath": "design/aesthetic-profile.json",
    "reviewPath": "design/aesthetic-review.json",
    "minScore": 80,
    "dimensionFloor": 3,
    "requireTestEvidence": true
  }
}
```

Until it is enabled the `aesthetic` gate reports not-applicable and does not affect the quality score, so a v4 pipeline upgraded to v5 produces unchanged gate results.

## Modes and the re-check pass

Work runs inside one of ten modes, and no mode closes without an adversarial pass against your
own output.

```bash
npm run mode -- resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย"   # analyze design-ui match-ref design-game implement
npm run mode -- show design-ui                          # debug review ship author-skill recover
npm run mode -- check --mode design-ui --state .fx/mode-state.json

npm run recheck -- plan --mode design-ui
npm run recheck -- audit --record .fx/recheck.json
```

A mode declares what the phase may do, what it must not do yet, which gates produce its
evidence, and what has to be true before it closes. `resolve` exits non-zero when the request
is ambiguous, so the mode gets confirmed instead of assumed.

The re-check answers four questions in writing — what am I claiming, what proves it, how would
I know if I were wrong, what did I never look at — and the audit rejects unbound claims,
absolute language on thin evidence, ticked checks with no observation, and clean verdicts with
no falsification behind them. Read `references/operating-modes.md` and
`references/recheck-protocol.md`.

## Vision-in-the-loop commands

| Command | Purpose |
|---|---|
| `npm run vision:triage` | Rank every difference between the reference and the current render in perceptual order, and return exactly one next change |
| `npm run layout-structure` | Remember a reference layout and check named regions in the current render against it |
| `npm run ascii-map` | Render or compare an image region as an ASCII/digit density map an agent can reason over |
| `npm run audit:scene` | Measure a frame zone by zone: empty corners, focal hierarchy, value structure, copy-paste tiling |
| `npm run audit:game-assets` | Audit a game asset set: silhouette read, in-engine scale with a reference, style binding, budget, in-context proof |

```bash
npm run vision:triage -- --ref design/ref.png --cur artifacts/cur.png --history .fx/triage-history.json
npm run audit:scene -- --image artifacts/frame.png --brief examples/scene-brief.example.json --grid 8x5
npm run audit:game-assets -- --assets examples/game-assets.example.json --frame-triangle-budget 250000
```

`vision:triage` fixes differences in the order `structure → proportion → value → colour → density → polish`, exits non-zero while the frames still differ, and flags a stall when three rounds produce no measurable convergence. Read `references/visual-delta-triage.md`, `references/scene-completeness.md`, `references/game-vision-loop.md`, `references/game-asset-direction.md`, and `references/world-building-and-level-blockout.md`.

`audit:game-assets` also covers effects, sound, and animation, which fail differently from props: VFX declares timing, readability under overlap, and whether it is gameplay-critical; sound declares its layers, mix bus, repetition plan, and the redundant visual cue; animation declares timing, cancel window, and telegraph. Read `references/vfx-and-sfx-direction.md` and `references/game-feel-and-juice.md`.

Discipline packs — what each role owns, its gates, and its red flags — live in `domains/ROLES/`.

### Mobile Vision Loop (iOS + Android)

The loop is fully wired: set `capture.type` to `ios-sim` or `android` in
`vision-loop.config.json`, declare `mobile.cases`, and `vision-loop` captures every
case from the booted simulator/emulator, computes deterministic metrics per case,
and writes a judge verdict (`metadata/<label>__mobile__<key>.mobile.judgment.json`). Web-only
sections log `skipped (web-only section)`; the run gate is the mobileChecks verdict
set — any failing case exits 1. Because no web gates apply to a mobile run, the
summary lifts the web quality floor (`minScore`/`minConfidence`) instead of failing
clean runs on a non-applicable score.

Visual comparison rides the same case matrix. Run once with `--refresh-reference`
to capture fresh reference PNGs from the booted devices, and every later run diffs
the current captures against the stored references with the standard pixel +
perceptual gates — a blocker or major diff fails the run. Per-case `masks` are
PNG-space rectangles (`{"x":0,"y":0,"width":100,"height":44}`, `w`/`h` shorthand
accepted) that blank volatile regions such as clocks and battery indicators
before the diff.

```json
{
  "capture": { "type": "ios-sim" },
  "mobile": {
    "udid": "booted",
    "cases": [ { "key": "home", "label": "home", "settleMs": 1500 } ],
    "judge": { "thresholds": { "maxEmptyCells": 3 } }
  }
}
```

```bash
node scripts/vision-loop.mjs --config vision-loop.config.json --refresh-reference  # seed/refresh the reference baseline
node scripts/vision-loop.mjs --config vision-loop.config.json                      # capture + compare against it
```

For Android use `capture.type: "android"` with `mobile.serial` (default
`emulator-5554`; `mobile.adbPath` points at a specific adb binary). Per-case
`udid`/`serial` override the device-level defaults.

One-off capture and text-only judging stay available standalone:

```bash
npm run capture:mobile -- --out .fx/cur.png --label chat --launch <bundleId> --settle 2
npm run capture:mobile -- --platform android --serial emulator-5554 --out .fx/home.png --label home --settle 2
npm run vision:metrics -- --image .fx/cur.png --grid 8x5 --out .fx/metrics.json
npm run vision:judge -- --judge metrics --metrics .fx/metrics.json --thresholds '{"maxEmptyCells":3}' --out .fx/verdict.json
```

Android capture ships via `adb screencap` (`exec-out` with an `/sdcard` pull
fallback). Every mobile capture records its PNG sha256 in the capture metadata and
metrics record their source image hash — pass `--verify-source` (with `--capture`)
to `vision:judge` to fail unless the metrics were computed from the exact capture
under judgment:

```bash
npm run vision:judge -- --judge metrics --metrics .fx/metrics.json --capture .fx/cur.png --verify-source --out .fx/verdict.json
```

### Visual Evidence Report

One self-contained HTML file per run — per-case reference/current/diff thumbnails, deterministic metrics, verdicts and findings, sha256 hash anchors for verification, the full gate ladder, and run provenance — so a reviewer can read the whole run offline without reconstructing it from the artifact tree. Inline CSS, base64 images, no JavaScript, no external references: open `reports/visual-evidence.html` in any browser (double-click works; nothing to serve).

Flag it on any web or mobile `vision-loop` run, or build it standalone from an existing output directory:

```bash
node scripts/vision-loop.mjs --config vision-loop.config.json --evidence-visual   # emitted after the run summary
npm run evidence:visual -- --output-dir artifacts/vision-loop                      # any prior run's output dir
```

## Domain commands

The v3 surface is preserved:

- `vision-loop`, `capture`, `compare`, `inspect`, accessibility, performance, interaction, state, breakpoint, token, baseline, semantic-review, and engineering commands;
- `audit:experience`, `audit:api`, `audit:architecture`, `audit:migrations`, `audit:security`, `audit:resilience`, `audit:observability`, `audit:dependencies`, `audit:risks`;
- `debug:triage`, `audit:fullstack`, and `fullstack:quality-gate`.

## Process artifact lifecycle

```text
request
→ routed disciplines
→ approved design
→ validated plan and task graph
→ safe workspace
→ append-only recovery ledger
→ TDD/debug evidence
→ bounded change package
→ independent task review
→ bounded fix rounds and scoped re-review
→ final whole-change review
→ completion claims bound to fresh evidence
→ process hard gate
→ full-stack hard gate
→ explicit integration decision
```

### Parallelism

Parallel analysis is encouraged for independent domains. Parallel implementation is admitted only when dependency-ready tasks do not share files, exclusive resources, or mutable state. The task-graph engine emits safe execution waves and conflict evidence.

### Context recovery

The process ledger is an append-only hash chain. It records plan identity, lifecycle state, task state, fix rounds, findings, and the last verified hash. A new controller can reconstruct progress without relying on conversation history.

### Review governance

Reviews must be independent and bound to the task brief and exact diff. Each review has a spec verdict and a quality verdict. Fixes require fresh tests and a scoped re-review. Five rounds is the hard circuit breaker; unresolved load-bearing findings stop downstream work.

### Claim governance

Claims such as tests-pass, bug-fixed, visual-match, security-gates-pass, and production-ready each require specific evidence types. Evidence must be current, passing, correctly scoped, and bound to the same artifact hash. An absolute “secure” claim is deliberately unsupported.

## Self-conformance and deterministic release

Validate the skill surface against the v5 authoring contract:

```bash
npm run skill:conformance -- --root .
```

Regenerate the readable all-in-one reference from the authoritative modular files:

```bash
npm run docs:all-in-one
```

Build a clean, deterministic release directory, ZIP, manifest, checksums, and ZIP SHA-256 sidecar:

```bash
npm run release:build -- \
  --source . \
  --output ../fullstack-vision-engineering-pro-v5 \
  --archive ../fullstack-vision-engineering-pro-v6.0.0.zip
```

The release builder skips symlinks and development state, rejects unsafe member paths, uses a single archive root, and verifies local headers, the central directory, CRC values, sizes, duplicate members, checksums, and deterministic ordering before returning success.

## Documentation map

- `SKILL.md` — main agent workflow
- `PLAYBOOKS.md` — copy-paste flows for redesign, reference matching, scenes, maps, asset sets, effects and sound, and delivery
- `flow/README.md` — the fourteen flow docs, one per process discipline (the flow source of truth)
- `GOLDEN_PATH.md` — the solo fullstack happy path, gate by gate, with the live walkthrough in `examples/golden-path/`
- `references/operating-modes.md` — the ten modes, their contracts, and how to cross between them
- `references/recheck-protocol.md` — the adversarial pass every mode closes with
- `domains/` — product-shaped packs (GAME, APPLICATION, DESIGN, GENERAL) and discipline packs (ROLES)
- `SUPERPOWERS_ADAPTATION_MATRIX.md` — mapping from every installed Superpowers skill to the process implementation
- `MIGRATION_V3_TO_V4.md` and `MIGRATION_V4_TO_V5.md` — upgrade guides
- `ARCHITECTURE.md` — engine and evidence architecture
- `SECURITY.md` — trust and execution boundaries
- `references/aesthetic-direction-protocol.md` — where aesthetic direction binds to the process
- `references/aesthetic-principles.md` and `references/aesthetic-scoring-anchors.md` — the model, its tests, and the rating anchors
- `references/` — process, domain, and aesthetic protocols
- `templates/` — human/agent handoff formats
- `agents/` and `prompts/` — role contracts and focused dispatch prompts
- `schemas/` — machine-readable contracts
- `examples/process/`, `examples/fullstack/`, and the bundled aesthetic examples — safe examples
- `tests/process-pressure-scenarios-v4.md` — authority, time, sunk-cost, context-loss, collusion, and false-completion scenarios
- `tests/aesthetic-pressure-scenarios-v5.md` — vague direction, preference-as-defect, average washing, unearned ratings, and self-approval scenarios

## Limits and non-claims

Offline validation can prove schema, deterministic engine, CLI, unit-test, checksum, and archive behavior. It cannot, without the corresponding live target, prove:

- that a particular UI matches a reference in a real browser;
- that a rendered surface is well crafted, since the aesthetic review requires current renders and an independent reviewer;
- production authorization or secret configuration;
- database lock duration, migration load, or rollback success;
- current third-party vulnerability status;
- distributed trace continuity or alert delivery;
- deployment safety in a real environment;
- independent multi-agent behavior when the host has no subagent capability.

These are reported as gaps, never converted into confidence.
