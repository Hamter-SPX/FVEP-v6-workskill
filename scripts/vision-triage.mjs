#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { writeJsonAtomic } from '../lib/io.mjs';
import {
  evaluateLoopProgress,
  formatTriageReport,
  measureFrameFromPng,
  triageVisualDelta
} from '../lib/visual-diff-triage-engine.mjs';

const HELP = `Usage:
  node scripts/vision-triage.mjs --ref reference.png --cur current.png [options]

Ranks every difference between the reference the user wants and the render the model
produced, in perceptual order (structure → proportion → value → colour → density → polish),
and returns exactly one next change so each round stays attributable.

Options:
  --ref <path>          Reference frame (what the user wants)
  --cur <path>          Current frame (what was produced)
  --regions <path>      JSON of named rects: { "photo": [x,y,w,h] } or { "photo": { "ref": [...], "cur": [...] } }
  --grid <CxR>          Zone grid (default 6x4)
  --history <path>      Round ledger JSON; the run is appended and stall detection runs
  --round <n>           Round number recorded in the ledger
  --write <path>        Write the JSON result
  --json                Emit JSON instead of the text report
  -h, --help

Exit 1 while the frames still differ, so an agent loop keeps iterating until it matches.

Example:
  npm run vision:triage -- --ref design/ref.png --cur artifacts/cur.png --history .fx/triage-history.json
`;

async function readJsonIfPresent(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

try {
  const args = parseLooseArgs();
  if (args.help || args.h) printHelp(HELP);
  else if (!args.ref || !args.cur) {
    printHelp(HELP);
    process.exitCode = 1;
  } else {
    const options = { grid: args.grid };
    const reference = await measureFrameFromPng(path.resolve(String(args.ref)), options);
    const current = await measureFrameFromPng(path.resolve(String(args.cur)), options);
    const regions = args.regions
      ? JSON.parse(await fs.readFile(path.resolve(String(args.regions)), 'utf8'))
      : null;

    const result = triageVisualDelta({ reference, current, regions }, options);

    let progress = null;
    if (args.history) {
      const historyPath = path.resolve(String(args.history));
      const history = await readJsonIfPresent(historyPath, []);
      const rounds = Array.isArray(history) ? history : (history.rounds ?? []);
      rounds.push({
        round: Number(args.round ?? rounds.length + 1),
        at: new Date().toISOString(),
        ref: String(args.ref),
        cur: String(args.cur),
        totalDelta: result.totalDelta,
        score: result.score,
        verdict: result.verdict,
        change: result.nextAction?.change ?? null
      });
      progress = evaluateLoopProgress(rounds);
      await writeJsonAtomic(historyPath, rounds);
      result.progress = progress;
    }

    if (args.write) await writeJsonAtomic(path.resolve(String(args.write)), result);
    if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else {
      process.stdout.write(formatTriageReport(result));
      if (progress?.stalled) process.stdout.write(`\nSTALLED after ${progress.rounds} rounds: ${progress.recommendation}\n`);
    }
    if (!result.matched) process.exitCode = 1;
  }
} catch (error) { fail(error); }
