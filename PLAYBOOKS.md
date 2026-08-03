# Playbooks

Copy-paste flows for the jobs this skill is actually asked to do. Each one is the shortest
path that still produces evidence. Read the linked reference when a step needs judgment.

**Every playbook starts and ends the same way.** Start by naming the mode; end by re-checking
your own work before you present it.

```bash
npm run mode -- resolve "<the user's request, in their words>"
# ... the playbook ...
npm run recheck -- plan --mode <that mode>
npm run recheck -- audit --record .fx/recheck.json
```

References: `references/operating-modes.md` · `references/recheck-protocol.md`

---

## 1. "Here is a screenshot — redesign it"

Mode: `design-ui`

```bash
npm run direction:runtime                      # decide the ImageGen presentation plan
npm run direction:init                         # scaffold design/ artifacts
# draft 2–3 theses, then gate them BEFORE showing the user
npm run direction:distinctness -- --options design/direction-options/options.json
```

1. Present options **1 / 2 / 3** and stop for a numbered choice. Near-duplicates are blocked
   by the distinctness gate — the same layout with a different accent hue is one option, not
   three.
2. Write `design/visual-direction-spec.md`, then stop for **เริ่มเขียน | ปรับต่อ | เลือกใหม่**.
3. On **ปรับต่อ**: `npm run direction:iterate`. Only after **เริ่มเขียน**:

```bash
npm run direction:sync
# implement, then:
npm run audit:aesthetics -- --input aesthetic-audit.json
npm run vision-loop -- --config vision-loop.config.json
```

Reference: `references/visual-direction-exploration.md`

---

## 2. "This does not look like the reference — fix it"

Mode: `match-ref`

```bash
npm run vision:triage -- --ref design/ref.png --cur artifacts/cur.png --history .fx/triage-history.json
```

Apply the one change under `NEXT SINGLE CHANGE`, re-capture, run it again. Repeat until the
command exits `0`. If it reports a stall, stop and re-read the reference at region level:

```bash
npm run ascii-map -- --ref design/ref.png --cur artifacts/cur.png 92 735 62 60 --label PHOTO
npm run layout-structure -- check --structure .fx/ref-structure.json --cur artifacts/cur.png --region photo=95,735,62,60
```

Reference: `references/visual-delta-triage.md` · Prompt: `prompts/vision-triage-loop.md`

---

## 3. "Keep watching until it matches"

Mode: `match-ref`

```bash
npm run layout-structure -- remember --ref design/ref.png --region photo=92,738,62,60 --write .fx/ref-structure.json
npm run layout-structure -- until-match --structure .fx/ref-structure.json --cur .fx/cur.png \
  --regions .fx/regions.json --interval 2 --capture-to .fx/accepted.png
```

The loop keeps checking the current capture against the remembered layout and stops the
moment it matches, so you can keep editing while it watches.

---

## 4. "Design a scene / level / map"

Mode: `design-game`

```bash
cp templates/scene-brief.md design/scene-brief.md      # then write the JSON form
npm run audit:scene -- --brief design/scene-brief.json  # brief-only pass: is the intent designed?
# build the blockout in grey geometry, capture the establishing shot, then:
npm run audit:scene -- --image artifacts/blockout.png --brief design/scene-brief.json --grid 8x5
```

Fix empty corners and missing depth layers **in the blockout**, before materials. Then run it
again on the lit frame, and on the worst procedural seed if the map is generated.

References: `references/scene-completeness.md`, `references/world-building-and-level-blockout.md`

---

## 5. "Design the assets for this game"

Mode: `design-game`

```bash
cp templates/game-asset-spec.md design/assets/<asset>.md
# collect the set into design/game-assets.json, then:
npm run audit:game-assets -- --assets design/game-assets.json --frame-triangle-budget 250000
```

Every asset needs a silhouette read, a scale with a comparison reference, a style binding, a
budget, an acceptance distance, and an in-context capture. Then prove it in the scene:

```bash
npm run audit:scene -- --image artifacts/asset-in-context.png --brief design/scene-brief.json
```

Reference: `references/game-asset-direction.md` · Example: `examples/game-assets.example.json`

---

## 6. "Build a Roblox map"

Mode: `design-game`

1. Read `domains/GAME/platforms/roblox-maps.md` and `domains/GAME/graphics/ugc-avatar-platform.md`.
2. Fix the authoring unit as studs and state every asset scale against avatar height.
3. Blockout with real collision, then run the scene gate on the establishing shots.
4. Budget parts and draw calls per region before art passes; decide streaming boundaries
   while the geometry is still grey.
5. Run the asset gate on the prop set, with the frame budget for the target device tier.

---

## 7. "Ship a feature end to end"

Mode: `implement then ship`

```bash
npm run process:route -- --input request.json
npm run process:plan -- --plan implementation-plan.json
npm run process:tdd -- --evidence tdd-evidence.json
npm run audit:fullstack -- --config fullstack.config.json
npm run process:audit -- --config process.config.json
npm run fullstack:quality-gate -- --report artifacts/fullstack-audit/reports/fullstack-report.json
```

Pick the role packs the change touches from `domains/ROLES/` and satisfy their gates too.

---

## 8. "Make sure the skill itself is healthy"

Mode: `author-skill`

```bash
npm test
npm run validate
npm run skill:conformance
npm run docs:all-in-one
```

`npm run validate` is the one that matters: required files, JSON, syntax, dangerous
patterns, the full unit suite, CLI help smoke tests, and the bundled example audits.

---

## 9. "Design the effects and the sound"

Mode: `design-game`

Effects and sound carry information, so they are specified and audited like any other asset —
with extra fields, because they fail differently.

```bash
# add vfx / audio / animation entries to design/game-assets.json, then:
npm run audit:game-assets -- --assets design/game-assets.json
```

- **vfx** needs `timing` in milliseconds, `readability` under overlap, and whether it is
  gameplay-critical or decorative.
- **audio** needs `layers` (attack, body, tail), `mixBus` with its ducking rule,
  `repetitionPlan`, and the `redundantCue` for muted or deaf players.
- **animation** needs `timing`, `cancelWindow`, and `telegraph`.

Prove it in the worst realistic moment: several actors, full ambience, busiest background.
One effect on a black background proves nothing.

References: `references/vfx-and-sfx-direction.md`, `references/game-feel-and-juice.md`

---

## 10. "Before you show me anything"

Any mode. This is the last step of every other playbook.

```bash
npm run recheck -- plan --mode <mode>
# work the list, write the record from templates/recheck-record.md
npm run recheck -- audit --record .fx/recheck.json
```

Answer four questions in writing: what am I claiming, what proves each claim, how would I know
if I were wrong, and what did I never look at. Fix what the pass finds **before** presenting.

Reference: `references/recheck-protocol.md` · Prompt: `prompts/recheck-pass.md` ·
Example: `examples/recheck.example.json`
