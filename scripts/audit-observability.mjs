#!/usr/bin/env node
import { auditObservabilityContract } from '../lib/observability-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-observability.mjs --input <observability.json> [--output <report.json>]`;
try { const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } }); if (args.help) printHelp(HELP); else { const report = auditObservabilityContract(await readJsonFile(args.input, 'observability contract')); await emitJson(report, args.output); setAuditExitCode(report); } } catch (error) { fail(error); }
