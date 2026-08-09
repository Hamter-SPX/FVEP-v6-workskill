import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { captureAndroidScreenshot, metaPathFor } from '../../lib/android-capture-engine.mjs';

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

// Full expected argv for the preferred exec-out capture. The trailing `-p`
// forces PNG encoding — without it adb streams raw RGBA (regression pin).
const EXEC_OUT_SCREENCAP_ARGS = (serial) => ['-s', serial, 'exec-out', 'screencap', '-p'];

test('captureAndroidScreenshot — exec-out path writes png + meta', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-'));
  const out = path.join(dir, 'cur.png');
  const png = fakePngBytes(1176, 2400);
  const calls = [];
  const exec = (cmd, args) => {
    calls.push(args);
    if (args.join(' ').includes('exec-out screencap')) return { status: 0, stdout: png, stderr: '', encoding: 'buffer' };
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureAndroidScreenshot({ serial: 'emulator-5554', out, label: 'home', exec, sleep: () => {} });
  assert.equal(meta.platform, 'android');
  assert.equal(meta.serial, 'emulator-5554');
  assert.equal(fs.readFileSync(out).length, png.length);
  assert.equal(meta.png.width, 1176);
  assert.ok(meta.screenshotSha256);
  // Exact argv pin: `-p` is mandatory PNG encoding (raw RGBA regression guard).
  assert.deepEqual(calls[0], EXEC_OUT_SCREENCAP_ARGS('emulator-5554'));
});

test('captureAndroidScreenshot — falls back to pull when exec-out yields nothing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-'));
  const out = path.join(dir, 'cur.png');
  const png = fakePngBytes(1176, 2400);
  const calls = [];
  const exec = (cmd, args) => {
    calls.push(args);
    if (args.join(' ').includes('exec-out')) return { status: 0, stdout: Buffer.alloc(0), stderr: '', encoding: 'buffer' };
    if (args.join(' ').includes('pull')) { fs.writeFileSync(out, png); return { status: 0, stdout: '', stderr: '' }; }
    return { status: 0, stdout: '', stderr: '' };
  };
  const meta = captureAndroidScreenshot({ out, exec, sleep: () => {} });
  assert.equal(meta.platform, 'android');
  assert.deepEqual(calls[0], EXEC_OUT_SCREENCAP_ARGS('emulator-5554'));
  assert.ok(calls.some((c) => c.includes('pull')));
  // screencap-file → pull → rm ordering with a shared remote path.
  const remoteMatch = calls.find((c) => c[2] === 'shell' && c.includes('screencap'))?.at(-1);
  assert.ok(remoteMatch?.startsWith('/sdcard/.fvep_capture_'));
  const pullCall = calls.find((c) => c.includes('pull'));
  assert.deepEqual(pullCall.slice(1, 4), [calls[0][1], 'pull', remoteMatch]);
  const rmCall = calls.find((c) => c[2] === 'shell' && c[3] === 'rm');
  assert.deepEqual(rmCall.slice(-3), ['rm', '-f', remoteMatch]);
});

test('captureAndroidScreenshot — pull failure still removes the remote capture file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-'));
  const out = path.join(dir, 'cur.png');
  const calls = [];
  const exec = (cmd, args) => {
    calls.push(args);
    if (args.join(' ').includes('exec-out')) return { status: 0, stdout: Buffer.alloc(0), stderr: '', encoding: 'buffer' };
    if (args.includes('pull')) return { status: 1, stdout: '', stderr: 'adb: error: device offline' };
    return { status: 0, stdout: '', stderr: '' };
  };
  assert.throws(() => captureAndroidScreenshot({ out, exec, sleep: () => {} }), /device offline/);
  const remoteMatch = calls.find((c) => c.includes('pull'))?.[3];
  assert.ok(remoteMatch?.startsWith('/sdcard/.fvep_capture_'));
  const rmIndex = calls.findIndex((c) => c[2] === 'shell' && c[3] === 'rm');
  assert.ok(rmIndex > 0, 'rm -f attempted despite pull failure');
  assert.deepEqual(calls[rmIndex].slice(-3), ['rm', '-f', remoteMatch]);
});

test('captureAndroidScreenshot — adb failure surfaces stderr tail', () => {
  const exec = () => ({ status: 1, stdout: '', stderr: 'adb: device offline' });
  assert.throws(() => captureAndroidScreenshot({ out: '/tmp/x.png', exec, sleep: () => {} }), /device offline/);
});

test('captureAndroidScreenshot — deep link + launch flow order', () => {
  const calls = [];
  const png = fakePngBytes(8, 4);
  const exec = (cmd, args) => {
    calls.push(args);
    if (args.join(' ').includes('exec-out')) return { status: 0, stdout: png, stderr: '', encoding: 'buffer' };
    return { status: 0, stdout: '', stderr: '' };
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-'));
  captureAndroidScreenshot({ out: path.join(dir, 'x.png'), openUrl: 'helos://chat/1', launchActivity: 'com.helos.app.helosMobile/.MainActivity', exec, sleep: () => {} });
  assert.ok(calls[0].includes('am') && calls[0].includes('start'), 'launch/deep-link precedes capture');
  // Final call is the exact exec-out screencap argv (with mandatory -p).
  assert.deepEqual(calls.at(-1), EXEC_OUT_SCREENCAP_ARGS('emulator-5554'));
});

test('metaPathFor — suffix mapping never returns the input path itself', () => {
  assert.equal(metaPathFor('/tmp/a.png'), '/tmp/a.meta.json');
  assert.equal(metaPathFor('/tmp/a.PNG'), '/tmp/a.meta.json');
  assert.equal(metaPathFor('/tmp/a'), '/tmp/a.meta.json');
});
