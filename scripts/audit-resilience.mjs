#!/usr/bin/env node
import { auditResilienceContract } from '../lib/resilience-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-resilience.mjs --input <resilience.json> [--output <report.json>]`;
try { const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } }); if (args.help) printHelp(HELP); else { const report = auditResilienceContract(await readJsonFile(args.input, 'resilience contract')); await emitJson(report, args.output); setAuditExitCode(report); } } catch (error) { fail(error); }
