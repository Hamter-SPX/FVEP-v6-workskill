# Security Model — v4

## Trust boundaries

The package treats repository content, review feedback, contract files, browser pages, command configuration, and external evidence as untrusted inputs. Pure engines do not execute input. JSON readers resolve explicit files. Engineering command execution remains shell-free by default.

## Process-specific controls

- Protected-branch implementation is blocked unless policy authorizes it.
- Worktree cleanup requires proven package ownership.
- Review independence prevents implementer self-approval.
- Feedback is verified against codebase evidence before acceptance.
- TDD evidence uses chronology and hashes to detect test-after claims.
- Completion evidence must be fresh and match the current artifact hash.
- Absolute security claims are unsupported.
- Integration decisions require actor/timestamp; discard requires exact confirmation and inventory.
- The process ledger detects sequence gaps, content tampering, and broken hash links.
- Release collection skips symbolic links and excludes repository, workspace, dependency, coverage, build, and generated-evidence directories.
- ZIP member paths reject traversal, absolute paths, drive prefixes, backslashes, empty segments, and duplicate names.
- Release verification checks local headers, central-directory bounds, CRC values, compressed/uncompressed sizes, manifest identity, and checksum coverage.

## Execution boundaries

`process:workspace` uses fixed git executable arguments and does not mutate git. `process:integration` validates a decision but does not execute it. Existing engineering checks reject shell operators unless explicit reviewed shell execution is enabled.

## Data handling

Do not place secrets, tokens, private keys, personal data, or raw production payloads in process artifacts. Use redacted identifiers or non-reversible fingerprints. Keep evidence retention aligned with the project’s classification and access policy.

## Non-certification

Static scans and contract audits identify bounded risks. They do not prove absence of vulnerabilities, production correctness, or compliance. Live claims require live evidence from the relevant environment.
