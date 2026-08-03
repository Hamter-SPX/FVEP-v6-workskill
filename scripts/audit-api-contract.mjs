#!/usr/bin/env node
import { auditApiContract, compareApiContracts } from '../lib/api-contract-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-api-contract.mjs --input <openapi.json> [--baseline <openapi.json>] [--output <report.json>]\n      --allow-public             Do not require a security declaration\n      --allow-non-idempotent     Do not require mutation idempotency declarations`;
try {
  const args = parseCli({ input: { type: 'string' }, baseline: { type: 'string' }, output: { type: 'string' }, 'allow-public': { type: 'boolean', default: false }, 'allow-non-idempotent': { type: 'boolean', default: false } });
  if (args.help) printHelp(HELP); else {
    const current = await readJsonFile(args.input, 'current API contract');
    const audit = auditApiContract(current, { requireSecurity: !args['allow-public'], requireMutationIdempotency: !args['allow-non-idempotent'] });
    const compatibility = args.baseline ? compareApiContracts(await readJsonFile(args.baseline, 'baseline API contract'), current) : null;
    const report = { schemaVersion: 3, status: audit.status === 'fail' || compatibility?.compatible === false ? 'fail' : audit.status, audit, compatibility };
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
