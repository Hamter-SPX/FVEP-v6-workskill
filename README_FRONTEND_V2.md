# Frontend Vision Loop Pro v2.0.0

A production-grade Agent Skill and local evidence system for building, reconstructing, redesigning, and approving frontends through deterministic browser renders rather than code-only confidence.

It combines process discipline with executable tooling:

```text
repository inspection
→ design and acceptance contract
→ vertical-slice implementation
→ deterministic browser capture
→ pixel + perceptual + region comparison
→ DOM/token/interaction/performance diagnosis
→ remediation and regression loop
→ semantic visual approval
→ release quality gate
```

This package does not change the underlying model or create vision/browser capabilities that a runtime does not expose. It makes capable models and agents use available tools systematically, records the evidence, and blocks unsupported quality claims.

## What v2 Adds

Compared with v1, this release adds:

- Weighted quality score and independent evidence-confidence score
- Per-gate evidence coverage bound to every configured `route × viewport × state` case
- Perceptual image signatures and region-weighted visual comparison
- Required-region geometry validation
- Approved baseline manifests with SHA-256, config identity, approver, reason, and Git provenance
- Semantic visual review bound to the current config hash and complete case matrix
- DOM overlap, text clipping, fixed obstruction, heading outline, image sizing, and token evidence
- Accessible-name, hit-target, nested-control, duplicate-ID, keyboard, focus, hover, and focus-state analysis
- Performance budgets for LCP, CLS, event duration, long tasks, bytes, requests, DOM size, and image dimensions
- Content-pressure breakpoint discovery
- Design-token drift against live or stored approved references
- Root-cause-oriented remediation plans
- Run history with improvement, regression, and stagnation detection
- CI quality-gate command and GitHub Actions template
- Specialized Agent role contracts, prompts, rubrics, schemas, and evidence templates

## Requirements

- Node.js 20 or later
- A runnable target web application
- Playwright-supported browser
- Repository commands for typecheck, lint, tests, and build when those gates apply

## Install

```bash
unzip frontend-vision-loop-pro-v2.0.0.zip
cd frontend-vision-loop-pro-v2
npm install
npx playwright install chromium
cp vision-loop.config.example.json vision-loop.config.json
```

The package pins direct dependency versions. Keep the generated lockfile in the destination repository when reproducibility matters.

## Fidelity Modes

| Mode | Use |
|---|---|
| `exact-reference` | Reconstruct an approved visual target; baseline integrity and major visual deltas block approval |
| `brand-consistent` | Adapt composition while preserving an existing brand and design system |
| `original-direction` | Create a new direction from product goals; semantic review supplies the visual-intent acceptance layer |

## Acceptance Matrix

The core evidence identity is:

```text
route × viewport × state
```

Each case receives a stable key such as:

```text
checkout__mobile__validation-error
```

Define real states, not only the default screen. State setup supports query parameters, local/session storage, cookies, click, fill, press, select, check, hover, focus, wait, scroll, and trusted page evaluation.

## Basic Workflow

### 1. Configure

Edit `vision-loop.config.json`:

- Application and optional reference URLs
- Runtime normalization
- Routes, viewports, and states
- Important visual regions
- Accessibility, interaction, performance, token, breakpoint, and quality policy
- Engineering commands
- Baseline and semantic-review policy

Validate the package and example configuration:

```bash
npm run validate
```

### 2. Capture Current Evidence

```bash
npm run capture -- --config vision-loop.config.json --mode current
```

When a live reference environment exists:

```bash
npm run capture -- \
  --config vision-loop.config.json \
  --mode reference \
  --base-url http://127.0.0.1:4000
```

### 3. Run the Complete Automated Loop

```bash
npm run vision-loop -- --config vision-loop.config.json
```

The command runs enabled evidence engines, writes the quality dashboard and remediation plan, and exits nonzero when the automated gate fails.

### 4. Promote an Approved Exact-Reference Baseline

Baseline promotion is an explicit acceptance action, not an automatic test repair:

```bash
npm run baseline:promote -- \
  --config vision-loop.config.json \
  --approved-by "Design Lead" \
  --reason "Accepted release target"

npm run baseline:verify -- --config vision-loop.config.json
```

### 5. Record Semantic Visual Approval

```bash
npm run review:create -- \
  --config vision-loop.config.json \
  --reviewer "Design Lead"
```

Review every generated case, record ratings and deviations, then set the evidence decision according to the actual result.

```bash
npm run review:validate -- --config vision-loop.config.json
npm run vision-loop -- --config vision-loop.config.json --skip-capture
```

### 6. Enforce Final Release Decision

```bash
npm run quality-gate -- --config vision-loop.config.json
```

For intermediate CI branches that intentionally lack semantic approval:

```bash
npm run quality-gate -- --config vision-loop.config.json --automated-only
```

Automated-only success is not final design approval.

## Commands

| Command | Purpose |
|---|---|
| `npm run capture` | Current/reference screenshots and capture metadata |
| `npm run compare` | Pixel, perceptual, region, geometry, JSON, and HTML comparison |
| `npm run inspect` | DOM, styles, overflow, clipping, overlaps, headings, images |
| `npm run audit:a11y` | Axe and keyboard/focus evidence |
| `npm run audit:performance` | Browser performance and declared budgets |
| `npm run inspect:interactions` | Names, hit targets, nesting, duplicate IDs |
| `npm run crawl:states` | Rest/hover/focus style evidence |
| `npm run discover:breakpoints` | Content-pressure layout transitions and overflow boundaries |
| `npm run tokens` | Token extraction and stored/live drift comparison |
| `npm run engineering` | Repository-defined type, lint, test, build commands |
| `npm run baseline:promote` | Copy reviewed current evidence to approved reference and create manifest |
| `npm run baseline:verify` | Verify hashes, config identity, and approval metadata |
| `npm run review:create` | Generate complete semantic-review case skeleton |
| `npm run review:validate` | Validate approval, freshness, hash, coverage, ratings, and blockers |
| `npm run vision-loop` | Orchestrate enabled evidence and write final reports |
| `npm run quality-gate` | Enforce automated or final release policy |
| `npm run validate` | Static structure, syntax, unit tests, JSON, and package checks |

All browser commands accept case filters where applicable:

```bash
npm run vision-loop -- \
  --config vision-loop.config.json \
  --route dashboard \
  --viewport mobile \
  --state error
```

## Quality Model

Default weights:

| Gate | Weight |
|---|---:|
| Visual | 30 |
| Responsive | 15 |
| Accessibility | 15 |
| Runtime | 10 |
| Engineering | 15 |
| Performance | 10 |
| Interaction | 5 |

The package reports both:

- **Quality score:** result quality supported by available evidence
- **Evidence confidence:** completeness of applicable evidence

A passing average cannot override a hard gate. Missing evidence reduces confidence rather than silently receiving a pass. Each case-oriented gate records expected, covered, missing, unexpected, and duplicate case keys, so one successful desktop check cannot imply complete mobile/state coverage.

## Semantic Visual Dimensions

Every required case is rated on:

1. Hierarchy
2. Composition
3. Typography
4. Color and surface
5. Content fidelity
6. Asset fidelity
7. Responsive composition
8. Interaction clarity

Approval requires explicit `approved` decision, current config hash, fresh timestamp, complete case coverage, no unresolved blocker, and minimum weighted score.

## Artifact Layout

```text
artifacts/vision-loop/
├── reference/
├── current/
├── diff/
├── metadata/
├── inspection/
├── accessibility/
├── interaction/
├── state-crawler/
├── performance/
├── tokens/
├── runtime/
└── reports/
    ├── comparison.html
    ├── comparison.json
    ├── run-summary.html
    ├── run-summary.md
    ├── run-summary.json
    ├── remediation.md
    ├── remediation.json
    ├── provenance.json
    ├── run-history.json
    ├── breakpoints.json
    └── token-drift.json
```

## Multi-Agent Operation

`agents/` defines independent roles for repository exploration, design direction, implementation, visual criticism, accessibility/interaction review, and release verification. Use them with subagents when the runtime supports independent contexts. Otherwise execute the roles sequentially and do not let the implementation pass double as the final review.

## CI

A GitHub Actions template is included at `.github/workflows/frontend-vision-loop.yml`. Adapt the application start command, path, and port to the destination repository. CI deliberately never updates baselines automatically.

## Security and Privacy

Browser evidence may contain screenshots, DOM text, URLs, console output, storage-derived state, and environment/Git metadata. Use non-sensitive fixtures and authorized environments. The trusted config action `evaluate` runs JavaScript in the target page. Read `SECURITY.md` before accepting configuration from another source.

## Verification Scope

The package can statically verify its own JavaScript, unit tests, configuration parsing, schemas, manifests, and ZIP integrity. Browser end-to-end proof still requires installed dependencies and an actual target application. The validation report states this boundary explicitly rather than treating an unavailable target as a pass.

## Key Documents

- `SKILL.md` — Agent workflow and non-negotiable rules
- `ARCHITECTURE.md` — system architecture and trust boundaries
- `MIGRATION_V1_TO_V2.md` — migration guidance
- `references/` — visual, design, engineering, baseline, semantic, and CI guidance
- `agents/` — specialized role contracts
- `prompts/` — reviewer and diagnostic prompts
- `templates/` — design, evidence, handoff, approval, and iteration records
- `schemas/` — config, review, baseline, design contract, and delta schemas
- `tests/pressure-scenarios.md` — discipline tests under time and quality pressure
