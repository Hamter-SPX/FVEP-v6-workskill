#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadProcessConfig } from '../lib/process-config.mjs';
import { runConfiguredProcessAudit } from '../lib/process-orchestrator.mjs';

const HELP = `Usage: node scripts/audit-process.mjs [--config <process.config.json>]\nRuns the deterministic v4 process audit and writes JSON and Markdown evidence reports.`;
try {
  const args = parseCli({ config: { type: 'string', short: 'c', default: 'process.config.json' } });
  if (args.help) printHelp(HELP);
  else {
    const config = await loadProcessConfig(args.config);
    const result = await runConfiguredProcessAudit(config);
    process.stdout.write(`${result.paths.json}\n${result.paths.markdown}\n`);
    if (!result.report.processGate.releaseEligible) process.exitCode = 1;
  }
} catch (error) { fail(error); }
