#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson } from '../lib/contract-cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import {
  formatDirectionRuntimeReport,
  resolveDirectionRuntime
} from '../lib/direction-runtime-engine.mjs';

const HELP = `Usage: node scripts/detect-direction-runtime.mjs [options]
      --host <name>              Force host: cursor | codex | cli | ci | unknown
      --image-gen <bool>         Override ImageGen availability (true|false)
      --inline-images <bool>     Override whether chat can show images
      --browser-gallery <bool>   Override browser gallery availability
      --image-tool <name>        Override tool name (GenerateImage | imagegen | ...)
      --no-reference             User could not attach a reference screenshot
      --write <path>             Write the runtime report JSON (default off)
      --json                     Emit JSON on stdout
      --output <path>            Write JSON report to a path

Classifies Cursor / Codex / CLI / CI and prints the presentation plan for
visual direction options 1–2–3. Node cannot see the agent tool list — when
you know GenerateImage/imagegen is present or absent, pass --image-gen.

Examples:
  npm run direction:runtime
  npm run direction:runtime -- --image-gen true --host cursor
  npm run direction:runtime -- --image-gen false --json
`;

function asBool(value) {
  if (value === undefined) return undefined;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'off'].includes(text)) return false;
  throw new Error(`Expected boolean, got: ${value}`);
}

try {
  const args = parseCli({
    host: { type: 'string' },
    'image-gen': { type: 'string' },
    'inline-images': { type: 'string' },
    'browser-gallery': { type: 'string' },
    'image-tool': { type: 'string' },
    reference: { type: 'boolean', default: true },
    write: { type: 'string' },
    json: { type: 'boolean', default: false },
    output: { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const overrides = {};
    if (args.host) overrides.host = args.host;
    if (args['image-gen'] !== undefined) overrides.imageGeneration = asBool(args['image-gen']);
    if (args['inline-images'] !== undefined) overrides.inlineImages = asBool(args['inline-images']);
    if (args['browser-gallery'] !== undefined) overrides.browserGallery = asBool(args['browser-gallery']);
    if (args['image-tool']) overrides.imageTool = args['image-tool'];

    const report = resolveDirectionRuntime({
      referenceAttached: args.reference !== false,
      overrides
    });

    if (args.write) {
      const target = path.resolve(String(args.write));
      await writeJsonAtomic(target, report);
      process.stdout.write(`Wrote ${target}\n`);
    }
    if (args.json || args.output) await emitJson(report, args.output);
    if (!args.json || args.output) process.stdout.write(formatDirectionRuntimeReport(report));
  }
} catch (error) { fail(error); }
