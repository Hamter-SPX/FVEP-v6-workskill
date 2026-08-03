#!/usr/bin/env node
import { auditA11yAll } from '../lib/a11y-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
const HELP = `Usage: node scripts/audit-a11y.mjs [-c config] [--base-url url] [--headed] [--route name] [--viewport name] [--state name] [--case key]`;
try {
  const args = parseCli({ 'base-url': { type: 'string' }, headed: { type: 'boolean', default: false }, route: { type: 'string' }, viewport: { type: 'string' }, state: { type: 'string' }, case: { type: 'string' } });
  if (args.help) printHelp(HELP);
  else {
    const config = await loadConfig(args.config);
    const results = await auditA11yAll(config, { baseUrl: args['base-url'], headed: args.headed, filters: { route: args.route, viewport: args.viewport, state: args.state, case: args.case } });
    const blocking = results.reduce((sum, item) => sum + (item.blockingViolationCount ?? 0), 0); const failed = results.filter((item) => !item.ok);
    process.stdout.write(`Audited ${results.length} cases; ${blocking} blocking violations; ${failed.length} failed.\n`);
    if (blocking || failed.length) process.exitCode = 1;
  }
} catch (error) { fail(error); }
