import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig } from '../../lib/config.mjs';

const base = { routes: [{ name: 'home', path: '/' }] };

test('capture.type defaults to playwright when not configured', () => {
  const result = normalizeConfig(base, '/tmp/config.json');
  assert.equal(result.capture.type, 'playwright');
});

test('capture.type ios-sim is honored', () => {
  const result = normalizeConfig({ ...base, capture: { type: 'ios-sim' } }, '/tmp/config.json');
  assert.equal(result.capture.type, 'ios-sim');
});

test('capture.type android is honored (driver ships in a follow-up task)', () => {
  const result = normalizeConfig({ ...base, capture: { type: 'android' } }, '/tmp/config.json');
  assert.equal(result.capture.type, 'android');
});

test('unknown capture.type falls back to playwright', () => {
  const result = normalizeConfig({ ...base, capture: { type: 'selenium' } }, '/tmp/config.json');
  assert.equal(result.capture.type, 'playwright');
});

test('mobile block parses cases with defaults and per-case overrides', () => {
  const result = normalizeConfig({
    ...base,
    mobile: {
      udid: 'ABCD-1234',
      serial: 'emulator-5556',
      cases: [
        { key: 'home', label: 'Home', bundleId: 'com.example.app', openUrl: 'app://home', settleMs: 1500, udid: 'OVERRIDE-1', serial: 'emulator-5558' },
        { label: 'Chat' } // key falls back to label; everything else defaults
      ]
    }
  }, '/tmp/config.json');
  assert.equal(result.mobile.udid, 'ABCD-1234');
  assert.equal(result.mobile.serial, 'emulator-5556');
  assert.equal(result.mobile.cases.length, 2);
  assert.deepEqual(result.mobile.cases[0], {
    key: 'home',
    label: 'Home',
    bundleId: 'com.example.app',
    launchActivity: null,
    openUrl: 'app://home',
    settleMs: 1500,
    udid: 'OVERRIDE-1',
    serial: 'emulator-5558'
  });
  assert.deepEqual(result.mobile.cases[1], {
    key: 'Chat',
    label: 'Chat',
    bundleId: null,
    launchActivity: null,
    openUrl: null,
    settleMs: 1000,
    udid: null,
    serial: null
  });
});

test('mobile block applies defaults when absent or partial', () => {
  const absent = normalizeConfig(base, '/tmp/config.json');
  assert.deepEqual(absent.mobile, { udid: 'booted', serial: 'emulator-5554', cases: [], judge: { thresholds: {} } });
  const partial = normalizeConfig({ ...base, mobile: { udid: 'X' } }, '/tmp/config.json');
  assert.equal(partial.mobile.udid, 'X');
  assert.equal(partial.mobile.serial, 'emulator-5554');
  assert.deepEqual(partial.mobile.cases, []);
  assert.deepEqual(partial.mobile.judge.thresholds, {});
});

test('mobile.judge.thresholds is preserved and defensively cloned', () => {
  const input = { ...base, mobile: { judge: { thresholds: { maxEmptyCells: { value: 6, severity: 'warn' } } } } };
  const result = normalizeConfig(input, '/tmp/config.json');
  assert.deepEqual(result.mobile.judge.thresholds, { maxEmptyCells: { value: 6, severity: 'warn' } });
  input.mobile.judge.thresholds.maxEmptyCells.value = 999;
  assert.equal(result.mobile.judge.thresholds.maxEmptyCells.value, 6);
});

test('other capture fields keep their existing defaults alongside capture.type', () => {
  const result = normalizeConfig({ ...base, capture: { type: 'ios-sim' } }, '/tmp/config.json');
  assert.equal(result.capture.fullPage, true);
  assert.equal(result.capture.animations, 'disabled');
  assert.equal(result.capture.waitUntil, 'domcontentloaded');
  assert.equal(result.capture.settleMs, 250);
});
