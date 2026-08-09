# One Framework (v6.0.0) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fuse Superpowers' flow (14 disciplines) เป็น Flow Layer ของ FVEP เอง (original adaptation + engine-wired) พร้อม Golden Path สำหรับ solo fullstack dev — ตาม spec `docs/2026-08-08-one-framework-v6-design.md`

**Architecture:** flow/ directory ของ FVEP-owned flow docs ที่ผูก engines จริง (ไม่ vendor text ของ obra) + mode-engine expose flow doc + GOLDEN_PATH.md + docs sync v6.0.0

**Tech Stack:** Node ≥20 ESM (สำหรับ lint test เท่านั้น — เนื้อหาส่วนใหญ่เป็น markdown), node:test, package scripts เดิม

## Global Constraints

- Repo: `/Users/jirawat/.config/opencode/skills/mainskill/fullstack-vision-engineering-pro-v5` — branch main (push เมื่อสั่ง)
- **ห้าม copy text ของ obra** — ทุก flow doc เป็น original writing ของเรา; attribution = เพิ่ม license note เดียวใน `flow/README.md` (ดู Task 1)
- npm test baseline: **430 pass** — ต้องเขียวทุก commit; `npm run validate` PASS 0 errors เมื่อจบ
- Code comments + CLI help + docs EN; README_TH ไทย
- docs bundle: ทุกครั้งที่แก้ README*/PLAYBOOKS/GOLDEN_PATH ต้อง `npm run docs:all-in-one` (freshness test บังคับ)
- ทุก flow doc ต้องผ่าน **flow-doc lint** (Task 1): sections ครบ + ทุก engine/command ที่อ้างถึงมีจริง

---

### Task 1: Flow infra — directory, template law, lint, mode wiring, attribution

**Files:**
- Create: `flow/README.md` (flow index + attribution)
- Create: `flow/flow-map.json`
- Create: `tests/unit/flow-docs.test.mjs`
- Modify: `lib/mode-engine.mjs` (expose flow doc ต่อโหมด — อ่านโครงเดิมก่อน)

**Interfaces:**
- Produces (ทุก flow doc task ถัดไปต้อง obey):
  - Flow doc filename: `flow/<slug>.md` ตามตาราง §3 spec
  - Flow doc structure (REQUIRED sections ตามลำดับ):
    1. `# <Title>` — บรรทัดแรก
    2. `## Why this exists` — 1-3 ย่อหน้า
    3. `## When to use` — bullets มี keyword trigger จริง (เช่น "เปิด feature ใหม่", "ก่อน merge")
    4. `## The flow` — numbered steps, ทุก step ที่อ้างเครื่องมือต้องเป็น code block คำสั่งจริง
    5. `## Evidence gates` — ตาราง: gate, file/command, exit condition
    6. `## Anti-patterns` — bullets "ห้าม" ที่ specific
  - `flow/flow-map.json` — `{ "<mode>": { "flow": "flow/<slug>.md", "companions": [...] }, ... }`

- [ ] **Step 1: Write the lint test (failing first)**

สร้าง `tests/unit/flow-docs.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const flowDir = path.join(root, 'flow');

const REQUIRED_SECTIONS = ['## Why this exists', '## When to use', '## The flow', '## Evidence gates', '## Anti-patterns'];

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const npmScripts = new Set(Object.keys(pkg.scripts ?? {}));

function flowDocs() {
  if (!fs.existsSync(flowDir)) return [];
  return fs.readdirSync(flowDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
}

test('flow docs exist and follow required structure', () => {
  const docs = flowDocs();
  assert.ok(docs.length > 0, 'flow/ must contain flow docs');
  for (const doc of docs) {
    const text = fs.readFileSync(path.join(flowDir, doc), 'utf8');
    assert.match(text, /^# .+/m, `${doc}: missing H1`);
    for (const section of REQUIRED_SECTIONS) {
      assert.ok(text.includes(section), `${doc}: missing section "${section}"`);
    }
  }
});

test('every npm command referenced by flow docs exists', () => {
  const docs = flowDocs().map((d) => [d, fs.readFileSync(path.join(flowDir, d), 'utf8')]);
  const cmdPattern = /npm run ([a-zA-Z0-9:\-]+)/g;
  for (const [doc, text] of docs) {
    for (const match of text.matchAll(cmdPattern)) {
      assert.ok(npmScripts.has(match[1]), `${doc}: references missing npm script "${match[1]}"`);
    }
  }
});

test('every lib/engine file referenced by flow docs exists', () => {
  const docs = flowDocs().map((d) => [d, fs.readFileSync(path.join(flowDir, d), 'utf8')]);
  const refPattern = /(?:lib|scripts|templates|references|domains|prompts|agents|schemas|examples)\/[A-Za-z0-9_\-./]+/g;
  for (const [doc, text] of docs) {
    for (const match of text.matchAll(refPattern)) {
      const target = path.join(root, match[0]);
      assert.ok(fs.existsSync(target), `${doc}: references missing path "${match[0]}"`);
    }
  }
});

test('flow-map is valid json and points at existing docs', () => {
  const mapPath = path.join(flowDir, 'flow-map.json');
  assert.ok(fs.existsSync(mapPath), 'flow-map.json missing');
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  for (const [mode, entry] of Object.entries(map)) {
    assert.ok(typeof entry.flow === 'string', `${mode}: flow must be a path string`);
    assert.ok(fs.existsSync(path.join(root, entry.flow)), `${mode}: flow doc ${entry.flow} missing`);
  }
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `node --test tests/unit/flow-docs.test.mjs`
Expected: FAIL — `flow/ must contain flow docs`

- [ ] **Step 3: flow/README.md + flow-map.json**

สร้าง `flow/README.md` (เนื้อหาบังคับ):

```markdown
# Flow Layer — One Framework

The Flow Layer is FVEP's own conversation-level discipline: fourteen flows that carry
a task from "let's build" to "integrated with evidence". Each flow keeps the same
contract: **Why → When → Steps → Evidence gates → Anti-patterns**.

| Flow doc | Governs | Mode |
|---|---|---|
| [using-one-framework](using-one-framework.md) | routing to the right flow before any action | analyze |
| [brainstorming](brainstorming.md) | explore → compare → approve before implementation | design-ui / design-game |
| [writing-plans](writing-plans.md) | executable, exact, test-first plans | design-ui / implement |
| [using-git-worktrees](using-git-worktrees.md) | isolation + baseline verification | implement |
| [test-driven-development](test-driven-development.md) | observed RED before production code | implement |
| [subagent-driven-development](subagent-driven-development.md) | task implementers + reviews + bounded fix loop | implement |
| [executing-plans](executing-plans.md) | inline execution when no subagent runtime | implement |
| [dispatching-parallel-agents](dispatching-parallel-agents.md) | parallelize only independent domains | implement |
| [systematic-debugging](systematic-debugging.md) | reproduce → hypothesize → one-variable → root cause | debug |
| [requesting-code-review](requesting-code-review.md) | review before merge, always | review |
| [receiving-code-review](receiving-code-review.md) | accept feedback with evidence, not theater | review / debug |
| [verification-before-completion](verification-before-completion.md) | evidence before every success claim | ship |
| [finishing-a-development-branch](finishing-a-development-branch.md) | human-owned integration decision | ship |
| [writing-skills](writing-skills.md) | skills proven by pressure scenarios | author-skill |

## Attribution

The flow disciplines here are original adaptations inspired by Superpowers
(© 2025 Jesse Vincent, MIT License — https://github.com/obra/superpowers). The
principles are retained; the text, structure, and engine bindings are our own.
See LICENSE.
```

สร้าง `flow/flow-map.json`:

```json
{
  "analyze": { "flow": "flow/using-one-framework.md", "companions": [] },
  "design-ui": { "flow": "flow/brainstorming.md", "companions": ["flow/writing-plans.md"] },
  "design-game": { "flow": "flow/brainstorming.md", "companions": ["flow/writing-plans.md"] },
  "match-ref": { "flow": "flow/verification-before-completion.md", "companions": [] },
  "implement": { "flow": "flow/subagent-driven-development.md", "companions": ["flow/executing-plans.md", "flow/test-driven-development.md", "flow/using-git-worktrees.md", "flow/dispatching-parallel-agents.md"] },
  "debug": { "flow": "flow/systematic-debugging.md", "companions": ["flow/receiving-code-review.md"] },
  "review": { "flow": "flow/requesting-code-review.md", "companions": ["flow/receiving-code-review.md"] },
  "ship": { "flow": "flow/verification-before-completion.md", "companions": ["flow/finishing-a-development-branch.md"] },
  "author-skill": { "flow": "flow/writing-skills.md", "companions": [] },
  "recover": { "flow": "flow/using-one-framework.md", "companions": [] }
}
```

- [ ] **Step 4: mode-engine expose flow doc**

อ่าน `lib/mode-engine.mjs` ก่อน แล้วเพิ่มการ expose: import `flow/flow-map.json` (read sync — mode-engine เป็น module sync อยู่แล้ว หรือแปะ static object) แล้วเติม field `flow` ลง resolve/check output (เช่น `result.flow = map[mode]?.flow ?? null`, `result.flowCompanions = map[mode]?.companions ?? []`) + เพิ่ม test ใน `tests/unit/mode-engine.test.mjs` (ตามรูปแบบเดิมของไฟล์นั้น): resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย" → mode design-ui และ flow === 'flow/brainstorming.md'

- [ ] **Step 5: Run lint test**

Run: `node --test tests/unit/flow-docs.test.mjs tests/unit/mode-engine.test.mjs`
Expected: flow-map valid ✓; structure sections ขาด doc อื่นยังไม่มี (non-README docs ยังว่าง → ให้ปรับ test ชั่วคราวด้วย placeholder doc 1 ไฟล์ (`flow/using-one-framework.md` stub ครบ sections) เพื่อ infra pass — flow จริงใน Task 2)

- [ ] **Step 6: Commit**

```bash
git add flow/ tests/unit/flow-docs.test.mjs lib/mode-engine.mjs tests/unit/mode-engine.test.mjs
git commit -m "feat(flow): flow layer infra — directory, template law, lint, mode wiring, attribution"
```

---

### Task 2: Flow core 5 docs (using/brainstorming/writing-plans/worktrees/TDD)

**Files:**
- Create: `flow/using-one-framework.md`, `flow/brainstorming.md`, `flow/writing-plans.md`, `flow/using-git-worktrees.md`, `flow/test-driven-development.md`

**Interfaces:**
- Consumes: template law จาก Task 1 (sections + lint)
- Produces: doc จริง 5 ฉบับ (เนื้อหาเจาะจงตามรายละเอียดด้านล่าง)

**จุดเนื้อหาบังคับแต่ละฉบับ** (prose ให้ implementer เขียน 100-250 บรรทัดต่อฉบับ แต่ต้องครอบจุดเหล่านี้จริง):

- **using-one-framework**: เมื่อไหร่ต้อง route (ทุกคำขอจริงจัง), ปัญหาแก้ผิด mode แพงกว่าแก้ถาม, ตาราง flow-map, คำสั่ง `npm run mode -- resolve "<คำขอ>"`, `npm run process:route -- --input .fvep/request.json`, gate: mode/flow เลือกแล้วเท่านั้นจึงเขียน; anti-pattern: "งานเล็กไม่ต้อง route"
- **brainstorming**: explore context → compare approaches (≥2 พร้อม trade-offs + recommendation) → approval (`เริ่มเขียน` gate) → design contract + self-review; คำสั่ง `npm run direction:runtime` (งาน visual), `npm run direction:capture`→? ไม่มี — ใช้ sequence จาก PLAYBOOKS §1: `direction:init`, `direction:distinctness`, กฎห้าม implement ก่อน approved design: อ้าง `references/design-before-implementation.md`; gate evidence: `design/design-contract.json` + approval recorded
- **writing-plans**: โครง plan (goal/architecture/stack/global constraints + tasks ที่มี Files/Interfaces/Steps TDD + commit), คำสั่ง `npm run process:plan -- --plan .fvep/plan.json`, อ้าง `lib/plan-quality-engine.mjs`, `lib/task-graph-engine.mjs` (cycle/parallel collision), กฎ no-placeholders (จาก spec ทุก step มีของจริง), bite-sized steps
- **using-git-worktrees**: ทำไม isolate (consent ก่อน main/master), คำสั่ง `npm run process:workspace`, `git worktree add`, อ้าง `lib/workspace-safety-engine.mjs`, ผู้มีสิทธิ์ cleanup เฉพาะ `.worktrees/`*, gate: baseline green ก่อนเริ่ม
- **test-driven-development**: RED evidence ก่อน production (`npm run process:tdd -- --evidence .fvep/tdd-evidence.json`), cycle = failing test → run fail → minimal code → pass → refactor → commit, อ้าง `lib/tdd-evidence-engine.mjs` + `tests/TDD_EVIDENCE_V5.md` (ตัวอย่างของ package เอง), anti-pattern: เทสต์ที่เขียนหลังโค้ดแล้วเคลม TDD

- [ ] **Step 1: เขียน 5 docs ตามจุด + template law**
- [ ] **Step 2: lint pass** — `node --test tests/unit/flow-docs.test.mjs` (ต้องผ่านทั้ง 5)
- [ ] **Step 3: Commit** — `git add flow/ && git commit -m "feat(flow): core flows — routing, brainstorming, plans, worktrees, TDD"`

---

### Task 3: Flow dev loop 3 docs (SDD/executing/parallel)

**Files:**
- Create: `flow/subagent-driven-development.md`, `flow/executing-plans.md`, `flow/dispatching-parallel-agents.md`

**จุดเนื้อหาบังคับ:**

- **subagent-driven-development**: วงจร implementer→reviewer→fix loop (R1-3 resume, R4-5 fresh+capability bump, breaker adjudicate), ledger เสมอ (`progress.md` — SDD workspace pattern), brief/report/review-package artifacts, อ้าง `references/subagent-task-lifecycle.md` + `templates/task-brief.md`, อ้าง review engine (`lib/review-governance-engine.mjs`) + `process:review`; gates: per-task dual verdict (spec + quality), final whole review, ledger ครบ
- **executing-plans**: เมื่อไม่มี subagent runtime — inline sequence ด้วย plan tasks เดียวกัน + checkpoint ทุก N tasks + recheck pass (`npm run recheck -- plan --mode implement`), ledger เดียวกัน, ห้ามรวม task โดยไม่มีเทสต์ของ task นั้น
- **dispatching-parallel-agents**: parallel เมื่อ independent เท่านั้น — ตาราง shared-state/files = เหตุห้าม parallel, `lib/task-graph-engine.mjs` wave analysis (npm script ที่มี? อ้างทาง engine ตรง), gate: conflict-free wave ผ่าน graph check ก่อน dispatch

- [ ] **Step 1-3**: เขียน → lint pass → commit `"feat(flow): dev-loop flows — SDD, executing-plans, parallel dispatch"`

---

### Task 4: Flow review/verify 4 docs

**Files:**
- Create: `flow/requesting-code-review.md`, `flow/receiving-code-review.md`, `flow/verification-before-completion.md`, `flow/finishing-a-development-branch.md`

**จุดเนื้อหาบังคับ:**

- **requesting-code-review**: review package ก่อนเสนอ (base/head/diff hash binding), dual verdict (spec + quality), อ้าง `lib/review-governance-engine.mjs` + `npm run process:review`; gate: ไม่ merge โดยไม่ผ่าน review
- **receiving-code-review**: restate finding → ตรวจกับ codebase จริง (file/command evidence) → accept/reject/defer พร้อมเหตุผล — ห้าม "สวยครับผมจะแก้" โดยไม่พิสูจน์, อ้าง `lib/feedback-adjudication-engine.mjs`
- **verification-before-completion**: claim → required evidence mapping (visual-match/security-pass/bug-fixed/production-ready), freshness + artifact hash, `lib/claim-verification-engine.mjs`; ห้ามเคลมบน memory
- **finishing-a-development-branch**: options เสมอ 3 ทาง (merge/PR/keep), human picks, ไม่ auto-merge, คำสั่ง `npm run process:integration`, อ้าง `lib/integration-decision-engine.mjs`; cleanup เฉพาะ workspace ของเราเอง

- [ ] **Step 1-3**: เขียน → lint pass → commit `"feat(flow): review/verify flows — review pair, verification, finishing"`

---

### Task 5: Flow special 2 docs (debugging/writing-skills)

**Files:**
- Create: `flow/systematic-debugging.md`, `flow/writing-skills.md`

**จุดเนื้อหาบังคับ:**

- **systematic-debugging**: reproduce RED ก่อนเดา (failing test/probe), hypothesis เดียวครั้งละหนึ่ง, one-variable experiments, root cause ก่อน fix, คำสั่ง `npm run debug:triage`, อ้าง `lib/debug-session-engine.mjs` + `references/scientific-debugging-protocol.md`; gate: regression test ที่พิสูจน์ bug ถูกแก้
- **writing-skills**: frontmatter contract (name/description trigger keywords), pressure scenarios ก่อนส่ง, `npm run skill:conformance`, อ้าง `lib/skill-conformance-engine.mjs` + `tests/pressure-scenarios.md`, reference `references/skill-authoring-conformance.md`

- [ ] **Step 1-3**: เขียน → lint pass → commit `"feat(flow): special flows — systematic debugging, writing skills"`

---

### Task 6: GOLDEN_PATH.md + walkthrough evidence

**Files:**
- Create: `GOLDEN_PATH.md`
- Create: `examples/golden-path/README.md` + ผล walkthrough (commands log)
- Test: ไม่มีโค้ดใหม่ — ใช้ lint ของ docs commands (`tests/unit/flow-docs.test.mjs` ไม่ครอบ GOLDEN_PATH → ขยาย lint ครอบ GOLDEN_PATH.md ด้วย regex npm run เดียวกัน)

**จุดเนื้อหาบังคับ (GOLDEN_PATH.md):**
- Intro: เป้าหมาย (solo dev → production-grade app ในไม่กี่ชั่วโมง ด้วย evidence ครบ), ข้อจำกัดความจริง (ไม่ใช่ "สร้างแอปให้" แต่เป็นรางวินัย+เครื่องมือ)
- ตาราง 8 gates ตาม spec §5 พร้อม command + expected artifacts จริงทีละ gate (route/design contract/plan/isolation/implement/quality gate/verify/integrate)
- Config file ตัวอย่าง `.fvep/request.json`, `.fvep/plan.json`, `.fvep/tdd-evidence.json` (mini สำหรับแต่ละ gate)
- "When the path goes wrong" หมวด: อาการ/วิธีแก้ (gate แดง, plan พังกลางทาง, review pushback)

- [ ] **Step 1: ขยาย lint ครอบ GOLDEN_PATH npm commands** — ใน flow-docs.test.mjs เพิ่มบล็อก:

```js
test('every npm command referenced by GOLDEN_PATH.md exists', () => {
  const gp = path.join(root, 'GOLDEN_PATH.md');
  if (!fs.existsSync(gp)) return; // จะมีใน Task 6 — เมื่อสร้างเสร็จ test นี้บังคับ
  const text = fs.readFileSync(gp, 'utf8');
  for (const match of text.matchAll(/npm run ([a-zA-Z0-9:\-]+)/g)) {
    assert.ok(npmScripts.has(match[1]), `GOLDEN_PATH references missing npm script "${match[1]}"`);
  }
});
```

- [ ] **Step 2: เขียน GOLDEN_PATH.md ตามจุด**
- [ ] **Step 3: walkthrough จริงบน toy repo**
  สร้างโปรเจกต์ตัวอย่างเล็กใน `examples/golden-path/` (สคริปต์ JS ง่าย ๆ + repo skeleton) แล้วเดิน gate 0→6 ด้วยคำสั่งจริง (route→design→plan→workspace→tdd cycle→audit) เก็บ command log ลง `examples/golden-path/README.md` พร้อมสรุปผลลัพธ์; gate 7-8 อธิบาย (ไม่ต้องทำ integration จริง)
- [ ] **Step 4: Commit** — `git add GOLDEN_PATH.md examples/golden-path/ tests/unit/flow-docs.test.mjs && git commit -m "feat: GOLDEN_PATH — solo fullstack happy path + live walkthrough evidence"`

---

### Task 7: Matrix v6 + entry wiring + docs

**Files:**
- Modify: `SUPERPOWERS_ADAPTATION_MATRIX.md` (ยก v6 ระบุ flow shipped + engine ที่เชื่อมจริง)
- Modify: `SKILL.md` (ชี้ flow/ เป็น flow source of truth)
- Modify: `PLAYBOOKS.md` (ลิงก์ไป flow docs สัมพันธ์)
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md` (v6.0.0 entry)
- Modify: `FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md` (regen)

**จุดบังคับ:**
- Matrix v6: เพิ่มคอลัมน์ "v6 flow doc" ในตารางเดิม — ทุกแถวชี้ flow/<slug>.md + state 'shipped'
- SKILL.md: ส่วน Flow — 1 ย่อหน้า + ลิงก์ flow/README + GOLDEN_PATH
- CHANGELOG: หัวข้อ v6.0.0 "One Framework" รายการ: flow layer 14 docs, golden path, mode wiring, lint
- ทุก docs ที่แก้ → `npm run docs:all-in-one` ก่อน commit

- [ ] **Step 1-4**: แก้ → regen → lint/test → commit `"docs: One Framework v6.0.0 — matrix, entry sync, changelogs"`

---

### Task 8: Final verification + review

**Files:** ไม่มี

- [ ] **Step 1:** `npm test` เขียวเต็มชุด (430+n)
- [ ] **Step 2:** `npm run validate` PASS 0 errors
- [ ] **Step 3:** `npm run skill:conformance` (สุขภาพ skill เอง — บันทึกผล)
- [ ] **Step 4:** final whole-branch review + fix wave ตาม process เดิม
- [ ] **Step 5:** push เมื่อเจ้าของสั่งเท่านั้น

---

## Self-review notes (controller)

- Spec coverage: 14 flows (Task 2×5 + 3×3 + 4×2… = Task2:5, Task3:3, Task4:4, Task5:2 = 14 ✅) + infra + golden path + wiring + verify ✅
- Placeholder scan: flow doc prose เป็น implementer-authored 100-250 บรรทัด/ฉบับ โดยมีจุดบังคับ (mandatory beats) + lint บังคับโครง+refs จริง — นี่คือ doc-writing task โดยธรรมชาติ; จุดบังคับต่อฉบับระบุ engine/command ชัดเจนแล้ว ✅
- Type consistency: flow-map modes ตรงกับ 10 modes ของ package (analyze/design-ui/design-game/match-ref/implement/debug/review/ship/author-skill/recover — match-ref ใส่ flow verification ไว้ซึ่งสมเหตุสมผล: match-ref loop จบด้วย verification claims) ✅
- Known risks: docs bundle regen อาจสัมพันธ์กับ README/PLAYBOOKS edits ทีละหลายไฟล์ — Task 7 รองรับ; mode-engine อาจมี test snapshots — Task 1 Step 4 บอกอ่านโครงเดิมก่อน
