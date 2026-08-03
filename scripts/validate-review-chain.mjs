#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
import { auditReviewChain } from '../lib/review-governance-engine.mjs';
const HELP = `Usage: node scripts/validate-review-chain.mjs --input <review-chain.json> [--output <report.json>]\nValidates reviewer independence, spec and quality verdicts, fix rounds, and final review.`;
try {
  const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    if (!args.input) throw new TypeError('--input is required.');
    const input = await readJsonFile(args.input, 'review chain');
    const report = auditReviewChain(input.review ?? input, input.policy ?? {});
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
