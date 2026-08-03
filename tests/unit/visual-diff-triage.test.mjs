import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { measureScene } from '../../lib/scene-completeness-engine.mjs';
import {
  STAGE_ORDER,
  evaluateLoopProgress,
  formatTriageReport,
  renderDeltaHeatmap,
  triageVisualDelta
} from '../../lib/visual-diff-triage-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function createImage(width, height, fill = [60, 64, 72]) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    data[o] = fill[0];
    data[o + 1] = fill[1];
    data[o + 2] = fill[2];
    data[o + 3] = 255;
  }
  return { width, height, data };
}

function paintNoise(image, rect, seed, amplitude, base) {
  const random = seeded(seed);
  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const o = (y * image.width + x) * 4;
      image.data[o] = Math.min(255, base[0] + Math.floor(random() * amplitude));
      image.data[o + 1] = Math.min(255, base[1] + Math.floor(random() * amplitude));
      image.data[o + 2] = Math.min(255, base[2] + Math.floor(random() * amplitude));
    }
  }
}

function frame({ subjectX = 40, tint = [0, 0, 0], brightness = 0 } = {}) {
  const image = createImage(240, 160, [
    Math.min(255, 44 + brightness + tint[0]),
    Math.min(255, 48 + brightness + tint[1]),
    Math.min(255, 58 + brightness + tint[2])
  ]);
  paintNoise(image, { x: 0, y: 0, width: 240, height: 160 }, 9, 70, [
    Math.min(255, 40 + brightness + tint[0]),
    Math.min(255, 46 + brightness + tint[1]),
    Math.min(255, 56 + brightness + tint[2])
  ]);
  paintNoise(image, { x: subjectX, y: 50, width: 56, height: 60 }, 33, 200, [30, 30, 30]);
  return image;
}

function measure(image) {
  return measureScene(image, { grid: '6x4' });
}

test('stage order is perceptual, not alphabetical', () => {
  assert.deepEqual(STAGE_ORDER, ['structure', 'proportion', 'value', 'colour', 'density', 'polish']);
});

test('identical frames report a match with no corrections', () => {
  const measurement = measure(frame());
  const result = triageVisualDelta({ reference: measurement, current: measurement });
  assert.equal(result.matched, true);
  assert.equal(result.verdict, 'match');
  assert.equal(result.issues.length, 0);
  assert.equal(result.nextAction, null);
  assert.match(formatTriageReport(result), /matches the reference/);
});

test('a moved subject is reported as a structure problem first', () => {
  const result = triageVisualDelta({
    reference: measure(frame({ subjectX: 30 })),
    current: measure(frame({ subjectX: 150 }))
  });
  assert.equal(result.matched, false);
  assert.equal(result.issues[0].stage, 'structure');
  assert.equal(result.nextAction.stage, 'structure');
  assert.match(result.nextAction.rule, /one thing/i);
});

test('region drift produces position and scale corrections with concrete pixels', () => {
  const reference = measure(frame());
  const current = measure(frame());
  const result = triageVisualDelta({
    reference,
    current,
    regions: { photo: { ref: [92, 60, 62, 60], cur: [110, 64, 80, 60] } }
  });
  const codes = result.issues.map((item) => item.code);
  assert.ok(codes.includes('REGION_POSITION_DRIFT'));
  assert.ok(codes.includes('REGION_SCALE_DRIFT'));
  assert.equal(result.issues[0].stage, 'structure');
  assert.match(result.issues[0].fix, /-18px x/);
});

test('brightness differences are ranked as value before colour', () => {
  const result = triageVisualDelta({
    reference: measure(frame()),
    current: measure(frame({ brightness: 70 }))
  });
  const stages = result.issues.map((item) => item.stage);
  assert.ok(stages.includes('value'));
  assert.equal(stages[0], 'value');
});

test('a hue shift is reported as a colour drift with named zones', () => {
  const result = triageVisualDelta({
    reference: measure(frame()),
    current: measure(frame({ tint: [90, 0, 0] }))
  });
  const colour = result.issues.find((item) => item.code === 'ZONE_COLOUR_DRIFT');
  assert.ok(colour, result.issues.map((i) => i.code).join(','));
  assert.ok(colour.evidence.zones.length > 0);
});

test('delta heatmap has one digit per zone', () => {
  const result = triageVisualDelta({
    reference: measure(frame()),
    current: measure(frame({ subjectX: 150 }))
  });
  const heatmap = renderDeltaHeatmap(result);
  assert.equal(heatmap.split('\n').length, 4);
  assert.equal(heatmap.split('\n')[0].length, 6);
});

test('mismatched grids are rejected', () => {
  assert.throws(() => triageVisualDelta({
    reference: measureScene(frame(), { grid: '6x4' }),
    current: measureScene(frame(), { grid: '8x5' })
  }), /same grid/);
});

test('three rounds without convergence are flagged as stalled', () => {
  const stalled = evaluateLoopProgress([
    { round: 1, totalDelta: 0.31 },
    { round: 2, totalDelta: 0.305 },
    { round: 3, totalDelta: 0.303 }
  ]);
  assert.equal(stalled.stalled, true);
  assert.match(stalled.recommendation, /Stop guessing/);

  const converging = evaluateLoopProgress([
    { round: 1, totalDelta: 0.31 },
    { round: 2, totalDelta: 0.2 },
    { round: 3, totalDelta: 0.09 }
  ]);
  assert.equal(converging.stalled, false);
  assert.equal(converging.recommendation, null);
});

test('vision:triage CLI writes a history ledger and exits 1 while different', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vision-triage-'));
  const write = async (name, image) => {
    const png = new PNG({ width: image.width, height: image.height });
    png.data = Buffer.from(image.data);
    const target = path.join(dir, name);
    await fs.writeFile(target, PNG.sync.write(png));
    return target;
  };
  const refPath = await write('ref.png', frame({ subjectX: 30 }));
  const curPath = await write('cur.png', frame({ subjectX: 150 }));
  const historyPath = path.join(dir, 'history.json');

  const run = spawnSync(process.execPath, [
    path.join(root, 'scripts/vision-triage.mjs'),
    '--ref', refPath, '--cur', curPath, '--history', historyPath
  ], { encoding: 'utf8' });

  assert.equal(run.status, 1, run.stderr);
  assert.match(run.stdout, /VISUAL DELTA TRIAGE/);
  assert.match(run.stdout, /NEXT SINGLE CHANGE/);

  const history = JSON.parse(await fs.readFile(historyPath, 'utf8'));
  assert.equal(history.length, 1);
  assert.equal(history[0].round, 1);

  const same = spawnSync(process.execPath, [
    path.join(root, 'scripts/vision-triage.mjs'), '--ref', refPath, '--cur', refPath
  ], { encoding: 'utf8' });
  assert.equal(same.status ?? 0, 0, same.stdout + same.stderr);
});
