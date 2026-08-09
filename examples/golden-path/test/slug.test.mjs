import assert from 'node:assert/strict';
import test from 'node:test';

import { slugify } from '../src/slug.js';

test('lowercases and joins words with dashes', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('strips accents through unicode normalization', () => {
  assert.equal(slugify('Cafe deja vu'), 'cafe-deja-vu');
  assert.equal(slugify('Crème brûlée'), 'creme-brulee');
});

test('collapses punctuation and trims separators', () => {
  assert.equal(slugify('  A--b!!c  '), 'a-b-c');
});

test('falls back to "untitled" when nothing survives normalization', () => {
  assert.equal(slugify('   '), 'untitled');
  assert.equal(slugify('!!!'), 'untitled');
});

test('truncates to maxLength without a trailing dash', () => {
  const slug = slugify('a very long heading that must be shortened', { maxLength: 10 });
  assert.ok(slug.length <= 10, `expected length <= 10, got ${slug}`);
  assert.ok(!slug.endsWith('-'), `expected no trailing dash, got ${slug}`);
});
