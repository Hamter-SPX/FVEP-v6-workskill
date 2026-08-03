# Dependency and Supply-Chain Risk

## Manifest Review

Review production and development dependencies, transitive lockfile, package-manager configuration, scripts, registries, mirrors, generated code, containers, CI actions, and downloaded tools.

## Risk Indicators

- Missing lockfile
- Range or floating version in reproducible release path
- Git, HTTP, local, or unverified archive dependency
- Preinstall/install/postinstall execution
- Unreviewed binary download
- Broad CI token or package registry credentials
- Dependency used for a trivial function with high privilege or runtime surface
- Multiple libraries solving the same security-sensitive concern
- Abandoned or unowned critical dependency
- Generated artifact not tied to source and checksum

The included scanner detects selected manifest indicators. It does not query live vulnerability databases in an offline environment.

## Addition Gate

Before adding a dependency record:

- Problem and why existing capabilities are insufficient
- Maintenance and ownership
- License and policy compatibility
- Runtime, bundle, performance, and attack-surface cost
- Release cadence and ecosystem health
- Transitive dependency and lifecycle behavior
- Exact version and lockfile change
- Removal or replacement plan for critical infrastructure

## Build Provenance

A trustworthy release identifies source revision, lockfile, build environment, artifact hashes, configuration identity, generated files, and signer/approver. Rebuilding from the same inputs should be explainable even when byte-for-byte reproducibility is unavailable.

## Secret Safety

Do not place registry tokens, signing keys, or cloud credentials in manifests, command arguments displayed in logs, caches, generated reports, or package artifacts.
