import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeConfig, validateConfig } from '../../lib/config.mjs';
import { writeRunSummary } from '../../lib/run-summary.mjs';
import { loadAestheticEvidence } from '../../lib/aesthetic-audit-engine.mjs';
import { createRunProvenance } from '../../lib/provenance.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function baseSections() {
  return {
    capture: [{ key: 'home__desktop__default', ok: true, runtimeSummary: { status: 'pass' }, runtimePath: 'runtime.json' }],
    inspection: [{ key: 'home__desktop__default', ok: true, horizontalOverflow: false }],
    accessibility: [{ key: 'home__desktop__default', ok: true, blockingViolationCount: 0, violationCount: 0 }],
    interaction: [{ key: 'home__desktop__default', ok: true, missingNameCount: 0, targetSizeViolationCount: 0 }],
    performance: [{ key: 'home__desktop__default', ok: true, budget: { score: 95, hardFailures: [], warnings: [] } }],
    comparison: { ok: true, total: 1, blockers: 0, majors: 0, minors: 0, accepted: 1, unverified: 0, comparisons: [{ key: 'home__desktop__default', severity: 'accepted', visualScore: 99, perceptual: { similarity: 0.99 } }] },
    engineering: [],
    baseline: { valid: true, configMatches: true, approvalValid: true, checked: 2, changed: [], missing: [] }
  };
}

test('run summary writes provenance, quality, remediation, markdown, and html evidence', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-summary-'));
  const config = validateConfig(normalizeConfig({
    mode: 'exact-reference', outputDir: 'artifacts', routes: [{ name: 'home', path: '/', viewports: [{ name: 'desktop', width: 1440, height: 900 }] }]
  }, path.join(root, 'vision-loop.config.json')));
  const summary = await writeRunSummary(config, baseSections());
  assert.equal(summary.automatedGatePassed, true);
  assert.equal(summary.quality.gates.aesthetic.status, 'not-applicable');
  assert.equal(summary.releaseDecision, 'requires-human-semantic-visual-approval');
  for (const file of [summary.jsonPath, summary.markdownPath, summary.htmlPath, summary.remediationJsonPath, summary.provenancePath]) await fs.access(file);
});

test('enabled aesthetics without evidence fails the aesthetic gate as a hard miss', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-summary-aesthetic-'));
  const config = validateConfig(normalizeConfig({
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    aesthetics: {
      enabled: true,
      profilePath: 'missing-profile.json',
      requireMatchingConfigHash: false
    },
    routes: [{ name: 'home', path: '/', viewports: [{ name: 'desktop', width: 1440, height: 900 }] }]
  }, path.join(root, 'vision-loop.config.json')));
  const summary = await writeRunSummary(config, baseSections());
  assert.equal(summary.quality.gates.aesthetic.status, 'fail');
  assert.equal(summary.quality.gates.aesthetic.hard, true);
  assert.equal(summary.automatedGatePassed, false);
});

test('loadAestheticEvidence stays null when disabled and audits when enabled', async () => {
  const disabled = validateConfig(normalizeConfig({
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    routes: [{ name: 'home', path: '/', viewports: [{ name: 'desktop', width: 1440, height: 900 }] }]
  }, path.join(skillRoot, 'vision-loop.config.json')));
  assert.equal(await loadAestheticEvidence(disabled), null);

  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-aesthetic-load-'));
  const auditExample = JSON.parse(await fs.readFile(path.join(skillRoot, 'examples/aesthetic-audit.example.json'), 'utf8'));
  const review = {
    ...auditExample.review,
    reviewedAt: new Date().toISOString(),
    configHash: 'test-hash'
  };
  await fs.writeFile(path.join(root, 'profile.json'), JSON.stringify(auditExample.profile));
  await fs.writeFile(path.join(root, 'measurements.json'), JSON.stringify({
    color: auditExample.color,
    typography: auditExample.typography,
    spacing: auditExample.spacing,
    craft: auditExample.craft,
    motion: auditExample.motion,
    style: auditExample.style,
    policy: auditExample.policy
  }));
  await fs.writeFile(path.join(root, 'review.json'), JSON.stringify(review));

  const enabled = validateConfig(normalizeConfig({
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    aesthetics: {
      enabled: true,
      profilePath: 'profile.json',
      measurementsPath: 'measurements.json',
      reviewPath: 'review.json',
      requireMatchingConfigHash: false,
      maxAgeHours: 24,
      requireTestEvidence: true
    },
    routes: [{
      name: 'breaks',
      path: '/breaks',
      viewports: [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'mobile', width: 390, height: 844 }
      ],
      states: ['default']
    }]
  }, path.join(root, 'vision-loop.config.json')));

  const report = await loadAestheticEvidence(enabled, createRunProvenance(enabled).configHash);
  assert.equal(report.paths.missing.includes('profile'), false);
  assert.equal(report.passed, true, JSON.stringify(report.findings));

  const summary = await writeRunSummary(enabled, { ...baseSections(), aesthetics: report });
  assert.equal(summary.quality.gates.aesthetic.status, 'pass');
  assert.equal(summary.sections.aesthetics.passed, true);
});
