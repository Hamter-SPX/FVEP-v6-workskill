# Test-Driven Development

## Why this exists

A test file's existence proves nothing about when it was written. Production
behaviour backed by a test written afterwards is indistinguishable from
behaviour with no test discipline at all — the test was fitted to the code,
not the other way around. TDD in this package is therefore an evidence
contract: an observed failing test (RED) precedes the production change, an
observed pass (GREEN) follows it, and the chronology, hashes, and test
identity are recorded so a reviewer does not have to take anyone's word for
it.

`lib/tdd-evidence-engine.mjs` audits exactly that contract per
`references/tdd-evidence-protocol.md`: RED before production before GREEN,
failure classified as missing behaviour (syntax errors and unrelated crashes
do not count), and a negative control for high-risk behaviour — remove the
fix, watch the test fail again. `tests/TDD_EVIDENCE_V5.md` is the package's
own record of running this discipline on itself; `templates/tdd-evidence.md`
is the per-cycle record format.

## When to use

- For every production behaviour change — features, changes, and bug fixes
  alike. A fix starts with a regression test that fails on the current code.
- When `flow/flow-map.json` names this doc as a companion of the implement or
  debug mode.
- Not for pure refactors of covered behaviour (the existing GREEN evidence is
  the guard) or for documentation-only changes.

## The flow

1. Write the failing test. One behaviour, one test identity (file plus test
   name) bound to the requirement reference from the plan task. The test must
   express the missing behaviour, not a compile error.

2. Run it and observe the failure — watching the red output is the act that
   makes it evidence:

   ```bash
   node --test tests/unit/example-engine.test.mjs
   ```

   Record the RED fields: command, nonzero exit status, failure kind, expected
   signature, observed signature, output hash, test hash, pre-change
   production hash, timestamp. If the observed signature does not match the
   expectation (wrong failure, config error, unrelated crash), the cycle is
   invalid — fix the test until it fails for the right reason.

3. Write the minimum production code that could turn this test green. Minimum
   means no anticipatory features; scope beyond the failing assertion belongs
   to a later cycle.

4. Run the same command again and observe the pass:

   ```bash
   node --test tests/unit/example-engine.test.mjs
   ```

   Record GREEN: exit status 0, pass count, output hash, the **same** test
   hash, and the changed production hash. A GREEN against a different test
   hash than the RED means the test moved — the chain is broken.

5. Refactor only after GREEN: rename, extract, delete duplication. Then run
   the suite again for fresh post-refactor passing evidence; refactor without
   a fresh pass is an unverified change.

6. Commit the cycle. One commit per behaviour keeps the evidence chain
   bisectable:

   ```bash
   git add <files> && git commit -m "feat(scope): behaviour the test proves"
   ```

7. For high-risk behaviour, add the negative control — revert or mutate the
   production change, confirm the test fails again, then restore. Record the
   control's command and result in the cycle.

8. Before any TDD claim, validate the accumulated cycles:

   ```bash
   npm run process:tdd -- --input .fvep/tdd-evidence.json
   ```

   `examples/process/tdd-cycles.json` is a passing record of one full cycle
   with all required fields.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| RED observed | `node --test <test-file>` | failed run recorded with command, nonzero exit, matching failure signature, and hashes — before any production edit |
| GREEN observed | `node --test <test-file>` | same command exits 0 against the changed production hash |
| Chronology valid | `npm run process:tdd -- --input .fvep/tdd-evidence.json` | exits 0: RED → production → GREEN order, identity, and hashes intact per `lib/tdd-evidence-engine.mjs` |
| Negative control | recorded in `.fvep/tdd-evidence.json` | high-risk behaviour proves the test guards the fix (mutation or revert fails as expected) |

## Anti-patterns

- Do not write the test after the code and claim TDD — that is test-after
  with extra narration, and the evidence audit rejects its chronology.
- Do not count a syntax error, missing dependency, or unrelated crash as RED;
  only a missing-behaviour failure qualifies.
- Do not change the test and the production code in the same breath — the
  same-test-hash chain is what makes GREEN meaningful.
- Do not refactor before GREEN or skip the fresh pass after refactoring.
- Do not batch five behaviours into one cycle to save recording effort;
  bisectability is the point.
- Do not let an agent's assertion "I used TDD" substitute for the recorded
  cycles — no evidence, no claim.
