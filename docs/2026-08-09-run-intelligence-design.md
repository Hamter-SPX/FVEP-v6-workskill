# Run Intelligence — Design

**Date:** 2026-08-09
**Status:** Approved (design)

## Problem

ทุก gate run วันนี้เป็น "เหตุการณ์เดี่ยว": ค้าน fail → แสดง plan → แก้ → ลืม — ระบบไม่จำเลยว่าอะไรเกิดซ้ำบ่อย บนเคส/ดีไวซ์ไหน หรือ fix ไหนเวิร์ก — ทำให้แนะนำเชิงรุก (proactive) ไม่ได้

## Goal: "Expert System" ที่จำ run history จริงและตอบด้วยหลักฐาน

- บันทึก findings-level ของทุกรัน (rule/severity/case/device/source)
- insights แบบ **deterministic rule-based ล้วน** (ไม่ ML ใน v1 — ตรงกับ accountability ethos: ทุก insight ต้อง back ด้วย run จริง)
- แสดงผลเชิงรุกใน run summary + CLI

## Architecture

```
vision-loop ──► recordRunIntel ──► intel store (node:sqlite ≥22.5 | JSONL fallback)
                                        │
                              run-intel-engine (5 insights)
                                        │
                       ┌────────────────┼───────────────────┐
                       ▼                ▼                   ▼
              summary advisory      npm run intel      reports/intelligence.json
              (สูงสุด 2 บรรทัด)      (text/JSON/purge)
```

## Components (ตาม plan docs/2026-08-09-run-intelligence-implementation.md)

1. `lib/run-intel-store.mjs` — sqlite WAL + JSONL fallback ผ่าน interface เดียว
2. `lib/run-intel-engine.mjs` — 5 insights: recurring (≥N ครั้ง/หน้าต่าง), streaks (ล้มติดกัน K), correlations (rule×device), resolved (เคยเจอแล้วหาย), regression watch (pass→fail)
3. `scripts/intel.mjs` — `npm run intel` (+`--json`, `--purge --yes`)
4. Hook ใน vision-loop (best-effort, ไม่ throw ทุกกรณี) + advisory บรรทัดจาก recurring/streak

## Rules of honesty (binding)

- insight ทุกข้ออ้าง `runId`/จำนวน จริง — ไม่มีเวอร์ชัน "น่าจะ" โดยไม่มีข้อมูล
- หน้าต่างเวลา default 14 วัน; limit runs 200 — กัน shrimp data
- intel failures ไม่กระทบ gate (เตือนอย่างเดียว)

## Non-goals v1

- ML models, cross-project federation, dashboards, auto-fix
