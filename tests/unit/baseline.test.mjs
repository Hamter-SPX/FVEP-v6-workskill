import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createBaselineManifest, verifyBaselineManifest } from '../../lib/baseline-engine.mjs';

test('baseline manifest detects changed evidence', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-baseline-'));
  const file = path.join(root, 'home.png');
  await fs.writeFile(file, 'first');
  const manifest = await createBaselineManifest({ root, files: [file], configHash: 'abc', approvedBy: 'tester' });
  assert.equal((await verifyBaselineManifest(manifest, root)).valid, true);
  await fs.writeFile(file, 'changed');
  const verification = await verifyBaselineManifest(manifest, root);
  assert.equal(verification.valid, false);
  assert.deepEqual(verification.changed, ['home.png']);
});

test('baseline verification rejects config drift and missing approval provenance', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-baseline-policy-'));
  const file = path.join(root, 'reference.png'); await fs.writeFile(file, 'same');
  const manifest = await createBaselineManifest({ root, files: [file], configHash: 'old', approvedBy: 'Lead' });
  const result = await verifyBaselineManifest(manifest, root, { expectedConfigHash: 'new', requireApprovalMetadata: true });
  assert.equal(result.valid, false);
  assert.equal(result.configMatches, false);
  assert.equal(result.approvalValid, true);
  const noApproval = { ...manifest, approvedBy: '' };
  const second = await verifyBaselineManifest(noApproval, root, { expectedConfigHash: 'old', requireApprovalMetadata: true });
  assert.equal(second.valid, false);
  assert.equal(second.approvalValid, false);
});
