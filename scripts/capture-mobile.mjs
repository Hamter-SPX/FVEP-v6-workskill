#!/usr/bin/env node
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { captureSimulatorScreenshot } from '../lib/mobile-capture-engine.mjs';

const HELP = `Usage:
  node scripts/capture-mobile.mjs --out <cur.png> [options]

Capture a screenshot from an iOS Simulator (Flutter/native apps) for vision loops.

Options:
  --udid <id>         Simulator UDID or 'booted' (default: booted)
  --out <file>        Output PNG path (required)
  --label <name>      Case label stored in the sidecar meta (default: screen)
  --launch <bundleId> Launch an app bundle id before capturing
  --open-url <url>    Open a (deep) link before capturing
  --settle <sec>      Wait before capturing (default: 0)
  --platform <name>   ios | android (android = phase 2 stub, exits non-zero)
  -h, --help          Show help

Examples:
  node scripts/capture-mobile.mjs --out .fx/cur.png --label chat
  node scripts/capture-mobile.mjs --udid 2357B650 --launch com.helos.app.helosMobile --settle 2 --out .fx/chat.png
`;

try {
  const args = parseLooseArgs();
  const out = args.out;
  if (args.help || args.h) { printHelp(HELP); process.exitCode = 0; }
  else if (!out) { printHelp(HELP); process.exitCode = 1; }
  else {
    const settleMs = Math.max(0, Math.round(Number(args.settle ?? 0) * 1000));
    const meta = captureSimulatorScreenshot({
      out,
      udid: args.udid ?? 'booted',
      label: args.label ?? 'screen',
      settleMs,
      launchBundleId: args.launch,
      openUrl: args['open-url'] ?? args.openUrl,
      platform: args.platform ?? 'ios'
    });
    process.stdout.write(`${JSON.stringify(meta, null, 2)}\n`);
  }
} catch (error) { fail(error); }
