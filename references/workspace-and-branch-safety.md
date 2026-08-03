# Workspace and Branch Safety

Workspace classification is read-only. It distinguishes normal repositories, linked worktrees, detached heads, submodules, non-git directories, and isolated copies. Implementation on protected branches fails closed unless policy explicitly authorizes it.

Project-local worktree containers must be confirmed ignored before creation. Cleanup ownership is inferred only for recognized project-owned containers. A linked worktree outside those containers is host-owned and must not be automatically removed.

Detached state changes the allowed integration options. Destructive actions always require explicit confirmation. Baseline tests are separate evidence and should be recorded before implementation so later failures can be attributed correctly.
