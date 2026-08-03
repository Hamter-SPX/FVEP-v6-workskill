# Changelog

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
