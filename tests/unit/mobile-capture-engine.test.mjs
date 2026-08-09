import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildSimctlScreenshotArgs,
  buildSimctlLaunchArgs,
  buildSimctlOpenUrlArgs,
  captureSimulatorScreenshot,
  captureAllMobile,
  mobileCaseRuns,
  metaPathFor
} from '../../lib/mobile-capture-engine.mjs';

function fakePngBytes(width = 8, height = 4) {
  // PNG signature + IHDR with big-endian width/height (content pixels irrelevant for meta)
  const buf = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8); // IHDR length
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

test('buildSimctlScreenshotArgs — default booted', () => {
  assert.deepEqual(buildSimctlScreenshotArgs('/tmp/a.png'), ['simctl', 'io', 'booted', 'screenshot', '/tmp/a.png']);
});

test('buildSimctlScreenshotArgs — explicit udid + requires out', () => {
  assert.deepEqual(buildSimctlScreenshotArgs('o.png', { udid: 'UDID-1' }), ['simctl', 'io', 'UDID-1', 'screenshot', 'o.png']);
  assert.throws(() => buildSimctlScreenshotArgs(''), TypeError);
});

test('buildSimctlLaunchArgs / buildSimctlOpenUrlArgs', () => {
  assert.deepEqual(buildSimctlLaunchArgs('com.helos.app.helosMobile'), ['simctl', 'launch', 'booted', 'com.helos.app.helosMobile']);
  assert.deepEqual(buildSimctlOpenUrlArgs('helos://chat/1', { udid: 'X' }), ['simctl', 'openurl', 'X', 'helos://chat/1']);
  assert.throws(() => buildSimctlLaunchArgs(''), TypeError);
  assert.throws(() => buildSimctlOpenUrlArgs(null), TypeError);
});

test('captureSimulatorScreenshot — happy path writes png + sidecar meta', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const calls = [];
  const exec = (cmd, args) => {
    calls.push([cmd, ...args]);
    if (args[1] === 'io') fs.writeFileSync(out, fakePngBytes(1170, 2532));
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureSimulatorScreenshot({
    out, label: 'chat', udid: 'booted',
    launchBundleId: 'com.helos.app.helosMobile', settleMs: 5, exec, sleep: () => {}
  });
  assert.equal(meta.platform, 'ios-simulator');
  assert.equal(meta.label, 'chat');
  assert.deepEqual(meta.png, { width: 1170, height: 2532 });
  assert.equal(meta.launch_bundle_id, 'com.helos.app.helosMobile');
  assert.equal(fs.existsSync(metaPathFor(out)), true);
  const onDisk = JSON.parse(fs.readFileSync(metaPathFor(out), 'utf8'));
  assert.equal(onDisk.udid, 'booted');
  // launch happened before screenshot
  assert.deepEqual(calls[0].slice(1, 3), ['simctl', 'launch']);
  assert.deepEqual(calls[1].slice(1, 3), ['simctl', 'io']);
});

test('captureSimulatorScreenshot — simctl failure throws with stderr tail', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const exec = () => ({ status: 1, stdout: '', stderr: 'xcrun: error: Unable to boot device' });
  assert.throws(
    () => captureSimulatorScreenshot({ out, exec, sleep: () => {} }),
    /Unable to boot device/
  );
});

test('captureSimulatorScreenshot — platform android delegates to the adb adapter', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const png = fakePngBytes(1176, 2400);
  const calls = [];
  const exec = (cmd, args) => {
    calls.push([cmd, ...args]);
    if (args.join(' ').includes('exec-out screencap')) return { status: 0, stdout: png, stderr: '' };
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureSimulatorScreenshot({ out, platform: 'android', serial: 'emulator-5554', exec, sleep: () => {} });
  assert.equal(meta.platform, 'android');
  assert.equal(meta.serial, 'emulator-5554');
  assert.equal(meta.png.width, 1176);
  assert.equal(fs.existsSync(metaPathFor(out)), true);
  assert.ok(calls.some((c) => c.join(' ').includes('exec-out screencap')));
});

test('captureSimulatorScreenshot — unsupported platform is rejected', () => {
  assert.throws(
    () => captureSimulatorScreenshot({ out: '/tmp/x.png', platform: 'harmonyos', exec: () => ({ status: 0 }), sleep: () => {} }),
    TypeError
  );
});

test('captureSimulatorScreenshot — empty output file is an error', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const exec = (cmd, args) => {
    if (args[1] === 'io') fs.writeFileSync(out, Buffer.alloc(0));
    return { status: 0, stdout: '', stderr: '' };
  };
  assert.throws(
    () => captureSimulatorScreenshot({ out, exec, sleep: () => {} }),
    /non-empty file/
  );
});

test('metaPathFor — suffix mapping never returns the input path itself', () => {
  assert.equal(metaPathFor('/tmp/a.png'), '/tmp/a.meta.json');
  assert.equal(metaPathFor('/tmp/a.PNG'), '/tmp/a.meta.json');
  assert.equal(metaPathFor('/tmp/a'), '/tmp/a.meta.json');
});

test('captureSimulatorScreenshot — suffix-less out writes <out>.meta.json without clobbering the PNG', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur'); // deliberately no .png suffix
  const pngBytes = fakePngBytes(1170, 2532);
  const exec = (cmd, args) => {
    if (args[1] === 'io') fs.writeFileSync(out, pngBytes);
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureSimulatorScreenshot({ out, exec, sleep: () => {} });
  assert.equal(metaPathFor(out), `${out}.meta.json`);
  assert.equal(fs.existsSync(`${out}.meta.json`), true);
  assert.equal(meta.file, out);
  // The captured PNG itself must remain byte-identical (meta must not clobber it).
  assert.deepEqual(fs.readFileSync(out), pngBytes);
});

test('captureSimulatorScreenshot — meta carries web-convention sha fields', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-'));
  const out = path.join(dir, 'cur.png');
  const png = fakePngBytes(8, 4);
  const exec = (cmd, args) => {
    if (args[1] === 'io') fs.writeFileSync(out, png);
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureSimulatorScreenshot({ out, exec, sleep: () => {} });
  const expected = crypto.createHash('sha256').update(png).digest('hex');
  assert.equal(meta.screenshotSha256, expected);
  assert.equal(meta.screenshotBytes, png.length);
  const onDisk = JSON.parse(fs.readFileSync(metaPathFor(out), 'utf8'));
  assert.equal(onDisk.screenshotSha256, expected);
});

function mobileFixture(overrides = {}) {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-matrix-'));
  return {
    outputDir,
    capture: { type: 'ios-sim' },
    mobile: {
      udid: 'booted',
      serial: 'emulator-5554',
      cases: [
        { key: 'home', label: 'Home', bundleId: 'com.example.app', launchActivity: null, openUrl: null, settleMs: 5, udid: null, serial: null },
        { key: 'chat', label: 'Chat', bundleId: null, launchActivity: null, openUrl: 'app://chat/1', settleMs: 0, udid: 'DEVICE-2', serial: null }
      ],
      judge: { thresholds: {} }
    },
    ...overrides
  };
}

// Simulates `xcrun simctl`: every `io ... screenshot <out>` call materializes
// a fake PNG at the requested out path.
function fakeSimctlExec(calls) {
  return (cmd, args) => {
    calls.push([cmd, ...args]);
    if (args[1] === 'io') fs.writeFileSync(args[4], fakePngBytes(1170, 2532));
    return { status: 0, stdout: '', stderr: '' };
  };
}

test('captureAllMobile — matrix over mobile.cases writes png + schemaVersion-2 metadata per case', async () => {
  const config = mobileFixture();
  const calls = [];
  const results = await captureAllMobile(config, { exec: fakeSimctlExec(calls), sleep: () => {} });
  assert.equal(results.length, 2);
  for (const result of results) {
    assert.equal(result.ok, true);
    assert.equal(result.regionCount, 0);
    assert.equal(result.unresolvedRequiredRegionCount, 0);
    assert.ok(fs.existsSync(result.screenshotPath));
    assert.equal(path.resolve(config.outputDir, result.relativeScreenshot), result.screenshotPath);
    // Driver sidecar is folded into the matrix metadata, not left on disk.
    assert.equal(fs.existsSync(metaPathFor(result.screenshotPath)), false);
    const metadata = JSON.parse(fs.readFileSync(result.metadataPath, 'utf8'));
    assert.equal(metadata.schemaVersion, 2);
    assert.equal(metadata.mode, 'current');
    assert.equal(metadata.platform, 'ios-sim');
    assert.equal(metadata.state, null);
    assert.deepEqual(metadata.viewport, { width: 1170, height: 2532 });
    assert.equal(metadata.screenshotPath, result.screenshotPath);
    const pngBytes = fs.readFileSync(result.screenshotPath);
    assert.equal(metadata.screenshotSha256, crypto.createHash('sha256').update(pngBytes).digest('hex'));
    assert.equal(metadata.screenshotBytes, pngBytes.length);
    assert.equal(metadata.mobile.platform, 'ios-simulator');
    assert.equal(metadata.mobile.screenshotSha256, metadata.screenshotSha256);
  }
  const [home, chat] = results;
  assert.equal(JSON.parse(fs.readFileSync(home.metadataPath, 'utf8')).key, 'home');
  assert.equal(JSON.parse(fs.readFileSync(chat.metadataPath, 'utf8')).route, 'Chat');
  // Case identity rides the web artifact layout: label->route, 'mobile' viewport, key->state.
  assert.match(home.screenshotPath, /current[/\\]home__mobile__home\.png$/);
  assert.match(chat.metadataPath, /metadata[/\\]chat__mobile__chat\.current\.capture\.json$/);
  // bundleId launches before the screenshot; openurl precedes the chat capture;
  // the per-case udid override reaches the driver.
  assert.deepEqual(calls[0].slice(1), ['simctl', 'launch', 'booted', 'com.example.app']);
  assert.deepEqual(calls[1].slice(1, 4), ['simctl', 'io', 'booted']);
  assert.deepEqual(calls[2].slice(1), ['simctl', 'openurl', 'DEVICE-2', 'app://chat/1']);
  assert.deepEqual(calls[3].slice(1, 4), ['simctl', 'io', 'DEVICE-2']);
});

test('captureAllMobile — mode reference writes into the reference tree', async () => {
  const config = mobileFixture();
  const calls = [];
  const results = await captureAllMobile(config, { mode: 'reference', exec: fakeSimctlExec(calls), sleep: () => {} });
  assert.equal(results.length, 2);
  assert.match(results[0].screenshotPath, /reference[/\\]home__mobile__home\.png$/);
  const metadata = JSON.parse(fs.readFileSync(results[0].metadataPath, 'utf8'));
  assert.equal(metadata.mode, 'reference');
  assert.match(results[0].metadataPath, /metadata[/\\]home__mobile__home\.reference\.capture\.json$/);
});

test('captureAllMobile — filters.case and filters.route narrow the matrix', async () => {
  const config = mobileFixture();
  const calls = [];
  const byCase = await captureAllMobile(config, { filters: { case: 'chat' }, exec: fakeSimctlExec(calls), sleep: () => {} });
  assert.equal(byCase.length, 1);
  assert.match(byCase[0].screenshotPath, /chat__mobile__chat\.png$/);
  assert.equal(fs.existsSync(path.join(config.outputDir, 'current', 'home__mobile__home.png')), false);
  calls.length = 0;
  const byRoute = await captureAllMobile(config, { filters: { route: 'Home' }, exec: fakeSimctlExec(calls), sleep: () => {} });
  assert.equal(byRoute.length, 1);
  assert.match(byRoute[0].screenshotPath, /home__mobile__home\.png$/);
});

test('captureAllMobile — rejects capture.type playwright (web path)', async () => {
  await assert.rejects(
    () => captureAllMobile(mobileFixture({ capture: { type: 'playwright' } }), { exec: () => {}, sleep: () => {} }),
    /requires capture\.type ios-sim\|android/
  );
});

// Simulates `adb`: `exec-out screencap` returns a fake PNG via stdout.
function fakeAdbExec(calls, png = fakePngBytes(1176, 2400)) {
  return (cmd, args) => {
    calls.push([cmd, ...args]);
    if (args.join(' ').includes('exec-out screencap')) return { status: 0, stdout: png, stderr: '' };
    return { status: 0, stdout: '', stderr: '' };
  };
}

test('captureAllMobile — android matrix delegates to the adb adapter per case', async () => {
  const config = mobileFixture({ capture: { type: 'android' } });
  config.mobile.adbPath = '/custom/sdk/platform-tools/adb';
  config.mobile.cases[0].launchActivity = 'com.example.app/.MainActivity';
  config.mobile.cases[1].serial = 'emulator-5556';
  const calls = [];
  const results = await captureAllMobile(config, { exec: fakeAdbExec(calls), sleep: () => {} });
  assert.equal(results.length, 2);
  for (const result of results) {
    assert.equal(result.ok, true);
    assert.ok(fs.existsSync(result.screenshotPath));
    const metadata = JSON.parse(fs.readFileSync(result.metadataPath, 'utf8'));
    assert.equal(metadata.schemaVersion, 2);
    assert.equal(metadata.platform, 'android');
    assert.deepEqual(metadata.viewport, { width: 1176, height: 2400 });
    assert.equal(metadata.mobile.platform, 'android');
    const pngBytes = fs.readFileSync(result.screenshotPath);
    assert.equal(metadata.screenshotSha256, crypto.createHash('sha256').update(pngBytes).digest('hex'));
  }
  const [home, chat] = results;
  assert.equal(JSON.parse(fs.readFileSync(home.metadataPath, 'utf8')).mobile.serial, 'emulator-5554');
  assert.equal(JSON.parse(fs.readFileSync(chat.metadataPath, 'utf8')).mobile.serial, 'emulator-5556');
  // home: launchActivity (am start -n) precedes its screencap; serial/-s reaches adb.
  assert.deepEqual(calls[0].slice(1), ['-s', 'emulator-5554', 'shell', 'am', 'start', '-n', 'com.example.app/.MainActivity']);
  // chat: openUrl (am start VIEW -d) precedes its screencap, on the per-case serial.
  assert.deepEqual(calls[2].slice(1), ['-s', 'emulator-5556', 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'app://chat/1']);
  // Exact exec-out argv pin: trailing -p forces PNG (raw RGBA regression guard).
  assert.deepEqual(calls[1].slice(1), ['-s', 'emulator-5554', 'exec-out', 'screencap', '-p']);
  assert.deepEqual(calls[3].slice(1), ['-s', 'emulator-5556', 'exec-out', 'screencap', '-p']);
  // mobile.adbPath threads through to every adb invocation.
  for (const call of calls) assert.equal(call[0], '/custom/sdk/platform-tools/adb');
});

// Device-matrix fixture: one ios-sim device + one android device, two cases.
function matrixFixture(overrides = {}) {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mce-fanout-'));
  return {
    outputDir,
    capture: { type: 'ios-sim' },
    mobile: {
      udid: 'booted',
      serial: 'emulator-5554',
      devices: [
        { key: 'iphone16', label: 'iPhone 16', udid: 'UDID-IPHONE16', serial: null, platform: 'ios-sim' },
        { key: 'pixel6', label: 'Pixel 6', udid: null, serial: 'emulator-5556', platform: 'android' }
      ],
      cases: [
        { key: 'home', label: 'Home', bundleId: 'com.example.app', launchActivity: 'com.example.app/.MainActivity', openUrl: null, settleMs: 0, udid: null, serial: null, devices: null },
        { key: 'chat', label: 'Chat', bundleId: null, launchActivity: null, openUrl: 'app://chat/1', settleMs: 0, udid: null, serial: null, devices: null }
      ],
      judge: { thresholds: {} }
    },
    ...overrides
  };
}

// Mixed-driver fake: answers both `xcrun simctl` and `adb` invocations.
function fakeMatrixExec(calls) {
  return (cmd, args) => {
    calls.push([cmd, ...args]);
    if (args[0] === 'simctl' && args[1] === 'io') fs.writeFileSync(args[4], fakePngBytes(1170, 2532));
    if (args.join(' ').includes('exec-out screencap')) return { status: 0, stdout: fakePngBytes(1176, 2400), stderr: '' };
    return { status: 0, stdout: '', stderr: '' };
  };
}

test('mobileCaseRuns — no-devices config yields the legacy single identity (cases × [null])', () => {
  const runs = mobileCaseRuns(mobileFixture());
  assert.equal(runs.length, 2);
  assert.deepEqual(runs.map((r) => r.identity), [
    { routeName: 'Home', viewportName: 'mobile', stateName: 'home' },
    { routeName: 'Chat', viewportName: 'mobile', stateName: 'chat' }
  ]);
  assert.deepEqual(runs.map((r) => r.key), ['Home__mobile__home', 'Chat__mobile__chat']);
  assert.deepEqual(runs.map((r) => r.device), [null, null]);
  assert.equal(runs[0].case.key, 'home');
});

test('mobileCaseRuns — fans out cases × devices, config order, case-major', () => {
  const runs = mobileCaseRuns(matrixFixture());
  assert.equal(runs.length, 4);
  assert.deepEqual(runs.map((r) => r.key), [
    'Home__iphone16__home', 'Home__pixel6__home',
    'Chat__iphone16__chat', 'Chat__pixel6__chat'
  ]);
  assert.equal(runs[0].device.key, 'iphone16');
  assert.equal(runs[1].device.platform, 'android');
  assert.deepEqual(runs[2].identity, { routeName: 'Chat', viewportName: 'iphone16', stateName: 'chat' });
});

test('mobileCaseRuns — case.devices subset restricts the fan-out; raw [] means every device', () => {
  const config = matrixFixture();
  config.mobile.cases[0].devices = ['pixel6'];
  config.mobile.cases[1].devices = []; // unnormalized raw input: empty = every device
  assert.deepEqual(mobileCaseRuns(config).map((r) => r.key), [
    'Home__pixel6__home',
    'Chat__iphone16__chat', 'Chat__pixel6__chat'
  ]);
});

test('mobileCaseRuns — duplicate run identity after safeSegment normalization throws (cross-key guard)', () => {
  const config = matrixFixture();
  // safeSegment('My Phone') === safeSegment('my-phone') → both devices map the
  // same case onto 'home__my-phone__home' and would overwrite each other.
  config.mobile.devices = [
    { key: 'My Phone', label: null, udid: 'UDID-1', serial: null, platform: 'ios-sim' },
    { key: 'my-phone', label: null, udid: 'UDID-2', serial: null, platform: 'ios-sim' }
  ];
  config.mobile.cases = [{ key: 'home', label: 'Home', bundleId: null, launchActivity: null, openUrl: null, settleMs: 0, udid: null, serial: null, devices: null }];
  assert.throws(
    () => mobileCaseRuns(config),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /Duplicate mobile run artifact identity: home__my-phone__home/);
      assert.match(error.message, /My Phone/); // names BOTH colliding inputs
      assert.match(error.message, /my-phone/);
      return true;
    }
  );
});

test('mobileCaseRuns — undeclared device key in case.devices throws instead of degrading to mobile identity', () => {
  const config = matrixFixture();
  config.mobile.cases[0].devices = ['ghost'];
  assert.throws(
    () => mobileCaseRuns(config),
    (error) => {
      assert.ok(error instanceof TypeError);
      assert.match(error.message, /unknown device key: ghost/);
      return true;
    }
  );
});

test('mobileCaseRuns — filters narrow cases exactly like captureAllMobile', () => {
  const config = matrixFixture();
  assert.deepEqual(mobileCaseRuns(config, { case: 'chat' }).map((r) => r.key), ['Chat__iphone16__chat', 'Chat__pixel6__chat']);
  assert.deepEqual(mobileCaseRuns(config, { route: 'Home' }).map((r) => r.key), ['Home__iphone16__home', 'Home__pixel6__home']);
});

test('captureAllMobile — 2 devices × 2 cases captures 4 runs with per-run udid/serial and device metadata', async () => {
  const config = matrixFixture();
  const calls = [];
  const results = await captureAllMobile(config, { exec: fakeMatrixExec(calls), sleep: () => {} });
  assert.equal(results.length, 4);
  // Session order: config order, case-major, sequential.
  assert.deepEqual(
    results.map((r) => path.basename(r.screenshotPath)),
    ['home__iphone16__home.png', 'home__pixel6__home.png', 'chat__iphone16__chat.png', 'chat__pixel6__chat.png']
  );
  for (const result of results) {
    assert.equal(result.ok, true);
    assert.equal(result.regionCount, 0);
    assert.ok(fs.existsSync(result.screenshotPath));
  }
  const homeIphone = JSON.parse(fs.readFileSync(results[0].metadataPath, 'utf8'));
  assert.equal(homeIphone.device, 'iphone16');
  assert.equal(homeIphone.platform, 'ios-sim');
  assert.equal(homeIphone.mobile.udid, 'UDID-IPHONE16');
  assert.deepEqual(homeIphone.viewport, { width: 1170, height: 2532 });
  const homePixel = JSON.parse(fs.readFileSync(results[1].metadataPath, 'utf8'));
  assert.equal(homePixel.device, 'pixel6');
  assert.equal(homePixel.platform, 'android');
  assert.equal(homePixel.mobile.serial, 'emulator-5556');
  assert.deepEqual(homePixel.viewport, { width: 1176, height: 2400 });
  // The resolved endpoints reached the right drivers.
  const seq = calls.map((c) => c.join(' '));
  assert.ok(seq.some((s) => s.includes('simctl launch UDID-IPHONE16 com.example.app')));
  assert.ok(seq.some((s) => s.includes('simctl io UDID-IPHONE16 screenshot')));
  assert.ok(seq.some((s) => s.includes('-s emulator-5556 shell am start -n com.example.app/.MainActivity')));
  assert.ok(seq.some((s) => s.includes('-s emulator-5556 exec-out screencap -p')));
  assert.ok(seq.some((s) => s.includes('simctl openurl UDID-IPHONE16 app://chat/1')));
});

test('captureAllMobile — case.devices subset captures only the listed devices', async () => {
  const config = matrixFixture();
  config.mobile.cases[0].devices = ['pixel6'];
  config.mobile.cases[1].devices = ['iphone16'];
  const calls = [];
  const results = await captureAllMobile(config, { exec: fakeMatrixExec(calls), sleep: () => {} });
  assert.deepEqual(results.map((r) => path.basename(r.screenshotPath)), [
    'home__pixel6__home.png', 'chat__iphone16__chat.png'
  ]);
  assert.equal(fs.existsSync(path.join(config.outputDir, 'current', 'home__iphone16__home.png')), false);
  assert.equal(fs.existsSync(path.join(config.outputDir, 'current', 'chat__pixel6__chat.png')), false);
});

test('captureAllMobile — no-devices config keeps legacy identity and records meta.device null', async () => {
  const config = mobileFixture();
  const calls = [];
  const results = await captureAllMobile(config, { exec: fakeSimctlExec(calls), sleep: () => {} });
  assert.equal(results.length, 2);
  assert.match(results[0].screenshotPath, /current[/\\]home__mobile__home\.png$/);
  const metadata = JSON.parse(fs.readFileSync(results[0].metadataPath, 'utf8'));
  assert.equal(metadata.device, null);
  assert.equal(metadata.platform, 'ios-sim');
});
