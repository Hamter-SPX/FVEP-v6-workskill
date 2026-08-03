#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import {
  auditRecheckRecord,
  buildRecheckPlan,
  formatRecheckPlan,
  formatRecheckReport
} from '../lib/recheck-engine.mjs';

const HELP = `Usage:
  node scripts/recheck.mjs plan --mode <mode> [--depth quick|standard|deep]
  node scripts/recheck.mjs audit --record recheck.json

The adversarial pass you run against your own work before presenting it: what am I claiming,
what proves it, how would I know if I were wrong, and what did I never look at?

  plan   Print the ordered checks for a mode, plus the questions to answer in writing
  audit  Prove the re-check actually happened: bound claims, real observations,
         falsification attempts, blind spots, and a verdict that matches the findings

Options:
  --mode <id>       Operating mode (analyze, design-ui, match-ref, design-game, implement,
                    debug, review, ship, author-skill, recover)
  --depth <level>   quick | standard | deep (default standard)
  --record <path>   Completed re-check record JSON
  --artifacts <a,b> Artifact identities examined
  --write <path>    Write the JSON result
  --json            Emit JSON instead of the text report
  -h, --help

Exit 1 when the re-check is insufficient, so the work is not presented yet.

Examples:
  npm run recheck -- plan --mode design-ui
  npm run recheck -- audit --record .fx/recheck.json
`;

try {
  const args = parseLooseArgs();
  const [command] = args._;

  if (args.help || args.h || !command) printHelp(HELP);
  else if (command === 'plan') {
    const plan = buildRecheckPlan({
      mode: args.mode,
      depth: args.depth,
      artifacts: args.artifacts ? String(args.artifacts).split(',').map((item) => item.trim()).filter(Boolean) : [],
      independentReviewer: args['independent-reviewer'] === true
    });
    if (args.write) await writeJsonAtomic(path.resolve(String(args.write)), plan);
    if (args.json) process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    else process.stdout.write(formatRecheckPlan(plan));
  } else if (command === 'audit') {
    if (!args.record) throw new Error('audit requires --record <path>.');
    const record = JSON.parse(await fs.readFile(path.resolve(String(args.record)), 'utf8'));
    const result = auditRecheckRecord(record, record.policy ?? {});
    if (args.write) await writeJsonAtomic(path.resolve(String(args.write)), result);
    if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else process.stdout.write(formatRecheckReport(result));
    if (!result.ok) process.exitCode = 1;
  } else {
    printHelp(HELP);
    process.exitCode = 1;
  }
} catch (error) { fail(error); }
