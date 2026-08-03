# Visual Direction Spec

Durable record of the user’s chosen look. Write this file **after** they pick option 1 / 2 / 3 and **before** any implementation plan or code. Default path: `design/visual-direction-spec.md` (or the project’s design docs folder).

## Selection

- Selected option: 1 | 2 | 3
- Selected at (ISO timestamp):
- Chosen image / artifact:
- Reference screenshot(s):
- Unchosen options (and why they were rejected, if stated):

## What We Like (from the chosen option)

List concrete, checkable preferences — not “modern” / “clean” / “premium”:

- Hierarchy / focal point:
- Density / spacing character:
- Colour temperature and accent discipline:
- Typography character (weight, scale, measure):
- Surface / chrome / elevation:
- Motion character (if visible):
- Tone / brand feeling in one sentence:

## Direction Thesis

One sentence tying product task to the chosen look:

>

## Personality Positions (draft)

| Axis | Value (1–5) | Why (from the choice) |
|---|---:|---|
| serious ↔ playful | | |
| warm ↔ clinical | | |
| understated ↔ expressive | | |
| dense ↔ spacious | | |
| established ↔ novel | | |

## Keep from the Reference

- Primary task / critical controls:
- Layout regions that must survive:
- Platform / safe-area / design-system constraints:

## Change from the Reference

- What the chosen option deliberately changes:
- Novelty budget (at most 2–3 positions):

## Explicit Non-Goals

- Directions and unchosen options we will not rediscover:

## Linked Artifacts

- Aesthetic profile path (to write next):
- Design contract path:
- Acceptance cases (route × viewport × state):

## Iteration History

Record every 「ปรับต่อ」 round before coding. Prefer `npm run direction:iterate`.

<!-- Example
### Round 1 — 2026-08-03T12:00:00.000Z

- From option / artifact: 2 / design/direction-options/direction-option-2.png
- To option / artifact: 2b / design/direction-options/direction-option-2b.png
- Keep:
- Layout structure from option 2
- Change:
- Icons only — system glyphs
- User note: เหลือ layout แก้แค่ icon
- Status after round: awaiting confirm (เริ่มเขียน | ปรับต่อ | เลือกใหม่)
-->

## Confirmation Gate

Do **not** start implementation until the user answers one of:

1. **เริ่มเขียน** — proceed to plan + implement from this spec  
2. **ปรับต่อ** — name what to change, then revise this spec (and optionally regenerate options)  
3. **เลือกใหม่** — return to options 1 / 2 / 3

Agent prompt after writing this file:

```text
สรุปทิศทางตามที่เลือกไว้ใน spec แล้วครับ
ตอบว่า:
- 「เริ่มเขียน」ถ้าโอเค ให้ทำแผนแล้วลงมือ
- 「ปรับต่อ」พร้อมจุดที่อยากแก้
- 「เลือกใหม่」ถ้าอยากดูตัวเลือกอีกครั้ง
```

## Status

- [ ] Spec written from selected option
- [ ] User confirmed: เริ่มเขียน | ปรับต่อ | เลือกใหม่
- [ ] Aesthetic profile bound to this spec
- [ ] Design contract bound to this spec
