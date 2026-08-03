# TDD Evidence for Version 2

Version 2 was developed with behavior-first tests for the new quality controls. The following RED cases were intentionally introduced before their implementations and initially failed for the stated missing behavior:

| RED case | Missing behavior exposed | GREEN test now covering it |
|---|---|---|
| Partial evidence was treated like complete evidence | Quality score and evidence confidence were not independent enough | `quality-model.test.mjs` — partial evidence confidence reduces confidence without rewriting quality |
| A semantic review could omit cases or omit an explicit decision | Desktop-only review could appear complete | `manual-review.test.mjs` — explicit approval and complete expected-case coverage |
| A baseline could be valid by file hash alone | Config drift and missing approval provenance were not blocking | `baseline.test.mjs` — rejects config drift and missing approval provenance |
| Exact-reference mode could proceed with invalid baseline metadata | Release gate did not bind fidelity claims to approved evidence | `gate-engine.test.mjs` — exact-reference quality is blocked by invalid baseline provenance |
| Missing visual evidence could be scored optimistically | Unverified rendering could become a passing visual gate | `gate-engine.test.mjs` — unverified visual evidence does not become a passing visual gate |
| One inspected case could imply complete gate confidence | Evidence count was not bound to the configured route × viewport × state matrix | `evidence-coverage.test.mjs` and `gate-engine.test.mjs` — missing cases lower confidence without rewriting measured quality |

The suite also covers perceptual comparison, region contracts, performance budgets, responsive breakpoint candidates, design-token drift, interaction inventory, focus-state crawling, provenance, remediation, run history, reporting, and CLI behavior.

## Reproduction

```bash
npm test
npm run validate
```

The packaged validation report records the actual aggregate test and syntax-check results from the final source tree. These unit and static checks do not replace live browser validation against a configured target application.
