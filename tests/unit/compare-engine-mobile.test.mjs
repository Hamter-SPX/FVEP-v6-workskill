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
  // Plant a stale web-identity reference on purpose — it must not become a blocker.
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

const MATRIX_DEVICES = [
  { key: 'iphone16', label: null, udid: 'UDID-1', serial: null, platform: 'ios-sim' },
  { key: 'pixel6', label: null, udid: null, serial: 'emulator-5556', platform: 'android' }
];

function plantPair(dir, artifactFile, png = makePng(16, 16, [255, 255, 255])) {
  for (const mode of ['reference', 'current']) {
    const p = path.join(dir, mode, artifactFile);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, png);
  }
}

test('compareAll — device matrix fans out one comparison per run at capture identities', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-'));
  const cfg = fixtureConfig(dir);
  cfg.mobile.devices = MATRIX_DEVICES;
  plantPair(dir, 'home__iphone16__home.png');
  plantPair(dir, 'home__pixel6__home.png');
  const result = await compareAll(cfg);
  // One comparison per run, keyed by the capture identity each run wrote.
  assert.deepEqual(result.comparisons.map((c) => c.key), ['home__iphone16__home', 'home__pixel6__home']);
  for (const comparison of result.comparisons) {
    assert.equal(comparison.mismatchRatio, 0);
    assert.equal(comparison.severity, 'accepted');
  }
  assert.ok(result.comparisons[0].currentRelative.endsWith('home__iphone16__home.png'));
  assert.ok(result.comparisons[1].currentRelative.endsWith('home__pixel6__home.png'));
  assert.ok(result.ok);
});

test('compareAll — case.devices subset narrows the comparison matrix', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cem-'));
  const cfg = fixtureConfig(dir);
  cfg.mobile.devices = MATRIX_DEVICES;
  cfg.mobile.cases[0].devices = ['pixel6'];
  plantPair(dir, 'home__pixel6__home.png');
  const result = await compareAll(cfg);
  assert.equal(result.comparisons.length, 1);
  assert.equal(result.comparisons[0].key, 'home__pixel6__home');
  assert.ok(result.comparisons[0].currentRelative.endsWith('home__pixel6__home.png'));
});
