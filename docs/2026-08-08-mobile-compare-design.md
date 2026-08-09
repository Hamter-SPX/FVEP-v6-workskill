# Real Mobile-Aware Compare — Design

**Date:** 2026-08-08
**Status:** Approved (design)
**Depends on:** full-wiring design + implementation (shipped `156e56a`)

## Background

`compareAll` (`lib/compare-engine.mjs`) enumerate เคสผ่าน `enumerateCases` (web identities) — mobile เลยถูก skip ไว้ชั่วคราว (owner decision รอบก่อน) รอบนี้ทำของจริง: สาขา enumeration เดียว + refresh-reference จริงบน mobile

## Architecture

```
vision-loop.mjs (mobile branch)
├─ --refresh-reference ─► captureAllMobile(config, {mode:'reference'})   # seed baseline ใหม่
└─ compare ─► compareAll(config)
               ├─ capture.type≠playwright → enumerateMobileCasesForCompare (config.mobile.cases → item case-shape)
               └─ downstream เดิมทั้งหมด: artifactPaths / pixelmatch / perceptual / masks / severity / reports
```

## Components

1. **lib/compare-engine.mjs** — สาขา enumeration (เพิ่มฟังก์ชัน `enumerateMobileCasesForCompare` ภายในไฟล์); web path ไม่เปลี่ยนทีเดียว
2. **scripts/vision-loop.mjs** — mobile branch: `--refresh-reference` → captureAllMobile({mode:'reference'}) (แทนคำเตือนเดิม) + `sections.comparison = await compareAll(config, {filters})` (แทน skip)
3. **lib/config.mjs + schema** — `mobile.cases[].masks: [{x,y,width,height}]` (PNG-space; optional per case)
4. **docs** — README/README_TH/CHANGELOG + bundle regen

## Semantics สำคัญ (ล็อก)

- artifact identity mobile: `{routeName: label, viewportName: 'mobile', stateName: key}` ↔ captureAllMobile (ต้องตรงเป๊ะ — stale web references ไม่ถูกมอง)
- thresholds ใช้ `config.diff` ร่วมกับเว็บ; `config.mode==='exact-reference'` semantics เหมือนเดิม
- missing reference บน mobile → severity ตามกฎเดิม (`unverified` unless exact-reference/failOnMissingReference)

## Non-goals

- Web path changes (ห้าม), DOM-region resolution บน mobile, baseline-engine integration (follow-up)
