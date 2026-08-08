# Mobile Vision Loop — Full Wiring (A1–A4) Design

**Date:** 2026-08-08
**Status:** Approved (design) — pending implementation plan
**Package:** fullstack-vision-engineering-pro v5 (`Hamter-SPX/fullstack-vision-engineering-pro-v5`)
**Depends on:** `docs/2026-08-08-mobile-vision-in-the-loop-design.md` (phase 1 — shipped)

---

## 1. Background

Phase 1 ส่ง capture-mobile (iOS, CLI แยก), vision-metrics, vision-judge แล้ว — แต่ยังไม่ได้เชื่อมเข้า `vision-loop.mjs` (orchestrator หลัก; `capture.type="ios-sim"`/config example ยังเป็น placeholder inert) งานรอบนี้ปิด 4 แกน:

- **A1** wire mobile เข้า vision-loop (สาขา capture.type + matrix mobile)
- **A2** Android adapter (adb — แทน stub)
- **A3** sha256 provenance chain (verdict ผูก capture จริง)
- **A4** value-level validation ของ verdict (model/human)

**จุดอ้างโค้ดจริง (verified 2026-08-08):**
- `scripts/vision-loop.mjs` (138 บรรทัด): orchestrator — capture→inspect→a11y→interaction→state-crawler→performance→tokens→breakpoints→baseline→engineering→compare→manual-review→aesthetics→summary (web-only หลายส่วนเพราะพึงพา DOM/axe)
- `lib/capture-engine.mjs`: `captureAll(config,{mode,baseUrl,headed,filters})` → `runCaseMatrix`; metadata `schemaVersion: 2` มี `screenshotSha256` + `screenshotBytes` อยู่แล้ว (convention ที่ A3 จะ mirror)
- `lib/artifacts.mjs`: `artifactPaths(outputDir, caseDefinition)` — layout artifact กลางที่ mobile ต้องใช้ร่วม
- AVD พร้อม: `Helos_Pixel6_API35` + adb ที่ `~/Library/Android/sdk/platform-tools/adb`

## 2. Architecture (A1 — สาขาใน vision-loop, ไม่สร้าง script ใหม่)

```
vision-loop.mjs
├─ config.capture.type ∈ {playwright (เดิม), ios-sim, android}
│
└─ ถ้า mobile ────────────────────────────────────────────────
   capture: captureAllMobile(config, {mode, filters})          # config.mobile.cases[] → simctl/adb per case
   compare: compareAll(config)                                  # PNG pipeline เดิม (เทียบ stored reference)
   mobileChecks: per-case metrics (computeVisionMetrics)
              → per-case judge (judgeMetrics, thresholds จาก config.mobile.judge)
   summary: writeRunSummary (section mobile ใหม่; web-only sections skip พร้อม log เหตุผล)
```

ส่วน web-only (`inspect/a11y/interaction/state-crawler/performance/tokens/breakpoints/baseline/engineering/manual-review/aesthetics`) → **skip พร้อม log `skipped (web-only section)` ชัดเจน** ไม่ใช่เงียบ

## 3. Components

### 3.1 `lib/mobile-capture-engine.mjs` (ขยาย) — `captureAllMobile`

```js
export async function captureAllMobile(config, { mode = 'current', filters = {} } = {})
```
- วน `config.mobile.cases[]` (เคส: `{key, label, bundleId?, openUrl?, settleMs?, udid?, serial?}`)
- ต่อเคส: optional launch/openurl → settle → capture (ios: simctl / android: adb) → artifact path จาก `artifactPaths(config.outputDir, caseDefinition)` (PNG เดียวกัน layout เว็บ)
- metadata `schemaVersion: 2` fields ตาม web convention ที่ mobile มีได้ + ฟิลด์ mobile: `{platform, udid|serial, label, captured_at, png:{width,height}, screenshotSha256, screenshotBytes, launch_bundle_id?, open_url?}` (A.sub-meta เดิมของ phase 1 รวมเข้านี่เลย)
- filters (route/viewport/state/case) ตีกับ case key เหมือนเว็บ

### 3.2 `lib/android-capture-engine.mjs` (ใหม่ — A2)

- `captureAndroidScreenshot({serial='emulator-5554', out, label, settleMs=0, launchActivity?, openUrl?, exec, sleep})` — `adb -s <serial> exec-out screencap` (fallback `screencap -p /sdcard/x.png + pull` ถ้า exec-out ไฟล์พัง)
- แทน stub ใน mobile-capture-engine: CLI `--platform android` ใช้ตัวนี้
- live smoke: boot `Helos_Pixel6_API35` (timeout สมเหตุ) → capture home → meta

### 3.3 Provenance (A3)

- mobile meta + A2 meta: เพิ่ม `screenshotSha256` (sha256 ของ PNG bytes) + `screenshotBytes` — **ชื่อเดียวกับ web metadata เดิม**
- `scripts/vision-metrics.mjs`: ออกตัวเลขแล้วเขียน `source: {sha256, width, height}` ลง metrics JSON (คำนวณจาก PNG input)
- `scripts/vision-judge.mjs`: flag `--verify-source` — ถ้า metrics.json มี source และ capture_ref ชี้ไฟล์ที่มีอยู่ → hash+dim ต้องตรง มิฉะนั้น finding `sourceMismatch` severity fail

### 3.4 `vision-loop.mjs` branch + config schema

- อ่าน `config.capture.type` (default `playwright`) → mobile path: sections = `{capture, comparison, mobileChecks}`; web-only sections: skip+log
- `lib/config.mjs`: รับคีย์ `capture.type` + `mobile` (ตอนนี้ schema additionalProperties:false → ต้องแก้ `schemas/vision-loop-config.schema.json` ให้รองรับ — ปิด drift ที่ final review จับไว้)
- `vision-loop.config.example.json`: เปลี่ยน `capture_ios_sim_example` (comment เดิม) เป็น mobile example จริง `{type:'ios-sim'}` + `mobile.cases` ตัวอย่าง
- `lib/run-summary.mjs`: รองรับ section `mobileChecks` ใน gate (verdict fail ต่อเคสไหน → gate FAIL) — ถ้า schema summary ซับซ้อน ให้นับเป็น advisory section + exit code อิง verdict (กำหนดตอน plan และต้องผ่าน tests เดิม)

### 3.5 Value-level validation (A4)

`lib/vision-judge-engine.mjs` → `validateVerdictRecord` เพิ่ม:
- `mode ∈ {metrics,model,human}`
- `judged_by` string ไม่ว่าง
- ทุก findings item: `{rule: string, severity ∈ {'warn','fail'}, expected: any, observed: any}` (ตรง schema)
- `metrics_ref` / `capture_ref` / `goal` ∈ {string, null}
- + tests (คลุม: findings-item enum/type, mode แปลก, ref type ผิด)

## 4. Tests (ต่อยอดของเดิม)

- `mobile-capture-engine`: captureAllMobile matrix (mock exec; artifactPaths ถูกเรียกตรง; meta schemaVersion 2 + sha fields)
- `android-capture-engine`: adb args, fallback pull path, errors
- `vision-metrics`: source block ใน output
- `vision-judge`: `--verify-source` match/mismatch/missing-file; validateVerdictRecord deep cases
- integration (unit-level): vision-loop mobile branch กับ config fixture (mock capture/engines) — เส้นทาง web-only skipped + mobile sections present

## 5. Live smoke (หลัง unit เขียว)

- iOS Sim (booted): config ชั่วคราว type=ios-sim + case "home" → run `scripts/vision-loop.mjs` → sections ครบ + summary
- Android AVD (`Helos_Pixel6_API35`): capture + metrics + judge; ถ้า boot ล้มเหลว → บันทึก BLOCKED เหตุผล (ไม่ใช่ blocker ของงานหลัก — adb mocked tests ยังเขียว)

## 6. Non-goals

- ไม่แก้ web path/behavior ของ vision-loop เดิม (branch เสริมเท่านั้น)
- ไม่ทำ OCR/motion/state-crawler บน mobile (phase ต่อไป)
- ไม่แตะ CI workflows
- `VALIDATION_REPORT.json` hygiene — งานแยก

## 7. Rollback

ส่วน mobile ทั้งหมด additive; web path ไม่เปลี่ยน — revert commits ของงานชุดนี้แล้วกลับสู่ phase-1 state ได้

## 8. Open questions

- ไม่มี — design ผ่านการอนุมัติ (2026-08-08); รายละเอียด threshold default ของ judge ใน loop กำหนดใน plan (จาก config.mobile.judge.thresholds ว่าง = report เท่านั้น ไม่ fail gate)
