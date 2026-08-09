# Device Matrix Runner — Design

**Date:** 2026-08-09
**Status:** Approved (design)

## Goal

case เดียวกัน × หลายอุปกรณ์ (iOS Simulators + Android emulators) ใน vision-loop run เดียว — เขียน `mobile.devices[]` ครั้งเดียว runner fan-out เอง ตอบเคลม "mobile apps ทดสอบบนหลาย devices"

## Config

```jsonc
"mobile": {
  "devices": [
    { "key": "iphone16", "udid": "2357…", "platform": "ios-sim" },
    { "key": "pixel6",   "serial": "emulator-5554", "platform": "android" }
  ],
  "cases": [
    { "key": "home", "label": "home", "settleMs": 1500, "devices": ["iphone16"] }
  ]
}
```

- `mobile.devices[]`: {key (safeSegment-able), label?, udid?, serial?, platform: ios-sim|android (default ios-sim)}
- `case.devices?: string[]` — subset keys ที่ใช้กับ case นี้เท่านั้น (ไม่ระบุ = ทุก devices, แต่ถ้าไม่มี devices เลย → identity เดิม)
- Duplicate device keys → validateConfig throws

## Identity law (backward-compat hard)

- case มี effective devices ≥ 1: ต่อ device หนึ่ง artifact identity `{routeName: label, viewportName: deviceKey, stateName: key}` — capture/compare/checks ใช้สูตรเดียวกันเป๊ะทั้ง 3 engines
- case ไม่มี devices config เลย: ทุกอย่างเดิม ({viewportName: 'mobile'}) — config/artifacts เดิมไม่พัง
- capture order: sequential ตาม devices ของ case (ไม่ parallel รอบนี้)

## Components

1. `lib/config.mjs` parse mobile.devices + case.devices (+duplicate check) + `schemas/vision-loop-config.schema.json` add
2. `lib/mobile-capture-engine.mjs` captureAllMobile fan-out: คำนวณ effective cases (case × devices) → platform จาก device (case dev > device.platform > config.capture.type) → identity viewportName = device.key หรือ 'mobile'
3. `lib/compare-engine.mjs` enumerateMobileCasesForCompare ขยายตามกฎ identity เดียวกัน
4. `lib/mobile-checks-engine.mjs` enum + identity ตรงกัน
5. tests: config parse/duplicate, matrix identities (3-cut: fan-out per device, override subset, compat no-devices), capture mock per-udid-serial calls, compare/checks identity parity
6. Docs: README/TH/CHANGELOG + examples config matrix + bundle regen

## Non-goals

- ไม่ parallel captures; ไม่ per-device judge thresholds; ไม่ boot/ överride device auto-provision (expect อุปกรณ์ booted/emulator อยู่แล้ว — error ชัดเจนเมื่อไม่พบ)
