# Using Git Worktrees

## Why this exists

Implementation disturbs the working tree: half-finished edits, generated
artifacts, experimental dependencies. On a shared or protected branch that
disturbance becomes everyone's problem, and "just a quick change on main" is
how unreviewed work reaches a branch that policy exists to protect. Isolation
makes the experiment disposable and the protected branch fail-closed.

The classifier in `lib/workspace-safety-engine.mjs` is read-only. It
distinguishes normal repositories, linked worktrees, detached heads,
submodules, non-git directories, and isolated copies — and it refuses
implementation on protected branches (main, master) unless policy explicitly
authorizes it. `references/workspace-and-branch-safety.md` defines the rules
this flow applies; `references/parallel-task-isolation.md` covers running
several isolated workspaces at once.

## When to use

- At the start of feature or fix work — before the first edit, not after the
  first conflict on main.
- When `flow/flow-map.json` names this doc as a companion of the implement
  mode.
- Whenever multiple tasks will execute in parallel and each needs its own
  checkout.
- When the current directory state is unknown — classify before trusting it.

## The flow

1. Classify the workspace:

   ```bash
   npm run process:workspace -- --cwd .
   ```

   The report names what you are standing in. A normal repository on a feature
   branch passes. A protected branch produces a
   `PROTECTED_BRANCH_IMPLEMENTATION` blocker and exits non-zero — that is the
   gate working. `examples/process/workspace.linked-worktree.json` shows the
   snapshot shape for a correctly linked worktree.

2. On a protected-branch blocker, get the user's consent, then isolate.
   Confirm the project-owned container is ignored by git, then create the
   worktree inside it:

   ```bash
   git check-ignore .worktrees || echo ".worktrees/" >> .gitignore
   git worktree add .worktrees/task-name -b feat/task-name
   ```

   Only `.worktrees/`-style containers that the project owns qualify for
   automatic lifecycle handling. A worktree created anywhere else is
   host-owned.

3. Enter the worktree and re-classify to prove the isolation is real:

   ```bash
   npm run process:workspace -- --cwd .worktrees/task-name
   ```

   Repeat until the status passes. A worktree that still classifies as
   protected-branch work is not isolated, whatever its path says.

4. Record a green baseline before the first change:

   ```bash
   npm test
   ```

   Store the result with the task evidence. Baseline green is what makes later
   failures attributable to this task's edits instead of to inherited
   breakage.

5. Work inside the worktree for the whole task. All edits, generated files,
   and experiments stay in it; the main checkout remains reviewable at all
   times.

6. Cleanup is ownership-scoped. After the human integration decision in
   `flow/finishing-a-development-branch.md`, remove only workspaces the system
   created under the project-owned container:

   ```bash
   git worktree remove .worktrees/task-name
   ```

   Never delete a worktree outside recognized project containers, a directory
   whose origin is unknown, or anything the user created by hand.

## Evidence gates

| Gate | File / command | Exit condition |
|---|---|---|
| Workspace classified | `npm run process:workspace -- --cwd .` | classification printed before any edit; protected branches blocked by `lib/workspace-safety-engine.mjs` |
| Isolation proven | `npm run process:workspace -- --cwd .worktrees/task-name` | re-check inside the worktree exits 0 |
| Baseline green | `npm test` | full suite passes and the result is recorded before the first change |
| Cleanup owned | `git worktree list` | only system-created `.worktrees/` entries are ever removed |

## Anti-patterns

- Do not edit on main or master "just to try something" — the classifier
  fails closed on protected branches precisely because that path ends in
  unreviewed merges.
- Do not skip consent when isolation touches a protected branch; the worktree
  is the user's repository, not the agent's.
- Do not delete or prune a workspace the system does not own — host-owned
  worktrees and unknown directories are hands-off.
- Do not begin task edits before the baseline is recorded; without it, a red
  suite proves nothing about your change.
- Do not leave the only copy of task work as uncommitted files in a worktree
  that cleanup may remove — commit as tasks complete.
- Do not reuse one worktree for unrelated tasks; isolation is per task, not
  per day.
