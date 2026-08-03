#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson } from '../lib/contract-cli.mjs';
import { evaluateDirectionGate } from '../lib/direction-gate-engine.mjs';

const HELP = `Usage: node scripts/direction-gate.mjs [options]
      --dir <path>           Project root (default: cwd)
      --spec <path>          Direction spec (default: design/visual-direction-spec.md)
      --profile <path>       Aesthetic profile (default: design/aesthetic-profile.json)
      --optional             Pass when the spec is missing (info only)
      --no-require-confirm   Do not require Status confirm = เริ่มเขียน
      --check-sync           Also run direction:sync --check against the profile
      --json                 Emit the gate report JSON on stdout
      --output <path>        Write the gate report JSON

Lightweight PR/CI gate — no browser. Fails when UI work lacks a confirmed
visual-direction-spec.md (confirm = เริ่มเขียน).

Example (GitHub Action / pre-merge):
  npm run direction:gate -- --check-sync
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    spec: { type: 'string' },
    profile: { type: 'string' },
    optional: { type: 'boolean', default: false },
    'require-confirm': { type: 'boolean', default: true },
    'check-sync': { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
    output: { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await evaluateDirectionGate({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      specPath: args.spec ?? 'design/visual-direction-spec.md',
      profilePath: args.profile ?? 'design/aesthetic-profile.json',
      required: args.optional !== true,
      requireConfirm: args['require-confirm'] !== false,
      checkSync: args['check-sync'] === true
    });
    const report = {
      ok: result.ok,
      passed: result.passed,
      status: result.status,
      score: result.score,
      required: result.required,
      requireConfirm: result.requireConfirm,
      checkSync: result.checkSync,
      specPath: result.specPath,
      profilePath: result.profilePath,
      parsed: result.parsed,
      iterationCount: result.iterations.length,
      findings: result.findings
    };
    if (args.json || args.output) await emitJson(report, args.output);
    if (!args.json || args.output) {
      process.stdout.write([
        `Direction gate: ${result.status} (score ${result.score})`,
        `Spec: ${result.specPath}`,
        `Confirm: ${result.parsed?.confirmReply ?? 'missing'}`,
        `Iterations: ${result.iterations.length}`,
        `Findings: ${result.findings.length}`,
        ...result.findings.map((item) => `  - [${item.severity}] ${item.code}: ${item.message}`)
      ].join('\n') + '\n');
    }
    if (!result.passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }
