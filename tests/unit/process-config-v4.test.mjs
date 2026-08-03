import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { normalizeProcessConfig, validateProcessConfig } from '../../lib/process-config.mjs';

test('normalizes v4 process contracts relative to config path', () => {
  const configPath = '/tmp/project/config/process.json';
  const config = normalizeProcessConfig({
    project: { name: 'Example', rootDir: '../app' },
    contracts: { request: 'contracts/request.json', design: 'contracts/design.json' },
    outputDir: 'artifacts/process',
    policy: { processGate: { minScore: 95, minConfidence: 92 } }
  }, configPath);
  assert.equal(config.version, 4);
  assert.equal(config.project.rootDir, path.resolve('/tmp/project/app'));
  assert.equal(config.contracts.request, path.resolve('/tmp/project/config/contracts/request.json'));
  assert.equal(config.outputDir, path.resolve('/tmp/project/config/artifacts/process'));
  assert.equal(config.policy.processGate.minScore, 95);
});

test('rejects impossible thresholds and duplicate required sections', () => {
  const config = normalizeProcessConfig({ policy: { processGate: { minScore: 101, requiredSections: ['review', 'review'] } } });
  assert.throws(() => validateProcessConfig(config), /minScore/);
  config.policy.processGate.minScore = 90;
  assert.throws(() => validateProcessConfig(config), /Duplicate required process section/);
});
