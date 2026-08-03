#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
import { auditTddCycles } from '../lib/tdd-evidence-engine.mjs';
const HELP = `Usage: node scripts/validate-tdd.mjs --input <tdd-cycles.json> [--output <report.json>]\nValidates RED-GREEN-REFACTOR chronology, identity, hashes, and negative controls.`;
try {
  const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    if (!args.input) throw new TypeError('--input is required.');
    const input = await readJsonFile(args.input, 'TDD evidence');
    const report = auditTddCycles(input.cycles ?? input.tdd ?? input, input.policy ?? {});
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
