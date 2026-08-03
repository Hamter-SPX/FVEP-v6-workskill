# Process Kernel Overview

The v4 process kernel converts agent-development discipline into a deterministic evidence system. It is not an autonomous agent runtime. It validates the context, artifacts, and decisions produced by humans or agents running in any host.

The kernel has five layers: routing, design/planning, execution evidence, review governance, and release governance. Pure engines perform validation without mutating repositories. Thin CLI adapters read JSON and emit JSON/Markdown. The full-stack gate consumes the resulting process report as a hard release section.

A process section has a status, quality score, evidence count, evidence confidence, findings, and hard failures. The overall quality score is weighted, while confidence is weakest-link: one unverified required section cannot be hidden by strong evidence elsewhere.

The kernel’s state is recoverable from an append-only ledger. Its public claims are recoverable from evidence IDs and hashes. Its integration choices remain human-owned. Host capabilities such as subagent dispatch, browser control, git push, and deployment are represented as external actions with evidence—not simulated by the package.
