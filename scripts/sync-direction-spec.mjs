#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson } from '../lib/contract-cli.mjs';
import { syncDirectionSpecToProfile } from '../lib/direction-spec-sync-engine.mjs';

const HELP = `Usage: node scripts/sync-direction-spec.mjs [options]
      --dir <path>         Project root (default: cwd)
      --spec <path>        Direction spec markdown (default: design/visual-direction-spec.md)
      --profile <path>     Aesthetic profile JSON (default: design/aesthetic-profile.json)
      --check              Compare only; do not write the profile
      --json               Emit the sync/check report JSON on stdout
      --output <path>      Write the sync/check report JSON

Reads visual-direction-spec.md and syncs personality / thesis / likes into
aesthetic-profile.json. Use --check in CI to fail on drift after เริ่มเขียน.
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    spec: { type: 'string' },
    profile: { type: 'string' },
    check: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
    output: { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await syncDirectionSpecToProfile({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      specPath: args.spec ?? 'design/visual-direction-spec.md',
      profilePath: args.profile ?? 'design/aesthetic-profile.json',
      checkOnly: args.check === true
    });
    const report = {
      ok: result.ok,
      passed: result.passed,
      checkOnly: result.checkOnly,
      wroteProfile: result.wroteProfile,
      specPath: result.specPath,
      profilePath: result.profilePath,
      selectedOption: result.parsed.selectedOption,
      thesis: result.parsed.thesis,
      findings: result.comparison.findings
    };
    if (args.json || args.output) await emitJson(report, args.output);
    if (!args.json || args.output) {
      process.stdout.write([
        `Direction sync: ${result.checkOnly ? 'check' : 'write'}`,
        `Spec: ${result.specPath}`,
        `Profile: ${result.profilePath}`,
        `Selected option: ${result.parsed.selectedOption ?? 'unset'}`,
        `Findings: ${result.comparison.findings.length}`,
        ...result.comparison.findings.map((item) => `  - [${item.severity}] ${item.code}: ${item.message}`)
      ].join('\n') + '\n');
    }
    if (!result.passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }
