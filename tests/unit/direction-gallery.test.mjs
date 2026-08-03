import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeDirectionGallery } from '../../lib/direction-gallery-engine.mjs';

async function tinyPng(filePath) {
  // 1x1 PNG
  const bytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  await fs.writeFile(filePath, bytes);
}

test('direction gallery writes HTML with three image options and skips browser when asked', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-gallery-'));
  const one = path.join(root, 'option-1.png');
  const two = path.join(root, 'option-2.png');
  const three = path.join(root, 'option-3.png');
  await tinyPng(one);
  await tinyPng(two);
  await tinyPng(three);

  const result = await writeDirectionGallery({
    outputDir: path.join(root, 'gallery'),
    title: 'Camera direction options',
    referenceNote: 'User could not attach a reference screenshot',
    open: false,
    options: [
      { number: 1, label: 'Dense utilitarian', thesis: 'Dense utilitarian', imagePath: one },
      { number: 2, label: 'Spacious editorial', thesis: 'Spacious editorial', imagePath: two },
      { number: 3, label: 'Expressive accent', thesis: 'Expressive accent', imagePath: three }
    ]
  });

  assert.equal(result.ok, true);
  assert.equal(result.optionCount, 3);
  assert.equal(result.browser, null);
  const html = await fs.readFile(result.htmlPath, 'utf8');
  assert.match(html, /option-1\.png/);
  assert.match(html, /option-2\.png/);
  assert.match(html, /option-3\.png/);
  assert.match(html, /User could not attach a reference screenshot/);
  assert.match(html, /Dense utilitarian/);
  const manifest = JSON.parse(await fs.readFile(result.manifestPath, 'utf8'));
  assert.equal(manifest.options.length, 3);
});

test('direction gallery rejects fewer than two options', async () => {
  await assert.rejects(
    () => writeDirectionGallery({ open: false, options: [{ number: 1, label: 'Only', imagePath: '/tmp/x.png' }] }),
    /at least two options/
  );
});
