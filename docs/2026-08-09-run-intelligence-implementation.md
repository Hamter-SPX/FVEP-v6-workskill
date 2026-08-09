# Run Intelligence — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development task-by-task.

**Goal:** deterministic run-intelligence: local SQLite (node:sqlite) + JSONL fallback store เก็บ findings ต่อรัน + 5 rule-based insights + `npm run intel` + summary advisory — ตาม design `docs/2026-08-09-run-intelligence-design.md`

**Tech:** Node ESM; `node:sqlite` (built-in, Node ≥22.5) พร้อม JSONL fallback; baseline `npm test` = 541 pass; NO new deps

## Global Constraints

- Repo: FVEP; branch main; code comments English; analytics ต้องตอบโดยอ้าง run จริง (evidence-backed เท่านั้น — ห้ามสรุปเกินข้อมูล); hook ไม่ throw เด็ดขาด (best-effort)
- ไม่มี `node:sqlite` (Node <22.5) → JSONL fallback ที่ `.fx/intel/` ผลลัพธ์เทียบเท่า/ใกล้เคียง

---

### Task 1: Intel store (SQLite + JSONL fallback)

**Files:**
- Create: `lib/run-intel-store.mjs`
- Test: `tests/unit/run-intel-store.test.mjs`

**Interfaces:**
- Produces:
  - `openIntelStore(outputDir) → IntelStore` — `{mode: 'sqlite'|'jsonl', path, recordRun(run), recordFindings(rows), queryFindings({outputDir, rule?, source?, since?, caseKey?, device?, limit}) → rows[], listRuns({outputDir, limit}) → runs[], close()}`
  - `runRow = {run_id, output_dir, gate_outcome, score, blockers, cases_count, created_at}`
  - `findingRow = {run_id, output_dir, source, rule, severity, case_key, device, detail_json, created_at}`

**จุดบังคับ:**
- SQLite: `node:sqlite` DatabaseSync, WAL, tables ตาม schema + index `(output_dir, rule, created_at)` + `(output_dir, case_key)`; sqlite ไม่มี → fallback JSONL append-only (read = stream scan + filter in-memory)
- Helper `sqliteAvailable()` try/catch; store ปิดอัตโนมัติเมื่อ GC? — expose close() ชัด + symbolic dispose (Symbol.dispose if engine เป็น modern-style)
- atomic insert batch per run (transaction บน sqlite / single-append atomicity ด้วย tmp-rename บน jsonl)
- Tests: sqlite mode (env นี้มี) record+query round-trip; forced-fallback (mock unavailable) parity basic; filters (rule/device/since/caseKey)

**Commit:** `feat(intel): run intelligence store (sqlite + jsonl fallback)`

---

### Task 2: analytics 5 insights + recorder

**Files:**
- Create: `lib/run-intel-engine.mjs`
- Modify: `scripts/vision-loop.mjs` (hook `recordRunIntel` หลัง writeRunSummary — `if (!args['skip-intel'])` flag)
- Test: `tests/unit/run-intel-engine.test.mjs`

**Interfaces:**
- Consumes: store จาก Task 1, sections shape จาก loop (comparison + mobileChecks + summary)
- Produces:
  - `recordRunIntel(config, sections, summary, {store?}) → {recordedRuns, recordedFindings, warnings[]}` (never throws — collects warnings)
  - `analyzeRunIntel(outputDir, {windowDays=14, minOccurrences=2, streak=2, limitRuns=200, store?}) → analysis`
    - `recurring: [{rule, occurrences, lastSeenRunId, sources, cases: {key:count}, devices: {key:count}, insight}]`
    - `streaks: [{rule, case_key, device, consecutiveFailures, lastRunId}]`
    - `correlations: [{rule, device, ruleCount, totalRunsByDevice, ratio, note}]`
    - `resolved: [{rule, lastFailureRunId, resolvedAfterRuns, note}]`
    - `regressions: [{case_key, fromPassedToFailedRunIds}]`
    - `totals: {runsInWindow, findingsInWindow, dbMode}`

**จุดบังคับ:**
- recorder: เชនด์ findings จาก sections.mobileChecks[].findings[] + sections.comparison[].findings? (comparison.comparisons[] severity blocker/major snapshots — flatten ทำเป็น rule 'visual-diff'; mobile judgments rules dalle) — idempotent ต่อ runId (unique(run_id, rule, case_key, device, source) upsert/skip-dup)
- insight strings ภาษาไทยสั้น พร้อมเหตุผลอ้าง run เช่น `rule 'maxEmptyCells' เกิด 4 ครั้งใน 6 รันล่าสุด (ล่าสุด run abc12)`
- run capture อาจกระทบ runId collisions — ใช้ id จาก summary.provenance.runId ถ้ามี
- Tests: fixture history 5 รัน (patterns ครบ: recurring, streak, correlation, resolved, regression) → analysis ตรวจแต่ละ insight; recorder idempotent (run twice → findings ไม่ซ้ำ); store never-throw (database corrupt file → warnings ไม่ throw)

**Commit:** `feat(intel): run analytics + recorder hook in vision-loop`

---

### Task 3: npm run intel CLI + summary advisory + docs

**Files:**
- Create: `scripts/intel.mjs`
- Modify: `package.json` (script), `scripts/vision-loop.mjs` (advisory lines หลัง mobileChecks/summary — "สถิติ: …" จาก analyzeRunIntel เมื่อ occurrences ≥ minOccurrences)
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md` + bundle regen
- Test: `tests/unit/intel-cli.test.mjs`

**จุดบังคับ:**
- CLI: `--output-dir/-o`, `--window-days`, `--json`, `--purge` (delete store with confirm?— ใน script ใช้ `--yes` เป็น non-interactive override, ไม่ใช่ interactive prompt), `-h`
- Advisory ใน loop: แสดงเฉพาะ top recurring/streak สูงสุด 2 บรรทัด รูป: `สถิติ run: rule 'x' เกิด N ครั้งในช่วง D วัน — ตรวจ X` (recurring) หรือ `สตรีค: rule 'y' ล้มติดกัน K รัน`
- `--skip-intel` flag ปิดทุก intel (record+advisory)
- docs: subsection + changedlog

**Commit:** `feat(intel): npm run intel + advisory in run summary + docs`

---

### Task 4: Verification + synthetic 3-run demo + final review

**Files:** ไม่มี

- npm test เขียว + validate 0 errors
- Demo: config mobile จำลอง 2 devices × 3 รัน (รัน 1: fail maxEmptyCells; รัน 2: fail เดิม; รัน 3: fix → pass) → `npm run intel` แสดง recurring+streak+resolved จริงบันทึกลง report
- final whole-branch review round

---

## Self-review notes

- ข้อเสี่ยงหลัก: JSONL fallback consistency tests บน Node 26 — mock `sqliteAvailable=false` ตามวิธี DI (import แบบแยกฟังก์ชัน)
- runId: provenance.runId มีใน summary — สำรวจรูปแบบจริงตอน implement
- advisory ห้ามยาวเกิน 2 บรรทัด (UX)
