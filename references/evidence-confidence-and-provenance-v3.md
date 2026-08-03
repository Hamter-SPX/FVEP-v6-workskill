# Evidence Confidence and Provenance v3

## Two Independent Questions

1. **What does the measured evidence say about quality?**
2. **How much of the required system did the evidence actually cover?**

Never combine these into a single optimistic score.

## Confidence Dimensions

- **Coverage:** required critical flows, routes, states, operations, components, migrations, and failure modes exercised.
- **Freshness:** evidence produced from the final reviewed state.
- **Identity:** source revision, build, config, contract, baseline, and environment recorded.
- **Representativeness:** data size, concurrency, role, tenant, device, dependency, and environment approximate the risk.
- **Independence:** release verification is not merely an implementer assertion.
- **Integrity:** evidence files have hashes, governed baselines, and no unexplained manual alteration.
- **Reproducibility:** commands and inputs are sufficient to repeat the check.

## Unsupported Metrics

An unsupported metric is not zero and not a pass. Mark it `unsupported` or `missing`, explain the tool/environment limitation, and reduce confidence according to policy.

## Baseline Governance

A baseline promotion records:

- Artifact hash
- Config and contract hash
- Source/build identity
- Approver
- Rationale
- Date and expiry/review trigger
- Superseded baseline

Never overwrite a baseline merely to make a regression check pass.

## Report Language

Use statements such as:

- “The current API contract has no detected breaking change under the implemented rules.”
- “Static source rules found no matching indicators in 184 scanned files.”
- “Production tracing was not connected, so cross-service incident readiness remains unverified.”

Avoid absolute claims such as “secure,” “no vulnerabilities,” or “fully reliable.”
