#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
const HELP = `Usage: node scripts/quality-gate.mjs [options]\n  -c, --config <path>\n      --summary <path>\n      --automated-only      Do not require recorded semantic approval\n`;
try {
  const args = parseCli({ summary: { type: 'string' }, 'automated-only': { type: 'boolean', default: false } });
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const summaryPath = path.resolve(args.summary ?? path.join(config.outputDir, 'reports', 'run-summary.json'));
    const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'));
    const automated = Boolean(summary.automatedGatePassed && summary.quality?.passed);
    const semantic = Boolean(summary.semanticVisualReviewPassed && summary.releaseDecision === 'approved-by-recorded-semantic-visual-review');
    const passed = automated && (args['automated-only'] || semantic);
    process.stdout.write(`Quality gate: ${passed ? 'PASS' : 'FAIL'}\nAutomated: ${automated ? 'PASS' : 'FAIL'}\nSemantic approval: ${semantic ? 'PASS' : 'PENDING/FAIL'}\nSummary: ${summaryPath}\n`);
    if (!passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }
