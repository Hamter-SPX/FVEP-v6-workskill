# Mobile Vision-in-the-Loop (iOS) — Design

**Date:** 2026-08-08
**Status:** Approved (design) — pending implementation plan
**Package:** fullstack-vision-engineering-pro v5 (`Hamter-SPX/fullstack-vision-engineering-pro-v5`)
**Driver use-case:** HeloSChat (Flutter, iOS Simulator) — visual verification loop บนเครื่องที่โมเดลอาจไม่มีสิทธิ์อ่านรูปภาพโดยตรง

---

## 1. Background / ปัญหา

Vision loop ปัจจุบันของ skill ครอบ 2 สมมุติฐานที่ไม่จริงเสมอ:

1. `capture.mjs` ใช้ Playwright — จับได้เฉพาะ web; **แอป native (Flutter/iOS/Android) จับไม่ได้**
2. ขั้น "ตัดสินภาพ" สมมุติว่ามีผู้พิพากษาที่เห็นรูป — **โมเดล text-only ตัดสินไม่ได้** ทั้งที่ protocol มี "Tool-Degraded Operation" รองรับแนวคิดนี้แล้วแต่ไม่มีเครื่องมือจริง

## 2. Goals

- G1: จับภาพจาก **iOS Simulator** (เริ่มต้น; Android เป็น stub ที่เอกสารชัดเจน) แล้ว artifact เข้ากับ pipeline เดิม (`compare`, `ascii-map`, `layout-structure`) **โดยไม่แก้ของเดิม**
- G2: ชั้นตัดสิน **metrics-first** — ตัวเลข deterministic จาก PNG ที่ text-only model อ่านแล้วตัดสิน/ตั้ง gate ได้
- G3: **Judge slot** สลับผู้พิพากษาได้ 3 โหมด (metrics / model / human) โดย verdict ลง schema เดียวกัน
- G4: ไม่เพิ่ม npm dependency ใหม่ (ใช้ pngjs/pixelmatch ที่มีอยู่)

## 3. Architecture

```
┌ capture-mobile.mjs (xcrun simctl io) ─► cur.png + cur.meta.json ┐
│                                                                  ├─► compare / ascii-map / layout-structure (ของเดิม)
contracts/goal ─► vision-metrics ─► metrics.json + สรุปข้อความ ─► vision-judge ─┬─ metrics: pass/warn/fail อัตโนมัติ
                                                                                ├─ model: judgment package → vision-model/human sign-off
                                                                                └─ human: โชว์+รอ verdict
                                                                                          │
                                                              verdicts ◄── schemas/vision-judgment.schema.json
```

## 4. Components

### 4.1 `scripts/capture-mobile.mjs` + `lib/mobile-capture-engine.mjs` (adapter)

- iOS capture: `xcrun simctl io <udid|booted> screenshot <out.png>`
- Optional pre-actions: `xcrun simctl launch booted <bundleId>`, `xcrun simctl openurl booted <url>` + `--settle <sec>`
- Sidecar meta: `{udid, device_name, scale, captured_at, label, platform}` — รูปแบบตรงกับ artifact ที่ compare/ascii-map ใช้อยู่
- CLI ตัวอย่าง: `node scripts/capture-mobile.mjs --udid booted --out .fx/cur.png --label chat --settle 1.5`
- `--platform android`: พิมพ์ข้อความ "phase 2 — ยังไม่ implement" แล้ว exit non-zero (ไม่ทำเงา)

### 4.2 `lib/vision-metrics-engine.mjs` + `scripts/vision-metrics.mjs` (judgment layer)

Input PNG (pngjs decode) → metrics:

| Metric | นิยาม | ใช้ตัดสินอะไร |
|---|---|---|
| `occupancy` | grid NxM — สัดส่วน pixel ไม่ใช่พื้นหลังต่อ cell ("พื้นหลัง" = สี dominant ที่ sample จากขอบภาพ ±tolerance) | มุมว่าง, สมดุลซ้าย/ขวา-บน/ล่าง (อ้ง scene-completeness) |
| `palette` | top-k สีถ่วงน้ำหนัก + harmony class | ผ่าน `lib/color-harmony-engine.mjs` เดิม |
| `density` | mean gradient magnitude ต่อ cell | ความรก/หนาแน่นเชิงพื้นที่ |
| `alignment` | สัดส่วนขอบแข็งที่ตกบนแนว grid ร่วมกัน | ความเป็นระเบียบเชิงเรขาคณิต |
| `contrast` | luminance histogram + สัดส่วนคู่ extreme | อ่านง่าย/จม |

Output: `metrics.json` + สรุปข้อความ (ไทย+อังกฤษ) ที่ agent อ่านเพื่อตัดสิน — ทุกตัวเลข deterministic (input เดิมต้องได้ output เดิม)

### 4.3 `lib/vision-judge-engine.mjs` + `scripts/vision-judge.mjs` (judge slot)

โหมด (เลือกด้วย `--judge`):
- `metrics` (default): threshold จาก config (`vision-judge.config` หรือ flags) → verdict `pass|warn|fail` + findings
- `model`: เขียน judgment package (paths ของ captures + metrics + goal statement) ให้ vision-model/บุคคล sign-off → รับ verdict กลับผ่าน `--verdict-file`
- `human`: โชว์ข้อมูลแล้วรอ verdict จาก stdin/flag

Verdict ทุกโหมดเขียนลง schema เดียว: `schemas/vision-judgment.schema.json` (ใหม่) — fields: `case_label, mode, verdict, findings[], metrics_ref, capture_ref, judged_by, judged_at, notes`

### 4.4 Wiring เข้าระบบเดิม

- `vision-loop.config.example.json` เพิ่มตัวอย่าง `"capture": {"type": "ios-sim", "udid": "booted"}` — default เดิม `playwright` ไม่เปลี่ยน (ของเดิมไม่กระทบ ไม่แก้ `vision-loop.mjs` ในรอบนี้ นอกจากเอกสาร/ตัวอย่าง config)
- `package.json` scripts เพิ่ม: `capture:mobile`, `vision:metrics`, `vision:judge`
- `CHANGELOG.md` + `README_TH.md`/`README.md`: บันทึกความสามารถใหม่ (ขั้นตอนแยก commit)

### 4.5 Tests (pattern เดิม `tests/unit/*.test.mjs`, `node --test`)

- `mobile-capture-engine.test.mjs`: command construction (mocked exec), sidecar meta, booted-not-found error path
- `vision-metrics.test.mjs`: fixture PNG เจนโปรแกรม (สร้างด้วย pngjs ในเทสต์) → occupancy/palette/density deterministic; empty image; single-color image
- `vision-judge.test.mjs`: 3 โหมด + schema validation + threshold pass/warn/fail boundaries

## 5. Data flow / ตัวอย่างการใช้

```bash
node scripts/capture-mobile.mjs --udid booted --out .fx/cur.png --label chat
node scripts/vision-metrics.mjs --image .fx/cur.png --grid 8x5 --out .fx/metrics.json
node scripts/vision-judge.mjs --judge metrics --metrics .fx/metrics.json --goal "Chat list: hierarchy ชัด, ไม่มีมุมว่างเปล่า" --out .fx/verdict.json
# เมื่อมี vision-model: --judge model --verdict-file .fx/human-verdict.json
```

## 6. Non-goals

- Android adapter (เฟส 2 — stub เท่านั้น)
- OCR/text recognition จากภาพ
- แก้ engine เดิม (compare/ascii-map/layout-structure/aesthetics) — เข้าผ่าน artifact contract เท่านั้น
- ImageGen direction tooling
- CI workflow changes (.github) ในรอบนี้ — เสนอเป็น follow-up

## 7. Rollback

ชิ้นส่วนใหม่ทั้งหมดเป็นไฟล์เพิ่ม (additive) — ลบไฟล์/ scripts keys ทิ้งได้โดยไม่กระทบระบบเดิม

## 8. Open questions

- ไม่มี — design ผ่านการอนุมัติ (2026-08-08)
