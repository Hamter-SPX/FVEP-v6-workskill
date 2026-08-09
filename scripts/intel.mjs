#!/usr/bin/env node
/**
 * Run intelligence report. Reads the store every vision-loop run maintains
 * under <outputDir>/.fx/intel/ (lib/run-intel-store.mjs) and prints the five
 * rule-based insight families from lib/run-intel-engine.mjs — recurring rules,
 * failure streaks, device correlations, resolved rules, pass→fail regressions.
 * Advisory only: insights never change the exit code. --purge is the only
 * mutating path; it refuses to run without an explicit --yes (no prompts in a
 * gate-tool CLI) and lists every file it deleted.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { analyzeRunIntel } from '../lib/run-intel-engine.mjs';

const HELP = `Usage:
  node scripts/intel.mjs [--output-dir <dir>] [--window-days <n>] [--json]
  node scripts/intel.mjs --purge --yes [--output-dir <dir>] [--json]

Reads the run-intelligence store under <outputDir>/.fx/intel/ and prints
evidence-backed insights from recorded vision-loop runs: recurring rules,
consecutive-failure streaks, device correlations, resolved rules, and
pass→fail regressions. Advisory only — the exit code stays 0 for any insight.

Options:
  -o, --output-dir <dir>   Vision loop output directory (default: .; positional works too)
  --window-days <n>        Analysis window in days (default: 14)
  --json                   Print the full analysis JSON instead of text lines
  --purge                  Delete the intel store; requires --yes (never prompts)
  --yes                    Non-interactive confirmation for --purge
  -h, --help               Show help

Examples:
  npm run intel -- --output-dir artifacts/vision-loop
  npm run intel -- --output-dir artifacts/vision-loop --window-days 30 --json
  npm run intel -- --output-dir artifacts/vision-loop --purge --yes
`;

function streakSuffix(streak) {
  const parts = [];
  if (streak.case_key != null) parts.push(`case '${streak.case_key}'`);
  if (streak.device != null) parts.push(`device '${streak.device}'`);
  if (streak.lastRunId != null) parts.push(`run ล่าสุด ${streak.lastRunId}`);
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

function printTextReport(analysis, { outputDir, windowDays }) {
  const { totals } = analysis;
  process.stdout.write(`Run intelligence: ${totals.runsInWindow} run(s), ${totals.findingsInWindow} finding(s) over the last ${windowDays} day(s) (store: ${totals.dbMode}, dir: ${outputDir})\n`);
  let printed = 0;
  if (analysis.recurring.length > 0) {
    process.stdout.write('สถิติ run (rule ที่กลับมาเรื่อยๆ):\n');
    for (const entry of analysis.recurring) process.stdout.write(`  ${entry.insight}\n`);
    printed += analysis.recurring.length;
  }
  if (analysis.streaks.length > 0) {
    process.stdout.write('สตรีค (ล้มติดกัน):\n');
    for (const entry of analysis.streaks) process.stdout.write(`  rule '${entry.rule}' ล้มติดกัน ${entry.consecutiveFailures} รัน${streakSuffix(entry)}\n`);
    printed += analysis.streaks.length;
  }
  if (analysis.correlations.length > 0) {
    process.stdout.write('สหสัมพันธ์ device:\n');
    for (const entry of analysis.correlations) process.stdout.write(`  ${entry.note}\n`);
    printed += analysis.correlations.length;
  }
  if (analysis.resolved.length > 0) {
    process.stdout.write('หายแล้ว (ไม่พบในรันล่าสุด):\n');
    for (const entry of analysis.resolved) process.stdout.write(`  ${entry.note}\n`);
    printed += analysis.resolved.length;
  }
  if (analysis.regressions.length > 0) {
    process.stdout.write('รีเกรสชัน (เคสที่เคยผ่านแล้วกลับมาล้ม):\n');
    for (const entry of analysis.regressions) {
      const [fromPassRunId, toFailRunId] = entry.fromPassedToFailedRunIds;
      process.stdout.write(`  case '${entry.case_key}' เปลี่ยนจากผ่านเป็นล้ม (run ${fromPassRunId} → ${toFailRunId})\n`);
    }
    printed += analysis.regressions.length;
  }
  if (printed === 0) {
    process.stdout.write('ยังไม่มี insight — รัน vision-loop เพิ่มให้ rule ซ้ำกันข้ามรัน หรือขยาย --window-days\n');
  }
  process.stdout.write('Advisory report — the exit code is 0 regardless of insights.\n');
}

// Recursive relative file listing so the purge report names every deleted
// file even when unexpected nested content exists under .fx/intel/.
async function listFilesRecursive(dir, base = dir) {
  let found = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found = found.concat(await listFilesRecursive(full, base));
    else found.push(path.relative(base, full));
  }
  return found;
}

// Purge never opens the store (opening would recreate it): enumerate what is
// on disk first, then drop the whole directory tree. The deleted-file list is
// the report — operational transparency, not a prompt substitute.
async function purgeStore(outputDir, { json }) {
  const intelDir = path.join(outputDir, '.fx', 'intel');
  let deletedFiles = [];
  try { deletedFiles = await listFilesRecursive(intelDir); } catch { deletedFiles = []; }
  await fs.rm(intelDir, { recursive: true, force: true });
  if (json) {
    process.stdout.write(`${JSON.stringify({ purged: deletedFiles.length > 0, outputDir, intelDir, deletedFiles }, null, 2)}\n`);
  } else if (deletedFiles.length === 0) {
    process.stdout.write(`No run-intelligence store found under ${outputDir} — nothing to purge.\n`);
  } else {
    process.stdout.write(`Purged run-intelligence store: ${deletedFiles.length} file(s) deleted under ${intelDir}\n`);
    for (const name of deletedFiles) process.stdout.write(`  ${name}\n`);
  }
}

try {
  // parseLooseArgs only understands --long flags; expand the short aliases
  // the interface promises before handing argv over.
  const argv = process.argv.slice(2).map((token) => {
    if (token === '-o') return '--output-dir';
    if (token === '-h') return '--help';
    return token;
  });
  const args = parseLooseArgs(argv);
  if (args.help) printHelp(HELP);
  else {
    const outputDir = path.resolve(String(args['output-dir'] ?? args._[0] ?? '.'));
    if (args.purge) {
      if (args.yes !== true) {
        throw new Error('--purge deletes the run-intelligence store under <outputDir>/.fx/intel/ permanently; this CLI never prompts — pass --yes to confirm.');
      }
      await purgeStore(outputDir, { json: args.json === true });
    } else {
      const windowDays = Number(args['window-days'] ?? 14);
      if (!Number.isFinite(windowDays) || windowDays <= 0) {
        throw new Error(`--window-days must be a positive number, got '${args['window-days']}'.`);
      }
      const analysis = await analyzeRunIntel(outputDir, { windowDays });
      if (args.json) {
        process.stdout.write(`${JSON.stringify({ outputDir, windowDays, ...analysis }, null, 2)}\n`);
      } else {
        printTextReport(analysis, { outputDir, windowDays });
      }
    }
  }
} catch (error) { fail(error); }
