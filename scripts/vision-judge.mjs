#!/usr/bin/env node
import fs from 'node:fs';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { judgeMetrics, validateVerdictRecord, buildVerdictRecord } from '../lib/vision-judge-engine.mjs';

const HELP = `Usage:
  node scripts/vision-judge.mjs --judge metrics --metrics m.json [--thresholds JSON|@file] [options]
  node scripts/vision-judge.mjs --judge model|human --verdict-file v.json [options]

Judge a render. metrics mode is deterministic (thresholds -> pass/warn/fail).
model/human modes validate and record an external verdict with the same schema.

Options:
  --judge <mode>        metrics | model | human (default: metrics)
  --metrics <file>      Metrics JSON (metrics mode, required)
  --thresholds <json>   Inline JSON or @file, e.g. '{"maxEmptyCells":2,"minAlignment":{"value":0.4,"severity":"warn"}}'
  --verdict-file <file> External verdict JSON (model/human mode, required)
  --goal <text>         What the render is supposed to achieve
  --label <name>        Case label (default: screen)
  --capture <file>      Capture PNG path (recorded in verdict)
  --out <file>          Write verdict JSON here (default: stdout only)
  --help                Show help

Examples:
  node scripts/vision-judge.mjs --judge metrics --metrics .fx/metrics.json --thresholds '{"maxEmptyCells":3}' --out .fx/verdict.json
  node scripts/vision-judge.mjs --judge human --verdict-file .fx/human.json --label chat --out .fx/verdict.json
`;

function readJson(value, label) {
  const text = String(value ?? '').startsWith('@')
    ? fs.readFileSync(String(value).slice(1), 'utf8')
    : String(value ?? '');
  try {
    return JSON.parse(text);
  } catch {
    throw new TypeError(`${label} is not valid JSON`);
  }
}

try {
  const args = parseLooseArgs();
  const mode = args.judge ?? 'metrics';
  if (args.help || args.h) { printHelp(HELP); process.exitCode = 0; }
  else if (!['metrics', 'model', 'human'].includes(mode)) {
    fail(new TypeError(`--judge must be metrics|model|human, got ${mode}`));
  } else {
    let record;
    if (mode === 'metrics') {
      if (!args.metrics) fail(new TypeError('--metrics is required in metrics mode'));
      const metrics = readJson(`@${args.metrics}`, 'metrics file');
      const thresholds = args.thresholds ? readJson(args.thresholds, 'thresholds') : {};
      record = judgeMetrics({
        metrics, thresholds,
        caseLabel: args.label ?? 'screen', goal: args.goal,
        metricsRef: args.metrics, captureRef: args.capture
      });
    } else {
      if (!args['verdict-file'] && !args.verdictFile) fail(new TypeError('--verdict-file is required in model/human mode'));
      const external = readJson(`@${args['verdict-file'] ?? args.verdictFile}`, 'verdict file');
      validateVerdictRecord(external);
      // Rebuild via the engine (no key spread) so model/human records can never
      // carry unknown keys or schema-nonconforming fields.
      record = buildVerdictRecord({
        mode,
        caseLabel: external.case_label ?? args.label ?? 'screen',
        goal: external.goal ?? args.goal ?? null,
        verdict: external.verdict,
        findings: external.findings,
        metricsRef: external.metrics_ref,
        captureRef: external.capture_ref ?? args.capture,
        judgedBy: external.judged_by,
        judgedAt: external.judged_at
      });
    }
    if (args.out) fs.writeFileSync(args.out, `${JSON.stringify(record, null, 2)}\n`);
    process.stdout.write(`${record.verdict.toUpperCase()} (${record.findings.length} findings) — ${record.case_label}\n`);
    if (record.verdict === 'fail') process.exitCode = 1;
  }
} catch (error) { fail(error); }
