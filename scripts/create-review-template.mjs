#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { enumerateCases, loadConfig } from '../lib/config.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import { REVIEW_DIMENSIONS } from '../lib/manual-review-engine.mjs';
import { createRunProvenance } from '../lib/provenance.mjs';
const HELP = `Usage: node scripts/create-review-template.mjs [options]\n  -c, --config <path>\n      --output <path>\n      --reviewer <name>\n`;
try {
  const args = parseCli({ output: { type: 'string' }, reviewer: { type: 'string', default: 'unassigned-reviewer' } });
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const provenance = createRunProvenance(config);
    const output = path.resolve(config.baseDir, args.output ?? config.manualReview.path ?? 'semantic-visual-review.json');
    const ratings = Object.fromEntries(REVIEW_DIMENSIONS.map((dimension) => [dimension, 0]));
    const document = {
      schemaVersion: 2,
      reviewer: args.reviewer,
      reviewedAt: new Date().toISOString(),
      decision: 'changes-requested',
      configHash: provenance.configHash,
      instructions: 'Review every case from current screenshots. Replace draft ratings and blockers, then set decision to approved only when acceptance criteria are satisfied.',
      cases: enumerateCases(config, { mode: 'current' }).map((item) => ({
        key: item.key,
        route: item.routeName,
        viewport: item.viewportName,
        state: item.stateName,
        decision: 'changes-required',
        ratings: { ...ratings },
        blockers: ['Semantic visual review is not complete.'],
        residualDeviations: [],
        notes: []
      }))
    };
    await writeJsonAtomic(output, document); process.stdout.write(`Semantic review template: ${output}\nConfig hash: ${provenance.configHash}\nCases: ${document.cases.length}\n`);
  }
} catch (error) { fail(error); }
