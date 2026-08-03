#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import {
  auditScene,
  formatSceneReport,
  measureSceneFromPng
} from '../lib/scene-completeness-engine.mjs';

const HELP = `Usage:
  node scripts/audit-scene.mjs --image frame.png [--brief scene-brief.json] [options]
  node scripts/audit-scene.mjs --brief scene-brief.json

Audits whether a rendered game frame is finished in every corner, not only at the subject.

Options:
  --image <path>          Rendered frame (PNG)
  --brief <path>          Scene brief JSON (fantasy, layers, focalPoint, lighting, storyDetails)
  --grid <CxR>            Zone grid (default 6x4)
  --min-zone-detail <n>   Detail floor per zone (default 0.08)
  --min-focal-ratio <n>   Required focal/median detail ratio (default 1.35)
  --max-focal-ratio <n>   Above this the subject is isolated in an empty frame (default 12)
  --max-dead-ratio <n>    Allowed share of low-detail zones (default 0.15)
  --allow-flat-background Treat flat backdrops as intentional (studio/product shots)
  --write <path>          Write the JSON result
  --json                  Emit JSON instead of the text report
  -h, --help

Exit 1 when the scene fails, so the loop keeps iterating until every corner is finished.

Example:
  npm run audit:scene -- --image artifacts/frame.png --brief design/scene-brief.json --grid 8x5
`;

try {
  const args = parseLooseArgs();
  if (args.help || args.h) printHelp(HELP);
  else if (!args.image && !args.brief) {
    printHelp(HELP);
    process.exitCode = 1;
  } else {
    const policy = {
      grid: args.grid,
      minZoneDetail: args['min-zone-detail'],
      minCornerDetail: args['min-corner-detail'],
      maxDeadZoneRatio: args['max-dead-ratio'],
      minFocalRatio: args['min-focal-ratio'],
      maxFocalRatio: args['max-focal-ratio'],
      maxRepeatedPairs: args['max-repeated-pairs'],
      allowFlatBackground: args['allow-flat-background'] === true
    };
    for (const key of Object.keys(policy)) if (policy[key] === undefined) delete policy[key];

    const measurement = args.image
      ? await measureSceneFromPng(path.resolve(String(args.image)), policy)
      : null;
    const brief = args.brief
      ? JSON.parse(await fs.readFile(path.resolve(String(args.brief)), 'utf8'))
      : null;

    const result = auditScene({ measurement, brief: brief?.scene ?? brief }, policy);

    if (args.write) await writeJsonAtomic(path.resolve(String(args.write)), result);
    if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else process.stdout.write(formatSceneReport(result));
    if (!result.ok) process.exitCode = 1;
  }
} catch (error) { fail(error); }
