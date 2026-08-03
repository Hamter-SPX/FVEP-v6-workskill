#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { loadSemanticVisualReview } from '../lib/manual-review-engine.mjs';
import { createRunProvenance } from '../lib/provenance.mjs';
const HELP = `Usage: node scripts/validate-manual-review.mjs [options]\n  -c, --config <path>\n`;
try {
  const args = parseCli({});
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const evidence = await loadSemanticVisualReview(config, createRunProvenance(config).configHash);
    if (!evidence || evidence.missing) { process.stdout.write(`Semantic review missing: ${evidence?.path ?? 'manualReview.path is not configured'}\n`); process.exitCode = 1; }
    else { process.stdout.write(`${JSON.stringify(evidence.evaluation, null, 2)}\n`); if (!evidence.evaluation.passed) process.exitCode = 1; }
  }
} catch (error) { fail(error); }
