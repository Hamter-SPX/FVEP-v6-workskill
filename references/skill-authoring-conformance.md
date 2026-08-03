# Skill Authoring Conformance

A production skill needs discoverable metadata, focused triggers, precise workflow, reusable references, pressure scenarios, and deployment evidence. The frontmatter description states when to use the skill rather than summarizing the workflow. The body carries the process.

Authoring follows RED–GREEN–REFACTOR. First pressure-test a fresh context without the guidance and record the actual failure. Write the smallest guidance or deterministic engine that addresses that failure. Re-run the same scenarios, then close new loopholes.

The v4 conformance audit checks frontmatter, trigger wording, referenced files, process coverage, pressure-scenario categories, placeholder language, TDD evidence, schemas, examples, CLI surfaces, and release artifacts. Static conformance does not substitute for repeated independent-agent pressure runs.
