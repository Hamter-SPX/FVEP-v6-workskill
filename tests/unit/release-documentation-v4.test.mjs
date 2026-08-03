import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { renderMarkdownBundle } from '../../lib/document-bundle-engine.mjs';

const root = path.resolve('.');

async function read(relative) { return fs.readFile(path.join(root, relative), 'utf8'); }

test('release-facing Markdown has no hidden control characters', async () => {
  for (const relative of ['README.md', 'README_TH.md', 'UPGRADE_REPORT_V4_TH.md', 'UPGRADE_REPORT_V5_TH.md']) {
    const text = await read(relative);
    assert.doesNotMatch(text, /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, relative);
  }
});

test('v4 upgrade report describes process kernel and deterministic release verification', async () => {
  const text = await read('UPGRADE_REPORT_V4_TH.md');
  for (const phrase of ['Process Kernel', 'Superpowers', 'TDD', 'Scientific Debugging', 'Independent Review', 'Deterministic ZIP', '169/169']) {
    assert.match(text, new RegExp(phrase.replace('/', '\\/'), 'i'), phrase);
  }
});

test('all-in-one rendering is deterministic and identifies every source section', async () => {
  const files = ['SKILL.md', 'SUPERPOWERS_ADAPTATION_MATRIX.md', 'references/process-kernel-overview.md'];
  const first = await renderMarkdownBundle(root, { files, title: 'Test Bundle', version: '4.0.0' });
  const second = await renderMarkdownBundle(root, { files: [...files], title: 'Test Bundle', version: '4.0.0' });
  assert.equal(first, second);
  assert.match(first, /Source: `SKILL\.md`/);
  assert.match(first, /Source: `SUPERPOWERS_ADAPTATION_MATRIX\.md`/);
  assert.match(first, /Source: `references\/process-kernel-overview\.md`/);
});

test('v5 upgrade report describes the aesthetic direction layer and its gate', async () => {
  const text = await read('UPGRADE_REPORT_V5_TH.md');
  for (const phrase of ['Aesthetic', 'OKLCH', 'audit:aesthetics', 'aesthetic-principles', 'aesthetic-scoring-anchors', 'visual-direction-exploration', 'ImageGen']) {
    assert.match(text, new RegExp(phrase.replace('/', '\\/'), 'i'), phrase);
  }
});

test('committed all-in-one bundle matches deterministic generator output', async () => {
  const expected = await renderMarkdownBundle(root);
  const actual = await read('FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md');
  assert.equal(actual, expected);
});
