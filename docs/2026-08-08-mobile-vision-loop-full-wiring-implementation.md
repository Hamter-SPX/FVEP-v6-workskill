# Mobile Vision Loop — Full Wiring (A1–A4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เชื่อม mobile เข้า vision-loop เต็มรูปแบบ — capture.type branch (ios-sim/android), provenance sha256, strict verdict validation ตาม spec `docs/2026-08-08-mobile-vision-loop-full-wiring-design.md`

**Architecture:** `captureAllMobile` (matrix simctl/adb → artifactPaths layout เดิม + meta schemaVersion 2 + screenshotSha256) → compareAll เดิม → mobileChecks (metrics+judge ต่อเคส) → summary ผ่าน applicability จาก config flags; A3 binding ก่อนเพราะ A1 ใช้

**Tech Stack:** Node ≥20 (ESM), node:test, pngjs, png hash via node:crypto (deps เดิมเท่านั้น)

## Global Constraints

- Repo: `/Users/jirawat/.config/opencode/skills/mainskill/fullstack-vision-engineering-pro-v5` — paths สัมพัทธ์ root นี้ เสมอ
- **ห้ามเพิ่ม npm dependency**
- **ห้ามเปลี่ยน web path behavior** ของ vision-loop/engines เดิม — mobile branch เท่านั้น; regression = `npm test` 377 baseline ต้องเขียว
- Code comments + CLI help English; เอกสารไทยเฉพาะ README_TH
- Pattern: engine pure ESM; script `parseLooseArgs`/`parseCli` + `fail`/`printHelp`; tests node:test + assert/strict
- Artifacts in tests → tmp dirs เท่านั้น; live smoke artifacts → /tmp
- AVD สำหรับ Android smoke: `Helos_Pixel6_API35`; iPhone 16 Sim booted สำหรับ iOS smoke

---

### Task 1: Provenance chain (A3) — meta sha256 + metrics source + judge verify

**Files:**
- Modify: `lib/mobile-capture-engine.mjs`
- Modify: `scripts/vision-metrics.mjs`
- Modify: `lib/vision-judge-engine.mjs`
- Modify: `scripts/vision-judge.mjs`
- Test: `tests/unit/mobile-capture-engine.test.mjs`, `tests/unit/vision-judge-engine.test.mjs`

**Interfaces:**
- Consumes: meta/CLI เดิมของ phase 1 (shipped: `captureSimulatorScreenshot`, `judgeMetrics`, `evaluateMetrics`)
- Produces:
  - sidecar meta เพิ่ม `screenshotSha256` (hex) + `screenshotBytes` (int) — **ชื่อเดียวกับ web metadata (lib/capture-engine.mjs:52-53)**
  - metrics JSON เพิ่ม `source: {sha256, width, height}`
  - `evaluateMetrics` เพิ่มกฎ `sourceMismatch` (+ `validateVerdictRecord` ไม่เปลี่ยนใน task นี้)
  - CLI flag `--verify-source` ใน vision-judge.mjs

- [ ] **Step 1: Write failing tests**

เพิ่มใน `tests/unit/mobile-capture-engine.test.mjs` (ต่อจากของเดิม — fixture เดิม reuse):

```js
test('captureSimulatorScreenshot — meta carries web-convention sha fields', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const png = fakePngBytes(8, 4);
  const exec = (cmd, args) => {
    if (args[1] === 'io') fs.writeFileSync(out, png);
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureSimulatorScreenshot({ out, exec, sleep: () => {} });
  const expected = crypto.createHash('sha256').update(png).digest('hex');
  assert.equal(meta.screenshotSha256, expected);
  assert.equal(meta.screenshotBytes, png.length);
  const onDisk = JSON.parse(fs.readFileSync(metaPathFor(out), 'utf8'));
  assert.equal(onDisk.screenshotSha256, expected);
});
```

เพิ่มใน `tests/unit/vision-judge-engine.test.mjs`:

```js
test('evaluateMetrics — sourceMismatch finding when hashes differ', () => {
  const m = structuredClone(baseMetrics);
  const findings = evaluateMetrics(m, {}, {
    metricsSource: { sha256: 'aaa', width: 8, height: 8 },
    captureSha256: 'bbb'
  });
  const hit = findings.find((f) => f.rule === 'sourceMismatch');
  assert.ok(hit, 'expected sourceMismatch finding');
  assert.equal(hit.severity, 'fail');
});

test('evaluateMetrics — matching hashes produce no sourceMismatch', () => {
  const m = structuredClone(baseMetrics);
  const findings = evaluateMetrics(m, {}, {
    metricsSource: { sha256: 'aaa', width: 8, height: 8 },
    captureSha256: 'aaa'
  });
  assert.equal(findings.find((f) => f.rule === 'sourceMismatch'), undefined);
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `node --test tests/unit/mobile-capture-engine.test.mjs tests/unit/vision-judge-engine.test.mjs`
Expected: 2 failing tests (unknown sha fields / evaluateMetrics ไม่รับ third arg ทำงานเหมือนเดิม)

- [ ] **Step 3: Implement**

`lib/mobile-capture-engine.mjs` — หลัง screenshot block (ก่อนสร้าง meta):

```js
  const pngBytes = fs.readFileSync(out);
  const screenshotSha256 = crypto.createHash('sha256').update(pngBytes).digest('hex');
```
เพิ่มใน meta object:
```js
    screenshotSha256,
    screenshotBytes: pngBytes.length,
```
และเพิ่ม `import crypto from 'node:crypto';` บนสุด

`lib/vision-judge-engine.mjs` — `evaluateMetrics(metrics, thresholds = {}, sourceCheck = null)`:

```js
export function evaluateMetrics(metrics, thresholds = {}, sourceCheck = null) {
  assertMetricsShape(metrics);
  const findings = [];
  if (sourceCheck?.metricsSource && sourceCheck.captureSha256) {
    if (sourceCheck.metricsSource.sha256 !== sourceCheck.captureSha256) {
      findings.push({ rule: 'sourceMismatch', severity: 'fail', expected: sourceCheck.captureSha256, observed: sourceCheck.metricsSource.sha256 });
    }
  }
  // ... (กฎ suspectBackground + rules loop เดิม ต่อท้ายตามเดิม)
}
```

`scripts/vision-metrics.mjs` — หลัง computeVisionMetrics:

```js
    const pngBytes = fs.readFileSync(args.image);
    const { createHash } = await import('node:crypto');
    metrics.source = {
      sha256: createHash('sha256').update(pngBytes).digest('hex'),
      width: png.width,
      height: png.height
    };
```

`scripts/vision-judge.mjs` (metrics mode — หลังอ่าน metrics/thresholds):

```js
      let sourceCheck = null;
      if (args['verify-source']) {
        if (!metrics.source?.sha256) fail(new TypeError('--verify-source requires metrics JSON with a source block (run vision-metrics again)'));
        const capturePath = args.capture;
        if (!capturePath) fail(new TypeError('--verify-source requires --capture <png>'));
        const { createHash } = await import('node:crypto');
        sourceCheck = {
          metricsSource: metrics.source,
          captureSha256: createHash('sha256').update(fs.readFileSync(capturePath)).digest('hex')
        };
      }
      record = judgeMetrics({ metrics, thresholds, sourceCheck, caseLabel: args.label ?? 'screen', goal: args.goal, metricsRef: args.metrics, captureRef: args.capture });
```
(และ `judgeMetrics` รับพารามิเตอร์ `sourceCheck` ส่งต่อให้ `evaluateMetrics(metrics, thresholds, sourceCheck)`)

- [ ] **Step 4: Run — verify PASS**

Run: `node --test tests/unit/mobile-capture-engine.test.mjs tests/unit/vision-judge-engine.test.mjs`
Expected: PASS

- [ ] **Step 5: CLI smoke**

```bash
node scripts/capture-mobile.mjs --udid booted --out /tmp/fvep-p3.png --label home --settle 1
node scripts/vision-metrics.mjs --image /tmp/fvep-p3.png --out /tmp/fvep-p3-metrics.json --compact
node scripts/vision-judge.mjs --judge metrics --metrics /tmp/fvep-p3-metrics.json --thresholds '{}' --capture /tmp/fvep-p3.png --verify-source --label home
```
Expected: PASS (0 findings) exit 0 + meta sidecar มี screenshotSha256

- [ ] **Step 6: Commit**

```bash
git add lib/mobile-capture-engine.mjs scripts/vision-metrics.mjs lib/vision-judge-engine.mjs scripts/vision-judge.mjs tests/unit/mobile-capture-engine.test.mjs tests/unit/vision-judge-engine.test.mjs
git commit -m "feat(vision): sha256 provenance chain — meta hash, metrics source block, verify-source gate"
```

---

### Task 2: Strict value-level validation (A4)

**Files:**
- Modify: `lib/vision-judge-engine.mjs`
- Test: `tests/unit/vision-judge-engine.test.mjs`

**Interfaces:**
- Consumes: `validateVerdictRecord` เดิม (top-level checks อยู่แล้ว)
- Produces: `validateVerdictRecord` เวอร์ชันลึก (shape เดียวกัน คืน parsed เหมือนเดิม)

- [ ] **Step 1: Write failing tests**

```js
test('validateVerdictRecord — deep validation', () => {
  const ok = {
    schema_version: 1, case_label: 'chat', mode: 'human', verdict: 'warn',
    findings: [{ rule: 'maxEmptyCells', severity: 'warn', expected: 1, observed: 2 }],
    metrics_ref: null, capture_ref: '/tmp/x.png', judged_by: 'j', judged_at: '2026-08-08T00:00:00.000Z', goal: 'g'
  };
  assert.equal(validateVerdictRecord(ok), ok);

  assert.throws(() => validateVerdictRecord({ ...ok, mode: 'alien' }), /mode must be/);
  assert.throws(() => validateVerdictRecord({ ...ok, judged_by: '' }), /judged_by/);
  assert.throws(() => validateVerdictRecord({ ...ok, findings: [{ rule: 'x', severity: 'info', expected: 1, observed: 2 }] }), /severity/);
  assert.throws(() => validateVerdictRecord({ ...ok, findings: [{ severity: 'warn', expected: 1, observed: 2 }] }), /rule/);
  assert.throws(() => validateVerdictRecord({ ...ok, metrics_ref: 42 }), /metrics_ref/);
  assert.throws(() => validateVerdictRecord({ ...ok, goal: 7 }), /goal/);
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `node --test tests/unit/vision-judge-engine.test.mjs`
Expected: เทสต์ใหม่ fail (validation ปัจจุบันผ่านผิดพลาดพวกนี้)

- [ ] **Step 3: Implement deep validation**

ใน `lib/vision-judge-engine.mjs` `validateVerdictRecord` — ต่อท้าย checks เดิม:

```js
  const MODES = ['metrics', 'model', 'human'];
  if (!MODES.includes(parsed.mode)) {
    throw new TypeError(`mode must be ${MODES.join('|')}`);
  }
  if (typeof parsed.judged_by !== 'string' || parsed.judged_by.trim() === '') {
    throw new TypeError('judged_by must be a non-empty string');
  }
  for (const [i, f] of parsed.findings.entries()) {
    if (f === null || typeof f !== 'object') throw new TypeError(`findings[${i}] must be an object`);
    if (typeof f.rule !== 'string' || f.rule === '') throw new TypeError(`findings[${i}].rule must be a non-empty string`);
    if (!SEVERITIES.includes(f.severity)) throw new TypeError(`findings[${i}].severity must be ${SEVERITIES.join('|')}`);
    if (!('expected' in f) || !('observed' in f)) throw new TypeError(`findings[${i}] must include expected and observed`);
  }
  for (const key of ['metrics_ref', 'capture_ref', 'goal']) {
    if (parsed[key] !== undefined && parsed[key] !== null && typeof parsed[key] !== 'string') {
      throw new TypeError(`${key} must be a string or null`);
    }
  }
```

(`SEVERITIES` — hoist เป็น module-level const ถ้ายังประกาศใน function; ตอนนี้ `const SEVERITIES = ['warn', 'fail'];` ระดับ module อยู่แล้ว — เช็คก่อนแก้)

- [ ] **Step 4: Run — verify PASS + smokes เดิมไม่พัง**

Run: `node --test tests/unit/vision-judge-engine.test.mjs && npm test`
Expected: judge tests ผ่าน + full suite เขียว

- [ ] **Step 5: Commit**

```bash
git add lib/vision-judge-engine.mjs tests/unit/vision-judge-engine.test.mjs
git commit -m "feat(vision): strict value-level verdict validation (mode/severity/ref types)"
```

---

### Task 3: A1 — capture.type branch + captureAllMobile + mobileChecks

**Files:**
- Modify: `lib/config.mjs` (pass `capture.type` + parse `mobile` block)
- Modify: `lib/mobile-capture-engine.mjs` (add `captureAllMobile`)
- Create: `lib/mobile-checks-engine.mjs`
- Modify: `scripts/vision-loop.mjs` (mobile branch)
- Modify: `schemas/vision-loop-config.schema.json` (รับ capture.type + mobile)
- Modify: `vision-loop.config.example.json` (mobile example จริง)
- Test: `tests/unit/mobile-capture-engine.test.mjs`, `tests/unit/mobile-checks-engine.test.mjs`, `tests/unit/config-mobile.test.mjs`

**Interfaces:**
- Consumes: `captureSimulatorScreenshot` (Task 1 meta), `computeVisionMetrics` (phase 1), `judgeMetrics` (Task 1-2), `artifactPaths(outputDir, identity)` จาก `lib/artifacts.mjs` (identity = `{routeName, viewportName, stateName}` — ใช้ `artifactKey` join ด้วย `__`)
- Produces:
  - `captureAllMobile(config, {mode='current', filters={}, exec, sleep}) → results[]` shaped เหมือน `captureAll` returns: `{screenshotPath, metadataPath, relativeScreenshot, regionCount: 0, unresolvedRequiredRegionCount: 0, ok: true}`
  - `runMobileChecks(config, {exec?}) → results[]` shaped `{key, label, verdict: 'pass'|'warn'|'fail', findings[], metricsPath, judgmentPath}`
  - config shape: `capture.type ∈ {'playwright','ios-sim','android'}`; `mobile: {udid, serial, cases: [{key, label, bundleId?, launchActivity?, openUrl?, settleMs?}], judge: {thresholds}}`

- [ ] **Step 1: config.mjs**

อ่าน `lib/config.mjs` บริเวณ capture block (~line 151-161) — เพิ่ม pass-through:

```js
      type: ['playwright', 'ios-sim', 'android'].includes(source.capture?.type) ? source.capture.type : 'playwright',
```
และเพิ่ม parse ส่วน `mobile`:

```js
    mobile: {
      udid: source.mobile?.udid ? String(source.mobile.udid) : 'booted',
      serial: source.mobile?.serial ? String(source.mobile.serial) : 'emulator-5554',
      cases: Array.isArray(source.mobile?.cases)
        ? source.mobile.cases.map((c) => ({
            key: String(c.key ?? c.label ?? 'case'),
            label: String(c.label ?? c.key ?? 'case'),
            bundleId: c.bundleId ? String(c.bundleId) : null,
            launchActivity: c.launchActivity ? String(c.launchActivity) : null,
            openUrl: c.openUrl ? String(c.openUrl) : null,
            settleMs: Number.isFinite(Number(c.settleMs)) ? Number(c.settleMs) : 1000
          }))
        : [],
      judge: { thresholds: source.mobile?.judge?.thresholds && typeof source.mobile.judge.thresholds === 'object' ? source.mobile.judge.thresholds : {} }
    },
```

เทส (`tests/unit/config-mobile.test.mjs`): type default playwright; ios-sim honored; invalid type → playwright; mobile.cases parse; judge.thresholds default `{}`

- [ ] **Step 2: captureAllMobile**

เพิ่มใน `lib/mobile-capture-engine.mjs`:

```js
import path from 'node:path';
import { artifactPaths } from './artifacts.mjs';
import { ensureParent, writeJsonAtomic } from './io.mjs';

function caseIdentity(c) {
  return { routeName: c.label, viewportName: 'mobile', stateName: c.key };
}

export async function captureAllMobile(config, { mode = 'current', filters = {}, exec, sleep } = {}) {
  const platform = config.capture.type;
  if (!['ios-sim', 'android'].includes(platform)) {
    throw new TypeError(`captureAllMobile requires capture.type ios-sim|android, got ${platform}`);
  }
  const cases = (config.mobile?.cases ?? []).filter((c) => {
    if (filters.route && c.label !== filters.route) return false;
    if (filters.case && c.key !== filters.case) return false;
    return true;
  });
  const results = [];
  for (const c of cases) {
    const paths = artifactPaths(config.outputDir, caseIdentity(c));
    const screenshotPath = mode === 'reference' ? paths.referencePng : paths.currentPng;
    const metadataPath = mode === 'reference' ? paths.referenceCaptureJson : paths.currentCaptureJson;
    await ensureParent(screenshotPath);
    if (platform === 'android') {
      captureAndroidScreenshot({
        serial: c.serial ?? config.mobile.serial, out: screenshotPath, label: c.label,
        settleMs: c.settleMs, launchActivity: c.launchActivity, openUrl: c.openUrl, exec, sleep
      });
    } else {
      captureSimulatorScreenshot({
        udid: c.udid ?? config.mobile.udid, out: screenshotPath, label: c.label,
        settleMs: c.settleMs, launchBundleId: c.bundleId, openUrl: c.openUrl, exec, sleep
      });
    }
    // Read the driver-written meta sidecar and re-emit it as schemaVersion-2 metadata
    const driverMeta = JSON.parse(fs.readFileSync(metaPathFor(screenshotPath), 'utf8'));
    fs.unlinkSync(metaPathFor(screenshotPath)); // sidecar is folded into the matrix metadata
    const pngBytes = fs.readFileSync(screenshotPath);
    const metadata = {
      schemaVersion: 2,
      mode,
      key: c.key,
      route: c.label,
      viewport: { width: driverMeta.png?.width ?? null, height: driverMeta.png?.height ?? null },
      state: null,
      platform,
      label: c.label,
      navigation: c.openUrl ?? null,
      capturedAt: new Date().toISOString(),
      screenshotPath,
      screenshotSha256: crypto.createHash('sha256').update(pngBytes).digest('hex'),
      screenshotBytes: pngBytes.length,
      mobile: driverMeta
    };
    await writeJsonAtomic(metadataPath, metadata);
    results.push({
      screenshotPath, metadataPath,
      relativeScreenshot: path.relative(config.outputDir, screenshotPath),
      regionCount: 0, unresolvedRequiredRegionCount: 0, ok: true
    });
  }
  return results;
}
```

เทสต่อใน `tests/unit/mobile-capture-engine.test.mjs`: matrix 2 เคส (mock exec เขียน fakePng ตาม out), metadata schemaVersion/fields/sha ตรง, filters.case ตัดเคส, ผิด platform → throw

- [ ] **Step 3: mobile-checks engine**

สร้าง `lib/mobile-checks-engine.mjs`:

```js
/**
 * Mobile checks — per-case vision metrics + judge verdicts for the mobile
 * vision loop (capture.type ios-sim|android). Reads current artifacts written
 * by captureAllMobile and writes <key>.mobile.judgment.json next to metadata.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { artifactPaths } from './artifacts.mjs';
import { ensureParent, writeJsonAtomic } from './io.mjs';
import { computeVisionMetrics } from './vision-metrics-engine.mjs';
import { judgeMetrics } from './vision-judge-engine.mjs';

export async function runMobileChecks(config, { filters = {} } = {}) {
  if (!['ios-sim', 'android'].includes(config.capture?.type)) {
    throw new TypeError(`runMobileChecks requires capture.type ios-sim|android, got ${config.capture?.type}`);
  }
  const cases = (config.mobile?.cases ?? []).filter((c) => {
    if (filters.route && c.label !== filters.route) return false;
    if (filters.case && c.key !== filters.case) return false;
    return true;
  });
  const thresholds = config.mobile?.judge?.thresholds ?? {};
  const results = [];
  for (const c of cases) {
    const paths = artifactPaths(config.outputDir, { routeName: c.label, viewportName: 'mobile', stateName: c.key });
    if (!fs.existsSync(paths.currentPng)) {
      results.push({ key: c.key, label: c.label, verdict: 'fail', findings: [{ rule: 'missingCapture', severity: 'fail', expected: 'captured PNG', observed: null }], metricsPath: null, judgmentPath: null });
      continue;
    }
    const pngBytes = fs.readFileSync(paths.currentPng);
    const png = PNG.sync.read(pngBytes);
    const metrics = computeVisionMetrics({ width: png.width, height: png.height, data: png.data }, { cols: 8, rows: 5 });
    metrics.source = {
      sha256: crypto.createHash('sha256').update(pngBytes).digest('hex'),
      width: png.width,
      height: png.height
    };
    const verdictRecord = judgeMetrics({
      metrics, thresholds,
      caseLabel: c.label, goal: `mobile case ${c.key}`,
      metricsRef: null, captureRef: paths.currentPng
    });
    const judgmentPath = path.join(config.outputDir, 'metadata', `${path.basename(paths.currentPng).replace(/\.png$/, '')}.mobile.judgment.json`);
    await ensureParent(judgmentPath);
    await writeJsonAtomic(judgmentPath, verdictRecord);
    results.push({ key: c.key, label: c.label, verdict: verdictRecord.verdict, findings: verdictRecord.findings, metricsPath: null, judgmentPath });
  }
  return results;
}
```


เทส (`tests/unit/mobile-checks-engine.test.mjs`): fixture config (tmpdir outputDir + mobile.cases 1 เคส) + เขียน PNG ปลอม (PNG.sync.write) ลงcurrent path → ผล verdict pass เมื่อ thresholds ว่าง + judge file ถูกเขียน + missingCapture case

- [ ] **Step 4: vision-loop.mjs mobile branch**

หลัง `const config = await loadConfig(args.config);` (บรรทัด ~98):

```js
    const captureType = config.capture?.type ?? 'playwright';
    const isMobile = captureType !== 'playwright';
```
แล้วห่อชุด section เดิม:

```js
    if (isMobile) {
      if (!args['skip-capture']) sections.capture = await captureAllMobile(config, { mode: 'current', filters });
      if (!args['skip-compare'] && fsSync.existsSync(path.join(config.outputDir, 'reference'))) {
        sections.comparison = await compareAll(config, { filters });
      } else if (!args['skip-compare']) {
        process.stdout.write('compare: skipped (no stored reference captures for mobile)\n');
      }
      sections.mobileChecks = await runMobileChecks(config, { filters });
      for (const name of ['inspect', 'a11y', 'interaction', 'state-crawler', 'performance', 'tokens', 'breakpoints', 'engineering']) {
        process.stdout.write(`${name}: skipped (web-only section)\n`);
      }
    } else {
      // ...existing web body as-is...
    }
```

และ summary — `writeRunSummary` ใช้ `config` เดิม; เพิ่มก่อนเรียก:

```js
    const summaryConfig = isMobile
      ? { ...config, accessibility: { ...config.accessibility, enabled: false }, interaction: { ...config.interaction, enabled: false }, stateCrawler: { ...config.stateCrawler, enabled: false }, performance: { ...config.performance, enabled: false }, tokens: { ...config.tokens, enabled: false }, engineeringChecks: [], breakpoints: { ...config.breakpoints, enabled: false } }
      : config;
    const summary = await writeRunSummary(summaryConfig, sections, { provenance });
```
(ถ้า key ของ flags เหล่านั้นใน config ไม่ตรง (เช่น breakpoints ไม่มี field) ให้ใช้ชื่อจริงจาก config.mjs — อ่านก่อนแก้)

imports เพิ่มใน vision-loop.mjs: `captureAllMobile` จาก mobile-capture-engine, `runMobileChecks` จาก mobile-checks-engine, `fs` (sync) สำหรับ existsSync

- [ ] **Step 5: config schema + example**

`schemas/vision-loop-config.schema.json`: เพิ่ม `capture.properties.type` (enum 3 ค่า), `mobile` object ({udid, serial, cases[], judge}) แบบ additionalProperties true ที่ระดับ mobile (cases items: {key,label,bundleId,launchActivity,openUrl,settleMs,udid,serial}) — อ่าน schema เดิมก่อน แล้วแก้เฉพาะจุดเสริม

`vision-loop.config.example.json`: แทน `capture_ios_sim_example` comment block ด้วยจริง:

```json
  "capture": { "type": "playwright", ...เดิมทั้งหมด },
  "mobile": {
    "udid": "booted",
    "cases": [ { "key": "home", "label": "Home", "settleMs": 1500 } ],
    "judge": { "thresholds": { "maxEmptyCells": { "value": 6, "severity": "warn" } } }
  }
```

- [ ] **Step 6: Run tests**

Run: `node --test tests/unit/config-mobile.test.mjs tests/unit/mobile-capture-engine.test.mjs tests/unit/mobile-checks-engine.test.mjs && npm test`
Expected: ผ่านทั้งหมด (377+n)

- [ ] **Step 7: Commit**

```bash
git add lib/config.mjs lib/mobile-capture-engine.mjs lib/mobile-checks-engine.mjs scripts/vision-loop.mjs schemas/vision-loop-config.schema.json vision-loop.config.example.json tests/unit/config-mobile.test.mjs tests/unit/mobile-capture-engine.test.mjs tests/unit/mobile-checks-engine.test.mjs
git commit -m "feat(vision): wire mobile capture.type branch into vision-loop with per-case metrics+judge"
```

---

### Task 4: A2 — Android adapter

**Files:**
- Create: `lib/android-capture-engine.mjs`
- Modify: `lib/mobile-capture-engine.mjs` (unstub)
- Modify: `scripts/capture-mobile.mjs` (--platform android works)
- Test: `tests/unit/android-capture-engine.test.mjs`

**Interfaces:**
- Consumes: adb binary (HOST: `~/Library/Android/sdk/platform-tools/adb`)
- Produces: `captureAndroidScreenshot({serial, out, label, settleMs, launchActivity, openUrl, exec, sleep, adbPath}) → meta` (fields เดียวกับ iOS meta + `platform: 'android'`)

- [ ] **Step 1: Write failing tests**

`tests/unit/android-capture-engine.test.mjs`:

```js
test('captureAndroidScreenshot — exec-out path writes png + meta', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-'));
  const out = path.join(dir, 'cur.png');
  const png = fakePngBytes(1176, 2400); // reuse fakePngBytes helper shape — copy from mobile-capture test
  const exec = (cmd, args) => {
    if (args.join(' ').includes('exec-out screencap')) return { status: 0, stdout: png, stderr: '', encoding: 'buffer' };
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureAndroidScreenshot({ serial: 'emulator-5554', out, label: 'home', exec, sleep: () => {} });
  assert.equal(meta.platform, 'android');
  assert.equal(meta.serial, 'emulator-5554');
  assert.equal(fs.readFileSync(out).length, png.length);
  assert.equal(meta.png.width, 1176);
  assert.ok(meta.screenshotSha256);
});

test('captureAndroidScreenshot — falls back to pull when exec-out yields nothing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-'));
  const out = path.join(dir, 'cur.png');
  const png = fakePngBytes(1176, 2400);
  const calls = [];
  const exec = (cmd, args) => {
    calls.push(args.join(' '));
    if (args.join(' ').includes('exec-out')) return { status: 0, stdout: Buffer.alloc(0), stderr: '', encoding: 'buffer' };
    if (args.join(' ').includes('pull')) { fs.writeFileSync(out, png); return { status: 0, stdout: '', stderr: '' }; }
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureAndroidScreenshot({ out, exec, sleep: () => {} });
  assert.equal(meta.platform, 'android');
  assert.ok(calls.some((c) => c.includes('pull')));
});

test('captureAndroidScreenshot — adb failure surfaces stderr tail', () => {
  const exec = () => ({ status: 1, stdout: '', stderr: 'adb: device offline' });
  assert.throws(() => captureAndroidScreenshot({ out: '/tmp/x.png', exec, sleep: () => {} }), /device offline/);
});

test('captureAndroidScreenshot — deep link + launch flow order', () => {
  const calls = [];
  const png = fakePngBytes(8, 4);
  const exec = (cmd, args) => {
    calls.push(args.join(' '));
    if (args.join(' ').includes('exec-out')) return { status: 0, stdout: png, stderr: '', encoding: 'buffer' };
    return { status: 0, stdout: '', stderr: '' };
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-'));
  captureAndroidScreenshot({ out: path.join(dir, 'x.png'), openUrl: 'helos://chat/1', launchActivity: 'com.helos.app.helosMobile/.MainActivity', exec, sleep: () => {} });
  assert.ok(calls[0].includes('am start') || calls[0].includes('monkey'), 'launch/deep-link precedes capture');
});
```

(สร้าง `fakePngBytes` helper ภายในไฟล์เทสต์นี้ — copy รูปแบบจาก mobile-capture test)

- [ ] **Step 2: Run — verify FAIL**

Run: `node --test tests/unit/android-capture-engine.test.mjs`
Expected: FAIL — module ไม่มี

- [ ] **Step 3: Implement**

`lib/android-capture-engine.mjs`:

```js
/**
 * Android capture adapter — adb screencap (exec-out, with pull fallback).
 * Mirrors lib/mobile-capture-engine.mjs contract (PNG + meta sidecar fields).
 */
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

export function metaPathFor(outFile) {
  return /\.png$/i.test(outFile) ? outFile.replace(/\.png$/i, '.meta.json') : `${outFile}.meta.json`;
}

function readPngSize(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(24);
    fs.readSync(fd, head, 0, 24, 0);
    if (head.readUInt32BE(0) !== 0x89504e47) return null;
    return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

function defaultSleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

function assertAdbOk(result, stage) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const tail = String(result.stderr || result.stdout || '').trim().split('\n').slice(-3).join(' | ');
    throw new Error(`adb ${stage} failed (exit ${result.status}): ${tail || 'no output'}`);
  }
}

export function captureAndroidScreenshot(options = {}) {
  const {
    serial = 'emulator-5554', out, label = 'screen', settleMs = 0,
    launchActivity, openUrl,
    adbPath = 'adb',
    exec = spawnSync, sleep = defaultSleep
  } = options;
  if (typeof out !== 'string' || out.trim() === '') throw new TypeError('out file path is required');

  if (launchActivity) {
    assertAdbOk(exec(adbPath, ['-s', serial, 'shell', 'am', 'start', '-n', launchActivity], { encoding: 'utf8' }), 'launch');
  }
  if (openUrl) {
    assertAdbOk(exec(adbPath, ['-s', serial, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', openUrl], { encoding: 'utf8' }), 'openurl');
  }
  if (settleMs > 0) sleep(settleMs);

  // Preferred: exec-out (no sd-card roundtrip)
  const shot = exec(adbPath, ['-s', serial, 'exec-out', 'screencap'], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  assertAdbOk(shot, 'screenshot');
  const bytes = shot.stdout;
  if (Buffer.isBuffer(bytes) && bytes.length > 0) {
    fs.writeFileSync(out, bytes);
  } else {
    // Fallback: screencap to /sdcard then pull
    const remote = `/sdcard/.fvep_capture_${Date.now()}.png`;
    assertAdbOk(exec(adbPath, ['-s', serial, 'shell', 'screencap', '-p', remote], { encoding: 'utf8' }), 'screencap-file');
    assertAdbOk(exec(adbPath, ['-s', serial, 'pull', remote, out], { encoding: 'utf8' }), 'pull');
    exec(adbPath, ['-s', serial, 'shell', 'rm', '-f', remote], { encoding: 'utf8' });
  }
  if (!fs.existsSync(out) || fs.statSync(out).size === 0) {
    throw new Error(`adb screencap did not produce a non-empty file at ${out}`);
  }

  const pngBytes = fs.readFileSync(out);
  const meta = {
    platform: 'android',
    serial,
    label,
    captured_at: new Date().toISOString(),
    file: out,
    png: readPngSize(out) ?? null,
    screenshotSha256: crypto.createHash('sha256').update(pngBytes).digest('hex'),
    screenshotBytes: pngBytes.length,
    ...(launchActivity ? { launch_activity: launchActivity } : {}),
    ...(openUrl ? { open_url: openUrl } : {})
  };
  fs.writeFileSync(metaPathFor(out), `${JSON.stringify(meta, null, 2)}\n`);
  return meta;
}
```

`lib/mobile-capture-engine.mjs` — `captureSimulatorScreenshot` แทน android throw: เปลี่ยน platform branch ให้ Android ไปเรียก `captureAndroidScreenshot` (import จาก android-capture-engine) — **อย่าให้ stub เดิมโยนอีก**

`scripts/capture-mobile.mjs` — เมื่อ `platform === 'android'`: เรียก captureAndroidScreenshot ด้วย serial จาก `--serial` flag เพิ่ม; เพิ่ม `--serial <id>` ใน HELP

- [ ] **Step 4: Run — verify PASS**

Run: `node --test tests/unit/android-capture-engine.test.mjs tests/unit/mobile-capture-engine.test.mjs && npm test`
Expected: ผ่าน

- [ ] **Step 5: Live smoke Android** (ถ้า boot ได้)

```bash
~/Library/Android/sdk/emulator/emulator -avd Helos_Pixel6_API35 -no-snapshot-save &
# รอ boot: ~/Library/Android/sdk/platform-tools/adb wait-for-device
node scripts/capture-mobile.mjs --platform android --serial emulator-5554 --out /tmp/fvep-android.png --label home --settle 2
node scripts/vision-metrics.mjs --image /tmp/fvep-android.png --compact
```
Expected: PNG จริง + metrics จริง; ถ้า boot ไม่ขึ้น/ช้าเกิน → บันทึก BLOCKED ใน report (unit tests ยังเขียวครบ)

- [ ] **Step 6: Commit**

```bash
git add lib/android-capture-engine.mjs lib/mobile-capture-engine.mjs scripts/capture-mobile.mjs tests/unit/android-capture-engine.test.mjs
git commit -m "feat(capture): Android adapter (adb exec-out + pull fallback) — replaces phase-2 stub"
```

---

### Task 5: Verification + live loop smokes + docs

**Files:**
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md`

- [ ] **Step 1: Full unit** — `npm test` เขียวทั้งชุด

- [ ] **Step 2: Live iOS loop smoke** — สร้าง config ชั่วคราว /tmp/fvep-mobile.config.json:

```json
{
  "outputDir": "/tmp/fvep-loop",
  "baseUrl": "http://localhost",
  "capture": { "type": "ios-sim" },
  "mobile": {
    "udid": "booted",
    "cases": [ { "key": "home", "label": "home", "settleMs": 1500 } ],
    "judge": { "thresholds": {} }
  }
}
```
Run: `node scripts/vision-loop.mjs --config /tmp/fvep-mobile.config.json`
Expected: sections capture+mobileChecks ทำงาน, web-only sections skip พร้อม log, summary ออก, exit code สอดคล้อง verdicts (ไม่มี thresholds → ไม่ fail)
ข้อระวัง: loadConfig อาจ require fields ที่ config จิ๋วนี้ไม่มี — อ่าน `lib/config.mjs` defaults ก่อน แล้วเติมให้ครบ (คัดลอกโครงจาก vision-loop.config.example.json แล้วแก้ capture.type+mobile)

- [ ] **Step 3: Docs** — README.md/README_TH.md: อัปเดต Mobile section (loop wiring, android, verify-source); CHANGELOG entry (รูปแบบเดิม)

- [ ] **Step 4: docs bundle regen** — `npm run docs:all-in-one` (จำเป็นตาม test guard) + commit

```bash
git add README.md README_TH.md CHANGELOG.md FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md
git commit -m "docs: full mobile loop wiring — ios-sim/android, provenance, strict verdicts"
```

---

## Self-review notes (controller)

- Spec coverage: A1 (Task 3) ✅ A2 (Task 4) ✅ A3 (Task 1) ✅ A4 (Task 2) ✅ + verify (Task 5) ✅
- Type consistency: `evaluateMetrics(metrics, thresholds, sourceCheck)` (Task 1) ↔ judgeMetrics forward (Task 1) ↔ runMobileChecks (Task 3, ไม่ส่ง sourceCheck = null → ไม่บังคับเช็ค — โอเคใน loop เพราะ loop เขียน artifact เอง); `captureAllMobile` results shape ตรง captureAll ✅; `runMobileChecks(config, {filters})` async ✅
- Known risks: run-summary ตอน mobile อาจมี sections อื่นที่ config ต้องการ (baseline.enabled=false ใน summaryConfig?) — Task 3 Step 4 ให้อ่าน config.mjs จริงก่อนแก้ (เขียนไว้ใน note แล้ว); AVD boot อาจล้มเหลว → smoke แยก BLOCKED ได้
- บรรทัด config schema: keys อื่นที่ example มี (baseline/a11y/etc) อยู่นอก scope — schema แก้เฉพาะ capture.type + mobile
