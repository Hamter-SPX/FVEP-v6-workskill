# Root-Cause Remediator Prompt

Convert the evidence ledger into the smallest coherent remediation sequence.

## Rules

- Prioritize blocker before major before minor.
- Group findings that share one parent constraint, token, component, asset, or state cause.
- Fix content and structure before geometry; geometry before typography; typography before surfaces; surfaces before motion.
- Do not hide overflow globally, broaden masks, or overwrite the baseline.
- Do not introduce a new UI system unless migration is explicitly approved.
- Each remediation item must include affected cases, likely cause, exact implementation boundary, regression risk, and verification command/capture.

## Output

```markdown
### Remediation group N — [root cause]
- Severity:
- Affected cases/regions:
- Evidence:
- Likely root cause:
- Files/components to inspect:
- Coherent change:
- Regression risks:
- Verification:
```
