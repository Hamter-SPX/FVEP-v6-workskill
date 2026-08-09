---
name: fullstack-vision-engineering-pro
description: Use when designing, implementing, debugging, reviewing, migrating, or releasing production full-stack systems where frontend fidelity, visual craft, backend correctness, security, data integrity, reliability, and governed agent-process evidence materially affect acceptance.
---

# Full-Stack Vision Engineering Pro

## Overview

This skill governs both **what is engineered** and **how the engineering work is performed**. It combines a frontend vision loop, an aesthetic direction layer, full-stack risk gates, and a deterministic process kernel inspired by proven agentic-development disciplines.

```text
route the work
→ inspect context
→ compare approaches
→ explore visual direction (ImageGen 1–2–3 when redesigning from screenshots)
→ declare the aesthetic direction
→ approve a design
→ validate an executable plan
→ establish isolation and a recovery ledger
→ prove RED before production behavior
→ implement the smallest coherent slice
→ render, probe, and verify domain behavior
→ measure craft and review expression
→ obtain independent spec and quality review
→ remediate through bounded fix loops
→ bind completion claims to fresh evidence
→ request a human-owned integration decision
```

**Core laws**

1. No implementation before an approved design and validated plan when the work is creative, architectural, or multi-step.
2. No production behavior without observed RED evidence first.
3. No fix before root-cause evidence and a falsifiable hypothesis.
4. No task completion without an independent dual-verdict review.
5. No release claim without fresh evidence bound to the current artifact.
6. No merge, push, cleanup, or discard decision made silently on the user’s behalf.
7. No visual acceptance from preference. Aesthetic judgment binds to stated principles, performed tests, and recorded findings.

The package does not create browser access, subagents, git remotes, production telemetry, or database environments that the host runtime lacks. Missing capability remains a verification gap.

For the shortest correct path through a common request — redesign from a screenshot, match a reference, design a scene or map, specify an asset set, ship a feature — start from `PLAYBOOKS.md`.

## Operating Modes

Every piece of work runs inside one of ten modes. A mode is a contract: what this phase may do, what it must not do yet, which gates produce its evidence, and what has to be true before it can close.

```bash
npm run mode -- resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย"     # pick the mode, in Thai or English
npm run mode -- show design-ui                            # the full contract
npm run mode -- check --mode design-ui --state .fx/mode-state.json
```

`analyze` · `design-ui` · `match-ref` · `design-game` · `implement` · `debug` · `review` · `ship` · `author-skill` · `recover`

`resolve` exits non-zero when no trigger matched or two modes are within a point, because entering the wrong mode is how an agent edits code during a question. `analyze` is the only mode that is always safe to enter unasked. Announce every mode crossing, so the user can stop it.

`check` refuses to close a mode while a required gate is unrun, a forbidden action was performed, a required confirmation such as **เริ่มเขียน** is missing, or the re-check pass has not happened. Read `references/operating-modes.md`.

## The Re-check Pass

Weak output usually comes from stopping one step early: the work gets done, an impression forms that it is fine, and the impression gets reported. No mode closes without replacing that impression with an adversarial pass against your own work.

```bash
npm run recheck -- plan --mode design-ui        # the ordered checks for this mode
npm run recheck -- audit --record .fx/recheck.json
```

Four questions, answered in writing: what exactly am I claiming, what proves each claim, how would I know if I were wrong, and what did I never look at. The audit blocks unbound claims, absolute language on thin evidence, checks ticked off with nothing observed, clean verdicts with no falsification behind them, and empty blind spots. Self-review carries a higher bar than independent review: three falsification attempts and a written answer to "what would change my mind".

If a check finds an issue, fix it before presenting. A footnote transfers your unfinished work to the reader. Read `references/recheck-protocol.md`.

## Skill Routing and Precedence

Always evaluate the work context before acting. The deterministic router is available through:

```bash
npm run process:route -- --input examples/process/request.feature.json
```

The operating precedence is:

1. user and repository instructions;
2. safety and destructive-action boundaries;
3. task-type process routing;
4. approved design and implementation plan;
5. domain-specific full-stack and frontend gates;
6. verification and integration governance.

Common routes:

| Work | Required process |
|---|---|
| New feature, redesign, architecture | Context exploration → alternatives → approval → plan → TDD |
| Bug or incident | Reproduction → boundary evidence → one hypothesis → regression RED → fix |
| Independent investigations | Parallel analysis only when files, resources, and mutable state do not conflict |
| Planned implementation with subagents | One implementer per task, independent review, bounded fix loop, final review |
| Planned implementation without subagents | Inline execution with the same checkpoints and evidence contracts |
| Skill authoring | Pressure tests → failing baseline → minimal skill → re-test → conformance audit |
| Completion or integration | Fresh packaged verification → explicit user decision → controlled cleanup |

Read `references/skill-routing-and-precedence.md` and `SUPERPOWERS_ADAPTATION_MATRIX.md`.

## The Flow Layer

Each process discipline also ships as a readable flow doc — Why → When → Steps → Evidence gates → Anti-patterns — and `npm run mode -- resolve` / `show` names the governing flow doc for every mode. After a mode is resolved, its flow doc is the source of truth for how the work proceeds: start at `flow/README.md` for the fourteen flows, and walk `GOLDEN_PATH.md` for one honest end-to-end pass across nine gates — 0–6 walked live on a real toy repo (`examples/golden-path/`), 7–8 documented as the human decisions they are.

## Domain packs

Product-shaped work lives under `domains/`:

| Domain | Path | Use for |
|---|---|---|
| GAME | `domains/GAME/` | Genres, graphics styles, HUD, assets, gameplay, tools, platforms |
| APPLICATION | `domains/APPLICATION/` | App/product UI and shipping surfaces |
| DESIGN | `domains/DESIGN/` | Visual direction, craft, brand options |
| GENERAL | `domains/GENERAL/` | Process, backend risk, release, skill work |
| ROLES | `domains/ROLES/` | What each discipline owns, its gates, and its red flags |

Start at `domains/README.md`. Load only the genre/system notes the task needs; process and aesthetic gates still apply.

Role packs answer "what does a frontend, backend, security, data, SRE, QA, product design, visual design, game design, gameplay, or tech-art pass require here" and route to the gates that produce that evidence. More than one usually applies.

## Vision in the Loop

`ref` is the image the user wants. `cur` is what was produced. Do not re-argue the whole render each round — measure it, rank the differences in perceptual order, and change exactly one thing.

```bash
npm run vision:triage -- --ref design/ref.png --cur artifacts/cur.png --history .fx/triage-history.json
npm run layout-structure -- check --structure .fx/ref-structure.json --cur artifacts/cur.png --region photo=95,735,62,60
npm run ascii-map -- --ref design/ref.png --cur artifacts/cur.png 92 735 62 60 --label PHOTO
```

Corrections are ordered `structure → proportion → value → colour → density → polish`, and the report names one next change. `vision:triage` exits non-zero while the frames differ, so an agent loop keeps iterating until it matches. Three rounds without measurable convergence is a stall: stop guessing and re-read the reference at region level.

Read `references/visual-delta-triage.md`.

## Scenes, Worlds, and Game Assets

A strong subject in the middle of an abandoned frame is not a finished scene, and a beautiful asset render is not a usable asset.

```bash
npm run audit:scene -- --image artifacts/frame.png --brief design/scene-brief.json --grid 8x5
npm run audit:game-assets -- --assets design/game-assets.json --frame-triangle-budget 250000
```

`audit:scene` measures the frame zone by zone and blocks on empty corners, dead regions, missing focal hierarchy, flat value structure, and copy-paste tiling; the scene brief must declare fantasy, all three depth layers, focal point, lighting, and story details. `audit:game-assets` requires each asset to state its silhouette read, in-engine scale with a comparison reference, style binding, budget, acceptance distance, and in-context evidence — a turntable render never approves an asset.

Effects, sound, and animation carry information and fail differently from props, so they carry extra required fields: VFX declares `timing`, `readability` under overlap, and whether it is gameplay-critical or decorative; sound declares `layers`, `mixBus`, `repetitionPlan`, and the `redundantCue` that carries the same information for muted or deaf players; animation declares `timing`, `cancelWindow`, and `telegraph`. A hero capture of one effect on a black background proves nothing about readability.

Read `references/game-vision-loop.md`, `references/scene-completeness.md`, `references/game-asset-direction.md`, `references/world-building-and-level-blockout.md`, `references/vfx-and-sfx-direction.md`, and `references/game-feel-and-juice.md`.

## Process Reference Map

Load only the references required by the routed work:

- `references/process-kernel-overview.md` — lifecycle, artifact chain, hard gates, and runtime degradation rules.
- `references/design-before-implementation.md` — context exploration, alternatives, approval, and design self-review.
- `references/executable-planning.md` — task boundaries, interfaces, dependencies, exact verification, and plan defects.
- `references/tdd-evidence-protocol.md` — chronology, RED validity, GREEN binding, negative controls, and refactor proof.
- `references/scientific-debugging-protocol.md` — reproduction, boundary localization, falsifiable hypotheses, and architecture escalation.
- `references/review-and-feedback-governance.md` — reviewer independence, dual verdicts, finding disposition, and bounded fix loops.
- `references/verification-and-claim-governance.md` — claim-to-evidence binding, freshness, scope, and completion language.

Supporting references cover task isolation, subagent lifecycle, workspace safety, recovery ledgers, integration, and skill conformance.

## Aesthetic Direction Layer

Anti-generic heuristics prevent the worst output; they do not produce work people find attractive. The aesthetic layer supplies the positive model, and it is grounded in perception rather than in the reviewing agent's preference.

- `references/visual-direction-exploration.md` — when redesigning from screenshots, generate 2–3 ImageGen options, wait for a numbered choice, then bind it.
- `references/aesthetic-direction-protocol.md` — when direction is set, what artifact records it, and where it binds to the gates.
- `references/aesthetic-principles.md` — fluency, grouping, balance, proportion, contrast, rhythm, unity, the novelty budget, and the nine tests that make each observable.
- `references/aesthetic-scoring-anchors.md` — the 0–5 anchors for every level, dimension weights, and the decision rule.
- `references/visual-craft-standards.md` — optical alignment, nested radii, shadow physics, borders, gradients, imagery, and micro-typography.

Supporting system references cover colour and perception, typographic systems, spatial rhythm, motion quality, brand personality and tone, the style lexicon, and copy voice.

Three rules govern the layer. Structure passes before surface, and static geometry passes before motion. A weighted average never compensates for a dimension below its floor. A rating below 3 requires a recorded finding, and a rating of 5 requires a performed test.

For screenshot redesigns, visible option exploration precedes profile authorship: do not implement from an unchosen mock.

## Required Artifact Chain

For material work, maintain these artifacts:

- **Request context** — task type, stage, risk, tools, constraints, and current approvals.
- **Design contract** — explored context, alternatives, recommendation, architecture, data flow, error behavior, testing, approval, and self-review.
- **Implementation plan** — exact files, interfaces, dependencies, RED/GREEN commands, expected outputs, and commits.
- **Workspace snapshot** — repository/worktree/submodule state, branch protection, cleanup ownership, and isolation evidence.
- **Process ledger** — append-only hashed lifecycle events that survive context loss.
- **TDD evidence** — behavior identity, command output hashes, chronology, code/test hashes, and negative controls for high-risk work.
- **Debug session** — reproduction, boundary evidence, hypotheses, experiments, fix attempts, and architecture escalation.
- **Review chain** — bounded diff, implementer identity, independent reviewer identities, spec verdict, quality verdict, findings, fix rounds, and final review.
- **Claims and evidence** — every public completion claim linked to current, passing, scoped evidence.
- **Integration decision** — explicit actor, option, timestamp, current verification, and destructive confirmation when applicable.

Use the schemas in `schemas/`, examples in `examples/process/`, and templates in `templates/`.

## Workflow

### 1. Route and inspect

Run the skill router. Inspect repository conventions, instructions, build/test commands, architecture, user flows, data boundaries, security controls, deployment, telemetry, and existing design system before editing.

### 2. Design before implementation

For creative or architectural work, compare at least two viable approaches. Record trade-offs and a recommendation. The design must cover architecture, components, data flow, error handling, and testing. Implementation starts only after approval or a narrowly-scoped, explicitly governed best-effort exception.

For rendered surfaces, first inspect the existing design system. When the user attached screenshots and asked to redesign, run visual direction exploration (`references/visual-direction-exploration.md`): generate two or three distinct ImageGen options, stop for a numbered choice, then declare an aesthetic profile from that choice — a position on each personality axis with its reasons and accepted consequences, the novelty budget, the intended colour, type, spacing, shape, and motion systems, and the voice. Every entry must be checkable against a render. Unconstraining terms such as modern, clean, or premium are not direction, and a style archetype is never the visual thesis.

### 3. Write an executable plan

Tasks must have stable IDs, dependency edges, exact files, producer/consumer interfaces, and the complete test-first cycle. A task is not executable when it contains vague steps, undefined interfaces, placeholders, or dependency cycles.

### 4. Establish isolation and recovery

Classify the workspace before changing code. Avoid implementation on protected branches. Project-owned worktrees may be cleaned only when ownership is proven. Append lifecycle events to a hash-linked ledger so recovery does not depend on conversation memory.

### 5. Use TDD and scientific debugging

For new behavior, record RED before production changes, then GREEN against the changed artifact. For high-risk behavior, add a negative control or equivalent mutation/revert proof.

For bugs, first stabilize reproduction and localize the transition from last confirmed-good to first confirmed-bad boundary. Test one hypothesis and one variable at a time. A fourth failed speculative fix requires architectural review rather than another guess.

### 6. Implement a complete vertical slice

Include the relevant frontend state, API contract, authorization, data invariant, transaction behavior, resilience policy, observability, and tests. Run the frontend vision loop for rendered surfaces and the full-stack domain audits for system behavior.

For rendered surfaces, run the mechanical aesthetic audit before asking anyone to spend judgment, then obtain an independent aesthetic review on current renders:

```bash
npm run audit:aesthetics -- --input aesthetic-audit.json
npm run aesthetics:review -- --config vision-loop.config.json
npm run vision-loop -- --config vision-loop.config.json
```

When `aesthetics.enabled` is true, `vision-loop` loads the profile, optional measurements, and review into the run summary and scores the eighth `aesthetic` gate. Use `--skip-aesthetics` only for diagnostics.

### 7. Review independently

Every task review must be bound to the same brief and bounded change package. It requires both:

- **Spec verdict:** whether the change implements the approved requirements.
- **Quality verdict:** whether the implementation is correct, maintainable, secure, and appropriately tested.

The implementer cannot approve their own task or final change. Critical and important findings remain open until fixed and re-reviewed, or governed at the circuit-breaker boundary with an explicit technical ruling. Load-bearing findings cannot be parked.

### 8. Verify claims and release gates

Run:

```bash
npm run process:audit -- --config process.config.json
npm run audit:fullstack -- --config fullstack.config.json
npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json
```

The governed process report is a required hard full-stack gate by default. High visual, backend, or security scores cannot average away missing process evidence.

### 9. Request the integration decision

When all required evidence is current, present the allowed integration options. The user chooses merge, pull request, or keep-as-is. Discard requires the exact confirmation token and a complete inventory. Cleanup occurs only for workspaces the system owns and only after the relevant merged-result verification.

## Domain Quality Gates

The retained domain suite covers:

- Frontend screenshot/perceptual/region comparison, responsive states, accessibility, interactions, performance, baseline provenance, and design-token drift.
- Aesthetic direction: profile specificity, perceptual colour ramps and contrast, type scale distinguishability and measure, spacing conformance and proximity grouping, craft precision, motion quality, style-signature drift, and the independent aesthetic review.
- Product experience contracts linking UI states to backend operations and recovery.
- API quality and backward compatibility.
- Architecture ownership, trust boundaries, dependency cycles, and single points of failure.
- Data invariants, concurrency, transactions, migrations, and backfills.
- Authentication, resource-level authorization, threat models, and redacting heuristic source scans.
- Timeout budgets, retries, idempotency, amplification, fallbacks, and circuit breaking.
- Logs, metrics, traces, correlation, SLOs, alerts, dashboards, and runbooks.
- Dependency lock integrity, remote sources, lifecycle scripts, incident hypotheses, and owned risks.

## Non-Negotiable Red Flags

Stop and return to the correct phase when any of these occurs:

- Editing before context inspection
- Implementing a creative change without design approval
- Starting a multi-step change without an executable plan
- Writing production behavior before observing RED
- Fixing a symptom before localizing the failing boundary
- Running parallel implementers against shared files or mutable resources
- Letting the implementer self-approve
- Treating reviewer feedback as automatically correct without codebase verification
- Repeating fix rounds beyond the circuit breaker
- Comparing frontend appearance from memory instead of a current render
- Changing several variables in one vision-loop round, so no improvement can be attributed
- Repainting colour or texture while the triage still reports an open structure difference
- Running a fourth speculative round after three rounds without measurable convergence
- Approving a frame whose corners, background, or depth layers were never measured
- Accepting a game asset from a turntable render instead of a gameplay-camera capture
- Stating an asset's size without a unit and a comparison reference
- Declaring an aesthetic direction in terms that cannot be checked against a render
- Redesigning from a screenshot without presenting numbered visual options when image exploration is required
- Implementing UI code in the same turn as an unchosen ImageGen option set
- Recording a chosen look only in chat without writing `visual-direction-spec.md`
- Starting implementation after option selection without an explicit **เริ่มเขียน** (or equivalent) confirm
- Polishing craft or motion before composition and states are approved
- Raising a preference as a defect, or approving a low dimension score because the average is acceptable
- Calling a static source scan a security certification
- Claiming completion from stale, partial, differently-hashed, or unscoped evidence
- Selecting merge, push, cleanup, or discard for the user
- Crossing into another mode without saying so, so the user cannot stop it
- Closing a mode with a required gate unrun, or with a forbidden action already performed
- Presenting work without the re-check pass, or reporting a clean verdict with no falsification behind it
- Stating a claim the re-check could not bind to a command, file, or capture
- Presenting the work with a re-check finding attached as a footnote instead of fixing it
- Approving a VFX from one instance on a black background rather than three at play distance
- Shipping a sound whose information has no visual or haptic partner
- Tuning game feel from impression instead of the declared timing, buffer, and cancel numbers

## CLI Surface

```text
mode                 Resolve, show, and close the ten operating modes with their contracts
recheck              Plan and audit the adversarial pass against your own work
process:route        Select required process disciplines
process:workspace    Classify repository/worktree safety
process:plan         Validate plan quality and task graph
process:tdd          Validate RED–GREEN–REFACTOR evidence
process:review       Validate independent review and fix loops
process:integration  Validate an explicit integration decision
process:audit        Combine process sections into a release gate
audit:aesthetics     Measure colour, type, spacing, craft, motion, and style against a declared profile
aesthetics:review    Validate an independent aesthetic review against floors, findings, and freshness
direction:gallery    Open a local HTML gallery of direction options 1–3 in the default browser
direction:init       Scaffold design/visual-direction-spec.md, aesthetic-profile.json, and design-contract.json
direction:sync       Sync or --check drift between visual-direction-spec.md and aesthetic-profile.json
direction:iterate    Record a 「ปรับต่อ」 round (keep/change + option Nb image) and reset confirm
direction:gate       Lightweight PR/CI check that the direction spec is confirmed เริ่มเขียน (no browser)
direction:runtime    Detect Cursor/Codex/CLI/CI and print the ImageGen presentation plan
direction:cursor-install  Install Cursor rule + redesign hook into a project .cursor/
vision-loop          Capture, inspect, compare, load semantic + aesthetic evidence, and write the run summary
vision:triage        Rank every ref↔cur difference in perceptual order and return one next change
audit:scene          Measure a frame zone by zone: empty corners, focal hierarchy, value structure, tiling
audit:game-assets    Audit a game asset set: silhouette, scale reference, style binding, budget, in-context proof
ascii-map            Render or compare an image region as an ASCII/digit density map
layout-structure     Remember a reference layout and check current renders against it
skill:conformance    Audit the skill's metadata, references, pressure coverage, TDD evidence, and CLI identity
docs:all-in-one      Regenerate the deterministic combined Markdown reference
release:build        Build and verify the clean deterministic release directory, manifest, checksums, ZIP, and SHA sidecar
```

The existing `audit:*`, `debug:triage`, and full-stack commands remain available. Release packaging must exclude host state and must pass archive integrity checks before distribution.

## Completion Report Contract

Report results in this order:

1. objective and current artifact identity;
2. design and plan identities;
3. files and behavior changed;
4. RED/GREEN and debugging evidence;
5. frontend, aesthetic, and full-stack gate results;
6. review identities, verdicts, findings, and fix rounds;
7. commands run with actual outcomes;
8. quality score and evidence confidence;
9. residual risks and verification gaps;
10. allowed integration choices, without silently selecting one.

Read `references/verification-and-claim-governance.md` before using words such as finished, fixed, matched, secure, or production-ready.
