# Visual Direction Prompt Pack

Route to the right operator prompt after `npm run direction:runtime`.

| Runtime plan | Prompt |
|---|---|
| `inline-and-gallery` or confirmed ImageGen on Cursor/Codex | `prompts/visual-direction-exploration-ide.md` |
| `gallery-only` (images on disk, chat text-only) | IDE prompt for generation (if any) + gallery commands from either pack |
| `prose-with-gap` / CLI / no ImageGen | `prompts/visual-direction-exploration-cli.md` |
| `ci-gate-only` | No exploration prompt — run `npm run direction:gate` |

Shared base (both packs inherit rules from):

- `prompts/visual-direction-exploration.md`
- `references/visual-direction-exploration.md`
- `agents/design-director.md`

End-to-end filled artifacts: `examples/direction-camera/`.

Cursor install templates (rule + hook): `templates/cursor/` · `npm run direction:cursor-install`.
