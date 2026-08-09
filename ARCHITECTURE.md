# Architecture — v6

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
