# Smart Error Remediation — Design

**Date:** 2026-08-09
**Status:** Approved (design)

## Goal

Gate fail → ได้คำตอบ "แก้อะไรยังไง" ทันที: deterministic, library-driven (ไม่ใช่ AI guess) — ขยาย remediation จากเว็บเดิมไปครอบ judge/mobile rules ทั้งชุด + CLI ของตัวเอง + ผิวหน้าใน visual evidence report

## Components

1. **`lib/remediation-rules.mjs`** — RULES data (rule name/regex → {category, why, action, verify}) + `lookupRemediationRule(rule)` (exact → partial/fallback lenient matching: normalize-to-lower + prefix tolerances) + `FALLBACK_RULE`
2. **`lib/remediation.mjs`** — เพิ่ม `remediateFindings(findings)` (map ผ่าน rules) + `buildRemediationPlan` ครอบ `sections.mobileChecks` ด้วยกฎเดียวกัน
3. **`scripts/remediate.mjs`** — `npm run remediate -- --output-dir <dir> [--json]` → plan เรียง blocker→major→minor→warn (reuse engine + collect จาก reports ที่มี)
4. **`lib/visual-evidence-engine.mjs`** — finding rows แสดง `fix` (action จาก library ตัวเดียวกัน) ใต้ข้อความ finding
5. **Tests** — rule coverage ทุก rule ใน library, fallback, CLI, evidence-render shows fix, mobileChecks consumption, web items เดิมไม่พัง (regression จาก suite เดิม)

## Non-goals

- ไม่ auto-fix/ไม่ LLM to cure (deterministic pattern เท่านั้น)
- ไม่แก้ web remediation items เดิม (อ่านอย่างเดียว)
- ไม่เปลี่ยน judge/evaluate rules (เพิ่มแผนที่ให้พวกเขาเท่านั้น)

## Success check

Synthetic fail (`maxEmptyCells:0` threshold บนจอจริง) → `npm run remediate` ให้คำแนะนำเจาะจง + HTML แสดง fix ในการ์ด; `npm test` เขียว + validate 0 errors
