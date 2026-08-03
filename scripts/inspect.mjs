#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { inspectAll } from '../lib/inspect-engine.mjs';
const HELP = `Usage: node scripts/inspect.mjs [-c config] [--base-url url] [--headed] [--route name] [--viewport name] [--state name] [--case key]`;
try {
  const args = parseCli({ 'base-url': { type: 'string' }, headed: { type: 'boolean', default: false }, route: { type: 'string' }, viewport: { type: 'string' }, state: { type: 'string' }, case: { type: 'string' } });
  if (args.help) printHelp(HELP);
  else {
    const config = await loadConfig(args.config);
    const results = await inspectAll(config, { baseUrl: args['base-url'], headed: args.headed, filters: { route: args.route, viewport: args.viewport, state: args.state, case: args.case } });
    const overflow = results.filter((item) => item.horizontalOverflow); const failed = results.filter((item) => !item.ok);
    process.stdout.write(`Inspected ${results.length} cases; ${overflow.length} overflow cases; ${failed.length} failed.\n`);
    if (overflow.length || failed.length) process.exitCode = 1;
  }
} catch (error) { fail(error); }
