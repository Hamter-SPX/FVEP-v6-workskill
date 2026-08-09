/**
 * End-to-end pin for the mobile vision loop wiring (capture.type ios-sim):
 * spawns the real scripts/vision-loop.mjs against a tmp config with seeded
 * captures (--skip-capture, no devices needed) and asserts the headline
 * exit-code contract: pass run → 0, failing mobileChecks verdict → 1.
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

function runLoop(thresholds) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vision-loop-mobile-'));
  // Mobile artifact identity rides the web layout as label__mobile__key
  // (lib/mobile-capture-engine.mjs caseIdentity), seeded as "current" capture.
  const currentDir = path.join(tmp, 'artifacts', 'current');
  fs.mkdirSync(currentDir, { recursive: true });
  fs.writeFileSync(path.join(currentDir, 'home__mobile__home.png'), partiallyEmptyPng());
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
  return spawnSync(process.execPath, [LOOP_SCRIPT, '--config', configPath, '--skip-capture'], {
    cwd: root,
    encoding: 'utf8',
    timeout: 120_000
  });
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
