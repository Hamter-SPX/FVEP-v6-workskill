# Vision Loop Iteration Ledger

| Iteration | Case | Highest severity | Evidence | Root-cause hypothesis | Coherent change | Result | Regression cases |
|---:|---|---|---|---|---|---|---|

## Stop Conditions

- A real external dependency blocks progress and is documented with required input
- All applicable automated gates pass
- Semantic review covers every required case and explicitly approves
- Remaining deviations are minor, documented, and safe

## Stagnation Review

When several iterations do not improve score or blockers:

- Recheck deterministic state and comparison setup
- Reopen the design contract and priority order
- Inspect parent constraints and shared tokens
- Stop micro-tuning unrelated values
- Reclassify the root cause before another edit
