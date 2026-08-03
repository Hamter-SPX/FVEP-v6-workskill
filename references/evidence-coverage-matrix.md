# Evidence Coverage Matrix

## Purpose

A gate is not fully trustworthy merely because one case produced evidence. Version 2 binds case-oriented evidence to the configured acceptance matrix:

```text
route × viewport × state
```

For each applicable family, the system records expected, covered, missing, unexpected, and duplicate case keys. Coverage affects **evidence confidence** but does not rewrite the measured quality score.

## Required Behavior

- Preserve configured case order when reporting missing evidence.
- Deduplicate repeated artifacts so retries cannot inflate coverage.
- Report unexpected keys because they often indicate stale artifacts or config drift.
- Treat an unsupported or missing case as absent evidence, never as a passing zero-value measurement.
- Keep quality score and coverage confidence independent.
- For compound gates such as interaction plus state crawling, calculate each required family separately and combine their coverage.

## Example

Given three expected cases:

```text
home__mobile__default
home__tablet__default
home__desktop__default
```

and accessibility evidence only for mobile, the accessibility result may have a measured score of 100 for that page, but its evidence confidence is 33.33%. Release policy can therefore block the run without falsely reporting that the inspected page itself failed.

## Coverage Fields

| Field | Meaning |
|---|---|
| `expected` | Number of configured case keys |
| `covered` | Expected keys with usable evidence |
| `observed` | Unique keys present in the evidence source |
| `ratio` | `covered / expected` |
| `confidence` | Coverage ratio expressed as a percentage |
| `missing` | Expected keys with no evidence |
| `unexpected` | Evidence keys outside the current matrix |
| `duplicates` | Keys repeated in one evidence family |
| `complete` | No expected key is missing |

## Gate Policy

Coverage is attached to visual comparison, responsive inspection, accessibility, runtime, performance, interaction inventory, state crawling, semantic/manual visual review, and the aesthetic gate (profile, measurements, and independent aesthetic review). Repository engineering commands are run-level evidence rather than case-level evidence and therefore use their own completeness rule.

A complete semantic review does not legalize an incomplete exact-reference comparison. Exact-reference mode still requires automated current/reference evidence and approved baseline provenance. Likewise, a high visual-comparison score does not compensate for a failing aesthetic gate: fidelity and craft answer different questions.
