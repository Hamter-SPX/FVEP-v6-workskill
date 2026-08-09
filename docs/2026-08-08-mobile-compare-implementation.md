# Real Mobile-Aware Compare — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `compareAll` เข้าใจ mobile cases จริง + `--refresh-reference` ทำงานบน mobile — ตาม spec `docs/2026-08-08-mobile-compare-design.md`

**Architecture:** สาขาเดียวใน compare-engine (enumeration) + loop re-enable refresh-reference/compare; web path ไม่เปลี่ยน

**Tech Stack:** Node ≥20 ESM, node:test, pngjs/pixelmatch (deps เดิม)

## Global Constraints

- Repo: `/Users/jirawat/.config/opencode/skills/mainskill/fullstack-vision-engineering-pro-v5` (branch main; push เมื่อสั่ง)
- **Web path (capture.type playwright) ต้อง unchanged — npm test 418 baseline ต้องเขียวตลอด**
- ห้ามเพิ่ม dependency; code comments English; tests tmp-dir เท่านั้น
- iPhone 16 Sim booted สำหรับ live smoke

---

### Task 1: Mobile enumeration in compare-engine

**Files:**
- Modify: `lib/compare-engine.mjs`
- Test: `tests/unit/compare-engine-mobile.test.mjs`

**Interfaces:**
- Consumes: `config.mobile.cases[]` ({key,label,masks?}) + `config.capture.type` + artifactPaths identity `{routeName: c.label, viewportName: 'mobile', stateName: c.key}`
- Produces: `compareAll` ที่ทำงานบน mobile cases (รูป items ต่อท้ายนี้)

- [ ] **Step 1: Write failing tests** (`tests/unit/compare-engine-mobile.test.mjs`):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { compareAll } from '../../lib/compare-engine.mjs';

function makePng(width, height, fill) {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = fill[0]; png.data[i + 1] = fill[1]; png.data[i + 2] = fill[2]; png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

function fixtureConfig(outputDir, extra = {}) {
  return {
    configPath: 'fixture', outputDir, mode: 'compare',
    capture: { type: 'ios-sim' },
    mobile: { cases: [{ key: 'home', label: 'home', masks: [] }], judge: { thresholds: {} } },
    diff: {
      threshold: 0.1, includeAA: true, alpha: 0.1,
      maxMismatchRatio: 0.001, majorMismatchRatio: 0.01,
      failOnMissingReference: false,
      perceptual: { enabled: true, gridSize: 8, minSimilarity: 0.95, majorSimilarity: 0.8 }
    },
    reports: { html: false },
    ...extra
  };
}

test('compareAll — mobile pair identical → accepted', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-'));
  const png = makePng(16, 16, [255, 255, 255]);
  const rel = path.join(dir, 'reference', 'home__mobile__home.png');
  const cur = path.join(dir, 'current', 'home__mobile__home.png');
  fs.mkdirSync(path.dirname(rel), { recursive: true }); fs.mkdirSync(path.dirname(cur), { recursive: true });
  fs.writeFileSync(rel, png); fs.writeFileSync(cur, png);
  const result = await compareAll(fixtureConfig(dir));
  assert.equal(result.comparisons.length, 1);
  assert.equal(result.comparisons[0].mismatchRatio, 0);
  assert.ok(result.ok, `expected ok, got ${JSON.stringify(result.comparisons[0])}`);
});

test('compareAll — mobile pair with changed pixels → mismatch counted', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-'));
  const png = makePng(16, 16, [255, 255, 255]);
  const png2 = makePng(16, 16, [0, 0, 0]);
  const rel = path.join(dir, 'reference', 'home__mobile__home.png');
  const cur = path.join(dir, 'current', 'home__mobile__home.png');
  fs.mkdirSync(path.dirname(rel), { recursive: true }); fs.mkdirSync(path.dirname(cur), { recursive: true });
  fs.writeFileSync(rel, png); fs.writeFileSync(cur, png2);
  const result = await compareAll(fixtureConfig(dir));
  assert.ok(result.comparisons[0].mismatchRatio > 0.5, `expected large mismatch, got ${result.comparisons[0].mismatchRatio}`);
  assert.equal(result.ok, false);
});

test('compareAll — mobile missing reference → unverified (not blocker) by default', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-'));
  const cur = path.join(dir, 'current', 'home__mobile__home.png');
  fs.mkdirSync(path.dirname(cur), { recursive: true });
  fs.writeFileSync(cur, makePng(16, 16, [255, 255, 255]));
  const result = await compareAll(fixtureConfig(dir));
  assert.equal(result.comparisons[0].reason, 'missing-reference');
  assert.equal(result.comparisons[0].severity, 'unverified');
});

test('compareAll — stale web-identity files are invisible on mobile', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-'));
  // ปลูก web reference เดิมจงใจ — ต้องไม่เกิด blocker
  const webRef = path.join(dir, 'reference', 'home__desktop__default.png');
  fs.mkdirSync(path.dirname(webRef), { recursive: true });
  fs.writeFileSync(webRef, makePng(16, 16, [255, 255, 255]));
  const cur = path.join(dir, 'current', 'home__mobile__home.png');
  fs.mkdirSync(path.dirname(cur), { recursive: true });
  fs.writeFileSync(cur, makePng(16, 16, [255, 255, 255]));
  const result = await compareAll(fixtureConfig(dir));
  assert.equal(result.comparisons.length, 1);
  assert.notEqual(result.comparisons[0].severity, 'blocker');
});

test('compareAll — mobile case filters work (filters.case)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-'));
  const png = makePng(16, 16, [255, 255, 255]);
  const cfg = fixtureConfig(dir);
  cfg.mobile.cases.push({ key: 'chat', label: 'chat', masks: [] });
  for (const k of ['home', 'chat']) {
    const p = path.join(dir, 'current', `${k}__mobile__${k}.png`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, png);
  }
  const result = await compareAll(cfg, { filters: { case: 'chat' } });
  assert.equal(result.comparisons.length, 1);
  assert.equal(result.comparisons[0].key, 'chat__mobile__chat');
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `node --test tests/unit/compare-engine-mobile.test.mjs`
Expected: FAIL — `enumerateCases` ได้ 0 เคส (mobile config ไม่มี routes) ทุกเทสต์ comparisons.length=0

- [ ] **Step 3: Implement mobile branch in compareAll**

ใน `lib/compare-engine.mjs` ก่อน loop เดิม (~line 122-126):

```js
function enumerateMobileCasesForCompare(config, filters = {}) {
  return (config.mobile?.cases ?? [])
    .filter((c) => {
      if (filters.route && c.label !== filters.route) return false;
      if (filters.case && c.key !== filters.case) return false;
      return true;
    })
    .map((c) => ({
      key: `${c.label}__mobile__${c.key}`,
      routeName: c.label,
      viewportName: 'mobile',
      stateName: c.key,
      masks: Array.isArray(c.masks) ? c.masks : [],
      regions: Array.isArray(c.regions) ? c.regions : []
    }));
}

export async function compareAll(config, { filters = {} } = {}) {
  const { PNG, pixelmatch } = await imageLibraries();
  const reportJson = path.join(config.outputDir, 'reports', 'comparison.json');
  const reportHtml = path.join(config.outputDir, 'reports', 'comparison.html');
  const comparisons = [];
  const isMobile = config.capture?.type && config.capture.type !== 'playwright';
  const items = isMobile
    ? enumerateMobileCasesForCompare(config, filters)
    : enumerateCases(config, { ...filters, mode: 'current' });
  for (const item of items) {
    // ... (บรรทัดเดิมทั้งหมดต่อจากนี้ไม่แตะ)
```

- [ ] **Step 4: Run — verify PASS + full suite**

Run: `node --test tests/unit/compare-engine-mobile.test.mjs && npm test`
Expected: 5/5 + 418+5

- [ ] **Step 5: Commit**

```bash
git add lib/compare-engine.mjs tests/unit/compare-engine-mobile.test.mjs
git commit -m "feat(compare): mobile-aware case enumeration in compareAll"
```

---

### Task 2: Loop re-enable refresh-reference + masks config + docs

**Files:**
- Modify: `scripts/vision-loop.mjs`
- Modify: `lib/config.mjs`, `schemas/vision-loop-config.schema.json`
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md` (+ regen bundle)
- Test: `tests/unit/vision-loop-mobile.test.mjs`, `tests/unit/config-mobile.test.mjs`

**Interfaces:**
- Consumes: `captureAllMobile(config, {mode:'reference'})` (mode reference มีแล้ว — Task 3 wiring รอบก่อน)
- Produces: `--refresh-reference` ใช้ได้บน mobile (เดิมพิมพ์ warning)

- [ ] **Step 1: vision-loop.mjs**

แทนบรรทัด skip/warning ปัจจุบันใน mobile branch:

```js
      if (args['refresh-reference']) {
        sections.referenceCapture = await captureAllMobile(config, { mode: 'reference', filters });
      }
      if (!args['skip-compare']) sections.comparison = await compareAll(config, { filters });
```

(ลบ `compare: skipped on mobile ...` print และ `--refresh-reference is not supported` warning ออก)

- [ ] **Step 2: masks parse ใน config.mjs mobile case parse + schema**

case parse เพิ่ม:

```js
            masks: Array.isArray(c.masks) ? c.masks.map((m) => ({
              x: Number(m.x) || 0,
              y: Number(m.y) || 0,
              width: Number(m.width ?? m.w) || 0,
              height: Number(m.height ?? m.h) || 0
            })) : []
```

schema cases items เพิ่ม `masks: { type: 'array', items: { type: 'object', required: ['x','y','width','height'], properties: { x:{type:'number'}, y:{type:'number'}, width:{type:'number'}, height:{type:'number'} }, additionalProperties: false } }` (เก็บ add-only)

เพิ่ม config test: masks parsed/gemini default `[]`

- [ ] **Step 3: loop test (seeded, deterministic)**

ต่อใน `tests/unit/vision-loop-mobile.test.mjs`: seed reference+current PNG ตรงกันใน tmp outputDir → `--skip-capture` (ไม่ต้องมีอุปกรณ์) → stdout มี comparison section + exit 0; แก้ current ให้ต่าง → visual gate fail → exit 1 (ใช้ spawn pattern เดิมของไฟล์นั้น)

- [ ] **Step 4: Docs + regen + commit**

README.md/README_TH.md: mobile section แทนบรรทัด "compare skipped" ด้วย `--refresh-reference` flow; CHANGELOG entry; `npm run docs:all-in-one`:

```bash
git add scripts/vision-loop.mjs lib/config.mjs schemas/vision-loop-config.schema.json tests/unit/vision-loop-mobile.test.mjs tests/unit/config-mobile.test.mjs README.md README_TH.md CHANGELOG.md FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md
git commit -m "feat(vision): live mobile compare in loop — refresh-reference + masks + docs"
```

---

### Task 3: Verification + live iOS loop smoke

**Files:** ไม่มี (verification + docs only ใน Task 2 แล้ว)

- [ ] **Step 1: Full suite** — `npm test` เขียว; `npm run validate` PASS 0 errors

- [ ] **Step 2: Live iOS loop smoke (refresh + compare)**

สร้าง config จริง /tmp/fvep-mcompare.config.json (type ios-sim, case home, thresholds {}):

```bash
node scripts/vision-loop.mjs --config /tmp/fvep-mcompare.config.json --refresh-reference
# → reference capture จริงจาก Sim + compare: exit 0
node scripts/vision-loop.mjs --config /tmp/fvep-mcompare.config.json
# → compare กับ reference เดิม: PASS (ภาพเหมือน) exit 0
```
Expected: รอบสองมี comparison จริง + ไม่มี web-skip footgun; ถ้าเปลี่ยนหน้าจอ (เช่นเปิด app เทียบ) แล้ว compare → severity เปลี่ยน (optional demo)

- [ ] **Step 3: รายงาน + ปิด** — report ลง workspace ledger; ถ้า validate rewrite VALIDATION_REPORT ให้ restore (`git checkout --`) เว้นแต่ควร commit รวม

---

## Self-review notes (controller)

- Spec coverage: compare mobile (Task 1) ✅ refresh/masks/docs (Task 2) ✅ verify+smoke (Task 3) ✅
- Type consistency: item shape {key, routeName:'mobile'?…} — ระวัง: item.key ใช้เป็น DISPLAY key (`chat__mobile__chat`) แต่ artifactPaths อ่านจาก routeName/viewportName/stateName — ตรง captureAllMobile ✓
- Known risk: seeded loop test ใช้ --skip-capture → mobileChecks จะอ่าน seeded PNG ด้วย (fine เพราะ seeded คือของจริง); pixelmatch บน PNG เล็ก thumbnail ต้อง dim ตรงกัน (fixture ทำ 16x16 เท่ากัน) ✓
