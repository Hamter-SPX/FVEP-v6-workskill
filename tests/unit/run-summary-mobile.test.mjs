import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { normalizeConfig, validateConfig } from '../../lib/config.mjs';
import { writeRunSummary } from '../../lib/run-summary.mjs';

async function mobileSummaryConfig(root, overrides = {}) {
  const config = validateConfig(normalizeConfig({
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    capture: { type: 'ios-sim' },
    history: { enabled: false },
    reports: { html: false, markdown: false, remediation: false, provenance: false },
    mobile: { cases: [{ key: 'home', label: 'Home' }] },
    routes: [{ name: 'home', path: '/', viewports: [{ name: 'mobile', width: 390, height: 844 }] }],
    ...overrides
  }, path.join(root, 'vision-loop.config.json')));
  // Mirror the summaryConfig clone in scripts/vision-loop.mjs for mobile runs.
  // On mobile the authoritative gate is the mobileChecks verdict set (plus a
  // mobile comparison when present); the web score floor is removed because no
  // web gates are applicable (all would be not-applicable, dragging score to 0).
  return {
    ...config,
    inspection: { ...config.inspection, enabled: false },
    accessibility: { ...config.accessibility, enabled: false },
    interaction: { ...config.interaction, enabled: false },
    stateCrawler: { ...config.stateCrawler, enabled: false },
    performance: { ...config.performance, enabled: false },
    tokens: { ...config.tokens, enabled: false },
    engineeringChecks: [],
    breakpoints: { ...config.breakpoints, enabled: false },
    quality: { ...config.quality, minScore: 0, minConfidence: 0 }
  };
}

function mobileSections() {
  return {
    capture: [{ key: 'home', screenshotPath: 'current/home__mobile__home.png', metadataPath: 'metadata/home__mobile__home.current.capture.json', relativeScreenshot: 'current/home__mobile__home.png', regionCount: 0, unresolvedRequiredRegionCount: 0, ok: true }],
    mobileChecks: [
      { key: 'home', label: 'Home', verdict: 'pass', findings: [], metricsPath: null, judgmentPath: 'metadata/home__mobile__home.mobile.judgment.json' },
      { key: 'chat', label: 'Chat', verdict: 'warn', findings: [{ rule: 'maxEmptyCells', severity: 'warn', expected: 6, observed: 8 }], metricsPath: null, judgmentPath: 'metadata/chat__mobile__chat.mobile.judgment.json' },
      { key: 'list', label: 'List', verdict: 'fail', findings: [{ rule: 'missingCapture', severity: 'fail', expected: 'captured PNG', observed: null }], metricsPath: null, judgmentPath: null }
    ]
  };
}

test('mobile run summary: mobileChecks section is summarized and mobile-aware gates drop out', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-summary-mobile-'));
  const config = await mobileSummaryConfig(root);
  const summary = await writeRunSummary(config, mobileSections());
  assert.deepEqual(summary.sections.mobileChecks, { total: 3, failed: 1 });
  // On mobile (no comparison), visual/runtime/responsive evidence cannot exist —
  // the gates must be not-applicable rather than skipped-with-zero-evidence.
  assert.equal(summary.quality.gates.visual.status, 'not-applicable');
  assert.equal(summary.quality.gates.runtime.status, 'not-applicable');
  assert.equal(summary.quality.gates.responsive.status, 'not-applicable');
  // A failing mobileChecks verdict is a quality signal only via the loop's exit
  // code (vision-loop.mjs), not via these not-applicable gates.
  assert.equal(summary.quality.gates.visual.hard, false);
  // With all web gates not-applicable the score is 0/100 by definition; the
  // mobile clone removes the web floor so the automated gate does not fail on
  // an inapplicable web score (the real mobile gate is mobileChecks + exit code).
  assert.equal(summary.quality.score, 0);
  assert.equal(summary.quality.confidence, 0);
  assert.equal(summary.automatedGatePassed, true);
});

test('mobile run summary: a present comparison re-applies the visual gate', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-summary-mobile-cmp-'));
  const config = await mobileSummaryConfig(root);
  const comparison = { ok: true, total: 1, blockers: 0, majors: 0, minors: 0, accepted: 1, unverified: 0, comparisons: [{ key: 'home__mobile__home', severity: 'accepted', visualScore: 99, perceptual: { similarity: 0.99 } }] };
  const summary = await writeRunSummary(config, { ...mobileSections(), comparison });
  assert.equal(summary.quality.gates.visual.status, 'pass');
  assert.equal(summary.quality.gates.runtime.status, 'not-applicable');
});

test('web run summary: playwright applicability is unchanged and mobileChecks stays null', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-summary-web-'));
  const config = validateConfig(normalizeConfig({
    mode: 'brand-consistent',
    outputDir: 'artifacts',
    history: { enabled: false },
    reports: { html: false, markdown: false, remediation: false, provenance: false },
    routes: [{ name: 'home', path: '/', viewports: [{ name: 'desktop', width: 1440, height: 900 }] }]
  }, path.join(root, 'vision-loop.config.json')));
  const summary = await writeRunSummary(config, {});
  // Same behavior as before the mobile-awareness change: enabled-but-missing
  // evidence is 'skipped', never silently not-applicable.
  assert.equal(summary.quality.gates.visual.status, 'skipped');
  assert.equal(summary.quality.gates.runtime.status, 'skipped');
  assert.equal(summary.quality.gates.responsive.status, 'skipped');
  assert.equal(summary.sections.mobileChecks, null);
});
