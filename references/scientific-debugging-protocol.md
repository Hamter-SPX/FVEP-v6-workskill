# Scientific Debugging Protocol

Debugging begins with reproducible evidence, not a patch. Record expected and observed behavior, exact steps or an intermittent sampling strategy, environment hash, and build identity. Instrument component boundaries and order them from caller to terminal dependency.

The first confirmed-bad boundary and last confirmed-good boundary define the search region. Maintain one active falsifiable hypothesis. Each experiment changes one variable and records a result. Contradicting evidence is preserved rather than explained away.

A fix requires a confirmed hypothesis, regression RED, a change identity, targeted GREEN, original reproduction verification, affected regression verification, and telemetry capable of distinguishing recurrence. After three failed fix attempts, another speculative patch is forbidden; trigger architectural review and record the decision.
