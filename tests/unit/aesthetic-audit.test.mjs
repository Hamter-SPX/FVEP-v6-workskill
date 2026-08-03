import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aestheticInputFromTokenProfile, loadAestheticEvidence, runAestheticAudit } from '../../lib/aesthetic-audit-engine.mjs';
import { buildQualityGateSummary, toAestheticGate } from '../../lib/gate-engine.mjs';
import { normalizeConfig, validateConfig } from '../../lib/config.mjs';
import { createRunProvenance } from '../../lib/provenance.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function example() {
  return JSON.parse(await fs.readFile(path.join(root, 'examples/aesthetic-audit.example.json'), 'utf8'));
}

test('the bundled aesthetic example passes its own audit', async () => {
  const input = await example();
  const report = runAestheticAudit(input, input.policy);
  assert.equal(report.passed, true, JSON.stringify(report.findings));
  assert.equal(report.status, 'pass');
  assert.ok(report.score >= 80);
  assert.equal(report.review.passed, true);
});

test('sections without input are skipped rather than scored as passing', () => {
  const report = runAestheticAudit({}, { requireReview: false });
  for (const section of Object.values(report.sections)) assert.equal(section.status, 'skipped');
  assert.equal(report.score, 0);
  assert.equal(report.passed, false);
});

test('a missing review is reported when a review is required', () => {
  const report = runAestheticAudit({ spacing: { baseUnitPx: 4, scale: [4, 8, 16] } });
  assert.ok(report.findings.some((item) => item.code === 'AESTHETIC_REVIEW_MISSING'));
});

test('an unapproved review blocks the audit and names the reasons', async () => {
  const input = await example();
  input.review.decision = 'changes-requested';
  const report = runAestheticAudit(input, input.policy);
  assert.equal(report.ok, false);
  assert.equal(report.passed, false);
  const finding = report.hardFailures.find((item) => item.code === 'AESTHETIC_REVIEW_NOT_APPROVED');
  assert.ok(finding);
  assert.ok(finding.message.includes('changes-requested'));
});

test('the aggregate score is the weighted mean of sections, not a second penalty pass', async () => {
  const input = await example();
  const clean = runAestheticAudit(input, input.policy);
  const degraded = runAestheticAudit({ ...input, spacing: { ...input.spacing, groups: [{ name: 'label and field', withinPx: 16, betweenPx: 8 }] } }, input.policy);
  // The spacing blocker drops one weighted section to 50; it must not also be charged again at the top level.
  assert.equal(degraded.sections.spacing.score, 50);
  const expectedDrop = ((clean.sections.spacing.score - degraded.sections.spacing.score) / 100) * clean.sectionWeights.spacing;
  const totalWeight = Object.values(clean.sectionWeights).reduce((sum, value) => sum + value, 0) + clean.reviewWeight;
  assert.ok(Math.abs((clean.score - degraded.score) - (expectedDrop / totalWeight) * 100) < 0.1);
  assert.equal(degraded.passed, false);
});

test('a section that throws becomes a blocker rather than crashing the audit', () => {
  const report = runAestheticAudit({ color: { neutrals: ['not-a-colour', '#fff', '#000'] } }, { requireReview: false });
  assert.equal(report.sections.color.ok, false);
  assert.ok(report.sections.color.hardFailures.some((item) => item.code === 'AESTHETIC_SECTION_FAILED'));
});

test('the aesthetic gate stays out of the score until it is required or supplied', () => {
  const absent = buildQualityGateSummary({
    comparison: { comparisons: [{ severity: 'accepted', perceptual: { similarity: 1 } }], blockers: 0, majors: 0, minors: 0, ok: true },
    inspection: [{ ok: true, horizontalOverflow: false }],
    accessibility: [{ ok: true, blockingViolationCount: 0 }],
    performance: [{ ok: true, budget: { score: 95, hardFailures: [], warnings: [] } }],
    interaction: [{ ok: true, missingNameCount: 0, targetSizeViolationCount: 0 }],
    engineering: [{ required: true, ok: true }],
    capture: [{ ok: true, runtimeSummary: { status: 'pass' } }]
  }, { minScore: 80, minConfidence: 80 });
  assert.equal(absent.gates.aesthetic.status, 'not-applicable');
  assert.equal(absent.passed, true);

  const required = buildQualityGateSummary({}, { aestheticRequired: true, minScore: 0, minConfidence: 0, failOnAnyGateFailure: false });
  assert.equal(required.gates.aesthetic.status, 'fail');
  assert.equal(required.gates.aesthetic.hard, true);
  assert.equal(required.passed, false);
});

test('a passing aesthetic report becomes a passing gate', async () => {
  const input = await example();
  const report = runAestheticAudit(input, input.policy);
  const gate = toAestheticGate(report, { hard: true });
  assert.equal(gate.status, 'pass');
  assert.equal(gate.hard, true);
  assert.ok(gate.score >= 80);
  const summary = buildQualityGateSummary({ aesthetics: report }, {
    aestheticRequired: true,
    minScore: 0,
    minConfidence: 0,
    failOnAnyGateFailure: false,
    applicability: { visual: false, responsive: false, accessibility: false, runtime: false, engineering: false, performance: false, interaction: false }
  });
  assert.equal(summary.gates.aesthetic.status, 'pass');
});


test('loadAestheticEvidence fails when the review omits a required case', async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-case-cov-'));
  const input = await example();
  const template = input.review.cases[0];
  const review = {
    ...input.review,
    reviewedAt: new Date().toISOString(),
    configHash: 'ignored',
    cases: [{ ...template, key: 'wrong__desktop__default' }]
  };
  await fs.writeFile(path.join(rootDir, 'profile.json'), JSON.stringify(input.profile));
  await fs.writeFile(path.join(rootDir, 'measurements.json'), JSON.stringify({
    color: input.color,
    typography: input.typography,
    spacing: input.spacing,
    craft: input.craft,
    motion: input.motion,
    style: input.style,
    policy: { ...input.policy, requireReview: true }
  }));
  await fs.writeFile(path.join(rootDir, 'review.json'), JSON.stringify(review));

  const config = validateConfig(normalizeConfig({
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    aesthetics: {
      enabled: true,
      profilePath: 'profile.json',
      measurementsPath: 'measurements.json',
      reviewPath: 'review.json',
      requireMatchingConfigHash: false,
      requireTestEvidence: false,
      maxAgeHours: 24
    },
    routes: [
      { name: 'breaks', path: '/breaks', viewports: [{ name: 'desktop', width: 1440, height: 900 }], states: ['default'] },
      { name: 'home', path: '/', viewports: [{ name: 'desktop', width: 1440, height: 900 }], states: ['default'] }
    ]
  }, path.join(rootDir, 'vision-loop.config.json')));

  const report = await loadAestheticEvidence(config, createRunProvenance(config).configHash);
  assert.equal(report.passed, false);
  const missing = report.review?.missingCases?.length ?? report.reviewEvidence?.evaluation?.missingCases?.length ?? 0;
  assert.ok(missing >= 1);
  assert.ok(report.findings.some((item) => item.code === 'AESTHETIC_REVIEW_NOT_APPROVED'));
});

test('loadAestheticEvidence records invalid reviews without crashing the vision loop', async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-invalid-review-'));
  const input = await example();
  const review = { ...input.review, reviewedAt: new Date().toISOString(), cases: [] };
  await fs.writeFile(path.join(rootDir, 'profile.json'), JSON.stringify(input.profile));
  await fs.writeFile(path.join(rootDir, 'review.json'), JSON.stringify(review));
  const config = validateConfig(normalizeConfig({
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    aesthetics: {
      enabled: true,
      profilePath: 'profile.json',
      reviewPath: 'review.json',
      requireMatchingConfigHash: false,
      requireReview: true
    },
    routes: [{ name: 'breaks', path: '/breaks', viewports: [{ name: 'desktop', width: 1440, height: 900 }], states: ['default'] }]
  }, path.join(rootDir, 'vision-loop.config.json')));
  const report = await loadAestheticEvidence(config, createRunProvenance(config).configHash);
  assert.equal(report.passed, false);
  assert.ok(report.findings.some((item) => item.code === 'AESTHETIC_REVIEW_INVALID'));
});

test('token profiles fill empty measurement sections without overwriting authored ones', async () => {
  const fromTokens = aestheticInputFromTokenProfile({
    profile: {
      colors: { '#1d4ed8': 4 },
      backgroundColors: { '#f4f9ff': 10, '#ffffff': 8 },
      fontSizes: { '14px': 20, '24px': 2 },
      fontFamilies: { Inter: 12 },
      radii: { '4px': 6, '8px': 2 },
      spacings: { '8px': 10, '16px': 4 },
      shadows: { none: 3, '0 1px 2px rgba(0,0,0,0.1)': 1 }
    }
  });
  assert.ok(fromTokens.color);
  assert.ok(fromTokens.typography);
  assert.ok(fromTokens.spacing);
  assert.ok(fromTokens.craft);
  const report = runAestheticAudit({
    profile: (await example()).profile,
    ...fromTokens
  }, { requireReview: false });
  assert.ok(report.sections.color.status !== 'skipped');
});
