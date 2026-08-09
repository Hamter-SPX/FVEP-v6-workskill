import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig, validateConfig } from '../../lib/config.mjs';

const base = { routes: [{ name: 'home', path: '/' }] };

test('capture.type key is absent when not configured (consumers default to playwright)', () => {
  const result = normalizeConfig(base, '/tmp/config.json');
  assert.equal(result.capture.type, undefined);
  assert.ok(!Object.hasOwn(result.capture, 'type'));
});

test('capture.type ios-sim is honored', () => {
  const result = normalizeConfig({ ...base, capture: { type: 'ios-sim' } }, '/tmp/config.json');
  assert.equal(result.capture.type, 'ios-sim');
});

test('capture.type android is honored', () => {
  const result = normalizeConfig({ ...base, capture: { type: 'android' } }, '/tmp/config.json');
  assert.equal(result.capture.type, 'android');
});

test('unknown capture.type is dropped (consumers default to playwright)', () => {
  const result = normalizeConfig({ ...base, capture: { type: 'selenium' } }, '/tmp/config.json');
  assert.equal(result.capture.type, undefined);
  assert.ok(!Object.hasOwn(result.capture, 'type'));
});

test('config without explicit capture.type stays provenance-stable (no capture.type key in parsed config)', () => {
  const result = normalizeConfig(base, '/tmp/config.json');
  assert.ok(!('type' in result.capture));
  const serialized = JSON.parse(JSON.stringify(result));
  assert.ok(!('type' in serialized.capture));
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
    serial: 'emulator-5558',
    masks: [],
    regions: []
  });
  assert.deepEqual(result.mobile.cases[1], {
    key: 'Chat',
    label: 'Chat',
    bundleId: null,
    launchActivity: null,
    openUrl: null,
    settleMs: 1000,
    udid: null,
    serial: null,
    masks: [],
    regions: []
  });
});

test('mobile case masks parse to PNG-space rectangles (w/h aliases accepted) and regions pass through', () => {
  const result = normalizeConfig({
    ...base,
    mobile: {
      cases: [{
        key: 'home',
        label: 'Home',
        masks: [{ x: 4, y: 8, width: 40, height: 12 }, { x: 1, y: 2, w: 3, h: 5 }],
        regions: [{ name: 'hero', selector: '#hero' }]
      }]
    }
  }, '/tmp/config.json');
  assert.deepEqual(result.mobile.cases[0].masks, [
    { x: 4, y: 8, width: 40, height: 12 },
    { x: 1, y: 2, width: 3, height: 5 }
  ]);
  assert.deepEqual(result.mobile.cases[0].regions, [{ name: 'hero', selector: '#hero' }]);
});

test('mobile case masks/regions default to empty arrays', () => {
  const result = normalizeConfig({ ...base, mobile: { cases: [{ key: 'home', label: 'Home' }] } }, '/tmp/config.json');
  assert.deepEqual(result.mobile.cases[0].masks, []);
  assert.deepEqual(result.mobile.cases[0].regions, []);
});

test('mobile block applies defaults when absent or partial', () => {
  const absent = normalizeConfig(base, '/tmp/config.json');
  assert.deepEqual(absent.mobile, { udid: 'booted', serial: 'emulator-5554', adbPath: null, cases: [], judge: { thresholds: {} } });
  const partial = normalizeConfig({ ...base, mobile: { udid: 'X' } }, '/tmp/config.json');
  assert.equal(partial.mobile.udid, 'X');
  assert.equal(partial.mobile.serial, 'emulator-5554');
  assert.equal(partial.mobile.adbPath, null);
  assert.deepEqual(partial.mobile.cases, []);
  assert.deepEqual(partial.mobile.judge.thresholds, {});
});

test('mobile.adbPath is honored when configured', () => {
  const result = normalizeConfig({ ...base, mobile: { adbPath: '/custom/sdk/platform-tools/adb' } }, '/tmp/config.json');
  assert.equal(result.mobile.adbPath, '/custom/sdk/platform-tools/adb');
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

test('duplicate mobile-case artifact identities are rejected (safeSegment collapse)', () => {
  // safeSegment('My Case') === safeSegment('my-case') → both cases map to the
  // same artifact path 'my-case__mobile__home' and would overwrite each other.
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      capture: { type: 'ios-sim' },
      mobile: { cases: [{ key: 'home', label: 'My Case' }, { key: 'home', label: 'my-case' }] }
    }, '/tmp/config.json')),
    (error) => {
      assert.match(error.message, /Duplicate mobile case artifact identity/);
      assert.match(error.message, /my-case__mobile__home/); // names the colliding identity
      return true;
    }
  );
});

test('mobile capture type with empty mobile.cases is rejected', () => {
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      capture: { type: 'ios-sim' },
      mobile: { cases: [] }
    }, '/tmp/config.json')),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /At least one mobile case \(mobile\.cases\) is required/);
      return true;
    }
  );
});

test('playwright config with empty mobile.cases stays valid (back-compat)', () => {
  const web = validateConfig(normalizeConfig({ ...base, mobile: { cases: [] } }, '/tmp/config.json'));
  assert.equal(web.mobile.cases.length, 0);
  assert.equal(web.capture.type, undefined);
});
