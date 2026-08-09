/**
 * End-to-end pin for the mobile vision loop wiring (capture.type ios-sim):
 * spawns the real scripts/vision-loop.mjs against a tmp config with seeded
 * captures (--skip-capture, no devices needed) and asserts the headline
 * exit-code contract: pass run → 0, failing mobileChecks verdict → 1.
 * The loop also runs the mobile-aware compare (--refresh-reference seeds the
 * baseline on devices; tests seed the stored reference PNGs directly), so a
 * differing current capture fails the visual gate and exits 1.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LOOP_SCRIPT = path.join(root, 'scripts', 'vision-loop.mjs');

// Deterministic partially-empty fixture: white 80x50 with a dark 10x10 block
// in the top-left occupancy cell (grid 8x5 → 10x10 px cells). Metrics for it:
// 39 empty cells, suspectBackground false, alignment 0.25 — so thresholds {}
// yields a clean pass and {"maxEmptyCells":0} a fail, with no warn noise.
function partiallyEmptyPng() {
  const png = new PNG({ width: 80, height: 50 });
  for (let o = 0; o < png.data.length; o += 4) {
    png.data[o] = 255;
    png.data[o + 1] = 255;
    png.data[o + 2] = 255;
    png.data[o + 3] = 255;
  }
  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 10; x += 1) {
      const o = (y * 80 + x) * 4;
      png.data[o] = 10;
      png.data[o + 1] = 10;
      png.data[o + 2] = 10;
    }
  }
  return PNG.sync.write(png);
}

// Same fixture with the dark 10x10 block moved to the bottom-right cell: the
// occupancy metrics stay identical (mobileChecks verdict unchanged) while
// 200/4000 pixels differ from the reference (mismatchRatio 0.05 > the default
// majorMismatchRatio 0.02 → blocker).
function blockMovedPng() {
  const png = new PNG({ width: 80, height: 50 });
  for (let o = 0; o < png.data.length; o += 4) {
    png.data[o] = 255;
    png.data[o + 1] = 255;
    png.data[o + 2] = 255;
    png.data[o + 3] = 255;
  }
  for (let y = 40; y < 50; y += 1) {
    for (let x = 70; x < 80; x += 1) {
      const o = (y * 80 + x) * 4;
      png.data[o] = 10;
      png.data[o + 1] = 10;
      png.data[o + 2] = 10;
    }
  }
  return PNG.sync.write(png);
}

function runLoop(thresholds, { currentDiffers = false, extraArgs = [] } = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vision-loop-mobile-'));
  // Mobile artifact identity rides the web layout as label__mobile__key
  // (lib/mobile-capture-engine.mjs caseIdentity), seeded as "current" capture.
  // A stored "reference" capture is seeded too so the mobile compare has a
  // baseline to diff against (default diff.failOnMissingReference is true —
  // without it the missing reference would now block the run).
  const currentDir = path.join(tmp, 'artifacts', 'current');
  const referenceDir = path.join(tmp, 'artifacts', 'reference');
  fs.mkdirSync(currentDir, { recursive: true });
  fs.mkdirSync(referenceDir, { recursive: true });
  fs.writeFileSync(path.join(referenceDir, 'home__mobile__home.png'), partiallyEmptyPng());
  fs.writeFileSync(path.join(currentDir, 'home__mobile__home.png'), currentDiffers ? blockMovedPng() : partiallyEmptyPng());
  const configPath = path.join(tmp, 'vision-loop.config.json');
  fs.writeFileSync(configPath, `${JSON.stringify({
    outputDir: 'artifacts',
    capture: { type: 'ios-sim' },
    history: { enabled: false },
    mobile: {
      cases: [{ key: 'home', label: 'Home' }],
      judge: { thresholds }
    },
    routes: [{ name: 'home', path: '/' }]
  }, null, 2)}\n`);
  const result = spawnSync(process.execPath, [LOOP_SCRIPT, '--config', configPath, '--skip-capture', ...extraArgs], {
    cwd: root,
    encoding: 'utf8',
    timeout: 120_000
  });
  result.outputDir = path.join(tmp, 'artifacts');
  return result;
}

test('vision-loop mobile: clean run exits 0 with mobile checks pass and web sections skipped', () => {
  const result = runLoop({});
  assert.equal(result.status, 0, `expected exit 0; stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.match(result.stdout, /Mobile checks: 1 passed, 0 failed/);
  assert.match(result.stdout, /skipped \(web-only section\)/);
});

test('vision-loop mobile: failing judge thresholds exit 1 with mobile checks fail', () => {
  const result = runLoop({ maxEmptyCells: 0 }); // fixture has 39 empty cells
  assert.equal(result.status, 1, `expected exit 1; stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.match(result.stdout, /Mobile checks: 0 passed, 1 failed/);
});

test('vision-loop mobile: identical stored reference compares green (exit 0, comparison accepted)', () => {
  const result = runLoop({});
  assert.equal(result.status, 0, `expected exit 0; stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.doesNotMatch(result.stdout, /compare: skipped on mobile/);
  const comparison = JSON.parse(fs.readFileSync(path.join(result.outputDir, 'reports', 'comparison.json'), 'utf8'));
  assert.equal(comparison.comparisons.length, 1);
  assert.equal(comparison.comparisons[0].key, 'Home__mobile__home');
  assert.equal(comparison.comparisons[0].severity, 'accepted');
  assert.equal(comparison.comparisons[0].mismatchRatio, 0);
  assert.equal(comparison.summary.blockers, 0);
});

test('vision-loop mobile: differing current fails the visual gate (exit 1)', () => {
  const result = runLoop({}, { currentDiffers: true });
  assert.equal(result.status, 1, `expected exit 1; stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.match(result.stdout, /Automated evidence gate: FAIL/);
  const comparison = JSON.parse(fs.readFileSync(path.join(result.outputDir, 'reports', 'comparison.json'), 'utf8'));
  assert.equal(comparison.comparisons.length, 1);
  assert.equal(comparison.comparisons[0].severity, 'blocker');
  assert.ok(comparison.summary.blockers >= 1, `expected blockers >= 1, got ${comparison.summary.blockers}`);
});

// --evidence-visual rides the post-summary hook: after writeRunSummary the
// loop folds the seeded artifact tree into one self-contained HTML report.
// The flag must also leave the run verdict untouched (still exit 0 here).
test('vision-loop mobile: --evidence-visual emits reports/visual-evidence.html', () => {
  const result = runLoop({}, { extraArgs: ['--evidence-visual'] });
  assert.equal(result.status, 0, `expected exit 0; stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  const htmlPath = path.join(result.outputDir, 'reports', 'visual-evidence.html');
  assert.match(result.stdout, /Visual evidence: .+visual-evidence\.html/);
  assert.ok(fs.existsSync(htmlPath), `expected ${htmlPath} to exist`);
  assert.match(fs.readFileSync(htmlPath, 'utf8'), /<!DOCTYPE html>/);
});
