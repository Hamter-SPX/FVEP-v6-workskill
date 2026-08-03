#!/usr/bin/env node
import { auditExperienceContract } from '../lib/experience-contract-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-experience.mjs --input <contract.json> [--output <report.json>]`;
try { const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } }); if (args.help) printHelp(HELP); else { const report = auditExperienceContract(await readJsonFile(args.input, 'experience contract')); await emitJson(report, args.output); setAuditExitCode(report); } } catch (error) { fail(error); }
