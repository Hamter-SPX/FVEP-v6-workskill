# Changelog

## 2026-08-09 — Visual evidence report

### Added

- `vision-loop --evidence-visual`: after the run summary, on web and mobile paths alike, the loop folds the artifacts the run just left on disk into `<outputDir>/reports/visual-evidence.html` and names the path in the stdout summary; the run verdict itself is untouched
- `npm run evidence:visual -- --output-dir <dir>` + `lib/visual-evidence-engine.mjs`: builds the same report standalone from any prior run's output directory — one self-contained HTML file with per-case reference/current/diff thumbnails, deterministic metrics, unified pass/warn/fail verdicts, findings, sha256 anchors (a capture/metrics hash divergence flags the evidence as stale), the gate ladder, and run provenance; readable offline with inline CSS, base64 images, no JavaScript, and no external references

## 6.0.0 — 2026-08-09

**One Framework** — every process discipline now ships as a readable flow doc under a single umbrella, wired into the mode engine, with a walked golden path as proof.

### Added

- Flow layer: fourteen original flow docs under `flow/` — one per Superpowers-derived discipline, each in the same contract shape (Why → When → Steps → Evidence gates → Anti-patterns) — with `flow/README.md` as the index and an attribution notice
- `flow/flow-map.json` + mode-engine wiring: `npm run mode -- resolve` / `show` names the governing flow doc and its companions for each of the ten modes
- `GOLDEN_PATH.md` — the solo fullstack happy path across nine gates — backed by a live walkthrough on a real toy repo under `examples/golden-path/` with committed commands, output tails, and replayable gate reports
- Flow docs lint (`tests/unit/flow-docs.test.mjs`): required sections per doc, existence of every referenced npm script and engine/template path, flow-map validity, and GOLDEN_PATH command existence
- MIT LICENSE (copyright Jirawat (Hamter-SPX)) and the matching `license` field in `package.json`
- Mobile compare in the vision loop (rolled up from the prior round): `compareAll` enumerates `mobile.cases`, per-case `masks` blank volatile regions, and `--refresh-reference` seeds the stored references

### Changed

- `SUPERPOWERS_ADAPTATION_MATRIX.md` is now the v6 matrix: every one of the fourteen rows names its shipped `flow/<slug>.md` doc
- `SKILL.md`, `PLAYBOOKS.md`, `README.md`, and `README_TH.md` point at the flow layer as the source of truth for procedure once a mode is resolved
- The all-in-one bundle now includes `GOLDEN_PATH.md`

## 2026-08-09 — Mobile compare in the vision loop

### Added

- `compareAll` enumerates `mobile.cases` when `capture.type` is `ios-sim|android` (case label → route, fixed `mobile` viewport, case key → state — the same artifact identity `captureAllMobile` writes), so the stored-reference pixel + perceptual visual gate now runs on mobile captures
- `mobile.cases[].masks`: PNG-space ignore rectangles (`x`/`y`/`width`/`height`, `w`/`h` shorthand accepted) parsed through config and the JSON schema, applied before the mobile diff; `regions` pass through as raw contracts
- `vision-loop` mobile branch: `--refresh-reference` captures a fresh reference set from the booted devices via `captureAllMobile` reference mode, and compare runs by default — the `--refresh-reference is not supported` warning and the `compare: skipped on mobile` line are removed

## 2026-08-08 — Mobile Vision Loop (full wiring)

### Added

- `vision-loop` mobile branch: `capture.type: ios-sim|android` captures the declared `mobile.cases`, runs per-case metrics + judge verdicts (`mobileChecks`), and skips web-only sections with an explicit log line
- Android capture adapter (adb `screencap` via `exec-out`, `/sdcard` pull fallback, `mobile.adbPath` + per-case `serial` overrides) — replaces the phase-2 stub
- sha256 provenance chain: capture metadata hash, metrics `source` block, and `vision:judge --verify-source`, which halts before verdict emission when its required inputs are missing
- Strict value-level verdict validation (mode/severity/ref types), with the runtime validator aligned to the judgment JSON schema

### Fixed

- Mobile run gate reflects the `mobileChecks` verdict set — any failing case exits 1; the inapplicable web score floor no longer fails clean mobile runs

## 2026-08-08 — Mobile Vision Loop (iOS, phase 1)

### Added

- `capture-mobile`: iOS Simulator screenshot adapter (simctl) + PNG sidecar meta
- `vision-metrics`: deterministic metrics engine (occupancy/density/palette/alignment/contrast)
- `vision-judge`: judge slot 3 modes (metrics/model/human) + shared verdict schema
- Android adapter: documented phase-2 stub

## Unreleased — operating modes, the re-check pass, and effects direction

### Added

- Ten operating modes (`npm run mode`): analyze, design-ui, match-ref, design-game, implement, debug, review, ship, author-skill, recover. Each declares what the phase may do, what it must not do yet, the gates that produce its evidence, its exit conditions, and its own re-check steps
- Thai and English mode routing (`mode resolve`) that exits non-zero on an ambiguous or unmatched request rather than assuming a mode, and a mode exit check that blocks on unrun gates, forbidden actions, missing confirmations such as **เริ่มเขียน**, and a skipped re-check
- The re-check pass (`npm run recheck`): a plan of ordered adversarial checks per mode, and an audit that rejects unbound claims, absolute language on thin evidence, impressions reported as findings, checks ticked off with no observation, clean verdicts with no falsification behind them, empty blind spots, and verdicts that contradict the findings. Self-review carries a higher bar than independent review
- Class-specific asset requirements: VFX declares timing, readability under overlap, and gameplay role; audio declares layers, mix bus, repetition plan, and a redundant non-audio cue; animation declares timing, cancel window, and telegraph. Sounds are exempt from silhouette, scale, and materials
- References: `operating-modes.md`, `recheck-protocol.md`, `vfx-and-sfx-direction.md`, `game-feel-and-juice.md`, with Thai versions of the two process references
- `templates/recheck-record.md`, `schemas/recheck-record.schema.json`, `examples/recheck.example.json`, and `prompts/recheck-pass.md`
- Two playbooks — effects and sound direction, and the pre-presentation re-check — plus a mode label on every existing playbook
- Ten additional pressure scenarios covering silent mode crossings, unrun gates, assumed modes, checkbox re-checks, unsearched clean verdicts, footnoted defects, self-review without a disconfirmer, effects approved on black, audio-only information, and feel tuned by impression
- `npm run validate -- --help` and `--output <path>` so the suite can print usage and write `VALIDATION_REPORT.json` outside a read-only skill directory

## Earlier unreleased — vision-in-the-loop, scenes, and game assets

### Added

- Visual delta triage (`npm run vision:triage`): ranks every reference↔current difference in perceptual order — structure, proportion, value, colour, density, polish — returns exactly one next change per round, writes a round ledger, and detects a stalled loop after three rounds without measurable convergence
- Scene completeness gate (`npm run audit:scene`): measures a frame zone by zone and blocks on empty corners, dead regions, missing focal hierarchy, flat value structure, and copy-paste tiling; audits the scene brief for fantasy, all three depth layers, focal point, lighting, and story details
- Game asset direction gate (`npm run audit:game-assets`): per-asset silhouette read, in-engine scale with a comparison reference, style binding, materials, palette, budget, acceptance distance, and in-context evidence, plus set-level checks for duplicate ids, mixed units, split styles, palette sprawl, silhouette repetition, and the frame triangle budget
- References: `visual-delta-triage.md`, `scene-completeness.md`, `game-vision-loop.md`, `game-asset-direction.md`, `world-building-and-level-blockout.md`, with Thai summaries for the triage loop and the game loop
- Role packs in `domains/ROLES/` for frontend, backend, security, data, platform/SRE, QA, product design, visual design, game design, gameplay, and technical art — each with what it owns, the gates it must pass, and its red flags
- `PLAYBOOKS.md` with copy-paste flows for screenshot redesign, reference matching, scene and map design, asset sets, Roblox maps, feature delivery, and skill health
- Schemas, templates, and examples for scene briefs and game asset sets; `prompts/vision-triage-loop.md` and `agents/scene-and-asset-critic.md`
- Eight additional pressure scenarios covering batched fixes, stall handling, tolerance tampering, abandoned frames, turntable approvals, scale without a reference, demo-seed generators, and match claimed from memory

## 5.0.0 — 2026-08-02

### Added

- Aesthetic direction layer supplying a positive model of visual quality, grounded in perception rather than reviewer preference
- Universal aesthetic principles with nine observable tests, and 0–5 anchors for every rating level rather than only for 5
- Validated aesthetic profile recording personality positions, reasons, accepted consequences, novelty budget, system intents, and voice
- Perceptual colour engine with OKLCH conversion, ramp evenness, contrast floors, harmony classification, and theme derivation checks
- Typography engine measuring step distinguishability, role coverage, line-height curve, weight steps, and measure in characters
- Spacing engine measuring scale conformance, proximity grouping ratios, nesting, responsive compression, and alignment edges
- Craft engine detecting non-nesting radii, conflicting shadow light sources, single-layer high elevation, sub-pixel borders, and mixed icon families
- Motion quality engine covering purpose, duration families, easing character, choreography, interruption, and reduced-motion parity
- Style lexicon of nine archetypes defined by measurable signatures, with drift detection against a declared direction
- Independent aesthetic review with dimension floors, required supporting findings, reviewer independence, and artifact binding
- Eighth `aesthetic` quality gate, `audit:aesthetics` and `aesthetics:review` commands, schemas, examples, templates, agent, and prompts
- Reference set covering craft standards, colour perception, typographic systems, spatial rhythm, motion quality, brand personality and tone, style lexicon, and copy voice
- Visual direction exploration protocol: when redesigning from screenshots, generate 2–3 ImageGen options, wait for a numbered choice, write `visual-direction-spec.md`, confirm with เริ่มเขียน/ปรับต่อ/เลือกใหม่, then bind into the aesthetic profile (`references/visual-direction-exploration.md`)
- Browser direction gallery (`npm run direction:gallery`) when the user cannot attach a screenshot or chat cannot show images — still presents options 1–3 as pictures
- Direction artifact scaffold (`npm run direction:init`) for `visual-direction-spec.md`, `aesthetic-profile.json`, and `design-contract.json`
- Spec↔profile sync (`npm run direction:sync` / `--check`) so personality axes and thesis stay consistent after เริ่มเขียน
- Direction iteration ledger (`npm run direction:iterate`) for 「ปรับต่อ」 rounds — records keep/change, option `Nb` image, and resets confirm
- Lightweight direction gate (`npm run direction:gate`) for PR/CI — requires confirmed `visual-direction-spec.md` without a browser
- Direction runtime adapter (`npm run direction:runtime`) classifying Cursor / Codex / CLI / CI and choosing inline, gallery-only, or prose-with-gap presentation
- IDE vs CLI prompt pack (`prompts/visual-direction-exploration-ide.md`, `…-cli.md`, `visual-direction-prompt-pack.md`)
- End-to-end camera direction example (`examples/direction-camera/`) with confirmed spec, profile, contract, and iteration ledger
- Cursor rule + `beforeSubmitPrompt` hook templates (`templates/cursor/`, `npm run direction:cursor-install`)

### Changed

- Skill conformance now requires the aesthetic direction references to be surfaced on the skill and `audit:aesthetics` to exist
- `schemas/design-contract.schema.json` gains optional audience, aesthetic profile, emotional tone, copy voice, and typed motion properties

### Fixed

- The semantic visual review fixture used a fixed timestamp and began failing its own freshness window once the date passed
- The validation suite parsed unit-test totals only from the TAP reporter, so newer Node versions reported a suite size of zero. It now reads either reporter and fails when totals cannot be parsed at all.
- Shadow length parsing no longer treats `rgba()` channel values as offset, blur, or spread
- `writeRunSummary` / `vision-loop` now load aesthetic evidence when `aesthetics.enabled` is true, so the eighth gate activates in the live runner rather than only in unit tests
- Required aesthetic evidence that is absent now fails the aesthetic gate instead of remaining a hard skip that could still leave the aggregate score above policy
- `loadAestheticEvidence` now enforces configured case coverage and reuses the evaluated review instead of re-scoring with an empty `expectedCaseKeys` list
- `vision-loop` computes provenance once per run instead of spawning git three times for the same config hash
- `audit:aesthetics` accepts `--tokens` and `--measurements` as documented
- Route `states` entries may be plain strings (`"default"`) instead of requiring `{ "name": "default" }`

### Preserved

- The complete v4 governed process kernel, v3 full-stack domain gates, and v2 frontend vision-loop surface. The aesthetic gate reports not-applicable until it is enabled, so upgraded pipelines produce unchanged gate results.

## 4.0.0 — 2026-07-27

### Added

- Deterministic process router covering every installed Superpowers discipline
- Audited design approval and executable implementation plans
- Conflict-aware task graph, workspace safety classification, and hash-linked recovery ledger
- TDD chronology/hash evidence and high-risk negative controls
- Boundary-led scientific debugging with architecture escalation
- Independent dual-verdict review, feedback adjudication, bounded fix loops, and final review
- Completion-claim verification and human-owned integration decisions
- Process configuration, reports, schemas, examples, templates, role contracts, prompts, and CLI commands
- Required hard process gate in the v4 full-stack release model
- Skill conformance and pressure-test surface

### Preserved

- Complete v3 full-stack domain gates and v2 frontend vision-loop surface

### Security

- Process CLI is non-mutating by default; workspace inspection is read-only and integration execution remains external
- Review independence, artifact binding, freshness, exact discard confirmation, and cleanup ownership fail closed

## 3.0.0 — 2026-07-27

### Added

- Full-stack skill workflow linking product design, frontend states, APIs, services, data, security, reliability, observability, debugging, risk, and release evidence
- Experience-contract audit
- OpenAPI quality and backward-compatibility audit
- Architecture graph and trust-boundary audit
- Data migration/backfill safety audit
- Security-control audit and redacting heuristic source-risk scanner
- Resilience timeout/retry/idempotency/amplification audit
- Critical-flow observability/SLO readiness audit
- Dependency and supply-chain manifest audit
- Owned risk-register evaluation
- Incident evidence and falsifiable-hypothesis triage
- Weighted full-stack gate with independent evidence confidence and hard failures
- Full-stack configuration, runner, Markdown/JSON reports, CLI commands, schemas, examples, agents, prompts, templates, and references
- v2-to-v3 migration guide

### Hardened

- Supported npm lockfiles are compared semantically with the reviewed dependency manifest; file presence alone is insufficient.
- Engineering checks use shell-free executable/argument execution by default and reject shell operators unless `allowShell: true` is explicitly reviewed.
- Source collection includes `.env` variants, skips symbolic links, and rejects resolved paths outside the configured root.
- Setup and CI suite installation use `--ignore-scripts`; browser installation remains an explicit separate action.

### Preserved

- Complete Frontend Vision Loop Pro v2 browser, visual, responsive, accessibility, interaction, performance, baseline, semantic-review, provenance, remediation, and CI tool surface

### Security

- Probable hardcoded secret values are redacted from source findings
- Offline scans are explicitly labelled heuristic and non-certifying
