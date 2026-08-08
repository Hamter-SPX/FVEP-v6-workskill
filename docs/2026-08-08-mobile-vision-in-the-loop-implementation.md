# Mobile Vision-in-the-Loop (iOS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม vision-in-the-loop สำหรับแอป native ลง FVEP v5 — จับภาพ iOS Simulator ได้, มีชั้นตัดสิน metrics-first ที่ text-only model ใช้ได้, และ judge slot สลับผู้พิพากษา 3 โหมด ตาม spec `docs/2026-08-08-mobile-vision-in-the-loop-design.md`

**Architecture:** adapter (`xcrun simctl`) → artifact PNG+meta เข้า pipeline เดิม · metrics engine (pngjs, deterministic) · judge slot (metrics/model/human → verdict schema เดียว) · ทั้งหมด additive ไม่แก้ engine เดิม

**Tech Stack:** Node ≥20 (ESM), node:test, pngjs/pixelmatch (deps เดิม — ห้ามเพิ่ม dependency)

## Global Constraints

- Repo: `/Users/jirawat/.config/opencode/skills/mainskill/fullstack-vision-engineering-pro-v5` — ทุก path ใน plan สัมพัทธ์กับ root นี้
- **ห้ามเพิ่ม npm dependency ใหม่** — ใช้ pngjs/pixelmatch/axe-core/playwright ที่มีอยู่เท่านั้น
- **ห้ามแก้ engine/script เดิม** (compare/ascii-map/layout-structure/vision-loop) — เข้าผ่าน artifact contract เท่านั้น
- Pattern บังคับ: engine = pure ESM exports ใน `lib/`; script = shebang + `parseLooseArgs`/`fail`/`printHelp` จาก `lib/cli.mjs`; test = `node:test` + `assert/strict` ใน `tests/unit/`
- Code comments + CLI help: อังกฤษ; เอกสารผู้ใช้ (README_TH) ไทย
- `npm test` ต้องเขียวทั้งชุดเมื่อจบทุก task
- ขั้นตอนแรกของ Task 1: `npm install` (ตอนนี้ไม่มี node_modules)
- Android adapter = stub exit non-zero + เอกสาร phase 2 เท่านั้น

---

### Task 1: iOS Simulator capture adapter

**Files:**
- Create: `lib/mobile-capture-engine.mjs`
- Create: `scripts/capture-mobile.mjs`
- Test: `tests/unit/mobile-capture-engine.test.mjs`

**Interfaces:**
- Consumes: ไม่มี (simctl เท่านั้น)
- Produces:
  - `buildSimctlScreenshotArgs(outFile, {udid}) → string[]`
  - `buildSimctlLaunchArgs(bundleId, {udid}) → string[]`
  - `buildSimctlOpenUrlArgs(url, {udid}) → string[]`
  - `captureSimulatorScreenshot(options) → meta` (Task ใช้เดี่ยว — ไม่มี consumer ใน plan นี้ แต่เป็นจุดต่อ pipeline ภายนอก)
  - sidecar: `<out>.meta.json` — `{platform, udid, label, captured_at, file, png: {width, height}, launch_bundle_id?, open_url?}`

- [ ] **Step 0: Install deps**

```bash
cd /Users/jirawat/.config/opencode/skills/mainskill/fullstack-vision-engineering-pro-v5 && npm install
```
Expected: node_modules พร้อม (pngjs, pixelmatch, axe-core, playwright) — `npm test` เดิมต้องเขียวก่อนเริ่มงาน (baseline)

- [ ] **Step 1: Write failing tests**

สร้าง `tests/unit/mobile-capture-engine.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildSimctlScreenshotArgs,
  buildSimctlLaunchArgs,
  buildSimctlOpenUrlArgs,
  captureSimulatorScreenshot,
  metaPathFor
} from '../../lib/mobile-capture-engine.mjs';

function fakePngBytes(width = 8, height = 4) {
  // PNG signature + IHDR with big-endian width/height (content pixels irrelevant for meta)
  const buf = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8); // IHDR length
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

test('buildSimctlScreenshotArgs — default booted', () => {
  assert.deepEqual(buildSimctlScreenshotArgs('/tmp/a.png'), ['simctl', 'io', 'booted', 'screenshot', '/tmp/a.png']);
});

test('buildSimctlScreenshotArgs — explicit udid + requires out', () => {
  assert.deepEqual(buildSimctlScreenshotArgs('o.png', { udid: 'UDID-1' }), ['simctl', 'io', 'UDID-1', 'screenshot', 'o.png']);
  assert.throws(() => buildSimctlScreenshotArgs(''), TypeError);
});

test('buildSimctlLaunchArgs / buildSimctlOpenUrlArgs', () => {
  assert.deepEqual(buildSimctlLaunchArgs('com.helos.app.helosMobile'), ['simctl', 'launch', 'booted', 'com.helos.app.helosMobile']);
  assert.deepEqual(buildSimctlOpenUrlArgs('helos://chat/1', { udid: 'X' }), ['simctl', 'openurl', 'X', 'helos://chat/1']);
  assert.throws(() => buildSimctlLaunchArgs(''), TypeError);
  assert.throws(() => buildSimctlOpenUrlArgs(null), TypeError);
});

test('captureSimulatorScreenshot — happy path writes png + sidecar meta', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const calls = [];
  const exec = (cmd, args) => {
    calls.push([cmd, ...args]);
    if (args[1] === 'io') fs.writeFileSync(out, fakePngBytes(1170, 2532));
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureSimulatorScreenshot({
    out, label: 'chat', udid: 'booted',
    launchBundleId: 'com.helos.app.helosMobile', settleMs: 5, exec, sleep: () => {}
  });
  assert.equal(meta.platform, 'ios-simulator');
  assert.equal(meta.label, 'chat');
  assert.deepEqual(meta.png, { width: 1170, height: 2532 });
  assert.equal(meta.launch_bundle_id, 'com.helos.app.helosMobile');
  assert.equal(fs.existsSync(metaPathFor(out)), true);
  const onDisk = JSON.parse(fs.readFileSync(metaPathFor(out), 'utf8'));
  assert.equal(onDisk.udid, 'booted');
  // launch happened before screenshot
  assert.deepEqual(calls[0].slice(1, 3), ['simctl', 'launch']);
  assert.deepEqual(calls[1].slice(1, 3), ['simctl', 'io']);
});

test('captureSimulatorScreenshot — simctl failure throws with stderr tail', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const exec = () => ({ status: 1, stdout: '', stderr: 'xcrun: error: Unable to boot device' });
  assert.throws(
    () => captureSimulatorScreenshot({ out, exec, sleep: () => {} }),
    /Unable to boot device/
  );
});

test('captureSimulatorScreenshot — android is an explicit phase-2 stub', () => {
  assert.throws(
    () => captureSimulatorScreenshot({ out: '/tmp/x.png', platform: 'android', exec: () => ({ status: 0 }), sleep: () => {} }),
    /phase 2/i
  );
});

test('captureSimulatorScreenshot — empty output file is an error', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const exec = (cmd, args) => {
    if (args[1] === 'io') fs.writeFileSync(out, Buffer.alloc(0));
    return { status: 0, stdout: '', stderr: '' };
  };
  assert.throws(
    () => captureSimulatorScreenshot({ out, exec, sleep: () => {} }),
    /non-empty file/
  );
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `cd /Users/jirawat/.config/opencode/skills/mainskill/fullstack-vision-engineering-pro-v5 && node --test tests/unit/mobile-capture-engine.test.mjs`
Expected: FAIL — cannot find module `../../lib/mobile-capture-engine.mjs`

- [ ] **Step 3: Implement engine**

สร้าง `lib/mobile-capture-engine.mjs`:

```js
/**
 * iOS Simulator capture adapter for vision-in-the-loop.
 * Wraps `xcrun simctl` so Flutter/native app screenshots feed the existing
 * compare / ascii-map / layout-structure pipeline unchanged.
 *
 * Phase 1: iOS Simulator only. Android (adb screencap) is a documented stub.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

export function buildSimctlScreenshotArgs(outFile, { udid = 'booted' } = {}) {
  if (typeof outFile !== 'string' || outFile.trim() === '') {
    throw new TypeError('out file path is required');
  }
  return ['simctl', 'io', udid, 'screenshot', outFile];
}

export function buildSimctlLaunchArgs(bundleId, { udid = 'booted' } = {}) {
  if (typeof bundleId !== 'string' || bundleId.trim() === '') {
    throw new TypeError('bundleId is required');
  }
  return ['simctl', 'launch', udid, bundleId];
}

export function buildSimctlOpenUrlArgs(url, { udid = 'booted' } = {}) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new TypeError('url is required');
  }
  return ['simctl', 'openurl', udid, url];
}

export function metaPathFor(outFile) {
  return outFile.replace(/\.png$/i, '.meta.json');
}

function readPngSize(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(24);
    fs.readSync(fd, head, 0, 24, 0);
    const sigOk = head.readUInt32BE(0) === 0x89504e47;
    if (!sigOk) return null;
    return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

function defaultSleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function assertSimctlOk(result, stage) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const tail = String(result.stderr || result.stdout || '').trim().split('\n').slice(-3).join(' | ');
    throw new Error(`simctl ${stage} failed (exit ${result.status}): ${tail || 'no output'}`);
  }
}

export function captureSimulatorScreenshot(options = {}) {
  const {
    udid = 'booted',
    out,
    label = 'screen',
    settleMs = 0,
    launchBundleId,
    openUrl,
    platform = 'ios',
    xcrunPath = 'xcrun',
    exec = spawnSync,
    sleep = defaultSleep
  } = options;

  if (platform !== 'ios') {
    throw new Error('capture-mobile: --platform android is phase 2 — not implemented yet');
  }
  if (typeof out !== 'string' || out.trim() === '') {
    throw new TypeError('out file path is required');
  }

  if (launchBundleId) {
    assertSimctlOk(exec(xcrunPath, buildSimctlLaunchArgs(launchBundleId, { udid }), { encoding: 'utf8' }), 'launch');
  }
  if (openUrl) {
    assertSimctlOk(exec(xcrunPath, buildSimctlOpenUrlArgs(openUrl, { udid }), { encoding: 'utf8' }), 'openurl');
  }
  if (settleMs > 0) sleep(settleMs);

  assertSimctlOk(exec(xcrunPath, buildSimctlScreenshotArgs(out, { udid }), { encoding: 'utf8' }), 'screenshot');
  if (!fs.existsSync(out) || fs.statSync(out).size === 0) {
    throw new Error(`simctl screenshot did not produce a non-empty file at ${out}`);
  }

  const meta = {
    platform: 'ios-simulator',
    udid,
    label,
    captured_at: new Date().toISOString(),
    file: out,
    png: readPngSize(out) ?? null,
    ...(launchBundleId ? { launch_bundle_id: launchBundleId } : {}),
    ...(openUrl ? { open_url: openUrl } : {})
  };
  fs.writeFileSync(metaPathFor(out), `${JSON.stringify(meta, null, 2)}\n`);
  return meta;
}
```

- [ ] **Step 4: Run — verify engine tests PASS**

Run: `node --test tests/unit/mobile-capture-engine.test.mjs`
Expected: PASS 6 tests (หมายเหตุ: happy-path meta.png — happy path ใช้ fakePngBytes 8x4 default ไม่ใช่ 1170x2532? ตรวจ test ขณะ implement: fakePngBytes ถูกเรียกด้วย (1170, 2532) → meta.png = {1170, 2532} ✓)

- [ ] **Step 5: CLI script**

สร้าง `scripts/capture-mobile.mjs`:

```js
#!/usr/bin/env node
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { captureSimulatorScreenshot } from '../lib/mobile-capture-engine.mjs';

const HELP = `Usage:
  node scripts/capture-mobile.mjs --out <cur.png> [options]

Capture a screenshot from an iOS Simulator (Flutter/native apps) for vision loops.

Options:
  --udid <id>         Simulator UDID or 'booted' (default: booted)
  --out <file>        Output PNG path (required)
  --label <name>      Case label stored in the sidecar meta (default: screen)
  --launch <bundleId> Launch an app bundle id before capturing
  --open-url <url>    Open a (deep) link before capturing
  --settle <sec>      Wait before capturing (default: 0)
  --platform <name>   ios | android (android = phase 2 stub, exits non-zero)
  -h, --help          Show help

Examples:
  node scripts/capture-mobile.mjs --out .fx/cur.png --label chat
  node scripts/capture-mobile.mjs --udid 2357B650 --launch com.helos.app.helosMobile --settle 2 --out .fx/chat.png
`;

try {
  const { args } = parseLooseArgs();
  const out = args.out;
  if (args.help || args.h) { printHelp(HELP); process.exitCode = 0; }
  else if (!out) { printHelp(HELP); process.exitCode = 1; }
  else {
    const settleMs = Math.max(0, Math.round(Number(args.settle ?? 0) * 1000));
    const meta = captureSimulatorScreenshot({
      out,
      udid: args.udid ?? 'booted',
      label: args.label ?? 'screen',
      settleMs,
      launchBundleId: args.launch,
      openUrl: args['open-url'] ?? args.openUrl,
      platform: args.platform ?? 'ios'
    });
    process.stdout.write(`${JSON.stringify(meta, null, 2)}\n`);
  }
} catch (error) { fail(error); }
```

- [ ] **Step 6: CLI smoke (อยู่ร่วมกับ engine test)**

Run: `node scripts/capture-mobile.mjs --help`
Expected: พิมพ์ HELP, exit 0

- [ ] **Step 7: Commit**

```bash
git add lib/mobile-capture-engine.mjs scripts/capture-mobile.mjs tests/unit/mobile-capture-engine.test.mjs package-lock.json
git commit -m "feat(capture): iOS Simulator adapter for vision loops (simctl screenshot + meta sidecar)"
```

---

### Task 2: Vision metrics engine (metrics-first judgment)

**Files:**
- Create: `lib/vision-metrics-engine.mjs`
- Create: `scripts/vision-metrics.mjs`
- Test: `tests/unit/vision-metrics-engine.test.mjs`

**Interfaces:**
- Consumes: RGBA image `{width, height, data}` (contract เดียวกับ `lib/ascii-map-engine.mjs`); `classifyHarmony` จาก `lib/color-harmony-engine.mjs` (มีอยู่ — signature `classifyHarmony(hues = [])`)
- Produces (Task 3 ใช้):
  - `computeVisionMetrics(image, options) → metrics` — fields: `dimensions`, `occupancy`, `density`, `palette`, `alignment`, `contrast` (รูปทรงใน test ด้านล่าง)
  - `lumaAtData(data, offset) → 0..1`
  - `occupancyGrid(image, {cols, rows, tolerance}) → occupancy`

- [ ] **Step 1: Write failing tests**

สร้าง `tests/unit/vision-metrics-engine.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lumaAtData,
  occupancyGrid,
  densityGrid,
  extractPalette,
  alignmentScore,
  computeVisionMetrics
} from '../../lib/vision-metrics-engine.mjs';

function solid(width, height, rgba) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    data[o] = rgba[0]; data[o + 1] = rgba[1]; data[o + 2] = rgba[2]; data[o + 3] = rgba[3] ?? 255;
  }
  return { width, height, data };
}

function paint(image, x0, y0, w, h, rgba) {
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      const o = (y * image.width + x) * 4;
      image.data[o] = rgba[0]; image.data[o + 1] = rgba[1];
      image.data[o + 2] = rgba[2]; image.data[o + 3] = rgba[3] ?? 255;
    }
  }
  return image;
}

test('lumaAtData — white ≈ 1, black ≈ 0, transparent ≈ 0', () => {
  const img = solid(2, 1, [255, 255, 255, 255]);
  assert.ok(lumaAtData(img.data, 0) > 0.99);
  const black = solid(2, 1, [0, 0, 0, 255]);
  assert.ok(lumaAtData(black.data, 0) < 0.01);
  const transparent = solid(2, 1, [255, 255, 255, 0]);
  assert.ok(lumaAtData(transparent.data, 0) < 0.01);
});

test('occupancyGrid — single blob in one cell of an 8x5 grid', () => {
  // background white, blob 10x8 black at (0,0) of 80x40 image
  // grid 8x5 → cell = 10x8 → blob fills cell (0,0) exactly
  const img = paint(solid(80, 40, [255, 255, 255, 255]), 0, 0, 10, 8, [0, 0, 0, 255]);
  const occ = occupancyGrid(img, { cols: 8, rows: 5 });
  assert.equal(occ.grid.cols, 8);
  assert.equal(occ.cells.length, 40);
  assert.ok(occ.cells[0] > 0.95, `cell(0,0) ~ full, got ${occ.cells[0]}`);
  assert.ok(occ.cells[1] < 0.05, `cell(1,0) ~ empty, got ${occ.cells[1]}`);
  assert.ok(occ.emptyCells.length >= 38);
  assert.deepEqual(occ.background, [255, 255, 255]);
  assert.ok(occ.balance.centerX < 0, 'mass left of center');
});

test('occupancyGrid — solid background image is all-empty', () => {
  const img = solid(40, 20, [10, 20, 30, 255]);
  const occ = occupancyGrid(img, { cols: 4, rows: 2 });
  assert.equal(occ.emptyCells.length, 8);
});

test('densityGrid — textured half has higher mean gradient', () => {
  const img = solid(40, 20, [255, 255, 255, 255]);
  // checkerboard left half (strong gradients), flat right half
  for (let y = 0; y < 20; y += 1) {
    for (let x = 0; x < 20; x += 1) {
      const v = (x + y) % 2 === 0 ? 0 : 255;
      paint(img, x, y, 1, 1, [v, v, v, 255]);
    }
  }
  const den = densityGrid(img, { cols: 2, rows: 1 });
  assert.ok(den.cells[0] > den.cells[1] * 3, `left dense: ${den.cells[0]} vs right flat: ${den.cells[1]}`);
});

test('extractPalette — dominant colors + harmony classification', () => {
  const img = solid(60, 60, [255, 255, 255, 255]);
  paint(img, 0, 0, 30, 60, [230, 57, 70, 255]);   // HeloS red half
  paint(img, 30, 0, 30, 60, [8, 8, 10, 255]);     // HeloS black half
  const pal = extractPalette(img, { topK: 3 });
  assert.ok(pal.colors.length >= 2);
  const shares = pal.colors.map((c) => c.share);
  assert.ok(Math.abs(shares[0] - 0.5) < 0.15, `top color ~50%: ${shares[0]}`);
  assert.ok(typeof pal.harmony === 'string' && pal.harmony.length > 0);
  const reds = pal.colors.filter((c) => c.rgb[0] > 150);
  assert.equal(reds.length, 1);
});

test('alignmentScore — strongly columned layout scores higher than noise', () => {
  const cols = solid(60, 40, [255, 255, 255, 255]);
  paint(cols, 10, 0, 20, 40, [0, 0, 0, 255]);      // one block with sharp vertical edges at x=10, x=30
  const structured = alignmentScore(cols);
  const noise = alignmentScore(solid(60, 40, [128, 128, 128, 255]));
  assert.ok((structured.vertical ?? 0) > 0);
  assert.ok(noise.vertical === null || noise.vertical === 0);
});

test('computeVisionMetrics — full shape', () => {
  const img = paint(solid(80, 40, [255, 255, 255, 255]), 0, 0, 20, 40, [230, 57, 70, 255]);
  const m = computeVisionMetrics(img, { cols: 8, rows: 5 });
  assert.deepEqual(m.dimensions, { width: 80, height: 40 });
  assert.ok(m.occupancy && Array.isArray(m.occupancy.cells));
  assert.ok(typeof m.density.mean === 'number');
  assert.ok(Array.isArray(m.palette.colors));
  assert.ok(typeof m.alignment === 'object');
  assert.ok(typeof m.contrast.darkShare === 'number');
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `node --test tests/unit/vision-metrics-engine.test.mjs`
Expected: FAIL — cannot find module

- [ ] **Step 3: Implement engine**

สร้าง `lib/vision-metrics-engine.mjs`:

```js
/**
 * Deterministic vision metrics for text-only judgment.
 * Numbers over opinions: occupancy, density, palette, alignment, contrast —
 * pure functions over RGBA images ({width, height, data}).
 */
import { classifyHarmony } from './color-harmony-engine.mjs';

function clamp01(v) { return Math.min(1, Math.max(0, v)); }

export function lumaAtData(data, offset) {
  const a = data[offset + 3] / 255;
  const y = (0.2126 * (data[offset] / 255))
    + (0.7152 * (data[offset + 1] / 255))
    + (0.0722 * (data[offset + 2] / 255));
  return clamp01(y * a);
}

function assertImage(image) {
  const { width, height, data } = image ?? {};
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new TypeError('Image width and height must be positive integers.');
  }
  if (!data || data.length < width * height * 4) {
    throw new TypeError('Image data must contain RGBA bytes for every pixel.');
  }
}

function quantKey(r, g, b) {
  return `${r},${g},${b}`;
}

export function sampleBorderBackground(image, { border = 4 } = {}) {
  assertImage(image);
  const b = Math.max(1, Math.min(border, Math.floor(Math.min(image.width, image.height) / 4)));
  const counts = new Map();
  const push = (x, y) => {
    const o = (y * image.width + x) * 4;
    const key = quantKey(data8(image.data, o), data8(image.data, o + 1), data8(image.data, o + 2));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (x < b || y < b || x >= image.width - b || y >= image.height - b) push(x, y);
    }
  }
  let best = null;
  for (const [key, n] of counts) if (!best || n > best.n) best = { key, n };
  const [r, g, bch] = best.key.split(',').map(Number);
  return [r, g, bch];
}

function data8(data, o) { return data[o] ?? 0; }

function colorDistance(data, o, bg) {
  const dr = data[o] - bg[0]; const dg = data[o + 1] - bg[1]; const db = data[o + 2] - bg[2];
  const alphaFade = data[o + 3] / 255;
  return Math.sqrt(dr * dr + dg * dg + db * db) * alphaFade;
}

export function occupancyGrid(image, { cols = 8, rows = 5, tolerance = 48, emptyBelow = 0.02 } = {}) {
  assertImage(image);
  const bg = sampleBorderBackground(image);
  const cells = new Array(cols * rows).fill(0);
  const counts = new Array(cols * rows).fill(0);
  for (let y = 0; y < image.height; y += 1) {
    const rowIdx = Math.min(rows - 1, Math.floor((y / image.height) * rows));
    for (let x = 0; x < image.width; x += 1) {
      const colIdx = Math.min(cols - 1, Math.floor((x / image.width) * cols));
      const cell = rowIdx * cols + colIdx;
      counts[cell] += 1;
      if (colorDistance(image.data, (y * image.width + x) * 4, bg) > tolerance) cells[cell] += 1;
    }
  }
  const ratios = cells.map((n, i) => (counts[i] ? n / counts[i] : 0));
  const emptyCells = [];
  ratios.forEach((ratio, i) => {
    if (ratio < emptyBelow) emptyCells.push({ col: i % cols, row: Math.floor(i / cols), ratio });
  });
  let left = 0; let right = 0; let top = 0; let bottom = 0;
  ratios.forEach((ratio, i) => {
    const c = i % cols; const r = Math.floor(i / cols);
    const wx = cols > 1 ? (c / (cols - 1)) * 2 - 1 : 0;
    const wy = rows > 1 ? (r / (rows - 1)) * 2 - 1 : 0;
    if (wx < 0) left += ratio * -wx; else right += ratio * wx;
    if (wy < 0) top += ratio * -wy; else bottom += ratio * wy;
  });
  const total = Math.max(1e-9, ratios.reduce((a, b) => a + b, 0));
  return {
    grid: { cols, rows },
    cells: ratios,
    emptyCells,
    background: bg,
    balance: {
      left: left / total, right: right / total, top: top / total, bottom: bottom / total,
      centerX: right / total - left / total,
      centerY: bottom / total - top / total
    }
  };
}

export function densityGrid(image, { cols = 8, rows = 5 } = {}) {
  assertImage(image);
  const cells = new Array(cols * rows).fill(0);
  const counts = new Array(cols * rows).fill(0);
  for (let y = 0; y < image.height - 1; y += 1) {
    const rowIdx = Math.min(rows - 1, Math.floor((y / image.height) * rows));
    for (let x = 0; x < image.width - 1; x += 1) {
      const colIdx = Math.min(cols - 1, Math.floor((x / image.width) * cols));
      const o = (y * image.width + x) * 4;
      const gx = Math.abs(lumaAtData(image.data, o + 4) - lumaAtData(image.data, o));
      const gy = Math.abs(lumaAtData(image.data, o + image.width * 4) - lumaAtData(image.data, o));
      const cell = rowIdx * cols + colIdx;
      cells[cell] += gx + gy;
      counts[cell] += 1;
    }
  }
  const means = cells.map((n, i) => (counts[i] ? n / counts[i] : 0));
  return { grid: { cols, rows }, cells: means, mean: means.reduce((a, b) => a + b, 0) / means.length };
}

function rgbToHue(r, g, b) {
  const rr = r / 255; const gg = g / 255; const bb = b / 255;
  const max = Math.max(rr, gg, bb); const min = Math.min(rr, gg, bb);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === rr) h = 60 * (((gg - bb) / d) % 6);
  else if (max === gg) h = 60 * ((bb - rr) / d + 2);
  else h = 60 * ((rr - gg) / d + 4);
  return ((h % 360) + 360) % 360;
}

export function extractPalette(image, { topK = 6, quantizeShift = 3 } = {}) {
  assertImage(image);
  const counts = new Map();
  let total = 0;
  for (let o = 0; o < image.width * image.height * 4; o += 4) {
    if (image.data[o + 3] < 32) continue;
    const key = quantKey(
      image.data[o] >> quantizeShift,
      image.data[o + 1] >> quantizeShift,
      image.data[o + 2] >> quantizeShift
    );
    counts.set(key, (counts.get(key) ?? 0) + 1);
    total += 1;
  }
  const colors = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([key, n]) => {
      const [r, g, b] = key.split(',').map(Number);

      const rgb = [
        Math.min(255, (r << quantizeShift) + (1 << (quantizeShift - 1))),
        Math.min(255, (g << quantizeShift) + (1 << (quantizeShift - 1))),
        Math.min(255, (b << quantizeShift) + (1 << (quantizeShift - 1)))
      ];
      return { rgb, share: total ? n / total : 0 };
    });
  const hues = colors.map((c) => rgbToHue(c.rgb[0], c.rgb[1], c.rgb[2]));
  return { colors, harmony: colors.length ? classifyHarmony(hues) : 'none' };
}
```

ต่อด้วยส่วนที่เหลือของ engine:

```js
export function alignmentScore(image, { threshold = 0.18 } = {}) {
  assertImage(image);
  const { width, height, data } = image;
  if (width < 8 || height < 8) return { vertical: null, horizontal: null, score: null };
  const vCols = [];
  for (let x = 1; x < width - 1; x += 1) {
    let acc = 0;
    for (let y = 1; y < height - 1; y += 1) {
      const o = (y * width + x) * 4;
      acc += Math.abs(lumaAtData(data, o + 4) - lumaAtData(data, o - 4));
    }
    if (acc / (height - 2) > threshold) vCols.push(x);
  }
  const hRows = [];
  for (let y = 1; y < height - 1; y += 1) {
    let acc = 0;
    for (let x = 1; x < width - 1; x += 1) {
      const o = (y * width + x) * 4;
      acc += Math.abs(lumaAtData(data, o + width * 4) - lumaAtData(data, o - width * 4));
    }
    if (acc / (width - 2) > threshold) hRows.push(y);
  }
  const clustered = (positions) => {
    if (positions.length === 0) return null;
    const runs = [];
    let start = positions[0]; let prev = positions[0];
    for (const p of positions.slice(1)) {
      if (p - prev <= 2) { prev = p; continue; }
      runs.push([start, prev]); start = p; prev = p;
    }
    runs.push([start, prev]);
    return Math.min(1, runs.length / Math.max(1, positions.length / 8));
  };
  const vertical = clustered(vCols);
  const horizontal = clustered(hRows);
  const present = [vertical, horizontal].filter((v) => v !== null);
  return {
    vertical, horizontal,
    score: present.length ? present.reduce((a, b) => a + b, 0) / present.length : null
  };
}

export function contrastHistogram(image, { bins = 10 } = {}) {
  assertImage(image);
  const hist = new Array(bins).fill(0);
  let total = 0;
  for (let o = 0; o < image.width * image.height * 4; o += 4) {
    const y = lumaAtData(image.data, o);
    hist[Math.min(bins - 1, Math.floor(y * bins))] += 1;
    total += 1;
  }
  const darkShare = total ? (hist[0] + hist[1]) / total : 0;
  const lightShare = total ? (hist[bins - 1] + hist[bins - 2]) / total : 0;
  return { bins: hist, darkShare, lightShare, midShare: 1 - darkShare - lightShare };
}

export function computeVisionMetrics(image, { cols = 8, rows = 5 } = {}) {
  assertImage(image);
  const occupancy = occupancyGrid(image, { cols, rows });
  const density = densityGrid(image, { cols, rows });
  const palette = extractPalette(image);
  const alignment = alignmentScore(image);
  const contrast = contrastHistogram(image);
  return {
    dimensions: { width: image.width, height: image.height },
    occupancy, density, palette, alignment, contrast
  };
}
```

- [ ] **Step 4: Run — verify tests PASS**

Run: `node --test tests/unit/vision-metrics-engine.test.mjs`
Expected: PASS 7 tests. ถ้า `alignmentScore` structured-case ไม่ผ่าน ให้ debug ที่ threshold (0.18) กับ fixture ขนาด 60x40 — ขอบ block x=10/x=30 ต้องมี mean|Δ| ≈ 1.0 (ขาว→ดำ) จึงผ่าน

- [ ] **Step 5: CLI script**

สร้าง `scripts/vision-metrics.mjs`:

```js
#!/usr/bin/env node
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { computeVisionMetrics } from '../lib/vision-metrics-engine.mjs';

const HELP = `Usage:
  node scripts/vision-metrics.mjs --image <cur.png> [options]

Compute deterministic vision metrics (occupancy/density/palette/alignment/contrast)
so an agent can judge a render without seeing the image.

Options:
  --image <file>      PNG to analyze (required)
  --grid <CxR>        Occupancy/density grid, e.g. 8x5 (default: 8x5)
  --out <file>        Write metrics JSON here (default: stdout only)
  --compact           Print single-line summary instead of full JSON
  -h, --help          Show help

Examples:
  node scripts/vision-metrics.mjs --image .fx/cur.png --grid 8x5 --out .fx/metrics.json
`;

function parseGrid(value) {
  const m = /^(\d+)x(\d+)$/.exec(String(value ?? '8x5'));
  if (!m) throw new TypeError('--grid must look like 8x5');
  return { cols: Number(m[1]), rows: Number(m[2]) };
}

try {
  const { args } = parseLooseArgs();
  if (args.help || args.h) { printHelp(HELP); process.exitCode = 0; }
  else if (!args.image) { printHelp(HELP); process.exitCode = 1; }
  else {
    const png = PNG.sync.read(fs.readFileSync(args.image));
    const grid = parseGrid(args.grid);
    const metrics = computeVisionMetrics({ width: png.width, height: png.height, data: png.data }, grid);
    if (args.out) fs.writeFileSync(args.out, `${JSON.stringify(metrics, null, 2)}\n`);
    if (args.compact) {
      const o = metrics.occupancy;
      process.stdout.write([
        `emptyCells=${o.emptyCells.length}/${o.cells.length}`,
        `balanceX=${o.balance.centerX.toFixed(2)}`,
        `density=${metrics.density.mean.toFixed(4)}`,
        `topPalette=${metrics.palette.colors.slice(0, 3).map((c) => `#${c.rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}(${Math.round(c.share * 100)}%)`).join(' ')}`,
        `harmony=${metrics.palette.harmony}`,
        `align=${metrics.alignment.score?.toFixed(2) ?? 'n/a'}`,
        `dark=${metrics.contrast.darkShare.toFixed(2)}/light=${metrics.contrast.lightShare.toFixed(2)}`
      ].join(' | ') + '\n');
    } else {
      process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`);
    }
  }
} catch (error) { fail(error); }
```

- [ ] **Step 6: CLI smoke**

Run: `node -e "const {PNG}=require('pngjs');const p=new PNG({width:40,height:20});for(let i=0;i<p.data.length;i+=4){p.data[i]=255;p.data[i+1]=255;p.data[i+2]=255;p.data[i+3]=255;}require('fs').writeFileSync('/tmp/vm-smoke.png',PNG.sync.write(p));" && node scripts/vision-metrics.mjs --image /tmp/vm-smoke.png --compact`
Expected: บรรทัดสรุป (emptyCells=40/40, harmony=none)

- [ ] **Step 7: Commit**

```bash
git add lib/vision-metrics-engine.mjs scripts/vision-metrics.mjs tests/unit/vision-metrics-engine.test.mjs
git commit -m "feat(vision): deterministic metrics engine (occupancy/density/palette/alignment/contrast)"
```

---

### Task 3: Judge slot (metrics / model / human)

**Files:**
- Create: `lib/vision-judge-engine.mjs`
- Create: `scripts/vision-judge.mjs`
- Create: `schemas/vision-judgment.schema.json`
- Test: `tests/unit/vision-judge-engine.test.mjs`

**Interfaces:**
- Consumes: metrics object จาก `computeVisionMetrics` (Task 2 — fields `.occupancy.emptyCells`, `.alignment.score`, `.contrast.*`)
- Produces:
  - `VERDICTS = ['pass','warn','fail']`
  - `evaluateMetrics(metrics, thresholds) → findings[]` — threshold keys: `maxEmptyCells`, `minAlignment`, `maxDarkShare`, `minDarkShare`, `maxLightShare`, `minLightShare` (ค่า number = severity fail; `{value, severity}` = กำหนดเอง)
  - `judgeMetrics({metrics, thresholds, caseLabel, goal}) → verdictRecord`
  - `validateVerdictRecord(parsed) → parsed` (throw ถ้า invalid)
  - `buildVerdictRecord({mode, caseLabel, goal, verdict, findings, metricsRef, captureRef, judgedBy}) → record`

- [ ] **Step 1: Write failing tests**

สร้าง `tests/unit/vision-judge-engine.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERDICTS,
  evaluateMetrics,
  judgeMetrics,
  validateVerdictRecord,
  buildVerdictRecord
} from '../../lib/vision-judge-engine.mjs';

const baseMetrics = {
  dimensions: { width: 80, height: 40 },
  occupancy: { grid: { cols: 8, rows: 5 }, cells: new Array(40).fill(0.5), emptyCells: [], balance: { centerX: 0, centerY: 0 } },
  density: { mean: 0.05 },
  palette: { colors: [], harmony: 'complementary' },
  alignment: { vertical: 0.6, horizontal: null, score: 0.6 },
  contrast: { bins: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], darkShare: 0.5, lightShare: 0.5, midShare: 0 }
};

test('VERDICTS has exactly pass/warn/fail', () => {
  assert.deepEqual([...VERDICTS].sort(), ['fail', 'pass', 'warn']);
});

test('evaluateMetrics — no thresholds → no findings', () => {
  assert.deepEqual(evaluateMetrics(baseMetrics, {}), []);
});

test('evaluateMetrics — maxEmptyCells fail when exceeded', () => {
  const m = structuredClone(baseMetrics);
  m.occupancy.emptyCells = [{ col: 0, row: 0, ratio: 0 }, { col: 1, row: 0, ratio: 0.01 }];
  const findings = evaluateMetrics(m, { maxEmptyCells: 1 });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, 'maxEmptyCells');
  assert.equal(findings[0].severity, 'fail');
  assert.equal(findings[0].observed, 2);
});

test('evaluateMetrics — severity object form honored (warn)', () => {
  const m = structuredClone(baseMetrics);
  m.alignment = { vertical: 0.3, horizontal: null, score: 0.3 };
  const findings = evaluateMetrics(m, { minAlignment: { value: 0.5, severity: 'warn' } });
  assert.equal(findings[0]?.severity, 'warn');
});

test('judgeMetrics — fail dominates warn dominates pass', () => {
  const bad = structuredClone(baseMetrics);
  bad.occupancy.emptyCells = [{ col: 0, row: 0, ratio: 0 }];
  const vFail = judgeMetrics({ metrics: bad, thresholds: { maxEmptyCells: 0 }, caseLabel: 'chat', goal: 'dense list' });
  assert.equal(vFail.verdict, 'fail');
  const vWarn = judgeMetrics({ metrics: bad, thresholds: { maxEmptyCells: { value: 0, severity: 'warn' } } });
  assert.equal(vWarn.verdict, 'warn');
  const vPass = judgeMetrics({ metrics: baseMetrics, thresholds: { maxEmptyCells: 5 } });
  assert.equal(vPass.verdict, 'pass');
});

test('buildVerdictRecord + validateVerdictRecord round-trip', () => {
  const rec = buildVerdictRecord({
    mode: 'metrics', caseLabel: 'chat', goal: 'g',
    verdict: 'pass', findings: [], metricsRef: '.fx/metrics.json', captureRef: '.fx/cur.png', judgedBy: 'metrics-engine'
  });
  assert.equal(rec.schema_version, 1);
  assert.equal(rec.mode, 'metrics');
  assert.equal(validateVerdictRecord(rec), rec);
  assert.throws(() => validateVerdictRecord({ ...rec, verdict: 'meh' }), /verdict/);
  assert.throws(() => validateVerdictRecord({ ...rec, judged_at: 'not-a-date' }), /judged_at/);
  assert.throws(() => validateVerdictRecord({ verdict: 'pass' }), /case_label/);
});
```

- [ ] **Step 2: Run — verify FAIL**

Run: `node --test tests/unit/vision-judge-engine.test.mjs`
Expected: FAIL — cannot find module

- [ ] **Step 3: Implement engine**

สร้าง `lib/vision-judge-engine.mjs`:

```js
/**
 * Vision judge slot — one verdict schema, three judge modes:
 *   metrics (threshold gates), model (vision-capable agent package),
 *   human (explicit human verdict). All verdicts share one record shape.
 */
export const VERDICTS = ['pass', 'warn', 'fail'];

const SEVERITIES = ['warn', 'fail'];

function ruleSeverity(raw) {
  if (raw && typeof raw === 'object' && 'severity' in raw) {
    if (!SEVERITIES.includes(raw.severity)) {
      throw new TypeError(`severity must be ${SEVERITIES.join('|')}`);
    }
    return { value: raw.value, severity: raw.severity };
  }
  return { value: raw, severity: 'fail' };
}

export function evaluateMetrics(metrics, thresholds = {}) {
  const findings = [];
  const occ = metrics?.occupancy;
  const align = metrics?.alignment;
  const con = metrics?.contrast;

  const rules = [
    ['maxEmptyCells', () => (occ ? occ.emptyCells.length : 0), 'max'],
    ['minAlignment', () => align?.score, 'min'],
    ['maxDarkShare', () => con?.darkShare, 'max'],
    ['minDarkShare', () => con?.darkShare, 'min'],
    ['maxLightShare', () => con?.lightShare, 'max'],
    ['minLightShare', () => con?.lightShare, 'min']
  ];

  for (const [rule, readObserved, direction] of rules) {
    if (!(rule in thresholds)) continue;
    const { value: expected, severity } = ruleSeverity(thresholds[rule]);
    const observed = readObserved();
    if (observed === null || observed === undefined) continue;
    const breached = direction === 'max' ? observed > expected : observed < expected;
    if (breached) {
      findings.push({ rule, severity, expected, observed });
    }
  }
  return findings;
}

function verdictFromFindings(findings) {
  if (findings.some((f) => f.severity === 'fail')) return 'fail';
  if (findings.some((f) => f.severity === 'warn')) return 'warn';
  return 'pass';
}

export function buildVerdictRecord({
  mode, caseLabel, goal, verdict, findings = [], metricsRef, captureRef, judgedBy
}) {
  if (!VERDICTS.includes(verdict)) throw new TypeError(`verdict must be ${VERDICTS.join('|')}`);
  return {
    schema_version: 1,
    case_label: caseLabel ?? 'screen',
    mode,
    verdict,
    findings,
    metrics_ref: metricsRef ?? null,
    capture_ref: captureRef ?? null,
    judged_by: judgedBy ?? mode,
    judged_at: new Date().toISOString(),
    goal: goal ?? null
  };
}

export function judgeMetrics({ metrics, thresholds = {}, caseLabel, goal, metricsRef, captureRef }) {
  const findings = evaluateMetrics(metrics, thresholds);
  return buildVerdictRecord({
    mode: 'metrics', caseLabel, goal,
    verdict: verdictFromFindings(findings), findings,
    metricsRef, captureRef, judgedBy: 'metrics-engine'
  });
}

export function validateVerdictRecord(parsed) {
  if (parsed === null || typeof parsed !== 'object') {
    throw new TypeError('verdict record must be an object');
  }
  if (typeof parsed.case_label !== 'string' || parsed.case_label === '') {
    throw new TypeError('case_label is required (string)');
  }
  if (!VERDICTS.includes(parsed.verdict)) {
    throw new TypeError(`verdict must be ${VERDICTS.join('|')}`);
  }
  if (typeof parsed.judged_at !== 'string' || Number.isNaN(Date.parse(parsed.judged_at))) {
    throw new TypeError('judged_at must be an ISO date string');
  }
  if (!Array.isArray(parsed.findings)) {
    throw new TypeError('findings must be an array');
  }
  return parsed;
}
```

- [ ] **Step 4: Run — verify PASS**

Run: `node --test tests/unit/vision-judge-engine.test.mjs`
Expected: PASS 6 tests

- [ ] **Step 5: Schema + CLI**

สร้าง `schemas/vision-judgment.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "vision-judgment.schema.json",
  "title": "Vision Judgment Record",
  "type": "object",
  "required": ["schema_version", "case_label", "mode", "verdict", "findings", "judged_by", "judged_at"],
  "properties": {
    "schema_version": { "const": 1 },
    "case_label": { "type": "string", "minLength": 1 },
    "mode": { "enum": ["metrics", "model", "human"] },
    "verdict": { "enum": ["pass", "warn", "fail"] },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["rule", "severity", "expected", "observed"],
        "properties": {
          "rule": { "type": "string" },
          "severity": { "enum": ["warn", "fail"] },
          "expected": {}, "observed": {}
        },
        "additionalProperties": false
      }
    },
    "metrics_ref": { "type": ["string", "null"] },
    "capture_ref": { "type": ["string", "null"] },
    "judged_by": { "type": "string" },
    "judged_at": { "type": "string", "format": "date-time" },
    "goal": { "type": ["string", "null"] }
  },
  "additionalProperties": false
}
```

สร้าง `scripts/vision-judge.mjs`:

```js
#!/usr/bin/env node
import fs from 'node:fs';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { judgeMetrics, validateVerdictRecord, buildVerdictRecord } from '../lib/vision-judge-engine.mjs';

const HELP = `Usage:
  node scripts/vision-judge.mjs --judge metrics --metrics m.json [--thresholds JSON|@file] [options]
  node scripts/vision-judge.mjs --judge model|human --verdict-file v.json [options]

Judge a render. metrics mode is deterministic (thresholds -> pass/warn/fail).
model/human modes validate and record an external verdict with the same schema.

Options:
  --judge <mode>        metrics | model | human (default: metrics)
  --metrics <file>      Metrics JSON (metrics mode, required)
  --thresholds <json>   Inline JSON or @file, e.g. '{"maxEmptyCells":2,"minAlignment":{"value":0.4,"severity":"warn"}}'
  --verdict-file <file> External verdict JSON (model/human mode, required)
  --goal <text>         What the render is supposed to achieve
  --label <name>        Case label (default: screen)
  --capture <file>      Capture PNG path (recorded in verdict)
  --out <file>          Write verdict JSON here (default: stdout only)
  -h, --help            Show help

Examples:
  node scripts/vision-judge.mjs --judge metrics --metrics .fx/metrics.json --thresholds '{"maxEmptyCells":3}' --out .fx/verdict.json
  node scripts/vision-judge.mjs --judge human --verdict-file .fx/human.json --label chat --out .fx/verdict.json
`;

function readJson(value, label) {
  const text = String(value ?? '').startsWith('@')
    ? fs.readFileSync(String(value).slice(1), 'utf8')
    : String(value ?? '');
  try {
    return JSON.parse(text);
  } catch {
    throw new TypeError(`${label} is not valid JSON`);
  }
}

try {
  const { args } = parseLooseArgs();
  const mode = args.judge ?? 'metrics';
  if (args.help || args.h) { printHelp(HELP); process.exitCode = 0; }
  else if (!['metrics', 'model', 'human'].includes(mode)) {
    fail(new TypeError(`--judge must be metrics|model|human, got ${mode}`));
  } else {
    let record;
    if (mode === 'metrics') {
      if (!args.metrics) fail(new TypeError('--metrics is required in metrics mode'));
      const metrics = readJson(`@${args.metrics}`, 'metrics file');
      const thresholds = args.thresholds ? readJson(args.thresholds, 'thresholds') : {};
      record = judgeMetrics({
        metrics, thresholds,
        caseLabel: args.label ?? 'screen', goal: args.goal,
        metricsRef: args.metrics, captureRef: args.capture
      });
    } else {
      if (!args['verdict-file'] && !args.verdictFile) fail(new TypeError('--verdict-file is required in model/human mode'));
      const external = readJson(`@${args['verdict-file'] ?? args.verdictFile}`, 'verdict file');
      validateVerdictRecord(external);
      record = { ...external, mode, case_label: external.case_label ?? args.label ?? 'screen', goal: external.goal ?? args.goal ?? null };
    }
    if (args.out) fs.writeFileSync(args.out, `${JSON.stringify(record, null, 2)}\n`);
    process.stdout.write(`${record.verdict.toUpperCase()} (${record.findings.length} findings) — ${record.case_label}\n`);
    if (record.verdict === 'fail') process.exitCode = 1;
  }
} catch (error) { fail(error); }
```

- [ ] **Step 6: CLI smoke**

สร้างไฟล์ทดสอบชั่วคราวแล้วจบ flow ทั้งสองโหมด:

```bash
echo '{"dimensions":{"width":8,"height":8},"occupancy":{"grid":{"cols":8,"rows":5},"cells":[],"emptyCells":[{"col":0,"row":0,"ratio":0}],"balance":{}},"density":{"mean":0},"palette":{"colors":[],"harmony":"none"},"alignment":{"score":0.1},"contrast":{"darkShare":0.9,"lightShare":0,"midShare":0.1}}' > /tmp/vj-metrics.json
node scripts/vision-judge.mjs --judge metrics --metrics /tmp/vj-metrics.json --thresholds '{"maxEmptyCells":0}' --label chat; echo "exit=$?"
echo '{"schema_version":1,"case_label":"chat","mode":"human","verdict":"pass","findings":[],"judged_by":"jirawat","judged_at":"2026-08-08T00:00:00.000Z"}' > /tmp/vj-human.json
node scripts/vision-judge.mjs --judge human --verdict-file /tmp/vj-human.json; echo "exit=$?"
```
Expected: metrics mode `FAIL ... exit=1`; human mode `PASS ... exit=0`

- [ ] **Step 7: Commit**

```bash
git add lib/vision-judge-engine.mjs scripts/vision-judge.mjs schemas/vision-judgment.schema.json tests/unit/vision-judge-engine.test.mjs
git commit -m "feat(vision): judge slot with metrics/model/human modes + shared verdict schema"
```

---

### Task 4: Wiring — package scripts + docs + config example

**Files:**
- Modify: `package.json` (scripts)
- Modify: `vision-loop.config.example.json`
- Modify: `README.md`, `README_TH.md`, `CHANGELOG.md`

**Interfaces:**
- Consumes: scripts จาก Task 1-3
- Produces: `npm run capture:mobile`, `npm run vision:metrics`, `npm run vision:judge`

- [ ] **Step 1: package.json scripts**

เพิ่มใน `scripts` (เรียงตัวอักษรใกล้กลุ่ม vision เดิม):

```json
    "capture:mobile": "node scripts/capture-mobile.mjs",
    "vision:judge": "node scripts/vision-judge.mjs",
    "vision:metrics": "node scripts/vision-metrics.mjs",
```

(เก็บ `"vision-loop"` และ `"vision:triage"` ตามเดิม)

- [ ] **Step 2: config example**

เพิ่มใน `vision-loop.config.example.json`:

```json
{
  "capture": { "type": "playwright" },
  "capture_ios_sim_example": {
    "_comment": "Mobile Vision Loop (phase 1): use npm run capture:mobile to produce cur.png + cur.meta.json, then feed both into compare/ascii-map/layout-structure as usual. vision-loop.mjs reads only type=playwright today; ios-sim wiring into vision-loop.mjs is a follow-up.",
    "type": "ios-sim", "udid": "booted", "settleMs": 1200
  }
}
```

(ถ้าไฟล์เดิมมี keys อื่นอยู่แล้ว ให้เก็บไว้ทั้งหมด แล้วเพิ่ม 2 keys นี้เข้าไป)

- [ ] **Step 3: README.md + README_TH.md sections**

เพิ่ม section สั้น ๆ ใน README.md (หัวข้อ "Mobile Vision Loop (iOS)" ใต้ Features/Usage ที่เหมาะ — อ่านโครงไฟล์ก่อนแก้):

```markdown
### Mobile Vision Loop (iOS, phase 1)

Capture Flutter/native app screens from the iOS Simulator and feed the existing
compare / ascii-map / layout-structure pipeline. Text-only judging is available
through deterministic metrics + a judge slot (metrics | model | human).

\`\`\`bash
npm run capture:mobile -- --out .fx/cur.png --label chat --launch <bundleId> --settle 2
npm run vision:metrics -- --image .fx/cur.png --grid 8x5 --out .fx/metrics.json
npm run vision:judge -- --judge metrics --metrics .fx/metrics.json --thresholds '{"maxEmptyCells":3}' --out .fx/verdict.json
\`\`\`

Android capture is a documented phase-2 stub (`--platform android` exits non-zero).
```

README_TH.md เพิ่มเนื้อไทยทำนองเดียวกัน (แปลสาระ ไม่ต้องตรงทุกคำ)

- [ ] **Step 4: CHANGELOG.md entry**

เพิ่ม entry ด้านบน (อ่านรูปแบบ changelog เดิมก่อน แล้วตามสไตล์เดิม):

```markdown
## 2026-08-08 — Mobile Vision Loop (iOS, phase 1)

- `capture-mobile`: iOS Simulator screenshot adapter (simctl) + PNG sidecar meta
- `vision-metrics`: deterministic metrics engine (occupancy/density/palette/alignment/contrast)
- `vision-judge`: judge slot 3 modes (metrics/model/human) + shared verdict schema
- Android adapter: documented phase-2 stub
```

- [ ] **Step 5: Verify scripts entry points**

Run: `npm run vision:metrics -- --help && npm run capture:mobile -- --help && npm run vision:judge -- --help`
Expected: help ทั้งสาม, exit 0

- [ ] **Step 6: Commit**

```bash
git add package.json vision-loop.config.example.json README.md README_TH.md CHANGELOG.md
git commit -m "docs+wire: mobile vision loop npm scripts, config example, README/CHANGELOG"
```

---

### Task 5: Full verification + live Simulator smoke

**Files:**
- ไม่มีไฟล์ใหม่ — verification ล้วน

- [ ] **Step 1: Full unit suite**

Run: `cd /Users/jirawat/.config/opencode/skills/mainskill/fullstack-vision-engineering-pro-v5 && npm test`
Expected: เขียวทั้งชุด รวม 3 test files ใหม่

- [ ] **Step 2: Suite validation**

Run: `npm run validate`
Expected: ผ่าน (ถ้า validator มีกฎเกี่ยวกับ scripts/docs ใหม่ ให้แก้ตามที่มันบอก — บันทึกไว้ใน report)

- [ ] **Step 3: Live iOS Simulator smoke** (มี iPhone 16 booted อยู่แล้ว — `xcrun simctl list devices available | grep Booted`)

ขั้นตอนจริง (ห้ามใช้ process substitution — เขียนไฟล์จริงเท่านั้น):

```bash
node scripts/capture-mobile.mjs --udid booted --out /tmp/fvep-sim.png --label home --settle 1
node scripts/vision-metrics.mjs --image /tmp/fvep-sim.png --out /tmp/fvep-metrics.json --compact
node scripts/vision-judge.mjs --judge metrics --metrics /tmp/fvep-metrics.json --thresholds '{}' --label home
cat /tmp/fvep-sim.meta.json
```
Expected: capture สำเร็จ (png จริง + meta **png size ตรงกับอุปกรณ์**), metrics ออกตัวเลขจริง, verdict PASS (ไม่ตั้ง threshold), exit codes ถูก
ถ้าไม่มี device booted: boot ก่อนด้วย `xcrun simctl boot <UDID-iPhone-16>` หรือแจ้ง BLOCKED พร้อมเหตุผล

- [ ] **Step 4: Commit (ถ้ามีการแก้จาก validate) หรือไม่มี commit ใหม่**

```bash
git status --short   # ควรสะอาด
```

---

## Self-review notes (controller)

- Spec coverage: G1 (adapter → Task 1) ✅, G2 (metrics → Task 2) ✅, G3 (judge slot → Task 3) ✅, G4 (ไม่เพิ่ม dep — ทุก task ใช้ pngjs/ของเดิม) ✅; wiring/docs → Task 4 ✅; verification+live smoke → Task 5 ✅
- Type consistency: `computeVisionMetrics(image,{cols,rows})` (Task 2) ↔ `evaluateMetrics` อ่าน `.occupancy.emptyCells/.alignment.score/.contrast.darkShare/.lightShare` (Task 3) ↔ fixtures ใน tests ตรงกัน ✅; `captureSimulatorScreenshot({exec, sleep})` injection ใช้ใน test Task 1 ✅
- Known risk ที่ยอมรับ: `alignmentScore` เป็น heuristic กลาง ๆ — test fixture เล็กที่ pin พฤติกรรมขั้นต่ำเท่านั้น (structured > noise)
