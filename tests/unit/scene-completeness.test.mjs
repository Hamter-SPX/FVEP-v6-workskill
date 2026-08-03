import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import {
  auditScene,
  auditSceneBrief,
  auditSceneMeasurements,
  measureScene,
  parseGrid,
  renderSceneHeatmap
} from '../../lib/scene-completeness-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function createImage(width, height, fill = [40, 40, 46]) {
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

/** Deterministic pseudo-noise so tests never depend on Math.random. */
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function paintNoise(image, rect, seed, amplitude = 110, base = [70, 80, 95]) {
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

function paintRect(image, rect, rgb) {
  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const o = (y * image.width + x) * 4;
      image.data[o] = rgb[0];
      image.data[o + 1] = rgb[1];
      image.data[o + 2] = rgb[2];
    }
  }
}

function detailedFrame() {
  const image = createImage(240, 160, [30, 34, 44]);
  paintNoise(image, { x: 0, y: 0, width: 240, height: 160 }, 7, 90, [45, 52, 66]);
  // Focal subject with strong local contrast.
  paintRect(image, { x: 96, y: 52, width: 52, height: 56 }, [12, 12, 16]);
  paintNoise(image, { x: 100, y: 56, width: 44, height: 48 }, 21, 190, [60, 60, 60]);
  // Highlights and shadow anchors spread across the frame.
  paintRect(image, { x: 8, y: 8, width: 14, height: 12 }, [246, 244, 235]);
  paintRect(image, { x: 214, y: 138, width: 18, height: 14 }, [250, 248, 240]);
  paintRect(image, { x: 200, y: 10, width: 16, height: 18 }, [6, 6, 8]);
  paintRect(image, { x: 12, y: 140, width: 20, height: 12 }, [5, 5, 7]);
  return image;
}

function emptyCornerFrame() {
  const image = createImage(240, 160, [128, 128, 130]);
  // Only the middle is worked on; the rest is a flat wall.
  paintNoise(image, { x: 96, y: 56, width: 52, height: 48 }, 11, 200, [40, 40, 40]);
  return image;
}

const goodBrief = {
  name: 'Nine Heavens rooftop duel',
  fantasy: 'A sword duel on wet temple rooftops while lanterns swing in storm wind',
  layers: {
    foreground: 'Broken roof tiles and a leaning banner pole framing the left edge',
    midground: 'Duelling swordsman and monk statue on the ridge line',
    background: 'Rain-veiled pagoda silhouettes fading into storm haze'
  },
  focalPoint: 'Swordsman lit from the lantern below, highest contrast in frame',
  lighting: 'Low warm key from lanterns, cold rim from storm sky, deep shadow pockets',
  palette: 'aesthetic-profile.json — jade, lacquer red, wet slate',
  storyDetails: [
    'Chipped tiles where feet have landed before',
    'Rope repair knot on the banner pole',
    'Rain runoff staining the eaves',
    'Scattered prayer slips caught in the gutter'
  ],
  negativeSpace: 'Storm sky upper right stays quiet to let the silhouette read'
};

test('parseGrid accepts CxR and rejects nonsense', () => {
  assert.deepEqual(parseGrid('8x5'), { cols: 8, rows: 5 });
  assert.deepEqual(parseGrid(undefined, { cols: 6, rows: 4 }), { cols: 6, rows: 4 });
  assert.throws(() => parseGrid('wide'), TypeError);
  assert.throws(() => parseGrid('1x1'), RangeError);
});

test('measureScene reports per-zone detail, focal zone, and a heatmap', () => {
  const measurement = measureScene(detailedFrame(), { grid: '6x4' });
  assert.equal(measurement.zones.length, 24);
  assert.equal(measurement.grid.cols, 6);
  assert.ok(measurement.summary.maxDetail > measurement.summary.minDetail);
  const heatmap = renderSceneHeatmap(measurement);
  assert.equal(heatmap.split('\n').length, 4);
  assert.equal(heatmap.split('\n')[0].length, 6);
});

test('a worked frame passes the corner and hierarchy gates', () => {
  const measurement = measureScene(detailedFrame(), { grid: '6x4' });
  const result = auditSceneMeasurements(measurement);
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(!codes.includes('SCENE_EMPTY_CORNER'), codes.join(','));
  assert.ok(!codes.includes('SCENE_DEAD_ZONES'), codes.join(','));
  assert.equal(result.ok, true, result.findings.map((f) => f.message).join('; '));
});

test('a frame with a hero subject and empty corners is blocked', () => {
  const measurement = measureScene(emptyCornerFrame(), { grid: '6x4' });
  const result = auditSceneMeasurements(measurement);
  const codes = result.findings.map((finding) => finding.code);
  assert.equal(result.ok, false);
  assert.ok(codes.includes('SCENE_EMPTY_CORNER'));
  assert.ok(codes.includes('SCENE_DEAD_ZONES'));
  assert.equal(result.verdict, 'fail-scene-incomplete');
});

test('repeated modules are reported as copy-paste tiling', () => {
  const image = createImage(240, 160, [20, 22, 30]);
  paintNoise(image, { x: 0, y: 0, width: 240, height: 160 }, 5, 60, [40, 44, 52]);
  // Stamp the exact same block into many zones.
  for (const origin of [[0, 0], [40, 0], [80, 0], [120, 0], [160, 0], [200, 0], [0, 40], [40, 40], [80, 40]]) {
    paintRect(image, { x: origin[0] + 6, y: origin[1] + 6, width: 28, height: 28 }, [180, 180, 190]);
  }
  const measurement = measureScene(image, { grid: '6x4' });
  const result = auditSceneMeasurements(measurement);
  assert.ok(result.findings.some((finding) => finding.code === 'SCENE_TILING_REPETITION'));
});

test('scene brief requires fantasy, all depth layers, focal point, and story details', () => {
  const good = auditSceneBrief(goodBrief);
  assert.equal(good.ok, true, good.findings.map((f) => f.message).join('; '));

  const weak = auditSceneBrief({
    name: 'Level 3',
    fantasy: 'looks awesome and epic',
    layers: { foreground: 'stuff' },
    storyDetails: []
  });
  const codes = weak.findings.map((finding) => finding.code);
  assert.equal(weak.ok, false);
  assert.ok(codes.includes('SCENE_BRIEF_FANTASY_VAGUE'));
  assert.ok(codes.includes('SCENE_BRIEF_LAYERS_MISSING'));
  assert.ok(codes.includes('SCENE_BRIEF_FOCAL_MISSING'));
  assert.ok(codes.includes('SCENE_BRIEF_LIGHTING_MISSING'));
});

test('auditScene without a rendered frame records the missing evidence', () => {
  const result = auditScene({ brief: goodBrief });
  assert.ok(result.findings.some((finding) => finding.code === 'SCENE_FRAME_EVIDENCE_MISSING'));
  assert.equal(result.measurement, null);
});

test('auditScene combines brief and frame sections', () => {
  const result = auditScene({ image: detailedFrame(), brief: goodBrief }, { grid: '6x4' });
  assert.equal(result.sections.brief.ok, true);
  assert.equal(result.sections.frame.ok, true);
  assert.equal(result.ok, true, result.findings.map((f) => f.message).join('; '));
  assert.ok(['pass-scene-complete', 'pass-with-notes'].includes(result.verdict));
  assert.equal(result.hardFailures.length, 0);
});

test('the shipped example scene brief passes the brief gate', async () => {
  const brief = JSON.parse(await fs.readFile(path.join(root, 'examples/scene-brief.example.json'), 'utf8'));
  const result = auditSceneBrief(brief);
  assert.equal(result.ok, true, result.findings.map((f) => `${f.code}: ${f.message}`).join('; '));
});

test('audit:scene CLI exits 1 and shows the heatmap for an unfinished frame', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'scene-audit-'));
  const framePath = path.join(dir, 'frame.png');
  const image = emptyCornerFrame();
  const png = new PNG({ width: image.width, height: image.height });
  png.data = Buffer.from(image.data);
  await fs.writeFile(framePath, PNG.sync.write(png));

  const result = spawnSync(process.execPath, [
    path.join(root, 'scripts/audit-scene.mjs'), '--image', framePath, '--grid', '6x4'
  ], { encoding: 'utf8' });

  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /SCENE COMPLETENESS/);
  assert.match(result.stdout, /detail heatmap/);
  assert.match(result.stdout, /SCENE_EMPTY_CORNER/);
});
