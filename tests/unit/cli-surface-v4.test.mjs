import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const scripts = [
  'scripts/audit-process.mjs',
  'scripts/route-skills.mjs',
  'scripts/inspect-workspace.mjs',
  'scripts/validate-plan.mjs',
  'scripts/validate-tdd.mjs',
  'scripts/validate-review-chain.mjs',
  'scripts/prepare-integration.mjs',
  'scripts/validate-skill-conformance.mjs',
  'scripts/build-release.mjs',
  'scripts/generate-all-in-one.mjs'
];

test('all v4 process CLI entry points expose help without external services', () => {
  for (const script of scripts) {
    const result = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${script}: ${result.stderr}`);
    assert.match(result.stdout, /Usage:/, script);
  }
});
