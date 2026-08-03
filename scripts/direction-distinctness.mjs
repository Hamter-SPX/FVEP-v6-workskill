#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import {
  auditDirectionDistinctness,
  formatDirectionDistinctnessReport
} from '../lib/direction-distinctness-engine.mjs';

const HELP = `Usage:
  node scripts/direction-distinctness.mjs --options <options.json>
  node scripts/direction-distinctness.mjs --option '<json>' --option '<json>'

Gate visual direction options BEFORE showing them to the user.
Fails when options are too similar or lack a clear novelty concept.

options.json:
{
  "options": [
    {
      "number": 1,
      "thesis": "Dense utilitarian field chrome with monospace telemetry",
      "noveltyConcept": "Instrument densemap as the primary surface language",
      "changes": "Tighter rhythm, utilitarian chrome, mono readouts",
      "stays": "Capture CTA and mode switcher",
      "personality": {
        "seriousPlayful": 2,
        "warmClinical": 4,
        "understatedExpressive": 2,
        "denseSpacious": 1,
        "establishedNovel": 3
      }
    }
  ]
}

Exit 1 when ok=false (do not present that option set).
`;

function asList(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

try {
  const args = parseLooseArgs();
  if (args.help || args.h) printHelp(HELP);
  else {
    const options = [];
    if (args.options) {
      const raw = JSON.parse(await fs.readFile(path.resolve(String(args.options)), 'utf8'));
      const list = Array.isArray(raw) ? raw : raw.options;
      if (!Array.isArray(list)) throw new Error('options file must be an array or { "options": [...] }');
      options.push(...list);
    }
    for (const item of asList(args.option)) {
      options.push(typeof item === 'string' ? JSON.parse(item) : item);
    }
    if (!options.length) {
      printHelp(HELP);
      process.exitCode = 1;
    } else {
      const result = auditDirectionDistinctness(options, {
        minAxisDifferences: args['min-axis-diff'],
        minAxisDeltaSum: args['min-delta-sum'],
        maxThesisOverlap: args['max-overlap']
      });
      if (args.write) await writeJsonAtomic(path.resolve(String(args.write)), result);
      if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else process.stdout.write(formatDirectionDistinctnessReport(result));
      if (!result.ok) process.exitCode = 1;
    }
  }
} catch (error) { fail(error); }
