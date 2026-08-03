#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import { auditAssetSet, formatAssetReport } from '../lib/game-asset-engine.mjs';

const HELP = `Usage:
  node scripts/audit-game-assets.mjs --assets design/game-assets.json [options]

Audits a game asset set: silhouette read, in-engine scale with a reference, style binding,
materials, palette, budget, and in-context acceptance evidence.

Input shapes accepted:
  [ { asset }, ... ]
  { "assets": [ { asset }, ... ], "policy": { ... } }

Options:
  --assets <path>              Asset set JSON
  --frame-triangle-budget <n>  Fail when declared triangles exceed the frame budget
  --max-style-bindings <n>     Allowed distinct style packs in one set (default 1)
  --min-story-details <n>      Required story/wear details per asset (default 2)
  --write <path>               Write the JSON result
  --json                       Emit JSON instead of the text report
  -h, --help

Example:
  npm run audit:game-assets -- --assets design/game-assets.json --frame-triangle-budget 250000
`;

try {
  const args = parseLooseArgs();
  if (args.help || args.h) printHelp(HELP);
  else if (!args.assets) {
    printHelp(HELP);
    process.exitCode = 1;
  } else {
    const raw = JSON.parse(await fs.readFile(path.resolve(String(args.assets)), 'utf8'));
    const assets = Array.isArray(raw) ? raw : Array.isArray(raw.assets) ? raw.assets : [];
    const policy = { ...(raw.policy ?? {}) };
    if (args['frame-triangle-budget'] !== undefined) policy.frameTriangleBudget = Number(args['frame-triangle-budget']);
    if (args['max-style-bindings'] !== undefined) policy.maxStyleBindings = Number(args['max-style-bindings']);
    if (args['min-story-details'] !== undefined) policy.minStoryDetails = Number(args['min-story-details']);

    const result = auditAssetSet(assets, policy);
    if (args.write) await writeJsonAtomic(path.resolve(String(args.write)), result);
    if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else process.stdout.write(formatAssetReport(result));
    if (!result.ok) process.exitCode = 1;
  }
} catch (error) { fail(error); }
