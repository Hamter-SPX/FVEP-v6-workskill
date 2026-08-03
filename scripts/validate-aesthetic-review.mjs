#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { emitJson, readJsonFile } from '../lib/contract-cli.mjs';
import { evaluateAestheticReview, loadAestheticReview } from '../lib/aesthetic-review-engine.mjs';
import { createRunProvenance } from '../lib/provenance.mjs';

const HELP = `Usage: node scripts/validate-aesthetic-review.mjs [options]
  -c, --config <path>     Vision-loop config supplying aesthetics.reviewPath and expected cases
      --input <path>      Validate a review file directly instead of resolving it from config
      --output <path>     Write the evaluation to a file instead of stdout

Validates an aesthetic review against schemas/aesthetic-review.schema.json semantics: dimension
floors, supporting findings, reviewer independence, freshness, and case coverage.`;

try {
  const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP);
  else if (args.input) {
    const evaluation = evaluateAestheticReview(await readJsonFile(args.input, 'aesthetic review'));
    await emitJson(evaluation, args.output);
    if (!evaluation.passed) process.exitCode = 1;
  } else {
    const config = await loadConfig(args.config);
    const evidence = await loadAestheticReview(config, createRunProvenance(config).configHash);
    if (!evidence || evidence.missing) {
      process.stdout.write(`Aesthetic review missing: ${evidence?.path ?? 'aesthetics.reviewPath is not configured'}\n`);
      process.exitCode = 1;
    } else if (evidence.invalid || !evidence.evaluation) {
      process.stdout.write(`Aesthetic review invalid: ${evidence.error ?? 'evaluation unavailable'}\n`);
      process.exitCode = 1;
    } else {
      await emitJson(evidence.evaluation, args.output);
      if (!evidence.evaluation.passed) process.exitCode = 1;
    }
  }
} catch (error) { fail(error); }
