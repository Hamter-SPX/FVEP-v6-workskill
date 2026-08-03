#!/usr/bin/env node
import { auditMigrationPlan } from '../lib/migration-risk-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-migrations.mjs --input <migration-plan.json> [--output <report.json>]`;
try { const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } }); if (args.help) printHelp(HELP); else { const report = auditMigrationPlan(await readJsonFile(args.input, 'migration plan')); await emitJson(report, args.output); setAuditExitCode(report); } } catch (error) { fail(error); }
