# Verification Before Completion

## Why this exists

"Done" is the cheapest sentence in software and the most expensive to be
wrong about. An agent that ran the tests an hour ago, then edited two files,
will still say "tests pass" — and it will be describing a suite that no
longer corresponds to the code that now exists. The claim drifted from its
evidence the moment the artifact moved. Human reviewers then inherit a
verification debt they did not create, denominated in production incidents.

This package replaces the sentence with a contract. A completion claim is a
typed assertion bound to specific evidence ids; every evidence record carries
a timestamp, a status, and the hash of the artifact it was produced from. The
verifier in `lib/claim-verification-engine.mjs`, under
`references/verification-and-claim-governance.md`, mechanically rejects
evidence that is stale (`CLAIM_EVIDENCE_STALE` — default freshness window is
24 hours), bound to a different build (`CLAIM_ARTIFACT_MISMATCH`), failing
(`CLAIM_EVIDENCE_NOT_PASSING`), unknown (`CLAIM_EVIDENCE_UNKNOWN`), or of the
wrong required type. Nothing is claimed from memory. Memory is not evidence.

## When to use

- Before any statement that work is complete, fixed, passing, matching,
  secure-enough, or shippable — in a report, to a user, or to yourself.
- When `flow/flow-map.json` names this doc for the ship or match-ref mode.
- When inputs to `flow/finishing-a-development-branch.md` are assembled:
  integration requires fresh verification bound to the current artifact.

## The flow

1. Name the claim precisely before gathering anything. The engine knows a
   fixed vocabulary; pick the weakest type that still says what you mean:
   - `tests-pass` — a fresh full-suite run with zero failures
     (`scope: full-suite` is required, not a focused run).
   - `build-passes` — a passing production build run.
   - `visual-match` — a current render, 100% required-case coverage, zero
     blockers (`VISUAL_CLAIM_UNSUPPORTED` otherwise).
   - `security-gates-pass` — a passing bounded security audit **and** a
     passing threat model, both current.
   - `bug-fixed` — a regression test plus verified reproduction of the
     original failure.
   - `production-ready` — all six: test-run, build-run, process-gate,
     fullstack-gate, final-review, rollback-proof
     (`PRODUCTION_READY_EVIDENCE_INCOMPLETE` names what is missing).
   Never `secure` as a word: finite evidence cannot prove the absence of all
   vulnerabilities, so `ABSOLUTE_SECURITY_CLAIM_UNSUPPORTED` is a blocker.
   Claim the gates that passed, not an absolute.

2. Pin the artifact the claim is about:

   ```bash
   git rev-parse HEAD
   ```

   Everything you gather next must carry this hash — or the build hash this
   commit produced. Evidence about a different artifact proves something
   about something else.

3. Produce each evidence item now, with the artifact hash in scope:

   ```bash
   npm test
   ```

   Record id, type, `generatedAt` timestamp, artifact hash, status, exit
   status, failures, and scope (shape: `examples/process/evidence.json`). If
   the recorded timestamp cannot be parsed or falls outside the freshness
   window, the evidence counts as stale — re-run, don't argue.

4. Write the claim record (shape: `examples/process/claims.json`; schema:
   `schemas/completion-claims.schema.json`): claim id, type, artifact hash,
   and the evidence ids that must jointly support it. One claim per
   assertion — bundling "tests pass and security is fine and it matches the
   mock" into one id hides which leg failed.

5. Run the verification through the process audit, which executes the claim
   section of `lib/claim-verification-engine.mjs`:

   ```bash
   npm run process:audit -- --config process.config.json
   ```

   The config's `claims` and `evidence` contracts are read next to the other
   process sections (example: `examples/process/process.config.json`). A
   non-zero exit enumerates exactly which claims failed and why; the report's
   `claims` array marks each claim verified or rejected.

6. If any claim rejects, the honest outcomes are: gather the missing
   evidence, re-run stale evidence against the current artifact, or weaken
   the claim to what the evidence supports. Editing the claim record to
   delete a failing evidence id is fraud with extra steps.

7. Only verified claims go into the report or the integration decision
   (`flow/finishing-a-development-branch.md` re-checks freshness before
   offering merge or PR). State what remains unverified alongside what
   passed — a verified claim with an honest residual list is the format the
   release policy expects.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Claim typed | `schemas/completion-claims.schema.json` | id, type from the fixed vocabulary, artifact hash, evidence ids all present |
| Bound to artifact | `git rev-parse HEAD` | every evidence record's artifact hash equals the claim's (`CLAIM_ARTIFACT_MISMATCH` blocks) |
| Fresh | `lib/claim-verification-engine.mjs` | `generatedAt` within the 24-hour window and not in the future |
| Passing and scoped | `npm test` recorded with scope | status pass, exit 0, zero failures, and claim-type scope rules met (e.g. full-suite for `tests-pass`) |
| Required types covered | `npm run process:audit -- --config process.config.json` | exit 0; no `CLAIM_REQUIRED_EVIDENCE_TYPE_MISSING` / `PRODUCTION_READY_EVIDENCE_INCOMPLETE` |

## Anti-patterns

- Do not claim from memory — "I ran the tests earlier" is a claim with no
  evidence id and is rejected on sight.
- Do not re-point an old evidence id at a new build; artifact hashes exist
  precisely to make that move visible.
- Do not run only the tests you think are relevant and claim `tests-pass`;
  the full-suite scope is part of the type's definition.
- Do not say "secure" when the evidence says "these gates passed" — the
  absolute claim is rejected by design, not by caution.
- Do not backdate or borrow timestamps to beat the freshness window; stale
  evidence is re-runnable, fabricated evidence is a governance failure.
- Do not bundle claims to make failures harder to see; one type, one claim,
  one verdict each.
