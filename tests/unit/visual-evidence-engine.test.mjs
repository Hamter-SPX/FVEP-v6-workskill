import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import {
  collectEvidence,
  escapeHtml,
  renderEvidenceHtml,
  thumbnail
} from '../../lib/visual-evidence-engine.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const scriptPath = path.join(repoRoot, 'scripts', 'visual-evidence.mjs');

function makePng(width, height, fill = [200, 200, 200]) {
  const png = new PNG({ width, height });
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = fill[0]; png.data[i + 1] = fill[1]; png.data[i + 2] = fill[2]; png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value));
}

// Fixture mirrors the shipped artifact layout: <key>.png under current/,
// reference/, diff/; schemaVersion-2 capture metadata + schema_version-1
// mobile judgment under metadata/; reports/comparison.json (schemaVersion 2).
function makeFixture({ label = 'home' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vee-'));
  for (const folder of ['current', 'reference', 'diff', 'metadata', 'reports']) {
    fs.mkdirSync(path.join(dir, folder), { recursive: true });
  }
  const key = 'home__mobile__home';
  const currentPng = makePng(8, 8);
  const referencePng = makePng(8, 8, [24, 24, 24]);
  fs.writeFileSync(path.join(dir, 'current', `${key}.png`), currentPng);
  fs.writeFileSync(path.join(dir, 'reference', `${key}.png`), referencePng);
  fs.writeFileSync(path.join(dir, 'diff', `${key}.png`), makePng(8, 8, [230, 57, 70]));
  const captureMeta = {
    schemaVersion: 2,
    mode: 'current',
    key: 'home',
    route: 'home',
    viewport: { width: 8, height: 8 },
    state: null,
    platform: 'ios-sim',
    label,
    capturedAt: '2026-08-08T10:00:00.000Z',
    screenshotPath: path.join(dir, 'current', `${key}.png`),
    screenshotSha256: sha256(currentPng),
    screenshotBytes: currentPng.length
  };
  writeJson(path.join(dir, 'metadata', `${key}.current.capture.json`), captureMeta);
  const judgment = {
    schema_version: 1,
    case_label: 'home',
    mode: 'metrics',
    verdict: 'fail',
    findings: [{ rule: 'maxEmptyCells', severity: 'fail', expected: 2, observed: 3 }],
    metrics_ref: null,
    capture_ref: `current/${key}.png`,
    judged_by: 'metrics-engine',
    judged_at: '2026-08-08T10:01:00.000Z',
    goal: 'mobile case home'
  };
  writeJson(path.join(dir, 'metadata', `${key}.mobile.judgment.json`), judgment);

  // Case B: comparison-only case (accepted severity -> pass verdict).
  const keyB = 'settings__mobile__home';
  const pngB = makePng(8, 8, [10, 20, 30]);
  fs.writeFileSync(path.join(dir, 'current', `${keyB}.png`), pngB);
  fs.writeFileSync(path.join(dir, 'reference', `${keyB}.png`), pngB);

  // Case C: orphaned current PNG only — no metadata/comparison/judgment.
  fs.writeFileSync(path.join(dir, 'current', 'orphan__mobile__panel.png'), makePng(8, 8, [1, 2, 3]));

  const comparison = {
    schemaVersion: 2,
    generatedAt: '2026-08-08T10:02:00.000Z',
    configPath: 'vision-loop.config.json',
    mode: 'compare',
    summary: { total: 2, blockers: 0, majors: 1, minors: 0, accepted: 1, unverified: 0 },
    comparisons: [
      {
        key,
        severity: 'major',
        acceptedByNumericGate: false,
        acceptedByPerceptualGate: false,
        mismatchRatio: 0.5,
        visualScore: 42.13,
        reason: 'mismatch-above-major',
        referenceRelative: `../reference/${key}.png`,
        currentRelative: `../current/${key}.png`,
        diffRelative: `../diff/${key}.png`,
        regions: [],
        notes: ['Pixel and perceptual metrics are diagnostics.']
      },
      {
        key: keyB,
        severity: 'accepted',
        acceptedByNumericGate: true,
        acceptedByPerceptualGate: true,
        mismatchRatio: 0,
        visualScore: 100,
        reason: 'within-threshold',
        referenceRelative: `../reference/${keyB}.png`,
        currentRelative: `../current/${keyB}.png`,
        diffRelative: `../diff/${keyB}.png`,
        regions: [],
        notes: ['Review semantic hierarchy.']
      }
    ]
  };
  writeJson(path.join(dir, 'reports', 'comparison.json'), comparison);
  return { dir, key, keyB, currentPng, captureMeta };
}

function writeRunSummary(dir) {
  writeJson(path.join(dir, 'reports', 'run-summary.json'), {
    schemaVersion: 2,
    generatedAt: '2026-08-08T10:05:00.000Z',
    configPath: 'vision-loop.config.json',
    mode: 'compare',
    provenance: {
      schemaVersion: 1,
      runId: '20260808100500-abc123def456',
      generatedAt: '2026-08-08T10:05:00.000Z',
      configPath: 'vision-loop.config.json',
      configHash: 'abc123def4567890',
      git: { available: false, commit: null, branch: null, dirty: null },
      environment: { node: 'v22.0.0', platform: 'darwin', arch: 'arm64' }
    },
    quality: { passed: false, score: 61, grade: 'D', confidence: 80, gates: {} },
    sections: {
      capture: { total: 2, failed: 0 },
      comparison: { ok: false, total: 2, blockers: 0, majors: 1, minors: 0, accepted: 1, unverified: 0, averagePerceptualSimilarity: 0.9, averageVisualScore: 71.07, reportHtml: null },
      mobileChecks: { total: 1, failed: 1 },
      baseline: null
    },
    remediation: { total: 1, blockers: 0, majors: 1 },
    automatedGatePassed: false,
    releaseDecision: 'blocked-by-automated-or-semantic-evidence'
  });
}

test('collect — merges pngs, capture metadata, comparison and mobile judgment into one case', async () => {
  const { dir, key, keyB, currentPng, captureMeta } = makeFixture();
  const evidence = await collectEvidence(dir);
  assert.equal(evidence.cases.length, 3);
  assert.equal(evidence.cases[0].key, key); // keys sorted

  const a = evidence.cases[0];
  assert.equal(a.label, 'home');
  assert.equal(a.verdict, 'fail'); // judgment verdict wins and agrees with major severity
  assert.equal(a.severity, 'major'); // comparison severity preserved
  assert.equal(a.findings.length, 1);
  assert.equal(a.findings[0].rule, 'maxEmptyCells');
  assert.ok(a.thumbs, 'thumbs present when any image exists');
  for (const slot of ['reference', 'current', 'diff']) {
    assert.equal(a.thumbs[slot].width, 8, `${slot} thumb decodes`);
    assert.ok(a.thumbs[slot].base64.length > 0);
  }
  assert.ok(a.metrics, 'metrics computed from current png');
  assert.equal(typeof a.metrics.emptyCells, 'number');
  assert.equal(a.metrics.density, 0); // uniform fill has zero gradient density
  assert.equal(typeof a.metrics.harmony, 'string');
  assert.equal(typeof a.metrics.darkShare, 'number');
  assert.equal(a.hashes.captureSha256, captureMeta.screenshotSha256, 'capture hash from schemaVersion-2 metadata');
  assert.equal(a.hashes.metricsSha256, sha256(currentPng), 'metrics source hash recomputed from the very bytes shown');
  assert.equal(a.hashes.captureSha256, a.hashes.metricsSha256);
  assert.equal(a.paths.current, `current/${key}.png`);
  assert.equal(a.paths.judgment, `metadata/${key}.mobile.judgment.json`);

  const b = evidence.cases.find((c) => c.key === keyB);
  assert.equal(b.verdict, 'pass'); // comparison severity 'accepted' maps to pass
  assert.equal(b.severity, 'accepted');
  assert.equal(b.findings.length, 1); // synthesized from comparison notes
  assert.equal(b.thumbs.diff, null); // no diff png for case B
  assert.ok(b.thumbs.current && b.thumbs.reference);

  const orphan = evidence.cases.find((c) => c.key === 'orphan__mobile__panel');
  assert.equal(orphan.verdict, null, 'no verdict source -> null, not a crash');
  assert.equal(orphan.severity, null);
  assert.deepEqual(orphan.findings, []);
  assert.equal(orphan.thumbs.reference, null);
  assert.equal(orphan.thumbs.diff, null);
  assert.ok(orphan.thumbs.current);
  assert.ok(orphan.metrics);
  assert.equal(orphan.hashes.captureSha256, orphan.hashes.metricsSha256, 'hash falls back to the computed source hash');

  assert.equal(evidence.summary.passed, 1);
  assert.equal(evidence.summary.failed, 1);
  assert.equal(evidence.summary.warned, 0);
  assert.equal(evidence.summary.total, 3);
  assert.equal(evidence.platform, 'ios-sim', 'capture-recorded platform preferred');
  assert.equal(evidence.capturedAt, '2026-08-08T10:02:00.000Z', 'falls back to comparison/capture timestamps');
  assert.equal(evidence.configPath, 'vision-loop.config.json', 'configPath falls back to comparison.json');
  assert.equal(evidence.runId, null, 'run-summary absent -> runId null');
  assert.deepEqual(evidence.sections, []);
  assert.equal(evidence.sources.comparisonJson, true);
  assert.equal(evidence.sources.runSummaryJson, false);
});

test('collect — reads run-summary.json when present (runId, quality, sections, provenance)', async () => {
  const { dir } = makeFixture();
  writeRunSummary(dir);
  const evidence = await collectEvidence(dir);
  assert.equal(evidence.runId, '20260808100500-abc123def456');
  assert.equal(evidence.configPath, 'vision-loop.config.json');
  assert.equal(evidence.configHash, 'abc123def4567890');
  assert.equal(evidence.capturedAt, '2026-08-08T10:05:00.000Z');
  assert.equal(evidence.summary.qualityScore, 61);
  assert.equal(evidence.summary.releaseDecision, 'blocked-by-automated-or-semantic-evidence');
  assert.equal(evidence.sources.runSummaryJson, true);
  const byName = Object.fromEntries(evidence.sections.map((s) => [s.name, s]));
  assert.equal(byName.capture.status, 'pass');
  assert.equal(byName.comparison.status, 'fail'); // majors + ok:false -> fail
  assert.equal(byName.mobileChecks.status, 'fail'); // failed > 0
  assert.equal(byName.baseline.status, 'absent'); // null section -> absent, not a crash
  assert.ok(byName.comparison.detail.includes('majors 1'));
});

test('collect — missing output directory is the only throwing input', async () => {
  const missing = path.join(os.tmpdir(), `vee-missing-${process.pid}-${Date.now()}`);
  await assert.rejects(collectEvidence(missing), /not found/);
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'vee-empty-'));
  const evidence = await collectEvidence(empty); // existing but empty must not throw
  assert.deepEqual(evidence.cases, []);
  assert.equal(evidence.summary.total, 0);
});

test('render — self-contained html, doctype, data-case, real hashes, palette, injection neutralized', async () => {
  const { dir, captureMeta } = makeFixture({ label: '<script>alert(1)</script>' });
  writeRunSummary(dir);
  const evidence = await collectEvidence(dir);
  const html = renderEvidenceHtml(evidence);
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('data-case="home__mobile__home"'));
  assert.ok(html.includes(captureMeta.screenshotSha256), 'real screenshotSha256 hash anchor rendered');
  assert.ok(html.includes('shasum -a 256 &lt;file&gt;'), 'verify hint present and escaped');
  assert.ok(html.includes('abc123def4567890'), 'configHash rendered');
  assert.ok(!html.includes('<script>alert(1)</script>'), 'injection neutralized');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'escaped label appears');
  for (const hex of ['#08080A', '#0F0F12', '#E63946', '#EDEDEF', '#8A8A93', '#2ECC71', '#F5A623']) {
    assert.ok(html.includes(hex), `palette color ${hex} present`);
  }
  assert.ok(html.includes('rgba(255,255,255,0.08)'), 'border palette present');
  assert.ok(!/src="http|href="http/.test(html), 'no external resources — opens offline');
  // Minimal evidence must still render.
  const empty = renderEvidenceHtml({ summary: { passed: 0, failed: 0, warned: 0, total: 0 }, sections: [], cases: [] });
  assert.ok(empty.startsWith('<!DOCTYPE html>'));
});

test('escapeHtml — neutralizes markup characters', () => {
  assert.equal(escapeHtml('<script>alert("x")&\'</script>'), '&lt;script&gt;alert(&quot;x&quot;)&amp;&#039;&lt;/script&gt;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(42), '42');
});

test('thumbnail — downscales landscape to maxWidth keeping aspect', () => {
  const thumb = thumbnail(makePng(480, 240));
  assert.ok(thumb);
  assert.ok(thumb.width <= 240);
  assert.equal(thumb.width, 240);
  assert.equal(thumb.height, 120, 'aspect 2:1 preserved');
  const roundTrip = PNG.sync.read(Buffer.from(thumb.base64, 'base64'));
  assert.equal(roundTrip.width, 240);
  assert.equal(roundTrip.height, 120);
});

test('thumbnail — portrait and small images keep dimensions, never upscale', () => {
  const portrait = thumbnail(makePng(240, 480));
  assert.equal(portrait.width, 240);
  assert.equal(portrait.height, 480);
  const small = thumbnail(makePng(120, 60));
  assert.equal(small.width, 120, 'no upscale below maxWidth');
  assert.equal(small.height, 60);
  const widePortrait = thumbnail(makePng(480, 960), { maxWidth: 240 });
  assert.equal(widePortrait.width, 240);
  assert.equal(widePortrait.height, 480, 'portrait aspect preserved');
});

test('thumbnail — garbage, undersized and oversized inputs return null', () => {
  assert.equal(thumbnail(Buffer.from('this is not a png at all')), null);
  assert.equal(thumbnail(Buffer.alloc(0)), null);
  assert.equal(thumbnail('nope'), null);
  assert.equal(thumbnail(null), null);
  const header = Buffer.alloc(24);
  header.writeUInt32BE(0x89504e47, 0); // PNG signature
  header.writeUInt32BE(8000, 16); // width at IHDR offset
  header.writeUInt32BE(5000, 20); // height -> 40MP exceeds the 32MP guard
  assert.equal(thumbnail(header), null, 'oversized sources refused before decode');
});

test('CLI — renders report to default and custom locations', () => {
  const { dir } = makeFixture();
  writeRunSummary(dir);
  const first = spawnSync(process.execPath, [scriptPath, '--output-dir', dir], { encoding: 'utf8' });
  assert.equal(first.status, 0, first.stderr);
  const defaultOut = path.join(dir, 'reports', 'visual-evidence.html');
  assert.ok(fs.existsSync(defaultOut), 'default out written under reports/');
  assert.ok(fs.readFileSync(defaultOut, 'utf8').startsWith('<!DOCTYPE html>'));
  assert.ok(first.stdout.includes('Visual evidence:'));

  const customOut = path.join(dir, 'custom', 'evidence.html');
  const second = spawnSync(process.execPath, [scriptPath, '-o', dir, '--out', customOut], { encoding: 'utf8' });
  assert.equal(second.status, 0, second.stderr);
  assert.ok(fs.existsSync(customOut), '-o alias + --out honored');
});

test('CLI — help exits 0, missing --output-dir exits 1', () => {
  const help = spawnSync(process.execPath, [scriptPath, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage:/);
  const missing = spawnSync(process.execPath, [scriptPath], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.match(missing.stdout, /Usage:/);
});
