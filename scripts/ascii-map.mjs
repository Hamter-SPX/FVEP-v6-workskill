#!/usr/bin/env node
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import {
  asciiMapFromPngFile,
  compareAsciiMaps,
  formatAsciiReport
} from '../lib/ascii-map-engine.mjs';

const HELP = `Usage:
  node scripts/ascii-map.mjs <image.png> [x y w h] [options]
  node scripts/ascii-map.mjs --ref <ref.png> --cur <cur.png> [x y w h] [options]

Turn a PNG (or a crop) into a digit/block ASCII density map for agent vision loops.
ref = desired original; cur = current implementation to fix.

Options:
  --cols <n>          Map width in characters (default: min(80, crop width))
  --rows <n>          Map height in characters (default: aspect-aware)
  --ramp <name>       digits | blocks | binary (default: digits)
  --invert            Invert luminance (dark ink on light paper → high digits)
  --label <name>      Label in the report header (e.g. PHOTO, POLL, QR)
  --tolerance <n>     meanAbsDelta threshold for similar=true (default: 0.08)
  --json              Emit JSON instead of the text map
  -h, --help          Show help

Examples:
  npm run ascii-map -- artifacts/ref.png 92 738 62 60 --label PHOTO
  npm run ascii-map -- --ref artifacts/ref.png --cur artifacts/cur.png 92 735 62 60 --label PHOTO
`;

function asInt(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number)) throw new TypeError(`${label} must be an integer.`);
  return number;
}

function parseRect(positionals, args) {
  if (positionals.length >= 4) {
    return {
      x: asInt(positionals[0], 'x'),
      y: asInt(positionals[1], 'y'),
      width: asInt(positionals[2], 'w'),
      height: asInt(positionals[3], 'h')
    };
  }
  if (args.x !== undefined || args.y !== undefined || args.w !== undefined || args.h !== undefined
    || args.width !== undefined || args.height !== undefined) {
    return {
      x: asInt(args.x ?? 0, 'x'),
      y: asInt(args.y ?? 0, 'y'),
      width: asInt(args.w ?? args.width, 'w'),
      height: asInt(args.h ?? args.height, 'h')
    };
  }
  return null;
}

try {
  const args = parseLooseArgs();
  if (args.help || args.h) printHelp(HELP);
  else {
    const positionals = args._ || [];
    const refPath = args.ref ? path.resolve(String(args.ref)) : null;
    const curPath = args.cur ? path.resolve(String(args.cur)) : null;
    const singlePath = !refPath && positionals[0] && !String(positionals[0]).match(/^\d+$/)
      ? path.resolve(String(positionals.shift()))
      : null;
    const rect = parseRect(positionals, args);
    const options = {
      rect,
      cols: args.cols,
      rows: args.rows,
      ramp: args.ramp || 'digits',
      invert: args.invert === true,
      threshold: args.threshold
    };
    const label = args.label ? String(args.label) : undefined;
    const tolerance = args.tolerance === undefined ? 0.08 : Number(args.tolerance);

    if (refPath && curPath) {
      const reference = await asciiMapFromPngFile(refPath, options);
      const current = await asciiMapFromPngFile(curPath, {
        ...options,
        cols: reference.cols,
        rows: reference.rows
      });
      const comparison = compareAsciiMaps(
        { ...reference, tolerance },
        { ...current, tolerance }
      );
      if (args.json) {
        process.stdout.write(`${JSON.stringify({ label, reference, current, comparison }, null, 2)}\n`);
      } else {
        process.stdout.write(formatAsciiReport({ label, role: 'REF', map: reference }));
        process.stdout.write('\n');
        process.stdout.write(formatAsciiReport({ label, role: 'CUR', map: current, comparison }));
      }
      if (!comparison.similar) process.exitCode = 1;
    } else if (singlePath || refPath || curPath) {
      const filePath = singlePath || refPath || curPath;
      const map = await asciiMapFromPngFile(filePath, options);
      if (args.json) process.stdout.write(`${JSON.stringify({ label, map }, null, 2)}\n`);
      else process.stdout.write(formatAsciiReport({ label, role: refPath ? 'REF' : curPath ? 'CUR' : null, map }));
    } else {
      printHelp(HELP);
      process.exitCode = 1;
    }
  }
} catch (error) { fail(error); }
