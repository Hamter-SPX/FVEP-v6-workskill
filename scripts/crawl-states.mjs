#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { crawlInteractionStatesAll } from '../lib/state-crawler-engine.mjs';
const HELP = `Usage: node scripts/crawl-states.mjs [options]\n  -c, --config <path>\n      --base-url <url>\n      --headed\n      --route/--viewport/--state/--case <value>\n`;
try {
  const args = parseCli({ 'base-url': { type: 'string' }, headed: { type: 'boolean', default: false }, route: { type: 'string' }, viewport: { type: 'string' }, state: { type: 'string' }, case: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const filters = { route: args.route, viewport: args.viewport, state: args.state, case: args.case };
    const results = await crawlInteractionStatesAll(config, { baseUrl: args['base-url'], headed: args.headed, filters });
    const failed = results.filter((item) => !item.ok).length; process.stdout.write(`State-crawler cases: ${results.length}; failed: ${failed}\n`); if (failed) process.exitCode = 1;
  }
} catch (error) { fail(error); }
