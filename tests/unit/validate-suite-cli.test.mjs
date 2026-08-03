import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const script = path.join(root, 'scripts/validate-suite.mjs');

test('validate-suite --help exits zero and documents --output', () => {
  for (const flag of ['--help', '-h']) {
    const result = spawnSync(process.execPath, [script, flag], { encoding: 'utf8' });
    assert.equal(result.status ?? 0, 0, result.stderr);
    assert.match(result.stdout, /Usage:/);
    assert.match(result.stdout, /--output/);
    assert.match(result.stdout, /--help/);
    assert.ok(!result.stdout.includes('FAIL:') && !result.stdout.includes('PASS:'),
      'help must exit before running the suite');
  }
});

test('validate-suite --output writes the report outside the package root', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'fvep-validate-output-'));
  const reportPath = path.join(dir, 'nested', 'VALIDATION_REPORT.json');
  const result = spawnSync(process.execPath, [script, '--output', reportPath], {
    encoding: 'utf8',
    cwd: root,
    env: process.env,
    timeout: 120_000
  });
  assert.ok((result.status ?? 0) === 0 || (result.status ?? 0) === 1, result.stderr);
  assert.match(result.stdout, /Report: .*VALIDATION_REPORT\.json/);
  const body = JSON.parse(await fs.readFile(reportPath, 'utf8'));
  assert.equal(body.schemaVersion, 4);
  assert.ok(['PASS', 'FAIL'].includes(body.status));
  assert.ok(Array.isArray(body.errors));
});
