import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { hashCanonical, canonicalize, createRunProvenance } from '../../lib/provenance.mjs';
import { normalizeConfig, validateConfig } from '../../lib/config.mjs';

test('canonical hashing is stable across object key order', () => {
  assert.deepEqual(canonicalize({ b: 2, a: { d: 4, c: 3 } }), { a: { c: 3, d: 4 }, b: 2 });
  assert.equal(hashCanonical({ b: 2, a: 1 }), hashCanonical({ a: 1, b: 2 }));
});

test('createRunProvenance includes aesthetics so profile or floor changes invalidate the hash', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-prov-'));
  const base = {
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    routes: [{ name: 'home', path: '/', viewports: [{ name: 'desktop', width: 1440, height: 900 }] }]
  };
  const off = validateConfig(normalizeConfig(base, path.join(root, 'a.json')));
  const on = validateConfig(normalizeConfig({
    ...base,
    aesthetics: { enabled: true, profilePath: 'profile.json', dimensionFloor: 3, requireMatchingConfigHash: false }
  }, path.join(root, 'b.json')));
  const raised = validateConfig(normalizeConfig({
    ...base,
    aesthetics: { enabled: true, profilePath: 'profile.json', dimensionFloor: 4, requireMatchingConfigHash: false }
  }, path.join(root, 'c.json')));

  const hashOff = createRunProvenance(off).configHash;
  const hashOn = createRunProvenance(on).configHash;
  const hashRaised = createRunProvenance(raised).configHash;
  assert.notEqual(hashOff, hashOn);
  assert.notEqual(hashOn, hashRaised);
});
