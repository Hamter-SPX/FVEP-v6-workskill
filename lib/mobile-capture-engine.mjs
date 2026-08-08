/**
 * iOS Simulator capture adapter for vision-in-the-loop.
 * Wraps `xcrun simctl` so Flutter/native app screenshots feed the existing
 * compare / ascii-map / layout-structure pipeline unchanged.
 *
 * Phase 1: iOS Simulator only. Android (adb screencap) is a documented stub.
 */
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

export function buildSimctlScreenshotArgs(outFile, { udid = 'booted' } = {}) {
  if (typeof outFile !== 'string' || outFile.trim() === '') {
    throw new TypeError('out file path is required');
  }
  return ['simctl', 'io', udid, 'screenshot', outFile];
}

export function buildSimctlLaunchArgs(bundleId, { udid = 'booted' } = {}) {
  if (typeof bundleId !== 'string' || bundleId.trim() === '') {
    throw new TypeError('bundleId is required');
  }
  return ['simctl', 'launch', udid, bundleId];
}

export function buildSimctlOpenUrlArgs(url, { udid = 'booted' } = {}) {
  if (typeof url !== 'string' || url.trim() === '') {
    throw new TypeError('url is required');
  }
  return ['simctl', 'openurl', udid, url];
}

export function metaPathFor(outFile) {
  // Without a .png suffix, replace() would return the input unchanged and the
  // sidecar JSON would clobber the just-captured screenshot.
  return /\.png$/i.test(outFile) ? outFile.replace(/\.png$/i, '.meta.json') : `${outFile}.meta.json`;
}

function readPngSize(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(24);
    fs.readSync(fd, head, 0, 24, 0);
    const sigOk = head.readUInt32BE(0) === 0x89504e47;
    if (!sigOk) return null;
    return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

function defaultSleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function assertSimctlOk(result, stage) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const tail = String(result.stderr || result.stdout || '').trim().split('\n').slice(-3).join(' | ');
    throw new Error(`simctl ${stage} failed (exit ${result.status}): ${tail || 'no output'}`);
  }
}

export function captureSimulatorScreenshot(options = {}) {
  const {
    udid = 'booted',
    out,
    label = 'screen',
    settleMs = 0,
    launchBundleId,
    openUrl,
    platform = 'ios',
    xcrunPath = 'xcrun',
    exec = spawnSync,
    sleep = defaultSleep
  } = options;

  if (platform !== 'ios') {
    throw new Error('capture-mobile: --platform android is phase 2 — not implemented yet');
  }
  if (typeof out !== 'string' || out.trim() === '') {
    throw new TypeError('out file path is required');
  }

  if (launchBundleId) {
    assertSimctlOk(exec(xcrunPath, buildSimctlLaunchArgs(launchBundleId, { udid }), { encoding: 'utf8' }), 'launch');
  }
  if (openUrl) {
    assertSimctlOk(exec(xcrunPath, buildSimctlOpenUrlArgs(openUrl, { udid }), { encoding: 'utf8' }), 'openurl');
  }
  if (settleMs > 0) sleep(settleMs);

  assertSimctlOk(exec(xcrunPath, buildSimctlScreenshotArgs(out, { udid }), { encoding: 'utf8' }), 'screenshot');
  if (!fs.existsSync(out) || fs.statSync(out).size === 0) {
    throw new Error(`simctl screenshot did not produce a non-empty file at ${out}`);
  }

  const pngBytes = fs.readFileSync(out);
  const screenshotSha256 = crypto.createHash('sha256').update(pngBytes).digest('hex');
  const meta = {
    platform: 'ios-simulator',
    udid,
    label,
    captured_at: new Date().toISOString(),
    file: out,
    png: readPngSize(out) ?? null,
    // Same field names as the web capture metadata (lib/capture-engine.mjs).
    screenshotSha256,
    screenshotBytes: pngBytes.length,
    ...(launchBundleId ? { launch_bundle_id: launchBundleId } : {}),
    ...(openUrl ? { open_url: openUrl } : {})
  };
  fs.writeFileSync(metaPathFor(out), `${JSON.stringify(meta, null, 2)}\n`);
  return meta;
}
