import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const scriptPath = path.join(repoRoot, 'scripts', 'remediate.mjs');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
}

// Fixture mirrors what a mobile vision loop run leaves on disk: comparison
// rows under reports/comparison.json (schemaVersion 2) and one judgment per
// case under metadata/<key>.mobile.judgment.json (schema_version 1).
function makeFixture({ withRunSummary = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'remediate-cli-'));
  writeJson(path.join(dir, 'reports', 'comparison.json'), {
    schemaVersion: 2,
    generatedAt: '2026-08-09T10:00:00.000Z',
    configPath: 'vision-loop.config.json',
    mode: 'compare',
    summary: { total: 3, blockers: 1, majors: 1, minors: 0, accepted: 1, unverified: 0 },
    comparisons: [
      { key: 'home__mobile__home', severity: 'major', mismatchRatio: 0.5, visualScore: 42, reason: 'mismatch-above-major', regions: [], notes: [] },
      { key: 'gone__mobile__gone', severity: 'blocker', reason: 'missing-reference', regions: [], notes: [] },
      { key: 'ok__mobile__ok', severity: 'accepted', mismatchRatio: 0, visualScore: 100, reason: 'within-threshold', regions: [], notes: [] }
    ]
  });
  writeJson(path.join(dir, 'metadata', 'home__mobile__home.mobile.judgment.json'), {
    schema_version: 1,
    case_label: 'home',
    mode: 'metrics',
    verdict: 'fail',
    findings: [{ rule: 'maxEmptyCells', severity: 'fail', expected: 2, observed: 3 }],
    metrics_ref: null,
    capture_ref: 'current/home__mobile__home.png',
    judged_by: 'metrics-engine',
    judged_at: '2026-08-09T10:01:00.000Z',
    goal: 'mobile case home'
  });
  writeJson(path.join(dir, 'metadata', 'chat__mobile__chat.mobile.judgment.json'), {
    schema_version: 1,
    case_label: 'chat',
    mode: 'metrics',
    verdict: 'warn',
    findings: [{ rule: 'totallyCustomRule', severity: 'warn', expected: 'a', observed: 'b' }],
    metrics_ref: null,
    capture_ref: 'current/chat__mobile__chat.png',
    judged_by: 'metrics-engine',
    judged_at: '2026-08-09T10:01:00.000Z',
    goal: 'mobile case chat'
  });
  // Unreadable judgment degrades quietly instead of aborting the report.
  fs.writeFileSync(path.join(dir, 'metadata', 'corrupt__mobile__corrupt.mobile.judgment.json'), '{ not json');
  if (withRunSummary) {
    writeJson(path.join(dir, 'reports', 'run-summary.json'), {
      schemaVersion: 2,
      generatedAt: '2026-08-09T10:05:00.000Z',
      configPath: 'vision-loop.config.json',
      mode: 'compare',
      provenance: { runId: 'run-123' },
      quality: { passed: false, score: 40, grade: 'F', confidence: 60, gates: {} },
      sections: {
        mobileChecks: { total: 2, failed: 1 },
        baseline: { valid: false, missingManifest: false, checked: 2, changed: 1, missing: 0, configMatches: false, approvalValid: true, manifestPath: 'reference/manifest.json' },
        manualReview: { path: 'reviews/visual-review.md', missing: true, status: 'missing', passed: false },
        aesthetics: { passed: false, status: 'fail', score: 12, evidenceConfidence: 0, findings: 0, blockers: 0, reviewPassed: null, missingPaths: ['profile'] }
      },
      automatedGatePassed: false,
      releaseDecision: 'blocked-by-automated-or-semantic-evidence'
    });
  }
  return dir;
}

test('CLI — text report rebuilds the plan from comparison + judgments, blockers first, exit 0', () => {
  const dir = makeFixture();
  const run = spawnSync(process.execPath, [scriptPath, '--output-dir', dir], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stderr, '');
  assert.ok(run.stdout.includes('Remediation plan: 4 finding(s) — 2 blocker(s), 1 major(s)'), run.stdout);
  assert.ok(run.stdout.includes('sources: comparison.json, mobile judgments (2)'), 'corrupt judgment degrades, sources are named');

  const lines = run.stdout.trim().split('\n');
  const blockerLines = lines.filter((line) => line.startsWith('[BLOCKER]'));
  assert.equal(blockerLines.length, 2);
  assert.ok(blockerLines.some((line) => line.includes('mobile-visual — Judge rule maxEmptyCells breached: expected 2, observed 3. (case: home__mobile__home)')), run.stdout);
  assert.ok(blockerLines.some((line) => line.includes('visual — Required visual evidence is missing (missing-reference). (case: gone__mobile__gone)')), run.stdout);
  assert.ok(blockerLines[0].includes('| ทำไม: ') && blockerLines[0].includes('| แก้: ') && blockerLines[0].includes('| ตรวจ: '), 'why/action/verify segments');
  assert.ok(blockerLines.some((line) => line.includes('Fill or rebalance the content')), 'curated action text lands on the line');
  assert.ok(lines.some((line) => line.startsWith('[MAJOR] visual — Visual comparison is major')), run.stdout);
  const warning = lines.find((line) => line.startsWith('[WARNING]'));
  assert.ok(warning.includes('judge — Judge rule totallyCustomRule breached'), 'unmapped rule falls back to the generic judge guidance');
  assert.ok(warning.includes('No curated remediation rule exists'), 'fallback why text');
  assert.ok(run.stdout.includes('Advisory report — the exit code is 0 regardless of findings.'));

  const severityIndex = (prefix) => lines.findIndex((line) => line.startsWith(prefix));
  assert.ok(severityIndex('[BLOCKER]') < severityIndex('[MAJOR]'), 'blockers print before majors');
  assert.ok(severityIndex('[MAJOR]') < severityIndex('[WARNING]'), 'majors print before warnings');

  // Accepted comparison rows never surface, and the accepted case is absent.
  assert.ok(!run.stdout.includes('ok__mobile__ok'), 'accepted rows produce no items');
});

test('CLI — -o alias and positional output dir both work', () => {
  const dir = makeFixture();
  const alias = spawnSync(process.execPath, [scriptPath, '-o', dir], { encoding: 'utf8' });
  assert.equal(alias.status, 0, alias.stderr);
  assert.ok(alias.stdout.includes('4 finding(s)'));
  const positional = spawnSync(process.execPath, [scriptPath, dir], { encoding: 'utf8' });
  assert.equal(positional.status, 0, positional.stderr);
  assert.ok(positional.stdout.includes('4 finding(s)'));
  const defaulted = spawnSync(process.execPath, [scriptPath], { encoding: 'utf8', cwd: dir });
  assert.equal(defaulted.status, 0, defaulted.stderr);
  assert.ok(defaulted.stdout.includes('4 finding(s)'), 'default --output-dir is the working directory');
});

test('CLI — --json prints the full plan and still exits 0 with findings', () => {
  const dir = makeFixture();
  const run = spawnSync(process.execPath, [scriptPath, '--json', '--output-dir', dir], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const plan = JSON.parse(run.stdout);
  assert.equal(plan.schemaVersion, 1);
  assert.equal(plan.total, 4);
  assert.equal(plan.blockers, 2);
  assert.equal(plan.majors, 1);
  assert.equal(plan.items[0].severity, 'blocker');
  assert.equal(plan.items[0].id, 'R001');
  assert.equal(plan.items[0].priority, 1);
  const mobile = plan.items.find((item) => item.category === 'mobile-visual');
  assert.equal(mobile.case, 'home__mobile__home');
  assert.ok(mobile.verify.includes('maxEmptyCells'), 'rule-specific verify text present');
});

test('CLI — run-summary sections fold in (baseline config drift, missing review, missing aesthetic profile)', () => {
  const dir = makeFixture({ withRunSummary: true });
  const run = spawnSync(process.execPath, [scriptPath, '--output-dir', dir], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.ok(run.stdout.includes('7 finding(s) — 5 blocker(s)'), run.stdout);
  assert.ok(run.stdout.includes('[BLOCKER] baseline-governance — Visual baseline provenance or integrity is invalid.'), run.stdout);
  assert.ok(run.stdout.includes('acceptance configuration changed after baseline approval'), 'baseline why from the folded summary');
  assert.ok(run.stdout.includes('[BLOCKER] semantic-review — Recorded semantic visual review is missing.'), run.stdout);
  assert.ok(run.stdout.includes('[BLOCKER] aesthetics — Aesthetic profile required by the enabled aesthetic gate is missing.'), run.stdout);
  assert.ok(run.stdout.includes('run-summary.json'), 'sources name run-summary.json');
});

test('CLI — empty dir, missing dir and no reports all exit 0 with an empty plan note', () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'remediate-cli-empty-'));
  const first = spawnSync(process.execPath, [scriptPath, '--output-dir', empty], { encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  assert.ok(first.stdout.includes('0 finding(s) — 0 blocker(s), 0 major(s) (sources: none'), first.stdout);
  assert.ok(first.stdout.includes('Nothing to remediate'), first.stdout);

  const missing = path.join(empty, 'does-not-exist');
  const second = spawnSync(process.execPath, [scriptPath, '--output-dir', missing], { encoding: 'utf8' });
  assert.equal(second.status, 0, second.stderr);
  assert.ok(second.stdout.includes('0 finding(s)'), 'missing directory degrades to an empty plan');
  assert.ok(second.stdout.includes('Nothing to remediate'));

  const third = spawnSync(process.execPath, [scriptPath, '--json', '--output-dir', empty], { encoding: 'utf8' });
  assert.equal(third.status, 0, third.stderr);
  assert.equal(JSON.parse(third.stdout).total, 0);
});

test('CLI — help exits 0 with usage', () => {
  const run = spawnSync(process.execPath, [scriptPath, '--help'], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Usage:/);
  assert.ok(run.stdout.includes('ทำไม'), 'help shows the advisory line format');
});
