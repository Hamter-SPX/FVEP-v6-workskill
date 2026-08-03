#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { compareAll } from '../lib/compare-engine.mjs';
import { loadConfig } from '../lib/config.mjs';
const HELP = `Usage: node scripts/compare.mjs [-c config] [--route name] [--viewport name] [--state name] [--case key]`;
try {
  const args = parseCli({ route: { type: 'string' }, viewport: { type: 'string' }, state: { type: 'string' }, case: { type: 'string' } });
  if (args.help) printHelp(HELP);
  else {
    const config = await loadConfig(args.config); const result = await compareAll(config, { filters: { route: args.route, viewport: args.viewport, state: args.state, case: args.case } });
    process.stdout.write(`Compared ${result.total} cases. HTML report: ${result.reportHtml}\n`); if (!result.ok) process.exitCode = 1;
  }
} catch (error) { fail(error); }
