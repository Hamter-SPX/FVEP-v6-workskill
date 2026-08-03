import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scripts = [
  'scripts/audit-fullstack.mjs',
  'scripts/audit-experience.mjs',
  'scripts/audit-api-contract.mjs',
  'scripts/audit-architecture.mjs',
  'scripts/audit-migrations.mjs',
  'scripts/audit-security.mjs',
  'scripts/audit-resilience.mjs',
  'scripts/audit-observability.mjs',
  'scripts/audit-dependencies.mjs',
  'scripts/audit-risks.mjs',
  'scripts/triage-incident.mjs',
  'scripts/fullstack-quality-gate.mjs'
];

test('all v3 CLI entry points expose usable help without loading external services', () => {
  for (const script of scripts) {
    const result = spawnSync(process.execPath, [path.join(root, script), '--help'], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${script}: ${result.stderr}`);
    assert.match(result.stdout, /Usage:/, script);
  }
});
