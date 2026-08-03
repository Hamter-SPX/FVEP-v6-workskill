import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadFullstackConfig } from '../../lib/fullstack-config.mjs';
import { runConfiguredFullstackAudit } from '../../lib/fullstack-runner.mjs';

async function writeJson(file, value) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`); }

test('configured runner loads contracts, scans source, triages incident, and writes JSON/Markdown evidence', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fullstack-runner-'));
  await fs.mkdir(path.join(root, 'src'));
  await fs.writeFile(path.join(root, 'src', 'safe.js'), 'export const ok = true;\n');
  await writeJson(path.join(root, 'contracts', 'experience.json'), { flows: [] });
  await writeJson(path.join(root, 'contracts', 'security.json'), { controls: {} });
  await writeJson(path.join(root, 'contracts', 'incident.json'), {
    incident: { id: 'INC-1' },
    evidence: [{ id: 'E1', boundary: 'api->db', state: 'fail', observation: 'timeout', confidence: 0.9, correlationId: 'c1' }],
    hypotheses: [{ id: 'H1', statement: 'DB unavailable', boundary: 'api->db', supportingEvidence: ['E1'], contradictingEvidence: [], falsificationTest: 'Connect using health probe', status: 'open' }]
  });
  const configPath = path.join(root, 'fullstack.config.json');
  await writeJson(configPath, {
    project: { name: 'Runner Test', rootDir: '.' },
    outputDir: 'artifacts',
    contracts: { experience: 'contracts/experience.json', security: 'contracts/security.json', incident: 'contracts/incident.json' },
    sourceScan: { roots: ['src'] },
    gates: { process: { required: false, hard: true }, frontend: { required: false, hard: false }, api: { required: false, hard: true }, architecture: { required: false, hard: false }, data: { required: false, hard: true }, resilience: { required: false, hard: false }, observability: { required: false, hard: false }, dependencies: { required: false, hard: true }, risks: { required: false, hard: true } },
    quality: { minScore: 0, minConfidence: 0, failOnAnyGateFailure: false }
  });
  const config = await loadFullstackConfig(configPath);
  const result = await runConfiguredFullstackAudit(config);
  assert.equal(result.report.project.name, 'Runner Test');
  assert.equal(result.report.sections.incidentTriage.suspectedBoundary, 'api->db');
  assert.equal(result.report.sections.sourceRisk.filesScanned, 1);
  assert.equal(await fs.stat(result.jsonPath).then(() => true), true);
  assert.equal(await fs.stat(result.markdownPath).then(() => true), true);
});
