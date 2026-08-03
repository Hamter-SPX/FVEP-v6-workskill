# Quality Model and Evidence Confidence

## Two Independent Questions

The quality model answers:

1. **How good is the evidenced result?** — quality score
2. **How complete and trustworthy is the evidence?** — evidence confidence

A high quality score with low confidence is not approval. Missing evidence cannot be averaged away by strong results in easier gates.

## Default Weights

| Gate | Weight |
|---|---:|
| Visual | 30 |
| Responsive | 15 |
| Accessibility | 15 |
| Runtime | 10 |
| Engineering | 15 |
| Performance | 10 |
| Interaction | 5 |

Projects may change weights, but hard failures remain blocking when policy marks them hard.

## Gate Status

- `pass`: assessed evidence meets policy
- `warning`: assessed evidence is usable but contains non-blocking deviation
- `fail`: assessed evidence violates policy
- `skipped`: required evidence was not assessed
- `unknown`: evidence exists but cannot be interpreted reliably
- `not-applicable`: the gate does not apply and does not reduce confidence

`skipped` and `not-applicable` are not interchangeable. A skipped responsive check for a responsive surface reduces confidence; a backend-only gate marked not applicable does not.

## Confidence Mechanics

Each applicable gate contributes its configured weight. An assessed gate contributes that weight multiplied by its evidence confidence. Examples:

- All required comparison cases present: 100% visual evidence confidence
- Half of required cases compared: 50% visual evidence confidence
- Performance metrics with unsupported browser entries: partial performance evidence confidence
- No engineering checks configured and engineering declared not applicable: no confidence penalty

The final release decision requires both minimum score and minimum confidence.

## Hard Failures

Hard failures should include task-blocking or integrity-breaking evidence such as:

- Missing current capture
- Invalid exact-reference baseline
- Major or blocker exact-reference delta
- Horizontal overflow that impairs use
- Blocking accessibility defect
- Runtime exception or disallowed console/page failure
- Required typecheck, test, or build failure
- Missing focus feedback

A weighted average cannot override a hard failure.

## Semantic Approval

Automated quality can pass while release remains pending. Final release requires a recorded semantic review because automated gates cannot determine product intent with sufficient reliability.

## Interpreting History

Track score, confidence, blockers, and remediation across runs.

- **Improving:** score rises meaningfully or blockers decrease
- **Regressing:** score falls meaningfully or blockers increase
- **Stable:** change is below the meaningful-delta policy
- **Stagnant:** several runs remain inside a narrow score band with unchanged blockers

Stagnation is a diagnostic signal. Stop random visual tuning and revisit the root cause, acceptance contract, or evidence setup.
