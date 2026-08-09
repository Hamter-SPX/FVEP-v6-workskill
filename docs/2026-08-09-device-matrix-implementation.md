# Device Matrix Runner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** `mobile.devices[]` + fan-out matrix ทั้ง capture/compare/checks บน identity กฎเดียวกัน — ตาม design `docs/2026-08-09-device-matrix-design.md`

**Tech:** Node ESM, node:test; baseline `npm test` = 456 pass

## Global Constraints

- Repo: FVEP; branch main; NO new deps; web path/behavior backward-compat hard (no-devices config = identity เดิม); code comments English
- iPhone 16 Sim (booted) + Pixel6 (AVD — boot ได้) สำหรับ smoke จริง

---

### Task 1: config parse + schema + duplicate validation

**Files:**
- Modify: `lib/config.mjs`, `schemas/vision-loop-config.schema.json`
- Test: `tests/unit/config-mobile.test.mjs`

**Interfaces:**
- Produces config shape:
  - `mobile.devices[]`: `{key: string, label: string|null, udid: string|null, serial: string|null, platform: 'ios-sim'|'android'}`
  - `case.devices: string[] | null` (no entry → null = ใช้ทุก devices)
  - validation: duplicate device.key → TypeError; case.devices อ้าง key ที่ไม่มี ⇒ TypeError ชื่อ key

**จุดบังคับ:**
- parse ทำแบรนด์เดิมรูปแบบเดียวกับ mobile.cases parse เดิม
- tests: default `devices: []`, parse full row, platform default ios-sim, duplicate key throws, case.devices unknown → throws, no-devices config ⇒ mobile.devices === []
- schema add-only (mobile.properties.devices + cases items.devices array of strings)

**Commit:** `feat(config): mobile device matrix parse + validation + schema`

---

### Task 2: fan-out identity sync — capture + compare + checks

**Files:**
- Modify: `lib/mobile-capture-engine.mjs` (`captureAllMobile` + export `mobileCaseRuns(config, filters)` helper), `lib/compare-engine.mjs` (`enumerateMobileCasesForCompare`), `lib/mobile-checks-engine.mjs` (enum)
- Test: `tests/unit/mobile-capture-engine.test.mjs`, `tests/unit/compare-engine-mobile.test.mjs`, `tests/unit/mobile-checks-engine.test.mjs`

**Interfaces:**
- Consumes: config shapes จาก Task 1
- Produces (ศูนย์กลางกฎ identity จุดเดียว — **ทั้ง 3 engines ใช้ฟังก์ชันนี้ร่วมกันเท่านั้น**):
```js
export function mobileCaseRuns(config, filters = {}) // in mobile-capture-engine (canonical)
// → [{ case: c, device: deviceOrNull, identity: { routeName: c.label, viewportName: deviceOrNull?.key ?? 'mobile', stateName: c.key }, key: 'label__devise-or-mobile__key' }]
```

**จุดบังคับ:**
- effective devices per case: `case.devices?.length ? lookups(case.devices) : mobile.devices` — ถ้า mobile.devices.length === 0 → runs = cases × [null] (compat behavior เดิมเป๊ะ)
- ต่อ run หนึ่ง: device platform = device?.platform ?? config.capture.type; ios → udid = device?.udid ?? config.mobile.udid; android → serial = device?.serial ?? config.mobile.serial
- captureAllMobile: per run → artifactPaths(identity) แล้ว meta.viewport = {width,height} จาก PNG, meta.device = device?.key ?? null, meta.platform ตามอุปกรณ์จริง — รูป sections.capture results shape เดิม (relativeScreenshot, ok)
- compare-engine + checks-engine: ให้แชร์/เรียก mobileCaseRuns (import จาก mobile-capture-engine) — **ต้องไม่เขียน enumeration ซ้ำสองจุดอีกตลอดกาล** (ลบ duplicate เก่าใน compare/checks แล้ว delegate)
- Tests: matrix 2 devices × 2 cases → capture called 4 ครั้ง udid/serial ถูกที่; case.devices subset → เฉพาะ subset; no-devices config: identity viewportName 'mobile' + mode calls เดิม; compare/checks → currentPng paths ตรงกับ capture identities ทุก run

**Commit:** `feat(mobile): device matrix fan-out — shared identity law across capture/compare/checks`

---

### Task 3: tests reconcile + docs + example config

**Files:**
- Modify: README.md, README_TH.md, CHANGELOG.md + bundle regen
- Create: `examples/mobile-matrix.config.json` +เอกสารในตัวอย่าง
- อัปเดต flow/. cases docs ถ้ามีอ้าง mobile identity แข็ง (ค้นก่อน)

**จุดบังคับ:**
- example matrix config: devices iPhone 16 (UDID placeholder ชัดว่าเป็น example) + Pixel 6 + case home+chat — พร้อม comment JSON5-style `"_comment"` fields บอกเปลี่ยน UDID ของตัวเอง
- docs: matrix subsection — fan-out semantics, per-device references, compat guarantee
- CHANGELOG entry
- npm test เขียว + validate 0 errors

**Commit:** `docs: device matrix — example config, README/TH, CHANGELOG`

---

### Task 4: Live smoke 2 devices in one run + final verify

- Boot Pixel 6 AVD (Emulator จานสั้น) + iPhone 16 Sim (มี booted แล้ว)
- config /tmp/fvep-matrix.config.json: 2 devices (iphone16=booted UDID จริง, pixel6=emulator-5554), case home (no subset)
- `node scripts/vision-loop.mjs --config … --refresh-reference` → ต้องได้ artifacts: reference/home__iphone16__home.png + home__pixel6__home.png (+ current ครบ) + comparison 2 รายการ + gate PASS; รันรอบสองไม่ refresh → compare เปรียบเทียบจริง
- รวม `npm test` เขียว + regen bundle ครั้งท้ายถ้าต้อง

---

## Self-review notes

- ข้อเสี่ยงหลัก: compare/checks มี enumeration ซ้ำเก่าอยู่ — Task 2 ต้อง consolidate ผ่าน mobileCaseRuns เดียว (ห้ามทิ้ง logic เดิมซ้ำสองจุด)
- Compat: config เดิม (matrix smoke ก่อนหน้า) ยังใช้ได้ ไฟล์เดิมอยู่ที่เดิม — ระวังอย่าเปลี่ยน viewportName เมื่อ devices=[]
- ตัวอย่าง config devices อาจมี hyphen `iphone-16` — safeSegment('iphone-16') = 'iphone-16' คงที่ (keys ต้องใช้ได้กับ artifactKey โดยตรง)
