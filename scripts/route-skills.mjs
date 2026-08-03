#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
import { routeProcessSkills } from '../lib/skill-router-engine.mjs';
const HELP = `Usage: node scripts/route-skills.mjs --input <request.json> [--output <report.json>]\nRoutes process skills from explicit task context and emits binding constraints.`;
try {
  const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    if (!args.input) throw new TypeError('--input is required.');
    const input = await readJsonFile(args.input, 'request context');
    const report = routeProcessSkills(input.request ?? input, input.policy ?? {});
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
