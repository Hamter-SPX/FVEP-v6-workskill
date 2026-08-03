#!/usr/bin/env node
import { captureAll } from '../lib/capture-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
const HELP = `
Usage: node scripts/capture.mjs [options]
  -c, --config <path>       Config file
      --mode <value>        current or reference
      --base-url <url>      Override current/reference base URL
      --headed              Show browser
      --route <name>        Filter route
      --viewport <name>     Filter viewport
      --state <name>        Filter state
      --case <key>          Filter exact artifact key
  -h, --help                Show help
`;
try {
  const args = parseCli({ mode: { type: 'string', default: 'current' }, 'base-url': { type: 'string' }, headed: { type: 'boolean', default: false }, route: { type: 'string' }, viewport: { type: 'string' }, state: { type: 'string' }, case: { type: 'string' } });
  if (args.help) printHelp(HELP);
  else {
    const config = await loadConfig(args.config);
    const results = await captureAll(config, { mode: args.mode, baseUrl: args['base-url'], headed: args.headed, filters: { route: args.route, viewport: args.viewport, state: args.state, case: args.case } });
    const failed = results.filter((item) => !item.ok);
    process.stdout.write(`Captured ${results.length} cases; ${failed.length} failed.\n`);
    if (failed.length) process.exitCode = 1;
  }
} catch (error) { fail(error); }
