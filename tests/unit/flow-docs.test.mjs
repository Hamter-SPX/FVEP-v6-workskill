import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const flowDir = path.join(root, 'flow');

const REQUIRED_SECTIONS = ['## Why this exists', '## When to use', '## The flow', '## Evidence gates', '## Anti-patterns'];

const PATH_REF_PATTERN = /(?:lib|scripts|templates|references|domains|prompts|agents|schemas|examples|flow)\/[A-Za-z0-9_\-./]+/g;

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const npmScripts = new Set(Object.keys(pkg.scripts ?? {}));

function flowDocs() {
  if (!fs.existsSync(flowDir)) return [];
  return fs.readdirSync(flowDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
}

test('flow docs exist and follow required structure', () => {
  const docs = flowDocs();
  assert.ok(docs.length > 0, 'flow/ must contain flow docs');
  for (const doc of docs) {
    const text = fs.readFileSync(path.join(flowDir, doc), 'utf8');
    assert.match(text, /^# .+/m, `${doc}: missing H1`);
    let lastIndex = -1;
    for (const section of REQUIRED_SECTIONS) {
      const index = text.indexOf(section);
      assert.ok(index !== -1, `${doc}: missing section "${section}"`);
      assert.ok(index > lastIndex, `${doc}: section "${section}" is out of the required order`);
      lastIndex = index;
    }
  }
});

test('every npm command referenced by flow docs exists', () => {
  const docs = flowDocs().map((d) => [d, fs.readFileSync(path.join(flowDir, d), 'utf8')]);
  const cmdPattern = /npm run ([a-zA-Z0-9:\-]+)/g;
  for (const [doc, text] of docs) {
    for (const match of text.matchAll(cmdPattern)) {
      assert.ok(npmScripts.has(match[1]), `${doc}: references missing npm script "${match[1]}"`);
    }
  }
});

test('every npm command referenced by GOLDEN_PATH.md exists', () => {
  const gp = path.join(root, 'GOLDEN_PATH.md');
  if (!fs.existsSync(gp)) return;
  const text = fs.readFileSync(gp, 'utf8');
  for (const match of text.matchAll(/npm run ([a-zA-Z0-9:\-]+)/g)) {
    assert.ok(npmScripts.has(match[1]), `GOLDEN_PATH references missing npm script "${match[1]}"`);
  }
});

test('every in-repo path referenced by flow docs exists', () => {
  const docs = flowDocs().map((d) => [d, fs.readFileSync(path.join(flowDir, d), 'utf8')]);
  for (const [doc, text] of docs) {
    for (const match of text.matchAll(PATH_REF_PATTERN)) {
      const target = path.join(root, match[0]);
      assert.ok(fs.existsSync(target), `${doc}: references missing path "${match[0]}"`);
    }
  }
});

test('every in-repo path referenced by GOLDEN_PATH.md exists', () => {
  const gp = path.join(root, 'GOLDEN_PATH.md');
  assert.ok(fs.existsSync(gp), 'GOLDEN_PATH.md missing');
  const text = fs.readFileSync(gp, 'utf8');
  for (const match of text.matchAll(PATH_REF_PATTERN)) {
    const target = path.join(root, match[0]);
    assert.ok(fs.existsSync(target), `GOLDEN_PATH.md: references missing path "${match[0]}"`);
  }
});

test('flow-map is valid json and points at existing docs', () => {
  const mapPath = path.join(flowDir, 'flow-map.json');
  assert.ok(fs.existsSync(mapPath), 'flow-map.json missing');
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  for (const [mode, entry] of Object.entries(map)) {
    assert.ok(typeof entry.flow === 'string', `${mode}: flow must be a path string`);
    assert.ok(fs.existsSync(path.join(root, entry.flow)), `${mode}: flow doc ${entry.flow} missing`);
    for (const companion of entry.companions ?? []) {
      assert.ok(typeof companion === 'string', `${mode}: companion must be a path string`);
      assert.ok(fs.existsSync(path.join(root, companion)), `${mode}: companion doc ${companion} missing`);
    }
  }
});
