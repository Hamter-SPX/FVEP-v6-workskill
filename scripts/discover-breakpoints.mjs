#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { discoverBreakpoints } from '../lib/breakpoint-engine.mjs';
const HELP = `Usage: node scripts/discover-breakpoints.mjs [options]\n  -c, --config <path>\n      --base-url <url>\n      --headed\n      --route/--state <value>\n`;
try {
  const args = parseCli({ 'base-url': { type: 'string' }, headed: { type: 'boolean', default: false }, route: { type: 'string' }, state: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const result = await discoverBreakpoints(config, { baseUrl: args['base-url'], headed: args.headed, filters: { route: args.route, state: args.state } });
    process.stdout.write(`Breakpoint candidates: ${result.candidateCount ?? 0}; overflow samples: ${result.overflowSampleCount ?? 0}; report: ${result.reportPath ?? 'disabled'}\n`); if (result.ok === false) process.exitCode = 1;
  }
} catch (error) { fail(error); }
