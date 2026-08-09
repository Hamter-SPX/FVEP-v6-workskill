# Flow Layer — One Framework

The Flow Layer is FVEP's own conversation-level discipline: fourteen flows that carry
a task from "let's build" to "integrated with evidence". Each flow keeps the same
contract: **Why → When → Steps → Evidence gates → Anti-patterns**.

| Flow doc | Governs | Mode |
|---|---|---|
| [using-one-framework](using-one-framework.md) | routing to the right flow before any action | analyze |
| [brainstorming](brainstorming.md) | explore → compare → approve before implementation | design-ui / design-game |
| [writing-plans](writing-plans.md) | executable, exact, test-first plans | design-ui / implement |
| [using-git-worktrees](using-git-worktrees.md) | isolation + baseline verification | implement |
| [test-driven-development](test-driven-development.md) | observed RED before production code | implement |
| [subagent-driven-development](subagent-driven-development.md) | task implementers + reviews + bounded fix loop | implement |
| [executing-plans](executing-plans.md) | inline execution when no subagent runtime | implement |
| [dispatching-parallel-agents](dispatching-parallel-agents.md) | parallelize only independent domains | implement |
| [systematic-debugging](systematic-debugging.md) | reproduce → hypothesize → one-variable → root cause | debug |
| [requesting-code-review](requesting-code-review.md) | review before merge, always | review |
| [receiving-code-review](receiving-code-review.md) | accept feedback with evidence, not theater | review / debug |
| [verification-before-completion](verification-before-completion.md) | evidence before every success claim | ship |
| [finishing-a-development-branch](finishing-a-development-branch.md) | human-owned integration decision | ship |
| [writing-skills](writing-skills.md) | skills proven by pressure scenarios | author-skill |

## Attribution

The flow disciplines here are original adaptations inspired by Superpowers
(© 2025 Jesse Vincent, MIT License — https://github.com/obra/superpowers). The
principles are retained; the text, structure, and engine bindings are our own.
See LICENSE.
