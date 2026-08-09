# Golden Path Walkthrough — the slugify toy

A real, end-to-end run of [`GOLDEN_PATH.md`](../../GOLDEN_PATH.md) on the
smallest project that still deserves the path’s discipline: one pure JS
helper (`src/slug.js`) with a five-case behavioral contract
(`test/slug.test.mjs`), zero runtime dependencies.

**Every command below was actually executed** against the contents of this
directory on 2026-08-09 (`node v26.5.0`, `npm 11.17.0`, `Darwin arm64`);
output tails are pasted verbatim. Gates 0–6 were executed; gates 7–8 are
documented with their real commands but intentionally not executed, because
they are human decisions. See “Honesty notes” at the bottom for what was
cleaned up afterwards (the toy’s `.git`) and how to re-verify everything
yourself.

Layout: the toy is this directory (plus a nested `.git` at run time, removed
after the walkthrough — see notes); the recorded contracts live in `.fvep/`;
the audit reports the gates produced live in `.fvep/reports/`.

---

## Gate 0 — Route (`flow/using-one-framework.md`)

The raw request: *“implement a slugify helper function with tests”*.

```console
$ npm run mode -- resolve "implement a slugify helper function with tests" --json
{
  "mode": "implement",
  "confidence": "high",
  "needsConfirmation": false,
  "reason": "Matched: implement.",
  ...
  "flow": "flow/subagent-driven-development.md",
  "flowCompanions": [
    "flow/executing-plans.md",
    "flow/test-driven-development.md",
    "flow/using-git-worktrees.md",
    "flow/dispatching-parallel-agents.md"
  ]
}
exit=0
```

First routing attempt, with the request file still telling the truth about
“now” (`stage: discovery`, `creative: true`, no approved design, no plan):

```console
$ npm run process:route -- --input request.discovery.json
{
  "status": "blocked",
  "ok": false,
  "score": 50,
  ...
  "hardFailures": [
    { "code": "DESIGN_APPROVAL_REQUIRED",
      "severity": "blocker",
      "message": "Creative or architectural work requires an approved design before implementation.",
      "remediation": "Complete design governance and record approval." }
  ],
  "required": ["using-superpowers", "brainstorming", "writing-plans", "using-git-worktrees"],
  ...
}
exit=0
```

The router bound the discovery skills and **named the missing artifact**: an
approved design. Note the honest sharp edge: `status: "blocked"` with exit
code 0 — read the report, not just `$?`. (The discovery-stage request file is
not kept; `.fvep/request.json` holds the final, fully-declared version.)

## Gate 1 — Direction (optional, visual UI work only)

Not applicable: a pure helper has no visual surface. Skipping this gate is an
explicit decision, exactly as `flow/brainstorming.md` prescribes for
non-visual work — there is no silent skip, just nothing to be opinionated
about with colors.

## Gate 2 — Design contract (`flow/brainstorming.md`)

`.fvep/design.json` was written and approved (`approval.status: "approved"`,
approaches compared, fallback decision recorded), and `.fvep/request.json`
was updated to `hasApprovedDesign: true`. Re-routing:

```console
$ npm run process:route -- --input examples/golden-path/.fvep/request.json --output examples/golden-path/.fvep/reports/route.report.json
…/examples/golden-path/.fvep/reports/route.report.json
exit=0
```

```console
report: { "status": "pass", "ok": true,
  "required": ["using-superpowers", "brainstorming", "writing-plans", "using-git-worktrees",
               "executing-plans", "test-driven-development", "verification-before-completion"] }
```

No `DESIGN_APPROVAL_REQUIRED`, and the skill set now includes the
implementation disciplines.

## Gate 3 — Plan (`flow/writing-plans.md`)

`.fvep/plan.json` (one task: create `src/slug.js`, pinned by
`test/slug.test.mjs`, steps write-failing-test → verify-red → implement →
verify-green → commit):

```console
$ npm run process:plan -- --input examples/golden-path/.fvep/plan.json --output examples/golden-path/.fvep/reports/plan.report.json
…/examples/golden-path/.fvep/reports/plan.report.json
exit=0
```

```console
report: { "status": "pass", "quality": { "score": 100, "ok": true }, "graph": { "ok": true } }
```

## Gate 4 — Isolation (`flow/using-git-worktrees.md`)

Real isolation executed (commands, June-free and unpretty):

```console
$ git init -b main && git add package.json && git commit -m "chore: toy scaffold (package.json only)"
$ git switch -c feature/slugify-helper
Switched to a new branch 'feature/slugify-helper'
```

A feature branch in a normal repo is enough here — single author, zero shared
files — and the workspace engine agrees:

```console
$ npm run process:workspace -- --cwd examples/golden-path --output examples/golden-path/.fvep/reports/workspace.report.json
…/examples/golden-path/.fvep/reports/workspace.report.json
exit=0
```

```console
report: { "status": "pass", "ok": true, "mode": "normal-repo",
  "branch": "feature/slugify-helper", "implementationAllowed": true }
```

The recorded snapshot `.fvep/workspace.json` (machine paths normalized to
`/toy-repo`) replays to the identical classification via
`npm run process:workspace -- --input examples/golden-path/.fvep/workspace.json`.

## Gate 5 — Implement, TDD loop (`flow/test-driven-development.md`)

**RED** — `test/slug.test.mjs` written first, `src/slug.js` not yet existing:

```console
$ node --test test/slug.test.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/examples/golden-path/src/slug.js' imported from '…/examples/golden-path/test/slug.test.mjs'
ℹ tests 1
ℹ pass 0
ℹ fail 1
exit=1   # 2026-08-09T09:28:46Z
```

**GREEN** — `src/slug.js` implemented, same test file untouched:

```console
$ node --test test/slug.test.mjs
ℹ pass 5
ℹ fail 0
exit=0   # 2026-08-09T09:29:31Z
```

```console
$ npm install --package-lock-only   # real zero-dependency lockfile
$ git add -A && git commit -m "feat: add slugify helper with TDD evidence"
$ git log --oneline
3ee16c4 feat: add slugify helper with TDD evidence
a97f087 chore: toy scaffold (package.json only)
```

Evidence recorded with real hashes in `.fvep/tdd-evidence.json`
(`outputHash`/`testHash`/`productionHash` are sha256 of the actual captured
outputs and files — `red.productionHash` is the sha256 of empty input,
`e3b0c44…`, because `src/slug.js` did not exist at RED time):

```console
$ npm run process:tdd -- --input examples/golden-path/.fvep/tdd-evidence.json --output examples/golden-path/.fvep/reports/tdd.report.json
…/examples/golden-path/.fvep/reports/tdd.report.json
exit=0
```

```console
report: { "status": "pass", "ok": true,
  "cycles": [{ "id": "cycle-1", "classification": "test-first", "accepted": true, "findingCodes": [] }] }
```

**Review evidence** — the diff was captured for the record
(`.fvep/change.diff`, sha256 `f4ac4d8e…`) and an independent-identity review
chain was validated:

```console
$ npm run process:review -- --input examples/golden-path/.fvep/review-chain.json --output examples/golden-path/.fvep/reports/review.report.json
…/examples/golden-path/.fvep/reports/review.report.json
exit=0
```

```console
report: { "status": "pass", "ok": true, "score": 100, "independentReview": true }
```

(On a solo walkthrough the reviewer identity is a deliberate second pass by
the same human wearing a different hat; the engine enforces that it is a
*different identity*, and on any team it is a different reviewer.)

## Gate 6 — Quality gate

First the governed-process audit over the full contract set:

```console
$ npm run process:audit -- --config examples/golden-path/.fvep/process.config.json
…/examples/golden-path/.fvep/artifacts/process-report.json
…/examples/golden-path/.fvep/artifacts/process-report.md
exit=0
```

```console
process report: { "releaseEligible": true, "qualityScore": 100, "evidenceConfidence": 100, "hardFailures": [] }
  routing pass | design pass | plan pass | taskGraph pass | workspace pass
  ledger pass | tdd pass | review pass | claims pass
  integration decision-required  ← gate 8 stays human
```

Then the full-stack gate over the scoped config (`fullstack.config.json` —
frontend/api/data/resilience/observability marked `required: false` because
this library genuinely has none of those surfaces; security scoped to the one
control that applies, `inputValidation`):

```console
$ npm run audit:fullstack -- --config examples/golden-path/fullstack.config.json
Full-stack gate: PASS
Quality: 100/100
Evidence confidence: 100%
JSON: …/examples/golden-path/artifacts/fullstack-audit/reports/fullstack-report.json
exit=0
```

```console
$ npm run fullstack:quality-gate -- --report examples/golden-path/artifacts/fullstack-audit/reports/fullstack-report.json
Full-stack quality gate: PASS
Quality score: 100/100
Evidence confidence: 100%
Hard failures: none
exit=0
```

Sections: process pass, architecture pass, security pass, dependencies
pass (real lockfile verified against the manifest), risks pass;
verificationGaps: none.

## Gates 7–8 — documented, not executed (human decisions)

**Gate 7 — verify claims** (`flow/verification-before-completion.md`). The
artifacts exist: `.fvep/claims.json` binds `claim-tests` to
`.fvep/evidence.json`’s full-suite passing run, hash-bound to
`sha256(src/slug.js)`; the claims section of the gate-6 process audit passed
under a fixed freshness policy (`policy.claims.now` pinned at run date —
deterministic on replay). What remains is the adversarial self-pass a human
performs before presenting, planned then audited:

```console
$ npm run recheck -- plan --mode ship        # prints the checks + questions to answer in writing
$ npm run recheck -- audit --record .fvep/recheck.json   # exits 1 until the record proves the pass happened
```

**Gate 8 — integrate** (`flow/finishing-a-development-branch.md`). The
decision inputs exist: `.fvep/integration.json` (branch, base, verification,
commit inventory with the real commit ids above). The engine validates and
computes allowed options; a human merges, opens the PR, keeps, or explicitly
discards:

```console
$ npm run process:integration -- --input examples/golden-path/.fvep/integration.json
(status: decision-required — allowedOptions computed, never executed for you)
```

## Re-verify this walkthrough yourself

The toy’s `.git` was removed after the run, but every committed contract
replays deterministically — from the **repository root**:

```console
$ npm run process:route -- --input examples/golden-path/.fvep/request.json
$ npm run process:plan -- --input examples/golden-path/.fvep/plan.json
$ npm run process:workspace -- --input examples/golden-path/.fvep/workspace.json
$ npm run process:tdd -- --input examples/golden-path/.fvep/tdd-evidence.json
$ npm run process:review -- --input examples/golden-path/.fvep/review-chain.json
$ npm run process:audit -- --config examples/golden-path/.fvep/process.config.json
$ npm run audit:fullstack -- --config examples/golden-path/fullstack.config.json
$ npm run fullstack:quality-gate -- --report examples/golden-path/artifacts/fullstack-audit/reports/fullstack-report.json
$ (cd examples/golden-path && npm test)
```

Independent hash checks: `sha256sum examples/golden-path/src/slug.js` must
equal the `artifactHash` in `.fvep/claims.json`; `sha256sum
examples/golden-path/.fvep/change.diff` must equal the `diffHash` in
`.fvep/review-chain.json`; `sha256sum examples/golden-path/.fvep/brief.md`
must equal the brief hash in the same file.

## Honesty notes

- The toy lived in a real nested git repository during the walkthrough (mode
  `normal-repo`, branch `feature/slugify-helper`, the two real commits listed
  above). `.git` was **deleted before this directory was committed** — a
  nested repository must never be committed into an example directory. The
  diff and its hash survive in `.fvep/change.diff` for verification.
- `.fvep/workspace.json` records the real snapshot observed at gate 4 with
  machine-specific paths normalized to `/toy-repo`; the raw report written by
  the live run is `.fvep/reports/workspace.report.json`, and the snapshot
  replays to the identical classification.
- Timestamps in contracts reflect the real run order (route 09:13Z → design
  09:21Z → plan 09:26Z → RED 09:28:46Z → GREEN 09:29:31Z → review/claims
  09:31–09:34Z, 2026-08-09). `policy.claims.now` is pinned at run date so
  replays stay deterministic — the same convention as
  `examples/process/process.config.json`.
- `.fvep/artifacts/` and `artifacts/` are gitignored by the repository’s
  `artifacts/` rule; regenerate them with the commands above.
