# Interactive Onboarding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development task-by-task.

**Goal:** `npm run tutorial` walkthrough 8 gates learn-by-doing บน toy repo จริง 3 โหมด — ตาม design `docs/2026-08-09-interactive-onboarding-design.md`

**Tech:** Node ESM + readline; baseline `npm test` = 502 pass; NO new deps

## Global Constraints

- Repo: FVEP; branch main; code comments English; เนื้อหา tutorial = ไทย primary + อังกฤษ secondary (โทนเดียวกับ flow docs); ไม่แก้ examples/golden-path เดิม (run บน tmp copy)

---

### Task 1: tutorial engine + step data + tests

**Files:**
- Create: `lib/tutorial-engine.mjs`
- Create: `scripts/tutorial.mjs`
- Modify: `package.json` (script `"tutorial": "node scripts/tutorial.mjs"`)
- Test: `tests/unit/tutorial-engine.test.mjs`

**Interfaces:**
- Produces: `TUTORIAL_STEPS` (8 steps), `runStep(step, {toyDir, exec}) → {exit, stdout, timedOut}`, `renderStep(step, result, {mode, stepIndex, totalSteps}) → string`, `replayStep(step, toyDir)`, `prepareToyRun(srcToyDir) → tmpDir`

**จุดบังคับ:**
- 8 steps: 1 Route (`npm run process:route -- --input .fvep/request.json`), 2 Design contract (อธิบาย — command: `node --test tests/unit/slug.test.mjs`? NO — ใช้ flow doc pointer + ข้าม run command ถ้าไม่มี — step ที่ไม่มีคำสั่ง render เป็น "documented"), 3 Plan (`npm run process:plan -- --input .fvep/plan.json`), 4 Isolation (`npm run process:workspace -- --cwd .`), 5 Implement TDD (`node --test tests/unit/slug.test.mjs` ใน toy — เลือก RED หรือ GREEN variant แสดงสลับ), 6 Quality gate (`npm run audit:fullstack -- --config fullstack.config.json`), 7 Verification (`npm run process:audit -- --config process.config.json`), 8 Integrate (documented: `npm run process:integration -- --input …`) — **ทุก npm run X ต้องมีจริงใน package.json (test บังคับ)**; step ไหน toy รันไม่ได้ให้ใช้ `--off` layout หรือ documented-step (ตรวจระหว่าง implement ด้วยการรันจริงบน tmp)
- runner: spawnSync ผ่าน command string แยกเป็น argv (ค่าว่างไม่), timeout 30s, maxBuffer
- render: block เส้นคั่น, step n/8, title, why (ไทย), command (mono), RUN transcript tail ≤ 30 บรรทัด, learning point (ไทย), สัปดาห์สถานะ (pass/warn/note)
- prepareToyRun: fs.mkdtempSync + fs.cpSync recursive แล้วคืน path; cleanUp function แยก
- off mode: อ่าน object จาก toy README/artifacts? — ให้ minimalistic: แสดง committed result summary + [OFF] badge ไม่รัน (อ่านจาก toy artifacts existing files ถ้ามี — พวก reports JSON ถ้า toy เก็บ ถ้าไม่มีก็ซึ้อดที่พพบาทว่าเป็น example state step)
- Tests: steps ครบ 8 + ลำดับ gate ตรง GOLDEN_PATH, คำสั่ง npm run ทุกตัวอยู่ package.json scripts, render มีทุก field, runner mock exec works (ไม่ spawn จริง), prepareToyRun copies and leaves source untouched

**Commit:** `feat(tutorial): interactive onboarding engine + npm run tutorial`

---

### Task 2: polish UX + docs + verify modes

**Files:**
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md` (+ bundle regen)
- Test: `tests/unit/tutorial-engine.test.mjs` (เพิ่ม modes cases)

**จุดบังคับ:**
- verify 3 modes จริง: `--off --auto` (exit 0), `--auto` (รันจริงบน tmp — ยาวผลจริงจาก toy), interactive prompt logic (mock readline? — skips in tests)
- docs: subsection + CHANGELOG entry; คำแนะนำผู้ใช้ใหม่ว่าเริ่มที่นี่ (`npm run tutorial`)
- suite เขียวเต็ม

**Commit:** `docs+chore: tutorial ux polish, README/TH, changelog`

---

### Task 3: showcase + final review

- Run: `npm test` เขียว, `npm run validate` 0 errors, `npm run tutorial -- --off --auto` จริง (บันทึก output tail), `npm run tutorial -- --auto --from 3` ตรวจ resume — final whole-brand review round

---

## Self-review
- ข้อเสี่ยง: คำสั่ง steps ระดับ npm run ที่ต้องมี — audit:fullstack + process:audit + process:route + process:plan + process:workspace มีจริงทั้งหมด (ตรวจตอน implement ด้วย lint-mind)
- tmp copy: toy อาจมี .fvep outputs อยู่แล้ว — copy ครบแค่โดยไม่ต้องลบ lock (ensureParent-style), clean up หลังจบ
- Interactive step ที่ต้องรัน: GREEN cycle demo ย่อย — อย่าให้ยาวเกิน (print tail)

