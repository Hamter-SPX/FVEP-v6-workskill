/**
 * Android capture adapter — adb screencap (exec-out, with pull fallback).
 * Mirrors lib/mobile-capture-engine.mjs contract (PNG + meta sidecar fields).
 */
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

export function metaPathFor(outFile) {
  return /\.png$/i.test(outFile) ? outFile.replace(/\.png$/i, '.meta.json') : `${outFile}.meta.json`;
}

function readPngSize(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(24);
    fs.readSync(fd, head, 0, 24, 0);
    if (head.readUInt32BE(0) !== 0x89504e47) return null;
    return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

function defaultSleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

function assertAdbOk(result, stage) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const tail = String(result.stderr || result.stdout || '').trim().split('\n').slice(-3).join(' | ');
    throw new Error(`adb ${stage} failed (exit ${result.status}): ${tail || 'no output'}`);
  }
}

export function captureAndroidScreenshot(options = {}) {
  const {
    serial = 'emulator-5554', out, label = 'screen', settleMs = 0,
    launchActivity, openUrl,
    adbPath = 'adb',
    exec = spawnSync, sleep = defaultSleep
  } = options;
  if (typeof out !== 'string' || out.trim() === '') throw new TypeError('out file path is required');

  if (launchActivity) {
    assertAdbOk(exec(adbPath, ['-s', serial, 'shell', 'am', 'start', '-n', launchActivity], { encoding: 'utf8' }), 'launch');
  }
  if (openUrl) {
    assertAdbOk(exec(adbPath, ['-s', serial, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', openUrl], { encoding: 'utf8' }), 'openurl');
  }
  if (settleMs > 0) sleep(settleMs);

  // Preferred: exec-out (no sd-card roundtrip); `-p` forces PNG encoding —
  // without it screencap streams the raw RGBA framebuffer to stdout.
  const shot = exec(adbPath, ['-s', serial, 'exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  assertAdbOk(shot, 'screenshot');
  const bytes = shot.stdout;
  if (Buffer.isBuffer(bytes) && bytes.length > 0) {
    fs.writeFileSync(out, bytes);
  } else {
    // Fallback: screencap to /sdcard then pull
    const remote = `/sdcard/.fvep_capture_${Date.now()}.png`;
    assertAdbOk(exec(adbPath, ['-s', serial, 'shell', 'screencap', '-p', remote], { encoding: 'utf8' }), 'screencap-file');
    assertAdbOk(exec(adbPath, ['-s', serial, 'pull', remote, out], { encoding: 'utf8' }), 'pull');
    exec(adbPath, ['-s', serial, 'shell', 'rm', '-f', remote], { encoding: 'utf8' });
  }
  if (!fs.existsSync(out) || fs.statSync(out).size === 0) {
    throw new Error(`adb screencap did not produce a non-empty file at ${out}`);
  }

  const pngBytes = fs.readFileSync(out);
  const meta = {
    platform: 'android',
    serial,
    label,
    captured_at: new Date().toISOString(),
    file: out,
    png: readPngSize(out) ?? null,
    screenshotSha256: crypto.createHash('sha256').update(pngBytes).digest('hex'),
    screenshotBytes: pngBytes.length,
    ...(launchActivity ? { launch_activity: launchActivity } : {}),
    ...(openUrl ? { open_url: openUrl } : {})
  };
  fs.writeFileSync(metaPathFor(out), `${JSON.stringify(meta, null, 2)}\n`);
  return meta;
}
