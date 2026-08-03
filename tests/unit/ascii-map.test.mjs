import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import {
  asciiMapFromImage,
  compareAsciiMaps,
  cropImage,
  downsampleLuma,
  renderAsciiFromGrid
} from '../../lib/ascii-map-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function solid(width, height, rgba) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    data[o] = rgba[0];
    data[o + 1] = rgba[1];
    data[o + 2] = rgba[2];
    data[o + 3] = rgba[3] ?? 255;
  }
  return { width, height, data };
}

function withBlob(width, height, blob) {
  const image = solid(width, height, [255, 255, 255, 255]);
  for (let y = blob.y; y < blob.y + blob.h; y += 1) {
    for (let x = blob.x; x < blob.x + blob.w; x += 1) {
      const o = (y * width + x) * 4;
      image.data[o] = 0;
      image.data[o + 1] = 0;
      image.data[o + 2] = 0;
    }
  }
  return image;
}

async function writePng(filePath, image) {
  const png = new PNG({ width: image.width, height: image.height });
  png.data = Buffer.from(image.data);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, PNG.sync.write(png));
}

test('crop and digit map are deterministic for a solid region', () => {
  const image = solid(40, 20, [0, 0, 0, 255]);
  const cropped = cropImage(image, { x: 5, y: 2, width: 10, height: 8 });
  assert.equal(cropped.width, 10);
  assert.equal(cropped.height, 8);
  const grid = downsampleLuma(cropped, 5, 2);
  const ascii = renderAsciiFromGrid(grid, { ramp: 'digits' });
  assert.equal(ascii, '00000\n00000');
  assert.equal(renderAsciiFromGrid(grid, { ramp: 'digits', invert: true }), '99999\n99999');
});

test('compare detects horizontal content shift between ref and cur', () => {
  const reference = asciiMapFromImage(withBlob(64, 32, { x: 8, y: 8, w: 12, h: 12 }), {
    cols: 32,
    rows: 16,
    ramp: 'digits'
  });
  const current = asciiMapFromImage(withBlob(64, 32, { x: 20, y: 8, w: 12, h: 12 }), {
    cols: 32,
    rows: 16,
    ramp: 'digits'
  });
  const comparison = compareAsciiMaps(reference, current);
  assert.ok(comparison.meanAbsDelta > 0.05);
  assert.ok(comparison.centroidShiftCells.x > 1);
  assert.equal(comparison.similar, false);
});

test('identical maps compare as similar', () => {
  const image = withBlob(48, 24, { x: 10, y: 6, w: 8, h: 8 });
  const reference = asciiMapFromImage(image, { cols: 24, rows: 12 });
  const current = asciiMapFromImage(image, { cols: 24, rows: 12 });
  const comparison = compareAsciiMaps(reference, current);
  assert.equal(comparison.meanAbsDelta, 0);
  assert.equal(comparison.similar, true);
});

test('ascii-map CLI prints REF/CUR maps and exits 1 when shifted', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ascii-map-'));
  const refPath = path.join(dir, 'ref.png');
  const curPath = path.join(dir, 'cur.png');
  await writePng(refPath, withBlob(80, 40, { x: 10, y: 10, w: 16, h: 16 }));
  await writePng(curPath, withBlob(80, 40, { x: 28, y: 10, w: 16, h: 16 }));

  const result = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/ascii-map.mjs'), '--ref', refPath, '--cur', curPath, '0', '0', '80', '40', '--cols', '40', '--rows', '12', '--label', 'PHOTO'],
    { encoding: 'utf8' }
  );
  assert.match(result.stdout, /=== REF PHOTO ===/);
  assert.match(result.stdout, /=== CUR PHOTO ===/);
  assert.match(result.stdout, /centroidShiftCells/);
  assert.equal(result.status, 1);
});
