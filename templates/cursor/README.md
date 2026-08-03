# Cursor templates — visual direction

Install into a project so screenshot/redesign chats follow the exploration protocol.

## Contents

| Path | Role |
|---|---|
| `rules/visual-direction-redesign.mdc` | Always-on agent rule (primary enforcement) |
| `hooks.json` | Registers `beforeSubmitPrompt` hook |
| `hooks/visual-direction-redesign.mjs` | Detects redesign language / image attachments; reminds the user; writes `design/.direction-trigger.json` |

`beforeSubmitPrompt` cannot inject model context in current Cursor — it only supports `continue` / `user_message`. The **rule** is what the agent must follow; the hook is a human-visible reminder + on-disk trigger marker.

## Install

From the skill package root, targeting the project that should receive the templates:

```bash
npm run direction:cursor-install -- --dir /path/to/your-app
# or, from inside the app with the skill on NODE_PATH / copied locally:
npm run direction:cursor-install
```

This writes:

```text
.cursor/rules/visual-direction-redesign.mdc
.cursor/hooks.json          # merges visual-direction hook if a hooks.json already exists
.cursor/hooks/visual-direction-redesign.mjs
```

Reload Cursor hooks after install (Cursor Settings → Hooks, or restart the window).

## Verify

1. Start a chat, attach a UI screenshot, say “redesign this”.
2. Expect the rule to steer the agent into options 1/2/3.
3. Optional: check `design/.direction-trigger.json` after send.
