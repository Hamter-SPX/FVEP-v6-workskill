#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { loadFullstackConfig } from '../lib/fullstack-config.mjs';
import { runConfiguredFullstackAudit } from '../lib/fullstack-runner.mjs';
const HELP = `Usage: node scripts/audit-fullstack.mjs [options]\n  -c, --config <path>   Full-stack configuration (default: fullstack.config.json)\n  -h, --help            Show help\n`;
try {
  const args = parseCli({}, process.argv.slice(2));
  if (args.help) printHelp(HELP); else {
    const config = await loadFullstackConfig(args.config === 'vision-loop.config.json' ? 'fullstack.config.json' : args.config);
    const result = await runConfiguredFullstackAudit(config);
    process.stdout.write(`Full-stack gate: ${result.report.quality.passed ? 'PASS' : 'FAIL'}\nQuality: ${result.report.quality.score}/100\nEvidence confidence: ${result.report.quality.confidence}%\nJSON: ${result.jsonPath}\nMarkdown: ${result.markdownPath}\n`);
    if (!result.report.quality.passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }
