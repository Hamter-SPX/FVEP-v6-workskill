# Integration and Cleanup

Integration is a decision boundary owned by the user. The system may prepare options but does not choose. Named branches can offer local merge, push/pull request, or keep-as-is. Detached workspaces cannot offer local merge until a branch exists.

Merge or push requires a fresh full-suite result bound to the current artifact. Local merge also requires a confirmed base branch. Cleanup is allowed only for a workspace the system owns and, after merge, only when the merged result is verified.

Discard is outside the normal menu. It requires the exact confirmation token, actor and timestamp, commit inventory, workspace path, and cleanup ownership. A vague confirmation never authorizes deletion.
