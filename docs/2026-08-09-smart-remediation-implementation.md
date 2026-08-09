# Smart Error Remediation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development task-by-task.

**Goal:** rule-driven remediation for judge/mobile findings + CLI + visual evidence surface (per `docs/2026-08-09-smart-remediation-design.md`)

**Tech:** Node ESM; baseline `npm test` = 487 pass; NO new deps

## Global Constraints

- Repo: FVEP; branch main; code comments English; web remediation items เดิมห้ามแก้; commit per task

---

### Task 1: Rule library + engine extension

**Files:**
- Create: `lib/remediation-rules.mjs`
- Modify: `lib/remediation.mjs`
- Test: `tests/unit/remediation-rules.test.mjs`, `tests/unit/remediation-mobile.test.mjs`

**Interfaces:**
- Produces: `JUDGE_RULES` (array `{matches: RegExp|string, category, why, action, verify}`), `FALLBACK_RULE`, `lookupRemediationRule(rule)`, `remediateFindings(findings)` ใน remediation.mjs คืน [{severity, category, case, finding, likelyCause, action, verify}]

**RULES ขั้นต่ำ (ตรวจทุกตัว):**
 `missingCapture`, `maxEmptyCells`, `minAlignment`, `suspectBackground`, `sourceMismatch`, `maxDarkShare`, `minDarkShare`, `maxLightShare`, `minLightShare`, `maxMismatchRatio/comparison-major` (ตามที่ engine เดิมทำอยู่ ห้ามแตะ), `verifySource/pending-login` (ไม่มีให้ข้าม) — texts ภาษาไทย/อังกฤษ: `likelyCause` EN, `action` EN step 1-3 ประโยค, `verify` คำสั่ง/วิธีจริง
- Tests: ทุก rule lookup fired; unknown rule → FALLBACK_RULE; `remediateFindings` maps {rule,severity,expected,observed} → item ครบ fields; `buildRemediationPlan({mobileChecks})` ครอบ findings จาก mobile judgments
- Regression: `tests/unit/remediation*.test.mjs` เดิมต้องเขียว

**Commit:** `feat(remediation): judge/mobile rule library with why-action-verify`

---

### Task 2: CLI `npm run remediate` + evidence surface

**Files:**
- Create: `scripts/remediate.mjs`
- Modify: `package.json` (script), `lib/visual-evidence-engine.mjs` (finding rows แสดง fix)
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md` + bundle regen
- Test: `tests/unit/remediate-cli.test.mjs`, ปรับ `tests/unit/visual-evidence-engine.test.mjs` (fixture อย่างน้อย 1 ฉบับ asserts fix text)

**จุดบังคับ:**
- CLI: `--output-dir/-o` (default `.`), `--json`; อ่าน reports ที่มี (comparison.json + metadata/*.mobile.judgment.json + reports/run-summary.json ถ้ามี) → `buildRemediationPlan(sections)` → เรียง severity → พิมพ์ (text: `[BLOCKER] <rule> — <finding> | ทำไม: <why> | แก้: <action> | ตรวจ: <verify>`); exit 0 เสมอ (เป็นรายงาน ไม่ใช่ gate)
- evidence: finding item มี `fix` เมื่อ lookup เจอ (ไม่เจอไม่แสดง); escapeHtml ตาม engine เดิม
- docs: 3-5 บรรทัดต่อภาษา + CHANGELOG entry

**Commit:** `feat(remediation): npm run remediate + visual evidence shows fix guidance`

---

### Task 3: Verification + synthetic showcase + final review

- `npm test` เขียวเต็ม + `npm run validate` 0 errors
- Showcase: สร้างตัวอยู่ fail จริงบน Sim (threshold maxEmptyCells:0 บนจอปกติ = fail แน่นอน หรือ reuse config เดิม) → vision-loop → `npm run remediate -- --output-dir …` บันทึก output + HTML มี fix → ไฟล์รายละเอียดลง report
- final whole-branch review

---

## Self-review notes

- lookup matching: exact string ก่อน → regex prefix ('max'/'min' นำหน้า) → fallback; ห้าม partial-falsy match (เช่น 'dark' เดี่ยว)
- `sections.mobileChecks` shape: `{key, label, verdict, findings[]}` — findings item เป็น {rule, severity, expected, observed} จาก judge
- fix ใน evidence ต้องไม่ทำให้การ์ดยาวเกิน — action จำกัด 1-2 บรรทัด
