# Visual Evidence Report — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** `npm run evidence:visual` + `--evidence-visual` ใน vision-loop — สร้างรายงานภาพรวม HTML self-contained ของทุก run (per design `docs/2026-08-08-visual-evidence-report-design.md`)

**Tech:** Node ESM + pngjs (dep เดิม); node:test; dark HeloS palette

## Global Constraints

- Repo: FVEP repo root; branch main (push เมื่อสั่ง)
- **NO new deps** · อ่านอย่างเดียวจาก artifacts (ไม่แก้ของเดิม) · code comments English · npm test baseline 439 pass
- bundle regen เมื่อแตะ README/README_TH (freshness test บังคับ)

---

### Task 1: visual-evidence engine + CLI + tests

**Files:**
- Create: `lib/visual-evidence-engine.mjs`
- Create: `scripts/visual-evidence.mjs`
- Modify: `package.json` (เพิ่ม script `"evidence:visual": "node scripts/visual-evidence.mjs"`)
- Test: `tests/unit/visual-evidence-engine.test.mjs`

**Interfaces:**
- Produces:
  - `collectEvidence(outputDir) → evidence` — `{runId?, platform?, capturedAt?, summary:{passed,failed,qualityScore?,releaseDecision?}, sections:[{name,status,detail}], cases:[{key,label,verdict,severity,findings[], thumbs:{reference?,current?,diff?}|null, metrics:{emptyCells,density,harmony,align,darkShare,lightShare}|null, hashes:{captureSha256?,metricsSha256?}, paths:{...}}]}`
  - `thumbnail(pngBytes, {maxWidth=240}) → {base64,width,height} | null`
  - `renderEvidenceHtml(evidence) → htmlString`
  - `escapeHtml(s)`
- CLI: `--output-dir/-o`, `--out <file>` (default `<outputDir>/reports/visual-evidence.html`), `-h/--help` (script ใช้ `parseLooseArgs` + `fail`/`printHelp`)

**จุดบังคับ implement:**
- collect อ่าน: `current/*.png`, `reference/*.png`, `diff/*.png` (map จาก basename ก่อน `.png`), `metadata/*.json`, `reports/comparison.json`, `metadata/*.mobile.judgment.json`, `reports/run-summary.json` (ถ้ามี — ดู `lib/run-summary.mjs` ว่า path จริงไฟล์ไหน) — ทุกอย่าง optional: ขาดไฟล์ → field นั้น null/absent (ห้าม throw ngoạiเว้น outputDir ไม่มีจริง)
- thumbnail: pngjs decode → ถ้ากว้าง > maxWidth ให้ downscale nearest-neighbor ใน memory → PNG.sync.write → base64; guard bytes cap (เช่นปฏิเสธภาพ > 32MP กลายเป็นหน่วง)
- HTML: ใช้ palette นี้เป๊ะ — bg `#08080A`, panel `#0F0F12`, accent `#E63946`, text `#EDEDEF`, muted `#8A8A93`, borders `rgba(255,255,255,0.08)`; verdict colors pass = `#2ECC71`, warn = `#F5A623`, fail = `#E63946`; monospace hash, `escapeHtml` ทุก dynamic interpolation (test จับ `<script>` injection ต้องถูก neutralize)
- Provenance strip: `configPath`, `configHash` (อ่านจาก run-summary json ถ้ามี), คำแนะนำ verify: โค้ด HTML `<code>shasum -a 256 &lt;file&gt;</code>` + บอกว่า hash ใดเทียบอะไร

**Tests (เขียนก่อน — ตัวอย่างจริง):**
- collect บน tmp fixture (PNG 8x8 + meta schemaVersion-2 ตัวอย่าง + comparison.json ตัวอย่าง + mobile judgment) → cases รวม 1 เคส verdict ถูก map จาก comparison.severity หรือ judgment.verdict, absent fields เป็น null ไม่ throw
- render จาก evidence ตัวอย่าง → html มี `<!DOCTYPE html>`, มี `data-case`, มี `screenshotSha256` hash ตัวจริง, escape injection: label `<script>alert(1)</script>` ปรากฏเป็น `&lt;script&gt;`
- thumbnail: PNG 480x240 → width ≤ 240 ทั้ง รูปสูง/กว้าง aspect รักษา; garbage input → null
- CLI smoke: รันบน tmp fixture → ไฟล์ HTML ถูกเขียน + ออก exit 0

**Commit:** `feat(evidence): visual evidence report engine + CLI (self-contained html)`

---

### Task 2: vision-loop --evidence-visual + docs

**Files:**
- Modify: `scripts/vision-loop.mjs` (OPTION name `evidence-visual` + post-summary build)
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md` + `FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md` (regen)
- Test: `tests/unit/vision-loop-mobile.test.mjs` (ต่อยอด seeded pattern: run + flag → HTML file exists)

**จุดบังคับ:**
- flag `--evidence-visual` (boolean, default false) — ทำงานทุก path (web+mobile) หลัง writeRunSummary: `const { collectEvidence, renderEvidenceHtml } = await import('../lib/visual-evidence-engine.mjs')` → เขียนลง `path.join(config.outputDir,'reports','visual-evidence.html')` ผ่าน writeTextAtomic → พิมพ์บรรทัด `Visual evidence: <path>` ใน stdout list
- docs: อธิบาย 3 บรรทัด (คืออะไร/เปิดยังไง/flag) + CHANGELOG entry (ตามรูปรอบก่อน)
- test: seeded PNG + config + `--skip-capture --evidence-visual` → ไฟล์มีจริง + มี `<!DOCTYPE html>`

**Commit:** `feat(vision-loop): --evidence-visual emits run-evidence html + docs`

---

### Task 3: Verification + live smoke

**Files:** ไม่มี

- `npm test` เขียว + `npm run validate` 0 errors
- Live smoke: ใช้ config ชุดเดียวกับ mobile loop (`/tmp/fvep-mcompare.config.json` ถ้ายังมี หรือสร้างใหม่ตาม pattern เดิม) → `vision-loop --evidence-visual` จาก Sim จริง → เปิดไฟล์ HTML: มี case card + thumbnails จริง + hash anchors → ถ่ายที่นั่งเก็บ evidence ลง report (ตรวจไฟล์กับ `shasum -a 256` 1 ไฟล์เพื่อพิสูจน์ hash ตรง)
- final whole-branch review ของงาน 2 รอบก่อนนี้แยกไม่ต้อง — มันเข็มเนื้อเลิกเอ็มจากทั้งหมด

**Commit:** ไม่มีโค้ด — report เท่านั้น

---

## Self-review notes

- Type consistency: verdict map: comparison.severity ('accepted'|'minor'|'major'|'blocker'|'unverified') และ judgment.verdict ('pass'|'warn'|'fail') — ตาราง unified: pass/accepted→pass; warn/minor/unverified→warn; fail/major/blocker→fail
- ข้อเสี่ยง: run-summary.json อาจไม่มี → optional; metadata key ใน mobile = `${route}__mobile__${state}` (.mobile.judgment.json)
- YAGNI: ไม่มี pagination/JS interactivity — static ล้วน
