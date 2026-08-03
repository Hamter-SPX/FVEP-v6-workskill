#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
import { aestheticInputFromTokenProfile, runAestheticAudit } from '../lib/aesthetic-audit-engine.mjs';

const HELP = `Usage: node scripts/audit-aesthetics.mjs --input <aesthetic-audit.json> [options]
  -c, --config <path>          Unused placeholder retained for CLI symmetry
      --input <path>           Combined audit input containing profile, measurements, and review
      --profile <path>         Aesthetic profile, overriding input.profile
      --review <path>          Aesthetic review, overriding input.review
      --measurements <path>    Mechanical measurements (color/type/spacing/craft/motion/style)
      --tokens <path>          Token profile JSON; fills empty measurement sections only
      --output <path>          Write the report to a file instead of stdout
      --no-require-review      Score mechanical sections without requiring a judgment review

Measures colour, typography, spacing, craft, motion, and style signature against a declared
aesthetic profile, then folds in the judgment review. See references/aesthetic-direction-protocol.md.

Examples:
  npm run audit:aesthetics -- --input examples/aesthetic-audit.example.json
  npm run audit:aesthetics -- --profile aesthetic-profile.json --tokens artifacts/vision-loop/reports/token-profile.current.json --no-require-review
`;

const MEASUREMENT_KEYS = ['color', 'typography', 'spacing', 'craft', 'motion', 'style'];

try {
  const args = parseCli({
    input: { type: 'string' },
    profile: { type: 'string' },
    review: { type: 'string' },
    measurements: { type: 'string' },
    tokens: { type: 'string' },
    output: { type: 'string' },
    'require-review': { type: 'boolean', default: true }
  });
  if (args.help) printHelp(HELP);
  else {
    const input = args.input ? await readJsonFile(args.input, 'aesthetic audit input') : {};
    if (args.measurements) {
      const measurements = await readJsonFile(args.measurements, 'aesthetic measurements');
      for (const key of MEASUREMENT_KEYS) if (measurements[key] !== undefined) input[key] = measurements[key];
      if (!input.profile && measurements.profile) input.profile = measurements.profile;
      if (!input.review && measurements.review) input.review = measurements.review;
      if (measurements.policy) input.policy = { ...(input.policy ?? {}), ...measurements.policy };
    }
    if (args.tokens) {
      const fromTokens = aestheticInputFromTokenProfile(await readJsonFile(args.tokens, 'token profile'));
      for (const key of MEASUREMENT_KEYS) if (input[key] === undefined && fromTokens[key] !== undefined) input[key] = fromTokens[key];
    }
    if (args.profile) input.profile = await readJsonFile(args.profile, 'aesthetic profile');
    if (args.review) input.review = await readJsonFile(args.review, 'aesthetic review');
    if (!args.input && !args.profile) throw new Error('Provide --input or --profile.');
    const policy = { ...(input.policy ?? {}), requireReview: args['require-review'] !== false };
    const report = runAestheticAudit(input, policy);
    await emitJson(report, args.output);
    setAuditExitCode(report);
    if (!report.passed) process.exitCode = 1;
  }
} catch (error) { fail(error); }
