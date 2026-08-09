#!/usr/bin/env node
/**
 * Advisory remediation report. Rebuilds the prioritized plan with the same
 * buildRemediationPlan engine the run summary uses (lib/remediation.mjs) from
 * the reports a prior vision loop run left on disk:
 *   - reports/comparison.json          -> sections.comparison
 *   - metadata/*.mobile.judgment.json  -> sections.mobileChecks
 *   - reports/run-summary.json         -> baseline/manualReview/aesthetics
 *     (run-summary stores section summaries, not entries; the summary shapes
 *     keep the fields the plan reads, so they fold back in)
 * Prints one line per finding with curated why/action/verify guidance. This is
 * a report, not a gate: a non-empty plan never changes the exit code.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { buildRemediationPlan } from '../lib/remediation.mjs';

const HELP = `Usage:
  node scripts/remediate.mjs [--output-dir <dir>] [--json]

Rebuilds the prioritized remediation plan from the reports a vision loop run
left under --output-dir (reports/comparison.json, metadata/*.mobile.judgment.json,
and reports/run-summary.json when present) and prints one advisory line per
finding, blockers first:
  [SEVERITY] <category> — <finding> (case: <key>) | ทำไม: <why> | แก้: <action> | ตรวจ: <verify>

Advisory only: exits 0 even when the plan is non-empty. Missing or unreadable
reports degrade to absent sections; nothing is written.

Options:
  -o, --output-dir <dir>   Vision loop output directory (default: .; positional works too)
  --json                   Print the full plan JSON instead of text lines
  -h, --help               Show help

Example:
  npm run remediate -- --output-dir .vision-output
`;

const MOBILE_JUDGMENT_SUFFIX = '.mobile.judgment.json';

async function readJsonIfExists(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; }
}

// Each mobile judgment file is one check entry for the plan: the file stem is
// the case key, the parsed body carries verdict + findings.
async function readMobileChecks(metadataDir) {
  let entries = [];
  try { entries = await fs.readdir(metadataDir, { withFileTypes: true }); } catch { return []; }
  const checks = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(MOBILE_JUDGMENT_SUFFIX)) continue;
    const parsed = await readJsonIfExists(path.join(metadataDir, entry.name));
    if (!parsed) continue;
    checks.push({
      key: entry.name.slice(0, -MOBILE_JUDGMENT_SUFFIX.length),
      verdict: parsed.verdict ?? null,
      findings: Array.isArray(parsed.findings) ? parsed.findings : []
    });
  }
  return checks.sort((a, b) => a.key.localeCompare(b.key));
}

function sectionsFromRunSummary(summary) {
  const sections = {};
  const baseline = summary?.sections?.baseline;
  if (baseline) {
    sections.baseline = {
      valid: Boolean(baseline.valid),
      missingManifest: Boolean(baseline.missingManifest),
      configMatches: Boolean(baseline.configMatches),
      approvalValid: Boolean(baseline.approvalValid)
    };
  }
  const manualReview = summary?.sections?.manualReview;
  if (manualReview) {
    sections.manualReview = manualReview.missing
      ? { missing: true }
      : { missing: false, evaluation: { passed: Boolean(manualReview.passed), score: manualReview.score ?? 0 } };
  }
  const aesthetics = summary?.sections?.aesthetics;
  if (aesthetics) {
    sections.aesthetics = {
      passed: Boolean(aesthetics.passed),
      score: aesthetics.score ?? 0,
      evidenceConfidence: aesthetics.evidenceConfidence ?? 0,
      paths: { missing: Array.isArray(aesthetics.missingPaths) ? aesthetics.missingPaths : [] }
    };
  }
  return sections;
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
    const outputDir = path.resolve(String(args['output-dir'] ?? args.outputDir ?? args._[0] ?? '.'));
    const [comparison, runSummary, mobileChecks] = await Promise.all([
      readJsonIfExists(path.join(outputDir, 'reports', 'comparison.json')),
      readJsonIfExists(path.join(outputDir, 'reports', 'run-summary.json')),
      readMobileChecks(path.join(outputDir, 'metadata'))
    ]);
    const sections = {
      ...(comparison ? { comparison } : {}),
      ...(mobileChecks.length ? { mobileChecks } : {}),
      ...sectionsFromRunSummary(runSummary)
    };
    const plan = buildRemediationPlan(sections);
    if (args.json) {
      process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    } else {
      const sources = [
        comparison ? 'comparison.json' : null,
        mobileChecks.length ? `mobile judgments (${mobileChecks.length})` : null,
        runSummary ? 'run-summary.json' : null
      ].filter(Boolean).join(', ') || 'none';
      process.stdout.write(`Remediation plan: ${plan.total} finding(s) — ${plan.blockers} blocker(s), ${plan.majors} major(s) (sources: ${sources}; dir: ${outputDir})\n`);
      for (const entry of plan.items) {
        const caseSuffix = entry.case ? ` (case: ${entry.case})` : '';
        process.stdout.write(`[${entry.severity.toUpperCase()}] ${entry.category} — ${entry.finding}${caseSuffix} | ทำไม: ${entry.likelyCause} | แก้: ${entry.action} | ตรวจ: ${entry.verify}\n`);
      }
      if (plan.total === 0) {
        process.stdout.write('Nothing to remediate — either every check passed or no reports exist under this directory yet.\n');
      }
      process.stdout.write('Advisory report — the exit code is 0 regardless of findings.\n');
    }
  }
} catch (error) { fail(error); }
