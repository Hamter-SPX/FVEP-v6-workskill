#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { captureAndroidScreenshot } from '../lib/android-capture-engine.mjs';
import { captureSimulatorScreenshot } from '../lib/mobile-capture-engine.mjs';

const HELP = `Usage:
  node scripts/capture-mobile.mjs --out <cur.png> [options]

Capture a screenshot from an iOS Simulator or Android device/emulator
(Flutter/native apps) for vision loops.

Options:
  --udid <id>         Simulator UDID or 'booted' (ios, default: booted)
  --serial <id>       Android device/emulator serial (android, default: emulator-5554)
  --out <file>        Output PNG path (required)
  --label <name>      Case label stored in the sidecar meta (default: screen)
  --launch <bundleId> Launch an app bundle id before capturing (ios)
  --open-url <url>    Open a (deep) link before capturing
  --settle <sec>      Wait before capturing (default: 0)
  --platform <name>   ios | android (default: ios)
  --help              Show help

Examples:
  node scripts/capture-mobile.mjs --out .fx/cur.png --label chat
  node scripts/capture-mobile.mjs --udid 2357B650 --launch com.helos.app.helosMobile --settle 2 --out .fx/chat.png
  node scripts/capture-mobile.mjs --platform android --serial emulator-5554 --out .fx/home.png --label home --settle 2
`;

// Prefer the well-known host SDK adb when bare `adb` is not on PATH.
function resolveAdbPath() {
  const wellKnown = path.join(os.homedir(), 'Library/Android/sdk/platform-tools/adb');
  return fs.existsSync(wellKnown) ? wellKnown : 'adb';
}

try {
  const args = parseLooseArgs();
  const out = args.out;
  if (args.help || args.h) { printHelp(HELP); process.exitCode = 0; }
  else if (!out) { printHelp(HELP); process.exitCode = 1; }
  else {
    const settleMs = Math.max(0, Math.round(Number(args.settle ?? 0) * 1000));
    const platform = args.platform ?? 'ios';
    const meta = platform === 'android'
      ? captureAndroidScreenshot({
          out,
          serial: args.serial ?? 'emulator-5554',
          label: args.label ?? 'screen',
          settleMs,
          openUrl: args['open-url'] ?? args.openUrl,
          adbPath: resolveAdbPath()
        })
      : captureSimulatorScreenshot({
          out,
          udid: args.udid ?? 'booted',
          label: args.label ?? 'screen',
          settleMs,
          launchBundleId: args.launch,
          openUrl: args['open-url'] ?? args.openUrl,
          platform
        });
    process.stdout.write(`${JSON.stringify(meta, null, 2)}\n`);
  }
} catch (error) { fail(error); }
