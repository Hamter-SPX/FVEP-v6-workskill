# FVEP "One Framework" (v6.0.0) — Full Design Spec

**Date:** 2026-08-08
**Status:** Approved (design)
**Package:** fullstack-vision-engineering-pro v5 → v6 (`Hamter-SPX/fullstack-vision-engineering-pro-v5`)
**North Star:** Developer คนเดียวสร้าง production-grade fullstack app ที่มี UI สวยงาม ในไม่กี่ชั่วโมง — ด้วย framework เดียว ไม่ต้องเลือกระหว่าง Flow (Superpowers) กับ Quality (Vision)

---

## 1. Background & Rationale

โลกปัจจุบันมี 2 ระบบคู่กัน: **Superpowers ของ obra** (markdown-driven conversation discipline: brainstorm → plan → subagent TDD → review loops) และ **FVEP v5** (engine-driven quality: vision loops, aesthetics, audits, quality gates) — ผู้ใช้ต้องเลือก/สลับเองตลอด งานรอบนี้คือ **Fuse**: Flow Layer ของ FVEP เองที่ absorb หลักการทั้ง 14 ของ Superpowers แบบ *original adaptation* (ตามวัฒนธรรม `SUPERPOWERS_ADAPTATION_MATRIX.md` เดิมของ v4: ไม่ copy ตรง — คง principle แล้วผูก deterministic engines ของ FVEP)

**Binding decisions (owner-approved 2026-08-08):**
- Architecture: **Fuse/Absorb** — flow อยู่ใน FVEP ตัวเดียว (ไม่ใช่ bridge ไป superpowers)
- Style: **Rewrite/original** + MIT attribution — ไม่ vendor text
- Scope: **ครบ 14 flow skills**
- Golden Path: **process-only** (ไม่มี scaffold ใน v1; ใช้ได้กับ repo ใดก็ได้)
- Target: **generic fullstack (web+API+DB)** ไม่ผูกโปรเจกต์ใด

## 2. Architecture

```
FVEP ONE SKILL (SKILL.md umbrella — trigger เดียวตลอดกาล)
│
├─ FLOW LAYER (ใหม่ — โฟลเดอร์ flow/)
│   14 docs ตรงตาราง §3 แต่ละฉบับ = หลักการ + ขั้นตอน + คำสั่ง engine จริง inline
│
├─ QUALITY LAYER (ของเดิม 100%)
│   vision loops (รวม mobile ที่เพิ่งส่ง), aesthetics/direction, audits, gates
│
└─ GOLDEN PATH (ใหม่ — GOLDEN_PATH.md)
    solo dev sequence พร้อมคำสั่งจริงทุก gate (§5)
```

**Mode-engine wiring:** `npm run mode -- resolve` + flow-map.json — ตอบทั้ง mode และ flow doc ที่ govern เพื่อให้ agent โหลด flow ที่ถูกทันที

## 3. Flow Layer Inventory (14)

| # | flow doc | principle จาก obra | FPEP engine เชื่อม |
|---|----------|-------------------|---------------------|
| 1 | `flow/using-one-framework.md` | route ก่อนลงมือเสมอ | `skill-router-engine.mjs`, `process:route`, mode-engine |
| 2 | `flow/brainstorming.md` | explore → compare → approve ก่อนเขียน | `design-governance-engine.mjs` + design contract |
| 3 | `flow/writing-plans.md` | plan ที่ execute ได้จริง exact | `plan-quality-engine.mjs`, `task-graph-engine.mjs`, `process:plan` |
| 4 | `flow/using-git-worktrees.md` | isolation + baseline verify | `workspace-safety-engine.mjs`, `process:workspace` |
| 5 | `flow/test-driven-development.md` | RED ก่อน production เสมอ | `tdd-evidence-engine.mjs`, `process:tdd` |
| 6 | `flow/subagent-driven-development.md` | fresh implementer + review ทุก task + fix loop bounded | ledger engine, review engine (review-governance), roles/prompts/templates เดิม |
| 7 | `flow/executing-plans.md` | inline execute เมื่อไม่มี subagent runtime | process orchestrator + ledger เดียวกัน |
| 8 | `flow/dispatching-parallel-agents.md` | parallel เฉพาะ independent domains | `task-graph-engine.mjs` wave analysis |
| 9 | `flow/systematic-debugging.md` | reproduce → hypothesize → one-variable → root cause | `debug-session-engine.mjs`, `debug:triage` |
| 10 | `flow/requesting-code-review.md` | รีวิวก่อน merge เสมอ | `review-governance-engine.mjs`, `process:review` |
| 11 | `flow/receiving-code-review.md` | ยอมรับ feedback ด้วยหลักฐาน ไม่ใช่การแสดง | `feedback-adjudication-engine.mjs` |
| 12 | `flow/verification-before-completion.md` | evidence ก่อนเคลมสำเร็จ | `claim-verification-engine.mjs` |
| 13 | `flow/finishing-a-development-branch.md` | integration decision ของมนุษย์ | `integration-decision-engine.mjs`, `process:integration` |
| 14 | `flow/writing-skills.md` | สกิลผ่าน pressure tests + conformance | `skill-conformance-engine.mjs`, `skill:conformance` |

ทุกฉบับมีโครงเดียวกัน: **หลักการ (Why) → เมื่อไหร่ใช้ (When) → ขั้นตอน (Steps) → หลักฐานบังคับ (Evidence gates) → Anti-patterns (ห้าม) → MIT attribution note สั้นที่ส่วนท้ายฉบับเดียว** เขียนใหม่ FVEP-idiomatic ครบ ไม่ยกข้อความ obra

## 4. Flow-map + Mode wiring

- เอกสาร mapping ที่ `flow/README.md` (index) + mode-engine อ้าง flow doc ต่อโหมด:
  `design-ui → brainstorming(+visual-direction)`, `design-game → brainstorming(variant game)`, `implement → subagent-driven-development/executing-plans`, `debug → systematic-debugging`, `review → requesting-code-review`, `ship → verification-before-completion + finishing-a-development-branch`, `author-skill → writing-skills`, `analyze → using-one-framework`
- SKILL.md ชี้ไปยัง flow/ เป็น flow source of truth หลัง mode resolve

## 5. Golden Path (GOLDEN_PATH.md)

ลำดับสำหรับ **solo dev, fullstack (web+API+DB)**, repo ใดก็ได้:

| Gate | Step | คำสั่ง/ผลลัพธ์ |
|------|------|----------------|
| 0 | Route | `npm run process:route -- --input .fvep/request.json` → mode + flow doc |
| 1 | Direction (ตัวเลือก — ถ้างาน visual) | direction subloop (`direction:*`) → `design/visual-direction-spec.md` |
| 2 | Design contract | ตาม `flow/brainstorming.md` → `design/design-contract.json` ผ่าน governance validation |
| 3 | Plan | ตาม `flow/writing-plans.md` → `implementation-plan.json` ผ่าน `npm run process:plan` |
| 4 | Isolation | ตาม `flow/using-git-worktrees.md` → `npm run process:workspace` |
| 5 | Implement | ตาม `flow/subagent-driven-development.md` (หรือ executing-plans) — TDD ทุก cycle: `npm run process:tdd -- --evidence .fvep/tdd-evidence.json` |
| 6 | Quality gate | `npm run audit:fullstack` + `npm run fullstack:quality-gate` (+ vision-loop ถ้ามี UI) |
| 7 | Verify claims | ตาม `flow/verification-before-completion.md` → claim ledger |
| 8 | Integrate | ตาม `flow/finishing-a-development-branch.md` → `npm run process:integration` (human decision) |

ทุก gate มีตาราง evidence ชัด (ไฟล์, command, exit condition) — เดิน follow ได้โดยไม่ต้องจำเครื่องมือ

## 6. Non-goals

- ไม่ copy text ของ obra / ไม่ทำลาย superpowers installation ที่มีอยู่
- ไม่แก้ engines เดิม (ใช้ตาม contract ที่มีอยู่จริง — เคย verify แล้วทั้งชุด)
- ไม่มี app scaffold/template ใน v1
- ไม่เปลี่ยน PLAYBOOKS 10 ตัวเดิม (เพิ่ม link ไป flow ได้ แต่ไม่เขียนใหม่)

## 7. Acceptance

- 14 flow docs ครบโครง §3 + engine references ถูกต้อง (lint ตรวจ path มีจริง)
- Golden Path walkthrough: เดินบน toy repo จนผ่านครบทุก gate ด้วยคำสั่งจริง (evidence files ใน .fvep/)
- `npm test` เขียว + `npm run validate` Pass 0 errors
- SUPERPOWERS_ADAPTATION_MATRIX ยกเป็น v6 (สถานะ shipped flow + engines จริงต่อกัน)
- SKILL.md/README/README_TH/CHANGELOG (v6.0.0) sync

## 8. Task decomposition (ระดับ plan)

1. Flow infra: `flow/` pattern + README index + mode-engine flow-map + attribution LICENSE note
2. Flow core (5): using-one-framework, brainstorming, writing-plans, worktrees, TDD
3. Flow dev loop (3): SDD, executing-plans, parallel-agents
4. Flow review/verify (4): requesting, receiving, verification, finishing
5. Flow special (2): systematic-debugging, writing-skills
6. Golden Path doc + walkthrough toy repo evidence
7. Matrix v6 + SKILL.md/PLAYBOOKS/README/CHANGELOG wiring
8. Final review + docs regen + validate

(รายละเอียด template โครง flow doc, lint rule, walkthrough steps แต่ละข้อ — อยู่ใน implementation plan)
