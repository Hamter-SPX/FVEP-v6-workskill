#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
import { prepareIntegrationDecision } from '../lib/integration-decision-engine.mjs';
const HELP = `Usage: node scripts/prepare-integration.mjs --input <integration.json> [--output <report.json>]\nValidates a human-owned merge, PR, keep, or explicitly confirmed discard decision without executing it.`;
try {
  const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    if (!args.input) throw new TypeError('--input is required.');
    const input = await readJsonFile(args.input, 'integration decision');
    const report = prepareIntegrationDecision(input.integration ?? input, input.policy ?? {});
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
