/**
 * iOS Simulator capture adapter for vision-in-the-loop.
 * Wraps `xcrun simctl` so Flutter/native app screenshots feed the existing
 * compare / ascii-map / layout-structure pipeline unchanged.
 *
 * Platforms: iOS Simulator (simctl) and Android (adb screencap, delegated to
 * lib/android-capture-engine.mjs when platform === 'android').
 */
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { captureAndroidScreenshot } from './android-capture-engine.mjs';
import { artifactKey, artifactPaths } from './artifacts.mjs';
import { ensureParent, writeJsonAtomic } from './io.mjs';

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
    serial,
    launchActivity,
    adbPath,
    exec = spawnSync,
    sleep = defaultSleep
  } = options;

  if (platform === 'android') {
    return captureAndroidScreenshot({
      serial, out, label, settleMs, launchActivity, openUrl, adbPath, exec, sleep
    });
  }
  if (platform !== 'ios') {
    throw new TypeError(`capture-mobile: unsupported --platform ${platform} (expected ios|android)`);
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

// Canonical fan-out law for the mobile capture matrix — THE single identity
// rule shared by captureAllMobile, compareAll (compare-engine.mjs) and
// runMobileChecks (mobile-checks-engine.mjs). All three engines MUST consume
// this helper; never re-enumerate cases locally or the three pipelines could
// diverge onto different artifact identities.
//
// Mobile cases ride the same artifact layout as web captures by projecting
// each run onto the web identity triple: the case label plays the route role,
// the device key (or the fixed legacy segment 'mobile') the viewport role,
// and the case key the state role. A device's effective list per case is
// case.devices?.length ? lookups(case.devices) : mobile.devices, and an empty
// effective list collapses to [null] — reproducing the pre-matrix
// single-device identity { viewportName: 'mobile' } byte-for-byte.
//
// The run `key` is the RAW 'label__viewport__state' join (compare report
// display-key semantics); artifact paths renormalize the identity via
// safeSegment inside artifactPaths/artifactKey.
export function mobileCaseRuns(config, filters = {}) {
  const devices = config.mobile?.devices ?? [];
  const devicesByKey = new Map(devices.map((d) => [d.key, d]));
  const cases = (config.mobile?.cases ?? []).filter((c) => {
    if (filters.route && c.label !== filters.route) return false;
    if (filters.case && c.key !== filters.case) return false;
    return true;
  });
  const runs = [];
  for (const c of cases) {
    const effective = c.devices?.length
      ? c.devices.map((deviceKey) => {
          const device = devicesByKey.get(deviceKey);
          // validateConfig rejects unknown keys up front; this guard keeps a
          // hand-built (unvalidated) config from degrading an unknown key to
          // the legacy 'mobile' identity and colliding opaquely below.
          if (!device) throw new TypeError(`Mobile case "${c.key}" references unknown device key: ${deviceKey}`);
          return device;
        })
      : devices;
    for (const device of effective.length ? effective : [null]) {
      const identity = { routeName: c.label, viewportName: device?.key ?? 'mobile', stateName: c.key };
      runs.push({ case: c, device: device ?? null, identity, key: `${c.label}__${device?.key ?? 'mobile'}__${c.key}` });
    }
  }
  // Cross-key duplicate guard: safeSegment can collapse distinct device keys
  // ('My Phone' ≡ 'my-phone') onto one artifact identity, letting a later run
  // silently overwrite an earlier run's evidence — the same failure mode
  // validateConfig guards for case identities. Mirrors that rule, one level
  // down (case × device), via the same artifactKey/safeSegment pipeline.
  const identities = new Map();
  for (const run of runs) {
    const identityKey = artifactKey(run.identity);
    const first = identities.get(identityKey);
    if (first) {
      throw new TypeError(
        `Duplicate mobile run artifact identity: ${identityKey} ` +
        `(case "${first.case.key}" device "${first.device?.key ?? 'mobile'}" vs ` +
        `case "${run.case.key}" device "${run.device?.key ?? 'mobile'}")`
      );
    }
    identities.set(identityKey, run);
  }
  return runs;
}

/**
 * Matrix capture driver for capture.type ios-sim|android: fan-out over
 * mobileCaseRuns (case × effective device), one screenshot + schemaVersion-2
 * capture metadata per run, in config order, sequentially. Results mirror
 * captureAll's result shape so downstream sections (compare / run summary)
 * consume mobile runs uniformly.
 */
export async function captureAllMobile(config, { mode = 'current', filters = {}, exec, sleep } = {}) {
  const platform = config.capture?.type;
  if (!['ios-sim', 'android'].includes(platform)) {
    throw new TypeError(`captureAllMobile requires capture.type ios-sim|android, got ${platform}`);
  }
  const results = [];
  for (const run of mobileCaseRuns(config, filters)) {
    const { case: c, device, identity } = run;
    // Per-run driver resolution: the device pins the platform when present.
    // Endpoint ids resolve device → case → config so a fan-out can mix
    // simulators/emulators while a no-device config keeps its exact
    // pre-matrix call sequence (device is null → case override → default).
    const runPlatform = device?.platform ?? platform;
    const paths = artifactPaths(config.outputDir, identity);
    const screenshotPath = mode === 'reference' ? paths.referencePng : paths.currentPng;
    const metadataPath = mode === 'reference' ? paths.referenceCaptureJson : paths.currentCaptureJson;
    await ensureParent(screenshotPath);
    if (runPlatform === 'android') {
      captureAndroidScreenshot({
        serial: device?.serial ?? c.serial ?? config.mobile.serial,
        out: screenshotPath,
        label: c.label,
        settleMs: c.settleMs,
        launchActivity: c.launchActivity,
        openUrl: c.openUrl,
        // config default is null → undefined so the engine default ('adb') applies.
        adbPath: config.mobile?.adbPath ?? undefined,
        exec,
        sleep
      });
    } else {
      captureSimulatorScreenshot({
        udid: device?.udid ?? c.udid ?? config.mobile.udid,
        out: screenshotPath,
        label: c.label,
        settleMs: c.settleMs,
        launchBundleId: c.bundleId,
        openUrl: c.openUrl,
        exec,
        sleep
      });
    }
    // Read the driver-written meta sidecar and re-emit it as schemaVersion-2
    // capture metadata (web convention) so compare/judge stay driver-agnostic.
    const sidecarPath = metaPathFor(screenshotPath);
    const driverMeta = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
    fs.unlinkSync(sidecarPath); // sidecar is folded into the matrix metadata
    const pngBytes = fs.readFileSync(screenshotPath);
    const metadata = {
      schemaVersion: 2,
      mode,
      key: c.key,
      route: c.label,
      viewport: { width: driverMeta.png?.width ?? null, height: driverMeta.png?.height ?? null },
      state: null,
      // Effective driver for THIS run (a device may override capture.type).
      platform: runPlatform,
      device: device?.key ?? null,
      label: c.label,
      navigation: c.openUrl ?? null,
      capturedAt: new Date().toISOString(),
      screenshotPath,
      screenshotSha256: crypto.createHash('sha256').update(pngBytes).digest('hex'),
      screenshotBytes: pngBytes.length,
      mobile: driverMeta
    };
    await writeJsonAtomic(metadataPath, metadata);
    results.push({
      screenshotPath,
      metadataPath,
      relativeScreenshot: path.relative(config.outputDir, screenshotPath),
      regionCount: 0,
      unresolvedRequiredRegionCount: 0,
      ok: true
    });
  }
  return results;
}
