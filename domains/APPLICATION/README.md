# APPLICATION

Domain pack for application products (web, mobile, desktop, admin, super-app surfaces).

## Load first

- Product UI/UX and interaction: `../../references/experience-design-to-system-contract.md`
- Vision loop / fidelity: `../../references/vision-loop-protocol.md`
- Visual direction for redesigns: `../../references/visual-direction-exploration.md`
- Full-stack risk when APIs/data/security matter: `../../references/fullstack-operating-model.md`

## Common application shapes

| Shape | Notes |
|---|---|
| Consumer mobile | Safe areas, touch targets, offline/empty states |
| Web SaaS / admin | Density, tables, permissions, audit trails |
| Super-app / multi-module | Navigation IA, shared design system, module isolation |
| Desktop utility | Keyboard, windows, file/system integration |

## Suggested project roots

```text
app/
  design/                 # direction spec, aesthetic profile
  ui/                     # screens, components
  api/                    # contracts
  evidence/               # capture/compare outputs
```

Use `DESIGN/` when the task is primarily look/direction; stay here when the task is shipping product behavior with UI.
