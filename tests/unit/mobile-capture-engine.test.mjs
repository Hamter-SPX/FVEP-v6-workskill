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

test('captureSimulatorScreenshot — android is an explicit phase-2 stub', () => {
  assert.throws(
    () => captureSimulatorScreenshot({ out: '/tmp/x.png', platform: 'android', exec: () => ({ status: 0 }), sleep: () => {} }),
    /phase 2/i
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
