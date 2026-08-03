import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { normalizeFullstackConfig, validateFullstackConfig } from '../../lib/fullstack-config.mjs';

test('fullstack config resolves contract paths and applies strict release defaults', () => {
  const config = normalizeFullstackConfig({ project: { name: 'Shop' }, contracts: { experience: 'contracts/experience.json', architecture: 'contracts/architecture.json' } }, '/tmp/project/fullstack.config.json');
  assert.equal(config.version, 4);
  assert.equal(config.project.name, 'Shop');
  assert.equal(config.contracts.experience, path.resolve('/tmp/project/contracts/experience.json'));
  assert.equal(config.quality.minScore, 90);
  assert.equal(config.quality.minConfidence, 90);
  assert.equal(config.gates.security.required, true);
  assert.equal(config.gates.process.required, true);
  assert.equal(config.gates.process.hard, true);
});

test('fullstack config rejects duplicate critical flow identifiers and impossible thresholds', () => {
  const config = normalizeFullstackConfig({ project: { name: 'X', criticalFlows: [{ id: 'checkout' }, { id: 'checkout' }] }, quality: { minScore: 101 } }, '/tmp/fullstack.config.json');
  assert.throws(() => validateFullstackConfig(config), /duplicate critical flow|between 0 and 100/i);
});
