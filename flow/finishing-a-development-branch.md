# Finishing a Development Branch

## Why this exists

Integration is the moment work stops being yours and becomes everyone's.
That ownership transfer is a human decision by design, not by politeness:
merge-to-what, push-where, and delete-which are the three questions where an
agent's confident guess does irreversible damage a test suite cannot undo.
The system therefore never auto-merges. It verifies, computes the option
menu the workspace state actually supports, presents it, and waits.

The decision engine in `lib/integration-decision-engine.mjs`, under
`references/integration-and-cleanup.md`, formalizes the boundary. Given a
named branch it offers exactly three options — `merge-local`, `push-pr`,
`keep-as-is`; a detached workspace loses the merge option until a branch
exists. Merge and PR demand a fresh full-suite pass bound to the current
artifact (`INTEGRATION_VERIFICATION_STALE`,
`INTEGRATION_TESTS_NOT_PASSING`). Cleanup is allowed only for workspaces the
system itself owns. Discard exists but sits outside the normal menu, behind
an exact confirmation token, because deleting unintegrated work is the one
action no evidence can recover.

## When to use

- When implementation is complete, the review chain has passed
  (`flow/requesting-code-review.md`), and verification is fresh
  (`flow/verification-before-completion.md`).
- When `flow/flow-map.json` names this doc as companion of the ship mode.
- Not earlier: a workspace with open blockers or stale evidence has no
  valid options to choose from.

## The flow

1. Refresh verification against the exact artifact being finished:

   ```bash
   npm test
   git rev-parse HEAD
   ```

   Integration consumes the current artifact hash; a suite pass from before
   the last commit fails `INTEGRATION_VERIFICATION_STALE` downstream —
   refresh, don't reuse.

2. Classify the workspace so the option menu is honest:

   ```bash
   npm run process:workspace -- --cwd .
   ```

   Named branch, detached head, and cleanup ownership
   (`cleanupOwned`) are the engine's inputs for the menu and for what
   cleanup may ever touch.

3. Assemble the decision record from `templates/integration-decision.md`
   (schema: `schemas/integration-decision.schema.json`; a decision-free
   example: `examples/process/integration.decision-required.json`) and run
   the preparation with no decision filled in:

   ```bash
   npm run process:integration -- --input <integration.json>
   ```

   The report returns `status: decision-required` with `allowedOptions`
   computed for this workspace: `merge-local`, `push-pr`, `keep-as-is` on a
   named branch; `push-pr`, `keep-as-is` from a detached head. This is the
   menu — three options at most, never a recommendation.

4. Present the menu to the user and wait. The human picks the option and
   owns the consequences; the agent supplies facts (commit inventory, open
   residuals, artifact hash) and no preference engineering.

5. Record the human's pick in the decision record — actor, timestamp,
   option, cleanup requested — and validate it:

   ```bash
   npm run process:integration -- --input <integration.json>
   ```

   Exit 0 means the option is allowed for this workspace state and its
   preconditions hold: fresh full-suite pass bound to the artifact, a
   confirmed base branch for local merge (`BASE_BRANCH_MISSING` otherwise),
   a configured remote for the PR option (`REMOTE_NOT_CONFIGURED`), and —
   from a detached head — no local merge at all
   (`MERGE_FROM_DETACHED_HEAD`).

6. Execute exactly the pick:
   - `merge-local`: checkout the confirmed base, merge, then run the suite on
     the **merged result** before any cleanup — worktree removal after merge
     requires that merged-result pass (`MERGED_RESULT_NOT_VERIFIED`).
   - `push-pr`: push the branch and open the pull request with the verified
     claims and residual list in the body.
   - `keep-as-is`: change nothing; the workspace stands with its decision
     recorded.

7. Cleanup is ownership-scoped, per `flow/using-git-worktrees.md`. Remove
   only workspaces the system created inside a project-owned container
   (`cleanupOwned: true`) and only when the engine reports
   `cleanupAllowed: true`:

   ```bash
   git worktree remove .worktrees/task-name
   ```

   Everything else — host-owned worktrees, hand-made directories, anything of
   unknown origin — is hands-off forever.

8. Discard is the exception path, never a menu convenience. It requires the
   exact confirmation token `discard` typed by the human, a complete commit
   inventory, the workspace path, and owned cleanup — validated through the
   same `npm run process:integration` input before anything is deleted. A
   vague "sure, delete it" authorizes nothing.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Verification fresh | `npm test` + `git rev-parse HEAD` | full-suite pass bound to the current artifact hash, inside the freshness window |
| Menu computed | `npm run process:integration -- --input <integration.json>` | `status: decision-required`, `allowedOptions` match the workspace state |
| Decision human-owned | `templates/integration-decision.md` | actor, timestamp, and option recorded by the user before any execution |
| Preconditions hold | `lib/integration-decision-engine.mjs` | exit 0 on the decision: base branch, remote, freshness, and detached-head rules satisfied |
| Cleanup owned | `git worktree list` | `cleanupAllowed: true`; only system-created project-owned workspaces removed |
| Merged result verified | `npm test` on the merged base | required before worktree cleanup after a local merge |

## Anti-patterns

- Do not auto-merge after a green suite, and do not narrow the menu to steer
  the human — presentation of options is the system's job; picking is not.
- Do not offer `merge-local` from a detached workspace or `push-pr` without a
  remote; the engine computes allowed options because agents guess wrong.
- Do not clean up workspaces you did not create, and do not clean up an
  owned one before the merged result itself passes.
- Do not treat "looks merged" as merged — evidence or nothing; the
  integration engine is the only verdict.
- Do not paraphrase the discard confirmation ("you said yes earlier") — the
  exact token, an inventory, and ownership are all required, every time.
- Do not delete uncommitted leftovers in a workspace before confirming they
  appear in the commit inventory; otherwise the inventory lied.
