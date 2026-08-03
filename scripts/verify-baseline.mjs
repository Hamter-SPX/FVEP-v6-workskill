#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { verifyBaselineForConfig } from '../lib/baseline-engine.mjs';
import { loadConfig } from '../lib/config.mjs';
const HELP = `Usage: node scripts/verify-baseline.mjs [options]\n  -c, --config <path>\n      --manifest <path>\n`;
try {
  const args = parseCli({ manifest: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const result = await verifyBaselineForConfig(config, { manifestPath: args.manifest });
    process.stdout.write(`${JSON.stringify({ valid: result.valid, checked: result.checked, changed: result.changed, missing: result.missing, configMatches: result.configMatches, approvalValid: result.approvalValid, manifestPath: result.manifestPath }, null, 2)}\n`);
    if (!result.valid) process.exitCode = 1;
  }
} catch (error) { fail(error); }
