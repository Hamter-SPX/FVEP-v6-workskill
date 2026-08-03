# TDD Evidence Protocol

A test file existing is not proof of test-first development. Each cycle binds a behavior ID and requirement reference to one test identity. RED records command, nonzero exit, missing-behavior failure classification, expected and observed signature, output hash, test hash, production hash, and timestamp. Production records the changed artifact hash and timestamp. GREEN proves the same test passed against that changed production hash.

Chronology must be RED before production change before GREEN. Syntax errors, dependency failures, or unrelated crashes do not count as RED. High-risk behavior requires a negative control such as mutation, revert, or an equivalent demonstration that removing the fix makes the test fail.

Refactoring occurs only after GREEN and requires fresh passing evidence. These records support review and completion claims without relying on an agent’s assertion that it “used TDD.”
