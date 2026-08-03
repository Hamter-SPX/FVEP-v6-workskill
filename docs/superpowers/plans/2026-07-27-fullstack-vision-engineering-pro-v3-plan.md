# Full-Stack Vision Engineering Pro v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing frontend vision-loop package into an evidence-driven full-stack design, implementation, debugging, risk, and release skill suite.

**Architecture:** Preserve the current frontend subsystem. Add deterministic JSON-contract analysis engines and thin CLI adapters, then aggregate their evidence in a strict full-stack release gate. Keep live integrations optional and report missing evidence rather than inferring success.

**Tech Stack:** Node.js 20 ESM, built-in test runner, existing Playwright/axe/pixel dependencies, Markdown skill/reference documents, JSON schemas and contracts.

## Global Constraints

- Existing 58 frontend unit tests must remain green.
- New production behavior requires a failing unit test first.
- New engines must be deterministic and dependency-light.
- Security scanners must redact probable secrets and label heuristic findings.
- Missing evidence must lower confidence or fail a required gate.
- No production-ready claim without fresh full-suite verification.

---

### Task 1: Contract and Risk Foundations

**Files:**
- Create: `lib/risk-engine.mjs`
- Create: `lib/experience-contract-engine.mjs`
- Create: `tests/unit/risk-engine.test.mjs`
- Create: `tests/unit/experience-contract.test.mjs`

**Interfaces:**
- Produces: `evaluateRiskRegister(register, policy)` and `auditExperienceContract(contract, policy)`.

- [ ] Write failing tests for risk ranking, hard blockers, missing ownership, unmapped errors, missing UI states, and unsafe optimistic mutations.
- [ ] Run targeted tests and confirm failures are caused by missing modules.
- [ ] Implement minimal deterministic engines.
- [ ] Run targeted and complete tests.

### Task 2: API and Architecture Analysis

**Files:**
- Create: `lib/api-contract-engine.mjs`
- Create: `lib/architecture-risk-engine.mjs`
- Create: `tests/unit/api-contract.test.mjs`
- Create: `tests/unit/architecture-risk.test.mjs`

**Interfaces:**
- Produces: `auditApiContract(document, policy)`, `compareApiContracts(baseline, current)`, and `auditArchitectureContract(contract, policy)`.

- [ ] Write failing tests for missing security, error schemas, breaking removals, dangling dependencies, trust-boundary controls, and single points of failure.
- [ ] Verify RED.
- [ ] Implement minimal engines and graph checks.
- [ ] Verify GREEN and regression suite.

### Task 3: Data, Security, and Resilience

**Files:**
- Create: `lib/migration-risk-engine.mjs`
- Create: `lib/security-review-engine.mjs`
- Create: `lib/source-risk-scanner.mjs`
- Create: `lib/resilience-engine.mjs`
- Create matching unit tests.

**Interfaces:**
- Produces migration, security, source-risk, and resilience reports with common finding fields.

- [ ] Write failing tests for destructive migrations, unbounded backfills, missing authorization, secret redaction, unsafe source patterns, retry amplification, and non-idempotent retries.
- [ ] Verify RED.
- [ ] Implement engines.
- [ ] Verify GREEN and regression suite.

### Task 4: Observability and Root-Cause Triage

**Files:**
- Create: `lib/observability-engine.mjs`
- Create: `lib/debug-triage-engine.mjs`
- Create matching unit tests.

**Interfaces:**
- Produces coverage reports and ranked hypotheses with falsification steps.

- [ ] Write failing tests for missing correlation, absent SLO ownership, partial critical-flow coverage, boundary-localized evidence, and contradicted hypotheses.
- [ ] Verify RED.
- [ ] Implement engines.
- [ ] Verify GREEN and regression suite.

### Task 5: Full-Stack Configuration and Release Gate

**Files:**
- Create: `lib/fullstack-config.mjs`
- Create: `lib/fullstack-gate-engine.mjs`
- Create: `lib/fullstack-report.mjs`
- Create matching unit tests.

**Interfaces:**
- Produces normalized v3 config, weighted quality decision, evidence confidence, remediation ordering, JSON and Markdown report.

- [ ] Write failing tests for invalid duplicate identifiers, missing required evidence, hard security failure, partial coverage, and successful complete release evidence.
- [ ] Verify RED.
- [ ] Implement configuration, gate, and report engines.
- [ ] Verify GREEN and regression suite.

### Task 6: CLI and Documentation Surface

**Files:**
- Create: `scripts/audit-fullstack.mjs`, `scripts/audit-api-contract.mjs`, `scripts/audit-architecture.mjs`, `scripts/audit-migrations.mjs`, `scripts/audit-security.mjs`, `scripts/audit-observability.mjs`, `scripts/triage-incident.mjs`, `scripts/fullstack-quality-gate.mjs`
- Update: `package.json`, `SKILL.md`, README files, references, templates, prompts, agents, examples, schemas.

- [ ] Add CLI help and deterministic file I/O.
- [ ] Add CLI smoke tests through the package validator.
- [ ] Document exact use, limitations, and evidence semantics.
- [ ] Run complete unit, syntax, CLI, JSON, reference, and package validation.

### Task 7: Release Packaging and Independent Verification

**Files:**
- Update: `MANIFEST.json`, `CHECKSUMS.sha256`, `VALIDATION_REPORT.json`, `CHANGELOG.md`
- Create: v3 all-in-one Markdown, migration guide, upgrade report, ZIP, and ZIP checksum.

- [ ] Generate artifacts from source files.
- [ ] Extract ZIP to a clean temporary directory.
- [ ] Run unit tests and validation from extracted package.
- [ ] Verify checksums, archive paths, file counts, and ZIP CRC.
- [ ] Report live-integration gaps separately from verified offline behavior.
