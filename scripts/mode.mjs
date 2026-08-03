#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import {
  MODE_IDS,
  auditModeExit,
  formatModeCard,
  formatModeList,
  getMode,
  resolveMode
} from '../lib/mode-engine.mjs';

const HELP = `Usage:
  node scripts/mode.mjs list
  node scripts/mode.mjs show <mode>
  node scripts/mode.mjs resolve "<request text>"
  node scripts/mode.mjs check --mode <mode> --state state.json

A mode is the contract for a phase of work: what it may do, what it must not do yet, which
gates produce its evidence, and what has to be true before it can end.

Modes: ${MODE_IDS.join(', ')}

Options:
  --mode <id>        Mode for the check command
  --state <path>     JSON: { completedGates, artifacts, confirmations, performedForbidden, recheckPerformed }
  --write <path>     Write the JSON result
  --json             Emit JSON instead of the text report
  -h, --help

Examples:
  npm run mode -- list
  npm run mode -- show design-ui
  npm run mode -- resolve "ช่วยรีดีไซน์หน้านี้ให้หน่อย"
  npm run mode -- check --mode match-ref --state .fx/mode-state.json
`;

try {
  const args = parseLooseArgs();
  const [command, ...rest] = args._;

  if (args.help || args.h || !command) printHelp(HELP);
  else if (command === 'list') {
    if (args.json) process.stdout.write(`${JSON.stringify({ modes: MODE_IDS }, null, 2)}\n`);
    else process.stdout.write(formatModeList());
  } else if (command === 'show') {
    const definition = getMode(rest[0] ?? args.mode);
    if (args.json) process.stdout.write(`${JSON.stringify(definition, null, 2)}\n`);
    else process.stdout.write(formatModeCard(definition));
  } else if (command === 'resolve') {
    const text = rest.join(' ') || String(args.text ?? '');
    const result = resolveMode(text);
    if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else {
      process.stdout.write(`mode=${result.mode}  confidence=${result.confidence}\n${result.reason}\n\n`);
      process.stdout.write(formatModeCard(result.mode));
      if (result.needsConfirmation) {
        process.stdout.write('\nCONFIRM THE MODE WITH THE USER BEFORE ACTING.\n');
      }
    }
    if (result.needsConfirmation) process.exitCode = 1;
  } else if (command === 'check') {
    if (!args.mode) throw new Error('check requires --mode <id>.');
    const state = args.state
      ? JSON.parse(await fs.readFile(path.resolve(String(args.state)), 'utf8'))
      : {};
    const result = auditModeExit({ mode: String(args.mode), ...state }, state.policy ?? {});
    if (args.write) await writeJsonAtomic(path.resolve(String(args.write)), result);
    if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else {
      process.stdout.write(`=== MODE EXIT CHECK: ${result.mode} ===\nverdict=${result.verdict}  ok=${result.ok}  score=${result.score}\n`);
      const actionable = result.findings.filter((finding) => finding.severity !== 'info');
      if (actionable.length) {
        process.stdout.write('\nfindings:\n');
        for (const finding of actionable) {
          process.stdout.write(`- [${finding.severity}] ${finding.code}: ${finding.message}\n`);
          if (finding.remediation) process.stdout.write(`  fix: ${finding.remediation}\n`);
        }
      }
      process.stdout.write('\nexit conditions:\n');
      for (const condition of result.exitConditions) process.stdout.write(`  - ${condition}\n`);
    }
    if (!result.ok) process.exitCode = 1;
  } else {
    printHelp(HELP);
    process.exitCode = 1;
  }
} catch (error) { fail(error); }
