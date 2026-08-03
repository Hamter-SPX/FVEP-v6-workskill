# Full-Stack Vision Engineering Pro v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic Superpowers-derived engineering process kernel to the v3 full-stack vision, risk, debugging, and release suite.

**Architecture:** Preserve all v3 domain engines and add pure process-governance engines, append-only evidence contracts, thin CLI adapters, and a process gate integrated into the full-stack release decision. The package remains host-neutral: it creates validated task briefs, review packages, and lifecycle evidence without pretending to provide unavailable subagent, git remote, or browser capabilities.

**Tech Stack:** Node.js 20+ ESM, built-in `node:test`, Markdown skills and references, JSON contracts/schemas, existing Playwright/axe/pixel dependencies, Git CLI only for explicit workspace inspection actions.

## Global Constraints

- All 91 v3 unit tests must remain green.
- Every new production behavior requires observed RED evidence before implementation.
- Engines must be deterministic and side-effect free unless their name and CLI explicitly declare mutation.
- Workspace, merge, push, delete, and discard operations are dry-run by default.
- Review evidence must distinguish implementer and reviewer identities.
- Missing or stale evidence must never become a pass.
- Existing frontend and full-stack quality scores must remain separate from process evidence confidence.
- No completion claim without fresh verification from the packaged artifact.

---

### Task 1: Skill Routing, Design Governance, and Plan Quality

**Files:**
- Create: `lib/skill-router-engine.mjs`
- Create: `lib/design-governance-engine.mjs`
- Create: `lib/plan-quality-engine.mjs`
- Test: `tests/unit/skill-router-v4.test.mjs`
- Test: `tests/unit/design-governance-v4.test.mjs`
- Test: `tests/unit/plan-quality-v4.test.mjs`

**Interfaces:**
- Produces: `routeProcessSkills(context, policy)`, `auditDesignGovernance(contract, policy)`, `auditImplementationPlan(plan, policy)`.
- Consumes: JSON task context, design contract, and implementation-plan contract.

- [ ] Write failing tests for trigger precedence, missing design alternatives, approval bypass, placeholders, dependency cycles, undefined interfaces, and incomplete verification steps.
- [ ] Run targeted tests and verify failures are caused by missing v4 modules.
- [ ] Implement minimal deterministic engines.
- [ ] Run targeted tests and all existing tests.
- [ ] Commit the task.

### Task 2: Task Graph, Workspace Safety, and Recovery Ledger

**Files:**
- Create: `lib/task-graph-engine.mjs`
- Create: `lib/workspace-safety-engine.mjs`
- Create: `lib/process-ledger-engine.mjs`
- Test: `tests/unit/task-graph-v4.test.mjs`
- Test: `tests/unit/workspace-safety-v4.test.mjs`
- Test: `tests/unit/process-ledger-v4.test.mjs`

**Interfaces:**
- Produces: `analyzeTaskGraph(tasks, policy)`, `classifyWorkspace(snapshot, policy)`, `reduceProcessLedger(events, policy)`.
- Consumes: validated plan tasks, filesystem/git snapshots, append-only lifecycle events.

- [ ] Write failing tests for parallel file conflicts, shared-resource conflicts, cycles, protected branches, submodule/worktree distinction, invalid transition bypass, event tampering, and compaction recovery.
- [ ] Verify RED.
- [ ] Implement engines without executing git mutations.
- [ ] Verify GREEN and full regression suite.
- [ ] Commit the task.

### Task 3: TDD Evidence and Scientific Debugging

**Files:**
- Create: `lib/tdd-evidence-engine.mjs`
- Create: `lib/debug-session-engine.mjs`
- Test: `tests/unit/tdd-evidence-v4.test.mjs`
- Test: `tests/unit/debug-session-v4.test.mjs`

**Interfaces:**
- Produces: `auditTddCycles(cycles, policy)` and `auditDebugSession(session, policy)`.
- Consumes: command evidence, code/test hashes, behavior IDs, boundary evidence, hypotheses, experiments, and fix attempts.

- [ ] Write failing tests for test-after evidence, unrelated RED failures, time inversion, missing negative controls, multiple active hypotheses, missing boundary localization, bundled experiments, and fourth speculative fix attempts.
- [ ] Verify RED.
- [ ] Implement deterministic validation and scoring.
- [ ] Verify GREEN and regressions.
- [ ] Commit the task.

### Task 4: Review Governance, Feedback Adjudication, and Fix Loops

**Files:**
- Create: `lib/review-governance-engine.mjs`
- Create: `lib/feedback-adjudication-engine.mjs`
- Test: `tests/unit/review-governance-v4.test.mjs`
- Test: `tests/unit/feedback-adjudication-v4.test.mjs`

**Interfaces:**
- Produces: `auditReviewChain(chain, policy)` and `auditFeedbackDisposition(record, policy)`.
- Consumes: task briefs, bounded change packages, implementer reports, reviewer identities, dual verdicts, findings, fix rounds, and rulings.

- [ ] Write failing tests for self-review, missing spec verdict, missing quality verdict, unbounded diffs, ignored important findings, more than five rounds, premature adjudication, blind feedback acceptance, and unsupported rejection.
- [ ] Verify RED.
- [ ] Implement engines.
- [ ] Verify GREEN and regressions.
- [ ] Commit the task.

### Task 5: Claim Verification, Integration Safety, and Process Gate

**Files:**
- Create: `lib/claim-verification-engine.mjs`
- Create: `lib/integration-decision-engine.mjs`
- Create: `lib/process-gate-engine.mjs`
- Test: `tests/unit/claim-verification-v4.test.mjs`
- Test: `tests/unit/integration-decision-v4.test.mjs`
- Test: `tests/unit/process-gate-v4.test.mjs`

**Interfaces:**
- Produces: `auditCompletionClaims(claims, evidence, policy)`, `prepareIntegrationDecision(context, policy)`, `evaluateProcessGate(sections, policy)`.
- Consumes: evidence with timestamps and hashes, repository state, test results, review state, residual findings, and explicit user decisions.

- [ ] Write failing tests for stale test evidence, unsupported security/visual claims, silent merge choice, unsafe worktree cleanup, discard without exact confirmation, high quality with incomplete process confidence, and hard process failures.
- [ ] Verify RED.
- [ ] Implement engines.
- [ ] Verify GREEN and regressions.
- [ ] Commit the task.

### Task 6: Process Configuration, Orchestrator, Reports, and CLI

**Files:**
- Create: `lib/process-config.mjs`
- Create: `lib/process-orchestrator.mjs`
- Create: `lib/process-report.mjs`
- Create: `scripts/audit-process.mjs`
- Create: `scripts/route-skills.mjs`
- Create: `scripts/inspect-workspace.mjs`
- Create: `scripts/validate-plan.mjs`
- Create: `scripts/validate-tdd.mjs`
- Create: `scripts/validate-review-chain.mjs`
- Create: `scripts/prepare-integration.mjs`
- Modify: `package.json`
- Test: `tests/unit/process-config-v4.test.mjs`
- Test: `tests/unit/process-orchestrator-v4.test.mjs`
- Test: `tests/unit/process-report-v4.test.mjs`
- Test: `tests/unit/cli-surface-v4.test.mjs`

**Interfaces:**
- Produces: normalized process config, process audit JSON/Markdown, permitted-next-action list, and host-neutral agent artifacts.
- Consumes: v4 contracts plus optional v3 full-stack report.

- [ ] Write failing tests for invalid config, missing required process sections, recovery from ledger, report completeness, and CLI help.
- [ ] Verify RED.
- [ ] Implement config, orchestrator, report, and CLI adapters.
- [ ] Verify GREEN and regressions.
- [ ] Commit the task.

### Task 7: Full-Stack Release Integration

**Files:**
- Modify: `lib/fullstack-config.mjs`
- Modify: `lib/fullstack-runner.mjs`
- Modify: `lib/fullstack-audit-engine.mjs`
- Modify: `lib/fullstack-gate-engine.mjs`
- Modify: `lib/fullstack-report.mjs`
- Modify: `fullstack.config.example.json`
- Modify: `examples/fullstack/fullstack.config.json`
- Test: `tests/unit/fullstack-process-integration-v4.test.mjs`

**Interfaces:**
- Adds optional `contracts.processReport`, `gates.process`, and `quality.weights.process`.
- Preserves v3 behavior when process evidence is explicitly not applicable.

- [ ] Write failing tests showing a technically strong release blocked by missing required process evidence and a complete process report passing without altering domain quality scores.
- [ ] Verify RED.
- [ ] Implement backward-compatible integration.
- [ ] Verify GREEN and regressions.
- [ ] Commit the task.

### Task 8: Schemas, Examples, Templates, Roles, Prompts, and References

**Files:**
- Create: v4 JSON schemas for process config, design governance, plan, workspace, ledger, TDD, debug, review, feedback, claims, and integration.
- Create: v4 examples under `examples/process/`.
- Create: task brief, review package, feedback ruling, TDD evidence, debug session, and integration decision templates.
- Create: process-controller, task-implementer, task-reviewer, re-reviewer, and final-reviewer role contracts.
- Create: references covering every installed Superpowers skill adaptation.
- Create: `SUPERPOWERS_ADAPTATION_MATRIX.md` and `MIGRATION_V3_TO_V4.md`.
- Modify: `SKILL.md`, `README.md`, `README_TH.md`, `ARCHITECTURE.md`, `SECURITY.md`, `CHANGELOG.md`.

- [ ] Add precise documentation with no placeholder language.
- [ ] Document host limitations and non-claims.
- [ ] Add pressure scenarios for time, authority, sunk cost, context loss, review collusion, and false completion.
- [ ] Validate every referenced file and JSON example.
- [ ] Commit the task.

### Task 9: Skill Conformance and Self-Audit

**Files:**
- Create: `lib/skill-conformance-engine.mjs`
- Create: `scripts/validate-skill-conformance.mjs`
- Test: `tests/unit/skill-conformance-v4.test.mjs`
- Modify: `scripts/validate-suite.mjs`
- Modify: `tests/TDD_EVIDENCE_V4.md`

**Interfaces:**
- Produces: a self-audit covering frontmatter, discovery triggers, required references, pressure scenarios, process coverage, placeholder scan, TDD evidence, and release artifacts.

- [ ] Write failing tests for malformed skill metadata, workflow descriptions in discovery text, missing pressure scenarios, missing process references, and absent RED evidence.
- [ ] Verify RED.
- [ ] Implement conformance engine and validator integration.
- [ ] Run complete tests and validation.
- [ ] Commit the task.

### Task 10: Packaging and Clean-Extraction Verification

**Files:**
- Create: `FULLSTACK_VISION_ENGINEERING_PRO_V4_ALL_IN_ONE.md`
- Create: `UPGRADE_REPORT_V4_TH.md`
- Update: `MANIFEST.json`, `CHECKSUMS.sha256`, `VALIDATION_REPORT.json`
- Create: `fullstack-vision-engineering-pro-v4.0.0.zip`
- Create: `fullstack-vision-engineering-pro-v4.0.0.zip.sha256`

- [ ] Generate deterministic release artifacts from source.
- [ ] Extract ZIP into a clean directory.
- [ ] Run unit tests, syntax checks, CLI help smoke tests, JSON/schema checks, reference checks, package validation, checksums, manifest verification, and ZIP CRC/path safety.
- [ ] Verify the packaged README and SKILL files are present.
- [ ] Record live integration gaps separately from verified offline behavior.
- [ ] Produce a final evidence report with exact counts and hashes.
