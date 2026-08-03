import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { collectSourceFiles } from '../../lib/source-risk-scanner.mjs';

test('source collection scans dotenv files but does not follow symlinks outside the configured root', async (t) => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'source-collection-'));
  const root = path.join(parent, 'root');
  await fs.mkdir(root);
  await fs.writeFile(path.join(root, '.env'), 'API_KEY="fixture-value"\n');
  const external = path.join(parent, 'external.js');
  await fs.writeFile(external, 'const password = "outside-root-secret";\n');
  try {
    await fs.symlink(external, path.join(root, 'escape.js'));
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
      t.skip(`Symlinks unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  const files = await collectSourceFiles(root);
  assert.ok(files.some((file) => file.path === '.env'));
  assert.equal(files.some((file) => file.path === 'escape.js'), false);
  assert.equal(JSON.stringify(files).includes('outside-root-secret'), false);
});
