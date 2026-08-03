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
