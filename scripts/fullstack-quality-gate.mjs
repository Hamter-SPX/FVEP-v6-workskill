#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { readJsonFile } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/fullstack-quality-gate.mjs --report <fullstack-report.json>`;
try {
  const args = parseCli({ report: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const report = await readJsonFile(args.report, 'full-stack report');
    const quality = report.quality ?? {};
    process.stdout.write(`Full-stack quality gate: ${quality.passed ? 'PASS' : 'FAIL'}\nQuality score: ${quality.score ?? 0}/100\nEvidence confidence: ${quality.confidence ?? 0}%\nHard failures: ${(quality.hardFailures ?? []).join(', ') || 'none'}\n`);
    if (!quality.passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }
