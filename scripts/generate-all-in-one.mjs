#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { writeMarkdownBundle } from '../lib/document-bundle-engine.mjs';

const HELP = `Usage: node scripts/generate-all-in-one.mjs [--root <directory>] [--output <relative.md>]
Generates the deterministic v5 all-in-one Markdown reference from authoritative modular documents.`;
try {
  const args = parseCli({
    root: { type: 'string', default: '.' },
    output: { type: 'string', default: 'FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md' }
  });
  if (args.help) printHelp(HELP);
  else {
    const root = path.resolve(args.root);
    const result = await writeMarkdownBundle(root, args.output);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
} catch (error) { fail(error); }
