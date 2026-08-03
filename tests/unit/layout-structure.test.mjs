import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import {
  checkLayoutStructure,
  rememberLayoutStructure,
  watchUntilMatch
} from '../../lib/layout-structure-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function solid(width, height, rgba = [245, 245, 245]) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    data[o] = rgba[0];
    data[o + 1] = rgba[1];
    data[o + 2] = rgba[2];
    data[o + 3] = 255;
  }
  return { width, height, data };
}

function paint(image, rect, rgba = [20, 20, 20]) {
  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      const o = (y * image.width + x) * 4;
      image.data[o] = rgba[0];
      image.data[o + 1] = rgba[1];
      image.data[o + 2] = rgba[2];
    }
  }
}

async function writePng(filePath, image) {
  const png = new PNG({ width: image.width, height: image.height });
  png.data = Buffer.from(image.data);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, PNG.sync.write(png));
}

test('remember stores relative layout skeleton from named regions', () => {
  const image = solid(200, 120);
  paint(image, { x: 20, y: 30, width: 40, height: 40 });
  paint(image, { x: 120, y: 35, width: 30, height: 30 });
  const structure = rememberLayoutStructure(image, [
    { name: 'photo', x: 20, y: 30, width: 40, height: 40 },
    { name: 'qr', x: 120, y: 35, width: 30, height: 30 }
  ]);
  assert.equal(structure.role, 'ref-structure');
  assert.equal(structure.elements.length, 2);
  assert.equal(structure.elements[0].name, 'photo');
  assert.ok(structure.relations.some((rel) => rel.from === 'photo' && rel.to === 'qr'));
  assert.equal(structure.relations[0].dx, 100);
});

test('check reports locate/scale fix hints when cur drifts', () => {
  const ref = solid(200, 120);
  paint(ref, { x: 20, y: 30, width: 40, height: 40 });
  const structure = rememberLayoutStructure(ref, [
    { name: 'photo', x: 20, y: 30, width: 40, height: 40 }
  ], { tolerancePx: 2 });

  const cur = solid(200, 120);
  paint(cur, { x: 28, y: 34, width: 48, height: 40 });
  const result = checkLayoutStructure(structure, cur, [
    { name: 'photo', x: 28, y: 34, width: 48, height: 40 }
  ]);
  assert.equal(result.ok, false);
  assert.match(result.findings[0].fixHint, /move photo/);
  assert.match(result.findings[0].fixHint, /scale photo/);
});

test('layout-structure CLI remember + check roundtrip', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'layout-structure-'));
  const refPath = path.join(dir, 'ref.png');
  const curPath = path.join(dir, 'cur.png');
  const structurePath = path.join(dir, 'ref-structure.json');
  const regionsPath = path.join(dir, 'regions.json');

  const ref = solid(160, 80);
  paint(ref, { x: 10, y: 10, width: 20, height: 20 });
  paint(ref, { x: 80, y: 12, width: 16, height: 16 });
  await writePng(refPath, ref);

  const cur = solid(160, 80);
  paint(cur, { x: 18, y: 14, width: 20, height: 20 });
  paint(cur, { x: 80, y: 12, width: 16, height: 16 });
  await writePng(curPath, cur);

  await fs.writeFile(regionsPath, JSON.stringify({
    regions: [
      { name: 'photo', x: 10, y: 10, width: 20, height: 20 },
      { name: 'qr', x: 80, y: 12, width: 16, height: 16 }
    ]
  }));

  const remember = spawnSync(process.execPath, [
    path.join(root, 'scripts/layout-structure.mjs'), 'remember',
    '--ref', refPath, '--regions', regionsPath, '--write', structurePath
  ], { encoding: 'utf8' });
  assert.equal(remember.status, 0, remember.stderr);
  assert.match(remember.stdout, /REF STRUCTURE/);

  const curRegions = path.join(dir, 'cur-regions.json');
  await fs.writeFile(curRegions, JSON.stringify({
    regions: [
      { name: 'photo', x: 18, y: 14, width: 20, height: 20 },
      { name: 'qr', x: 80, y: 12, width: 16, height: 16 }
    ]
  }));

  const check = spawnSync(process.execPath, [
    path.join(root, 'scripts/layout-structure.mjs'), 'check',
    '--structure', structurePath, '--cur', curPath, '--regions', curRegions
  ], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.match(check.stdout, /locate-mismatch|move photo/);
});

test('watchUntilMatch keeps checking then captures and stops on match', async () => {
  let checks = 0;
  const captured = [];
  const final = await watchUntilMatch({
    maxRounds: 5,
    intervalMs: 1,
    sleepFn: async () => {},
    checkOnce: async () => {
      checks += 1;
      return { ok: checks >= 3, severity: checks >= 3 ? 'accepted' : 'major', nextActions: checks >= 3 ? [] : ['move photo'] };
    },
    onMatch: async () => {
      captured.push('snapshot');
      return { copiedTo: 'accepted.png' };
    }
  });
  assert.equal(final.matched, true);
  assert.equal(final.stopped, 'matched');
  assert.equal(checks, 3);
  assert.deepEqual(captured, ['snapshot']);
  assert.equal(final.capture.copiedTo, 'accepted.png');
});

test('watchUntilMatch stops at max-rounds when never matching', async () => {
  const final = await watchUntilMatch({
    maxRounds: 3,
    intervalMs: 1,
    sleepFn: async () => {},
    checkOnce: async () => ({ ok: false, severity: 'major', nextActions: ['move photo'] })
  });
  assert.equal(final.matched, false);
  assert.equal(final.stopped, 'max-rounds');
  assert.equal(final.rounds.length, 3);
});
