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

