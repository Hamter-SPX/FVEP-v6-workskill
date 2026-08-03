import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  collectReleaseEntries,
  createDeterministicZip,
  renderChecksums,
  verifyChecksumDocument,
  verifyZipStructure
} from '../../lib/release-package-engine.mjs';

async function tempTree() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvep-release-'));
  await fs.mkdir(path.join(root, 'lib'), { recursive: true });
  await fs.mkdir(path.join(root, '.git'), { recursive: true });
  await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
  await fs.mkdir(path.join(root, 'node_modules', 'x'), { recursive: true });
  await fs.writeFile(path.join(root, 'README.md'), '# release\n');
  await fs.writeFile(path.join(root, 'lib', 'a.mjs'), 'export const a = 1;\n');
  await fs.writeFile(path.join(root, '.git', 'config'), 'secret\n');
  await fs.writeFile(path.join(root, 'artifacts', 'fake.json'), '{}\n');
  await fs.writeFile(path.join(root, 'node_modules', 'x', 'index.js'), 'x\n');
  return root;
}

test('release collection is deterministic and excludes unsafe development state', async () => {
  const root = await tempTree();
  try {
    const entries = await collectReleaseEntries(root);
    assert.deepEqual(entries.map((item) => item.path), ['README.md', 'lib/a.mjs']);
    assert.ok(entries.every((item) => /^[a-f0-9]{64}$/.test(item.sha256)));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('release collection skips symlinks and never traverses outside root', async (t) => {
  const root = await tempTree();
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'fvep-outside-'));
  await fs.writeFile(path.join(outside, 'secret.txt'), 'do not include\n');
  try {
    try { await fs.symlink(path.join(outside, 'secret.txt'), path.join(root, 'leak.txt')); }
    catch (error) {
      if (process.platform === 'win32') return t.skip(`symlink unavailable: ${error.message}`);
      throw error;
    }
    const entries = await collectReleaseEntries(root);
    assert.equal(entries.some((item) => item.path === 'leak.txt'), false);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});

test('checksums cover every supplied entry and detect modification', async () => {
  const entries = [
    { path: 'a.txt', data: Buffer.from('a'), sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', bytes: 1 },
    { path: 'nested/b.txt', data: Buffer.from('b'), sha256: '3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d', bytes: 1 }
  ];
  const document = renderChecksums(entries);
  assert.deepEqual(verifyChecksumDocument(document, entries), { ok: true, missing: [], mismatched: [], extra: [] });
  const modified = entries.map((item) => item.path === 'a.txt' ? { ...item, sha256: '0'.repeat(64) } : item);
  assert.equal(verifyChecksumDocument(document, modified).ok, false);
});

test('deterministic ZIP is byte-identical and structurally safe', () => {
  const entries = [
    { path: 'README.md', data: Buffer.from('# x\n') },
    { path: 'lib/a.mjs', data: Buffer.from('export {};\n') }
  ];
  const options = { rootPrefix: 'fullstack-vision-engineering-pro-v4', timestamp: '2026-07-27T00:00:00.000Z' };
  const first = createDeterministicZip(entries, options);
  const second = createDeterministicZip([...entries].reverse(), options);
  assert.deepEqual(first, second);
  const report = verifyZipStructure(first, { requiredPrefix: 'fullstack-vision-engineering-pro-v4/' });
  assert.equal(report.ok, true);
  assert.deepEqual(report.entries, [
    'fullstack-vision-engineering-pro-v4/README.md',
    'fullstack-vision-engineering-pro-v4/lib/a.mjs'
  ]);
});


test('release staging preserves executable modes for scripts', async () => {
  const source = await tempTree();
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'fvep-stage-parent-'));
  const output = path.join(parent, 'release');
  const archive = path.join(parent, 'release.zip');
  try {
    await fs.writeFile(path.join(source, 'setup.sh'), '#!/usr/bin/env bash\necho ok\n');
    await fs.chmod(path.join(source, 'setup.sh'), 0o755);
    const { buildReleaseArtifact } = await import('../../lib/release-package-engine.mjs');
    await buildReleaseArtifact({ sourceRoot: source, outputDirectory: output, archivePath: archive, rootPrefix: 'release' });
    const mode = (await fs.stat(path.join(output, 'setup.sh'))).mode & 0o777;
    assert.equal(mode, 0o755);
  } finally {
    await fs.rm(source, { recursive: true, force: true });
    await fs.rm(parent, { recursive: true, force: true });
  }
});

test('ZIP builder rejects unsafe member paths', () => {
  assert.throws(() => createDeterministicZip([{ path: '../escape.txt', data: Buffer.from('x') }]), /unsafe/i);
  assert.throws(() => createDeterministicZip([{ path: '/absolute.txt', data: Buffer.from('x') }]), /unsafe/i);
});
