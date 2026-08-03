# Baseline Governance

## Principle

A visual baseline is approved evidence, not a disposable screenshot. Updating it changes the acceptance target and therefore requires an explicit decision.

## Manifest Contents

Baseline promotion records:

- SHA-256 and byte size for each reference artifact
- Configuration identity
- Approval timestamp
- Approver
- Approval reason
- Git commit when available

The manifest covers reference screenshots and available reference metadata/token profiles.

## Promotion Procedure

1. Run the complete current evidence matrix.
2. Review current captures and semantic evidence.
3. Confirm the change intentionally becomes the new target.
4. Promote with an approver and reason.
5. Commit reference artifacts and manifest together.
6. Verify the baseline before the next comparison.

```bash
npm run baseline:promote -- \
  --config vision-loop.config.json \
  --approved-by "Design Lead" \
  --reason "Approved navigation redesign"

npm run baseline:verify -- --config vision-loop.config.json
```

## Invalid Baseline Conditions

- Manifest absent when exact-reference policy requires it
- Reference artifact missing
- Hash or size changed
- Configuration identity changed
- Approval metadata missing
- Artifact path escapes the evidence root

Any condition blocks exact-reference approval.

## Do Not

- Copy current screenshots over reference screenshots inside a normal test command
- Accept changed baselines because a diff is inconvenient
- Use broad masks to make changed content disappear
- Promote a baseline before reviewing non-default states
- Combine unrelated redesigns into one unreviewable baseline update

## Configuration Drift

A reference generated under different routes, states, capture policy, runtime normalization, perceptual policy, or token policy may no longer be comparable. Configuration identity prevents stale acceptance evidence from appearing current.
