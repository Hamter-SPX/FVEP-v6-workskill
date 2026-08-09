# Requesting Code Review

## Why this exists

A review that judges "the work" instead of a specific, hashed change package
reviews nothing. The reviewer browses the current tree, the implementer fixes
in flight, and by the time the verdict lands the code has moved — the verdict
is bound to a ghost. Requesting a review in this package means assembling a
bounded package first: the base and head identities of the change, the hash of
its diff, the brief it claims to satisfy, and the test evidence that backs it.
The reviewer judges exactly those bytes and nothing else.

The auditor for the resulting chain is `lib/review-governance-engine.mjs`,
under the rules in `references/review-and-feedback-governance.md`. It rejects
unbounded packages (`UNBOUNDED_CHANGE_PACKAGE`), verdicts that are not bound
to the brief hash and diff hash (`REVIEW_BRIEF_HASH_MISMATCH`,
`REVIEW_DIFF_HASH_MISMATCH`), and any merge attempted while a critical or
important finding is still open (`OPEN_BLOCKING_REVIEW_FINDING`). Review is
the gate between "implemented" and "integrated" — nothing merges on the
implementer's say-so.

## When to use

- After implementation completes a task or the whole change, and always
  before merge — no exceptions for "small" changes.
- When `flow/flow-map.json` names this doc for the resolved mode (review).
- When the reviewer must be someone other than the implementer — which is
  always, because `SELF_REVIEW_FORBIDDEN` is a blocker, not a warning.

## The flow

1. Pin the boundaries of the change before asking anyone to look at it:

   ```bash
   git rev-parse HEAD~1          # baseId — or the recorded task base
   git rev-parse HEAD            # headId
   ```

   The base is the identity captured when the task started (see
   `flow/subagent-driven-development.md`); the head is the tip of the
   finished work.

2. Compute the diff identity and the bounded file list:

   ```bash
   git diff --stat <baseId>..<headId>
   git diff <baseId>..<headId> | shasum -a 256
   ```

   The file list is the package boundary. If a file outside it matters to the
   verdict, the boundary is wrong — redraw it before dispatch, not after.

3. Assemble the package from `templates/review-package.md`: task id, brief
   hash, base and head identities, diff hash, bounded files, test evidence
   ids, implementer report hash, and known concerns. Known concerns are
   factual — "edge case X untested because Y", not "probably fine".

4. Choose the reviewer identity. Any identity that produced the change is
   disqualified. Dispatch the reviewer with the package file and nothing
   else: not the implementer's session, not narration, not "context you might
   need". The package is deliberately complete; additions break its honesty.

5. Require of the reviewer two explicit verdicts out of
   `templates/review-package.md`'s output section:
   - **Spec verdict** — does the change satisfy the brief's stated
     requirements? pass or fail, with the requirement each judgement cites.
   - **Quality verdict** — is the change well-made on its own terms? pass or
     fail, with findings.
   Plus findings with stable ids, severity, location, and load-bearing
   status, and an explicit list of what the reviewer could not verify.

6. Record the chain in the workspace (shape:
   `examples/process/review-chain.json`; schema:
   `schemas/review-chain.schema.json`) and audit it:

   ```bash
   npm run process:review -- --input .superpowers/sdd/<plan-slug>/task-N-review-chain.json
   ```

   Exit 0 means: package bounded, identities bound, reviewer independent,
   both verdicts present, no open blocking finding. Exit 1 names the exact
   gap — `CHANGE_PACKAGE_INCOMPLETE`, `SPEC_VERDICT_MISSING`,
   `QUALITY_VERDICT_MISSING` are the usual first-run failures.

7. If verdicts carry critical or important findings, hand them to
   `flow/receiving-code-review.md` for adjudication and run the fix loop.
   Every fix round gets its own bounded diff, its own test evidence, and a
   scoped re-review bound to that round's diff hash — otherwise
   `FIX_ROUND_REVIEW_MISSING` blocks the chain.

8. Only after `npm run process:review` exits 0 is the change eligible for
   `flow/finishing-a-development-branch.md`. A passing unit suite is not a
   substitute: the gate is the reviewed chain, and the merge step checks it
   again.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Change pinned | `git rev-parse <baseId>` / `<headId>` | base identity predates the task's first commit; head is the reviewed tip |
| Package bounded | `templates/review-package.md` + `git diff --stat <base>..<head>` | explicit file list; diff hash over exactly those files; brief hash recorded |
| Reviewer independent | `lib/review-governance-engine.mjs` | `reviewerId` differs from implementer id; engine reports `independentReview: true` |
| Dual verdicts | `npm run process:review -- --input <chain>.json` | spec verdict and quality verdict both `pass` or both explicitly `fail`; nothing missing |
| No blocking finding | `npm run process:review -- --input <chain>.json` | exit 0 — zero open critical/important findings; addressed findings carry a re-review id |
| Final review | `examples/process/review-chain.json` shape | independent final verdict bound to the full change diff hash (`FINAL_REVIEW_MISSING` blocks) |

## Anti-patterns

- Do not request review over "the branch" or "the current state" — an
  unbounded package fails the engine, and rightly so: the reviewer cannot
  know what they judged.
- Do not merge without a passing review chain. The route around the gate is
  not an argument with the engine; there is no route.
- Do not let the implementer review their own work, even partially, and do
  not "pre-align" the reviewer with hints — independence is what you are
  buying.
- Do not return a single blended verdict. Spec and quality answer different
  questions; a correct-but-ugly change and a beautiful-but-wrong change must
  both be sayable.
- Do not quietly fix code between review and merge without re-binding: head
  moves, diff hash moves, the chain no longer covers what you are merging.
- Do not treat missing `cannot-verify` items as thoroughness — an empty list
  from a reviewer who could not run the code is a red flag, not a clean bill.
