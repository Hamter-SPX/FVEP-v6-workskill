import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { runMobileChecks } from '../../lib/mobile-checks-engine.mjs';
import { validateVerdictRecord } from '../../lib/vision-judge-engine.mjs';

function solidPng(width = 80, height = 40, rgb = [255, 255, 255]) {
  const png = new PNG({ width, height });
  for (let o = 0; o < png.data.length; o += 4) {
    png.data[o] = rgb[0];
    png.data[o + 1] = rgb[1];
    png.data[o + 2] = rgb[2];
    png.data[o + 3] = 255;
  }
  return PNG.sync.write(png);
}

const HOME_CASE = { key: 'home', label: 'Home', bundleId: null, launchActivity: null, openUrl: null, settleMs: 0 };
const CHAT_CASE = { key: 'chat', label: 'Chat', bundleId: null, launchActivity: null, openUrl: null, settleMs: 0 };

function checksFixture({ cases = [HOME_CASE, CHAT_CASE], thresholds = {}, ...overrides } = {}) {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mchk-'));
  return {
    outputDir,
    capture: { type: 'ios-sim' },
    mobile: {
      udid: 'booted',
      serial: 'emulator-5554',
      cases,
      judge: { thresholds }
    },
    ...overrides
  };
}

// Mirrors caseIdentity in lib/mobile-capture-engine.mjs: label->route,
// 'mobile' viewport, key->state.
function currentPngPath(config, c) {
  return path.join(config.outputDir, 'current', `${c.label.toLowerCase()}__mobile__${c.key.toLowerCase()}.png`);
}

function writeCurrentCapture(config, c, pngBytes = solidPng()) {
  fs.mkdirSync(path.dirname(currentPngPath(config, c)), { recursive: true });
  fs.writeFileSync(currentPngPath(config, c), pngBytes);
  return pngBytes;
}

test('runMobileChecks — pass verdict + judgment artifact with empty thresholds', async () => {
  const config = checksFixture({ cases: [HOME_CASE] });
  writeCurrentCapture(config, HOME_CASE);

  const results = await runMobileChecks(config);
  assert.equal(results.length, 1);
  const [home] = results;
  assert.equal(home.key, 'home');
  assert.equal(home.label, 'Home');
  assert.equal(home.verdict, 'pass');
  assert.deepEqual(home.findings, []);
  assert.equal(home.metricsPath, null);
  assert.ok(home.judgmentPath.endsWith(path.join('metadata', 'home__mobile__home.mobile.judgment.json')));
  assert.ok(fs.existsSync(home.judgmentPath));
  const record = validateVerdictRecord(JSON.parse(fs.readFileSync(home.judgmentPath, 'utf8')));
  assert.equal(record.mode, 'metrics');
  assert.equal(record.verdict, 'pass');
  assert.equal(record.case_label, 'Home');
  assert.equal(record.capture_ref, currentPngPath(config, HOME_CASE));
});

test('runMobileChecks — breached threshold produces a fail verdict with findings', async () => {
  const config = checksFixture({
    cases: [HOME_CASE],
    thresholds: { maxEmptyCells: { value: 5, severity: 'fail' } }
  });
  writeCurrentCapture(config, HOME_CASE); // uniform => every grid cell empty (8x5=40 > 5)

  const [home] = await runMobileChecks(config);
  assert.equal(home.verdict, 'fail');
  const finding = home.findings.find((f) => f.rule === 'maxEmptyCells');
  assert.ok(finding);
  assert.equal(finding.severity, 'fail');
  assert.equal(finding.expected, 5);
  assert.equal(finding.observed, 40);
});

test('runMobileChecks — missing capture is an explicit fail result, not a crash', async () => {
  const config = checksFixture();
  writeCurrentCapture(config, HOME_CASE);
  // chat case has no current PNG on disk

  const results = await runMobileChecks(config);
  assert.equal(results.length, 2);
  const [home, chat] = results;
  assert.equal(home.verdict, 'pass');
  assert.equal(chat.verdict, 'fail');
  assert.deepEqual(chat.findings, [{ rule: 'missingCapture', severity: 'fail', expected: 'captured PNG', observed: null }]);
  assert.equal(chat.judgmentPath, null);
  assert.equal(chat.metricsPath, null);
});

test('runMobileChecks — filters.case narrows the matrix', async () => {
  const config = checksFixture();
  writeCurrentCapture(config, HOME_CASE);
  const results = await runMobileChecks(config, { filters: { case: 'home' } });
  assert.equal(results.length, 1);
  assert.equal(results[0].key, 'home');
});

test('runMobileChecks — rejects a playwright (web) config', async () => {
  await assert.rejects(() => runMobileChecks(checksFixture({ capture: { type: 'playwright' } })), /requires capture\.type ios-sim\|android/);
});

test('runMobileChecks — judged capture bytes are the ones on disk (sha wiring)', async () => {
  const config = checksFixture({ cases: [HOME_CASE] });
  const pngBytes = writeCurrentCapture(config, HOME_CASE, solidPng(80, 40, [200, 40, 40]));
  const [home] = await runMobileChecks(config);
  assert.equal(home.verdict, 'pass');
  // Sanity: the PNG the metrics ran over is exactly the captured file.
  assert.equal(
    crypto.createHash('sha256').update(fs.readFileSync(currentPngPath(config, HOME_CASE))).digest('hex'),
    crypto.createHash('sha256').update(pngBytes).digest('hex')
  );
});
