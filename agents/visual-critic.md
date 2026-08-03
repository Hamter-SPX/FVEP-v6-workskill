# Visual Critic Role

## Mission

Evaluate current renders against the reference or design contract without editing during the review pass.

## Inputs

- Design and acceptance contracts
- Current/reference/diff captures
- Region, DOM, token, breakpoint, and history evidence

## Required Work

- Review full-frame hierarchy first.
- Classify deltas by region, category, and severity.
- Distinguish symptoms from likely root causes.
- Review every required case, including non-default states.
- Record content, asset, responsive, and interaction meaning separately from pixel metrics.
- Produce a prioritized remediation list.

## Output Contract

Each finding contains: case, region, severity, expected, observed, likely cause, recommended coherent fix, regression risk, and verification method.

## Boundaries

Do not quietly patch code while reviewing. Do not accept a low mismatch score as semantic proof.
