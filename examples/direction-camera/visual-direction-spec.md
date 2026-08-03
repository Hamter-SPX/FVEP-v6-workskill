# Visual Direction Spec

Durable record of the user’s chosen look for **Field Camera**.

## Selection

- Selected option: 2
- Selected at (ISO timestamp): 2026-08-03T14:30:00.000Z
- Chosen image / artifact: design/direction-options/direction-option-2b.png
- Reference screenshot(s): design/direction-options/reference-stock-camera.png
- Unchosen options (and why they were rejected, if stated): 1 too dense for one-handed use; 3 too playful for capture stakes

## What We Like (from the chosen option)

- Hierarchy / focal point: shutter dominates the lower third; viewfinder stays uninterrupted
- Density / spacing character: generous chrome margins; quiet tool strip
- Colour temperature and accent discipline: cool neutrals; single amber accent on shutter
- Typography character (weight, scale, measure): medium grotesque; clear mode labels
- Surface / chrome / elevation: flat glass; low elevation; no card stacks in the finder
- Motion character (if visible): short ease-out on shutter feedback only
- Tone / brand feeling in one sentence: calm precision for one-handed field capture

## Direction Thesis

> Calm one-handed capture with spacious chrome and a single amber shutter accent.

## Personality Positions (draft)

| Axis | Value (1–5) | Why (from the choice) |
|---|---:|---|
| serious ↔ playful | 2 | Capture stakes stay serious |
| warm ↔ clinical | 3 | Cool neutrals with one warm amber accent |
| understated ↔ expressive | 2 | Quiet chrome; accent only on shutter |
| dense ↔ spacious | 4 | Chosen option opened the margins |
| established ↔ novel | 3 | Familiar camera grammar; novelty in accent + icons |

## Keep from the Reference

- Primary task / critical controls: shutter and mode switch stay thumb-reachable
- Layout regions that must survive: viewfinder fills the upper field
- Platform / safe-area / design-system constraints: iOS safe areas; system camera permissions copy

## Change from the Reference

- What the chosen option deliberately changes: removes dense top tool strips; cools the palette; amber shutter only
- Novelty budget (at most 2–3 positions): amber shutter accent + spacious chrome + system glyph icons (round 2b)

## Explicit Non-Goals

- Neon gradients and sticker chrome from option 3
- Dense utilitarian strip from option 1
- Decorative motion on mode changes

## Linked Artifacts

- Aesthetic profile path (to write next): aesthetic-profile.json
- Design contract path: design-contract.json
- Acceptance cases (route × viewport × state): camera__mobile__default

## Iteration History

### Round 1 — 2026-08-03T14:10:00.000Z

- From option / artifact: 2 / design/direction-options/direction-option-2.png
- To option / artifact: 2b / design/direction-options/direction-option-2b.png
- Keep:
- Layout structure and spacious chrome from option 2
- Amber shutter accent
- Change:
- Icons only — replace decorative glyphs with system camera icons
- User note: เหลือ layout แก้แค่ icon
- Status after round: awaiting confirm (เริ่มเขียน | ปรับต่อ | เลือกใหม่)

## Confirmation Gate

Do **not** start implementation until the user answers one of:

1. **เริ่มเขียน** — proceed to plan + implement from this spec  
2. **ปรับต่อ** — name what to change, then revise this spec  
3. **เลือกใหม่** — return to options 1 / 2 / 3

## Status

- [x] Spec written from selected option
- [x] User confirmed: เริ่มเขียน
- [x] Aesthetic profile bound to this spec
- [x] Design contract bound to this spec
