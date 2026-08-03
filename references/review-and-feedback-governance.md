# Review and Feedback Governance

Review is evidence, not ceremony. A valid change package records base/head identity, diff hash, bounded file set, brief hash, implementer identity, and test evidence. The reviewer must differ from the implementer and issue explicit spec and quality verdicts.

Findings have stable IDs, severity, status, message, load-bearing classification, and review linkage. Addressed findings require a re-review ID. Parking before the circuit breaker is allowed only for an explicit human decision about a plan conflict. A load-bearing finding cannot be parked.

External feedback is verified before disposition. Acceptance needs supporting codebase evidence and tested implementation. Rejection needs evidence that the suggestion is unsupported or harmful. Deferral needs owner, due date, and residual risk. Unclear feedback cannot be partially implemented.
