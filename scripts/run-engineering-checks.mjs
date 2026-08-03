#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { runEngineeringChecks } from '../lib/engineering.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
const HELP = `Usage: node scripts/run-engineering-checks.mjs [-c config]`;
try {
  const args = parseCli();
  if (args.help) printHelp(HELP);
  else {
    const config = await loadConfig(args.config); const results = await runEngineeringChecks(config);
    const reportPath = path.join(config.outputDir, 'reports', 'engineering-checks.json'); await writeJsonAtomic(reportPath, { schemaVersion: 1, generatedAt: new Date().toISOString(), results });
    const failed = results.filter((item) => item.required && !item.ok); process.stdout.write(`Ran ${results.length} engineering checks; ${failed.length} required failures. Report: ${reportPath}\n`); if (failed.length) process.exitCode = 1;
  }
} catch (error) { fail(error); }
