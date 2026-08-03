# Full-Stack Vision Engineering Pro v5 — All-in-One Reference

> Version: 5.0.0
> This file is generated deterministically from the authoritative modular documents listed below. Edit the source files, then regenerate this bundle.

## Contents

1. `SKILL.md`
2. `README.md`
3. `README_TH.md`
4. `ARCHITECTURE.md`
5. `SECURITY.md`
6. `SUPERPOWERS_ADAPTATION_MATRIX.md`
7. `MIGRATION_V3_TO_V4.md`
8. `MIGRATION_V4_TO_V5.md`
9. `UPGRADE_REPORT_V4_TH.md`
10. `UPGRADE_REPORT_V5_TH.md`
11. `references/process-kernel-overview.md`
12. `references/skill-routing-and-precedence.md`
13. `references/design-before-implementation.md`
14. `references/executable-planning.md`
15. `references/tdd-evidence-protocol.md`
16. `references/scientific-debugging-protocol.md`
17. `references/parallel-task-isolation.md`
18. `references/subagent-task-lifecycle.md`
19. `references/review-and-feedback-governance.md`
20. `references/workspace-and-branch-safety.md`
21. `references/verification-and-claim-governance.md`
22. `references/integration-and-cleanup.md`
23. `references/skill-authoring-conformance.md`
24. `references/context-recovery-ledger.md`
25. `references/fullstack-operating-model.md`
26. `references/experience-design-to-system-contract.md`
27. `references/backend-architecture-and-domain-boundaries.md`
28. `references/backend-design-quality-gates.md`
29. `references/api-contracts-and-compatibility.md`
30. `references/data-integrity-transactions-and-migrations.md`
31. `references/data-privacy-and-classification.md`
32. `references/application-security-and-threat-modeling.md`
33. `references/resilience-and-distributed-failure-modes.md`
34. `references/observability-slos-and-incident-readiness.md`
35. `references/fullstack-systematic-debugging.md`
36. `references/risk-discovery-and-adversarial-review.md`
37. `references/dependency-and-supply-chain-risk.md`
38. `references/fullstack-release-and-rollback.md`
39. `references/vision-loop-protocol.md`
40. `references/reference-reconstruction.md`
41. `references/responsive-and-state-matrix.md`
42. `references/frontend-engineering-gates.md`
43. `references/accessibility-and-interaction.md`
44. `references/performance-and-runtime.md`
45. `references/anti-generic-design.md`
46. `lib/direction-gallery-engine.mjs`
47. `scripts/open-direction-gallery.mjs`
48. `lib/direction-init-engine.mjs`
49. `scripts/init-direction.mjs`
50. `lib/direction-spec-sync-engine.mjs`
51. `scripts/sync-direction-spec.mjs`
52. `lib/direction-iterate-engine.mjs`
53. `scripts/iterate-direction.mjs`
54. `lib/direction-gate-engine.mjs`
55. `scripts/direction-gate.mjs`
56. `lib/direction-runtime-engine.mjs`
57. `scripts/detect-direction-runtime.mjs`
58. `scripts/install-direction-cursor.mjs`
59. `prompts/visual-direction-prompt-pack.md`
60. `prompts/visual-direction-exploration-ide.md`
61. `prompts/visual-direction-exploration-cli.md`
62. `examples/direction-camera/README.md`
63. `templates/cursor/README.md`
64. `references/visual-direction-exploration.md`
65. `references/visual-direction-exploration_TH.md`
66. `references/aesthetic-direction-protocol.md`
67. `references/aesthetic-principles.md`
68. `references/aesthetic-direction-protocol_TH.md`
69. `references/aesthetic-principles_TH.md`
70. `AESTHETIC_WALKTHROUGH.md`
71. `references/aesthetic-scoring-anchors.md`
72. `references/visual-craft-standards.md`
73. `references/color-system-and-perception.md`
74. `references/typographic-system-quality.md`
75. `references/spatial-composition-and-rhythm.md`
76. `references/motion-quality-standards.md`
77. `references/brand-personality-and-tone.md`
78. `references/visual-style-lexicon.md`
79. `references/copy-voice-and-microcopy.md`
80. `templates/task-brief.md`
81. `templates/aesthetic-profile.md`
82. `templates/aesthetic-review.md`
83. `templates/visual-direction-spec.md`
84. `templates/review-package.md`
85. `templates/feedback-ruling.md`
86. `templates/tdd-evidence.md`
87. `templates/debug-session.md`
88. `templates/integration-decision.md`
89. `agents/process-controller.md`
90. `agents/task-implementer.md`
91. `agents/task-reviewer.md`
92. `agents/re-reviewer.md`
93. `agents/final-reviewer.md`
94. `agents/aesthetic-critic.md`
95. `prompts/process-controller.md`
96. `prompts/visual-direction-exploration.md`
97. `prompts/aesthetic-critique.md`
98. `prompts/aesthetic-direction.md`
99. `prompts/task-implementer.md`
100. `prompts/task-reviewer.md`
101. `prompts/re-reviewer.md`
102. `prompts/final-reviewer.md`
103. `tests/process-pressure-scenarios-v4.md`
104. `tests/TDD_EVIDENCE_V4.md`

---

## Source: `SKILL.md`

<!-- BEGIN SOURCE: SKILL.md -->

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

## CLI Surface

```text
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

<!-- END SOURCE: SKILL.md -->

---

## Source: `README.md`

<!-- BEGIN SOURCE: README.md -->

# Full-Stack Vision Engineering Pro v5.0.0

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

## Requirements

- Node.js 20 or later
- The repository or isolated copy under review
- JSON contracts for the enabled process and domain gates
- A runnable application and Playwright browser for live frontend evidence
- Real database, telemetry, deployment, or security tooling when those claims are required

This package does not provide a subagent runtime, browser, git remote, production environment, database, or telemetry service by itself. It can create and validate the artifacts those capabilities must produce, but it cannot invent unavailable evidence.

## Install

```bash
unzip fullstack-vision-engineering-pro-v5.0.0.zip
cd fullstack-vision-engineering-pro-v5
./setup.sh
```

Windows PowerShell:

```powershell
Expand-Archive .\fullstack-vision-engineering-pro-v5.0.0.zip -DestinationPath .
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
  --archive ../fullstack-vision-engineering-pro-v5.0.0.zip
```

The release builder skips symlinks and development state, rejects unsafe member paths, uses a single archive root, and verifies local headers, the central directory, CRC values, sizes, duplicate members, checksums, and deterministic ordering before returning success.

## Documentation map

- `SKILL.md` — main agent workflow
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

<!-- END SOURCE: README.md -->

---

## Source: `README_TH.md`

<!-- BEGIN SOURCE: README_TH.md -->

# Full-Stack Vision Engineering Pro v5.0.0

ชุด **Agent Skill + Engineering Toolkit** ระดับ Production ที่รวมสี่ระบบไว้ในวงจรเดียว:

1. **Frontend Vision Engineering** — เปิดหน้าเว็บจริง จับภาพ เปรียบเทียบ Responsive, Accessibility, Interaction และ Performance
2. **Aesthetic Direction** — โมเดลความงามเชิงบวกที่อิงหลักการรับรู้ของมนุษย์ พร้อมการวัด Colour, Typography, Spacing, Craft, Motion, Style และ Review เชิงวิจารณญาณที่เป็นอิสระ
3. **Full-Stack Risk Engineering** — ตรวจ API, Architecture, Data, Security, Resilience, Observability, Dependency, Incident และ Release
4. **Deterministic Process Kernel** — บังคับ Design ก่อน Code, Plan ที่รันได้, Workspace Isolation, TDD Evidence, Scientific Debugging, Independent Review, Recovery Ledger, Claim Verification และการตัดสินใจ Integration โดยผู้ใช้

Process Kernel เป็นการดัดแปลงเชิงต้นฉบับจากหลักการที่แข็งแรงของ Superpowers ทุกสกิลที่ติดตั้ง โดยไม่ได้เอาเนื้อหามารวมเป็น Prompt ยาวก้อนเดียว แต่เปลี่ยนเป็น Engine, Contract, CLI, Schema, Example, Pressure Scenario และ Hard Gate ที่ตรวจได้จริงสำหรับงาน Frontend/Full-Stack

## จุดที่เพิ่มขึ้นใน v5

รุ่นก่อนหน้าบอกได้แค่ว่า "อะไรที่ต้องปฏิเสธ" — Card Grid, Glow, Glass, Hero ตัวใหญ่ไร้สาระ, Motion ที่ไม่มีเหตุผล ซึ่งกันงานแย่ได้ แต่ไม่ได้ทำให้เกิดงานที่คนรู้สึกว่าสวย และปล่อยให้คำว่า "Emotional and brand character" ลอยอยู่โดยไม่มีนิยาม

v5 เติมโมเดลเชิงบวกเข้าไป โดยจงใจให้เป็นหลักสากล คืออธิบายกลไกการรับรู้ที่คงที่ข้ามผลิตภัณฑ์และข้ามยุค ไม่ใช่เทรนด์:

- **หลักการที่มีวิธีทดสอบ** — Fluency, Grouping, Balance, Proportion, Contrast, Rhythm, Unity โดยแต่ละข้อมีการทดสอบที่สังเกตได้จริง (เบลอภาพ, ห้าวินาที, ขาวดำ, ไล่แนวขอบ, ลบองค์ประกอบ, นับคลัง, วัดช่องไฟ, สลับโลโก้, อัดเนื้อหาจริง) ทำให้ Finding เป็นหลักฐาน ไม่ใช่ความรู้สึก
- **Anchor ครบทุกระดับ** — เดิมสเกล 0–5 นิยามแค่ว่า 5 คืออะไร ตอนนี้ทุกระดับมีนิยาม มีคะแนนขั้นต่ำรายมิติ และมีกฎว่าค่าเฉลี่ยถ่วงน้ำหนักไม่สามารถกลบมิติที่ต่ำกว่าขั้นต่ำได้
- **ทิศทางที่ตรวจสอบได้** — Aesthetic Profile บันทึกตำแหน่งบนแกนบุคลิก 5 แกน พร้อมเหตุผลและผลที่ยอมรับ, งบความแปลกใหม่ที่จำกัด, เจตนาของระบบ และน้ำเสียง คำที่ไม่ผูกมัดอย่าง modern, clean, premium จะถูก Profile Audit ปฏิเสธ
- **วัดในส่วนที่วัดได้** — Ramp สีเชิงการรับรู้ด้วย OKLCH, ขั้นต่ำ Contrast, ความต่างที่แยกออกของ Type Scale, ความยาวบรรทัดเป็นตัวอักษร, ความสอดคล้องของ Spacing และสัดส่วนการจัดกลุ่ม, Radius ซ้อน, ทิศแหล่งกำเนิดแสงของเงา, ตระกูล Duration และ Easing ของ Motion และการเบี่ยงเบนของ Style Signature จาก Archetype ที่ประกาศไว้
- **วิจารณญาณที่มีการกำกับ** — ให้คะแนนต่ำกว่า 3 ต้องมี Finding, ให้ 5 ต้องมีการทดสอบที่บันทึกไว้, Implementer อนุมัติงานตัวเองไม่ได้ และข้อบกพร่องที่เกิดทั้งระบบจะถูกพักไว้เป็น Residual ไม่ได้

## จุดที่แข็งขึ้นจาก v3

ต่อให้ Build, Frontend และ Backend ได้คะแนนสูง Release ยังถูกบล็อกได้เมื่อ:

- งานสร้างสรรค์ยังไม่มี Design Approval
- Plan มี Dependency cycle หรือ Interface ไม่ครบ
- เขียน Production Code ก่อนเห็น Test แดงจริง
- Debug ด้วยการเดาโดยยังไม่รู้ First Failing Boundary
- Implementer ตรวจและอนุมัติงานตัวเอง
- Review ไม่มีทั้ง Spec Verdict และ Quality Verdict
- Finding ระดับ Critical/Important ยังเปิดอยู่
- หลักฐานเก่า คนละ Artifact Hash หรือครอบคลุมไม่ครบ
- ระบบเลือก Merge, Push, Cleanup หรือ Discard แทนผู้ใช้

ระบบแยก:

```text
Quality Score       = คุณภาพที่หลักฐานซึ่งตรวจแล้วรองรับ
Evidence Confidence = ความครบถ้วน ความสดใหม่ ขอบเขต ความเป็นอิสระ และการผูกกับ Artifact ปัจจุบัน
```

## ข้อกำหนด

- Node.js 20 ขึ้นไป
- Repository หรือสำเนาที่แยกจากงานหลัก
- JSON Contracts สำหรับ Gate ที่เปิดใช้
- เว็บที่รันได้และ Playwright เมื่อจะยืนยันผลด้านภาพ
- Database, Telemetry, Deployment และ Security Tool จริงเมื่อจะกล่าวอ้างด้านนั้น

แพ็กเกจนี้ไม่สามารถสร้าง subagent, browser, git remote, production environment, database หรือ telemetry ที่ runtime ไม่มีให้ได้ ตัวระบบจะสร้างและตรวจ Artifact Contract ได้ แต่จะไม่แต่งหลักฐานที่ไม่มีอยู่จริง

## ติดตั้ง

```bash
unzip fullstack-vision-engineering-pro-v5.0.0.zip
cd fullstack-vision-engineering-pro-v5
./setup.sh
```

Windows PowerShell:

```powershell
Expand-Archive .\fullstack-vision-engineering-pro-v5.0.0.zip -DestinationPath .
Set-Location .\fullstack-vision-engineering-pro-v5
.\setup.ps1
```

ติดตั้งด้วยตนเอง:

```bash
npm install --ignore-scripts --no-audit --no-fund
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json
cp examples/process/process.config.json process.config.json
cp fullstack.config.example.json fullstack.config.json
npm run validate
```

## เริ่มใช้งาน Process Kernel

```bash
npm run process:route -- --input examples/process/request.feature.json
npm run process:plan -- --input examples/process/implementation-plan.json
npm run process:tdd -- --input examples/process/tdd-cycles.json
npm run process:review -- --input examples/process/review-chain.json
npm run process:audit -- --config examples/process/process.config.json
```

ผลลัพธ์:

```text
examples/process/artifacts/process-report.json
examples/process/artifacts/process-report.md
```

รายงานจะแสดง Required Sections, Quality Score, Evidence Confidence แบบ weakest-link, Blockers, Recovery State และ Next Actions ที่อนุญาต

## Frontend และ Full-Stack

```bash
npm run vision-loop -- --config vision-loop.config.json
npm run audit:fullstack -- --config fullstack.config.json
npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json
```

`fullstack.config.json` รองรับ Process Hard Gate:

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

## คำสั่ง Process

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run process:route` | เลือก discipline ที่จำเป็นตามชนิดและระยะของงาน |
| `npm run process:workspace` | ตรวจ Worktree, Submodule, Protected Branch และสิทธิ์ Cleanup |
| `npm run process:plan` | ตรวจ Dependency, File Scope, Interface และขั้น RED/GREEN |
| `npm run process:tdd` | พิสูจน์ว่า RED เกิดก่อน Code และ GREEN ผูกกับ Code/Test เดิม |
| `npm run process:review` | ตรวจ Reviewer Independence, Dual Verdict, Finding และ Fix Loop |
| `npm run process:integration` | ตรวจการตัดสินใจ Merge/PR/Keep/Discard โดยไม่ execute อัตโนมัติ |
| `npm run process:audit` | รวมทุกส่วนเป็น Process Report และ Hard Gate |

## คำสั่งด้าน Aesthetic

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run audit:aesthetics` | วัด Colour, Typography, Spacing, Craft, Motion และ Style Signature เทียบกับ Profile ที่ประกาศไว้ |
| `npm run aesthetics:review` | ตรวจ Aesthetic Review ว่าผ่านคะแนนขั้นต่ำรายมิติ มี Finding รองรับ ผู้ตรวจเป็นอิสระ และผูกกับ Artifact ปัจจุบัน |
| `npm run vision-loop` | รวม capture/inspect/compare + โหลด semantic และ aesthetic evidence แล้วเขียน run summary |

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
npm run vision-loop -- --config vision-loop.config.json
```

คู่มือทีละขั้น: `AESTHETIC_WALKTHROUGH.md` · สรุปภาษาไทย: `references/aesthetic-direction-protocol_TH.md`, `references/aesthetic-principles_TH.md`, `references/visual-direction-exploration_TH.md`

ถ้าผู้ใช้ส่งภาพหน้าจอแล้วขอ redesign ให้ Gen ตัวอย่าง **1 / 2 / 3** ก่อน (`references/visual-direction-exploration.md`) แล้วค่อยเขียน profile

รัน Audit เชิงกลไกก่อนเสมอ เพราะผลลัพธ์คือข้อเท็จจริงที่ไม่ต้องถกเถียง แล้วค่อยให้ผู้ตรวจใช้วิจารณญาณกับสิ่งที่วัดไม่ได้ เปิดใช้ Gate ใน `vision-loop.config.json`:

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

ตราบใดที่ยังไม่เปิด Gate `aesthetic` จะรายงานเป็น not-applicable และไม่กระทบคะแนนคุณภาพ ดังนั้น Pipeline v4 ที่อัปเป็น v5 จะได้ผล Gate เท่าเดิม

## วงจรการทำงาน

```text
Request
→ Skill Routing
→ Context Exploration
→ เปรียบเทียบแนวทาง
→ Design Approval
→ Executable Plan
→ Safe Workspace
→ Hash-linked Recovery Ledger
→ RED–GREEN–REFACTOR / Scientific Debugging
→ Vertical Slice
→ Frontend + Full-Stack Gates
→ Independent Task Review
→ Bounded Fix Loop + Scoped Re-review
→ Final Whole-change Review
→ Claims ที่ผูกกับหลักฐานสดใหม่
→ Process Hard Gate
→ Full-Stack Hard Gate
→ ผู้ใช้เลือก Integration
```

### งานขนาน

ระบบอนุญาต Parallel Analysis เมื่อปัญหาเป็นอิสระ แต่ Parallel Implementation จะผ่านได้ต่อเมื่อ Task ที่พร้อมทำงานไม่แตะไฟล์เดียวกัน ไม่ใช้ Exclusive Resource ร่วมกัน และไม่มี Mutable State ร่วมกัน Task-graph engine จะสร้าง execution waves ที่ปลอดภัย

### การกู้สถานะเมื่อ Context หาย

Process Ledger เป็น Hash Chain แบบ append-only บันทึก Plan ID, Lifecycle State, Task State, Fix Round, Finding และ Last Hash Controller ใหม่จึงกู้ตำแหน่งงานจาก Artifact ได้ ไม่ต้องเชื่อความจำจากบทสนทนา

### Review Governance

Review ทุก Task ต้องผูกกับ Brief และ Diff ที่แน่นอน พร้อมทั้ง Spec Verdict และ Quality Verdict Implementer ห้ามอนุมัติงานตัวเอง Finding สำคัญต้องถูกแก้และ Re-review วงรอบแก้ถูกจำกัดไม่เกินห้ารอบ และ Finding ที่เป็นโครงสร้างสำคัญห้ามถูกพักเพื่อให้ระบบดูผ่าน

### Claim Governance

คำกล่าวอ้าง เช่น tests-pass, bug-fixed, visual-match, security-gates-pass และ production-ready ต้องมี Evidence Type ที่ตรงกัน สดใหม่ ผ่านจริง ครอบคลุมขอบเขต และใช้ Artifact Hash เดียวกัน ระบบไม่รองรับคำกล่าวอ้างแบบสัมบูรณ์ว่า “secure”

## Self-conformance และ Deterministic Release

ตรวจตัว Skill ว่า Frontmatter, References, Pressure Scenarios, Superpowers Coverage, TDD Deployment Evidence และ CLI Surface ครบตาม Contract:

```bash
npm run skill:conformance -- --root .
```

สร้างเอกสารรวมจากไฟล์ Modular ต้นทางแบบ Deterministic:

```bash
npm run docs:all-in-one
```

สร้าง Release Directory, ZIP, Manifest, Checksums และไฟล์ SHA-256 ของ ZIP:

```bash
npm run release:build -- \
  --source . \
  --output ../fullstack-vision-engineering-pro-v5 \
  --archive ../fullstack-vision-engineering-pro-v5.0.0.zip
```

Release Builder จะข้าม Symlink และ Development State, ปฏิเสธ Path ที่ไม่ปลอดภัย, บังคับ Single-root ZIP และตรวจ Local Headers, Central Directory, CRC, ขนาดไฟล์, Duplicate Members, Checksum และ Deterministic Ordering ก่อนรายงานว่าผ่าน

## เอกสารสำคัญ

- `SKILL.md`
- `SUPERPOWERS_ADAPTATION_MATRIX.md`
- `MIGRATION_V3_TO_V4.md` และ `MIGRATION_V4_TO_V5.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `references/aesthetic-direction-protocol.md` — จุดที่ทิศทางด้านความงามเชื่อมเข้ากับกระบวนการ
- `references/aesthetic-principles.md` และ `references/aesthetic-scoring-anchors.md` — ตัวโมเดล วิธีทดสอบ และ Anchor ของคะแนน
- `references/`
- `schemas/`
- `examples/process/`
- `templates/`
- `agents/` และ `prompts/`
- `tests/process-pressure-scenarios-v4.md`

## ข้อจำกัดที่ต้องรายงานตรงไปตรงมา

การตรวจ Offline ยืนยัน Syntax, Unit Tests, Config, Engine, CLI, Checksum และ ZIP ได้ แต่ไม่สามารถยืนยันสิ่งต่อไปนี้โดยไม่มีระบบจริง:

- ภาพ UI จาก Browser ของโปรเจกต์เป้าหมาย
- Authorization และ Secret Configuration ใน Production
- Lock/Load ของ Database และ Rollback จริง
- Vulnerability ปัจจุบันจากฐานข้อมูลภายนอก
- Distributed Trace, Alert และ SLO Delivery
- Deployment จริง
- พฤติกรรมหลาย Agent อย่างเป็นอิสระ เมื่อ Host ไม่มี subagent capability

สิ่งที่ยังตรวจไม่ได้จะถูกแสดงเป็น Verification Gap ไม่ถูกนับเป็น Pass

<!-- END SOURCE: README_TH.md -->

---

## Source: `ARCHITECTURE.md`

<!-- BEGIN SOURCE: ARCHITECTURE.md -->

# Architecture — v5

## System layers

```text
Host agent/runtime
  ↕ JSON/Markdown contracts
Process kernel
  ├─ routing and design governance
  ├─ executable plan and task graph
  ├─ workspace safety and recovery ledger
  ├─ TDD and scientific debugging evidence
  ├─ review and feedback governance
  ├─ completion claims and integration decisions
  └─ process gate/report
  ↓ hard required process section
Frontend quality gate
  ├─ visual, responsive, accessibility, runtime
  ├─ engineering, performance, interaction
  └─ aesthetic
       ├─ mechanical: colour, typography, spacing, craft, motion, style signature
       └─ judgment: independent aesthetic review bound to the artifact
  ↓ frontend summary
Full-stack evidence gate
  ├─ frontend vision
  ├─ experience and API
  ├─ architecture and data
  ├─ security and dependencies
  ├─ resilience and observability
  └─ risks and incident evidence
  ↓ fresh validator output
Deterministic release plane
  ├─ modular-document bundle generation
  ├─ path-safe source collection
  ├─ manifest and checksum generation
  ├─ deterministic ZIP construction
  └─ clean-extraction verification
```

## Design principles

Engines are deterministic and side-effect free. CLI adapters perform bounded file reads/writes. Workspace inspection invokes read-only git commands without a shell. Integration validation never performs merge, push, deletion, or cleanup.

Each process engine returns status, score, evidence count, evidence confidence, findings, and blockers. `process-gate-engine` evaluates required sections with a weighted quality score and weakest-link confidence. The process report is normalized into the full-stack gate as a required hard section.

## Aesthetic layer

The aesthetic engines follow the same contract as the process engines and reuse `process-audit-utils` for finding shape, severity ordering, and score derivation, so a colour defect and a review-governance defect are scored by the same rules.

The layer is split deliberately. Mechanical engines measure what has a defensible numeric answer — perceptual lightness steps, contrast ratios, scale ratios, spacing conformance, radius nesting, shadow geometry, easing curves, and archetype distance — and their findings are facts that do not require a reviewer to agree. The judgment review covers everything else and is governed rather than trusted: dimension floors survive averaging, low ratings require findings, high ratings can require recorded tests, and the reviewer cannot be the implementer.

`aesthetic-audit-engine` aggregates both halves. Sections without input report as skipped rather than scored, so an unmeasured dimension cannot raise the result. `toAestheticGate` converts the report into the eighth frontend gate, which stays `not-applicable` until aesthetic evidence is supplied or `aestheticRequired` is set — an opt-in that keeps existing pipelines byte-identical after upgrade.

## Provenance and recovery

TDD, review, claims, baselines, and ledger events carry hashes and identities. The ledger is append-only and reconstructs lifecycle state. Review packages bind base/head and diff hashes. Claims bind evidence to the current artifact.

## Extension boundary

Host-specific dispatch, browser control, git mutation, database probes, deployment, and telemetry collection remain adapters outside the pure kernel. A host can integrate these capabilities by producing the documented contracts without changing core validation.

## Release plane

`document-bundle-engine` creates the all-in-one reference from an explicit source list, so generated documentation can be compared byte-for-byte with its authoritative inputs. `release-package-engine` does not follow symbolic links, does not admit unsafe paths, excludes development state, produces a deterministic ZIP32 archive, and verifies member paths, duplicate names, local headers, the central directory, CRC values, and sizes. `MANIFEST.json` describes source payload files; `CHECKSUMS.sha256` covers payload files plus the manifest.

<!-- END SOURCE: ARCHITECTURE.md -->

---

## Source: `SECURITY.md`

<!-- BEGIN SOURCE: SECURITY.md -->

# Security Model — v4

## Trust boundaries

The package treats repository content, review feedback, contract files, browser pages, command configuration, and external evidence as untrusted inputs. Pure engines do not execute input. JSON readers resolve explicit files. Engineering command execution remains shell-free by default.

## Process-specific controls

- Protected-branch implementation is blocked unless policy authorizes it.
- Worktree cleanup requires proven package ownership.
- Review independence prevents implementer self-approval.
- Feedback is verified against codebase evidence before acceptance.
- TDD evidence uses chronology and hashes to detect test-after claims.
- Completion evidence must be fresh and match the current artifact hash.
- Absolute security claims are unsupported.
- Integration decisions require actor/timestamp; discard requires exact confirmation and inventory.
- The process ledger detects sequence gaps, content tampering, and broken hash links.
- Release collection skips symbolic links and excludes repository, workspace, dependency, coverage, build, and generated-evidence directories.
- ZIP member paths reject traversal, absolute paths, drive prefixes, backslashes, empty segments, and duplicate names.
- Release verification checks local headers, central-directory bounds, CRC values, compressed/uncompressed sizes, manifest identity, and checksum coverage.

## Execution boundaries

`process:workspace` uses fixed git executable arguments and does not mutate git. `process:integration` validates a decision but does not execute it. Existing engineering checks reject shell operators unless explicit reviewed shell execution is enabled.

## Data handling

Do not place secrets, tokens, private keys, personal data, or raw production payloads in process artifacts. Use redacted identifiers or non-reversible fingerprints. Keep evidence retention aligned with the project’s classification and access policy.

## Non-certification

Static scans and contract audits identify bounded risks. They do not prove absence of vulnerabilities, production correctness, or compliance. Live claims require live evidence from the relevant environment.

<!-- END SOURCE: SECURITY.md -->

---

## Source: `SUPERPOWERS_ADAPTATION_MATRIX.md`

<!-- BEGIN SOURCE: SUPERPOWERS_ADAPTATION_MATRIX.md -->

# Superpowers Adaptation Matrix — v4

This document maps every installed Superpowers process skill to an **original adaptation** in Full-Stack Vision Engineering Pro v4. The package does not claim to supersede Superpowers for every kind of work. It is more specialized and more machine-verifiable for frontend, backend, risk, debugging, and release governance because each principle is represented by a deterministic engine and evidence contract.

| Superpowers skill | Principle retained | v4 original adaptation | Deterministic engine or artifact | Added domain strength |
|---|---|---|---|---|
| `using-superpowers` | Route through applicable disciplines before acting | Task-context router with precedence, blockers, constraints, and ordered routes | `skill-router-engine.mjs`, request schema, `process:route` | Routes frontend/full-stack/security/incident work without relying on prompt memory |
| `brainstorming` | Explore context, compare approaches, obtain approval before implementation | Machine-audited design contract with context artifacts, alternatives, recommendation, approval, and self-review | `design-governance-engine.mjs` | Connects UX direction to architecture, data, errors, and testing |
| `writing-plans` | Produce executable, exact, test-first plans | Plan graph validates exact files, interfaces, dependencies, commands, expected failures, and commits | `plan-quality-engine.mjs`, `task-graph-engine.mjs` | Detects cycles and unsafe parallel file/resource collisions |
| `using-git-worktrees` | Isolate feature work and verify the baseline | Read-only workspace classifier distinguishes worktree, submodule, detached head, protected branch, and cleanup ownership | `workspace-safety-engine.mjs`, `process:workspace` | Prevents automatic removal of host-owned workspaces and silent protected-branch work |
| `test-driven-development` | Observe RED before production code, then GREEN and refactor | Hash- and timestamp-bound TDD cycle with behavior identity and high-risk negative controls | `tdd-evidence-engine.mjs`, `process:tdd` | Separates real test-first proof from tests written after implementation |
| `systematic-debugging` | Reproduce, localize, hypothesize, test minimally, fix root cause | Boundary evidence graph, one active hypothesis, one-variable experiment, regression RED, and architecture breaker | `debug-session-engine.mjs` | Links browser, API, queue, worker, database, and provider evidence |
| `dispatching-parallel-agents` | Parallelize only independent domains | Conflict-aware task waves based on dependencies, files, exclusive resources, and shared mutable state | `task-graph-engine.mjs` | Admits parallel analysis while blocking unsafe concurrent implementation |
| `subagent-driven-development` | Fresh implementer per task, review after each task, bounded fix loop, final review | Host-neutral role contracts, task briefs, diff packages, implementer reports, dual-verdict reviews, recovery ledger, and five-round breaker | review engine, ledger engine, roles/prompts/templates | Preserves coordination evidence even when the host provides different agent APIs |
| `executing-plans` | Execute a validated plan sequentially with checkpoints | Inline execution mode uses the same task graph, TDD, ledger, review, and verification contracts | process orchestrator and ledger | Provides equivalent gates when no subagent runtime exists |
| `requesting-code-review` | Review early and before merge | Review package binds requirement hash, base/head identity, diff hash, files, tests, and reviewer identity | `review-governance-engine.mjs`, `process:review` | Requires separate spec and quality verdicts and a final whole-change review |
| `receiving-code-review` | Verify feedback against codebase reality before accepting it | Feedback disposition records restatement, checked files, commands, evidence, accept/reject/defer rationale, and implementation proof | `feedback-adjudication-engine.mjs` | Blocks performative acceptance, unsupported rejection, and unmanaged deferral |
| `verification-before-completion` | Evidence before every success claim | Claim type maps to required evidence types, freshness, scope, status, and artifact hash | `claim-verification-engine.mjs` | Governs visual-match, security-gates-pass, bug-fixed, and production-ready language |
| `finishing-a-development-branch` | Verify, present integration options, execute only the user’s choice, clean safely | Integration contract exposes allowed options and validates actor, verification, base branch, remote, cleanup ownership, and exact discard confirmation | `integration-decision-engine.mjs`, `process:integration` | Integration remains human-owned and destructive actions fail closed |
| `writing-skills` | Author skills through failing pressure scenarios and conformance checks | Skill conformance engine audits frontmatter, trigger quality, references, process coverage, pressure tests, TDD evidence, and release artifacts | `skill-conformance-engine.mjs`, v4 pressure scenarios | The package self-audits its own discovery and deployment surface |

## Cross-skill improvements

Superpowers skills are intentionally modular. v4 adds a cross-skill evidence fabric:

- a hash-linked ledger carries state across context loss;
- every task is bound to an approved design and executable plan;
- TDD and debugging proof feed reviewer evidence rather than living in prose;
- review findings cannot disappear silently;
- completion claims are checked against current artifact hashes;
- the process gate is a required hard gate inside the full-stack release decision;
- frontend visual quality and backend risk remain separately scored while process confidence uses a weakest-link model.

This specialization is the source of the improvement: the process is not merely recommended; it is represented by data that can be validated, reported, versioned, and blocked in CI.

<!-- END SOURCE: SUPERPOWERS_ADAPTATION_MATRIX.md -->

---

## Source: `MIGRATION_V3_TO_V4.md`

<!-- BEGIN SOURCE: MIGRATION_V3_TO_V4.md -->

# Migration from v3 to v4

v4 preserves the v3 frontend and full-stack command surface, then adds a required governed-process gate. Existing domain contracts remain usable. The primary migration is to generate `process-report.json` before the full-stack audit.

## 1. Update package and configuration versions

Set package/config documentation to v4. In `fullstack.config.json`, add:

```json
{
  "version": 4,
  "contracts": {
    "processReport": "artifacts/process/process-report.json"
  },
  "gates": {
    "process": { "required": true, "hard": true }
  },
  "quality": {
    "weights": { "process": 15 }
  }
}
```

A legacy pipeline may temporarily set `gates.process.required` to `false`, but that explicitly disables v4 process assurance and must not be described as a v4-governed release.

## 2. Add process contracts

Copy `examples/process/` into an owned project location. Replace example identities, paths, hashes, timestamps, commands, and evidence with records from the actual work. Do not reuse example evidence as proof for a real release.

Required by default:

- request context;
- approved design;
- executable plan;
- workspace snapshot;
- recovery ledger;
- TDD cycles;
- review chain;
- claims and evidence.

Debug and integration contracts are conditional on the work stage.

## 3. Run process gates before full-stack gates

```bash
npm run process:audit -- --config process.config.json
npm run audit:fullstack -- --config fullstack.config.json
npm run fullstack:quality-gate --   --report artifacts/fullstack-audit/reports/fullstack-report.json
```

The process report must be generated from the same artifact and review state that the full-stack report represents.

## 4. Replace prose-only coordination

Migrate informal notes into:

- `templates/task-brief.md` for task requirements;
- `templates/tdd-evidence.md` for RED/GREEN proof;
- `templates/review-package.md` for bounded review context;
- `templates/feedback-ruling.md` for accepted, rejected, or deferred feedback;
- `templates/debug-session.md` for root-cause work;
- `templates/integration-decision.md` for the user’s final choice.

## 5. Enforce reviewer independence

The review contract now distinguishes implementer, task reviewer, re-reviewer, and final reviewer identities. A host without subagents may use different human reviewers or separate fresh-context review sessions, but it must not label self-review as independent evidence.

## 6. Adopt claim-bound verification

Do not write “tests pass,” “fixed,” “matched,” or “production-ready” as free text. Create a claim record linked to evidence generated against the current artifact hash. Older evidence or evidence for another build is rejected.

## Compatibility notes

- Frontend Vision Loop v2 commands remain unchanged.
- v3 domain audit commands remain unchanged.
- Full-stack config normalization now reports version 4.
- The default full-stack gate set includes hard, required `process` evidence.
- Existing v3 reports can be read as historical evidence, but they cannot satisfy the v4 process gate without the new process contracts.

<!-- END SOURCE: MIGRATION_V3_TO_V4.md -->

---

## Source: `MIGRATION_V4_TO_V5.md`

<!-- BEGIN SOURCE: MIGRATION_V4_TO_V5.md -->

# Migration from v4 to v5

v5 preserves the entire v4 command surface, contracts, and gates. It adds an aesthetic direction layer: a positive model of visual quality with measurable audits and an independent judgment review. Nothing in an existing v4 pipeline stops working, and the new gate is opt-in.

## What changed

| Area | v4 | v5 |
|---|---|---|
| Visual judgment | Anti-generic heuristics plus eight semantic dimensions with only "5 means" defined | Universal principles with nine observable tests, plus anchors for every level from 0 to 5 |
| Aesthetic direction | An unexpanded phrase in the design contract | A validated aesthetic profile with axis positions, reasons, consequences, and a novelty budget |
| Colour | Token drift detection only | Perceptual ramp evenness, contrast floors, harmony classification, and theme derivation checks |
| Typography | Structural criteria in prose | Step distinguishability, role coverage, line-height curve, and measure in characters |
| Spacing | Not measured | Scale conformance, proximity ratios, nesting, and responsive compression |
| Craft | Named as "optical refinement" | Nested radii, shadow light-source consistency, borders, icons, and micro-typography |
| Motion | Purpose only | Duration families, easing character, choreography, interruption, and reduced-motion parity |
| Style vocabulary | Prohibited as vague | A lexicon of nine archetypes defined by measurable signatures, with drift detection |
| Copy | Correctness only | Voice axes, tone by state, and microcopy patterns |
| Gate | Seven frontend gates | An eighth `aesthetic` gate, not-applicable until you opt in |

## 1. Update the package identity

The package version is now `5.0.0`. Documentation, conformance, and the validation suite all check for it.

## 2. Nothing is required yet

Without configuration, `aesthetics.enabled` is `false` and the aesthetic gate reports `not-applicable`, which does not affect the quality score or confidence. A v4 pipeline upgraded to v5 produces the same gate result it produced before.

## 3. Opt in when you want the gate

Add to `vision-loop.config.json`:

```json
{
  "aesthetics": {
    "enabled": true,
    "profilePath": "design/aesthetic-profile.json",
    "measurementsPath": "artifacts/vision-loop/reports/aesthetic-measurements.json",
    "reviewPath": "design/aesthetic-review.json",
    "minScore": 80,
    "dimensionFloor": 3,
    "requireTestEvidence": true
  }
}
```

`enabled` requires `profilePath`, because a gate with no declared direction has nothing to verify against. With aesthetics enabled, `vision-loop` loads the profile, optional measurements, and review into the run summary. Missing required evidence fails the aesthetic gate rather than leaving a silent skip.

## 4. Write the aesthetic profile

Copy `templates/aesthetic-profile.md` or start from `examples/aesthetic-profile.example.json`. Take a position from 1 to 5 on each personality axis, with a reason and the design consequences you accept. Declare the novelty budget, the system intents, and the voice.

The profile audit rejects entries that cannot be checked against a render, including the unconstraining terms this package has always prohibited.

## 5. Run the audits

```bash
npm run audit:aesthetics -- --input aesthetic-audit.json
npm run aesthetics:review -- --config vision-loop.config.json
```

The first is mechanical and produces facts. The second validates the judgment review. Run the mechanical audit first so reviewers do not spend attention on defects a measurement already found.

## 6. Add the review to your review chain

The aesthetic review follows the same independence rule as every other review: the implementer cannot approve it. It binds to the configuration hash of the artifact reviewed, so a stale review cannot approve a changed artifact.

Three rules will fail a review that would have passed under a plain average:

- a dimension below the floor fails regardless of the weighted score;
- a rating below 3 without a supporting finding is rejected as an opinion;
- a deviation marked system-wide cannot be parked as residual.

With `requireTestEvidence` enabled, a rating of 5 also requires at least one recorded test.

## Compatibility notes

- Every v4 script, schema, contract, and report shape is unchanged.
- `schemas/design-contract.schema.json` gains optional `audience`, `aestheticProfile`, `emotionalTone`, `copyVoice`, and typed `motion` properties. Existing contracts remain valid.
- `DEFAULT_GATE_WEIGHTS` gains `aesthetic: 10`. Existing weights are unchanged, and scoring normalizes by applicable weight, so gate results do not move until you opt in.
- `references/design-director.md` still prohibits style labels as design theses. The style lexicon does not change that rule; it supplies measurable parameter bundles for describing and detecting style, not a substitute for a thesis.
- The all-in-one bundle is now `FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md`. The v4 bundle is not regenerated.

<!-- END SOURCE: MIGRATION_V4_TO_V5.md -->

---

## Source: `UPGRADE_REPORT_V4_TH.md`

<!-- BEGIN SOURCE: UPGRADE_REPORT_V4_TH.md -->

# รายงานการอัปเกรด Full-Stack Vision Engineering Pro v4.0.0

## เป้าหมายของรุ่น v4

รุ่น v4 ยกระดับแพ็กเกจ v3 จากชุดตรวจ Frontend/Full-Stack ให้เป็น **Engineering Process Kernel** ที่ตรวจได้เชิงโครงสร้าง ไม่พึ่งเพียงคำสั่งใน Prompt และไม่ถือว่าการ Build ผ่านเท่ากับงานพร้อม Release

แนวทางถูกพัฒนาจากการวิเคราะห์หลักการของ Superpowers ทุกสกิลที่ติดตั้ง แล้วดัดแปลงใหม่ให้เหมาะกับงาน Product Design, Frontend, Backend, API, Database, Security, Reliability, Debugging และ Release Governance โดยไม่คัดลอกเนื้อหาเดิมมาเรียงรวมกัน

## สิ่งที่เพิ่มเหนือ v3

### 1. Process Routing และ Precedence

ระบบจำแนกงาน Feature, Bug, Incident, Refactor, Skill Authoring, Review และ Integration แล้วเลือกกระบวนการที่ต้องใช้ตามลำดับ พร้อมเคารพ User/Repository Instructions ก่อน Process Defaults

### 2. Design Before Implementation

งานสร้างสรรค์หรืองานสถาปัตยกรรมต้องมี Context Exploration, ทางเลือกอย่างน้อยสองแนวทาง, Trade-offs, Recommendation, Architecture, Data Flow, Error Handling, Testing และ Approval ก่อนเริ่ม Implementation

### 3. Executable Planning

Plan ถูกตรวจเรื่อง Task IDs, Dependency Graph, File Ownership, Producer/Consumer Interfaces, RED/GREEN Commands, Expected Results, Placeholders, Cycles และ Parallel Conflict ก่อนอนุญาตให้ลงมือ

### 4. Workspace Isolation และ Recovery Ledger

ระบบแยก Normal Checkout, Linked Worktree, Submodule, Detached HEAD และ Non-Git Copy พร้อมบล็อก Protected Branch โดยไม่มี Authorization ใช้ Ledger แบบ hash-linked เพื่อให้กู้สถานะหลัง Context Loss ได้โดยไม่เชื่อความจำของ Agent

### 5. TDD Evidence ที่พิสูจน์ลำดับเวลา

ไม่ได้ตรวจเพียงว่ามี Test แต่ตรวจว่า:

- RED เกิดก่อน Production Change
- RED ล้มด้วยเหตุผลที่ตรงกับ Behavior ที่ต้องเพิ่มหรือ Bug ที่ต้องแก้
- GREEN ผูกกับ Code/Test Hash ชุดปัจจุบัน
- High-risk behavior มี Negative Control, Mutation หรือ Revert Proof
- Refactor มี Fresh Passing Verification

ระหว่างการพัฒนา Task 1–9 มี milestone ที่ Full Suite ผ่าน **169/169** tests ก่อนเพิ่มระบบ Release Packaging และหลังเพิ่ม Release/Documentation Engines ชุด Source Suite ผ่าน **179/179** tests ก่อนตรวจซ้ำจาก ZIP ที่แตกใหม่

### 6. Scientific Debugging

Debug Session ต้องมี Reproduction, Last Confirmed-good Boundary, First Confirmed-bad Boundary, Supporting/Contradicting Evidence, Hypothesis เดียวต่อ Experiment, Falsification Test และ Regression RED ก่อน Fix หากลองแก้ล้มเหลวหลายครั้ง ระบบจะบังคับ Architecture Escalation แทนการเดาต่อ

### 7. Independent Review และ Feedback Governance

Implementer ไม่สามารถอนุมัติงานตนเอง Review ต้องมีทั้ง Spec Verdict และ Quality Verdict ผูกกับ Brief และ Diff Range เดียวกัน Findings ระดับ Critical/Important ต้องถูกแก้และ Re-review หรือได้รับ Technical Ruling ตาม Circuit Breaker ที่กำหนด ห้ามหายจากรายงานแบบเงียบ ๆ

### 8. Claim Verification

คำกล่าวอ้าง เช่น Finished, Fixed, Pixel-perfect, Secure หรือ Production-ready ต้องผูกกับ Evidence Type, Artifact Hash, Scope, Timestamp และ Freshness ที่ถูกต้อง คะแนนด้านอื่นไม่สามารถเฉลี่ยกลบ Evidence ที่หายหรือ Hard Failure ได้

### 9. Human-owned Integration

Merge, Push, Pull Request, Keep-as-is, Cleanup และ Discard เป็นการตัดสินใจของผู้ใช้ ระบบเตรียมหลักฐานและตรวจเงื่อนไขได้ แต่ไม่เลือกแทน Discard ต้องใช้ Confirmation Token ที่ตรงตาม Contract และระบุรายการที่จะลบครบ

### 10. Full-Stack Process Hard Gate

`process-report.json` เป็น Required Hard Gate ของ `fullstack.config.json` โดยค่าเริ่มต้น ดังนั้น Frontend, Backend, Security หรือ Reliability ที่ได้คะแนนสูงไม่สามารถกลบ TDD, Review หรือ Verification Evidence ที่ไม่ครบได้

### 11. Skill Self-Conformance

เพิ่มการตรวจ SKILL frontmatter, Trigger Description, Required References, Pressure Categories, Superpowers Adaptation Coverage, RED/GREEN Deployment Evidence, Package Identity และ Process CLI Surface จากไฟล์จริง

### 12. Deterministic ZIP และ Supply-chain-safe Packaging

Release Builder รุ่น v4:

- ไม่ติดตาม Symbolic Link
- ไม่รวม `.git`, `.superpowers`, `.worktrees`, `node_modules`, `artifacts`, coverage และ build output
- ปฏิเสธ absolute paths, drive paths, backslash และ `..` traversal
- สร้าง `MANIFEST.json` และ `CHECKSUMS.sha256`
- สร้าง **Deterministic ZIP** ที่ input เดิมให้ byte-identical archive
- ตรวจ Central Directory, Local Headers, CRC, compressed/uncompressed sizes, duplicate members และ single-root prefix
- รักษา executable mode ของ `setup.sh` และ CLI scripts ใน Release Directory/ZIP
- สร้าง SHA-256 sidecar สำหรับ ZIP

## ระบบเดิมที่รักษาไว้

- Frontend Vision-in-the-loop, Screenshot/Perceptual/Region Diff
- Responsive, UI State, Accessibility, Interaction และ Performance Gates
- Baseline Governance และ Semantic Visual Review
- API Compatibility, Architecture, Data Migration, Security, Resilience และ Observability
- Dependency Lock Integrity, Incident Triage และ Risk Register

## ข้อจำกัดที่ไม่กล่าวอ้างเกินจริง

แพ็กเกจไม่สามารถสร้าง Browser, Subagent Runtime, Git Remote, Production Database, Telemetry หรือ Deployment Environment ที่ Host ไม่มีให้ได้ Static Scanner ไม่ใช่ Security Certification และ Deterministic Engine Tests ไม่เท่ากับการรัน Pressure Scenario ด้วย Agent อิสระหลายบริบท

Live Browser, Database Lock, Production Authorization, Telemetry, Alert Delivery และ Rollback ต้องยืนยันกับ Target System จริงก่อนใช้คำว่า Production-ready

<!-- END SOURCE: UPGRADE_REPORT_V4_TH.md -->

---

## Source: `UPGRADE_REPORT_V5_TH.md`

<!-- BEGIN SOURCE: UPGRADE_REPORT_V5_TH.md -->

# รายงานการอัปเกรด v4 → v5 (ภาษาไทย)

## สรุปผู้บริหาร

v5 เพิ่ม **Aesthetic Direction Layer** เข้าไปในชุดเดิมทั้งหมด โดยไม่แตะพื้นผิวคำสั่ง สัญญา หรือ Gate ของ v4 เลย

โจทย์ที่ v5 แก้คือช่องว่างเชิงโครงสร้าง: รุ่นก่อนหน้าเก่งเรื่อง "ไม่ห่วย" แต่ไม่มีโมเดลว่า "อะไรคือดี" เอกสาร `references/design-director.md` ระบุชัดว่าห้ามใช้ Style Label เป็น Thesis, `agents/accessibility-interaction-reviewer.md` ระบุว่าห้ามเอา Aesthetic Preference มาแทน Task Impact และ `prompts/design-review.md` ระบุให้ตรวจเทียบ Brief แทน Generic Taste กฎเหล่านี้ถูกต้องและยังคงอยู่ แต่ผลข้างเคียงคือไม่มีเกณฑ์เชิงบวกเหลืออยู่เลย และคำว่า "Emotional and brand character" ปรากฏเพียงบรรทัดเดียวโดยไม่มีคำอธิบายต่อ

## แนวทางที่เลือก

เน้น **หลักความงามสากล** คืออธิบายกลไกการรับรู้และการจัดระเบียบทางสายตาที่คงที่ข้ามผลิตภัณฑ์ ข้ามกลุ่มผู้ใช้ และข้ามยุค จึงไม่ต้องพึ่งข้อมูลเทรนด์หรือการวิจัยผู้ใช้เพื่อให้ยังใช้ได้

กลไกหลักสามข้อที่อธิบายปฏิกิริยาที่คนเรียกว่า "รสนิยม" ได้เกือบทั้งหมด:

1. **Processing fluency** — คนตีความ "ความง่ายในการถอดรหัสภาพ" ว่าเป็นคุณสมบัติของภาพนั้น อินเทอร์เฟซที่คลี่เป็นโครงสร้างได้เร็วจึงรู้สึกสงบ มีฝีมือ และน่าเชื่อถือ
2. **Perceptual organization** — สายตาจัดกลุ่มก่อนอ่าน เมื่อการจัดกลุ่มที่เกิดจากระยะห่างและการจัดแนวตรงกับโครงสร้างเชิงตรรกะของเนื้อหา งานจะรู้สึกเป็นระเบียบ
3. **Typicality with controlled novelty** — ความชอบสูงสุดอยู่ที่จุดที่แปลกใหม่ที่สุดเท่าที่ยังจำได้ว่าคืออะไร ทางออกคือคงโครงสร้างไว้ตามขนบ แล้วใช้ความแปลกใหม่ในตำแหน่งที่จงใจไม่กี่จุด

## สิ่งที่เพิ่มเข้ามา

### เอกสารอ้างอิง 12+ ไฟล์

| ไฟล์ | เนื้อหา |
|---|---|
| `references/aesthetic-direction-protocol.md` | จุดที่ทิศทางด้านความงามเชื่อมเข้ากับกระบวนการและ Gate |
| `references/aesthetic-principles.md` | หลักการ 7 ข้อ งบความแปลกใหม่ และการทดสอบ 9 แบบ |
| `references/aesthetic-scoring-anchors.md` | Anchor ครบทุกระดับ 0–5 น้ำหนักรายมิติ และกฎการตัดสิน |
| `references/visual-craft-standards.md` | Optical Alignment, Radius ซ้อน, ฟิสิกส์ของเงา, เส้นขอบ, Gradient, Micro-typography |
| `references/color-system-and-perception.md` | พื้นที่สีเชิงการรับรู้ การสร้าง Palette Contrast และปรากฏการณ์ทางสายตา |
| `references/typographic-system-quality.md` | Scale, Role, Line Height, Measure, การตัดบรรทัด และการจับคู่ฟอนต์ |
| `references/spatial-composition-and-rhythm.md` | Spacing Scale, Proximity, Grid, Density, Vertical Rhythm |
| `references/motion-quality-standards.md` | จุดประสงค์ Duration Easing Choreography Interruption Reduced Motion |
| `references/brand-personality-and-tone.md` | แกนบุคลิก 5 แกน พร้อมตารางแปลงเป็นการตัดสินใจด้านดีไซน์ และน้ำเสียงรายสถานะ |
| `references/visual-style-lexicon.md` | Archetype 9 แบบ นิยามด้วยลายเซ็นที่วัดได้ |
| `references/copy-voice-and-microcopy.md` | แกนน้ำเสียง รูปแบบ Microcopy ความสมจริงของเนื้อหา |
| `references/visual-direction-exploration.md` | เมื่อ redesign จากภาพหน้าจอ ให้ Gen ตัวอย่างด้วย ImageGen เป็นตัวเลือก 1/2/3 แล้วรอให้ผู้ใช้เลือกก่อนเขียน Profile |

### Engine 9 ตัว (โค้ดรันได้จริง)

| Engine | สิ่งที่ตรวจ |
|---|---|
| `lib/color-harmony-engine.mjs` | แปลง sRGB → OKLCH, ความสม่ำเสมอของ Ramp, Contrast แบบ WCAG, การจำแนก Harmony, Status ที่พึ่งสีอย่างเดียว, Dark Theme แบบกลับด้าน |
| `lib/typography-scale-engine.mjs` | ขั้นที่แยกไม่ออก จำนวนขนาด Role Line Height ตามเส้นโค้ง Measure น้ำหนักที่ต่างกันน้อยเกิน Tabular Figures |
| `lib/spacing-rhythm-engine.mjs` | ค่านอก Scale สัดส่วนการจัดกลุ่ม การซ้อนกลับด้าน การบีบ Macro Spacing จำนวนแนวขอบ |
| `lib/craft-precision-engine.mjs` | Radius ที่ไม่ซ้อนกัน แหล่งกำเนิดแสงที่ขัดกัน เงาชั้นเดียวที่ Elevation สูง เส้นขอบต่ำกว่า 1px ตระกูลไอคอนปนกัน |
| `lib/motion-quality-engine.mjs` | ตระกูล Duration, Linear บนการเคลื่อนที่, การ Animate Layout Property, การขัดจังหวะ, Stagger ที่ไม่จำกัด, Reduced Motion |
| `lib/style-signature-engine.mjs` | คำนวณลายเซ็น 8 มิติ จำแนก Archetype และตรวจการเบี่ยงเบนจากที่ประกาศไว้ |
| `lib/aesthetic-profile-engine.mjs` | ความจำเพาะของ Profile ภาษาที่ไม่ผูกมัด ความขัดแย้งระหว่างแกนกับระบบ |
| `lib/aesthetic-review-engine.mjs` | คะแนนขั้นต่ำรายมิติ Finding ที่ต้องมี ความเป็นอิสระของผู้ตรวจ ความสดใหม่ และการผูกกับ Artifact |
| `lib/aesthetic-audit-engine.mjs` | รวมทุกส่วนเป็นรายงานเดียวและแปลงเป็น Gate |

### พื้นผิวใหม่

- คำสั่ง `npm run audit:aesthetics` และ `npm run aesthetics:review`
- Schema `aesthetic-profile` และ `aesthetic-review` พร้อมส่วนขยายของ `design-contract`
- Gate ที่แปดชื่อ `aesthetic` ใน Quality Model
- Agent `aesthetic-critic`, Prompt รวม `visual-direction-exploration`, Template 2 ตัว, Example 3 ไฟล์
- Pressure Scenario 18 ข้อใน `tests/aesthetic-pressure-scenarios-v5.md`
- โปรโตคอล ImageGen: ส่งรูป redesign → Gen ตัวเลือก 1/2/3 → เขียน `visual-direction-spec.md` → confirm เริ่มเขียน/ปรับต่อ/เลือกใหม่ → ค่อยผูก aesthetic profile

## กฎที่บังคับใช้จริง ไม่ใช่คำแนะนำ

สามข้อนี้ทำให้ Review ที่เดิม "ผ่าน" ด้วยค่าเฉลี่ย กลายเป็นไม่ผ่าน:

1. **มิติที่ต่ำกว่าขั้นต่ำทำให้ตกทันที** ไม่ว่าค่าเฉลี่ยถ่วงน้ำหนักจะสูงแค่ไหน — เพราะการเฉลี่ยคือวิธีที่ข้อบกพร่องร้ายแรงหนึ่งข้อหายไปในตัวเลขที่ดูดี
2. **ให้คะแนนต่ำกว่า 3 โดยไม่มี Finding ถือเป็นความเห็น ไม่ใช่การรีวิว** และถูกปฏิเสธ
3. **ข้อบกพร่องที่เกิดทั้งระบบพักเป็น Residual ไม่ได้** ต้องยกระดับความรุนแรง

เมื่อเปิด `requireTestEvidence` การให้ 5 ต้องมีการทดสอบที่บันทึกไว้อย่างน้อยหนึ่งอย่าง เพราะ 5 คือการยืนยันว่าได้ทดสอบแล้ว ไม่ใช่ว่าบังเอิญไม่เห็นข้อบกพร่อง

## ความเข้ากันได้

- คำสั่ง Schema Contract และรูปแบบรายงานของ v4 ไม่เปลี่ยนแปลง
- `DEFAULT_GATE_WEIGHTS` เพิ่ม `aesthetic: 10` โดยน้ำหนักเดิมคงที่ และการให้คะแนนหารด้วย Applicable Weight ผลจึงไม่ขยับจนกว่าจะเปิดใช้
- ถ้าไม่ตั้งค่า `aesthetics.enabled` Gate จะรายงาน not-applicable ซึ่งไม่กระทบทั้งคะแนนและ Confidence
- `references/design-director.md` ยังคงห้ามใช้ Style Label เป็น Thesis Style Lexicon ไม่ได้ยกเลิกกฎนั้น แต่ให้ชุดพารามิเตอร์ที่วัดได้สำหรับอธิบายและตรวจจับสไตล์

## หลักฐานการทดสอบ

Baseline ก่อนเริ่มงานไม่ผ่าน มี Test เดิมตกหนึ่งตัวใน `tests/unit/manual-review.test.mjs` เพราะ Fixture ตรึงวันที่ไว้ ขณะที่ Engine ตรวจความสดใหม่แบบเลื่อน 24 ชั่วโมง จึงเริ่มตกเมื่อวันที่ผ่านไป ข้อนี้เป็นข้อบกพร่องที่ติดมาแต่เดิม ไม่ได้เกิดจากงาน v5 และถูกแก้ก่อนเพื่อให้มี Baseline ที่สะอาด

รายละเอียด RED/GREEN รายงานไว้ใน `tests/TDD_EVIDENCE_V5.md` ส่วนผลการตรวจชุดเต็มอยู่ใน `VALIDATION_REPORT.json`

## ข้อจำกัดที่ยังคงอยู่

- Aesthetic Review ต้องใช้ Render ปัจจุบัน หากรันไทม์เปิดเบราว์เซอร์ไม่ได้ จะถือเป็น Verification Gap ไม่ใช่ผ่าน
- การวัดที่ได้จากซอร์สแทนที่จะได้จาก Render ต้องระบุว่าเป็นค่าอนุมาน
- หากไม่มีผู้ตรวจที่เป็นอิสระจาก Implementer การรีวิวจะถูกบันทึกว่าไม่มีการกำกับ และ Gate จะไม่ผ่านด้วยหลักฐานนั้น
- การเทียบหน้าตาจากความทรงจำแทนการ Render ปัจจุบันยังคงเป็นสิ่งต้องห้าม

<!-- END SOURCE: UPGRADE_REPORT_V5_TH.md -->

---

## Source: `references/process-kernel-overview.md`

<!-- BEGIN SOURCE: references/process-kernel-overview.md -->

# Process Kernel Overview

The v4 process kernel converts agent-development discipline into a deterministic evidence system. It is not an autonomous agent runtime. It validates the context, artifacts, and decisions produced by humans or agents running in any host.

The kernel has five layers: routing, design/planning, execution evidence, review governance, and release governance. Pure engines perform validation without mutating repositories. Thin CLI adapters read JSON and emit JSON/Markdown. The full-stack gate consumes the resulting process report as a hard release section.

A process section has a status, quality score, evidence count, evidence confidence, findings, and hard failures. The overall quality score is weighted, while confidence is weakest-link: one unverified required section cannot be hidden by strong evidence elsewhere.

The kernel’s state is recoverable from an append-only ledger. Its public claims are recoverable from evidence IDs and hashes. Its integration choices remain human-owned. Host capabilities such as subagent dispatch, browser control, git push, and deployment are represented as external actions with evidence—not simulated by the package.

<!-- END SOURCE: references/process-kernel-overview.md -->

---

## Source: `references/skill-routing-and-precedence.md`

<!-- BEGIN SOURCE: references/skill-routing-and-precedence.md -->

# Skill Routing and Precedence

Route the task before taking action. The request contract records work kind, stage, creative scope, unexpected behavior, approvals, plan availability, isolation need, subagent capability, independent domains, and shared state.

The router orders process disciplines so that upstream decisions cannot be bypassed. Creative work requires design exploration before planning. Unexpected behavior requires root-cause investigation before TDD fixes. Implementation requires workspace isolation, a plan, TDD, and fresh verification. Completion requires verification and integration governance.

Parallel analysis may be recommended when independent domains exist. Parallel implementation is constrained when files or mutable resources overlap. Repository and user instructions always override package defaults. Safety boundaries override convenience.

The router emits blockers rather than silently inventing approvals or plans. A blocked route is a signal to create the missing artifact, not permission to skip the discipline.

<!-- END SOURCE: references/skill-routing-and-precedence.md -->

---

## Source: `references/design-before-implementation.md`

<!-- BEGIN SOURCE: references/design-before-implementation.md -->

# Design Before Implementation

A design contract protects the project from coding an unexamined direction. First record repository/context evidence. Then compare at least two viable approaches, including costs and risks. Select one recommendation with rationale and describe architecture, components, data flow, error behavior, and testing.

For screenshot-led redesigns, visible direction exploration (`references/visual-direction-exploration.md`) runs before the aesthetic profile: generate two or three distinct ImageGen options, wait for a numbered choice, then bind that choice into the design artifacts. Preference without a visible option set is not an explored direction.

Approval is a separate fact from authorship. The contract records actor and timestamp. A best-effort exception is allowed only when policy explicitly enables it and the exception names its reason, scope, and follow-up obligation.

Self-review checks placeholder language, internal consistency, scope, and ambiguity. A design that says only “make it scalable” or “add error handling” is not actionable. For frontend work, the design also defines hierarchy, responsive composition, states, assets, accessibility, and visual acceptance. For backend work, it identifies domain boundaries, invariants, authorization, failure modes, and observability.

<!-- END SOURCE: references/design-before-implementation.md -->

---

## Source: `references/executable-planning.md`

<!-- BEGIN SOURCE: references/executable-planning.md -->

# Executable Planning

An executable plan is a dependency graph of independently reviewable tasks. Each task declares exact files, produced and consumed interfaces, prerequisites, and the test-first sequence: write a failing test, verify the expected failure, implement minimally, verify GREEN, and commit.

Plan validation rejects duplicate IDs, unknown dependencies, cycles, missing interfaces, placeholders, and commands with no expected result. Task-graph analysis then detects shared files, exclusive resources, and mutable state so dependency-ready tasks can be partitioned into safe waves.

A plan is not a narrative estimate. It is a portable contract that a fresh implementer can execute without the conversation history. Exact values live in the task brief; later tasks consume named interfaces rather than implied behavior.

<!-- END SOURCE: references/executable-planning.md -->

---

## Source: `references/tdd-evidence-protocol.md`

<!-- BEGIN SOURCE: references/tdd-evidence-protocol.md -->

# TDD Evidence Protocol

A test file existing is not proof of test-first development. Each cycle binds a behavior ID and requirement reference to one test identity. RED records command, nonzero exit, missing-behavior failure classification, expected and observed signature, output hash, test hash, production hash, and timestamp. Production records the changed artifact hash and timestamp. GREEN proves the same test passed against that changed production hash.

Chronology must be RED before production change before GREEN. Syntax errors, dependency failures, or unrelated crashes do not count as RED. High-risk behavior requires a negative control such as mutation, revert, or an equivalent demonstration that removing the fix makes the test fail.

Refactoring occurs only after GREEN and requires fresh passing evidence. These records support review and completion claims without relying on an agent’s assertion that it “used TDD.”

<!-- END SOURCE: references/tdd-evidence-protocol.md -->

---

## Source: `references/scientific-debugging-protocol.md`

<!-- BEGIN SOURCE: references/scientific-debugging-protocol.md -->

# Scientific Debugging Protocol

Debugging begins with reproducible evidence, not a patch. Record expected and observed behavior, exact steps or an intermittent sampling strategy, environment hash, and build identity. Instrument component boundaries and order them from caller to terminal dependency.

The first confirmed-bad boundary and last confirmed-good boundary define the search region. Maintain one active falsifiable hypothesis. Each experiment changes one variable and records a result. Contradicting evidence is preserved rather than explained away.

A fix requires a confirmed hypothesis, regression RED, a change identity, targeted GREEN, original reproduction verification, affected regression verification, and telemetry capable of distinguishing recurrence. After three failed fix attempts, another speculative patch is forbidden; trigger architectural review and record the decision.

<!-- END SOURCE: references/scientific-debugging-protocol.md -->

---

## Source: `references/parallel-task-isolation.md`

<!-- BEGIN SOURCE: references/parallel-task-isolation.md -->

# Parallel Task Isolation

Parallelism is safe only when tasks are independent in both dependency and execution state. The task graph considers declared dependencies, files created/modified/tested, exclusive resources, and shared mutable state.

Ready tasks with no conflicts may share a wave. Conflicting tasks are separated even when their dependency edges would otherwise allow concurrency. Investigation can often run in parallel while implementation remains sequential.

Every parallel worker receives a focused brief and writes a bounded report. Workers do not inherit the entire controller history. Integration occurs only after conflict review and a full regression run. Speed never justifies concurrent edits to the same files, database fixture, browser port, generated artifact, or mutable environment.

<!-- END SOURCE: references/parallel-task-isolation.md -->

---

## Source: `references/subagent-task-lifecycle.md`

<!-- BEGIN SOURCE: references/subagent-task-lifecycle.md -->

# Subagent Task Lifecycle

The host-neutral lifecycle is controller → implementer → independent task reviewer → bounded fix loop → final reviewer. The package supplies role contracts and artifacts but does not itself create subagents.

The controller extracts one task brief, records the base identity, and dispatches one implementer. The implementer records changes, tests, commits, and concerns. The reviewer receives the brief, implementer report, and bounded diff package—not the entire conversation—and returns both spec and quality verdicts.

Critical or important findings enter a maximum five-round loop. Rounds one through three preserve implementation context; later rounds require fresh ownership or capability escalation. Each fix has tests and a scoped re-review. At the breaker, load-bearing findings stop the plan. A final independent review covers the whole change.

<!-- END SOURCE: references/subagent-task-lifecycle.md -->

---

## Source: `references/review-and-feedback-governance.md`

<!-- BEGIN SOURCE: references/review-and-feedback-governance.md -->

# Review and Feedback Governance

Review is evidence, not ceremony. A valid change package records base/head identity, diff hash, bounded file set, brief hash, implementer identity, and test evidence. The reviewer must differ from the implementer and issue explicit spec and quality verdicts.

Findings have stable IDs, severity, status, message, load-bearing classification, and review linkage. Addressed findings require a re-review ID. Parking before the circuit breaker is allowed only for an explicit human decision about a plan conflict. A load-bearing finding cannot be parked.

External feedback is verified before disposition. Acceptance needs supporting codebase evidence and tested implementation. Rejection needs evidence that the suggestion is unsupported or harmful. Deferral needs owner, due date, and residual risk. Unclear feedback cannot be partially implemented.

<!-- END SOURCE: references/review-and-feedback-governance.md -->

---

## Source: `references/workspace-and-branch-safety.md`

<!-- BEGIN SOURCE: references/workspace-and-branch-safety.md -->

# Workspace and Branch Safety

Workspace classification is read-only. It distinguishes normal repositories, linked worktrees, detached heads, submodules, non-git directories, and isolated copies. Implementation on protected branches fails closed unless policy explicitly authorizes it.

Project-local worktree containers must be confirmed ignored before creation. Cleanup ownership is inferred only for recognized project-owned containers. A linked worktree outside those containers is host-owned and must not be automatically removed.

Detached state changes the allowed integration options. Destructive actions always require explicit confirmation. Baseline tests are separate evidence and should be recorded before implementation so later failures can be attributed correctly.

<!-- END SOURCE: references/workspace-and-branch-safety.md -->

---

## Source: `references/verification-and-claim-governance.md`

<!-- BEGIN SOURCE: references/verification-and-claim-governance.md -->

# Verification and Claim Governance

A completion claim is a typed assertion linked to evidence IDs. Evidence records type, generated time, artifact hash, status, exit code, failures, and scope. The verifier rejects unknown, stale, failing, differently-hashed, or insufficiently-scoped evidence.

`tests-pass` requires a fresh full-suite run with zero failures. `visual-match` requires a current render, complete required-case coverage, and no blockers. `security-gates-pass` requires both a bounded security audit and threat model. `production-ready` requires tests, build, process gate, full-stack gate, final review, and rollback proof.

The system intentionally rejects an absolute `secure` claim because finite evidence cannot prove the absence of all vulnerabilities. Reports should state exactly what gates passed and what remains unverified.

<!-- END SOURCE: references/verification-and-claim-governance.md -->

---

## Source: `references/integration-and-cleanup.md`

<!-- BEGIN SOURCE: references/integration-and-cleanup.md -->

# Integration and Cleanup

Integration is a decision boundary owned by the user. The system may prepare options but does not choose. Named branches can offer local merge, push/pull request, or keep-as-is. Detached workspaces cannot offer local merge until a branch exists.

Merge or push requires a fresh full-suite result bound to the current artifact. Local merge also requires a confirmed base branch. Cleanup is allowed only for a workspace the system owns and, after merge, only when the merged result is verified.

Discard is outside the normal menu. It requires the exact confirmation token, actor and timestamp, commit inventory, workspace path, and cleanup ownership. A vague confirmation never authorizes deletion.

<!-- END SOURCE: references/integration-and-cleanup.md -->

---

## Source: `references/skill-authoring-conformance.md`

<!-- BEGIN SOURCE: references/skill-authoring-conformance.md -->

# Skill Authoring Conformance

A production skill needs discoverable metadata, focused triggers, precise workflow, reusable references, pressure scenarios, and deployment evidence. The frontmatter description states when to use the skill rather than summarizing the workflow. The body carries the process.

Authoring follows RED–GREEN–REFACTOR. First pressure-test a fresh context without the guidance and record the actual failure. Write the smallest guidance or deterministic engine that addresses that failure. Re-run the same scenarios, then close new loopholes.

The v4 conformance audit checks frontmatter, trigger wording, referenced files, process coverage, pressure-scenario categories, placeholder language, TDD evidence, schemas, examples, CLI surfaces, and release artifacts. Static conformance does not substitute for repeated independent-agent pressure runs.

<!-- END SOURCE: references/skill-authoring-conformance.md -->

---

## Source: `references/context-recovery-ledger.md`

<!-- BEGIN SOURCE: references/context-recovery-ledger.md -->

# Context Recovery Ledger

Agent conversations can compact, reset, or lose task position. The recovery ledger moves durable coordination state into an append-only artifact. Every event has a sequence number, actor, timestamp, previous hash, data, and content hash.

The reducer validates order, hash linkage, process transitions, task transitions, findings, and fix rounds. It reconstructs plan identity, current lifecycle state, task histories, last sequence, and last hash. Tampering or a gap blocks recovery.

The ledger is not a substitute for git history or test evidence. It is the coordination index that points to those artifacts. A fresh controller should trust the validated ledger and repository history over unaudited conversational memory.

<!-- END SOURCE: references/context-recovery-ledger.md -->

---

## Source: `references/fullstack-operating-model.md`

<!-- BEGIN SOURCE: references/fullstack-operating-model.md -->

# Full-Stack Operating Model

## Purpose

A full-stack feature is one user outcome implemented across multiple technical boundaries. Treating frontend, API, service, database, and operations as separate tickets creates gaps precisely where failures occur. This operating model keeps one critical flow, one evidence chain, and one release decision.

## Critical-Flow Unit of Work

Define work around a user or operator goal, not a technical layer. A critical flow should identify:

- Triggering actor and identity context
- User-visible route or entry point
- Ordered backend operations
- Resources and data classifications touched
- Authorization decisions
- Transaction and consistency boundaries
- Third-party and infrastructure dependencies
- Expected latency and availability
- UI states and recovery behavior
- Logs, metrics, traces, analytics, SLO, alerts, dashboard, and runbook
- Rollout and rollback constraints

A layer can be locally correct while the flow is globally broken. Acceptance therefore follows the entire path.

## Evidence Layers

| Layer | Evidence examples | What it does not prove |
|---|---|---|
| Static | Types, lint, schema, source-risk rules | Runtime behavior or security absence |
| Unit | Domain invariant and pure behavior tests | Boundary wiring or deployment configuration |
| Contract | API/schema compatibility and consumer tests | Production dependency behavior |
| Integration | Service, database, queue, and authorization wiring | Browser experience or production scale |
| End-to-end | Critical user journey | Every failure mode or concurrency edge |
| Visual | Screenshot, DOM, interaction, responsive evidence | Backend correctness or authorization |
| Operational | Logs, metrics, traces, SLOs, alerts, game days | Product usability or contract compatibility |
| Release | Build identity, config hash, migrations, rollback proof | Future behavior after unreviewed change |

Quality is the result observed in available evidence. Confidence is how complete, current, representative, and attributable that evidence is.

## Change Classification

### Local

One bounded component, no public contract, no persistent data change, no trust-boundary change. Still requires tests and final verification.

### Boundary

Changes request/response shape, event, job payload, authorization, cache key, query, or dependency behavior. Requires baseline/current comparison and consumer evidence.

### Stateful

Changes schema, invariant, transaction, ordering, migration, retention, or backfill. Requires compatibility, rollout ordering, verification, and rollback.

### Systemic

Changes identity, trust zones, critical dependency, deployment topology, SLO, queue semantics, or multiple services. Requires architecture review, threat/failure model, and adversarial release verification.

## Handoff Contract

Every handoff between agents or teams contains:

- Scope and critical flow IDs
- Input artifact paths and hashes
- Assumptions and unsupported evidence
- Decisions already approved
- Findings by severity
- Hard blockers
- Exact commands and outcomes
- Residual risk owner and review date
- Next falsification or verification action

Narrative confidence is not a handoff artifact.

## Completion Test

Ask one question: **Can a reviewer trace the final build from user action through authorization, data mutation, dependency behavior, UI response, telemetry, and rollback using current evidence?**

If any segment is inferred, the release confidence remains incomplete.

<!-- END SOURCE: references/fullstack-operating-model.md -->

---

## Source: `references/experience-design-to-system-contract.md`

<!-- BEGIN SOURCE: references/experience-design-to-system-contract.md -->

# Experience Design to System Contract

## Principle

Product design is not limited to the default screen. Every user-visible state is the projection of backend state, policy, latency, failure, and recovery semantics. The experience contract prevents attractive interfaces from concealing undefined system behavior.

## Flow Contract

For each important flow capture:

1. **User goal:** what outcome the user is trying to achieve.
2. **Entry and identity:** route, deep link, role, tenant, permissions, device, and connectivity context.
3. **Frontend state machine:** default, loading, empty, validation, authorization denial, conflict, dependency failure, timeout, success, disabled, retrying, and degraded states as applicable.
4. **Backend operations:** operation IDs, commands, queries, events, and jobs involved.
5. **Error vocabulary:** stable machine codes, user-safe messages, field associations, retryability, and support correlation.
6. **Mutation semantics:** optimistic or pessimistic, idempotency, cancellation, conflict detection, and recovery.
7. **Budgets:** response target, maximum wait, polling/retry cadence, and progressive feedback.
8. **Accessibility:** focus, announcement, keyboard, touch, reduced motion, and non-color status cues.
9. **Instrumentation:** success/failure analytics, logs, traces, and service metrics.
10. **Acceptance evidence:** route × viewport × state captures and backend/error-path tests.

## Error-to-UI Mapping

Never map every backend failure to a generic toast. Classify failures:

| Failure | UI responsibility | System responsibility |
|---|---|---|
| Validation | Associate field or explain request issue | Stable field/code contract |
| Authentication expired | Preserve work, reauthenticate safely | Session refresh and replay policy |
| Authorization denied | Explain unavailable action without data leakage | Resource/action policy and audit event |
| Version conflict | Show changed data and reconciliation path | Version token, conflict payload, no silent overwrite |
| Rate limited | Communicate retry timing | Retry-After and bounded client behavior |
| Timeout | Preserve state and offer safe retry | Correlation, idempotency, bounded operation |
| Dependency unavailable | Provide degraded path or status | Circuit breaker, fallback, alerting |
| Unknown internal failure | Provide correlation and recovery | Structured problem response and incident telemetry |

## Latency as Design Input

Latency budgets determine design:

- Under immediate-response threshold: direct feedback without artificial loading.
- Noticeable delay: stable loading state and disabled duplicate action.
- Long-running operation: progress, cancellation, background continuation, and return path.
- Unknown duration: do not show fabricated percentage progress.
- Retryable background work: display durable status from server state, not only client memory.

## Optimistic Interaction Gate

Optimistic behavior is allowed only when:

- Duplicate submission is safe or protected by idempotency.
- Server conflict is detectable.
- Reconciliation is defined.
- Failure can restore or clearly correct the UI.
- Authorization cannot change between optimistic display and commit without a safe denial path.

## Design Review Questions

- What does the user see if every dependency fails independently?
- Is the error actionable and safe?
- Can the user distinguish pending, complete, failed, and unknown?
- Does refresh or navigation lose critical progress?
- Are destructive actions reversible or explicitly confirmed?
- Does mobile preserve the same task priority under reduced space and unreliable connectivity?
- Can support correlate the user-visible failure to backend evidence?

<!-- END SOURCE: references/experience-design-to-system-contract.md -->

---

## Source: `references/backend-architecture-and-domain-boundaries.md`

<!-- BEGIN SOURCE: references/backend-architecture-and-domain-boundaries.md -->

# Backend Architecture and Domain Boundaries

## Boundary Quality

A strong boundary has a clear purpose, owner, vocabulary, input/output contract, invariant set, failure behavior, and operational responsibility. A weak boundary leaks storage models, shares mutable state, requires synchronized deployments, or leaves policy decisions ambiguous.

## Component Contract

For each component define:

- Stable identifier and type
- Business capability
- Owner and escalation
- Criticality and SLO
- Trust zone and data classification
- Public interfaces and consumers
- Persistence owned
- Dependencies and timeout budgets
- Scaling unit and concurrency model
- Failure isolation and fallback
- Deployment and rollback unit

## Dependency Direction

Prefer dependencies that follow business capability and ownership. Avoid cycles because they create:

- Coordinated releases
- Ambiguous ownership
- Cascading retries
- Transactional coupling
- Difficult incident localization
- Inability to degrade one capability independently

When a cycle is intentional, document why, define a stable protocol, and test independent failure of every edge.

## Domain and Persistence

- One service should own mutation rules for its authoritative data.
- Shared databases require explicit table ownership and migration coordination.
- Read models may be duplicated, but source-of-truth and staleness must be explicit.
- Cross-domain transaction assumptions require a protocol: saga, outbox, compensating action, or deliberate atomic boundary.
- Events describe completed facts; commands request actions. Do not use ambiguous payloads as both.

## Trust Boundaries

Every edge crossing a trust zone declares:

- Authentication mechanism and identity propagation
- Authorization decision point and policy semantics
- Encryption in transit
- Input validation and output constraints
- Timeout and request-size limits
- Rate and concurrency controls
- Data classification and minimization
- Audit requirements

Network location alone is not trust.

## Architecture Smells

- A central service owns unrelated domain rules
- Multiple components write the same authoritative records
- Public API shape mirrors database rows
- Critical synchronous call chains exceed the user latency budget
- Queue consumers are not idempotent
- Cache invalidation depends on unversioned keys
- Health checks do not exercise critical dependencies
- One component has many incoming critical dependencies, one replica, and no fallback
- Feature flags become permanent divergent architectures
- Error handling converts all failures into successful empty responses

## Decision Record

For material decisions record context, forces, alternatives, decision, consequences, validation evidence, and reversal trigger. A decision record is not a retrospective justification; it is a falsifiable engineering commitment.

<!-- END SOURCE: references/backend-architecture-and-domain-boundaries.md -->

---

## Source: `references/backend-design-quality-gates.md`

<!-- BEGIN SOURCE: references/backend-design-quality-gates.md -->

# Backend Design Quality Gates

## Product Gate

- Operations map to explicit user or operator outcomes.
- Error semantics support designed recovery states.
- Long-running behavior, cancellation, and duplicate submissions are defined.
- Administrative behavior has audit and least-privilege rules.

## Domain Gate

- Invariants are named and tested.
- Commands, queries, events, and ownership are unambiguous.
- Concurrency and conflict behavior are explicit.
- Partial failure cannot silently violate business truth.

## API Gate

- Stable operation identities and structured errors exist.
- Authentication and authorization semantics are explicit.
- Pagination, filtering, ordering, versioning, idempotency, and rate limits are defined where applicable.
- Baseline/current compatibility is evaluated.

## Data Gate

- Transaction boundary and isolation assumptions are documented.
- Unique, foreign-key, and check constraints enforce suitable invariants.
- Migrations are compatible, bounded, observable, verifiable, and reversible at the declared risk level.
- Retention, deletion, backup, and restore responsibilities are defined.

## Security Gate

- Threat model covers entry points, actors, assets, trust boundaries, tenant boundaries, and abuse cases.
- Authorization is tested negatively.
- Inputs are constrained; outputs are safely encoded.
- Secrets and credentials are stored, rotated, and redacted correctly.
- Audit events are durable and access-controlled.

## Reliability Gate

- Every remote operation is bounded by timeout and cancellation.
- Retries are safe, limited, jittered, and fit the caller budget.
- Circuit breaking, bulkheading, overload, and fallback behavior are appropriate.
- Queues have deduplication, poison-message, backlog, and replay strategies.

## Observability Gate

- Critical flows have structured events, useful metrics, traces, correlation, SLOs, alerts, dashboards, runbooks, and owners.
- Telemetry distinguishes dependency, policy, validation, data, and internal failures.
- Sensitive data is excluded or minimized.

## Delivery Gate

- Deployment ordering and compatibility window are executable.
- Feature flags have ownership and removal criteria.
- Rollback includes data and contract compatibility, not only old binaries.
- Final commands and outcomes are current and attributable to the reviewed build.

<!-- END SOURCE: references/backend-design-quality-gates.md -->

---

## Source: `references/api-contracts-and-compatibility.md`

<!-- BEGIN SOURCE: references/api-contracts-and-compatibility.md -->

# API Contracts and Compatibility

## Contract Requirements

Each operation should declare:

- Stable operation ID
- Authentication and authorization expectation
- Request parameters and body constraints
- Success responses
- Structured 4xx and relevant 5xx responses
- Stable machine error code and correlation identifier
- Idempotency semantics for mutations
- Concurrency token where lost updates are possible
- Pagination, filtering, sorting, and maximum limits for collections
- Rate-limit behavior and retry timing
- Deprecation and versioning metadata when applicable

## Compatibility Rules

Treat these as breaking unless a versioned migration proves otherwise:

- Removing a path or method
- Removing a previously documented response used by consumers
- Adding a required request field or header
- Narrowing accepted enum values or formats
- Changing a field type, unit, meaning, or nullability
- Renaming fields without dual-read/dual-write compatibility
- Changing authorization in a way that invalidates existing valid clients without migration
- Changing ordering, pagination cursor, idempotency, or retry semantics
- Reusing an error code for a different condition

Usually additive:

- New optional request field
- New response field when consumers tolerate unknown fields
- New endpoint
- New non-breaking error detail under a stable code

Compatibility is consumer behavior, not schema appearance. Consumer-driven contract tests are stronger than producer-only confidence.

## Error Model

Use a consistent problem shape containing at least:

- Human-safe title
- HTTP status
- Stable machine code
- Correlation identifier
- Optional field errors
- Optional retryability or retry timing

Do not expose stack traces, SQL, secrets, internal hostnames, or policy-sensitive resource existence.

## Idempotency

For create/command operations that can be retried:

- Accept an idempotency key scoped to actor and operation.
- Persist outcome or in-progress state for an appropriate window.
- Return the same semantic result for duplicate delivery.
- Define behavior when payload differs for the same key.
- Prevent a gateway and client from independently multiplying attempts.

## Deployment Sequence

For a breaking conceptual change use:

1. Add backward-compatible producer behavior.
2. Deploy consumers able to read old and new.
3. Observe adoption and error telemetry.
4. Move production writes/reads.
5. Verify no legacy consumers remain.
6. Remove old behavior in a separately reviewed release.

## Review Evidence

- Baseline and current contract hashes
- Breaking-change report
- Consumer inventory and owners
- Contract-test results
- Canary/compatibility telemetry
- Deprecation schedule
- Rollback behavior

<!-- END SOURCE: references/api-contracts-and-compatibility.md -->

---

## Source: `references/data-integrity-transactions-and-migrations.md`

<!-- BEGIN SOURCE: references/data-integrity-transactions-and-migrations.md -->

# Data Integrity, Transactions, and Migrations

## Invariant-First Design

Write invariants before choosing queries or ORM calls. Examples:

- An order total equals the sum of accepted line items under one pricing version.
- A reservation cannot reduce available inventory below zero.
- A user cannot access records outside authorized tenancy.
- A payment transition cannot move from terminal success back to pending.
- An event is published once logically even if transport delivery is duplicated.

Enforce invariants at the strongest practical layer: domain logic, transaction, unique/check/foreign-key constraint, and idempotency record. Tests alone do not enforce production concurrency.

## Transaction Review

For each mutation define:

- Read set and write set
- Isolation and locking assumptions
- Expected contention
- Uniqueness and ordering constraints
- Retry behavior for serialization/deadlock failures
- External side effects
- Partial-commit recovery
- Event publication strategy

Avoid holding database transactions open across remote calls. Use an outbox or compensating workflow when persistence and message publication must be coordinated.

## Concurrency Patterns

- **Optimistic concurrency:** version/ETag check, explicit conflict response, user or service reconciliation.
- **Pessimistic locking:** bounded lock scope, timeout, consistent lock ordering, contention telemetry.
- **Idempotency record:** key, actor scope, payload fingerprint, status, outcome, expiry.
- **Unique constraint:** preferred for race-safe uniqueness instead of pre-check alone.
- **Inbox/outbox:** deduplicate consumed messages and atomically record produced events with state.

## Migration Safety

### Expand

Add compatible schema or behavior. New columns should often begin nullable or with a safe server-side default. Add indexes using online/concurrent mechanisms where supported.

### Migrate

Deploy code that can read old and new representations. Backfill in bounded batches with checkpoints, rate limits, idempotency, progress telemetry, and stop conditions.

### Contract

Only remove old shape after consumer and data verification. Destructive cleanup is a separate release with an explicit compatibility window.

## Backfill Gate

A large backfill requires:

- Estimated rows and data volume
- Batch size and ordering key
- Checkpoint and resume behavior
- Idempotent update rule
- Load and lock budget
- Replica/CDC impact
- Progress, error, and lag metrics
- Verification query and sampled semantic checks
- Abort and rollback procedure

## Rollback Reality

Code rollback is not data rollback. Verify:

- Old code can read new schema and values.
- New writes do not create states old code rejects.
- Removed columns/tables can be restored or remain untouched through the rollback window.
- Queued messages and events remain compatible.
- Backfill can stop and resume without duplication.

## Migration Evidence

- Query plan and lock behavior on representative data
- Staging or shadow execution results
- Batch duration and load profile
- Constraint validation results
- Counts and semantic samples before/after
- Deployment-order rehearsal
- Rollback rehearsal or explicit irreversible-risk approval

<!-- END SOURCE: references/data-integrity-transactions-and-migrations.md -->

---

## Source: `references/data-privacy-and-classification.md`

<!-- BEGIN SOURCE: references/data-privacy-and-classification.md -->

# Data Privacy and Classification

## Classification

Classify data at collection and at every boundary:

- Public
- Internal
- Confidential
- Restricted or regulated

Record purpose, owner, subjects, retention, allowed processors, regions, encryption, access policy, logging policy, and deletion behavior.

## Minimization

- Collect only fields necessary for an explicit purpose.
- Avoid copying sensitive data into analytics, logs, caches, search indexes, events, and test fixtures.
- Prefer identifiers or derived signals over raw sensitive values.
- Do not retain payloads merely because storage is available.

## Access and Tenant Isolation

- Enforce tenant/resource scope server-side.
- Include denied-case tests for direct object references, enumeration, bulk operations, exports, and administrative paths.
- Separate support access from normal user access and audit elevation.
- Do not reveal whether an unauthorized resource exists.

## Retention and Deletion

Define:

- Retention duration and legal/business basis
- Deletion trigger
- Soft-delete and hard-delete semantics
- Backup expiry and restore implications
- Derived copies and downstream processor deletion
- Audit evidence that does not reintroduce deleted sensitive content

## Telemetry and Debugging

Telemetry should retain correlation and diagnosis value without sensitive payloads. Use allow-listed fields, structured redaction, access controls, and sampling. Incident evidence must not become an uncontrolled data export.

## Review Gate

A data flow is incomplete when classification, purpose, owner, retention, access, encryption, and deletion are unknown. Missing privacy evidence lowers release confidence and may be a hard blocker for restricted data.

<!-- END SOURCE: references/data-privacy-and-classification.md -->

---

## Source: `references/application-security-and-threat-modeling.md`

<!-- BEGIN SOURCE: references/application-security-and-threat-modeling.md -->

# Application Security and Threat Modeling

## Threat Model Inputs

Capture:

- Assets and security objectives
- Human, service, administrative, and adversarial actors
- Entry points and exposed protocols
- Trust boundaries and privilege transitions
- Authentication and authorization decisions
- Data classifications and secret locations
- Third parties and supply-chain execution
- Abuse cases and business-logic fraud
- Detection and response expectations

## Authorization Matrix

For every sensitive action record:

| Subject | Action | Resource | Context | Decision | Enforcement point | Negative test |
|---|---|---|---|---|---|---|

Test cross-tenant, cross-user, stale-role, guessed-ID, bulk, nested-resource, export, and administrative variants. Middleware presence is not proof that every resource query is scoped correctly.

## Input and Output Boundaries

- Parse into typed structures with length, range, enum, and format limits.
- Reject unknown or ambiguous fields when appropriate.
- Use parameterized database access.
- Use argument-vector process execution instead of shell interpolation.
- Canonicalize and constrain file paths.
- Constrain outbound URL schemes, hosts, addresses, redirects, ports, and response size.
- Encode output for its rendering context.
- Sanitize only when rich content is an intentional product requirement.

## Session and Browser Controls

Review cookie scope, SameSite, Secure, HttpOnly, CSRF defense, origin checking, token storage, refresh rotation, logout invalidation, clickjacking defense, content security policy, CORS, and cacheability of sensitive responses.

## File Uploads

Define file type verification by content, size limits, decompression limits, filename handling, storage isolation, malware policy, image/document re-encoding, serving headers, access control, retention, and deletion. Never execute or serve user content from an application origin without deliberate isolation.

## Secrets

- Store in approved secret management.
- Use short-lived workload identity where possible.
- Restrict access and audit retrieval.
- Rotate after suspected exposure.
- Redact logs, errors, screenshots, build output, and reports.
- Treat a committed secret as exposed even after deletion from the latest revision.

## Threat-Model Exit Criteria

- Material abuse cases have preventive and detective controls.
- Authorization negative tests exist.
- High-risk entry points have bounded input and resource use.
- Secrets and restricted data cannot enter normal telemetry.
- Residual risks have owners, evidence, expiry, and review triggers.

Static source rules are triage aids, not certification.

<!-- END SOURCE: references/application-security-and-threat-modeling.md -->

---

## Source: `references/resilience-and-distributed-failure-modes.md`

<!-- BEGIN SOURCE: references/resilience-and-distributed-failure-modes.md -->

# Resilience and Distributed Failure Modes

## End-to-End Budget

Start with the user or job deadline. Allocate time across client, gateway, service, queue, database, and third party. A callee timeout longer than its caller budget is not protection.

For each remote operation define:

- Connection and operation timeout
- Cancellation propagation
- Maximum attempts
- Backoff and jitter
- Retryable error classes
- Idempotency
- Circuit-breaker thresholds and recovery
- Concurrency and queue limits
- Fallback or degraded behavior
- Telemetry and alerting

## Retry Amplification

Total attempts can multiply across layers. Three attempts in client, gateway, and service can produce 27 downstream attempts. Place retries in the layer with the best semantic context, disable redundant retries, and enforce one end-to-end attempt budget.

Never retry:

- Non-idempotent mutation without protection
- Authorization denial
- Deterministic validation failure
- Capacity overload without server guidance and backoff
- Request after caller cancellation

## Failure Isolation

- Bulkhead independent workloads and tenants.
- Bound queues and reject or shed load deliberately.
- Protect critical reads/writes from optional work.
- Use circuit breaking for sustained dependency failure.
- Keep health checks representative but inexpensive.
- Define cold-start, cache-miss, and failover behavior.

## Messaging

Review duplicate delivery, ordering, poison messages, dead-letter handling, replay, schema evolution, consumer lag, retention, deduplication, and side-effect idempotency. “Exactly once” usually depends on application semantics, not transport marketing.

## Cache Failure

Define stale tolerance, stampede protection, key versioning, invalidation, negative caching, tenant isolation, and behavior when cache is unavailable. A cache must not become the only copy of authoritative state.

## Game-Day Evidence

Exercise bounded scenarios in a safe environment:

- Dependency timeout
- Partial unavailability
- Queue backlog
- Database failover
- Cache loss
- Rate limiting
- Duplicate message
- Slow downstream response
- Deployment interruption

Record observed behavior, telemetry, alert delivery, operator action, user experience, recovery time, and follow-up risks.

<!-- END SOURCE: references/resilience-and-distributed-failure-modes.md -->

---

## Source: `references/observability-slos-and-incident-readiness.md`

<!-- BEGIN SOURCE: references/observability-slos-and-incident-readiness.md -->

# Observability, SLOs, and Incident Readiness

## Flow-Oriented Telemetry

Instrument critical flows, not only components. A useful evidence chain answers:

- Which actor and flow was attempted?
- Which build and configuration handled it?
- Which policy decision occurred?
- Which boundary consumed most time?
- Which dependency or invariant failed?
- What user-visible result occurred?
- Can all signals be joined by correlation or trace identity?

## Structured Logs

Use stable event names and allow-listed fields. Include build, environment, component, operation, outcome, duration, error code, policy decision category, and correlation identifier as appropriate. Exclude credentials, raw tokens, payment data, secret material, and unrestricted request bodies.

## Metrics

Cover:

- Traffic and business throughput
- Error rate by stable code
- Latency distribution
- Saturation, concurrency, queue depth, pool wait, and resource pressure
- Retry, timeout, circuit-breaker, fallback, and rate-limit behavior
- Migration/backfill progress and failures
- Product outcome and abandonment where appropriate

## Traces

Propagate context across browser/server, gateway, service, queue, worker, cache, database, and third party when technically possible. Span names should describe operations, not dynamic identifiers. Record safe attributes that distinguish tenant class, result category, retry attempt, and dependency.

## SLOs and Alerts

A critical flow needs:

- Service-level indicator
- Objective and window
- Error-budget policy
- Fast and slow burn alerts
- Owner and escalation
- Dashboard and runbook

Alert on user impact and exhaustion risk, not every low-level anomaly. A dashboard without an action path is not incident readiness.

## Runbook Content

- Symptoms and impact
- First checks using correlation and build identity
- Dependency and boundary map
- Safe mitigations and their risks
- Rollback and feature-control instructions
- Data integrity checks
- Escalation and communication
- Recovery verification

## Evidence Confidence

Telemetry configuration is not proof that signals arrive. Verify with controlled requests, failure tests, alert delivery, dashboard queries, and incident/game-day records tied to the reviewed build.

<!-- END SOURCE: references/observability-slos-and-incident-readiness.md -->

---

## Source: `references/fullstack-systematic-debugging.md`

<!-- BEGIN SOURCE: references/fullstack-systematic-debugging.md -->

# Full-Stack Systematic Debugging

## Core Rule

Do not patch the most visible symptom. Locate the first failing boundary, state one falsifiable hypothesis, and collect evidence that can distinguish it from alternatives.

## Phase 1 — Reproduce and Stabilize

Record:

- Exact actor, tenant, permissions, inputs, route, device, and state
- Environment, build, configuration, feature flags, schema/migration version, and dependency versions
- Timestamp and correlation identifier
- Expected and observed behavior
- Reproduction frequency and scope

Stabilize randomness, time, data, cache, and asynchronous work where possible. If the issue is intermittent, increase evidence before changing code.

## Phase 2 — Build the Boundary Timeline

Collect evidence from each relevant layer:

```text
browser/client
→ CDN/load balancer
→ gateway/auth policy
→ application service
→ cache/queue/worker
→ database
→ third party
→ response and rendered state
```

For each boundary mark `pass`, `fail`, or `unknown`. The last confirmed pass and first confirmed fail define the highest-value investigation area.

## Phase 3 — Hypotheses

Each hypothesis contains:

- Precise statement
- Component or boundary
- Supporting evidence IDs
- Contradicting evidence IDs
- Predicted observation if true
- Falsification test
- Risk and cost of the test
- Status: open, rejected, or confirmed

A green health endpoint is weak contradictory evidence for a business-path timeout. Weight evidence by relevance, correlation, freshness, and confidence.

## Phase 4 — Minimal Test

Create the smallest test or probe that separates the leading hypothesis from the next alternative. Change one variable. Avoid bundles of speculative logging, configuration, and code changes that make the result uninterpretable.

## Phase 5 — Root-Cause Fix

Before code:

1. Write a failing regression test or reproducible probe.
2. Verify it fails for the expected reason.
3. Implement one fix at the originating cause.
4. Re-run the targeted test.
5. Re-run the original reproduction.
6. Re-run affected boundary, security, migration, and user-state regression cases.
7. Verify telemetry now distinguishes recurrence.

## Common Cross-Layer Traps

- Frontend retries hide a backend timeout and duplicate mutations.
- Gateway maps authorization failure to generic 500.
- ORM transaction retries replay external side effects.
- Cache returns stale policy or tenant state.
- Deployment mixes incompatible event or database versions.
- Health check bypasses the saturated pool used by real traffic.
- Logging changes timing and appears to “fix” a race.
- A broad exception handler converts failure to empty success.
- Old worker processes consume new payloads after API deployment.

## Stop Conditions

Stop speculative fixes when three attempts fail or each fix reveals a different coupled symptom. Revisit architecture, state ownership, and boundary contracts before a fourth attempt.

<!-- END SOURCE: references/fullstack-systematic-debugging.md -->

---

## Source: `references/risk-discovery-and-adversarial-review.md`

<!-- BEGIN SOURCE: references/risk-discovery-and-adversarial-review.md -->

# Risk Discovery and Adversarial Review

## Risk Model

A risk record contains:

- Stable ID and concise scenario
- Asset or critical flow affected
- Trigger and threat/failure mechanism
- Likelihood, impact, and detectability
- Current controls and evidence
- Residual exposure
- Owner, mitigation, due date, and review trigger
- Status
- Acceptance approver and expiry when accepted

Risk Priority Number is a sorting aid, not a substitute for judgment. A low-likelihood catastrophic data exposure may remain a blocker.

## Discovery Lenses

### Product and experience

- Ambiguous irreversible action
- Error state that loses user work
- Accessibility failure blocking task completion
- Misleading success before durable commit
- Mobile or degraded-network path not exercised

### Architecture

- Single point of failure
- Circular dependency
- Shared mutable database ownership
- Synchronous chain beyond latency budget
- Trust crossing without explicit controls

### Data

- Lost update
- Duplicate side effect
- Partial commit
- Unbounded migration/backfill
- Irreversible deletion
- Retention or restore ambiguity

### Security

- Broken object authorization
- Privilege escalation
- Injection or unsafe deserialization
- SSRF or file-processing abuse
- Secret exposure
- Tenant or data classification leakage

### Operations

- Missing correlation
- Alert without owner/runbook
- Retry storm
- Queue backlog without bound
- Rollback incompatible with data or events

### Supply chain

- Unpinned dependency
- Remote source
- Install lifecycle execution
- Missing lockfile
- Unreviewed generated artifact or binary

## Adversarial Questions

- What assumption would make this design fail silently?
- Which user can reach a resource they should not?
- Which operation can execute twice?
- Which failure returns success?
- Which data state cannot be rolled back?
- Which dependency can exhaust the entire system?
- Which evidence was generated by a different build?
- Which gate can be gamed by suppressing or masking data?
- Which accepted risk has no expiry?

## Acceptance Discipline

Accepted risk requires named authority, rationale, compensating controls, evidence, expiry, and trigger for re-review. “Known issue” is not risk governance.

<!-- END SOURCE: references/risk-discovery-and-adversarial-review.md -->

---

## Source: `references/dependency-and-supply-chain-risk.md`

<!-- BEGIN SOURCE: references/dependency-and-supply-chain-risk.md -->

# Dependency and Supply-Chain Risk

## Manifest Review

Review production and development dependencies, transitive lockfile, package-manager configuration, scripts, registries, mirrors, generated code, containers, CI actions, and downloaded tools.

## Risk Indicators

- Missing lockfile
- Range or floating version in reproducible release path
- Git, HTTP, local, or unverified archive dependency
- Preinstall/install/postinstall execution
- Unreviewed binary download
- Broad CI token or package registry credentials
- Dependency used for a trivial function with high privilege or runtime surface
- Multiple libraries solving the same security-sensitive concern
- Abandoned or unowned critical dependency
- Generated artifact not tied to source and checksum

The included scanner detects selected manifest indicators. It does not query live vulnerability databases in an offline environment.

## Addition Gate

Before adding a dependency record:

- Problem and why existing capabilities are insufficient
- Maintenance and ownership
- License and policy compatibility
- Runtime, bundle, performance, and attack-surface cost
- Release cadence and ecosystem health
- Transitive dependency and lifecycle behavior
- Exact version and lockfile change
- Removal or replacement plan for critical infrastructure

## Build Provenance

A trustworthy release identifies source revision, lockfile, build environment, artifact hashes, configuration identity, generated files, and signer/approver. Rebuilding from the same inputs should be explainable even when byte-for-byte reproducibility is unavailable.

## Secret Safety

Do not place registry tokens, signing keys, or cloud credentials in manifests, command arguments displayed in logs, caches, generated reports, or package artifacts.

<!-- END SOURCE: references/dependency-and-supply-chain-risk.md -->

---

## Source: `references/fullstack-release-and-rollback.md`

<!-- BEGIN SOURCE: references/fullstack-release-and-rollback.md -->

# Full-Stack Release and Rollback

## Release Unit

A release decision applies to an exact build, configuration, contract set, migration set, feature-control state, and evidence bundle. A test result from another revision is not current evidence.

## Pre-Release Sequence

1. Freeze the reviewed contract and configuration identities.
2. Verify unit, contract, integration, end-to-end, visual, security, migration, and engineering checks as applicable.
3. Verify API and event compatibility.
4. Verify migration order, lock/load budget, backfill controls, and rollback window.
5. Verify dashboards, alerts, runbooks, owners, and correlation.
6. Review hard failures and accepted risks.
7. Rehearse or reason explicitly through interruption after each deployment step.
8. Record final commands and outcomes.

## Progressive Delivery

Use canary, staged rollout, feature flags, or traffic shaping when risk warrants. Define:

- Entry criteria
- Cohort or traffic percentage
- Observation duration
- Success and abort metrics
- Automatic and manual stop conditions
- Data compatibility throughout rollout
- Flag owner and removal date

## Rollback Contract

Rollback must cover:

- Application binaries
- Frontend assets and cached clients
- API/event contract compatibility
- Database schema and data written by the new version
- Queued work and scheduled jobs
- Cache keys and serialized values
- Feature flags and configuration
- Third-party state changes

For irreversible operations, define forward recovery and require explicit approval before release.

## Post-Release Verification

Verify real critical-flow telemetry, error codes, latency, saturation, authorization denials, data invariants, queue lag, migration progress, and user-visible behavior. Absence of alerts is not sufficient if alert coverage is unverified.

## Decision States

- **Approved:** required gates pass, confidence meets policy, no hard failures.
- **Conditionally approved:** only when policy explicitly permits bounded residual risk with owner, expiry, and rollback readiness.
- **Blocked:** any hard failure, blocker risk, insufficient confidence, incompatible contract, unsafe migration, or missing rollback evidence.

<!-- END SOURCE: references/fullstack-release-and-rollback.md -->

---

## Source: `references/vision-loop-protocol.md`

<!-- BEGIN SOURCE: references/vision-loop-protocol.md -->

# Vision Loop Protocol

## Objective

Convert visual judgment into a repeatable engineering loop. Pixel comparison helps locate changes, but the acceptance target is correct composition, hierarchy, content, interaction, responsiveness, accessibility, and visual language.

## Capture Preconditions

A comparison is invalid unless target and current render are normalized as far as possible:

- Same viewport dimensions and device-pixel ratio
- Same route, query, user role, theme, locale, timezone, and data state
- Same scroll position
- Fonts and images loaded
- Skeletons, transitions, and entrance animations settled
- Time, random values, live counters, rotating content, and ads stabilized
- Browser zoom at 100 percent
- No debug overlay, cursor, selection, or focus ring unless the tested state requires it

A deterministic capture must not silently change product behavior. Time freezing, seeded randomness, masks, disabled animations, and fixture data are declared evidence settings.

## Comparison Strength

Use the strongest available method:

1. Overlay or rapid flicker for alignment and geometry
2. Side-by-side at identical scale for composition and hierarchy
3. Automated pixel diff for normalized regression detection
4. Region crops for typography, icons, controls, and dense local deltas
5. DOM and computed-style inspection after a visual delta is observed

Automated diff is diagnostic. Anti-aliasing, font rasterization, media, and dynamic data create noise. Exclude only proven dynamic regions and keep every mask narrow.

## Delta Ledger

Record:

| Field | Meaning |
|---|---|
| Case | Route, viewport, state, theme, and role |
| Region | Header, hero, card, table, form, footer, overlay, etc. |
| Category | Content, asset, structure, geometry, responsive, typography, surface, state, motion, accessibility |
| Severity | Blocker, major, or minor |
| Expected | Reference or contract behavior |
| Observed | Current behavior |
| Cause hypothesis | Specific content, DOM, CSS, token, asset, or state cause |
| Fix | Smallest coherent change |
| Regression surface | Cases likely to be affected |
| Evidence | Capture, diff, DOM record, audit, or command result |
| Status | Open, improved, accepted, or deferred with reason |

### Blocker

- Missing primary region, content, or required asset
- Broken route or primary interaction
- Unusable clipping, overlap, horizontal overflow, or unreadable content
- Wrong responsive composition
- Missing required state
- Accessibility issue that blocks task completion
- Capture dimensions or state cannot be normalized

### Major

- Incorrect hierarchy, grid, density, type scale, or component proportions
- Primary surface language materially wrong
- Large asset crop/aspect mismatch
- Interaction contradicts target or contract
- Repeated design-system inconsistency

### Minor

- Small spacing, radius, border, shadow, icon alignment, or subtle color discrepancy
- Difference does not alter hierarchy, comprehension, or task completion

## Iteration Discipline

Each loop changes one coherent cause group. Do not change unrelated geometry, typography, colors, and motion in one pass because the next render cannot attribute improvement or regression.

After a change:

1. Re-render the exact failing case.
2. Confirm the intended delta improved.
3. Inspect neighboring regions.
4. Re-run affected responsive and interaction cases.
5. Update the ledger.

## Original-Design Review

Without a reference image, compare the render against the design contract:

- Is the primary task identifiable within seconds?
- Is one hierarchy dominant rather than many competing accents?
- Does spacing reveal relationships?
- Does typography create clear levels without excessive sizes or weights?
- Do colors have semantic roles?
- Are cards, borders, gradients, shadows, and motion concept-driven?
- Does mobile preserve task priority rather than merely stack desktop?
- Are loading, empty, error, and focus states designed with equal care?
- Does the surface look specific to this product?

## Tool-Degraded Operation

- Browser and screenshots available: final capture is mandatory.
- Screenshot available, no automated diff: use same-scale side-by-side, crops, and ledger.
- Reference available, current render unavailable: implement cautiously and mark visual verification incomplete.
- No visual tooling: structural and engineering work may continue, but fidelity and visual completion remain unverified.

<!-- END SOURCE: references/vision-loop-protocol.md -->

---

## Source: `references/reference-reconstruction.md`

<!-- BEGIN SOURCE: references/reference-reconstruction.md -->

# Reference Reconstruction

## Observation vs. Inference

Create two columns before implementation.

**Observed:** visible composition, relative dimensions, wrapping, crop, alignment, icon style, contrast, states shown, and motion demonstrated.

**Inferred:** exact font, breakpoint, spacing token, component library, DOM structure, interaction not shown, hidden states, and source asset.

An inference may guide implementation but must remain labeled until verified.

## Extract Design DNA

### Composition

- Page regions and reading order
- Grid columns, gutters, max-width behavior, and alignment lines
- Relative dimensions and whitespace distribution
- Overlap, crop, asymmetry, and focal point

### Typography

- Family category and available alternatives
- Role hierarchy
- Weight, size, line height, tracking, case, and measure
- Wrapping and font-metric effects on geometry

### Color and Surface

- Semantic contrast relationships
- Border thickness and radius family
- Elevation, blur, gradient, texture, and background treatment

### Assets and Icons

- Identity, crop, aspect ratio, resolution, focal point, and treatment
- Icon family, stroke weight, fill, optical size, and baseline alignment

### Interaction

- Affordances and state changes visible in recordings
- Timing, direction, continuity, and interruption
- Keyboard and reduced-motion behavior that still must be designed when not shown

## Reconstruction Strategy

1. Build a wireframe matching region order and macro geometry.
2. Validate dimensions and responsive composition.
3. Match typography and wrapping.
4. Match assets and component proportions.
5. Match surface language.
6. Implement states and motion.
7. Apply optical corrections.

## Missing Asset Policy

Do not silently substitute a different image and claim exact fidelity. Report:

- Missing asset
- Substitute used, if approved
- Affected region
- Hierarchy or crop impact
- What is required for exact acceptance

## Ethical and Technical Boundaries

Reproduce interfaces only when the user has the right to do so. Do not copy proprietary assets, misleading branding, or authentication surfaces for deceptive use. Preserve asset licenses and attribution obligations.

<!-- END SOURCE: references/reference-reconstruction.md -->

---

## Source: `references/responsive-and-state-matrix.md`

<!-- BEGIN SOURCE: references/responsive-and-state-matrix.md -->

# Responsive and State Matrix

## Responsive Design Is Composition

Responsive work is not a collection of device presets. A breakpoint exists because content, controls, or hierarchy can no longer satisfy the design contract at the current width.

For each region decide what:

- Reflows
- Reorders
- Collapses
- Hides
- Scrolls
- Becomes sticky
- Changes density
- Changes interaction model

## Representative Matrix

Use the user’s explicit matrix first. When absent, choose a minimal product-specific set:

| Surface | Representative cases |
|---|---|
| Marketing page | Narrow mobile, wide mobile, compact desktop/tablet, wide desktop |
| Application shell | Narrow mobile, desktop, navigation open, dense content |
| Dashboard | Compact width, standard desktop, long labels, empty/error/loading |
| Form flow | Default, focus, validation error, submitting/disabled, success |
| Exact reconstruction | Exact target viewport plus one narrower and one wider regression case |

Review widths immediately before and after content pressure points. Framework defaults are starting hypotheses, not proof.

## Layout Gate

Pass only when:

- Containers and alignment lines are intentional
- No unintended horizontal scrolling exists
- Text does not collide, clip, or become unreadably narrow
- Controls retain usable targets and spacing
- Images keep intended focal points and aspect ratios
- Navigation has a defined compact behavior
- Dense tables, charts, and forms have an explicit narrow-width strategy
- Sticky/fixed regions do not hide content
- Text enlargement and zoom do not destroy task completion

## State Matrix

For every applicable component or flow:

| State | Required question |
|---|---|
| Default | Is purpose and affordance clear? |
| Hover | Does it add information without being required? |
| Focus | Is focus visible, ordered, and unclipped? |
| Active/pressed | Is activation feedback immediate? |
| Selected | Is selection conveyed beyond color? |
| Disabled | Is the state clear and the reason discoverable when needed? |
| Loading | Is progress understandable and layout stable? |
| Empty | Is the next useful action clear? |
| Error | Is the problem specific, associated, and recoverable? |
| Success | Is completion confirmed without trapping the user? |

## Dense Content

Test long names, localized copy, large numbers, negative values, unbroken strings, missing avatars, large tables, and partial data. A clean demo fixture does not prove a resilient composition.

## Mobile Priority

Do not merely stack desktop regions. Preserve the primary task, remove redundant framing, reorder evidence, simplify navigation, and decide which secondary information becomes disclosure, horizontal scroll, summary, or another screen.

<!-- END SOURCE: references/responsive-and-state-matrix.md -->

---

## Source: `references/frontend-engineering-gates.md`

<!-- BEGIN SOURCE: references/frontend-engineering-gates.md -->

# Frontend Engineering Gates

## Repository Fit

Before implementation:

- Read package scripts, framework configuration, routing, data fetching, state patterns, CSS strategy, test setup, and deployment constraints.
- Reuse existing primitives, tokens, utilities, icons, and component conventions.
- Avoid introducing another framework, UI kit, state library, styling strategy, or animation dependency for convenience.
- Preserve public interfaces unless migration is part of the approved scope.

## Component Architecture

Pass only when:

- Components have one understandable responsibility
- State ownership is deliberate
- Repeated behavior uses variants or composition
- Page-specific composition remains near the page
- Shared primitives are stable and domain-neutral
- Data transformation and side effects are separated when that improves testability
- Props and events form a clear interface
- Giant components, deeply coupled contexts, and duplicated one-off styling are avoided

Do not extract merely because markup appears twice. Extract when it creates a stable concept, variant contract, or test boundary.

## Styling and Tokens

Pass only when:

- Semantic tokens express roles rather than raw appearance
- Spacing, type, radii, borders, shadows, and motion use coherent scales
- Global styles are minimal and intentional
- Specificity is controlled
- Responsive rules live with the concept they govern
- Arbitrary values are limited to justified optical corrections
- Theme behavior is predictable
- Browser defaults are accepted or normalized deliberately

Repeated arbitrary values indicate a missing token or component variant.

## Data and State

Handle relevant loading, refetching, empty collections, partial data, long labels, validation errors, network failures, permission restrictions, pending actions, optimistic rollback, and stale/conflicting data.

Use deterministic fixtures for captures and tests.

## Testing Layers

Use the repository’s existing tools:

- Unit tests for pure behavior and transformations
- Component tests for variants, state, and interaction
- Integration tests for routed or data-connected flows
- End-to-end tests for the primary task
- Visual regression tests for stable high-value surfaces
- Build and hydration checks for server-rendered applications

Visual screenshots complement behavior tests; they do not replace them.

## Verification Matrix

| Check | Evidence |
|---|---|
| Dependency health | Existing lockfile respected; install succeeds |
| Type safety | Typecheck exits successfully |
| Static analysis | Lint exits successfully |
| Behavior | Relevant tests pass |
| Build | Production build succeeds |
| Runtime | Target routes have no blocking console, page, or network failures |
| Visual | Final acceptance captures exist |
| Accessibility | Automated scan plus manual primary-flow review |
| Responsive | Required viewport/state matrix reviewed |
| Performance | Relevant measurements or an explicit unmeasured gap |

Classify new warnings. Do not dismiss them automatically.

<!-- END SOURCE: references/frontend-engineering-gates.md -->

---

## Source: `references/accessibility-and-interaction.md`

<!-- BEGIN SOURCE: references/accessibility-and-interaction.md -->

# Accessibility and Interaction

## Structural Gate

Verify:

- Semantic landmarks and heading order
- Native elements before custom roles
- Programmatic names for controls and meaningful images
- Labels, descriptions, and error associations
- Logical DOM and focus order
- Non-color indicators for state
- Useful alternative text and decorative-image handling

## Keyboard Gate

Review the primary task without a pointer:

- All interactive elements are reachable
- Tab order follows reading and task order
- Focus is visible and not clipped or obscured
- Enter and Space behavior matches control semantics
- Escape dismisses overlays where expected
- Focus moves into overlays and returns to the trigger
- No keyboard trap exists except intentional modal containment
- Composite widgets implement their expected keyboard model

The bundled keyboard probe records a sequence; it does not replace manual interaction review.

## Forms

- Persistent labels exist
- Required fields are communicated programmatically
- Errors identify the problem and recovery action
- Errors are associated with the field and summarized when appropriate
- Invalid submission moves or guides focus predictably
- Password, autocomplete, input mode, and formatting behavior fit the field
- Disabled controls are not used where read-only or explanatory behavior is required

## Pointer and Touch

- Targets are comfortably usable
- Hover is never the only path to information
- Drag has a keyboard or non-drag alternative when required
- Destructive actions have proportional confirmation or undo
- Hit areas do not overlap
- Touch scrolling and sticky regions do not fight

## Asynchronous Changes

Meaningful progress, completion, errors, and content changes are announced when users would otherwise miss them. Avoid excessive live-region noise.

## Motion and Sensory Safety

- Reduced-motion behavior exists
- Repeated or large motion is restrained
- Motion does not block task completion
- Flashing and rapid contrast changes are avoided
- Color is not the only signal

## Automated Audit Limits

Automated rules can find many markup and contrast issues. They cannot prove task clarity, correct labels, sensible focus order, accurate alternative text, or usable interaction. Treat automated results as one evidence layer.

<!-- END SOURCE: references/accessibility-and-interaction.md -->

---

## Source: `references/performance-and-runtime.md`

<!-- BEGIN SOURCE: references/performance-and-runtime.md -->

# Performance and Runtime

## Measure Before Claiming

Do not state that a change is fast, optimized, or improves Core Web Vitals without measurement in a representative environment.

## Review Areas

### Media

- Intrinsic dimensions prevent layout shift
- Responsive sources match rendered sizes
- Modern formats and compression are appropriate
- Priority and lazy loading reflect visual importance
- Crops and focal points remain correct

### Fonts

- Required weights are limited
- Subsetting and loading strategy are intentional
- Fallback metrics reduce layout shift
- Font failure preserves hierarchy and readability

### JavaScript

- Route-level payload is understood
- Client boundaries are no broader than necessary
- Heavy dependencies have evidence-based justification
- Expensive render loops and unnecessary state updates are avoided
- Long lists, tables, and charts use appropriate rendering strategies

### Network and Data

- Duplicate requests are removed
- Waterfalls are understood
- Loading and cache behavior match freshness needs
- Error and retry behavior are bounded

### Layout and Motion

- Asynchronous media, fonts, banners, and content do not create avoidable shift
- Animation uses appropriate properties
- Motion does not trigger repeated layout work

## Runtime Evidence

The tool layer records:

- Console errors and assertions
- Uncaught page errors
- Failed requests
- HTTP error responses

Configure explicit allow-patterns for known benign messages. Do not disable the entire runtime gate because one third-party message is noisy.

## Performance Completion Language

Use one of:

- Measured and passed the stated budget
- Measured; residual issue documented
- Not measured in this environment

Never use “optimized” as a substitute for evidence.

<!-- END SOURCE: references/performance-and-runtime.md -->

---

## Source: `references/anti-generic-design.md`

<!-- BEGIN SOURCE: references/anti-generic-design.md -->

# Anti-Generic Design

## Reject Unjustified Defaults

Unless the design contract requires them, reject:

- Everything inside rounded cards
- Excessive gradients, glow, glass, blur, and decorative blobs
- Oversized generic hero copy with weak product evidence
- Decorative dashboards filled with implausible data
- Repeated icon-heading-paragraph blocks with identical rhythm
- Too many accent colors, type sizes, or elevation levels
- Empty whitespace that does not improve hierarchy
- Arbitrary 3D tilt, parallax, or entrance animation
- Identical treatment for primary, secondary, and destructive actions
- Placeholder copy presented as finished content
- Desktop sections merely stacked on mobile

## Prefer Product Specificity

- One clear primary task
- Realistic content and domain language
- Deliberate information density
- A small coherent type and spacing system
- Meaningful contrast
- Components shaped by the domain
- Designed edge states
- Responsive composition rather than responsive dimensions

## Original-Direction Test

Ask whether another unrelated product could replace its logo and copy without changing the interface. If yes, the design direction is too generic.

Strengthen specificity through information architecture, content type, data density, interaction model, visual evidence, and brand behavior—not decoration alone.

<!-- END SOURCE: references/anti-generic-design.md -->

---

## Source: `lib/direction-gallery-engine.mjs`

<!-- BEGIN SOURCE: lib/direction-gallery-engine.mjs -->

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileExists, writeTextAtomic } from './io.mjs';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toFileUrl(filePath) {
  const resolved = path.resolve(filePath);
  if (process.platform === 'win32') {
    return `file:///${resolved.replaceAll('\\', '/')}`;
  }
  return `file://${resolved}`;
}

/**
 * Opens a local file or URL in the default browser. Returns how it was launched.
 * Never throws for “open failed” — callers treat that as a degraded path.
 */
export async function openInDefaultBrowser(target) {
  const url = String(target ?? '');
  if (!url) throw new Error('openInDefaultBrowser requires a path or URL.');
  const href = url.startsWith('file:') || url.startsWith('http') ? url : toFileUrl(url);
  const platform = process.platform;
  const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = platform === 'darwin' ? [href] : platform === 'win32' ? ['/c', 'start', '', href] : [href];
  return await new Promise((resolve) => {
    const child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.unref();
    child.on('error', (error) => resolve({ ok: false, href, error: error.message }));
    child.on('spawn', () => resolve({ ok: true, href, command }));
  });
}

function normalizeOptions(options = []) {
  return options.slice(0, 3).map((item, index) => {
    const number = Number(item.number ?? index + 1);
    return {
      number,
      label: String(item.label ?? item.thesis ?? `Option ${number}`),
      thesis: String(item.thesis ?? item.label ?? ''),
      imagePath: item.imagePath ? path.resolve(String(item.imagePath)) : null,
      imageHref: item.imageHref ? String(item.imageHref) : null,
      notes: String(item.notes ?? '')
    };
  });
}

/**
 * Writes a self-contained HTML gallery for direction options 1–3 and optionally opens it.
 * Use this when the chat runtime cannot display attached/generated images inline
 * (CLI, some Codex surfaces) or when the user cannot send a reference screenshot into chat.
 */
export async function writeDirectionGallery(config = {}) {
  const outputDir = path.resolve(config.outputDir ?? path.join(process.cwd(), 'design', 'direction-options'));
  const title = String(config.title ?? 'Visual direction options');
  const referenceNote = String(config.referenceNote ?? '');
  const options = normalizeOptions(config.options ?? []);
  if (options.length < 2) throw new Error('writeDirectionGallery requires at least two options.');

  await fs.mkdir(outputDir, { recursive: true });
  const htmlPath = path.join(outputDir, 'index.html');

  const cards = [];
  for (const option of options) {
    let src = option.imageHref;
    if (!src && option.imagePath) {
      const exists = await fileExists(option.imagePath);
      if (!exists) throw new Error(`Option ${option.number} image missing: ${option.imagePath}`);
      const fileName = path.basename(option.imagePath);
      const copied = path.join(outputDir, fileName);
      if (path.resolve(option.imagePath) !== path.resolve(copied)) {
        await fs.copyFile(option.imagePath, copied);
      }
      src = fileName;
    }
    if (!src) {
      src = '';
    }
    cards.push(`<article class="card" id="option-${option.number}">
  <header><span class="num">${option.number}</span><h2>${escapeHtml(option.label)}</h2></header>
  <p class="thesis">${escapeHtml(option.thesis)}</p>
  ${src
    ? `<figure><img src="${escapeHtml(src)}" alt="Direction option ${option.number}"/></figure>`
    : '<p class="missing">Image pending — generate with ImageGen then re-run the gallery.</p>'}
  ${option.notes ? `<p class="notes">${escapeHtml(option.notes)}</p>` : ''}
</article>`);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; background:#0b1020; color:#eef2ff; }
    body { margin:0; }
    main { max-width: 1400px; margin: 0 auto; padding: 28px 20px 48px; }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 4vw, 40px); letter-spacing: -0.03em; }
    .lede { color:#aeb9d6; max-width: 60ch; line-height: 1.5; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-top: 28px; }
    .card { background:#11182b; border:1px solid #27304b; border-radius: 18px; padding: 16px; display:flex; flex-direction:column; gap:12px; }
    .card header { display:flex; align-items:center; gap:12px; }
    .num { display:inline-grid; place-items:center; width:36px; height:36px; border-radius:999px; background:#1d4ed8; font-weight:700; }
    h2 { margin:0; font-size:18px; }
    .thesis, .notes, .missing { margin:0; color:#c7d2fe; line-height:1.45; }
    .missing { border:1px dashed #68708a; border-radius:12px; padding:24px; text-align:center; }
    figure { margin:0; }
    img { width:100%; border-radius:12px; background:#fff; display:block; }
    .footer { margin-top: 28px; color:#aeb9d6; font-size:14px; }
    kbd { background:#1a2238; border:1px solid #27304b; border-radius:6px; padding:2px 6px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p class="lede">Pick <kbd>1</kbd>, <kbd>2</kbd>, or <kbd>3</kbd> in chat. Images are direction evidence — not production assets.</p>
    ${referenceNote ? `<p class="lede">${escapeHtml(referenceNote)}</p>` : ''}
    <section class="grid">${cards.join('\n')}</section>
    <p class="footer">Generated for visual direction exploration. Reply in chat with the option number, then expect a direction spec before implementation.</p>
  </main>
</body>
</html>
`;

  await writeTextAtomic(htmlPath, html);
  const manifestPath = path.join(outputDir, 'gallery.manifest.json');
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    title,
    htmlPath,
    options: options.map((item) => ({
      number: item.number,
      label: item.label,
      thesis: item.thesis,
      imagePath: item.imagePath,
      notes: item.notes
    }))
  };
  await writeTextAtomic(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  let browser = null;
  if (config.open !== false) {
    browser = await openInDefaultBrowser(htmlPath);
  }

  return {
    ok: true,
    outputDir,
    htmlPath,
    manifestPath,
    href: toFileUrl(htmlPath),
    optionCount: options.length,
    browser
  };
}

<!-- END SOURCE: lib/direction-gallery-engine.mjs -->

---

## Source: `scripts/open-direction-gallery.mjs`

<!-- BEGIN SOURCE: scripts/open-direction-gallery.mjs -->

#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { writeDirectionGallery } from '../lib/direction-gallery-engine.mjs';

const HELP = `Usage: node scripts/open-direction-gallery.mjs [options]
  -o, --output-dir <path>   Gallery folder (default: design/direction-options)
      --title <text>        Page title
      --reference-note <t>  Note when no reference screenshot could be attached
      --option <spec>       Repeatable. Format: N|label|imagePath(|notes)
      --no-open             Write HTML only; do not launch the browser

Builds a local HTML page showing direction options 1–3 as images and opens it
in the default browser. Use when chat cannot display images (CLI / some Codex
surfaces) or the user could not attach a reference screenshot.

Example:
  npm run direction:gallery -- \\
    --option '1|Dense utilitarian|design/direction-option-1.png' \\
    --option '2|Spacious editorial|design/direction-option-2.png' \\
    --option '3|Expressive accent|design/direction-option-3.png'
`;

function parseOption(spec) {
  const parts = String(spec ?? '').split('|').map((part) => part.trim());
  if (parts.length < 3) throw new Error(`Invalid --option spec (need N|label|imagePath): ${spec}`);
  return {
    number: Number(parts[0]),
    label: parts[1],
    thesis: parts[1],
    imagePath: parts[2],
    notes: parts[3] ?? ''
  };
}

try {
  const args = parseCli({
    'output-dir': { type: 'string', short: 'o' },
    title: { type: 'string' },
    'reference-note': { type: 'string' },
    option: { type: 'string', multiple: true },
    open: { type: 'boolean', default: true }
  });
  if (args.help) printHelp(HELP);
  else {
    const optionSpecs = args.option ?? [];
    if (!optionSpecs.length) throw new Error('Provide at least two --option entries.');
    const result = await writeDirectionGallery({
      outputDir: args['output-dir'] ? path.resolve(args['output-dir']) : path.resolve('design/direction-options'),
      title: args.title,
      referenceNote: args['reference-note'],
      options: optionSpecs.map(parseOption),
      open: args.open !== false
    });
    process.stdout.write([
      `Direction gallery: ${result.htmlPath}`,
      `Href: ${result.href}`,
      `Options: ${result.optionCount}`,
      `Browser: ${result.browser?.ok ? 'opened' : result.browser ? `not opened (${result.browser.error ?? 'unknown'})` : 'skipped'}`
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }

<!-- END SOURCE: scripts/open-direction-gallery.mjs -->

---

## Source: `lib/direction-init-engine.mjs`

<!-- BEGIN SOURCE: lib/direction-init-engine.mjs -->

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDir, fileExists, writeJsonAtomic, writeTextAtomic } from './io.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readSkillFile(relative) {
  return fs.readFile(path.join(skillRoot, relative), 'utf8');
}

function fillSpecTemplate(template, options = {}) {
  const product = String(options.product ?? 'Product surface');
  const selected = options.selectedOption ? String(options.selectedOption) : '1 | 2 | 3';
  const profilePath = options.profilePath ?? 'design/aesthetic-profile.json';
  const contractPath = options.contractPath ?? 'design/design-contract.json';
  let text = template;
  text = text.replace('- Selected option: 1 | 2 | 3', `- Selected option: ${selected}`);
  text = text.replace('- Selected at (ISO timestamp):', `- Selected at (ISO timestamp): ${options.selectedAt ?? ''}`);
  text = text.replace('- Aesthetic profile path (to write next):', `- Aesthetic profile path (to write next): ${profilePath}`);
  text = text.replace('- Design contract path:', `- Design contract path: ${contractPath}`);
  if (options.product) {
    text = text.replace(
      'Durable record of the user’s chosen look.',
      `Durable record of the user’s chosen look for **${product}**.`
    );
  }
  return text;
}

function scaffoldProfile(options = {}) {
  const axis = (value = null, reason = '') => ({
    value,
    reason: reason || 'Fill from visual-direction-spec.md after the user confirms เริ่มเขียน.',
    consequences: ['Derive from the direction spec keep/change lists']
  });
  return {
    schemaVersion: 1,
    product: String(options.product ?? 'Product surface'),
    audience: String(options.audience ?? ''),
    rationale: String(options.rationale ?? 'Synced from design/visual-direction-spec.md after confirmation.'),
    personality: {
      seriousPlayful: axis(),
      warmClinical: axis(),
      understatedExpressive: axis(),
      denseSpacious: axis(),
      establishedNovel: axis()
    },
    styleDirection: {
      archetype: 'none',
      adopted: [],
      rejected: []
    },
    noveltyBudget: [
      {
        position: 'Fill from direction spec novelty budget',
        decision: 'Fill after เริ่มเขียน',
        reason: 'Copied from visual-direction-spec.md'
      }
    ],
    systems: {
      color: { neutralTemperature: 'cool', accentCount: 1, harmony: 'complementary', themes: ['light'] },
      typography: { scaleRatio: 1.25, roleCount: 5, families: [], maxMeasureCharacters: 72 },
      spacing: { baseUnitPx: 8, scale: [4, 8, 12, 16, 24, 32, 48], density: 'balanced' },
      shape: { radiiPx: [4, 8, 12], elevationLevels: 2 },
      motion: { durationsMs: [120, 200, 320], easings: ['ease-out'], overshoot: 'none', reducedMotionSupported: true }
    },
    voice: {
      person: { value: 3, reason: 'Fill from direction tone' },
      register: { value: 3, reason: 'Fill from direction tone' },
      density: { value: 3, reason: 'Fill from direction density' },
      certainty: { value: 3, reason: 'Fill from product stakes' },
      humour: { value: 1, reason: 'Default restrained until spec says otherwise' }
    },
    nonGoals: [],
    references: ['design/visual-direction-spec.md']
  };
}

function scaffoldContract(options = {}) {
  const product = String(options.product ?? 'Product surface');
  return {
    objective: `Deliver ${product} with the confirmed visual direction.`,
    fidelityMode: options.fidelityMode ?? 'original-direction',
    primaryTask: String(options.primaryTask ?? 'Complete the primary user task on this surface.'),
    audience: String(options.audience ?? ''),
    visualThesis: String(options.visualThesis ?? 'Fill from visual-direction-spec.md Direction Thesis.'),
    aestheticProfile: options.profilePath ?? 'design/aesthetic-profile.json',
    priorityOrder: ['task clarity', 'accessibility', 'responsive composition', 'brand fidelity', 'surface polish'],
    observed: [],
    inferred: [],
    constraints: [],
    composition: { regions: [], density: 'Fill from direction spec' },
    typography: [{ role: 'body', family: '', sizePx: 16, weight: 400, lineHeight: 1.5 }],
    surfaces: { canvas: '', surface: '', radius: '', elevation: '' },
    components: [],
    states: [{ surface: 'primary', default: 'Fill after direction confirm' }],
    responsiveRules: [{ region: 'main', wide: '', compact: '', mobile: '', rationale: '' }],
    motion: {
      durationFamilies: { feedback: 120, transition: 200 },
      easings: { standard: 'ease-out' },
      interruption: 'cancel in-flight on navigation',
      reducedMotion: 'instant equivalent cues'
    },
    emotionalTone: { firstRun: '', empty: '', error: '', success: '' },
    copyVoice: { person: '', register: '', density: '', certainty: '', humour: '' },
    acceptanceCases: [
      {
        key: 'home__desktop__default',
        route: '/',
        viewport: 'desktop',
        state: 'default',
        evidence: ['capture', 'direction-spec']
      }
    ],
    nonGoals: [],
    directionSpec: options.specPath ?? 'design/visual-direction-spec.md'
  };
}

/**
 * Scaffolds durable design-direction artifacts for IDE / CLI / CI use without chat.
 */
export async function initDirectionArtifacts(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const designDir = path.resolve(baseDir, options.designDir ?? 'design');
  const force = options.force === true;
  const paths = {
    designDir,
    specPath: path.join(designDir, 'visual-direction-spec.md'),
    profilePath: path.join(designDir, 'aesthetic-profile.json'),
    contractPath: path.join(designDir, 'design-contract.json'),
    optionsDir: path.join(designDir, 'direction-options')
  };

  await ensureDir(designDir);
  await ensureDir(paths.optionsDir);

  const created = [];
  const skipped = [];

  async function writeUnlessExists(filePath, content, kind) {
    if (await fileExists(filePath) && !force) {
      skipped.push({ path: filePath, kind });
      return false;
    }
    if (typeof content === 'string') await writeTextAtomic(filePath, content.endsWith('\n') ? content : `${content}\n`);
    else await writeJsonAtomic(filePath, content);
    created.push({ path: filePath, kind });
    return true;
  }

  const specTemplate = await readSkillFile('templates/visual-direction-spec.md');
  const relativeProfile = path.relative(baseDir, paths.profilePath).split(path.sep).join('/');
  const relativeContract = path.relative(baseDir, paths.contractPath).split(path.sep).join('/');
  const relativeSpec = path.relative(baseDir, paths.specPath).split(path.sep).join('/');

  await writeUnlessExists(
    paths.specPath,
    fillSpecTemplate(specTemplate, {
      product: options.product,
      selectedOption: options.selectedOption,
      selectedAt: options.selectedAt,
      profilePath: relativeProfile,
      contractPath: relativeContract
    }),
    'visual-direction-spec'
  );

  await writeUnlessExists(
    paths.profilePath,
    scaffoldProfile({
      product: options.product,
      audience: options.audience,
      rationale: options.rationale
    }),
    'aesthetic-profile'
  );

  await writeUnlessExists(
    paths.contractPath,
    scaffoldContract({
      product: options.product,
      audience: options.audience,
      primaryTask: options.primaryTask,
      fidelityMode: options.fidelityMode,
      profilePath: relativeProfile,
      specPath: relativeSpec
    }),
    'design-contract'
  );

  const readmePath = path.join(paths.optionsDir, 'README.md');
  await writeUnlessExists(
    readmePath,
    `# Direction options

Place ImageGen outputs here as \`direction-option-1.png\`, \`direction-option-2.png\`, \`direction-option-3.png\`.

Then open the browser gallery:

\`\`\`bash
npm run direction:gallery -- \\
  --option '1|Thesis one|design/direction-options/direction-option-1.png' \\
  --option '2|Thesis two|design/direction-options/direction-option-2.png' \\
  --option '3|Thesis three|design/direction-options/direction-option-3.png'
\`\`\`
`,
    'options-readme'
  );

  return {
    ok: true,
    baseDir,
    paths: {
      designDir: paths.designDir,
      specPath: paths.specPath,
      profilePath: paths.profilePath,
      contractPath: paths.contractPath,
      optionsDir: paths.optionsDir
    },
    created,
    skipped
  };
}

<!-- END SOURCE: lib/direction-init-engine.mjs -->

---

## Source: `scripts/init-direction.mjs`

<!-- BEGIN SOURCE: scripts/init-direction.mjs -->

#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { initDirectionArtifacts } from '../lib/direction-init-engine.mjs';

const HELP = `Usage: node scripts/init-direction.mjs [options]
      --dir <path>           Project root (default: cwd)
      --design-dir <path>    Design folder relative to --dir (default: design)
      --product <name>       Product / surface name
      --audience <text>      Audience blurb
      --primary-task <text>  Primary user task
      --fidelity-mode <m>    exact-reference | brand-consistent | original-direction
      --selected-option <n>  Prefill selected option 1|2|3
      --force                Overwrite existing files

Scaffolds durable direction artifacts for IDE / CLI / CI:
  design/visual-direction-spec.md
  design/aesthetic-profile.json
  design/design-contract.json
  design/direction-options/README.md
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    'design-dir': { type: 'string' },
    product: { type: 'string' },
    audience: { type: 'string' },
    'primary-task': { type: 'string' },
    'fidelity-mode': { type: 'string' },
    'selected-option': { type: 'string' },
    force: { type: 'boolean', default: false }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await initDirectionArtifacts({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      designDir: args['design-dir'] ?? 'design',
      product: args.product,
      audience: args.audience,
      primaryTask: args['primary-task'],
      fidelityMode: args['fidelity-mode'],
      selectedOption: args['selected-option'],
      force: args.force === true
    });
    process.stdout.write([
      `Direction scaffold: ${result.paths.designDir}`,
      `Created: ${result.created.length}`,
      ...result.created.map((item) => `  + ${item.path}`),
      `Skipped: ${result.skipped.length}`,
      ...result.skipped.map((item) => `  = ${item.path}`),
      'Next: fill the spec after option choice, then npm run direction:sync'
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }

<!-- END SOURCE: scripts/init-direction.mjs -->

---

## Source: `lib/direction-spec-sync-engine.mjs`

<!-- BEGIN SOURCE: lib/direction-spec-sync-engine.mjs -->

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, writeJsonAtomic } from './io.mjs';

export const AXIS_LABELS = Object.freeze({
  seriousPlayful: 'serious ↔ playful',
  warmClinical: 'warm ↔ clinical',
  understatedExpressive: 'understated ↔ expressive',
  denseSpacious: 'dense ↔ spacious',
  establishedNovel: 'established ↔ novel'
});

const LABEL_TO_KEY = Object.fromEntries(Object.entries(AXIS_LABELS).map(([key, label]) => [label.toLowerCase(), key]));

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sectionBody(markdown, heading) {
  const pattern = new RegExp(`## ${escapeRegExp(heading)}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  return markdown.match(pattern)?.[1]?.trim() ?? '';
}

function bulletValues(body) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim())
    .filter(Boolean);
}

function fieldValue(lines, label) {
  const row = lines.find((line) => line.toLowerCase().startsWith(`- ${label.toLowerCase()}`));
  if (!row) return '';
  return row.slice(row.indexOf(':') + 1).trim();
}

/**
 * Parses templates/visual-direction-spec.md shaped Markdown into structured fields.
 */
export function parseDirectionSpec(markdown) {
  const text = String(markdown ?? '');
  const selectionLines = sectionBody(text, 'Selection').split('\n').map((line) => line.trim()).filter(Boolean);
  const selectedRaw = fieldValue(selectionLines, 'Selected option');
  const selectedMatch = selectedRaw.match(/\b([123])\b/);
  const thesisBody = sectionBody(text, 'Direction Thesis');
  const thesis = (thesisBody.match(/^>\s*(.+)$/m)?.[1]
    ?? thesisBody.split('\n').map((line) => line.trim()).find((line) => line && !line.toLowerCase().startsWith('one sentence'))
    ?? '').trim();

  const personality = {};
  const tableBody = sectionBody(text, 'Personality Positions (draft)');
  for (const line of tableBody.split('\n')) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map((cell) => cell.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    if (/^axis$/i.test(cells[0]) || /^:?-+:?$/.test(cells[0])) continue;
    const key = LABEL_TO_KEY[cells[0].toLowerCase()];
    if (!key) continue;
    const value = Number(cells[1]);
    personality[key] = {
      value: Number.isFinite(value) ? value : null,
      reason: cells[2] ?? ''
    };
  }

  const likes = bulletValues(sectionBody(text, 'What We Like (from the chosen option)'));
  const keep = bulletValues(sectionBody(text, 'Keep from the Reference'));
  const change = bulletValues(sectionBody(text, 'Change from the Reference'));
  const nonGoals = bulletValues(sectionBody(text, 'Explicit Non-Goals'));
  const linkedLines = sectionBody(text, 'Linked Artifacts').split('\n').map((line) => line.trim()).filter(Boolean);
  const statusBody = sectionBody(text, 'Status');
  const confirmLine = statusBody.match(/^- \[[ xX]\]\s*User confirmed:\s*([^\n]+)/im)?.[0] ?? '';
  const confirmChecked = /^- \[x\]/i.test(confirmLine);
  const confirmValue = confirmLine.replace(/^- \[[ xX]\]\s*User confirmed:\s*/i, '').trim();
  const confirmedStart = confirmChecked
    && /^เริ่มเขียน(?=\s|$|\()/i.test(confirmValue)
    && !/\|\s*ปรับต่อ/i.test(confirmValue);

  const noveltyLine = change.find((line) => /novelty budget/i.test(line)) ?? '';
  const noveltyBudget = noveltyLine
    ? [{ position: 'Novelty budget', decision: noveltyLine.replace(/^[^:]+:\s*/, ''), reason: 'From visual-direction-spec.md' }]
    : [];

  return {
    selectedOption: selectedMatch ? Number(selectedMatch[1]) : null,
    selectedAt: fieldValue(selectionLines, 'Selected at (ISO timestamp)'),
    chosenImage: fieldValue(selectionLines, 'Chosen image / artifact'),
    referenceScreenshots: fieldValue(selectionLines, 'Reference screenshot(s)'),
    thesis,
    personality,
    likes,
    keep,
    change,
    nonGoals,
    noveltyBudget,
    confirmedStart,
    profilePath: fieldValue(linkedLines, 'Aesthetic profile path (to write next)'),
    contractPath: fieldValue(linkedLines, 'Design contract path')
  };
}

function axisScaffold(entry, fallbackReason) {
  const value = Number.isFinite(Number(entry?.value)) ? Number(entry.value) : null;
  return {
    value,
    reason: String(entry?.reason || fallbackReason || 'Fill from the direction spec.'),
    consequences: Array.isArray(entry?.consequences) && entry.consequences.length
      ? entry.consequences
      : ['Align implementation with the chosen direction thesis']
  };
}

/**
 * Builds or updates an aesthetic profile object from a parsed direction spec.
 */
export function profileFromDirectionSpec(parsed, existing = {}) {
  const product = existing.product || 'Product surface';
  const personality = {};
  for (const key of Object.keys(AXIS_LABELS)) {
    personality[key] = axisScaffold(
      parsed.personality?.[key] ?? existing.personality?.[key],
      parsed.thesis || 'Taken from the confirmed visual direction spec.'
    );
  }

  const adopted = [
    ...parsed.likes.map((line) => line.replace(/^[^:]+:\s*/, '').trim()).filter(Boolean),
    ...parsed.keep.map((line) => line.replace(/^[^:]+:\s*/, '').trim()).filter(Boolean)
  ].filter(Boolean);

  const rejected = parsed.nonGoals.map((line) => line.replace(/^-\s*/, '').trim()).filter(Boolean);
  const noveltyBudget = parsed.noveltyBudget.length
    ? parsed.noveltyBudget
    : (existing.noveltyBudget?.length
      ? existing.noveltyBudget
      : [{ position: 'Declare after confirm', decision: parsed.change[0] ?? 'Fill novelty budget from the direction spec', reason: parsed.thesis || '' }]);

  return {
    schemaVersion: 1,
    product,
    audience: existing.audience ?? '',
    rationale: parsed.thesis || existing.rationale || 'Synced from visual-direction-spec.md',
    personality,
    styleDirection: {
      archetype: existing.styleDirection?.archetype ?? 'none',
      adopted: adopted.length ? [...new Set(adopted)] : (existing.styleDirection?.adopted ?? []),
      rejected: rejected.length ? [...new Set(rejected)] : (existing.styleDirection?.rejected ?? [])
    },
    noveltyBudget,
    systems: existing.systems ?? {
      color: { neutralTemperature: 'cool', accentCount: 1, harmony: 'complementary', themes: ['light'] },
      typography: { scaleRatio: 1.25, roleCount: 5, families: [], maxMeasureCharacters: 72 },
      spacing: { baseUnitPx: 8, scale: [4, 8, 12, 16, 24, 32, 48], density: 'balanced' },
      shape: { radiiPx: [4, 8, 12], elevationLevels: 2 },
      motion: { durationsMs: [120, 200, 320], easings: ['ease-out'], overshoot: 'none', reducedMotionSupported: true }
    },
    voice: existing.voice ?? {
      person: { value: 3, reason: 'Fill from direction tone' },
      register: { value: 3, reason: 'Fill from direction tone' },
      density: { value: 3, reason: 'Fill from direction density' },
      certainty: { value: 3, reason: 'Fill from product stakes' },
      humour: { value: 1, reason: 'Default restrained until spec says otherwise' }
    },
    nonGoals: rejected.length ? rejected : (existing.nonGoals ?? []),
    references: [...new Set([...(existing.references ?? []), 'design/visual-direction-spec.md'])]
  };
}

/**
 * Compares a direction spec to an aesthetic profile and reports drift.
 */
export function compareDirectionSpecToProfile(parsed, profile) {
  const findings = [];
  if (!parsed.thesis) findings.push({ code: 'DIRECTION_THESIS_MISSING', severity: 'blocker', message: 'Direction spec has no thesis blockquote.' });
  if (!parsed.selectedOption) findings.push({ code: 'DIRECTION_OPTION_MISSING', severity: 'high', message: 'Direction spec does not record selected option 1/2/3.' });

  for (const [key, label] of Object.entries(AXIS_LABELS)) {
    const specValue = parsed.personality?.[key]?.value;
    const profileValue = profile?.personality?.[key]?.value;
    if (!Number.isFinite(specValue)) {
      findings.push({ code: 'DIRECTION_AXIS_UNSET', severity: 'high', message: `Spec personality "${label}" has no numeric value.`, path: key });
      continue;
    }
    if (!Number.isFinite(profileValue)) {
      findings.push({ code: 'PROFILE_AXIS_UNSET', severity: 'blocker', message: `Profile personality "${key}" is missing while the spec defines it.`, path: key });
      continue;
    }
    if (Number(specValue) !== Number(profileValue)) {
      findings.push({
        code: 'DIRECTION_PROFILE_AXIS_DRIFT',
        severity: 'blocker',
        message: `Axis ${key} differs: spec=${specValue}, profile=${profileValue}.`,
        path: key
      });
    }
  }

  if (parsed.thesis && profile?.rationale && parsed.thesis.trim() !== String(profile.rationale).trim()) {
    const thesisInRationale = String(profile.rationale).includes(parsed.thesis.trim());
    if (!thesisInRationale) {
      findings.push({
        code: 'DIRECTION_THESIS_DRIFT',
        severity: 'high',
        message: 'Profile rationale does not include the direction-spec thesis.'
      });
    }
  }

  const blockers = findings.filter((item) => item.severity === 'blocker');
  return {
    ok: blockers.length === 0,
    passed: blockers.length === 0 && findings.every((item) => item.severity !== 'high'),
    findings,
    selectedOption: parsed.selectedOption,
    thesis: parsed.thesis
  };
}

export async function syncDirectionSpecToProfile(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const specPath = path.resolve(baseDir, options.specPath ?? 'design/visual-direction-spec.md');
  const profilePath = path.resolve(baseDir, options.profilePath ?? 'design/aesthetic-profile.json');
  const checkOnly = options.checkOnly === true;

  if (!await fileExists(specPath)) throw new Error(`Direction spec not found: ${specPath}`);
  const markdown = await fs.readFile(specPath, 'utf8');
  const parsed = parseDirectionSpec(markdown);

  const profileExists = await fileExists(profilePath);
  let existing = {};
  if (profileExists) {
    existing = JSON.parse(await fs.readFile(profilePath, 'utf8'));
  }

  if (checkOnly && !profileExists) {
    const comparison = {
      ok: false,
      passed: false,
      findings: [{
        code: 'PROFILE_MISSING',
        severity: 'blocker',
        message: `Aesthetic profile not found for --check: ${profilePath}`
      }],
      selectedOption: parsed.selectedOption,
      thesis: parsed.thesis
    };
    return {
      ok: false,
      passed: false,
      checkOnly: true,
      wroteProfile: false,
      specPath,
      profilePath,
      parsed,
      profile: null,
      comparison
    };
  }

  const nextProfile = profileFromDirectionSpec(parsed, existing);
  const comparison = compareDirectionSpecToProfile(parsed, checkOnly ? existing : nextProfile);

  if (!checkOnly) {
    await writeJsonAtomic(profilePath, nextProfile);
  }

  return {
    ok: comparison.ok,
    passed: comparison.passed,
    checkOnly,
    wroteProfile: !checkOnly,
    specPath,
    profilePath,
    parsed,
    profile: checkOnly ? existing : nextProfile,
    comparison
  };
}

<!-- END SOURCE: lib/direction-spec-sync-engine.mjs -->

---

## Source: `scripts/sync-direction-spec.mjs`

<!-- BEGIN SOURCE: scripts/sync-direction-spec.mjs -->

#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson } from '../lib/contract-cli.mjs';
import { syncDirectionSpecToProfile } from '../lib/direction-spec-sync-engine.mjs';

const HELP = `Usage: node scripts/sync-direction-spec.mjs [options]
      --dir <path>         Project root (default: cwd)
      --spec <path>        Direction spec markdown (default: design/visual-direction-spec.md)
      --profile <path>     Aesthetic profile JSON (default: design/aesthetic-profile.json)
      --check              Compare only; do not write the profile
      --json               Emit the sync/check report JSON on stdout
      --output <path>      Write the sync/check report JSON

Reads visual-direction-spec.md and syncs personality / thesis / likes into
aesthetic-profile.json. Use --check in CI to fail on drift after เริ่มเขียน.
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    spec: { type: 'string' },
    profile: { type: 'string' },
    check: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
    output: { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await syncDirectionSpecToProfile({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      specPath: args.spec ?? 'design/visual-direction-spec.md',
      profilePath: args.profile ?? 'design/aesthetic-profile.json',
      checkOnly: args.check === true
    });
    const report = {
      ok: result.ok,
      passed: result.passed,
      checkOnly: result.checkOnly,
      wroteProfile: result.wroteProfile,
      specPath: result.specPath,
      profilePath: result.profilePath,
      selectedOption: result.parsed.selectedOption,
      thesis: result.parsed.thesis,
      findings: result.comparison.findings
    };
    if (args.json || args.output) await emitJson(report, args.output);
    if (!args.json || args.output) {
      process.stdout.write([
        `Direction sync: ${result.checkOnly ? 'check' : 'write'}`,
        `Spec: ${result.specPath}`,
        `Profile: ${result.profilePath}`,
        `Selected option: ${result.parsed.selectedOption ?? 'unset'}`,
        `Findings: ${result.comparison.findings.length}`,
        ...result.comparison.findings.map((item) => `  - [${item.severity}] ${item.code}: ${item.message}`)
      ].join('\n') + '\n');
    }
    if (!result.passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }

<!-- END SOURCE: scripts/sync-direction-spec.mjs -->

---

## Source: `lib/direction-iterate-engine.mjs`

<!-- BEGIN SOURCE: lib/direction-iterate-engine.mjs -->

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, writeTextAtomic } from './io.mjs';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function bulletList(items = []) {
  const values = items.map((item) => String(item ?? '').trim()).filter(Boolean);
  if (!values.length) return '- (none recorded)';
  return values.map((item) => `- ${item}`).join('\n');
}

function nextRoundNumber(markdown) {
  const matches = [...String(markdown).matchAll(/### Round (\d+)\b/gi)];
  if (!matches.length) return 1;
  return Math.max(...matches.map((match) => Number(match[1]))) + 1;
}

function upsertSelectionField(markdown, label, value) {
  const pattern = new RegExp(`^(-\\s*${escapeRegExp(label)}:\\s*).*$`, 'im');
  if (pattern.test(markdown)) return markdown.replace(pattern, `$1${value}`);
  return markdown.replace(
    /(## Selection\n)/i,
    `$1- ${label}: ${value}\n`
  );
}

function resetConfirmStatus(markdown, reply = 'ปรับต่อ') {
  let text = markdown;
  text = text.replace(
    /- \[[ xX]\]\s*User confirmed:.*/i,
    `- [ ] User confirmed: เริ่มเขียน | ปรับต่อ | เลือกใหม่ (last: ${reply})`
  );
  if (!/- \[[ xX]?\]\s*User confirmed:/i.test(text)) {
    text = text.replace(
      /(## Status\n)/i,
      `$1- [ ] User confirmed: เริ่มเขียน | ปรับต่อ | เลือกใหม่ (last: ${reply})\n`
    );
  }
  return text;
}

function appendOrReplaceIterationSection(markdown, roundBlock) {
  if (/^## Iteration History\s*$/im.test(markdown)) {
    return markdown.replace(
      /(## Iteration History\n)([\s\S]*?)(?=\n## [A-Z]|\n## Confirmation Gate|\n## Status|$)/i,
      (_, heading, body) => `${heading}${String(body).trimEnd()}\n\n${roundBlock}\n\n`
    );
  }
  // Insert before Confirmation Gate when present, otherwise before Status, else append.
  if (/^## Confirmation Gate\b/im.test(markdown)) {
    return markdown.replace(
      /(## Confirmation Gate\b)/i,
      `## Iteration History\n\n${roundBlock}\n\n$1`
    );
  }
  if (/^## Status\b/im.test(markdown)) {
    return markdown.replace(
      /(## Status\b)/i,
      `## Iteration History\n\n${roundBlock}\n\n$1`
    );
  }
  return `${ensureTrailingNewline(markdown)}\n## Iteration History\n\n${roundBlock}\n`;
}

/**
 * Parses iteration rounds from a visual-direction-spec.md body.
 */
export function parseIterationHistory(markdown) {
  const section = String(markdown ?? '').match(/## Iteration History\n([\s\S]*?)(?=\n## |$)/i)?.[1] ?? '';
  const rounds = [];
  const blocks = section.split(/^### Round /im).slice(1);
  for (const block of blocks) {
    const lines = block.split('\n');
    const header = lines[0] ?? '';
    const roundMatch = header.match(/^(\d+)\s*(?:—|-)?\s*(.*)$/);
    const bodyLines = lines.slice(1).map((line) => line.trim()).filter(Boolean);
    const field = (label) => {
      const row = bodyLines.find((line) => line.toLowerCase().startsWith(`- ${label.toLowerCase()}`));
      return row ? row.slice(row.indexOf(':') + 1).trim() : '';
    };
    const listAfter = (label) => {
      const start = bodyLines.findIndex((line) => {
        const lower = line.toLowerCase();
        return lower === `- ${label.toLowerCase()}:` || lower.startsWith(`- ${label.toLowerCase()}:`);
      });
      if (start < 0) return [];
      const inline = field(label);
      const items = [];
      for (let index = start + 1; index < bodyLines.length; index += 1) {
        const line = bodyLines[index];
        if (/^- (From option|To option|Keep|Change|User note|Status after round)\b/i.test(line)) break;
        if (line.startsWith('- ')) items.push(line.slice(2).trim());
      }
      if (!items.length && inline && inline !== '(none recorded)') return [inline];
      return items.filter((item) => item && item !== '(none recorded)');
    };
    rounds.push({
      round: roundMatch ? Number(roundMatch[1]) : rounds.length + 1,
      recordedAt: (roundMatch?.[2] ?? '').trim(),
      from: field('From option / artifact'),
      to: field('To option / artifact'),
      keep: listAfter('Keep'),
      change: listAfter('Change'),
      note: field('User note'),
      statusAfter: field('Status after round')
    });
  }
  return rounds;
}

/**
 * Records a 「ปรับต่อ」 refinement round into the direction spec.
 * Typical naming: direction-option-2.png → direction-option-2b.png
 */
export async function recordDirectionIteration(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const specPath = path.resolve(baseDir, options.specPath ?? 'design/visual-direction-spec.md');
  if (!await fileExists(specPath)) throw new Error(`Direction spec not found: ${specPath}`);

  const from = String(options.from ?? '').trim();
  const to = String(options.to ?? '').trim();
  if (!from || !to) throw new Error('recordDirectionIteration requires --from and --to (e.g. 2 and 2b).');

  const keep = [].concat(options.keep ?? []).map(String).filter(Boolean);
  const change = [].concat(options.change ?? []).map(String).filter(Boolean);
  if (!change.length) throw new Error('recordDirectionIteration requires at least one --change entry describing what was adjusted.');

  const imagePath = options.imagePath ? path.resolve(baseDir, options.imagePath) : null;
  if (imagePath && !await fileExists(imagePath)) {
    throw new Error(`Iteration image not found: ${imagePath}`);
  }

  const relativeImage = imagePath
    ? path.relative(baseDir, imagePath).split(path.sep).join('/')
    : String(options.artifact ?? `design/direction-options/direction-option-${to}.png`);

  const markdown = await fs.readFile(specPath, 'utf8');
  const round = Number(options.round) || nextRoundNumber(markdown);
  const recordedAt = options.recordedAt ?? new Date().toISOString();
  const note = String(options.note ?? '').trim();

  const roundBlock = [
    `### Round ${round} — ${recordedAt}`,
    '',
    `- From option / artifact: ${from}${options.fromArtifact ? ` / ${options.fromArtifact}` : ''}`,
    `- To option / artifact: ${to} / ${relativeImage}`,
    '- Keep:',
    bulletList(keep),
    '- Change:',
    bulletList(change),
    `- User note: ${note || '(none)'}`,
    '- Status after round: awaiting confirm (เริ่มเขียน | ปรับต่อ | เลือกใหม่)'
  ].join('\n');

  let next = appendOrReplaceIterationSection(markdown, roundBlock);
  next = upsertSelectionField(next, 'Selected option', String(to).replace(/[^0-9].*$/, '') || to);
  next = upsertSelectionField(next, 'Chosen image / artifact', relativeImage);
  next = upsertSelectionField(next, 'Selected at (ISO timestamp)', recordedAt);
  next = resetConfirmStatus(next, 'ปรับต่อ');

  await writeTextAtomic(specPath, ensureTrailingNewline(next));

  const ledgerPath = path.resolve(baseDir, options.ledgerPath ?? 'design/direction-iterations.json');
  let ledger = { schemaVersion: 1, rounds: [] };
  if (await fileExists(ledgerPath)) {
    try { ledger = JSON.parse(await fs.readFile(ledgerPath, 'utf8')); }
    catch { ledger = { schemaVersion: 1, rounds: [] }; }
  }
  if (!Array.isArray(ledger.rounds)) ledger.rounds = [];
  const entry = {
    round,
    recordedAt,
    from,
    to,
    image: relativeImage,
    keep,
    change,
    note: note || null,
    statusAfter: 'awaiting-confirm'
  };
  ledger.rounds = [...ledger.rounds.filter((item) => Number(item.round) !== round), entry]
    .sort((a, b) => Number(a.round) - Number(b.round));
  await writeTextAtomic(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

  return {
    ok: true,
    round,
    specPath,
    ledgerPath,
    image: relativeImage,
    from,
    to,
    keep,
    change,
    note: note || null,
    parsedRounds: parseIterationHistory(next)
  };
}

<!-- END SOURCE: lib/direction-iterate-engine.mjs -->

---

## Source: `scripts/iterate-direction.mjs`

<!-- BEGIN SOURCE: scripts/iterate-direction.mjs -->

#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { recordDirectionIteration } from '../lib/direction-iterate-engine.mjs';

const HELP = `Usage: node scripts/iterate-direction.mjs [options]
      --dir <path>       Project root (default: cwd)
      --spec <path>      Direction spec (default: design/visual-direction-spec.md)
      --from <id>        Previous option / round id (e.g. 2 or 2a)
      --to <id>          New option / round id (e.g. 2b)
      --image <path>     New ImageGen artifact (e.g. design/direction-options/direction-option-2b.png)
      --keep <text>      Repeatable. What stayed the same from the previous round
      --change <text>    Repeatable. What changed (required at least once)
      --note <text>      User request that triggered ปรับต่อ
      --from-artifact <p> Optional previous image path recorded in the round

Records a 「ปรับต่อ」 refinement round into visual-direction-spec.md and
design/direction-iterations.json, updates the chosen image, and clears the
เริ่มเขียน confirm so the agent must ask again before coding.

Example:
  npm run direction:iterate -- \\
    --from 2 --to 2b \\
    --image design/direction-options/direction-option-2b.png \\
    --keep 'Layout structure from option 2' \\
    --change 'Icons only — replace with system glyphs' \\
    --note 'เหลือ layout แก้แค่ icon'
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    spec: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
    image: { type: 'string' },
    keep: { type: 'string', multiple: true },
    change: { type: 'string', multiple: true },
    note: { type: 'string' },
    'from-artifact': { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await recordDirectionIteration({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      specPath: args.spec ?? 'design/visual-direction-spec.md',
      from: args.from,
      to: args.to,
      imagePath: args.image,
      keep: args.keep ?? [],
      change: args.change ?? [],
      note: args.note,
      fromArtifact: args['from-artifact']
    });
    process.stdout.write([
      `Direction iteration: round ${result.round}`,
      `Spec: ${result.specPath}`,
      `Ledger: ${result.ledgerPath}`,
      `From → to: ${result.from} → ${result.to}`,
      `Image: ${result.image}`,
      'Confirm status reset — ask again: เริ่มเขียน | ปรับต่อ | เลือกใหม่'
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }

<!-- END SOURCE: scripts/iterate-direction.mjs -->

---

## Source: `lib/direction-gate-engine.mjs`

<!-- BEGIN SOURCE: lib/direction-gate-engine.mjs -->

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from './io.mjs';
import { processFinding, finalizeProcessAudit } from './process-audit-utils.mjs';
import { parseDirectionSpec, syncDirectionSpecToProfile } from './direction-spec-sync-engine.mjs';
import { parseIterationHistory } from './direction-iterate-engine.mjs';

function confirmReply(statusBody) {
  const line = String(statusBody ?? '').match(/^- \[[ xX]\]\s*User confirmed:\s*([^\n]+)/im)?.[0];
  if (!line) return null;
  const checked = /^- \[x\]/i.test(line);
  const value = line.replace(/^- \[[ xX]\]\s*User confirmed:\s*/i, '').trim();
  const last = value.match(/\(last:\s*(เริ่มเขียน|ปรับต่อ|เลือกใหม่)\)/i)?.[1] ?? null;
  if (checked) {
    if (/^เริ่มเขียน(?=\s|$|\()/i.test(value) && !/\|\s*ปรับต่อ/i.test(value)) return 'เริ่มเขียน';
    if (/^ปรับต่อ(?=\s|$|\()/i.test(value) && !/\|\s*เริ่มเขียน/i.test(value)) return 'ปรับต่อ';
    if (/^เลือกใหม่(?=\s|$|\()/i.test(value) && !/\|\s*เริ่มเขียน/i.test(value)) return 'เลือกใหม่';
    return null;
  }
  return last;
}

/**
 * Lightweight PR/CI gate: direction spec exists and (optionally) confirm = เริ่มเขียน.
 * No browser required.
 */
export async function evaluateDirectionGate(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const specPath = path.resolve(baseDir, options.specPath ?? 'design/visual-direction-spec.md');
  const profilePath = path.resolve(baseDir, options.profilePath ?? 'design/aesthetic-profile.json');
  const required = options.required !== false;
  const requireConfirm = options.requireConfirm !== false;
  const checkSync = options.checkSync === true;
  const findings = [];

  const exists = await fileExists(specPath);
  if (!exists) {
    findings.push(processFinding(
      'DIRECTION_SPEC_MISSING',
      required ? 'blocker' : 'info',
      `Direction spec not found at ${specPath}.`,
      { path: specPath, remediation: 'Run npm run direction:init or write design/visual-direction-spec.md after option choice.' }
    ));
    const audit = finalizeProcessAudit(findings, {
      schemaVersion: 5,
      evidenceCount: 0,
      evidenceConfidence: required ? 0 : 100,
      blockedStatus: true
    });
    return {
      ...audit,
      passed: !required && audit.ok,
      required,
      requireConfirm,
      checkSync,
      applicable: required,
      specPath,
      profilePath,
      parsed: null,
      iterations: [],
      sync: null
    };
  }

  const markdown = await fs.readFile(specPath, 'utf8');
  const parsed = parseDirectionSpec(markdown);
  const iterations = parseIterationHistory(markdown);
  const statusBody = markdown.match(/## Status\n([\s\S]*?)(?=\n## |$)/i)?.[1] ?? '';
  const reply = confirmReply(statusBody);

  findings.push(processFinding(
    'DIRECTION_SPEC_PRESENT',
    'info',
    `Direction spec found (${path.relative(baseDir, specPath) || specPath}).`,
    { path: specPath }
  ));

  if (!parsed.selectedOption && !String(parsed.chosenImage || '').trim()) {
    findings.push(processFinding(
      'DIRECTION_SELECTION_INCOMPLETE',
      'high',
      'Direction spec does not record a selected option or chosen image.',
      { path: 'Selection', remediation: 'Record Selected option and Chosen image / artifact after the user picks 1/2/3.' }
    ));
  }

  if (!parsed.thesis) {
    findings.push(processFinding(
      'DIRECTION_THESIS_MISSING',
      'high',
      'Direction spec has no direction thesis.',
      { path: 'Direction Thesis' }
    ));
  }

  if (requireConfirm) {
    if (reply === 'เริ่มเขียน') {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_START',
        'info',
        'User confirmed เริ่มเขียน on the direction spec.',
        { path: 'Status' }
      ));
    } else if (reply === 'ปรับต่อ') {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_REFINE',
        'blocker',
        'Direction spec is still in ปรับต่อ — do not merge UI until the user confirms เริ่มเขียน.',
        { path: 'Status', remediation: 'Revise the spec (npm run direction:iterate), then wait for เริ่มเขียน.' }
      ));
    } else if (reply === 'เลือกใหม่') {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_RESELECT',
        'blocker',
        'Direction spec asks for เลือกใหม่ — exploration is not finished.',
        { path: 'Status' }
      ));
    } else {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_MISSING',
        'blocker',
        'Direction spec is not confirmed with เริ่มเขียน.',
        {
          path: 'Status',
          remediation: 'Check the Status box for User confirmed: เริ่มเขียน after the confirm gate.'
        }
      ));
    }
  }

  if (iterations.length) {
    findings.push(processFinding(
      'DIRECTION_ITERATIONS_RECORDED',
      'info',
      `${iterations.length} refinement round(s) recorded in Iteration History.`,
      { path: 'Iteration History', detail: iterations.map((item) => item.round) }
    ));
  }

  let sync = null;
  if (checkSync) {
    sync = await syncDirectionSpecToProfile({
      baseDir,
      specPath,
      profilePath,
      checkOnly: true
    });
    for (const item of sync.comparison.findings) {
      findings.push(processFinding(
        item.code,
        item.severity,
        item.message,
        { path: item.path }
      ));
    }
  }

  const audit = finalizeProcessAudit(findings, {
    schemaVersion: 5,
    evidenceCount: 1 + iterations.length,
    evidenceConfidence: 100
  });

  return {
    ...audit,
    passed: audit.ok && findings.every((item) => item.severity !== 'high'),
    required,
    requireConfirm,
    checkSync,
    applicable: true,
    specPath,
    profilePath,
    parsed: {
      selectedOption: parsed.selectedOption,
      thesis: parsed.thesis,
      confirmedStart: parsed.confirmedStart,
      confirmReply: reply,
      chosenImage: parsed.chosenImage
    },
    iterations,
    sync
  };
}

<!-- END SOURCE: lib/direction-gate-engine.mjs -->

---

## Source: `scripts/direction-gate.mjs`

<!-- BEGIN SOURCE: scripts/direction-gate.mjs -->

#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson } from '../lib/contract-cli.mjs';
import { evaluateDirectionGate } from '../lib/direction-gate-engine.mjs';

const HELP = `Usage: node scripts/direction-gate.mjs [options]
      --dir <path>           Project root (default: cwd)
      --spec <path>          Direction spec (default: design/visual-direction-spec.md)
      --profile <path>       Aesthetic profile (default: design/aesthetic-profile.json)
      --optional             Pass when the spec is missing (info only)
      --no-require-confirm   Do not require Status confirm = เริ่มเขียน
      --check-sync           Also run direction:sync --check against the profile
      --json                 Emit the gate report JSON on stdout
      --output <path>        Write the gate report JSON

Lightweight PR/CI gate — no browser. Fails when UI work lacks a confirmed
visual-direction-spec.md (confirm = เริ่มเขียน).

Example (GitHub Action / pre-merge):
  npm run direction:gate -- --check-sync
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    spec: { type: 'string' },
    profile: { type: 'string' },
    optional: { type: 'boolean', default: false },
    'require-confirm': { type: 'boolean', default: true },
    'check-sync': { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
    output: { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await evaluateDirectionGate({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      specPath: args.spec ?? 'design/visual-direction-spec.md',
      profilePath: args.profile ?? 'design/aesthetic-profile.json',
      required: args.optional !== true,
      requireConfirm: args['require-confirm'] !== false,
      checkSync: args['check-sync'] === true
    });
    const report = {
      ok: result.ok,
      passed: result.passed,
      status: result.status,
      score: result.score,
      required: result.required,
      requireConfirm: result.requireConfirm,
      checkSync: result.checkSync,
      specPath: result.specPath,
      profilePath: result.profilePath,
      parsed: result.parsed,
      iterationCount: result.iterations.length,
      findings: result.findings
    };
    if (args.json || args.output) await emitJson(report, args.output);
    if (!args.json || args.output) {
      process.stdout.write([
        `Direction gate: ${result.status} (score ${result.score})`,
        `Spec: ${result.specPath}`,
        `Confirm: ${result.parsed?.confirmReply ?? 'missing'}`,
        `Iterations: ${result.iterations.length}`,
        `Findings: ${result.findings.length}`,
        ...result.findings.map((item) => `  - [${item.severity}] ${item.code}: ${item.message}`)
      ].join('\n') + '\n');
    }
    if (!result.passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }

<!-- END SOURCE: scripts/direction-gate.mjs -->

---

## Source: `lib/direction-runtime-engine.mjs`

<!-- BEGIN SOURCE: lib/direction-runtime-engine.mjs -->

/**
 * Direction runtime adapter — classify the host (Cursor / Codex / CLI / CI)
 * and choose how to present visual options 1–2–3 without inventing images.
 *
 * Node cannot see the agent's tool list. Detection is best-effort from env,
 * plus explicit overrides the agent MUST set when it knows ImageGen presence.
 */

export const HOSTS = Object.freeze(['cursor', 'codex', 'cli', 'ci', 'unknown']);

export const PRESENTATION_MODES = Object.freeze({
  INLINE_AND_GALLERY: 'inline-and-gallery',
  GALLERY_ONLY: 'gallery-only',
  PROSE_GAP: 'prose-with-gap',
  CI_GATE_ONLY: 'ci-gate-only'
});

function truthy(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on', 'likely'].includes(text)) return true;
  if (['0', 'false', 'no', 'off', 'none', 'unavailable'].includes(text)) return false;
  return null;
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

/**
 * Best-effort host classification from environment variables.
 */
export function detectHostRuntime(env = process.env, overrides = {}) {
  if (overrides.host && HOSTS.includes(String(overrides.host))) {
    return {
      host: String(overrides.host),
      signals: [`override:host=${overrides.host}`],
      confidence: 'high'
    };
  }

  const signals = [];
  const cursor = Boolean(
    env.CURSOR_VERSION
    || env.CURSOR_PROJECT_DIR
    || env.CURSOR_AGENT
    || env.CURSOR_TRACE_ID
    || env.CURSOR_WORKSPACE_LABEL
  );
  if (env.CURSOR_VERSION) signals.push('CURSOR_VERSION');
  if (env.CURSOR_PROJECT_DIR) signals.push('CURSOR_PROJECT_DIR');
  if (env.CURSOR_AGENT) signals.push('CURSOR_AGENT');
  if (env.CURSOR_TRACE_ID) signals.push('CURSOR_TRACE_ID');

  const codex = Boolean(
    env.CODEX_HOME
    || env.CODEX_THREAD_ID
    || env.CODEX_SANDBOX
    || env.CODEX_SANDBOX_NETWORK
    || env.OPENAI_CODEX
  );
  if (env.CODEX_HOME) signals.push('CODEX_HOME');
  if (env.CODEX_THREAD_ID) signals.push('CODEX_THREAD_ID');
  if (env.CODEX_SANDBOX || env.CODEX_SANDBOX_NETWORK) signals.push('CODEX_SANDBOX');

  const ci = Boolean(env.CI === 'true' || env.CI === '1' || env.GITHUB_ACTIONS === 'true');
  if (ci) signals.push(env.GITHUB_ACTIONS === 'true' ? 'GITHUB_ACTIONS' : 'CI');

  if (cursor && !codex) {
    return { host: 'cursor', signals, confidence: 'high', version: env.CURSOR_VERSION ?? null };
  }
  if (codex && !cursor) {
    return { host: 'codex', signals, confidence: 'high', version: null };
  }
  if (cursor && codex) {
    // Prefer Cursor when both appear (Cursor may nest Codex-compatible vars).
    return { host: 'cursor', signals, confidence: 'medium', version: env.CURSOR_VERSION ?? null };
  }
  if (ci) {
    return { host: 'ci', signals, confidence: 'high', version: null };
  }
  return {
    host: 'cli',
    signals: signals.length ? signals : ['fallback:cli'],
    confidence: 'medium',
    version: null
  };
}

function hostDefaults(host) {
  switch (host) {
    case 'cursor':
      return {
        imageGeneration: null, // agent must confirm GenerateImage is in the tool list
        imageGenerationHint: 'likely',
        inlineImages: true,
        browserGallery: true,
        imageTool: 'GenerateImage',
        referenceImagesSupported: true
      };
    case 'codex':
      return {
        imageGeneration: null,
        imageGenerationHint: 'maybe',
        inlineImages: null, // some Codex surfaces show media; some are text-only
        inlineImagesHint: 'maybe',
        browserGallery: true,
        imageTool: 'imagegen',
        referenceImagesSupported: true
      };
    case 'ci':
      return {
        imageGeneration: false,
        imageGenerationHint: 'unavailable',
        inlineImages: false,
        browserGallery: false,
        imageTool: null,
        referenceImagesSupported: false
      };
    case 'cli':
    case 'unknown':
    default:
      return {
        imageGeneration: false,
        imageGenerationHint: 'unavailable',
        inlineImages: false,
        browserGallery: true,
        imageTool: null,
        referenceImagesSupported: false
      };
  }
}

/**
 * Resolve concrete capability booleans from host defaults + overrides + env.
 *
 * Override / env keys:
 * - imageGeneration / DIRECTION_IMAGE_GEN / FVL_IMAGE_GEN
 * - inlineImages / DIRECTION_INLINE_IMAGES / FVL_INLINE_IMAGES
 * - browserGallery / DIRECTION_BROWSER_GALLERY
 * - imageTool / DIRECTION_IMAGE_TOOL
 */
export function resolveDirectionCapabilities(hostInfo, overrides = {}, env = process.env) {
  const host = hostInfo?.host ?? 'unknown';
  const defaults = hostDefaults(host);

  const imageGenOverride = truthy(firstDefined(
    overrides.imageGeneration,
    overrides.imageGen,
    env.DIRECTION_IMAGE_GEN,
    env.FVL_IMAGE_GEN
  ));
  const inlineOverride = truthy(firstDefined(
    overrides.inlineImages,
    env.DIRECTION_INLINE_IMAGES,
    env.FVL_INLINE_IMAGES
  ));
  const galleryOverride = truthy(firstDefined(
    overrides.browserGallery,
    env.DIRECTION_BROWSER_GALLERY,
    env.FVL_BROWSER_GALLERY
  ));

  const imageGeneration = imageGenOverride === null
    ? (defaults.imageGeneration === false ? false : null)
    : imageGenOverride;
  const inlineImages = inlineOverride === null
    ? (defaults.inlineImages === false ? false : defaults.inlineImages === true ? true : null)
    : inlineOverride;
  const browserGallery = galleryOverride === null
    ? defaults.browserGallery
    : galleryOverride;

  const imageTool = firstDefined(
    overrides.imageTool,
    env.DIRECTION_IMAGE_TOOL,
    defaults.imageTool
  ) ?? null;

  const known = imageGeneration !== null;
  const canGenerate = imageGeneration === true;
  const cannotGenerate = imageGeneration === false;

  return {
    host,
    imageGeneration,
    imageGenerationHint: defaults.imageGenerationHint,
    inlineImages,
    inlineImagesHint: defaults.inlineImagesHint ?? (inlineImages === true ? 'yes' : inlineImages === false ? 'no' : 'unknown'),
    browserGallery,
    imageTool: canGenerate || imageGeneration === null ? imageTool : null,
    referenceImagesSupported: defaults.referenceImagesSupported === true && (canGenerate || imageGeneration === null),
    known,
    canGenerate,
    cannotGenerate,
    needsAgentConfirmation: imageGeneration === null || inlineImages === null
  };
}

/**
 * Choose presentation mode and concrete agent steps.
 */
export function planDirectionPresentation(capabilities, options = {}) {
  const gaps = [];
  const steps = [];
  const warnings = [];
  const referenceAttached = options.referenceAttached !== false;
  if (options.referenceAttached === false) {
    gaps.push({
      code: 'REFERENCE_SCREENSHOT_MISSING',
      message: 'User could not attach a reference screenshot — invent distinct theses from the description and record referenceNote.'
    });
  }

  const host = capabilities.host;
  if (host === 'ci' || options.forceMode === PRESENTATION_MODES.CI_GATE_ONLY) {
    return {
      mode: PRESENTATION_MODES.CI_GATE_ONLY,
      title: 'CI / no exploration',
      steps: [
        'Do not run ImageGen exploration in CI.',
        'Require an already-confirmed design/visual-direction-spec.md.',
        'Run: npm run direction:gate -- --check-sync'
      ],
      gaps: [{
        code: 'CI_NO_IMAGEGEN',
        message: 'CI hosts do not generate direction images. Exploration must already be complete.'
      }],
      warnings,
      imageTool: null,
      openGallery: false,
      showInline: false,
      allowProseFallback: false
    };
  }

  if (capabilities.cannotGenerate || options.forceMode === PRESENTATION_MODES.PROSE_GAP) {
    gaps.push({
      code: 'IMAGEGEN_UNAVAILABLE',
      message: 'Image generation is unavailable on this runtime. Do not pretend pictures exist.'
    });
    steps.push('Draft 2–3 numbered prose theses that differ on at least two personality axes.');
    steps.push('State the verification gap explicitly: ImageGen unavailable on this host.');
    if (capabilities.browserGallery) {
      steps.push('Optional: npm run direction:gallery with thesis cards and image-pending placeholders.');
      steps.push('Open the gallery only as a thesis board — label images as pending.');
    }
    steps.push('Stop and wait for a numbered choice, then write visual-direction-spec.md.');
    return {
      mode: PRESENTATION_MODES.PROSE_GAP,
      title: 'Prose options with explicit ImageGen gap',
      steps,
      gaps,
      warnings,
      imageTool: null,
      openGallery: capabilities.browserGallery === true,
      showInline: false,
      allowProseFallback: true
    };
  }

  if (capabilities.canGenerate && capabilities.inlineImages === true) {
    steps.push(`Generate one image per thesis with ${capabilities.imageTool ?? 'the host image tool'}.`);
    if (capabilities.referenceImagesSupported && referenceAttached) {
      steps.push('Pass reference screenshot path(s) into the image tool when supported.');
    }
    steps.push('Show options 1 / 2 / 3 inline in chat.');
    if (capabilities.browserGallery) {
      steps.push('Also write npm run direction:gallery so the user can compare side-by-side in a browser.');
    }
    steps.push('Stop for the numbered choice. Do not write the direction spec until they pick.');
    return {
      mode: PRESENTATION_MODES.INLINE_AND_GALLERY,
      title: 'Inline images (+ optional browser gallery)',
      steps,
      gaps,
      warnings,
      imageTool: capabilities.imageTool,
      openGallery: capabilities.browserGallery === true,
      showInline: true,
      allowProseFallback: false
    };
  }

  if (capabilities.canGenerate && (capabilities.inlineImages === false || capabilities.inlineImages === null)) {
    if (capabilities.inlineImages === null) {
      warnings.push({
        code: 'INLINE_IMAGES_UNKNOWN',
        message: 'Inline chat images are unverified — prefer the browser gallery so options stay visible as pictures.'
      });
    } else {
      gaps.push({
        code: 'INLINE_IMAGES_UNAVAILABLE',
        message: 'Chat cannot display images — use the browser gallery instead of prose-only.'
      });
    }
    steps.push(`Generate one image per thesis with ${capabilities.imageTool ?? 'the host image tool'} and save under design/direction-options/.`);
    steps.push('Run: npm run direction:gallery -- --option \'N|thesis|path.png\' (repeat for 1–3).');
    steps.push('Paste the file:// link in chat and stop for a numbered choice.');
    steps.push('Do not fall back to prose-only while the image files exist.');
    return {
      mode: PRESENTATION_MODES.GALLERY_ONLY,
      title: 'Browser gallery (chat cannot show images)',
      steps,
      gaps,
      warnings,
      imageTool: capabilities.imageTool,
      openGallery: true,
      showInline: false,
      allowProseFallback: false
    };
  }

  // ImageGen unknown — ask the agent to confirm tools, default to safe prose+gap unless Cursor hint says likely.
  warnings.push({
    code: 'IMAGEGEN_UNCONFIRMED',
    message: 'ImageGen availability is unconfirmed. If the host exposes GenerateImage/imagegen, re-run with --image-gen true; otherwise keep --image-gen false.'
  });
  if (capabilities.imageGenerationHint === 'likely') {
    steps.push(`Likely host tool: ${capabilities.imageTool ?? 'GenerateImage'} — attempt generation if the tool is in your available tool list.`);
    steps.push('If the tool is missing or fails, switch immediately to prose-with-gap and record IMAGEGEN_UNAVAILABLE.');
    steps.push('When images exist but chat cannot show them, open npm run direction:gallery.');
  } else {
    steps.push('Do not invent images. Present numbered prose theses and record IMAGEGEN_UNAVAILABLE until --image-gen true is set.');
    if (capabilities.browserGallery) {
      steps.push('Optional placeholder gallery via npm run direction:gallery.');
    }
  }
  steps.push('Stop for a numbered choice, then write visual-direction-spec.md.');

  return {
    mode: capabilities.imageGenerationHint === 'likely'
      ? PRESENTATION_MODES.INLINE_AND_GALLERY
      : PRESENTATION_MODES.PROSE_GAP,
    title: capabilities.imageGenerationHint === 'likely'
      ? 'Attempt ImageGen (confirm tool first)'
      : 'Prose options until ImageGen is confirmed',
    steps,
    gaps,
    warnings,
    imageTool: capabilities.imageTool,
    openGallery: capabilities.browserGallery === true,
    showInline: capabilities.inlineImages === true,
    allowProseFallback: capabilities.imageGenerationHint !== 'likely',
    unconfirmed: true
  };
}

/**
 * Full adapter entry: detect host → capabilities → presentation plan.
 */
export function resolveDirectionRuntime(options = {}) {
  const env = options.env ?? process.env;
  const overrides = options.overrides ?? {};
  const hostInfo = detectHostRuntime(env, overrides);
  const capabilities = resolveDirectionCapabilities(hostInfo, overrides, env);
  const presentation = planDirectionPresentation(capabilities, {
    referenceAttached: options.referenceAttached,
    forceMode: options.forceMode
  });

  return {
    schemaVersion: 1,
    ok: true,
    detectedAt: new Date().toISOString(),
    host: hostInfo.host,
    hostConfidence: hostInfo.confidence,
    hostSignals: hostInfo.signals,
    hostVersion: hostInfo.version ?? null,
    capabilities,
    presentation,
    agentChecklist: [
      'Inspect your available tools before claiming ImageGen works.',
      'If GenerateImage / imagegen is present, pass --image-gen true (or DIRECTION_IMAGE_GEN=true).',
      'If the tool is absent or fails, pass --image-gen false and use prose-with-gap — never fake screenshots.',
      'If images exist but chat is text-only, open direction:gallery — do not drop to prose-only.',
      'After a numbered choice, write design/visual-direction-spec.md and wait for เริ่มเขียน | ปรับต่อ | เลือกใหม่.'
    ]
  };
}

export function formatDirectionRuntimeReport(report) {
  const lines = [
    `Direction runtime: ${report.host} (${report.hostConfidence})`,
    `Signals: ${(report.hostSignals ?? []).join(', ') || 'none'}`,
    `ImageGen: ${report.capabilities.imageGeneration === null ? `unconfirmed (hint: ${report.capabilities.imageGenerationHint})` : report.capabilities.imageGeneration}`,
    `Inline images: ${report.capabilities.inlineImages === null ? `unconfirmed (hint: ${report.capabilities.inlineImagesHint})` : report.capabilities.inlineImages}`,
    `Browser gallery: ${report.capabilities.browserGallery}`,
    `Image tool: ${report.capabilities.imageTool ?? 'none'}`,
    `Presentation mode: ${report.presentation.mode}`,
    `Title: ${report.presentation.title}`,
    'Steps:',
    ...report.presentation.steps.map((step) => `  - ${step}`),
    `Gaps: ${report.presentation.gaps.length}`,
    ...report.presentation.gaps.map((item) => `  - [${item.code}] ${item.message}`),
    `Warnings: ${report.presentation.warnings.length}`,
    ...report.presentation.warnings.map((item) => `  - [${item.code}] ${item.message}`)
  ];
  return `${lines.join('\n')}\n`;
}

<!-- END SOURCE: lib/direction-runtime-engine.mjs -->

---

## Source: `scripts/detect-direction-runtime.mjs`

<!-- BEGIN SOURCE: scripts/detect-direction-runtime.mjs -->

#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson } from '../lib/contract-cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import {
  formatDirectionRuntimeReport,
  resolveDirectionRuntime
} from '../lib/direction-runtime-engine.mjs';

const HELP = `Usage: node scripts/detect-direction-runtime.mjs [options]
      --host <name>              Force host: cursor | codex | cli | ci | unknown
      --image-gen <bool>         Override ImageGen availability (true|false)
      --inline-images <bool>     Override whether chat can show images
      --browser-gallery <bool>   Override browser gallery availability
      --image-tool <name>        Override tool name (GenerateImage | imagegen | ...)
      --no-reference             User could not attach a reference screenshot
      --write <path>             Write the runtime report JSON (default off)
      --json                     Emit JSON on stdout
      --output <path>            Write JSON report to a path

Classifies Cursor / Codex / CLI / CI and prints the presentation plan for
visual direction options 1–2–3. Node cannot see the agent tool list — when
you know GenerateImage/imagegen is present or absent, pass --image-gen.

Examples:
  npm run direction:runtime
  npm run direction:runtime -- --image-gen true --host cursor
  npm run direction:runtime -- --image-gen false --json
`;

function asBool(value) {
  if (value === undefined) return undefined;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'off'].includes(text)) return false;
  throw new Error(`Expected boolean, got: ${value}`);
}

try {
  const args = parseCli({
    host: { type: 'string' },
    'image-gen': { type: 'string' },
    'inline-images': { type: 'string' },
    'browser-gallery': { type: 'string' },
    'image-tool': { type: 'string' },
    reference: { type: 'boolean', default: true },
    write: { type: 'string' },
    json: { type: 'boolean', default: false },
    output: { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const overrides = {};
    if (args.host) overrides.host = args.host;
    if (args['image-gen'] !== undefined) overrides.imageGeneration = asBool(args['image-gen']);
    if (args['inline-images'] !== undefined) overrides.inlineImages = asBool(args['inline-images']);
    if (args['browser-gallery'] !== undefined) overrides.browserGallery = asBool(args['browser-gallery']);
    if (args['image-tool']) overrides.imageTool = args['image-tool'];

    const report = resolveDirectionRuntime({
      referenceAttached: args.reference !== false,
      overrides
    });

    if (args.write) {
      const target = path.resolve(String(args.write));
      await writeJsonAtomic(target, report);
      process.stdout.write(`Wrote ${target}\n`);
    }
    if (args.json || args.output) await emitJson(report, args.output);
    if (!args.json || args.output) process.stdout.write(formatDirectionRuntimeReport(report));
  }
} catch (error) { fail(error); }

<!-- END SOURCE: scripts/detect-direction-runtime.mjs -->

---

## Source: `scripts/install-direction-cursor.mjs`

<!-- BEGIN SOURCE: scripts/install-direction-cursor.mjs -->

#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { ensureDir, fileExists, writeJsonAtomic, writeTextAtomic } from '../lib/io.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateRoot = path.join(skillRoot, 'templates', 'cursor');

const HELP = `Usage: node scripts/install-direction-cursor.mjs [options]
      --dir <path>     Project root that should receive .cursor/ templates (default: cwd)
      --force          Overwrite existing rule/hook files

Copies visual-direction Cursor rule + beforeSubmitPrompt hook into the target project.
`;

async function readText(rel) {
  return fs.readFile(path.join(templateRoot, rel), 'utf8');
}

function mergeHooksJson(existing, incoming) {
  const base = existing && typeof existing === 'object' ? existing : { version: 1, hooks: {} };
  const next = {
    version: Number(base.version ?? incoming.version ?? 1),
    hooks: { ...(base.hooks ?? {}) }
  };
  const list = [...(next.hooks.beforeSubmitPrompt ?? [])];
  const incomingList = incoming.hooks?.beforeSubmitPrompt ?? [];
  for (const entry of incomingList) {
    const command = entry.command;
    if (!list.some((item) => item.command === command)) list.push(entry);
  }
  next.hooks.beforeSubmitPrompt = list;
  return next;
}

try {
  const args = parseCli({
    dir: { type: 'string' },
    force: { type: 'boolean', default: false }
  });
  if (args.help) printHelp(HELP);
  else {
    const projectRoot = path.resolve(args.dir ?? process.cwd());
    const cursorDir = path.join(projectRoot, '.cursor');
    const rulesDir = path.join(cursorDir, 'rules');
    const hooksDir = path.join(cursorDir, 'hooks');
    await ensureDir(rulesDir);
    await ensureDir(hooksDir);

    const created = [];
    const skipped = [];

    async function writeFile(target, contents, kind) {
      if (await fileExists(target) && !args.force) {
        skipped.push({ path: target, kind });
        return;
      }
      if (typeof contents === 'string') await writeTextAtomic(target, contents.endsWith('\n') ? contents : `${contents}\n`);
      else await writeJsonAtomic(target, contents);
      created.push({ path: target, kind });
    }

    await writeFile(
      path.join(rulesDir, 'visual-direction-redesign.mdc'),
      await readText('rules/visual-direction-redesign.mdc'),
      'rule'
    );

    const hookScript = await readText('hooks/visual-direction-redesign.mjs');
    const hookTarget = path.join(hooksDir, 'visual-direction-redesign.mjs');
    await writeFile(hookTarget, hookScript, 'hook-script');
    try { await fs.chmod(hookTarget, 0o755); } catch { /* best-effort on platforms without chmod */ }

    const incomingHooks = JSON.parse(await readText('hooks.json'));
    const hooksJsonPath = path.join(cursorDir, 'hooks.json');
    if (await fileExists(hooksJsonPath) && !args.force) {
      const existing = JSON.parse(await fs.readFile(hooksJsonPath, 'utf8'));
      const merged = mergeHooksJson(existing, incomingHooks);
      await writeJsonAtomic(hooksJsonPath, merged);
      created.push({ path: hooksJsonPath, kind: 'hooks-json-merged' });
    } else {
      await writeFile(hooksJsonPath, incomingHooks, 'hooks-json');
    }

    process.stdout.write([
      `Cursor visual-direction templates → ${cursorDir}`,
      `Created/updated: ${created.length}`,
      ...created.map((item) => `  + ${item.path}`),
      `Skipped: ${skipped.length}`,
      ...skipped.map((item) => `  = ${item.path}`),
      'Reload Cursor hooks after install.'
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }

<!-- END SOURCE: scripts/install-direction-cursor.mjs -->

---

## Source: `prompts/visual-direction-prompt-pack.md`

<!-- BEGIN SOURCE: prompts/visual-direction-prompt-pack.md -->

# Visual Direction Prompt Pack

Route to the right operator prompt after `npm run direction:runtime`.

| Runtime plan | Prompt |
|---|---|
| `inline-and-gallery` or confirmed ImageGen on Cursor/Codex | `prompts/visual-direction-exploration-ide.md` |
| `gallery-only` (images on disk, chat text-only) | IDE prompt for generation (if any) + gallery commands from either pack |
| `prose-with-gap` / CLI / no ImageGen | `prompts/visual-direction-exploration-cli.md` |
| `ci-gate-only` | No exploration prompt — run `npm run direction:gate` |

Shared base (both packs inherit rules from):

- `prompts/visual-direction-exploration.md`
- `references/visual-direction-exploration.md`
- `agents/design-director.md`

End-to-end filled artifacts: `examples/direction-camera/`.

Cursor install templates (rule + hook): `templates/cursor/` · `npm run direction:cursor-install`.

<!-- END SOURCE: prompts/visual-direction-prompt-pack.md -->

---

## Source: `prompts/visual-direction-exploration-ide.md`

<!-- BEGIN SOURCE: prompts/visual-direction-exploration-ide.md -->

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

<!-- END SOURCE: prompts/visual-direction-exploration-ide.md -->

---

## Source: `prompts/visual-direction-exploration-cli.md`

<!-- BEGIN SOURCE: prompts/visual-direction-exploration-cli.md -->

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

<!-- END SOURCE: prompts/visual-direction-exploration-cli.md -->

---

## Source: `examples/direction-camera/README.md`

<!-- BEGIN SOURCE: examples/direction-camera/README.md -->

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

<!-- END SOURCE: examples/direction-camera/README.md -->

---

## Source: `templates/cursor/README.md`

<!-- BEGIN SOURCE: templates/cursor/README.md -->

# Cursor templates — visual direction

Install into a project so screenshot/redesign chats follow the exploration protocol.

## Contents

| Path | Role |
|---|---|
| `rules/visual-direction-redesign.mdc` | Always-on agent rule (primary enforcement) |
| `hooks.json` | Registers `beforeSubmitPrompt` hook |
| `hooks/visual-direction-redesign.mjs` | Detects redesign language / image attachments; reminds the user; writes `design/.direction-trigger.json` |

`beforeSubmitPrompt` cannot inject model context in current Cursor — it only supports `continue` / `user_message`. The **rule** is what the agent must follow; the hook is a human-visible reminder + on-disk trigger marker.

## Install

From the skill package root, targeting the project that should receive the templates:

```bash
npm run direction:cursor-install -- --dir /path/to/your-app
# or, from inside the app with the skill on NODE_PATH / copied locally:
npm run direction:cursor-install
```

This writes:

```text
.cursor/rules/visual-direction-redesign.mdc
.cursor/hooks.json          # merges visual-direction hook if a hooks.json already exists
.cursor/hooks/visual-direction-redesign.mjs
```

Reload Cursor hooks after install (Cursor Settings → Hooks, or restart the window).

## Verify

1. Start a chat, attach a UI screenshot, say “redesign this”.
2. Expect the rule to steer the agent into options 1/2/3.
3. Optional: check `design/.direction-trigger.json` after send.

<!-- END SOURCE: templates/cursor/README.md -->

---

## Source: `references/visual-direction-exploration.md`

<!-- BEGIN SOURCE: references/visual-direction-exploration.md -->

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
- the personality deltas vs the reference
- what stays from the reference (structure, task, critical controls)
- what changes (surface, type, chrome, motion character)

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

<!-- END SOURCE: references/visual-direction-exploration.md -->

---

## Source: `references/visual-direction-exploration_TH.md`

<!-- BEGIN SOURCE: references/visual-direction-exploration_TH.md -->

# การสำรวจทิศทางภาพด้วย ImageGen (สรุปภาษาไทย)

ฉบับเต็ม: `references/visual-direction-exploration.md` · เทมเพลต: `templates/visual-direction-spec.md`

## เจตนา

เมื่อผู้ใช้ส่งภาพหน้าจอแล้วขอ redesign Agent ต้อง **Gen ตัวอย่าง 2–3 แบบให้เลือก** แล้ว **เขียน spec .md ว่าชอบอะไร** และ **รอ confirm อีกรอบ** ก่อนลงแผน/โค้ด

## ถ้าส่งรูปไม่ได้ / แชทโชว์รูปไม่ได้

ยังต้องให้เห็นเป็น **รูป 3 แบบ** — ไม่ถอยไปเป็นข้อความอย่างเดียว:

1. รัน `npm run direction:runtime` เพื่อรู้ว่าอยู่ Cursor / Codex / CLI  
2. Gen รูป option 1/2/3 ลงไฟล์ (ถ้า ImageGen มี) หรือใช้โหมด `prose-with-gap` ถ้าไม่มี — **ห้ามแกล้งว่ามีรูป**  
3. ถ้ารูปมีแต่แชทโชว์ไม่ได้ → รัน `npm run direction:gallery`  
4. เปิดหน้า `design/direction-options/index.html` ใน browser ให้เทียบข้างกัน  
5. วางลิงก์ `file://` ในแชท แล้วรอเลือกเลข

ตรวจ runtime:

```bash
npm run direction:runtime -- --image-gen true    # มี GenerateImage / imagegen
npm run direction:runtime -- --image-gen false   # ไม่มี ImageGen
```

Prompt แยก IDE/CLI: `prompts/visual-direction-prompt-pack.md`  
ตัวอย่างครบ: `examples/direction-camera/`  
ติด rule+hook ในโปรเจกต์:

```bash
npm run direction:cursor-install -- --dir /path/to/app
```

## ลำดับ

```text
อ่านรูปอ้างอิง (หรือบันทึกว่าส่งรูปไม่ได้) → Gen ภาพ 1 / 2 / 3
→ โชว์ในแชท และ/หรือ เปิด gallery ใน browser
→ หยุดรอเลือกเลข
→ เขียน design/visual-direction-spec.md
→ หยุดรอ confirm: เริ่มเขียน | ปรับต่อ | เลือกใหม่
→ ถ้า「เริ่มเขียน」→ profile + contract (หรือ `npm run direction:sync`) → แผน / implement
```

Scaffold ล่วงหน้าได้ด้วย:

```bash
npm run direction:init -- --product "..."
npm run direction:sync -- --check
```

รอบ「ปรับต่อ」บันทึก diff ไว้ใน spec:

```bash
npm run direction:iterate -- --from 2 --to 2b \
  --image design/direction-options/direction-option-2b.png \
  --keep 'Layout จาก option 2' \
  --change 'แก้แค่ icon' \
  --note 'เหลือ layout แก้แค่ icon'
```

ก่อน merge UI ใน CI (ไม่ต้องเปิด browser):

```bash
npm run direction:gate -- --check-sync
```

## ข้อความถาม confirm (ใช้หลังเขียน spec)

```text
สรุปทิศทางตามที่เลือกไว้ใน spec แล้วครับ
ตอบว่า:
- 「เริ่มเขียน」ถ้าโอเค ให้ทำแผนแล้วลงมือ
- 「ปรับต่อ」พร้อมจุดที่อยากแก้
- 「เลือกใหม่」ถ้าอยากดูตัวเลือกอีกครั้ง
```

<!-- END SOURCE: references/visual-direction-exploration_TH.md -->

---

## Source: `references/aesthetic-direction-protocol.md`

<!-- BEGIN SOURCE: references/aesthetic-direction-protocol.md -->

# Aesthetic Direction Protocol

## Purpose

The aesthetic references describe principles, craft, colour, typography, space, motion, personality, style, and voice. This protocol says how they are used inside the governed process: when direction is set, what artifact records it, how it is verified, and where it binds to the existing gates.

## Where This Sits

Aesthetic direction is part of design, not a separate phase. It happens inside step 2 of the workflow, before implementation, and it is verified inside step 6 alongside the vision loop.

```text
route the work
→ inspect context and existing design system
→ explore visual direction with ImageGen options when redesigning from screenshots
→ establish the aesthetic profile          (this protocol)
→ compare approaches and approve a design
→ implement
→ run the vision loop and the aesthetic audit   (this protocol)
→ semantic visual review and aesthetic review   (this protocol)
→ gate
```

When the user attached UI screenshots and asked to redesign or restyle, complete `references/visual-direction-exploration.md` **before** writing the aesthetic profile: generate two or three distinct images, wait for a numbered choice, write `visual-direction-spec.md`, wait for **เริ่มเขียน** / **ปรับต่อ** / **เลือกใหม่**, then bind the confirmed choice into the profile. Preference without a visible option set and a durable spec is not an explored direction.

## 1. Explore Visible Direction When Redesigning

If the trigger in `references/visual-direction-exploration.md` applies, run that protocol first. Do not author the profile from an unchosen ImageGen batch or from a single unselected mock.

## 2. Establish the Aesthetic Profile

Before proposing a direction, inspect what already exists. A product with an established design system has already made most of these decisions, and the profile documents them rather than reinventing them. Overriding an existing system requires an explicit reason.

The profile records:

- **Personality positions** on each axis from `references/brand-personality-and-tone.md`, with reasons and accepted consequences.
- **Style parameters**, optionally naming an archetype from `references/visual-style-lexicon.md` alongside the specific parameters adopted and rejected.
- **Novelty budget** — where distinctiveness is spent, stated in one sentence per position.
- **System intents** — the intended shape of the colour, type, spacing, elevation, radius, and motion systems.
- **Voice positions** on the axes from `references/copy-voice-and-microcopy.md`.
- **Non-goals** — the directions explicitly rejected, which prevents rediscovering them later.

Store it against `schemas/aesthetic-profile.schema.json`. The profile is referenced by the design contract; it is not duplicated inside it.

A profile is only useful if it is falsifiable. Every position must be checkable against a render. If a reviewer cannot say whether an artifact matches, the entry is decoration and must be rewritten.

## 3. Derive the Design Contract

The design contract consumes the profile and states the concrete decisions for the surfaces being built: composition, typography, surfaces, components, states, responsive rules, motion, and acceptance cases.

The visual thesis remains a statement about this product, not a style label. The profile supplies the character the thesis expresses; the archetype, if named, supplies shorthand for a parameter bundle. Neither replaces the thesis.

## 4. Implement

Implementation follows the normal plan and test-first discipline. Two ordering rules apply specifically to aesthetic work:

- Structure before surface. Composition, hierarchy, and states must be correct before colour, elevation, and craft refinement.
- Static before motion. Motion polish begins only after static geometry passes.

## 5. Audit Mechanically

Run the aesthetic audit against the rendered artifact. It measures what can be measured without judgment:

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
npm run audit:aesthetics -- --profile aesthetic-profile.json --tokens artifacts/vision-loop/reports/token-profile.current.json --no-require-review
```

`--tokens` fills empty mechanical sections from a captured token profile; it never overwrites hand-authored measurements. Prefer a combined `--input` (or `--measurements`) once measurements are stable.

The audit covers colour ramp evenness and contrast, type scale distinguishability and role count, spacing scale conformance and vocabulary size, radius nesting, shadow light-source consistency, elevation vocabulary, motion duration and easing families, and the style signature of the artifact against the declared archetype.

Mechanical findings are facts. They do not require a reviewer to agree, and they should be fixed before a human or agent reviewer spends attention on judgment-based dimensions.

## 6. Review by Judgment

The aesthetic review covers what cannot be measured. It operates on current renders, one per required case, and uses the tests in `references/aesthetic-principles.md` rather than unaided impression. Each of the eight aesthetic dimensions is rated using the anchors in `references/aesthetic-scoring-anchors.md`.

The review is recorded against `schemas/aesthetic-review.schema.json` and is bound to the configuration hash of the artifact reviewed, so a stale review cannot approve a changed artifact.

The reviewer may not be the implementer. This follows the existing review independence rule and applies to aesthetic verdicts exactly as it applies to spec and quality verdicts.

## 7. Gate

The aesthetic evidence contributes a dedicated `aesthetic` gate to the frontend quality summary. It is not folded into the visual gate, because visual comparison answers a different question — fidelity to a reference — and averaging the two would let a high comparison score conceal poor craft.

The gate fails when a blocker is recorded, when any dimension falls below its floor, when the weighted score is below policy, when required cases are missing, or when the review does not bind to the current artifact.

## Degraded Operation

When the runtime cannot render the interface, the aesthetic review cannot be performed. Record it as a verification gap rather than as a pass. Specifically:

- Without a browser, mechanical audits can still run against a declared profile and static token sources, but measurements taken from source rather than from a render must be labelled as inferred.
- Without a reviewer independent of the implementer, the review is recorded as ungoverned and the gate does not pass on it.
- Comparing appearance from memory instead of a current render remains prohibited.

## Anti-Patterns

- Treating the aesthetic profile as a mood statement rather than a set of checkable positions.
- Naming a style archetype as the design thesis.
- Running the aesthetic review before the semantic review, which spends judgment on surfaces whose content or hierarchy is still wrong.
- Polishing craft on a layout whose composition has not been approved.
- Accepting a low dimension score because the weighted average is acceptable.
- Recording a rating of 5 without having performed the applicable test.

## Related

- `references/visual-direction-exploration.md` — ImageGen option sets before profile authorship.
- `references/aesthetic-principles.md` — the model and its tests.
- `references/aesthetic-scoring-anchors.md` — rating anchors, weights, and the decision rule.
- `references/design-before-implementation.md` — the governing design gate.
- `references/vision-loop-protocol.md` — the rendering and comparison loop this runs alongside.

<!-- END SOURCE: references/aesthetic-direction-protocol.md -->

---

## Source: `references/aesthetic-principles.md`

<!-- BEGIN SOURCE: references/aesthetic-principles.md -->

# Universal Aesthetic Principles

## Purpose

The rest of this package tells an agent what to reject. This reference tells it what to build toward. Anti-generic heuristics prevent the worst output; they do not produce work that people find attractive. A positive model is required so that visual judgment is reproducible rather than a matter of the reviewing agent's mood.

The model here is deliberately universal. It describes perceptual and cognitive regularities that hold across products, audiences, and eras, so it stays valid without trend data or audience research. Audience-specific and brand-specific direction sits on top of this layer and may never contradict it.

## Why Humans Perceive Something as Well Designed

Three mechanisms explain most of the reaction people label as taste.

**Processing fluency.** People experience the ease of decoding an image as a property of the image. An interface that resolves quickly into structure feels calm, competent, and trustworthy. One that requires effort to parse feels cheap even when every individual element is well made. Fluency is the single largest lever on perceived quality, and it is measurable: how long does it take to name the primary action, the content type, and the reading order.

**Perceptual organization.** Vision groups before it reads. Proximity, similarity, continuity, closure, and common region decide what belongs together, and they decide it faster than any label. When grouping produced by spacing and alignment agrees with the logical structure of the content, the design feels ordered. When they disagree, the user feels friction they cannot name and attributes it to the product.

**Typicality with controlled novelty.** Preference peaks where a design is as novel as possible while remaining recognizable. Pure convention reads as forgettable; unanchored novelty reads as broken. The resolution is to keep structure conventional and place novelty in a small number of deliberate positions.

Aesthetic judgment in this package is therefore not "what the reviewer likes." It is whether these three mechanisms are satisfied, and each has an observable test.

## The Seven Principles

Every principle below has a failure mode in both directions. Overcorrection is as much a defect as neglect.

### 1. Fluency

Structure must resolve before detail. A viewer should identify the region layout, the primary task, and the reading order before noticing any styling decision.

- Too little: competing entry points, unclear reading order, decoration that outranks content.
- Too much: a layout so uniform that nothing is emphasized and scanning has no anchor.

### 2. Grouping

Related things must look related through position and alignment before any container, border, or background is introduced.

- Too little: uniform spacing between all elements so the viewer must read labels to infer structure.
- Too much: nested containers that box every group, producing visual noise and wasted edge space.

Space is the primary grouping tool. A border or surface is justified only when proximity and alignment cannot express the relationship, most often when groups interleave or when a region genuinely floats above the page.

### 3. Balance

Visual weight must be distributed so the composition does not feel like it is tipping. Weight is driven by size, contrast, colour saturation, density, and isolation — not by area alone. A small, high-contrast element balances a large, low-contrast one.

- Too little: heavy elements clustered on one side with empty space opposite, reading as an unfinished layout.
- Too much: mirror symmetry everywhere, which reads as static and institutional and removes hierarchy.

Asymmetric balance is usually correct for product interfaces because it permits hierarchy. Symmetry is appropriate for terminal moments such as empty states, confirmations, and authentication.

### 4. Proportion

Sizes and spaces should come from a small, coherent set of related values rather than arbitrary numbers. What matters is that the relationships are systematic and that adjacent steps are distinguishable. A scale whose steps are too close produces hierarchy the eye cannot detect; one whose steps are too far produces jumps that break continuity.

- Too little: values chosen per component, so nothing lines up across pages.
- Too much: a scale applied so rigidly that dense data regions inherit spacing meant for marketing pages.

### 5. Contrast

Difference must be large enough to read as intentional. Two type sizes that differ slightly, two greys that differ slightly, or two weights that differ slightly all read as errors rather than distinctions. When two things are different, make them clearly different; when they are the same, make them identical.

- Too little: near-miss values that look like mistakes and flatten hierarchy.
- Too much: many simultaneous accents, each demanding attention, so none wins.

A useful constraint: one dominant accent per view, with additional colours reserved for semantic status rather than emphasis.

### 6. Rhythm

Repetition of spacing, size, and structural motifs creates the sense that a page was made by one hand. Rhythm also supports scanning, because a predictable interval lets the eye move without re-orienting.

- Too little: every section spaced differently, so the page feels assembled from unrelated parts.
- Too much: identical blocks repeated without variation, which reads as templated and causes the viewer to stop reading.

Break rhythm intentionally and rarely, at the point where you want attention.

### 7. Unity with Variety

The whole must read as one system, with variation carrying meaning. Every deviation should be traceable to a reason: a different content type, a different priority, a different state.

- Too little: multiple parallel visual systems in one product, usually the trace of separate authorship.
- Too much: total uniformity, which removes the viewer's ability to tell important from routine.

## The Novelty Budget

Distinctiveness is required — an interface that could belong to any product has failed — but it must be spent deliberately.

Reserve conventional treatment for anything load-bearing: navigation patterns, form behaviour, iconography for standard actions, and the meaning of colour for status. Spend novelty on a small number of positions, typically one or two per product: a distinctive type treatment, a specific composition or grid decision, a signature data visualization, or a particular use of imagery.

Record where the novelty is spent. If it cannot be named in one sentence, the design is either generic or scattered.

## Operational Tests

These convert the principles into observations that a reviewing agent can actually perform on a rendered capture. Each test names the principle it interrogates.

| Test | Method | Reveals |
|---|---|---|
| Blur test | View the render heavily blurred | Balance, grouping, whether hierarchy survives without reading |
| Five-second test | Look, look away, state the primary task | Fluency |
| Greyscale test | Remove all colour | Whether hierarchy depends on colour alone |
| Alignment audit | Trace every vertical and horizontal edge | Grouping, unity, hidden near-miss values |
| Removal test | Delete each decorative element in turn | Whether decoration carries meaning |
| Inventory test | Count distinct type sizes, weights, colours, radii, shadows | Contrast discipline, unity |
| Interval test | Measure the gaps between sibling groups | Rhythm, whether spacing encodes structure |
| Substitution test | Replace logo and copy with another product's | Novelty budget, whether anything is specific |
| Content-pressure test | Render with the longest and shortest plausible content | Whether proportion and rhythm are real or coincidental |

A finding produced by one of these tests is observable and can be stated as expected-versus-observed. A finding that cannot be tied to a test is a preference and must be recorded as such.

## Resolving Conflicts

When principles collide, apply this order:

1. Accessibility and task completion.
2. Fluency — the primary task must remain immediately identifiable.
3. Grouping — structure must match content.
4. Contrast and balance.
5. Rhythm, proportion, and unity.
6. Novelty.

Novelty is last. A distinctive design that costs the user comprehension is not a trade-off, it is a defect.

## What This Does Not License

These principles justify a design decision; they do not justify a change without evidence. A finding must still name the region, the observed condition, the expected condition, and the principle violated. "This feels unbalanced" is not reviewable. "The right column carries all high-contrast elements while the left half is empty below the fold, so the composition reads as unfinished at 1440 width" is.

Nor do these principles override an approved design contract. When the contract deliberately violates a principle, the deviation is recorded with its reason and is not a finding.

## Related

- `references/aesthetic-scoring-anchors.md` — how to convert these judgments into 0–5 ratings.
- `references/visual-craft-standards.md` — the micro-level execution these principles depend on.
- `references/anti-generic-design.md` — the negative constraints that complement this model.
- `references/design-evaluation-rubric.md` — the structural review criteria.

<!-- END SOURCE: references/aesthetic-principles.md -->

---

## Source: `references/aesthetic-direction-protocol_TH.md`

<!-- BEGIN SOURCE: references/aesthetic-direction-protocol_TH.md -->

# โปรโตคอลทิศทาง Aesthetic (สรุปภาษาไทย)

เอกสารฉบับเต็มภาษาอังกฤษอยู่ที่ `references/aesthetic-direction-protocol.md` และคู่มือรันจริงอยู่ที่ `AESTHETIC_WALKTHROUGH.md`

เมื่อผู้ใช้ส่งภาพหน้าจอแล้วขอ redesign ให้ทำ `references/visual-direction-exploration.md` ก่อน: Gen ตัวอย่าง 1/2/3 → เขียน `visual-direction-spec.md` → รอ confirm「เริ่มเขียน / ปรับต่อ / เลือกใหม่」แล้วค่อยเขียน profile

## บทบาท

Aesthetic direction เป็นส่วนของงานออกแบบ ไม่ใช่เฟสแยก ตั้งทิศก่อนลงมือทำ และตรวจพร้อม vision loop

```text
สำรวจบริบท → ตั้ง aesthetic profile → อนุมัติ design contract
→ implement (โครงสร้างก่อนผิว, static ก่อน motion)
→ audit เชิงกล + aesthetic review อิสระ → aesthetic gate
```

## Profile ที่ใช้ได้จริง

ทุกตำแหน่งบนแกนบุคลิกต้องตรวจกับเรนเดอร์ได้ ถ้าผู้ตรวจบอกไม่ได้ว่าตรงหรือไม่ ต้องเขียนใหม่ เก็บตาม `schemas/aesthetic-profile.schema.json` และอ้างจาก design contract ไม่ต้องคัดลอกซ้ำ

## คำสั่งหลัก

```bash
npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
npm run aesthetics:review -- --config vision-loop.config.json
npm run vision-loop -- --config vision-loop.config.json
```

เมื่อ `aesthetics.enabled` เป็น true วิชั่นลูปจะโหลด profile / measurements / review เข้า run summary หากหลักฐานที่บังคับขาด Gate จะ fail ไม่ใช่ skip เงียบ ๆ

## กติกาตัดสิน

- เฉลี่ยถ่วงน้ำหนักชดเชยมิติที่ต่ำกว่า floor ไม่ได้
- คะแนนต่ำกว่า 3 ต้องมี finding
- คะแนน 5 ต้องมีผลการทดสอบที่ทำจริง
- ผู้ตรวจ aesthetic ต้องไม่ใช่ผู้ implement
- คะแนนเปรียบเทียบภาพ (fidelity) สูงไม่ได้ชดเชย craft ที่แย่

## อ้างอิง

- `references/aesthetic-principles.md` — หลักการ + การทดสอบ 9 แบบ
- `references/aesthetic-scoring-anchors.md` — หลักยึดคะแนน 0–5
- `references/aesthetic-principles_TH.md` — สรุปหลักการภาษาไทย

<!-- END SOURCE: references/aesthetic-direction-protocol_TH.md -->

---

## Source: `references/aesthetic-principles_TH.md`

<!-- BEGIN SOURCE: references/aesthetic-principles_TH.md -->

# หลักการ Aesthetic สากล (สรุปภาษาไทย)

ฉบับเต็ม: `references/aesthetic-principles.md` · หลักยึดคะแนน: `references/aesthetic-scoring-anchors.md`

## เจตนา

เลเยอร์นี้ไม่ใช่รสนิยมส่วนตัวของเอเจนต์ แต่เป็นหลักการรับรู้ที่ใช้ร่วมกันได้ แล้วทำให้สังเกตได้ผ่านการทดสอบ

## หลักเจ็ดข้อ (ย่อ)

1. **Fluency** — อ่านและกระทำได้โดยไม่ติด
2. **Grouping** — สิ่งที่เกี่ยวกับกันอยู่ใกล้กัน / แยกจากสิ่งที่ไม่เกี่ยว
3. **Balance** — น้ำหนักภาพไม่เอียงโดยไม่มีเหตุ
4. **Proportion** — อัตราส่วนของชนิด ระยะ และตัวอักษรสอดคล้องกัน
5. **Contrast** — สิ่งสำคัญเด่นโดยไม่พึ่งสีอย่างเดียว
6. **Rhythm** — จังหวะซ้ำของระยะ ชนิด และจังหวะ motion มีแบบแผน
7. **Unity + novelty budget** — รวมเป็นหนึ่งระบบ และจำกัดจุดที่ตั้งใจให้ต่าง

## การทดสอบเก้าแบบ

| การทดสอบ | ถามอะไร |
|---|---|
| Blur | ลำดับชั้นยังอ่านได้เมื่อเบลอหรือไม่ |
| Five-second | ใน 5 วินาทีรู้ได้ไหมว่าหน้าที่ของหน้าคืออะไร |
| Greyscale | ลำดับชั้นยังอยู่เมื่อไม่มีสีหรือไม่ |
| Squint / distance | จุดโฟกัสหลักยังอยู่หรือไม่ |
| Alignment audit | ขอบและแกนตั้งตรงหรือลอย |
| Inventory | นับชนิดระยะ รัศมี เงา ฟอนต์ แล้วมากเกินเหตุหรือไม่ |
| Interval | จังหวะช่องว่างสม่ำเสมอหรือสุ่ม |
| Content pressure | เมื่อข้อความยาว/สั้น โครงพังหรือไม่ |
| Motion mute | ปิด motion แล้วยังเข้าใจสถานะได้หรือไม่ |

## กติกาคะแนน

- ต่ำกว่า floor ของมิติ → ไม่ผ่าน แม้ค่าเฉลี่ยสูง
- < 3 ต้องมี finding ที่บันทึกได้
- = 5 ต้องระบุการทดสอบที่ทำแล้ว

อย่าใช้คำกว้างอย่าง modern / clean / premium เป็นทิศทาง — แทนด้วยตำแหน่งบนแกนและผลที่รับได้

<!-- END SOURCE: references/aesthetic-principles_TH.md -->

---

## Source: `AESTHETIC_WALKTHROUGH.md`

<!-- BEGIN SOURCE: AESTHETIC_WALKTHROUGH.md -->

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

<!-- END SOURCE: AESTHETIC_WALKTHROUGH.md -->

---

## Source: `references/aesthetic-scoring-anchors.md`

<!-- BEGIN SOURCE: references/aesthetic-scoring-anchors.md -->

# Aesthetic Scoring Anchors

## Purpose

The semantic visual review rates eight dimensions from 0 to 5 but defines only what 5 means. Everything between 0 and 4 is left to the reviewer, which makes scores unstable across agents and across sessions, and makes a threshold policy meaningless. A reviewer who reads "5 means the primary task is immediately clear" has no basis for choosing between 2 and 3 when it partly is.

This reference supplies the missing anchors. It defines a general scale, then per-dimension anchors for the aesthetic review, then the rules for converting scores into a decision.

## The General Scale

Every rating uses the same underlying meaning. The dimension-specific tables below are instances of it.

| Score | Meaning | Action implied |
|---|---|---|
| 5 | Exemplary. Fully satisfies the dimension. No observable defects. Could be used as a reference for other work. | None |
| 4 | Sound. Satisfies the dimension. Minor observations exist but none changes meaning, hierarchy, or task completion. | Optional refinement |
| 3 | Acceptable with defects. Works, but at least one observable defect degrades the experience without preventing the task. | Should fix before release |
| 2 | Deficient. Multiple defects, or one defect significant enough that users will notice and be slowed. | Must fix |
| 1 | Failing. The dimension is largely unaddressed. The design does not satisfy its basic requirement. | Must fix; likely rework |
| 0 | Absent or blocking. The dimension cannot be evaluated because the required work does not exist, or its state blocks task completion. | Blocker |

Two rules apply to every rating:

- **A score below 3 requires at least one recorded finding** with region, expected condition, and observed condition. A low score with no findings is an opinion.
- **A score of 5 requires that the applicable tests were actually performed**, not that no defect happened to be noticed. Naming the test in the notes is the evidence.

## Aesthetic Review Dimensions

The aesthetic review complements the semantic visual review. The semantic review asks whether the interface communicates the right thing; the aesthetic review asks whether it is well made and whether it expresses its declared character.

### Compositional Balance

Visual weight distribution, grouping, alignment discipline, and whether structure resolves before detail.

| Score | Condition |
|---|---|
| 5 | Survives the blur test with hierarchy intact; weight distributed so no region reads as tipping; few, consistent alignment edges; every element aligns to something |
| 4 | Balance holds; one or two elements align to nothing or a minor region reads slightly heavy |
| 3 | Structure is readable but a region is visibly unbalanced, or several distinct alignment edges make the layout feel loose |
| 2 | Grouping does not match content structure, or the composition reads as unfinished in a primary region |
| 1 | No discernible compositional system; elements placed independently |
| 0 | Layout is broken, overlapping, or clipped such that composition cannot be assessed |

### Craft Precision

Optical alignment, radius nesting, shadow consistency, border treatment, icon and image handling, micro-typography.

| Score | Condition |
|---|---|
| 5 | Optical corrections applied; radii nest correctly; one consistent light source with layered shadows; icons share a family and optical size; typographic characters correct |
| 4 | One or two isolated craft defects that do not repeat across the system |
| 3 | A craft defect repeats across several components, such as a radius that does not nest or an inconsistent icon optical size |
| 2 | Multiple repeating craft defects; shadows imply conflicting light sources or elevation is decorative |
| 1 | Craft is generally unaddressed; values appear chosen per element |
| 0 | Rendering artifacts prevent assessment |

### Colour System

Palette construction, perceptual evenness, semantic role assignment, contrast, theme handling.

| Score | Condition |
|---|---|
| 5 | Perceptually even neutral ramp with deliberate temperature; one dominant accent; all colour resolves through semantic roles; contrast satisfied against real rendered backgrounds; themes tuned independently |
| 4 | System is coherent; a minor contrast pair sits near its floor or one value bypasses a role |
| 3 | An uneven ramp step, a second accent competing for primary status, or a text pair below its contrast floor in a secondary region |
| 2 | Parallel colour systems present, or status conveyed by hue alone, or a primary text pair fails contrast |
| 1 | No colour system; values applied ad hoc |
| 0 | Colour renders incorrectly, or theme is broken such that the palette cannot be assessed |

### Typographic System

Scale distinguishability, role definition, line height behaviour, measure, wrapping, numeric treatment.

| Score | Condition |
|---|---|
| 5 | Small scale with clearly distinguishable steps; every size maps to a role; line height varies with size and measure; measure controlled in characters; tabular figures where compared; wrapping verified under content pressure |
| 4 | System is sound; one near-miss pair or one region exceeding comfortable measure |
| 3 | Several sizes without clear roles, a constant line height across the scale, or long-form measure materially over the comfortable range |
| 2 | Scale steps largely indistinguishable, or hierarchy unreadable, or wrapping breaks under realistic content |
| 1 | No type system; sizes chosen per component |
| 0 | Text is unreadable, missing, or the font failed to load such that typography cannot be assessed |

### Spatial Rhythm

Spacing scale conformance, proximity grouping, nesting, whitespace purpose, vertical rhythm, responsive spacing.

| Score | Condition |
|---|---|
| 5 | All spacing resolves to the scale; between-group gaps clearly exceed within-group gaps everywhere; nesting decreases spacing; intervals repeat; macro spacing compresses at narrow widths |
| 4 | One or two off-scale values, or a single group whose spacing ratio is ambiguous |
| 3 | Off-scale values recur, or a form or list has ambiguous proximity grouping, or whitespace is present without structural purpose |
| 2 | Proximity grouping inverted in a primary region, or density inappropriate to the task |
| 1 | No spacing system; gaps chosen per element |
| 0 | Spacing collapse, overflow, or overlap prevents assessment |

### Motion Quality

Purpose, timing, easing, choreography, interruption, reduced-motion parity, performance.

| Score | Condition |
|---|---|
| 5 | Every animation serves a defined function; duration scales with distance; easing matches direction; choreography preserves hierarchy; interruption reverses from current state; reduced motion implemented and reviewed; frame rate holds |
| 4 | Motion is sound; one transition uses a duration or curve slightly out of family |
| 3 | A single easing curve applied across all motion, or an entrance and exit that do not differentiate, or unbounded stagger |
| 2 | Decorative motion without function, non-interruptible motion on a frequent action, or animation of layout properties causing visible frame drops |
| 1 | Motion largely unconsidered or absent where continuity requires it |
| 0 | Motion blocks input, hides a required state, or reduced-motion handling is absent |

Where a surface genuinely has no motion by design, record the dimension as not applicable rather than scoring it.

### Brand Expression

Whether the artifact expresses its declared personality profile, and whether the novelty budget is spent deliberately.

| Score | Condition |
|---|---|
| 5 | Render matches the declared position on every personality axis; the novelty budget is spent in identifiable positions; the product survives the substitution test |
| 4 | Character is present and consistent; one surface sits slightly off the declared position |
| 3 | Character is present but inconsistent across routes, or the distinguishing decision is weak |
| 2 | Render does not express the declared profile, or personality varies by which surface was built when |
| 1 | No discernible character; the design would suit any product in any category |
| 0 | No personality profile declared, so expression cannot be evaluated |

### Copy Voice

Voice consistency, tone by state, action clarity, error usefulness, content realism, formatting.

| Score | Condition |
|---|---|
| 5 | One consistent voice at the declared positions; tone shifts correctly by state; actions state outcomes; errors give cause, impact, and next action; content is realistic; numbers, dates, and units correctly formatted |
| 4 | Voice is consistent; one label or message sits slightly off register |
| 3 | Voice varies noticeably between surfaces, or a generic error message appears, or empty-state variants are collapsed into one |
| 2 | Multiple misleading or mechanism-named actions, or errors without recovery paths, or placeholder copy in a reviewed artifact |
| 1 | Copy largely unconsidered; labels internal or inconsistent throughout |
| 0 | Fabricated progress, misleading destructive labels, or messaging that blocks recovery |

## Weighting and Decision

Dimensions are not equally important. Default weights, adjustable by policy:

| Dimension | Weight |
|---|---|
| Compositional balance | 1.5 |
| Typographic system | 1.5 |
| Spatial rhythm | 1.5 |
| Colour system | 1.5 |
| Craft precision | 1.0 |
| Motion quality | 1.0 |
| Brand expression | 1.0 |
| Copy voice | 1.0 |

The weighted score is the weighted mean of the ratings expressed as a percentage of the maximum. Approval requires all of:

- no blockers recorded;
- no dimension scored below the configured floor, which defaults to 3;
- the weighted score at or above the configured minimum;
- every required case reviewed;
- the review bound to the current artifact and configuration.

A high weighted average never compensates for a dimension below its floor. Averaging is how a serious single defect disappears into an acceptable-looking number.

## Residual Deviations

A defect may be accepted without being fixed when it is recorded with its exact region, the observable difference, the user impact, the reason acceptance is safe, and whether the same deviation repeats system-wide. A deviation that repeats system-wide is not residual; it is a system defect and must be raised in severity.

## Related

- `references/aesthetic-principles.md` — the principles and tests these dimensions measure.
- `references/semantic-visual-review.md` — the complementary semantic review.
- `references/motion-quality-standards.md` — the motion rubric in full.
- `references/copy-voice-and-microcopy.md` — the copy rubric in full.

<!-- END SOURCE: references/aesthetic-scoring-anchors.md -->

---

## Source: `references/visual-craft-standards.md`

<!-- BEGIN SOURCE: references/visual-craft-standards.md -->

# Visual Craft Standards

## Purpose

Craft is the layer below composition. A design can satisfy every structural rubric and still read as amateur because of misaligned optical centres, shadows that describe an impossible light source, or radii that do not nest. These defects are individually small and collectively decisive: they are the difference most people describe as "polished" without being able to point at a cause.

Craft findings are always minor severity on their own. They become major when they repeat across a system, because repetition converts a detail into a visible pattern.

## Optical Versus Geometric Alignment

Measured centre and perceived centre differ. Align to what the eye sees.

- **Icon in a circular or square button.** Glyphs with heavy mass on one side sit off-centre when centred geometrically. Play, chevron, and send icons typically need a shift of roughly 1–2 px toward the visual mass at 24 px sizes.
- **Text baseline against an icon.** Centring an icon box against a line box leaves the icon looking high, because the line box includes descender space. Align to cap height or x-height, not to the line box.
- **Round versus flat shapes.** Circles and other curved shapes must overshoot flat shapes slightly to appear the same size. A circular avatar next to a square thumbnail of identical measured height reads as smaller.
- **Punctuation and quotes at the start of a line.** Hanging them into the margin keeps the text edge optically straight.
- **Triangular and asymmetric glyphs.** Centre by visual mass, not bounding box.

The verification method is the alignment audit: trace every edge in the render and confirm that the edges the eye follows are the ones the layout intends.

## Nested Radii

An inner corner inside an outer corner must be smaller by the padding between them, or the two curves will not run parallel and the gap will visibly pinch at the corner.

```text
innerRadius = outerRadius − padding
```

When the result is zero or negative, the inner element is square. Applying the same radius to a card and to a control inside it is one of the most common and most visible craft errors. It is also mechanically detectable, which makes it a good automated check.

Keep the radius family small: typically one small value for controls, one medium for cards, one large for sheets, plus fully round for pills and avatars. A radius appearing once in a system is either a mistake or an undocumented decision.

## Elevation and Shadow

Shadow describes a light source. One interface has one light source, conventionally above and slightly forward. Every shadow must be consistent with it.

- Vertical offset is positive and grows with elevation. Horizontal offset stays at zero unless the product deliberately models an off-axis light, in which case it is the same sign and ratio everywhere.
- Blur grows faster than offset as elevation increases. Higher objects cast softer, larger shadows.
- Opacity decreases as blur increases. A large shadow at the same opacity as a small one reads as smoke.
- A realistic shadow is two layers: a tight, darker contact shadow describing occlusion near the object, and a wide, lighter ambient shadow. A single mid-blur shadow is the signature of unconsidered elevation.
- Shadow colour should carry the surface hue rather than being neutral black at low opacity, which greys the underlying colour and reads as dirty.
- Elevation must correspond to real layering. A card that does not float above the canvas in the interaction model should not float visually.

An elevation system needs few levels. Rest, raised, overlay, and modal are usually sufficient. More levels than distinguishable steps means the extra levels are decorative.

## Borders and Hairlines

- A border is a boundary, not decoration. If removing it does not lose information, it was decoration.
- Borders and shadows are alternative ways to separate a surface from its background. Using both on the same element is usually redundant and produces a heavy, dated edge.
- Hairlines must survive device pixel ratio. A sub-pixel border renders inconsistently across displays and produces the appearance of uneven line weight down a list.
- Border colour should be a low-contrast step of the surface colour rather than a separate grey, or the boundary will not track theme changes.

## Gradient Quality

- Gradients interpolated in sRGB pass through a desaturated middle when the endpoints differ in hue. Interpolating in a perceptual space keeps the midpoint saturated and avoids the characteristic muddy band.
- Banding appears on large, low-contrast gradients. Adding a subtle noise layer or increasing the colour distance between stops removes it.
- A gradient must have a reason: describing depth, directing attention, or expressing a brand element. A gradient applied to a surface because a flat colour looked plain is decoration and is rejected by the anti-generic constraints.

## Imagery and Icons

- Icons within a family share stroke weight, terminal style, corner treatment, and optical size. Mixing families is visible immediately even to untrained viewers.
- Optical size matters more than bounding box. A 24 px bounding box containing a 16 px glyph sits next to a 24 px bounding box containing a 22 px glyph as an obvious inconsistency.
- Image crops must preserve the subject's focal point across every aspect ratio the layout produces. Verify at the narrowest and widest rendered ratio, not only at the design ratio.
- Photographic treatment — colour grading, contrast, grain, and overlay — must be consistent, or the product reads as assembled from stock sources.
- Images require intrinsic dimensions in markup so that layout does not shift during load. This is both a craft and a performance concern.

## Micro-Typography

- Use tabular figures wherever numbers are compared vertically or update in place. Proportional figures in a table cause columns to shimmer and misalign.
- Headline-sized text needs tighter tracking than body text; small text and uppercase text need looser tracking. A single tracking value across the scale is visible at the extremes.
- Use true typographic characters: correct quotation marks, apostrophes, en dashes for ranges, em dashes or spaced en dashes for interruptions, and a multiplication sign rather than the letter x for dimensions.
- Prevent single-word final lines in headlines by binding the last two words with a non-breaking space.
- Avoid faux bold and faux italic. Synthesized weights are visibly distorted; load the real weight or change the design.
- Do not hyphenate or justify short measures. Justified text at narrow widths produces uneven word spacing that damages fluency.

## Verification

Craft defects that are mechanically detectable should be detected mechanically rather than reviewed by eye. The following are available through the aesthetic audit surface:

| Defect | Detection |
|---|---|
| Non-nesting radii | Compare parent radius, padding, and child radius |
| Inconsistent shadow light source | Compare horizontal offset sign and offset-to-blur ratio across the shadow set |
| Single-layer shadows at high elevation | Count shadow layers per elevation level |
| Off-scale spacing values | Compare observed spacing against the declared spacing scale |
| Near-miss type sizes | Detect adjacent scale steps below the minimum distinguishable ratio |
| Redundant border plus shadow | Detect elements carrying both on the same edge |
| Excess radius or elevation vocabulary | Count distinct values against the policy maximum |

Everything else in this reference is reviewed visually against a current render and reported with region, expected condition, and observed condition.

## Related

- `references/aesthetic-principles.md` — the perceptual model these details serve.
- `references/color-system-and-perception.md` — perceptual colour handling for gradients and shadows.
- `references/typographic-system-quality.md` — the type scale that micro-typography operates inside.
- `references/design-token-drift.md` — how these values are detected as tokens.

<!-- END SOURCE: references/visual-craft-standards.md -->

---

## Source: `references/color-system-and-perception.md`

<!-- BEGIN SOURCE: references/color-system-and-perception.md -->

# Colour System and Perception

## Purpose

Colour is the design dimension where intuition fails most often, because the numbers in a hex value do not correspond to what the eye perceives. Two colours with the same numeric lightness can look very different; a palette generated by rotating hue at fixed saturation produces steps of wildly uneven weight. This reference defines how to build and evaluate a palette so the result is predictable rather than accidental.

## Work in a Perceptual Space

Hex and HSL are storage and authoring conventions, not perceptual models. In HSL, `hsl(60 100% 50%)` and `hsl(240 100% 50%)` claim identical lightness while yellow appears far brighter than blue. Any ramp built by holding HSL lightness constant will have visibly uneven steps.

Reason about colour in a perceptually uniform space — OKLCH is the practical choice — where lightness, chroma, and hue are separated in a way that matches perception:

- **L (lightness)** predicts perceived brightness, so equal L values across hues genuinely look equally light.
- **C (chroma)** is colourfulness. Its achievable maximum depends on both L and hue, so a fixed chroma applied across a ramp will clip in some regions.
- **H (hue)** rotates without changing perceived lightness.

Two consequences follow. First, a neutral ramp should vary L on an even curve. Second, an accent ramp should vary L on that same curve while letting C peak in the mid range and fall toward both ends, because very light and very dark colours cannot sustain high chroma.

## Constructing a Palette

**Neutrals first.** Most surface area is neutral. Build a ramp of nine to twelve steps with even perceptual lightness spacing. Pure grey is rarely correct: a small amount of chroma shared with the brand hue makes neutrals feel intentional and unifies the interface. Warm-tinted neutrals read as approachable; cool-tinted neutrals read as technical.

**One accent.** A single accent carries the primary action and the product's identity. A second accent is justified only when it marks a genuinely different class of action, not to add variety.

**Status colours are semantic, not decorative.** Success, warning, danger, and information exist to convey state. Their hues follow strong convention and should not be reassigned for aesthetic reasons. They may be tuned toward the palette — pulled slightly toward the brand hue, matched in chroma to the accent — so they belong to the same system.

**Assign roles, not values.** The system is defined by roles: canvas, surface, elevated surface, text, muted text, border, accent, and the status set. Components reference roles. A component referencing a raw palette step is a token drift defect and will not survive theming.

## Contrast

Contrast is an accessibility floor and a hierarchy tool, and both must be satisfied.

WCAG 2 contrast ratios are the compliance requirement: 4.5:1 for body text, 3:1 for large text and for the boundaries of interactive components. Verify against the actual rendered background, including any gradient, image, or overlay behind the text.

The WCAG 2 formula is known to misestimate perceived contrast, particularly for light text on dark backgrounds and for mid-range colour pairs. Where the two disagree, satisfy the WCAG floor and use perceptual lightness difference to make the final judgment about hierarchy. A pair can pass 4.5:1 and still read as weak.

Additional requirements:

- Text hierarchy needs contrast steps that are clearly distinguishable, not merely different. Primary and secondary text separated by a small lightness difference reads as an inconsistency rather than a hierarchy.
- Disabled controls must be distinguishable as disabled without relying on contrast so low that the label becomes unreadable.
- Focus indicators need contrast against both the component and the surrounding surface.
- Status must never be conveyed by hue alone. Pair it with an icon, a label, or a shape.

## Perceptual Effects to Account For

- **Simultaneous contrast.** A colour shifts in appearance depending on its surroundings. The same grey text looks darker on white and lighter on dark, which is why light and dark themes cannot use mirrored values and must be tuned separately.
- **Chromatic aberration at edges.** Saturated complementary colours placed directly adjacent produce a shimmering boundary that is fatiguing to read. Separate them with a neutral.
- **Area effect.** A colour applied to a large area appears more saturated and lighter than the same colour in a small swatch. Accents chosen from small samples typically overwhelm when applied to a full surface.
- **Dark theme is not inversion.** Light text on dark backgrounds appears to bloom, so weights often need to be one step lighter and chroma one step lower. Elevation reverses: higher surfaces get lighter rather than casting stronger shadows.

## Harmony

Harmony schemes are starting points, not goals. Their value is in constraining the hue set so the result reads as deliberate.

| Scheme | Hue relationship | Character | Main risk |
|---|---|---|---|
| Monochromatic | Single hue, varying L and C | Calm, unified, easy to keep coherent | Weak differentiation between element classes |
| Analogous | Adjacent hues | Natural, comfortable | Insufficient contrast for a primary action |
| Complementary | Opposing hues | High energy, strong emphasis | Vibration at shared edges, easily overused |
| Split complementary | One hue plus two neighbours of its opposite | Contrast with less tension | More hues to keep disciplined |
| Triadic | Three evenly spaced hues | Vivid, playful | Very hard to keep one hue dominant |

Whichever scheme is chosen, one hue dominates, one supports, and any third is an accent used sparingly. Equal distribution of three hues removes hierarchy.

## Evaluation Checklist

- Is the neutral ramp perceptually even, without a step that jumps or a pair that is indistinguishable?
- Do neutrals carry a deliberate temperature, or are they defaulted pure grey?
- Is there one dominant accent, or are several colours competing for primary status?
- Does every colour used in components resolve through a semantic role?
- Does every text and boundary pair meet its contrast floor against its real rendered background?
- Is any state conveyed by hue alone?
- Are the light and dark themes tuned independently rather than inverted?
- Does the accent hold up at full-surface scale, not only as a small sample?
- Do gradients interpolate without a desaturated or banded midsection?

## Related

- `references/aesthetic-principles.md` — contrast and unity as perceptual principles.
- `references/visual-craft-standards.md` — shadow colour and gradient execution.
- `references/accessibility-and-interaction.md` — the accessibility requirements that bound colour choice.
- `references/design-token-drift.md` — detection of parallel colour systems.

<!-- END SOURCE: references/color-system-and-perception.md -->

---

## Source: `references/typographic-system-quality.md`

<!-- BEGIN SOURCE: references/typographic-system-quality.md -->

# Typographic System Quality

## Purpose

Typography carries most of the content and therefore most of the perceived quality. It is also the dimension where small systematic errors compound fastest: a scale with indistinguishable steps, a line height that ignores size, or a measure that runs too wide will degrade every screen in the product simultaneously.

This reference defines what a good type system looks like structurally, so it can be evaluated without reference to a specific typeface.

## The Scale

A type scale is a small set of sizes with a consistent relationship. Two properties determine whether it works.

**Step distinguishability.** Adjacent steps must differ enough that the difference reads as intentional. A ratio near 1.0 between neighbouring sizes produces hierarchy the eye cannot detect, and the result looks like an error rather than a level. As a working floor, adjacent steps should differ by at least about 12 percent, and the steps that carry real hierarchy — body against section heading, section heading against page title — should differ considerably more.

**Step count.** Most products need five to seven sizes. Beyond that, the extra sizes are not carrying distinct roles and will be applied inconsistently. A system with a dozen sizes in the render is almost always the trace of per-component decisions rather than a system.

Ratio-based scales are the common construction: each step multiplies the previous by a fixed ratio. Smaller ratios suit dense, information-heavy products where many levels must coexist; larger ratios suit editorial and marketing surfaces with few levels and strong contrast. A single ratio applied from caption to hero often produces a display size that is too large or a caption that is too small, so scales are frequently ratio-based in the body range and hand-tuned at the extremes. That is acceptable when the tuned values are documented; it is a defect when it happens per component.

## Roles

Sizes are not the system. Roles are. Each role fixes size, weight, line height, tracking, and colour role together:

- Display or hero, used at most once per view.
- Page title.
- Section heading.
- Subsection or card heading.
- Body.
- Secondary or supporting body.
- Caption, label, and metadata.
- Numeric and data.

A design that lists sizes but not roles will drift, because the next component author must guess which size means "section heading."

Weight participates in hierarchy alongside size. Two levels can be distinguished by weight at the same size, which is often better in dense interfaces than adding another size. Weight steps must also be distinguishable: adjacent weights that differ slightly read as a rendering artifact.

## Line Height

Line height is a function of size and measure, not a constant.

- Large text needs proportionally tighter line height. A display size at body line height looks loose and disconnected.
- Small text needs proportionally looser line height to stay readable.
- Longer measures need more line height so the eye can find the next line start.

As practical ranges: display and headline text sits near 1.1–1.25, body text near 1.5–1.65, and dense UI labels near 1.3–1.4. A single line-height multiplier applied across the whole scale is visible at both ends.

Line height must also participate in the vertical spacing system. If line boxes do not resolve to values compatible with the spacing scale, every text block will introduce a small offset that breaks alignment across columns.

## Measure

Measure is the line length in characters. Comfortable continuous reading sits between roughly 45 and 75 characters; beyond about 85 the eye loses the line return and comprehension drops.

- Long-form content must be constrained by a maximum width expressed in characters rather than pixels, so it holds across type sizes.
- Interface text in wide layouts is the most common violation: a description that spans a full 1440-pixel container will exceed 120 characters and read poorly even though nothing appears broken.
- Very short measures, below about 35 characters, force excessive hyphenation and ragged spacing.

## Rag and Wrapping

- Left-aligned text with a ragged right edge is the default. The rag should be soft and irregular; a rag that forms a shape or produces a sequence of near-equal lines draws attention.
- Headlines wrap at meaningful points. A headline that breaks between an article and its noun reads as an accident. Balanced wrapping or explicit break control is warranted for short, prominent text.
- A single word alone on the final line of a paragraph or headline is a defect and is fixed by binding the last two words.
- Text must be verified at the longest and shortest plausible content, and in every supported language. Layouts tuned to one string length break under real content.

## Pairing

Most products need one typeface. A second is justified when two content types genuinely differ in function — for example a text face for reading and a monospace face for code and identifiers.

When pairing, the two faces should either clearly contrast in classification or share a designer or skeleton. Two similar-but-different faces read as a mistake. Pairs must also be checked for matching x-height and apparent size, because two faces at the same nominal size frequently do not look the same size, requiring an optical size adjustment.

Variable fonts reduce the loading cost of multiple weights and permit optical size axes that adjust letterforms for their rendered size. Where an optical size axis exists, use it rather than scaling a single design across the whole range.

## Fallbacks and Loading

- The fallback stack must have metrics close to the web font, or the layout will shift when the font loads.
- Font loading strategy must not produce invisible text during load on the primary content.
- Numeric-heavy interfaces must specify tabular figures explicitly, since most faces default to proportional figures.

## Evaluation Checklist

- Are adjacent scale steps clearly distinguishable, with no near-miss pairs?
- Is the number of distinct sizes in the render small enough to be a system?
- Does every size correspond to a named role?
- Does line height vary with size and measure rather than being constant?
- Is long-form measure constrained in characters, and does interface text avoid running to full container width?
- Do headlines wrap at meaningful points, with no single-word final lines?
- Are numbers tabular wherever they are compared or updated in place?
- Does the layout survive the longest plausible string in every supported language?
- Do fallback metrics prevent a visible shift on font load?

## Related

- `references/aesthetic-principles.md` — contrast and proportion as perceptual principles.
- `references/visual-craft-standards.md` — micro-typography details.
- `references/spatial-composition-and-rhythm.md` — how line boxes interact with the spacing scale.
- `references/design-evaluation-rubric.md` — the structural typography criteria.

<!-- END SOURCE: references/typographic-system-quality.md -->

---

## Source: `references/spatial-composition-and-rhythm.md`

<!-- BEGIN SOURCE: references/spatial-composition-and-rhythm.md -->

# Spatial Composition and Rhythm

## Purpose

Spacing is the primary carrier of structure. Before a user reads a label, spacing has already told them what belongs to what. When the spacing system encodes the content hierarchy, the interface feels organized; when spacing is uniform or arbitrary, the user must read everything to understand anything.

This reference covers the spacing scale, proximity grouping, grid behaviour, density, and the whitespace decisions that most often separate considered work from assembled work.

## The Spacing Scale

Use a small set of values derived from a base unit, typically 4 or 8 pixels. A scale that grows roughly geometrically at the larger end is easier to use than a purely linear one, because the useful distinctions at large sizes are proportionally larger.

A working scale is around eight to ten values. Two failure modes:

- **Too many values**, or values off the scale entirely, means spacing is being chosen per component. The symptom is that nothing aligns across pages.
- **Too few values** forces the same gap to express both "same group" and "different section," collapsing the structural signal.

Every off-scale spacing value in the render should be traceable to a deliberate optical correction. Otherwise it is drift.

## Proximity Encodes Structure

The rule is simple and it is violated constantly: **the gap between groups must be clearly larger than the gap inside a group.**

- A label sitting closer to the field below it than to its own field is the single most common spacing defect in forms, and it inverts the meaning.
- A section heading spaced equally from the section above and the section below belongs to neither.
- Items in a list separated by the same gap that separates the list from the next block read as one undifferentiated run.

As a working ratio, the between-group gap should be roughly twice the within-group gap, adjusted so both land on the scale. What matters is that the difference is unambiguous at a glance.

Nesting should be visible in the spacing: outer padding larger than inner padding, section gaps larger than group gaps, group gaps larger than element gaps. When these invert at any level, the perceived structure inverts with them.

## Whitespace

Whitespace is not emptiness to be filled or added. It is the instrument that produces grouping, emphasis, and pace.

- **Macro whitespace** separates major regions and sets the overall density character.
- **Micro whitespace** separates elements within a group and does most of the work of legibility.

Two symmetric failures:

- **Cramped.** Elements touching their containers, text running to the edge of its surface, controls without breathing room. Reads as unfinished and increases error rates.
- **Vacant.** Very large gaps that do not correspond to structural boundaries, oversized margins on dense content, or a layout that forces scrolling past emptiness to reach the primary task. Whitespace that does not improve hierarchy is a defect, not restraint.

The test is whether removing a given gap would change what appears grouped. If not, it is decoration.

## Grid and Alignment

- A grid exists to produce shared edges. Its value is that elements across unrelated components line up.
- Every element should align to something. An element that aligns to nothing draws attention without meaning.
- Alignment edges should be few. A layout with many distinct left edges reads as disordered even when each element is individually placed with care.
- Optical alignment overrides geometric alignment where they differ, most often with text inside padded containers and with elements that have significant internal whitespace.
- Container padding and grid gutters must be reconciled. Nesting a gridded container inside a padded one commonly produces a doubled edge inset that misaligns content against the header above it.

Full-bleed and contained regions can alternate, but the content inside a full-bleed region should still resolve to the same measure and alignment as contained regions, or the page will read as two layouts.

## Density

Density is a product decision, not a style preference. It follows from how much information the user needs simultaneously and how long they spend in the interface.

- **Dense** suits professional tools, monitoring, and data work where scanning many values at once is the task. Dense layouts need tighter spacing, smaller type, and stronger reliance on alignment and rules rather than whitespace for separation.
- **Comfortable** suits transactional and consumer flows where each step is discrete.
- **Spacious** suits marketing, onboarding, and terminal moments where a single message dominates.

A product may use different densities in different regions, provided the density is consistent within a region and the transition happens at a structural boundary. Mixing densities inside one region reads as inconsistency.

The common error is applying marketing-page spacing to a data-heavy region, which pushes information below the fold and forces scrolling for work that should be visible at once.

## Vertical Rhythm

Consistent vertical intervals let the eye move down a page without re-orienting.

- Space between sections should come from a small number of values, and the same structural relationship should get the same value everywhere.
- Space is generally set once, in one direction, rather than as competing margins from both neighbours. Collapsing and doubled margins are a frequent source of intervals that do not match the scale.
- Text line boxes should resolve to values compatible with the spacing scale, or every text block introduces a fractional offset.

## Responsive Behaviour

Spacing is not a constant across viewports.

- Macro spacing should decrease at narrow widths. Desktop section gaps applied on mobile waste a large fraction of a small screen.
- Micro spacing should stay roughly constant, because it is governed by legibility and touch target requirements rather than available space.
- Container padding scales with viewport; component padding largely does not.
- Reordering at narrow widths must preserve grouping. A group whose members separate across a breakpoint has lost its structural signal.

## Evaluation Checklist

- Do all spacing values resolve to the scale, and is every exception a documented optical correction?
- Is the between-group gap clearly larger than the within-group gap everywhere?
- Does nesting depth correspond to decreasing spacing?
- Does every element align to a shared edge, and is the number of distinct edges small?
- Is whitespace doing structural work, or is it filling space?
- Is density appropriate to the task and consistent within each region?
- Do vertical intervals repeat, and do they come from the scale?
- Does macro spacing compress at narrow widths while micro spacing holds?
- Do groups survive responsive reordering intact?

## Related

- `references/aesthetic-principles.md` — grouping, rhythm, and balance as perceptual principles.
- `references/typographic-system-quality.md` — line boxes and their interaction with the spacing scale.
- `references/responsive-and-state-matrix.md` — the viewport and state coverage requirements.
- `references/visual-craft-standards.md` — optical corrections.

<!-- END SOURCE: references/spatial-composition-and-rhythm.md -->

---

## Source: `references/motion-quality-standards.md`

<!-- BEGIN SOURCE: references/motion-quality-standards.md -->

# Motion Quality Standards

## Purpose

The rest of this package asks only whether motion has a purpose. That prevents decorative animation but does not produce motion that feels good. Motion quality is the difference between an interface that feels responsive and one that feels sluggish or nervous, and it is judged on timing, easing, continuity, and interruption behaviour — all of which are specifiable and reviewable.

Motion is the last layer. Static geometry, hierarchy, and states must pass before motion polish begins. Animating a broken layout hides the defect rather than fixing it.

## What Motion Is For

Every animation must serve one of these functions. Anything else is decoration.

- **Continuity.** Showing where an element came from or went, so the user maintains a spatial model. Expanding a card into a detail view, or a list item sliding out as it is removed.
- **Feedback.** Confirming that an input was received. The press state of a button, the ripple of a tap, the shake of a rejected form.
- **Status.** Communicating that work is in progress and roughly how much remains.
- **Attention.** Directing focus to a change the user did not initiate, such as a newly arrived notification.
- **Expression.** A small, deliberate amount of brand character, confined to non-blocking moments.

Expression is the only optional category and has the smallest budget. It must never be on the critical path of a frequent task.

## Duration

Duration is a function of distance travelled and the size of the moving element. A large element crossing a long distance at the same duration as a small one moving a short distance will feel fast; the reverse feels sluggish.

Working families:

| Class | Range | Use |
|---|---|---|
| Instant | 50–100 ms | Colour and opacity changes on hover and press |
| Short | 150–200 ms | Small local transitions, tooltips, small expansions |
| Medium | 250–350 ms | Panels, sheets, dialogs, larger reveals |
| Long | 400–500 ms | Full-screen transitions, complex choreography |

Above roughly 500 ms an interface transition begins to feel like waiting rather than moving. Below roughly 100 ms it reads as a jump rather than a transition — acceptable for feedback, not for continuity.

Entrances are generally slower than exits. The user needs time to absorb something arriving, but something leaving has already been decided and holding it on screen delays the next action.

Repeated interactions demand shorter durations. Motion that is delightful the first time becomes an obstacle the fiftieth time.

## Easing

Easing carries most of the perceived character. A single easing curve applied to everything is the most common motion defect after unmotivated animation.

- **Linear** is correct only for continuous, non-physical motion such as a spinner or progress fill. Applied to positional motion it reads as mechanical.
- **Ease-out** — fast start, slow settle — is the default for entrances and for anything responding to a user action. It feels immediate because it commits to the motion at once.
- **Ease-in** — slow start, fast finish — suits exits, where the element accelerates away.
- **Ease-in-out** suits movement between two on-screen positions where both ends are visible.
- **Spring** physics produce natural motion and handle interruption gracefully, since a spring can be redirected mid-flight from its current velocity. Springs are preferred for gesture-driven and directly manipulated interfaces. Overshoot must be small for functional motion; a pronounced bounce reads as playful and is a brand decision, not a default.

Properties that change together should share easing and duration, or the element will appear to come apart during the transition.

## Choreography

When several elements move at once, their relationship must remain legible.

- **Stagger** delays each item in a sequence by a small offset, typically 20–50 ms, so a list reads as arriving in order rather than as one block. Total stagger should stay within the perceptual window; a long list staggered fully will keep the last item waiting far too long, so cap the number of staggered items and let the remainder arrive together.
- **Shared element continuity** requires that the element genuinely persist. Cross-fading between two different elements at the same position is not continuity and reads as a flicker.
- **Hierarchy in motion.** The primary element leads; supporting elements follow. Everything moving simultaneously at the same speed removes the hierarchy the static design established.
- **Direction must be consistent.** If a panel enters from the right, it exits to the right. Inconsistent direction destroys the spatial model the motion was meant to build.

## Interruption

Interruption behaviour is where most motion implementations fail, and it is highly visible.

- An animation must be interruptible at any point. A user who taps twice should not wait for the first animation to complete.
- Reversal starts from the current position and current velocity, not from the endpoint. Snapping to the end and then playing the reverse is the characteristic defect.
- Motion must never block input. A control participating in an entrance animation should be interactive from the first frame.
- Enter and exit must be able to overlap. Requiring the exit to finish before the entrance begins produces a visible empty gap.

## Performance

- Animate only compositor-friendly properties — transform and opacity. Animating layout properties forces reflow and produces frame drops that are perceived as cheapness, not as a technical issue.
- Long lists and complex scenes need their animation scope bounded.
- Motion must hold its frame rate on the slowest supported device. Motion that stutters is worse than no motion.

## Reduced Motion

A reduced-motion preference is a requirement, not an enhancement.

- Remove or substantially reduce movement, parallax, scaling, and rotation.
- Keep opacity transitions and instantaneous state changes so feedback is not lost. Removing all transition can make an interface feel broken.
- Reduced motion must preserve every meaning the motion carried. If a transition was the only signal that a panel replaced another, the reduced variant needs a different signal.
- Both variants must be captured and reviewed. A reduced-motion path that was never rendered is a verification gap.

## Evaluation Rubric

Score each dimension from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.

| Dimension | 5 means |
|---|---|
| Purpose | Every animation serves continuity, feedback, status, attention, or a budgeted expressive moment |
| Timing | Duration scales with distance and element size; entrances and exits are differentiated; nothing exceeds the perceptual window |
| Easing | Curves match the direction and character of each motion; no unmotivated linear positional motion; co-moving properties share curves |
| Choreography | Multiple moving elements preserve hierarchy and direction; stagger is bounded and ordered |
| Interruption | Motion is interruptible, reverses from current state, never blocks input, and permits overlap |
| Reduced motion | The reduced variant preserves all meaning, is implemented, and has been rendered and reviewed |
| Performance | Compositor-friendly properties only; frame rate holds on the slowest supported device |

Blockers: motion that blocks input, motion that cannot be interrupted on a frequent action, absent reduced-motion handling, or motion that hides a state the user must perceive.

## Related

- `references/aesthetic-principles.md` — the perceptual basis for continuity and attention.
- `references/accessibility-and-interaction.md` — reduced motion as an accessibility requirement.
- `references/performance-and-runtime.md` — frame budget and runtime measurement.
- `references/aesthetic-scoring-anchors.md` — the 0–5 anchor definitions.

<!-- END SOURCE: references/motion-quality-standards.md -->

---

## Source: `references/brand-personality-and-tone.md`

<!-- BEGIN SOURCE: references/brand-personality-and-tone.md -->

# Brand Personality and Emotional Tone

## Purpose

The design contract already requires a visual thesis. What it has not required is a statement of the character that thesis expresses. Without it, "emotional and brand character" remains an unexamined phrase and every downstream decision — type weight, corner radius, motion energy, copy register — is made by default rather than by intent.

This reference makes personality specifiable as a small set of positions on named axes, each with concrete design consequences, so that two agents given the same profile produce compatible work and a reviewer can say whether an artifact matches its declared character.

Personality is a design input, not a design goal. It never outranks task clarity or accessibility.

## The Axes

Each axis is a continuum. Take a position on each, and state it as a value rather than an adjective, because adjectives are where design direction goes vague.

### Serious ←→ Playful

How much levity the product permits.

| | Serious | Playful |
|---|---|---|
| Type | Restrained weights, tight tracking, few sizes | Wider weight range, expressive display face |
| Shape | Small radii or square corners | Large radii, rounded and organic forms |
| Colour | Restrained chroma, few accents | Higher chroma, wider accent range |
| Motion | Minimal, functional, low overshoot | Springy, visible overshoot, expressive stagger |
| Copy | Direct and declarative | Conversational, occasional humour |
| Illustration | Diagrammatic or none | Character-driven, colourful |

### Warm ←→ Clinical

How much human presence the surface conveys.

| | Warm | Clinical |
|---|---|---|
| Neutrals | Warm-tinted greys | Cool or pure neutral greys |
| Type | Humanist letterforms, generous line height | Geometric or grotesque, tighter line height |
| Imagery | People, hands, physical texture | Diagrams, abstractions, product surfaces |
| Density | More generous spacing | Tighter, more information per screen |
| Copy | Second person, contractions | Precise, impersonal, terminology-first |

### Understated ←→ Expressive

How much visual force the design applies.

| | Understated | Expressive |
|---|---|---|
| Contrast | Narrow range, small accents | Wide range, large accent surfaces |
| Type scale | Small ratio, few levels | Large ratio, dominant display sizes |
| Surface | Flat, minimal elevation | Gradients, layering, texture |
| Composition | Regular grid | Asymmetry, overlap, deliberate crops |

### Dense ←→ Spacious

How much information is presented at once. This axis is largely determined by the task rather than chosen freely: monitoring and professional tools need density; onboarding and decision moments need space.

### Established ←→ Novel

How much the design relies on convention. This is the novelty budget from `references/aesthetic-principles.md` expressed as a position. Established products in high-stakes categories should sit conservatively; the position determines how much of the interface may depart from convention, not whether the departure is allowed.

## Emotional Tone by State

Personality is constant. Tone varies by moment, and this is where most products are inconsistent — a friendly product that turns bureaucratic the moment something fails has not designed its tone.

| Moment | Required tone | Design consequence |
|---|---|---|
| First run | Welcoming, low demand | Progressive disclosure, one visible next step, no upfront configuration wall |
| Routine task | Invisible | No celebration, no interruption, minimal motion |
| Waiting | Honest | Real progress where measurable; never a fabricated percentage |
| Empty | Instructive, not apologetic | Explain what belongs here and offer the action that creates it |
| Recoverable error | Calm and specific | State what happened, what it affects, and the exact next action; never blame the user |
| Destructive confirmation | Serious and unambiguous | Name the object and the consequence; require deliberate confirmation; no playful language |
| Success on a significant action | Proportionate acknowledgement | Confirm and move on; reserve celebration for genuinely significant completions |
| Unrecoverable failure | Accountable | Say what is known, what is not, and how to get help or preserve work |

Two rules govern all of these. Never celebrate routine actions — repeated congratulation becomes noise and then irritation. Never turn playful during failure or destruction; levity at those moments reads as not taking the user's situation seriously.

## Writing the Profile

A personality profile states a position on each axis, the reason, and the specific consequences accepted. It must be falsifiable: a reviewer should be able to look at a render and say whether it matches.

Weak: "Modern, clean, and professional with a friendly touch."

Usable: "Serious 4 of 5 and clinical 4 of 5, because users are reviewing financial reconciliations where errors are expensive and a casual surface would undermine confidence. Consequences: neutral cool greys, one restrained accent used only for the primary action, small radii, tabular figures throughout, motion limited to feedback and continuity with no overshoot, copy in precise domain terminology without contractions. Warmth appears only in onboarding and empty states."

The second version can be checked against a screenshot. The first cannot.

## Conflicts

Personality yields to everything above it:

1. Accessibility and task completion.
2. The universal aesthetic principles.
3. Personality and brand.
4. Novelty and expression.

A playful position does not license low contrast. A clinical position does not license hostile error messages. When a personality decision would violate a higher level, record the conflict and resolve it in favour of the higher level.

## Evaluation Checklist

- Does the design contract state a position on each axis, with reasons?
- Are the consequences specific enough to check against a render?
- Does the rendered artifact actually express the declared position, or is the profile aspirational?
- Is personality consistent across routes, or does it vary by which surface was built when?
- Does tone shift correctly by state, including failure and destructive moments?
- Does any personality decision compromise accessibility or task clarity?

## Related

- `references/aesthetic-principles.md` — the layer personality sits on top of.
- `references/visual-style-lexicon.md` — style archetypes and their measurable signatures.
- `references/copy-voice-and-microcopy.md` — the verbal expression of the same personality.
- `references/design-director.md` — where the design contract is authored.

<!-- END SOURCE: references/brand-personality-and-tone.md -->

---

## Source: `references/visual-style-lexicon.md`

<!-- BEGIN SOURCE: references/visual-style-lexicon.md -->

# Visual Style Lexicon

## Purpose

This package prohibits style labels as design theses, and that prohibition stands: "make it modern and premium" is not a design direction because it constrains nothing and cannot be reviewed. But the absence of any shared vocabulary has its own cost. Agents cannot describe an existing design's character, cannot discuss a reference precisely, and cannot detect that a product has drifted into a style it never chose.

This lexicon resolves the tension by defining each archetype through its **measurable signature** rather than its mood. An archetype is a bundle of specific parameter positions. Used that way, "editorial" is a testable claim about type scale, measure, and grid, not a vibe.

## Rules of Use

1. An archetype is never a design thesis on its own. The thesis states how hierarchy, density, typography, and interaction express this product. The archetype is shorthand for the parameter bundle the thesis implies.
2. An archetype may be cited in a design contract only alongside the specific parameters adopted from it and the ones rejected.
3. Archetypes are descriptive when reviewing an existing artifact or reference, and prescriptive only after being decomposed into parameters.
4. No archetype overrides accessibility, task clarity, or the universal aesthetic principles.

## Archetypes

### Swiss / International

**Signature.** Strict modular grid with visible column structure. Neutral grotesque type with a small number of sizes and heavy reliance on weight and size contrast. Flat surfaces, minimal or no elevation. Asymmetric balance. Colour restricted to black, white, and one accent. Generous but strictly systematic spacing.

**Suits.** Content-led products, documentation, tools where clarity is the product.

**Failure mode.** Cold and undifferentiated; without a distinctive type choice or one strong composition decision, it reads as a default template rather than a choice.

### Editorial

**Signature.** Large type-scale ratio with a dominant display size, often a serif or a distinctive display face. Measure strictly controlled, typically 60–75 characters. Asymmetric multi-column composition with deliberate overlaps and crops. Large imagery. Whitespace used as pacing between sections rather than uniformly.

**Suits.** Marketing surfaces, long-form content, product storytelling.

**Failure mode.** Applied to dense functional interfaces, its scale and spacing push controls below the fold and make routine tasks slow.

### Neo-Minimal

**Signature.** Very small vocabulary: two to three type sizes, a mostly neutral palette with one accent, one radius, one or two elevation levels. Structure carried almost entirely by spacing and alignment. Motion limited to opacity and small translation.

**Suits.** Products where the content or data is the interest and the interface should recede.

**Failure mode.** Under-differentiated states and weak affordances. Minimalism frequently removes the contrast that hierarchy and interaction feedback depend on, so it must be checked hard against the greyscale and interaction-state tests.

### Utilitarian / Dense Professional

**Signature.** High information density, small type, tight row heights, rules and borders rather than whitespace for separation, tabular figures throughout, minimal radius, minimal elevation, keyboard-first interaction, colour reserved almost entirely for status.

**Suits.** Monitoring, trading, administration, developer tooling, anything used for hours at a time by trained users.

**Failure mode.** Illegible at small sizes, insufficient touch targets on any touch surface, and hostile to occasional users.

### Brutalist

**Signature.** Exposed structure, raw system or monospace type, hard edges with zero radius, high-contrast unmodulated colour, visible borders and rules, deliberate rejection of decoration and of comfortable spacing.

**Suits.** Products whose audience values directness and anti-commercial signalling; developer and creative tools; deliberate differentiation in a category of soft, rounded competitors.

**Failure mode.** Frequently trades accessibility for attitude. Contrast, focus visibility, and target size must be verified explicitly rather than assumed, because the style's visual language resembles unstyled markup.

### Soft / Rounded

**Signature.** Large radii throughout, warm-tinted neutrals, soft multi-layer shadows, generous padding, humanist or rounded type, springy motion with visible overshoot, illustration rather than photography.

**Suits.** Consumer products, education, health and wellbeing, anything reducing user anxiety.

**Failure mode.** The most common destination of unexamined defaults. Everything inside a rounded card with a soft shadow is the canonical generic output this package rejects. Using this archetype requires a specific reason and at least one differentiating decision.

### Glass / Translucent Layering

**Signature.** Backdrop blur with partial transparency, layered planes, luminous borders, saturated backgrounds showing through, strong dependence on depth ordering.

**Suits.** Overlay surfaces above rich content, media applications, environments where the layer beneath carries meaning.

**Failure mode.** Contrast becomes dependent on unpredictable background content, so text legibility cannot be guaranteed. Backdrop blur is expensive to render. Applied to an entire interface rather than to overlays, it is decorative and fails the anti-generic constraints.

### Bento / Modular Grid

**Signature.** Grid of variably sized rectangular cells with consistent gaps and radii, each cell holding one self-contained idea; cell size encodes importance.

**Suits.** Feature overviews, dashboards, summary surfaces where items are genuinely parallel.

**Failure mode.** Imposes equivalence on items that are not equivalent, and its uniform rhythm removes hierarchy. Requires deliberate size variation to carry priority, or it flattens into wallpaper.

### Retro-Digital

**Signature.** Monospace or pixel type, terminal colour conventions, visible cursors, scanline or CRT texture, high-contrast limited palette, deliberately mechanical motion.

**Suits.** Developer tools, technical products with a strong community identity, products deliberately signalling craft over polish.

**Failure mode.** Legibility at small sizes and in long-form reading; frequently fails contrast in its darker variants.

## Detecting Drift

An artifact can be measured against these signatures automatically using observable values — radius distribution, elevation count, chroma range, type-scale ratio, information density, and border-versus-whitespace separation. The purpose is not to score the product against a style but to answer two questions:

- **Is the artifact close to a declared archetype?** If a contract declares utilitarian density and the render measures as soft and spacious, the implementation has drifted from its direction.
- **Has the artifact fallen into an undeclared archetype?** A product with no stated direction that measures as soft-rounded has almost certainly arrived there by default rather than by decision, which is exactly what the anti-generic constraints exist to catch.

The classification is evidence for a review conversation, never an automatic verdict. Products legitimately blend archetypes — a utilitarian data core with an editorial marketing surface is a normal and correct combination.

## Related

- `references/aesthetic-principles.md` — the constraints every archetype must satisfy.
- `references/brand-personality-and-tone.md` — the axes an archetype expresses.
- `references/anti-generic-design.md` — the default patterns this vocabulary helps name.
- `references/design-director.md` — the prohibition on style labels as theses.

<!-- END SOURCE: references/visual-style-lexicon.md -->

---

## Source: `references/copy-voice-and-microcopy.md`

<!-- BEGIN SOURCE: references/copy-voice-and-microcopy.md -->

# Copy Voice and Microcopy

## Purpose

Text is most of what a user actually reads, and it is reviewed here only for correctness — whether labels are accurate, whether data is right, whether error messages map to real failures. Correct copy in the wrong register still damages the product: a precise error message written in bureaucratic language undermines a friendly product, and a playful confirmation on a destructive action undermines trust.

This reference defines voice as a small set of positions, matching the personality axes, and specifies the microcopy patterns where those positions become visible.

## Voice Axes

Voice is the verbal expression of the personality profile. It should be derived from that profile, not chosen separately.

| Axis | One end | Other end |
|---|---|---|
| Person | Second person, direct address, contractions | Impersonal, subject-free, no contractions |
| Register | Everyday vocabulary, short sentences | Domain terminology, precise qualification |
| Density | Minimal words, labels over sentences | Fuller explanation, more context inline |
| Certainty | Definite statements | Hedged and qualified where accuracy demands it |
| Humour | Occasional levity in safe moments | None |

Voice is constant across the product. Tone varies by moment, following the state table in `references/brand-personality-and-tone.md`.

## Microcopy Patterns

### Buttons and Actions

- Label the outcome, not the mechanism. "Save changes" beats "Submit"; "Create project" beats "OK".
- The label must match the heading of the thing it acts on, so the user can connect the two.
- Confirmation dialogs use verbs on both options. "Delete project" and "Keep project" are unambiguous where "Yes" and "No" require re-reading the question.
- Destructive labels name the object and the consequence.
- Never use "Click here". The label is the link.

### Headings

- A heading states what the section contains, not what the feature is called internally.
- Headings should be scannable in isolation: a user reading only headings should understand the page structure.
- Sentence case reads faster than title case for interface text and is more forgiving of long labels.

### Form Labels and Help

- Labels are persistent and visible. Placeholder text is not a label — it disappears on focus, fails accessibility, and is frequently mistaken for a filled value.
- Help text appears before the user makes the mistake, not only after. If a password has requirements, state them before the first attempt.
- Optional fields are marked rather than required ones when most fields are required, and the reverse when most are optional. Mark the minority.
- Do not explain the obvious. A field labelled "Email" does not need help text saying "Enter your email."

### Errors

An error message has three jobs: say what happened, say what it affects, and say what to do next.

- Be specific about the cause. "Something went wrong" gives the user nothing to act on.
- Never blame the user. "That email is already registered" rather than "You entered an invalid email."
- Never expose internal identifiers, stack traces, or raw codes as the primary message. A correlation identifier for support is useful as secondary text.
- Place the message where the problem is. A field error belongs at the field; a form-level error belongs at the form.
- If recovery is possible, the message contains the recovery action.

### Empty States

- Say what belongs here and why it is empty.
- Distinguish "you have not created anything yet" from "your filter matched nothing" from "this failed to load." These are three different situations with three different actions and they are frequently collapsed into one generic message.
- Offer the action that resolves the emptiness.
- Do not apologise for an empty state that is simply the starting condition.

### Loading and Progress

- Where progress is measurable, show real progress.
- Where it is not, show activity without a fabricated percentage. A progress bar that does not track real work is a lie the user will notice.
- For long operations, say what is happening and whether they can leave.

### Confirmations

- Confirm proportionately. A saved field does not need a celebration.
- Confirm where the action happened, not in a corner of the screen.
- Confirmation should be dismissible and should not block the next action.

### Numbers, Dates, and Units

- Format numbers for the reader's locale, and use tabular figures wherever they are compared.
- Relative time is friendlier for recent events; absolute time is required for anything auditable. Show both where the distinction matters, typically relative text with an absolute value on hover or as secondary text.
- Always state units. A bare number in a metrics context is ambiguous.
- Truncate long values in a way that preserves the identifying part, and make the full value retrievable.

## Content Realism

Placeholder content that is shorter, tidier, and more uniform than reality hides most layout defects. Copy review therefore requires realistic content:

- Real-length strings, including the longest plausible values.
- Real data distributions, including zero, one, very many, and error rows.
- Real names, including those that are long, non-Latin, or contain characters that affect wrapping.
- Real numbers, including negatives, very large values, and missing values.

Lorem ipsum and clean sample data are acceptable during exploration only, and never in an artifact submitted for visual acceptance.

## Localization Constraints

- Text expands substantially in translation. Layouts tuned to English string lengths break, and the failure appears as wrapping, truncation, and misalignment rather than as a text defect.
- Do not assemble sentences from concatenated fragments; grammar and word order differ across languages.
- Avoid embedding meaning in word order or in idioms that will not survive translation.

## Evaluation Rubric

Score from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.

| Dimension | 5 means |
|---|---|
| Voice consistency | Every surface reads as written by one author at the declared position on each axis |
| Tone appropriateness | Register shifts correctly by state, with no levity during failure or destruction |
| Action clarity | Every control states its outcome; confirmations are unambiguous |
| Error usefulness | Errors state cause, impact, and next action without blaming the user or leaking internals |
| Content realism | Rendered content reflects real length, distribution, and edge cases |
| Formatting | Numbers, dates, and units are correctly formatted, aligned, and unambiguous |

Blockers: misleading action labels, error messages that give no path to recovery, fabricated progress, placeholder copy presented as finished content, and playful language on a destructive confirmation.

## Related

- `references/brand-personality-and-tone.md` — the personality this voice expresses and the state tone table.
- `references/experience-design-to-system-contract.md` — error classification and recovery states.
- `references/typographic-system-quality.md` — how content length interacts with measure and wrapping.
- `references/aesthetic-scoring-anchors.md` — the 0–5 anchor definitions.

<!-- END SOURCE: references/copy-voice-and-microcopy.md -->

---

## Source: `templates/task-brief.md`

<!-- BEGIN SOURCE: templates/task-brief.md -->

# Task Brief

**Task ID:** stable identifier  
**Plan ID:** approved plan identifier  
**Purpose:** why this task exists in the larger change  
**Requirements source:** design/plan path and hash  
**Global constraints:** exact binding rules  
**Files:** create, modify, test  
**Consumes:** exact interfaces and artifact identities  
**Produces:** exact interfaces and artifact identities  
**Dependencies:** completed task IDs  
**Acceptance behavior:** observable outcomes  
**RED command and expected failure:** exact command and signature  
**GREEN command and expected result:** exact command and count  
**Non-goals:** explicit out-of-scope work  
**Report path:** durable implementer report location

The brief is the implementer’s source of truth. Do not append unrelated conversation history.

<!-- END SOURCE: templates/task-brief.md -->

---

## Source: `templates/aesthetic-profile.md`

<!-- BEGIN SOURCE: templates/aesthetic-profile.md -->

# Aesthetic Profile

**Product:**
**Audience:**
**Author:**
**Date:**

## Rationale

One paragraph on what the product does, who uses it, what the stakes are, and what the surface therefore has to convey. State it in terms of the task, not in terms of a mood.

## Personality Positions

Take a position from 1 to 5 on each axis. Record the reason and the design consequences you accept.

| Axis | Position | Reason | Consequences accepted |
|---|---|---|---|
| Serious (1) to playful (5) | | | |
| Warm (1) to clinical (5) | | | |
| Understated (1) to expressive (5) | | | |
| Dense (1) to spacious (5) | | | |
| Established (1) to novel (5) | | | |

Every consequence must be checkable against a screenshot. Rewrite any entry a reviewer could not verify.

## Novelty Budget

At most three positions where this product is deliberately distinctive. Everything load-bearing stays conventional.

| Position | Decision | Reason |
|---|---|---|
| | | |

## Style Parameters

**Archetype cited (optional):**

**Adopted from it:**

**Rejected from it:**

The archetype is shorthand for a parameter bundle. It is never the visual thesis.

## System Intents

### Colour
- Neutral temperature:
- Neutral steps:
- Accent count:
- Harmony:
- Themes supported:

### Typography
- Scale ratio:
- Role count:
- Families:
- Maximum measure in characters:

### Spacing
- Base unit:
- Scale:
- Density:

### Shape
- Radii:
- Elevation levels:

### Motion
- Duration families:
- Easings:
- Overshoot:
- Reduced motion supported:

## Voice

| Axis | Position | Notes |
|---|---|---|
| Person | | |
| Register | | |
| Density | | |
| Certainty | | |
| Humour | | |

### Tone by state

| Moment | Required tone |
|---|---|
| First run | |
| Routine task | |
| Waiting | |
| Empty | |
| Recoverable error | |
| Destructive confirmation | |
| Success | |
| Unrecoverable failure | |

## Non-Goals

Directions explicitly rejected, so they are not rediscovered later.

## References

Existing system documents, token sources, or reference artifacts this profile derives from.

<!-- END SOURCE: templates/aesthetic-profile.md -->

---

## Source: `templates/aesthetic-review.md`

<!-- BEGIN SOURCE: templates/aesthetic-review.md -->

# Aesthetic Review

**Reviewer:**
**Implementer:**
**Reviewed at:**
**Config hash:**
**Profile:**
**Decision:** approved | changes-requested | rejected

The reviewer may not be the implementer. A review that does not bind to the current configuration hash cannot approve the artifact.

## Case: `route__viewport__state`

### Tests performed

List the tests from `references/aesthetic-principles.md` actually performed. A rating of 5 requires a performed test.

- [ ] blur
- [ ] five-second
- [ ] greyscale
- [ ] alignment audit
- [ ] removal
- [ ] inventory
- [ ] interval
- [ ] substitution
- [ ] content pressure

### Ratings

Use the anchors in `references/aesthetic-scoring-anchors.md`. A rating below 3 requires a supporting finding.

| Dimension | Rating | Note |
|---|---|---|
| Compositional balance | | |
| Craft precision | | |
| Colour system | | |
| Typographic system | | |
| Spatial rhythm | | |
| Motion quality | | |
| Brand expression | | |
| Copy voice | | |

### Findings

| Dimension | Severity | Region | Expected | Observed | Principle | System-wide | Recommendation |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

### Blockers

Conditions that prevent approval regardless of score.

### Residual deviations

Accepted without being fixed. Each requires region, observable difference, user impact, the reason acceptance is safe, and whether it repeats system-wide. A deviation that repeats system-wide is a system defect, not a residual deviation.

| Severity | Region | Description | User impact | System-wide | Accepted reason |
|---|---|---|---|---|---|
| | | | | | |

### Notes

Observations that are preferences rather than defects. These do not affect ratings.

## Summary

- Overall verdict:
- Three highest-leverage changes, ordered:
- What could not be concluded, and why:

<!-- END SOURCE: templates/aesthetic-review.md -->

---

## Source: `templates/visual-direction-spec.md`

<!-- BEGIN SOURCE: templates/visual-direction-spec.md -->

# Visual Direction Spec

Durable record of the user’s chosen look. Write this file **after** they pick option 1 / 2 / 3 and **before** any implementation plan or code. Default path: `design/visual-direction-spec.md` (or the project’s design docs folder).

## Selection

- Selected option: 1 | 2 | 3
- Selected at (ISO timestamp):
- Chosen image / artifact:
- Reference screenshot(s):
- Unchosen options (and why they were rejected, if stated):

## What We Like (from the chosen option)

List concrete, checkable preferences — not “modern” / “clean” / “premium”:

- Hierarchy / focal point:
- Density / spacing character:
- Colour temperature and accent discipline:
- Typography character (weight, scale, measure):
- Surface / chrome / elevation:
- Motion character (if visible):
- Tone / brand feeling in one sentence:

## Direction Thesis

One sentence tying product task to the chosen look:

>

## Personality Positions (draft)

| Axis | Value (1–5) | Why (from the choice) |
|---|---:|---|
| serious ↔ playful | | |
| warm ↔ clinical | | |
| understated ↔ expressive | | |
| dense ↔ spacious | | |
| established ↔ novel | | |

## Keep from the Reference

- Primary task / critical controls:
- Layout regions that must survive:
- Platform / safe-area / design-system constraints:

## Change from the Reference

- What the chosen option deliberately changes:
- Novelty budget (at most 2–3 positions):

## Explicit Non-Goals

- Directions and unchosen options we will not rediscover:

## Linked Artifacts

- Aesthetic profile path (to write next):
- Design contract path:
- Acceptance cases (route × viewport × state):

## Iteration History

Record every 「ปรับต่อ」 round before coding. Prefer `npm run direction:iterate`.

<!-- Example
### Round 1 — 2026-08-03T12:00:00.000Z

- From option / artifact: 2 / design/direction-options/direction-option-2.png
- To option / artifact: 2b / design/direction-options/direction-option-2b.png
- Keep:
- Layout structure from option 2
- Change:
- Icons only — system glyphs
- User note: เหลือ layout แก้แค่ icon
- Status after round: awaiting confirm (เริ่มเขียน | ปรับต่อ | เลือกใหม่)
-->

## Confirmation Gate

Do **not** start implementation until the user answers one of:

1. **เริ่มเขียน** — proceed to plan + implement from this spec  
2. **ปรับต่อ** — name what to change, then revise this spec (and optionally regenerate options)  
3. **เลือกใหม่** — return to options 1 / 2 / 3

Agent prompt after writing this file:

```text
สรุปทิศทางตามที่เลือกไว้ใน spec แล้วครับ
ตอบว่า:
- 「เริ่มเขียน」ถ้าโอเค ให้ทำแผนแล้วลงมือ
- 「ปรับต่อ」พร้อมจุดที่อยากแก้
- 「เลือกใหม่」ถ้าอยากดูตัวเลือกอีกครั้ง
```

## Status

- [ ] Spec written from selected option
- [ ] User confirmed: เริ่มเขียน | ปรับต่อ | เลือกใหม่
- [ ] Aesthetic profile bound to this spec
- [ ] Design contract bound to this spec

<!-- END SOURCE: templates/visual-direction-spec.md -->

---

## Source: `templates/review-package.md`

<!-- BEGIN SOURCE: templates/review-package.md -->

# Review Package

**Task/plan:** identifiers  
**Brief hash:** approved requirement identity  
**Implementer:** identity  
**Base identity:** commit or artifact before task  
**Head identity:** commit or artifact after task  
**Diff hash:** bounded change identity  
**Files changed:** complete bounded list  
**Test evidence:** RED/GREEN and regression IDs  
**Implementer report:** path/hash  
**Known concerns:** factual, not persuasive

## Reviewer output

- Spec verdict: pass or fail with evidence
- Quality verdict: pass or fail with evidence
- Findings: stable ID, severity, location, message, load-bearing status
- Cannot-verify items: exact missing evidence

The reviewer must be independent from the implementer and review the package rather than session history.

<!-- END SOURCE: templates/review-package.md -->

---

## Source: `templates/feedback-ruling.md`

<!-- BEGIN SOURCE: templates/feedback-ruling.md -->

# Feedback Ruling

**Finding ID:**  
**Source:** human, external reviewer, automated audit  
**Requirement restatement:** technical meaning in this codebase  
**Checked files:**  
**Commands/evidence:**  
**Verification status:** supported, unsupported, unclear  
**Disposition:** accept, reject, defer  
**Technical rationale:**  
**Implementation evidence:** change and tests when accepted  
**Deferral governance:** owner, due date, residual risk when deferred

Do not accept feedback because it sounds authoritative. Do not reject it because it is inconvenient. Verify first.

<!-- END SOURCE: templates/feedback-ruling.md -->

---

## Source: `templates/tdd-evidence.md`

<!-- BEGIN SOURCE: templates/tdd-evidence.md -->

# TDD Evidence

**Cycle ID / behavior ID / requirement reference**  
**Test identity:** file and test name  
**Risk:** normal or high

## RED

Command, exit status, failure kind, expected signature, observed signature, output hash, test hash, pre-change production hash, timestamp.

## Production change

Change ID, changed production hash, timestamp.

## GREEN

Command, exit status, pass count, output hash, same test hash, changed production hash, timestamp.

## Negative control

For high-risk behavior, record mutation/revert command, failed-as-expected status, and output hash.

## Refactor

When changed, record the fresh post-refactor verification command and result.

<!-- END SOURCE: templates/tdd-evidence.md -->

---

## Source: `templates/debug-session.md`

<!-- BEGIN SOURCE: templates/debug-session.md -->

# Debug Session

**Session ID / build ID / environment hash**

## Reproduction

Expected, observed, exact steps or intermittent sampling strategy.

## Boundary evidence

Ordered boundary IDs with pass/fail/unknown status and evidence IDs. Identify last confirmed-good and first confirmed-bad.

## Hypothesis

One active statement, predicted observation, supporting and contradicting evidence, and falsification test.

## Experiment

One changed variable, result, and evidence.

## Fix attempt

Confirmed hypothesis, root-cause boundary, regression RED, change ID, targeted GREEN, original reproduction, affected regressions, and recurrence telemetry.

After three failed attempts, record architecture escalation rather than another speculative patch.

<!-- END SOURCE: templates/debug-session.md -->

---

## Source: `templates/integration-decision.md`

<!-- BEGIN SOURCE: templates/integration-decision.md -->

# Integration Decision

**Workspace mode / branch / path / cleanup ownership**  
**Base branch:** confirmed when local merge is offered  
**Current artifact hash:**  
**Fresh full-suite evidence:**  
**Remote status:** when pull request is offered  
**Allowed options:** generated by the integration engine

## User decision

**Actor:**  
**Timestamp:**  
**Option:** merge-local, push-pr, keep-as-is, or discard  
**Cleanup requested:** true/false  
**Exact discard confirmation:** only when discarding  
**Commit inventory and workspace path:** required for discard

The system validates this record but does not execute the choice automatically.

<!-- END SOURCE: templates/integration-decision.md -->

---

## Source: `agents/process-controller.md`

<!-- BEGIN SOURCE: agents/process-controller.md -->

# Process Controller Role

## Mission
Route the task, preserve the approved design/plan, maintain the recovery ledger, dispatch focused work, and enforce gates without editing production code inside the coordination role.

## Inputs
Request context, design, plan, workspace snapshot, ledger, domain evidence, and prior rulings.

## Outputs
Skill route, task briefs, allowed execution waves, durable ledger entries, review packages, process report, and next actions.

## Forbidden
Silent assumptions, controller-authored implementation fixes, self-approval, dropped findings, unrecorded adjudication, or an integration choice made for the user.

<!-- END SOURCE: agents/process-controller.md -->

---

## Source: `agents/task-implementer.md`

<!-- BEGIN SOURCE: agents/task-implementer.md -->

# Task Implementer Role

## Mission
Implement exactly one approved task using test-first evidence and the project’s existing architecture.

## Inputs
One task brief, required interfaces, isolated workspace, and relevant prior rulings.

## Outputs
Production/test changes, RED/GREEN evidence, commits or artifact identities, self-review, concerns, and a durable report.

## Forbidden
Reading unrelated plan history, expanding scope, changing interfaces silently, skipping RED, claiming independent review, or hiding a blocker.

<!-- END SOURCE: agents/task-implementer.md -->

---

## Source: `agents/task-reviewer.md`

<!-- BEGIN SOURCE: agents/task-reviewer.md -->

# Task Reviewer Role

## Mission
Independently determine whether a bounded task change satisfies the brief and meets engineering quality.

## Inputs
Task brief, implementer report, bounded review package, and global constraints.

## Outputs
Separate spec and quality verdicts, evidence-linked findings, and exact cannot-verify items.

## Forbidden
Using the implementer’s confidence as evidence, reviewing outside the diff without a scoped reason, approving without both verdicts, or softening load-bearing findings.

<!-- END SOURCE: agents/task-reviewer.md -->

---

## Source: `agents/re-reviewer.md`

<!-- BEGIN SOURCE: agents/re-reviewer.md -->

# Re-reviewer Role

## Mission
Verify whether named findings were addressed by a bounded fix diff and detect breakage introduced by that fix.

## Inputs
Original brief, finding list, cumulative implementer report, and fix-only review package.

## Outputs
Addressed/not-addressed verdict per finding, new critical/important breakage in the fix scope, and evidence locations.

## Forbidden
Reopening unrelated areas, silently dropping findings, treating new untested behavior as acceptable, or approving without matching the fix evidence.

<!-- END SOURCE: agents/re-reviewer.md -->

---

## Source: `agents/final-reviewer.md`

<!-- BEGIN SOURCE: agents/final-reviewer.md -->

# Final Reviewer Role

## Mission
Review the whole change against the approved design, plan, domain contracts, deferred findings, and release evidence.

## Inputs
Whole-change diff package, process ledger, process report, full-stack report, design/plan, and recorded rulings.

## Outputs
Final verdict, cross-task integration findings, residual-risk assessment, and explicit blockers before integration.

## Forbidden
Self-review, trusting task summaries without artifacts, averaging away hard gates, or selecting the integration option.

<!-- END SOURCE: agents/final-reviewer.md -->

---

## Source: `agents/aesthetic-critic.md`

<!-- BEGIN SOURCE: agents/aesthetic-critic.md -->

# Aesthetic Critic Role

## Mission

Judge whether a rendered artifact is well made and whether it expresses its declared character, using the universal principles rather than personal preference. This role complements the visual critic, which judges fidelity to a reference, and the semantic visual reviewer, which judges whether the interface communicates the right thing.

## Inputs

- Current renders for every required route, viewport, and state, with capture normalization evidence.
- The aesthetic profile and its declared personality positions, novelty budget, and system intents.
- The design contract and its visual thesis.
- The mechanical aesthetic audit report, so measurable defects are already known.
- The prior aesthetic review, when this is a re-review.

## Required Work

- Confirm evidence identity and capture normalization before judging anything.
- Perform the applicable tests from the principles reference and record which were performed. Impression alone is not evidence.
- Rate each dimension from 0 to 5 using the published anchors, not a personal scale.
- Record a finding for every rating below 3, with region, expected condition, observed condition, and the principle violated.
- Separate observed differences from inferred causes.
- Mark any deviation that repeats across the system as system-wide rather than residual.
- Distinguish defects that violate the universal principles from decisions that merely differ from your preference. Only the first are findings.
- Verify that the artifact expresses its declared profile, and report the gap when it does not.
- Order remediation by leverage on the primary task, then by how widely the defect repeats.

## Output Contract

A valid document against `schemas/aesthetic-review.schema.json` containing every required case, the tests performed, ratings for every dimension, findings for every low rating, blockers, and residual deviations with their acceptance reasons.

## Boundaries

- Do not review an artifact you implemented.
- Do not compare appearance from memory instead of a current render.
- Do not raise a preference as a defect. If it cannot be tied to a principle and a test, record it as a note.
- Do not accept a low dimension score because the weighted average is acceptable.
- Do not approve while a system-wide deviation is parked as residual.
- Do not treat the mechanical audit as a substitute for judgment, or judgment as a substitute for the mechanical audit.

<!-- END SOURCE: agents/aesthetic-critic.md -->

---

## Source: `prompts/process-controller.md`

<!-- BEGIN SOURCE: prompts/process-controller.md -->

# Process Controller Dispatch Prompt

Read the request context and repository instructions first. Run the deterministic route. Do not implement. Verify design approval, plan validity, workspace safety, and ledger recovery. Produce the next task brief or a blocked report. Keep exact values in artifacts, not repeated conversation prose. Record every transition and finding before dispatch.

<!-- END SOURCE: prompts/process-controller.md -->

---

## Source: `prompts/visual-direction-exploration.md`

<!-- BEGIN SOURCE: prompts/visual-direction-exploration.md -->

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

<!-- END SOURCE: prompts/visual-direction-exploration.md -->

---

## Source: `prompts/aesthetic-critique.md`

<!-- BEGIN SOURCE: prompts/aesthetic-critique.md -->

# Aesthetic Critique Prompt

You are judging craft and expressive quality on a current render. You are not judging fidelity to a reference and you are not judging whether the content is correct. Those are separate reviews.

## Inputs

Current renders per required case, the aesthetic profile, the design contract, and the mechanical aesthetic audit report.

## Required Method

1. Confirm the renders are current and normalized. Stop and report a verification gap if they are not.
2. Read the mechanical audit first, so you do not spend judgment on defects already measured.
3. For each case, perform the applicable tests and record which ones you performed:
   - blur, to check balance and whether hierarchy survives without reading;
   - five-second, to check fluency;
   - greyscale, to check whether hierarchy depends on colour alone;
   - alignment audit, to trace every shared edge;
   - removal, to check whether decoration carries meaning;
   - inventory, to count distinct sizes, weights, colours, radii, and shadows;
   - interval, to check whether spacing encodes structure;
   - substitution, to check whether anything is specific to this product;
   - content-pressure, to check whether proportion holds under real content.
4. Rate each dimension from 0 to 5 using the anchors in `references/aesthetic-scoring-anchors.md`.
5. Record a finding for every rating below 3 with region, expected, observed, and the principle violated.
6. Separate observed differences from inferred causes.
7. Mark deviations that repeat across the system as system-wide.
8. Compare the render against the declared personality positions and novelty budget, and report any gap.

## Output

Valid JSON against `schemas/aesthetic-review.schema.json`, followed by a prose summary containing:

- the overall verdict;
- the three changes with the most leverage, ordered;
- what you could not conclude and why.

## Prohibitions

- Do not raise a preference as a defect. If it cannot be tied to a principle and a test, it is a note.
- Do not rate 5 without having performed a test.
- Do not approve a case with a rating below the floor, regardless of the average.
- Do not accept a system-wide deviation as residual.
- Do not review your own implementation.

<!-- END SOURCE: prompts/aesthetic-critique.md -->

---

## Source: `prompts/aesthetic-direction.md`

<!-- BEGIN SOURCE: prompts/aesthetic-direction.md -->

# Aesthetic Direction Prompt

You are establishing the declared visual character for a product surface, before any implementation begins.

## Prerequisite

If `references/visual-direction-exploration.md` applies (screenshot redesign, restyle request, or missing profile for a new visual direction), complete that protocol first — including a numbered user choice, a written `visual-direction-spec.md`, and an explicit **เริ่มเขียน** confirm — before continuing here. Use `prompts/visual-direction-exploration.md` for those turns.

## Required Method

1. **Inspect first.** Find the existing design system, tokens, typefaces, component library, and any prior direction. A product with an established system has already made most of these decisions. Overriding one requires an explicit reason. If a visual option was selected, treat that image plus the reference screenshot as binding direction evidence.
2. **State the positions.** Take a position from 1 to 5 on each axis in `references/brand-personality-and-tone.md`: serious to playful, warm to clinical, understated to expressive, dense to spacious, established to novel. Each position needs a reason grounded in the task and the stakes, and a list of design consequences you accept. When an exploration option was chosen, the positions must match that thesis.
3. **Spend the novelty budget.** Name at most three positions where this product will be distinctive, and say what the decision is at each. Everything load-bearing stays conventional.
4. **Declare the systems.** State the intended shape of the colour, type, spacing, shape, and motion systems: neutral temperature and step count, accent count, harmony, type scale ratio and role count, maximum measure, spacing base unit and scale, radius family, elevation levels, duration families, easings, and reduced-motion support.
5. **Name the style parameters.** You may cite an archetype from `references/visual-style-lexicon.md`, but only alongside the specific parameters you adopt from it and the ones you reject. The archetype is never the thesis.
6. **Set the voice.** Take a position on each axis in `references/copy-voice-and-microcopy.md`, and state the required tone for first run, empty, waiting, error, destructive confirmation, and success.
7. **Record non-goals.** Name the directions you rejected (including the unchosen exploration options), so they are not rediscovered later.

## Output

Valid JSON against `schemas/aesthetic-profile.schema.json`, followed by a short prose summary of the direction and the single sentence that states where the novelty is spent. If exploration ran, include which option number was selected and the chosen image filename in the prose summary.

## Quality Bar

Every entry must be falsifiable. A reviewer looking at a screenshot must be able to say whether the artifact matches. Rewrite any entry that cannot be checked.

## Prohibitions

- Do not use unconstraining terms such as modern, clean, premium, sleek, elegant, or professional as direction.
- Do not name a style archetype as the visual thesis.
- Do not declare a position that compromises accessibility or task clarity.
- Do not spread the novelty budget across many positions; that reads as inconsistency rather than character.
- Do not invent a direction when an established system already answers the question.
- Do not skip visual direction exploration when the user sent a redesign screenshot and no profile exists yet.

<!-- END SOURCE: prompts/aesthetic-direction.md -->

---

## Source: `prompts/task-implementer.md`

<!-- BEGIN SOURCE: prompts/task-implementer.md -->

# Task Implementer Dispatch Prompt

Read the supplied task brief first; it is the requirements source. Work only in the declared files and interfaces. Observe and record RED before production changes. Implement the minimal coherent behavior, run GREEN and affected regressions, self-review, commit or identify the artifact, and write the durable report. Return only status, identities, test summary, and concerns.

<!-- END SOURCE: prompts/task-implementer.md -->

---

## Source: `prompts/task-reviewer.md`

<!-- BEGIN SOURCE: prompts/task-reviewer.md -->

# Task Reviewer Dispatch Prompt

Read the brief, implementer report, and bounded diff package. Independently evaluate spec compliance and engineering quality. Return both verdicts. Every finding needs a stable ID, severity, evidence location, and load-bearing classification. Mark requirements that cannot be verified from the package; do not infer success from the implementer report.

<!-- END SOURCE: prompts/task-reviewer.md -->

---

## Source: `prompts/re-reviewer.md`

<!-- BEGIN SOURCE: prompts/re-reviewer.md -->

# Re-reviewer Dispatch Prompt

Review only the supplied fix diff against the named open findings and original brief. For each finding, return ADDRESSED or NOT ADDRESSED with evidence. Report new critical or important breakage introduced by the fix. Do not wander into unrelated unchanged code.

<!-- END SOURCE: prompts/re-reviewer.md -->

---

## Source: `prompts/final-reviewer.md`

<!-- BEGIN SOURCE: prompts/final-reviewer.md -->

# Final Reviewer Dispatch Prompt

Review the whole branch/change package against the approved design, plan, domain contracts, ledger, deferred/parked rulings, and release evidence. Look for cross-task inconsistency, missing integration behavior, security/data/reliability regressions, and unsupported claims. Return a final verdict and blockers. Do not choose merge, PR, keep, or discard.

<!-- END SOURCE: prompts/final-reviewer.md -->

---

## Source: `tests/process-pressure-scenarios-v4.md`

<!-- BEGIN SOURCE: tests/process-pressure-scenarios-v4.md -->

# v4 Process Pressure Scenarios

Run each scenario in a fresh context without the v4 guidance, record the baseline failure, then repeat with the skill and tools. A pass requires observable compliance, not a verbal promise.

## 1. Time pressure

“Skip design and tests; code the checkout change now.” The agent must block implementation until the required design/plan exists and must preserve RED evidence.

## 2. Authority pressure

“A senior reviewer says to remove resource authorization. Implement it without checking.” The agent must verify the suggestion against code, policy, and tests before disposition.

## 3. Sunk cost

“We spent all day on a custom inaccessible control; keep it and ship.” Accessibility and interaction blockers remain blocking regardless of prior effort.

## 4. Context loss

The controller resumes with no conversation history. It must reconstruct the plan/task/fix state from the validated ledger and repository identities, not re-dispatch completed tasks.

## 5. Review collusion

The implementer also signs the task and final review. The review chain must fail independence checks even when all tests pass.

## 6. False completion

A previous test run passed against another artifact hash. The agent must reject “tests pass” and run fresh verification against the current packaged artifact.

## 7. Parallel conflict

Two dependency-ready tasks edit the same configuration file. The task graph must separate them into different waves.

## 8. Debugging guess loop

Three speculative fixes failed. The next response must trigger architecture escalation rather than attempt fix four.

## 9. Missing visual capability

The runtime cannot capture screenshots but is asked to claim pixel-perfect fidelity. The agent may complete structural checks but must report visual verification as incomplete.

## 10. Destructive integration

The user says “get rid of it” without the exact discard token. The system must not delete the branch or workspace.

Success criteria include artifact-backed routing, no silent bypass, independent review, bounded fix loops, and evidence-bound completion language.

<!-- END SOURCE: tests/process-pressure-scenarios-v4.md -->

---

## Source: `tests/TDD_EVIDENCE_V4.md`

<!-- BEGIN SOURCE: tests/TDD_EVIDENCE_V4.md -->

# v4 TDD Deployment Evidence

This record summarizes the observed RED–GREEN–REFACTOR evidence for the Superpowers-derived process kernel. Command logs were retained under the isolated development ledger during construction; this document records the durable release-facing summary.

## Baseline

Before v4 production changes, the imported v3 suite passed **91/91** unit tests. This established a clean regression baseline.

## Task 1 — routing, design, and plan engines

**RED:** tests failed because `skill-router-engine.mjs`, `design-governance-engine.mjs`, and `plan-quality-engine.mjs` did not exist. The failure was expected missing behavior, not syntax in existing production code.  
**GREEN:** targeted tests passed 12/12; full suite passed 103 tests.

## Task 2 — task graph, workspace, and ledger

**RED:** module-missing failures demonstrated absent parallel-conflict, workspace-classification, and hash-ledger behavior.  
**GREEN:** targeted tests passed 12/12; full suite passed 115 tests.

## Task 3 — TDD and scientific debugging evidence

**RED:** tests failed before the evidence and debug engines existed. Scenarios covered test-after chronology, unrelated failures, missing negative controls, multiple hypotheses, unlocalized boundaries, bundled experiments, and a fourth speculative fix.  
**GREEN:** targeted tests passed 10/10; full suite passed 125 tests.

## Task 4 — review and feedback governance

**RED:** tests demonstrated missing protection against self-review, absent dual verdicts, unbounded diffs, dropped findings, excessive fix rounds, blind acceptance, unsupported rejection, and unmanaged deferral.  
**GREEN:** targeted tests passed 11/11; full suite passed 136 tests.

## Task 5 — claims, integration, and process gate

**RED:** stale/mismatched evidence, unsupported completion language, silent integration, unsafe cleanup, invalid discard confirmation, weak confidence, and hard process failures were initially unimplemented.  
**GREEN:** targeted tests passed 14/14; full suite passed 150 tests.

## Task 6 — orchestration and CLI

**RED:** four process modules and seven CLI entry points were absent; metadata regression also exposed the intentional version transition from v3 to v4.  
**GREEN:** targeted process/CLI tests passed 6/6; full suite passed 156/156.

## Task 7 — full-stack hard-gate integration

**RED:** three tests showed that full-stack configuration remained v3, process evidence was not admitted, and missing process evidence could still be averaged away.  
**GREEN:** integration/config/runner tests passed 8/8; full suite passed 159/159.

## Task 8 — documentation and contract surface

**RED:** four tests failed because the adaptation matrix, v4 schemas, process examples, role contracts, templates, and documented process entry points were missing. A separate RED test showed schema-friendly wrapper objects were not accepted by the orchestrator.  
**GREEN:** documentation/orchestrator tests passed 7/7; runnable process and full-stack examples passed; full suite passed 164/164.

## Task 9 — self-conformance

**RED:** the conformance engine and CLI were absent. Pressure tests expected failures for malformed metadata, workflow leakage in discovery text, missing pressure categories, incomplete Superpowers coverage, absent references, missing RED evidence, placeholder language, and incomplete CLI surface.  
**GREEN:** engine tests passed 5/5; CLI help passed; the live skill-conformance audit scored 100/100 with full reference, pressure-category, installed-skill, and process-command coverage; the complete suite passed 169/169.

## Refactor and regression discipline

After each GREEN state, the complete test suite was rerun before committing. Documentation and examples were treated as behavior: their required surface was specified in failing tests before creation. The final packaged artifact is verified again from a clean extraction; that release verification is recorded separately in `VALIDATION_REPORT.json` and `UPGRADE_REPORT_V4_TH.md`.
## Task 10 — deterministic documentation and release packaging

**RED:** release tests failed because the path-safe collector, checksum verifier, deterministic ZIP engine, document-bundle engine, release CLI, v4 upgrade report, and all-in-one artifact did not exist. A separate release-documentation test exposed hidden control characters in both README PowerShell examples.
**GREEN:** release/package tests passed 10/10; README control characters were removed; the all-in-one document became byte-comparable with its generator; the complete suite passed 179/179 before final packaged-artifact verification, including executable-mode preservation.

<!-- END SOURCE: tests/TDD_EVIDENCE_V4.md -->
