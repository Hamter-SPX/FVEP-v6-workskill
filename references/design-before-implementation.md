# Design Before Implementation

A design contract protects the project from coding an unexamined direction. First record repository/context evidence. Then compare at least two viable approaches, including costs and risks. Select one recommendation with rationale and describe architecture, components, data flow, error behavior, and testing.

For screenshot-led redesigns, visible direction exploration (`references/visual-direction-exploration.md`) runs before the aesthetic profile: generate two or three distinct ImageGen options, wait for a numbered choice, then bind that choice into the design artifacts. Preference without a visible option set is not an explored direction.

Approval is a separate fact from authorship. The contract records actor and timestamp. A best-effort exception is allowed only when policy explicitly enables it and the exception names its reason, scope, and follow-up obligation.

Self-review checks placeholder language, internal consistency, scope, and ambiguity. A design that says only “make it scalable” or “add error handling” is not actionable. For frontend work, the design also defines hierarchy, responsive composition, states, assets, accessibility, and visual acceptance. For backend work, it identifies domain boundaries, invariants, authorization, failure modes, and observability.
