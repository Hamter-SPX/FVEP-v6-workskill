# Domains

Work packs for this skill, separated by product shape. Core process, vision loop, and aesthetic gates still apply; open only the domain folder that matches the task.

| Folder | Use when |
|---|---|
| [`GAME/`](GAME/README.md) | Games — many genres, UI/HUD, assets, systems, tools |
| [`APPLICATION/`](APPLICATION/README.md) | Apps and products — web/mobile/desktop surfaces |
| [`DESIGN/`](DESIGN/README.md) | Visual direction, brand, craft, screenshots → options |
| [`GENERAL/`](GENERAL/README.md) | Cross-cutting work — process, backend, release, docs |
| [`ROLES/`](ROLES/README.md) | Discipline packs — what each role owns, its gates, its red flags |

## How to route

```text
identify domain (GAME | APPLICATION | DESIGN | GENERAL)
→ open that folder’s README
→ load only the genre/system notes you need
→ add the ROLES pack(s) for the disciplines the task touches
→ still follow SKILL.md process + visual-direction rules when UI is involved
```

Agents outside Cursor (CLI, DeepSeek, etc.) should treat these folders as the map of what to load, then run the matching `npm run …` gates from the skill root.
