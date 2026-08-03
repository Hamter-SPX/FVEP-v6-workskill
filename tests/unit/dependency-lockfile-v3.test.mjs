import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { inspectDependencyLockfile } from '../../lib/fullstack-runner.mjs';

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

const manifest = { name: 'demo', version: '1.0.0', dependencies: { alpha: '1.2.3' } };

function lock(rootVersion = '1.2.3', packageVersion = '1.2.3') {
  return {
    name: 'demo',
    version: '1.0.0',
    lockfileVersion: 3,
    packages: {
      '': { name: 'demo', version: '1.0.0', dependencies: { alpha: rootVersion } },
      'node_modules/alpha': { version: packageVersion, resolved: 'https://registry.npmjs.org/alpha/-/alpha-1.2.3.tgz', integrity: 'sha512-example' }
    }
  };
}

test('npm lockfile inspection verifies exact root and resolved package versions', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lock-verified-'));
  await writeJson(path.join(root, 'package-lock.json'), lock());
  const evidence = await inspectDependencyLockfile(root, manifest);
  assert.equal(evidence.lockfilePresent, true);
  assert.equal(evidence.lockfileVerified, true);
  assert.equal(evidence.lockfileKind, 'npm');
  assert.deepEqual(evidence.lockfileIssues, []);
});

test('npm lockfile inspection reports manifest and resolved-version drift', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lock-drift-'));
  await writeJson(path.join(root, 'package-lock.json'), lock('2.0.0', '2.0.0'));
  const evidence = await inspectDependencyLockfile(root, manifest);
  assert.equal(evidence.lockfilePresent, true);
  assert.equal(evidence.lockfileVerified, false);
  assert.ok(evidence.lockfileIssues.some((issue) => issue.includes('dependencies.alpha')));
});
