# Visual Evidence Report — Design

**Date:** 2026-08-08
**Status:** Approved (design)
**Scope:** Autonomous with Accountability — ปิดช่อง "ทุก step มี visual evidence" ด้วยรายงานภาพรวมรันเดียว (HTML self-contained) ที่ทุกคนเปิดตรวจได้โดยไม่ต้องรันซ้ำ

## Architecture

```
scripts/visual-evidence.mjs --output-dir <dir> [--out reports/visual-evidence.html]
└─ lib/visual-evidence-engine.mjs (pure, no new deps)
   ├─ collectEvidence(outputDir)  → reads: {current,reference,diff}/*.png, metadata/*.json,
   │       reports/comparison.json, metadata/*.mobile.judgment.json, reports/run-summary*.json
   │       (ทน partial: อะไรขาด → absent ระบุชัด ไม่ล้ม)
   ├─ thumbnail(pngBytes, maxWidth=240) → base64 PNG (pngjs downscale)
   ├─ renderHtml(evidence) → single-file HTML (inline CSS, dark #08080A / accent #E63946,
   │       escapeHtml ทุก dynamic string)
   └─ writeTextAtomic ผ่าน lib/io.mjs convention
```

## เนื้อหา (ตามแผนเดิม)

Header (verdict+run id+config+time) · Gate ladder (color per section status) · Per-case cards (ref|cur|diff thumbs + metrics compact + verdict + findings + hash anchors: screenshotSha256, source.sha256, artifact paths) · Provenance strip (config hash + "how to verify") · partial evidence badges

## wiring

- `npm run evidence:visual` script
- `vision-loop.mjs` flag `--evidence-visual` → หลัง writeRunSummary สร้างรายงานลง `outputDir/reports/visual-evidence.html` พร้อม path ใน stdout

## tests

- engine: collect บน fixture outputDir (PNG จิ๋ว + json) → cards ครบ, absent ระบุ; render → มี hash anchors, escape `<script>` ใน label ถูก neutralize; thumbnail width cap
- CLI: --out ไฟล์เกิด + exit 0
- loop flag: seeded run + flag → HTML ถูกสร้าง (smoke test assert ไฟล์)
- suite เขียวเต็ม + docs regen (README/TH/CHANGELOG)

## Non-goals

- ไม่มี server/JS framework/PDF/dependency ใหม่; ไม่แก้ engine/report เดิม (อ่านอย่างเดียว); ไม่บังคับ immediate — flag เป็น opt-in
