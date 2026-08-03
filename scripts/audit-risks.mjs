#!/usr/bin/env node
import { evaluateRiskRegister } from '../lib/risk-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-risks.mjs --input <risk-register.json> [--output <report.json>]`;
try { const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } }); if (args.help) printHelp(HELP); else { const report = evaluateRiskRegister(await readJsonFile(args.input, 'risk register')); await emitJson(report, args.output); setAuditExitCode(report); } } catch (error) { fail(error); }
