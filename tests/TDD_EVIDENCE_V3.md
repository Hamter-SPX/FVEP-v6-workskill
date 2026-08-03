# TDD Evidence — Full-Stack Vision Engineering Pro v3

Version 3 was extended with behavior-first tests. New test cases were run before their implementations and observed failing for the intended reason.

## RED cases observed

| Capability | Observed RED failure | GREEN coverage |
|---|---|---|
| Domain audit engines | Imports failed because the v3 audit modules did not yet exist | Experience, API, architecture, migration, security, resilience, observability, dependency, risk, and debug-triage tests |
| Full-stack release gate | Hard security failures and missing evidence had no aggregate gate | `fullstack-gate-v3.test.mjs` |
| Configured audit runner | Contracts were not loaded or rendered into JSON/Markdown evidence | `fullstack-runner-v3.test.mjs` |
| CLI/package surface | v3 commands and package metadata were absent | `cli-surface-v3.test.mjs`, `package-v3.test.mjs` |
| Lockfile semantic verification | A present but inconsistent lockfile incorrectly passed | `dependency-risk-v3.test.mjs`, `dependency-lockfile-v3.test.mjs` |
| Engineering command boundary | Checks invoked a shell by default and accepted shell operators implicitly | `engineering.test.mjs` — shell-free argv parsing and explicit opt-in |
| Source-root containment | `.env` was skipped and a symlinked source file could escape the configured root | `source-collection-v3.test.mjs` |

The lockfile RED run specifically returned `pass` when `lockfileVerified: false`; after implementation, the same case is a blocker and the exact verified case passes with 100% evidence coverage.

## Current automated coverage

Run:

```bash
npm test
npm run validate
```

The final packaged `VALIDATION_REPORT.json` records the fresh aggregate count. Unit tests and static checks validate deterministic logic, report generation, configuration, CLI loading, and examples. They do not certify a real application’s live browser behavior, production security, database migration safety, or incident readiness without project evidence.

## Behavioral pressure testing

- Frontend pressure tests: `tests/pressure-scenarios.md`
- Full-stack pressure tests: `tests/fullstack-pressure-scenarios.md`

These scenarios require independent fresh agent contexts. They are supplied for deployment testing but are not falsely recorded as passed by static validation.
