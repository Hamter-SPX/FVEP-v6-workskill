import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('package metadata exposes the v5 aesthetic layer and retained v3/v4 surfaces', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(manifest.name, 'fullstack-vision-engineering-pro');
  assert.equal(manifest.version, '5.0.0');
  for (const script of ['vision-loop', 'audit:fullstack', 'audit:api', 'audit:security', 'debug:triage', 'fullstack:quality-gate', 'process:audit', 'process:route', 'process:plan', 'process:tdd', 'process:review', 'process:integration', 'audit:aesthetics', 'aesthetics:review', 'direction:gallery', 'direction:init', 'direction:sync', 'direction:iterate', 'direction:gate', 'direction:runtime', 'direction:cursor-install', 'validate']) assert.ok(manifest.scripts[script], script);
  for (const binary of ['fullstack-audit', 'fullstack-api-audit', 'fullstack-security-audit', 'fullstack-incident-triage', 'fullstack-quality-gate', 'fullstack-process-audit', 'fullstack-plan-validate', 'fullstack-tdd-validate', 'fullstack-review-validate', 'frontend-vision-aesthetics-audit', 'frontend-vision-aesthetics-review', 'frontend-vision-direction-gallery', 'frontend-vision-direction-init', 'frontend-vision-direction-sync', 'frontend-vision-direction-iterate', 'frontend-vision-direction-gate', 'frontend-vision-direction-runtime', 'frontend-vision-direction-cursor-install']) assert.ok(manifest.bin[binary], binary);
});
