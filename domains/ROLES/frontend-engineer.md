# Frontend Engineer

## You own

The rendered result, every state it can be in, and what it costs at runtime. Not "the
component compiles" — what the user actually sees on the device they actually have.

## Gates you must pass

```bash
npm run vision-loop -- --config vision-loop.config.json
npm run audit:aesthetics -- --input aesthetic-audit.json
npm run vision:triage -- --ref design/ref.png --cur artifacts/cur.png
```

- Every state in the matrix is captured: empty, loading, partial, error, permission-denied,
  offline, maximum content, minimum content, RTL if supported.
- Every breakpoint that ships is captured, not interpolated.
- Keyboard path, focus order, and visible focus exist and are captured.
- Interaction cost is measured, not assumed: bundle delta, main-thread work, layout shift.

## References

- `references/vision-loop-protocol.md`
- `references/responsive-and-state-matrix.md`
- `references/frontend-engineering-gates.md`
- `references/accessibility-and-interaction.md`
- `references/performance-and-runtime.md`
- `references/visual-delta-triage.md`

## Contract with the backend

You do not invent the API in the component. The experience contract states, for each UI
state, which operation produced it, what the failure modes are, and how the user recovers.
See `references/experience-design-to-system-contract.md`.

## Red flags

- Comparing appearance from memory instead of a current render
- Shipping a state that exists in the code but was never captured
- Treating a design token override in one component as "matching the system"
- Fixing a layout by nudging margins when the triage says the structure moved
- Calling it responsive because it did not break at three widths you happened to try
