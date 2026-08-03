#!/usr/bin/env node
import { auditSecurityContract } from '../lib/security-review-engine.mjs';
import { collectSourceFiles, scanSourceFiles } from '../lib/source-risk-scanner.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-security.mjs [--input <security.json>] [--source-root <path>] [--output <report.json>]\nAt least one of --input or --source-root is required.`;
try {
  const args = parseCli({ input: { type: 'string' }, 'source-root': { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    if (!args.input && !args['source-root']) throw new TypeError('At least one of --input or --source-root is required.');
    const contract = args.input ? auditSecurityContract(await readJsonFile(args.input, 'security contract')) : null;
    const source = args['source-root'] ? scanSourceFiles(await collectSourceFiles(args['source-root'])) : null;
    const blockers = [...(contract?.blockers ?? []), ...(source?.blockers ?? [])];
    const report = { schemaVersion: 3, status: blockers.length ? 'fail' : (contract?.status === 'warning' || source?.status === 'warning' ? 'warning' : 'pass'), contract, source, blockers };
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
