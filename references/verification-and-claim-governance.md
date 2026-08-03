# Verification and Claim Governance

A completion claim is a typed assertion linked to evidence IDs. Evidence records type, generated time, artifact hash, status, exit code, failures, and scope. The verifier rejects unknown, stale, failing, differently-hashed, or insufficiently-scoped evidence.

`tests-pass` requires a fresh full-suite run with zero failures. `visual-match` requires a current render, complete required-case coverage, and no blockers. `security-gates-pass` requires both a bounded security audit and threat model. `production-ready` requires tests, build, process gate, full-stack gate, final review, and rollback proof.

The system intentionally rejects an absolute `secure` claim because finite evidence cannot prove the absence of all vulnerabilities. Reports should state exactly what gates passed and what remains unverified.
