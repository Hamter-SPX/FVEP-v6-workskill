#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { compareTokenProfileSets, extractTokenProfiles, loadStoredTokenProfiles } from '../lib/token-engine.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
const HELP = `Usage: node scripts/extract-tokens.mjs [options]\n  -c, --config <path>\n      --mode <current|reference|compare>\n      --base-url <url>\n      --reference-url <url>\n      --headed\n      --route/--viewport/--state/--case <value>\n`;
try {
  const args = parseCli({ mode: { type: 'string', default: 'current' }, 'base-url': { type: 'string' }, 'reference-url': { type: 'string' }, headed: { type: 'boolean', default: false }, route: { type: 'string' }, viewport: { type: 'string' }, state: { type: 'string' }, case: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const filters = { route: args.route, viewport: args.viewport, state: args.state, case: args.case };
    if (!['current', 'reference', 'compare'].includes(args.mode)) throw new Error('--mode must be current, reference, or compare.');
    if (args.mode !== 'compare') {
      const baseUrl = args.mode === 'reference' ? (args['reference-url'] ?? args['base-url'] ?? config.referenceBaseUrl) : args['base-url'];
      if (args.mode === 'reference' && !baseUrl) throw new Error('Reference extraction requires --reference-url, --base-url, or referenceBaseUrl.');
      const results = await extractTokenProfiles(config, { mode: args.mode, baseUrl, headed: args.headed, filters });
      process.stdout.write(`Token profiles (${args.mode}): ${results.length}; report: ${results.reportPath}\n`);
    } else {
      const current = await loadStoredTokenProfiles(config, { mode: 'current', filters }); const reference = await loadStoredTokenProfiles(config, { mode: 'reference', filters });
      const comparisons = compareTokenProfileSets(reference.filter((item) => item.ok), current.filter((item) => item.ok));
      const reportPath = path.join(config.outputDir, 'reports', 'token-drift.json'); await writeJsonAtomic(reportPath, { schemaVersion: 2, generatedAt: new Date().toISOString(), comparisons });
      const failed = comparisons.filter((item) => Number(item.driftScore) > config.tokens.maxDriftScore).length;
      process.stdout.write(`Token comparisons: ${comparisons.length}; over policy: ${failed}; report: ${reportPath}\n`); if (failed) process.exitCode = 1;
    }
  }
} catch (error) { fail(error); }
