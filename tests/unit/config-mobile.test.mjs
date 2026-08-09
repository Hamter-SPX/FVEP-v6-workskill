import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig, validateConfig } from '../../lib/config.mjs';
import { normalizeMaskRectangles } from '../../lib/diff-policy.mjs';

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
    devices: null,
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
    devices: null,
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

test('mobile case masks: w/h aliases normalize identically to width/height (web normalizer)', () => {
  const withMasks = (masks) => normalizeConfig(
    { ...base, mobile: { cases: [{ key: 'home', label: 'Home', masks }] } },
    '/tmp/config.json'
  ).mobile.cases[0].masks;
  const aliased = withMasks([{ x: 1.7, y: 2.2, w: 3.9, h: 4 }]);
  const canonical = withMasks([{ x: 1.7, y: 2.2, width: 3.9, height: 4 }]);
  // The shared normalizer floors coordinates, exactly as on the web path.
  assert.deepEqual(aliased, canonical);
  assert.deepEqual(aliased, [{ x: 1, y: 2, width: 3, height: 4 }]);
});

test('mobile case masks throw identical errors to the web normalizer for the same canonical payload', () => {
  // Canonical {x,y,width,height} payloads must fail identically on both paths:
  // same error class AND same message. (Alias {w,h} payloads are mobile-only
  // input — the web normalizer never sees them — so they are asserted below,
  // not parity-checked.)
  const badPayloads = [
    [{ x: 0, y: 0, width: 0, height: 5 }], // non-positive width → RangeError
    [{ x: 0, y: 0, width: Number.NaN, height: 5 }], // NaN → TypeError
    [{ x: 0, y: 0, height: 5 }], // width missing entirely → TypeError (NaN), same as web
    'not-an-array' // non-array value → TypeError, same canonical message as web
  ];
  for (const payload of badPayloads) {
    let webError = null;
    try { normalizeMaskRectangles(payload); } catch (error) { webError = error; }
    assert.ok(webError, `expected web normalizer to reject ${JSON.stringify(payload)}`);
    assert.throws(
      () => normalizeConfig({ ...base, mobile: { cases: [{ key: 'home', label: 'Home', masks: payload }] } }, '/tmp/config.json'),
      (error) => {
        assert.ok(error instanceof webError.constructor, `expected ${webError.constructor.name}, got ${error.constructor.name} (${error.message})`);
        assert.equal(error.message, webError.message);
        return true;
      }
    );
  }
});

test('mobile case masks: alias payload violations throw after alias pre-mapping', () => {
  // {w:-2} has no width/w parity on web (web ignores aliases): the mobile
  // parser pre-maps w → width and the shared normalizer rejects it as
  // non-positive, matching the canonical {width:-2} failure.
  assert.throws(
    () => normalizeConfig({ ...base, mobile: { cases: [{ key: 'home', label: 'Home', masks: [{ x: 0, y: 0, w: -2, h: 5 }] }] } }, '/tmp/config.json'),
    (error) => {
      assert.ok(error instanceof RangeError);
      assert.match(error.message, /must have positive width and height/);
      return true;
    }
  );
});

test('mobile case masks/regions default to empty arrays', () => {
  const result = normalizeConfig({ ...base, mobile: { cases: [{ key: 'home', label: 'Home' }] } }, '/tmp/config.json');
  assert.deepEqual(result.mobile.cases[0].masks, []);
  assert.deepEqual(result.mobile.cases[0].regions, []);
});

test('mobile block applies defaults when absent or partial', () => {
  const absent = normalizeConfig(base, '/tmp/config.json');
  assert.deepEqual(absent.mobile, { udid: 'booted', serial: 'emulator-5554', adbPath: null, devices: [], cases: [], judge: { thresholds: {} } });
  const partial = normalizeConfig({ ...base, mobile: { udid: 'X' } }, '/tmp/config.json');
  assert.equal(partial.mobile.udid, 'X');
  assert.equal(partial.mobile.serial, 'emulator-5554');
  assert.equal(partial.mobile.adbPath, null);
  assert.deepEqual(partial.mobile.devices, []);
  assert.deepEqual(partial.mobile.cases, []);
  assert.deepEqual(partial.mobile.judge.thresholds, {});
});

test('config without mobile.devices yields mobile.devices === [] (backward compat)', () => {
  const result = validateConfig(normalizeConfig(base, '/tmp/config.json'));
  assert.deepEqual(result.mobile.devices, []);
});

test('mobile.devices as a non-array value (e.g. a bare string) is rejected instead of degrading to all devices', () => {
  // devices: "iphone16" used to silently parse to [], which the fan-out
  // engines read as "every device" — a typo would have erased the matrix.
  for (const devices of ['iphone16', { key: 'iphone16' }, 42]) {
    assert.throws(
      () => normalizeConfig({ ...base, mobile: { devices } }, '/tmp/config.json'),
      (error) => {
        assert.ok(error instanceof TypeError);
        assert.match(error.message, /mobile\.devices must be an array/);
        assert.match(error.message, /iphone16|42/); // names the offending value
        return true;
      }
    );
  }
  // Explicit null stays equivalent to absent (one sentinel for "no matrix").
  assert.deepEqual(normalizeConfig({ ...base, mobile: { devices: null } }, '/tmp/config.json').mobile.devices, []);
  assert.deepEqual(normalizeConfig({ ...base, mobile: { devices: [] } }, '/tmp/config.json').mobile.devices, []);
});

test('mobile.devices parses full rows; platform defaults to ios-sim', () => {
  const result = normalizeConfig({
    ...base,
    mobile: {
      devices: [
        { key: 'iphone16', label: 'iPhone 16', udid: 'ABCD-1234', platform: 'ios-sim' },
        { key: 'pixel6', serial: 'emulator-5554', platform: 'android' },
        { key: 'sim2' } // every optional field defaults
      ]
    }
  }, '/tmp/config.json');
  assert.deepEqual(result.mobile.devices, [
    { key: 'iphone16', label: 'iPhone 16', udid: 'ABCD-1234', serial: null, platform: 'ios-sim' },
    { key: 'pixel6', label: null, udid: null, serial: 'emulator-5554', platform: 'android' },
    { key: 'sim2', label: null, udid: null, serial: null, platform: 'ios-sim' }
  ]);
});

test('mobile.devices platform degrades unknown values to ios-sim (mirrors capture.type)', () => {
  const result = normalizeConfig({ ...base, mobile: { devices: [{ key: 'dev', platform: 'selenium' }] } }, '/tmp/config.json');
  assert.equal(result.mobile.devices[0].platform, 'ios-sim');
});

test('mobile case devices parses to a string array; absent parses to null', () => {
  const result = normalizeConfig({
    ...base,
    mobile: {
      devices: [{ key: 'iphone16' }, { key: 'pixel6' }],
      cases: [
        { key: 'home', label: 'Home', devices: ['iphone16', 42] },
        { key: 'chat', label: 'Chat' }
      ]
    }
  }, '/tmp/config.json');
  assert.deepEqual(result.mobile.cases[0].devices, ['iphone16', '42']);
  assert.equal(result.mobile.cases[1].devices, null);
});

test('mobile case devices: explicit empty array normalizes to null (= every device)', () => {
  // Absent and [] must share ONE meaning (run on every device) so downstream
  // fan-out logic has a single null check instead of two sentinel spellings.
  const result = normalizeConfig({
    ...base,
    mobile: {
      devices: [{ key: 'iphone16' }],
      cases: [{ key: 'home', label: 'Home', devices: [] }]
    }
  }, '/tmp/config.json');
  assert.equal(result.mobile.cases[0].devices, null);
});

test('duplicate mobile device keys are rejected', () => {
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      mobile: { devices: [{ key: 'iphone16' }, { key: 'iphone16' }] }
    }, '/tmp/config.json')),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /Duplicate mobile device key: iphone16/);
      return true;
    }
  );
});

test('case.devices referencing an unknown device key is rejected and names the key', () => {
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      mobile: {
        devices: [{ key: 'iphone16' }],
        cases: [{ key: 'home', label: 'Home', devices: ['iphone16', 'ghost'] }]
      }
    }, '/tmp/config.json')),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /unknown device key: ghost/);
      return true;
    }
  );
});

test('device matrix + per-case udid/serial endpoint override is rejected (endpoint belongs on the device rows)', () => {
  // With a matrix the artifact identity is per-device (label__device__key)
  // while a per-case udid/serial would force every device row to capture from
  // the case's single endpoint — identity vs capture-endpoint mismatch. This
  // must fail loudly at validation instead of mislabeling evidence.
  const attempt = (mobileCase) => () => validateConfig(normalizeConfig({
    ...base,
    capture: { type: 'ios-sim' },
    mobile: {
      devices: [{ key: 'iphone16', udid: 'DEVICE-UDID-1' }, { key: 'pixel6', serial: 'emulator-5554', platform: 'android' }],
      cases: [mobileCase]
    }
  }, '/tmp/config.json'));
  for (const mobileCase of [
    { key: 'home', label: 'Home', udid: 'CASE-UDID' }, // fans out to every device
    { key: 'home', label: 'Home', serial: 'emulator-9999', devices: ['pixel6'] } // subset fan-out
  ]) {
    assert.throws(attempt(mobileCase), (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /Mobile case "home"/); // names the offending case
      assert.match(error.message, /per-case udid\/serial/);
      assert.match(error.message, /device rows/); // points at the fix
      return true;
    });
  }
});

test('device matrix with endpoints only on device rows validates cleanly', () => {
  const config = validateConfig(normalizeConfig({
    ...base,
    capture: { type: 'ios-sim' },
    mobile: {
      devices: [{ key: 'iphone16', udid: 'DEVICE-UDID-1' }, { key: 'pixel6', serial: 'emulator-5554', platform: 'android' }],
      cases: [{ key: 'home', label: 'Home', devices: ['iphone16'] }, { key: 'chat', label: 'Chat' }]
    }
  }, '/tmp/config.json'));
  assert.equal(config.mobile.devices.length, 2);
});

test('per-case udid/serial override WITHOUT a device matrix stays valid (back-compat)', () => {
  const config = validateConfig(normalizeConfig({
    ...base,
    capture: { type: 'ios-sim' },
    mobile: { cases: [{ key: 'home', label: 'Home', udid: 'CASE-UDID' }] }
  }, '/tmp/config.json'));
  assert.equal(config.mobile.cases[0].udid, 'CASE-UDID');
  assert.deepEqual(config.mobile.devices, []);
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

test('mobile case label containing the "__" identity separator is rejected', () => {
  // The joined comparison key splits on "__" — a separator inside a segment
  // yields ≥4 parts and silently bypasses the evidence join (real card loses
  // its verdict, phantom fail card appears).
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      capture: { type: 'ios-sim' },
      mobile: { cases: [{ key: 'home', label: 'Home__Page' }] }
    }, '/tmp/config.json')),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /case label "Home__Page"/); // names field + value
      assert.match(error.message, /identity separator/); // names why
      assert.match(error.message, /different character/); // names the fix
      return true;
    }
  );
});

test('mobile case key containing the "__" identity separator is rejected', () => {
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      capture: { type: 'ios-sim' },
      mobile: { cases: [{ key: 'home__v2', label: 'Home' }] }
    }, '/tmp/config.json')),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /case key "home__v2"/);
      assert.match(error.message, /identity separator/);
      return true;
    }
  );
});

test('mobile case key with "__" and no label is rejected via the resolved label too', () => {
  // The label defaults to the case key at parse time, so the reservation must
  // not be skippable by leaving the label out — whichever segment is checked
  // first, the config must fail loudly.
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      capture: { type: 'ios-sim' },
      mobile: { cases: [{ key: 'home__v2' }] }
    }, '/tmp/config.json')),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /home__v2/);
      assert.match(error.message, /identity separator/);
      return true;
    }
  );
});

test('mobile device key containing the "__" identity separator is rejected', () => {
  assert.throws(
    () => validateConfig(normalizeConfig({
      ...base,
      capture: { type: 'ios-sim' },
      mobile: {
        devices: [{ key: 'my__phone__x' }],
        cases: [{ key: 'home', label: 'Home' }]
      }
    }, '/tmp/config.json')),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /device key "my__phone__x"/);
      assert.match(error.message, /identity separator/);
      return true;
    }
  );
});

test('mobile identities without the separator (single underscores, hyphens, unicode labels) stay valid', () => {
  const config = validateConfig(normalizeConfig({
    ...base,
    capture: { type: 'ios-sim' },
    mobile: {
      devices: [{ key: 'iphone_16' }, { key: 'pixel-6', platform: 'android' }],
      cases: [{ key: 'home_screen', label: 'หน้า Home' }]
    }
  }, '/tmp/config.json'));
  assert.equal(config.mobile.devices.length, 2);
  assert.equal(config.mobile.cases.length, 1);
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
