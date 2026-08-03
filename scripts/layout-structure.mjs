#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { parseEngineeringCommand } from '../lib/engineering.mjs';
import { ensureParent, writeJsonAtomic } from '../lib/io.mjs';
import {
  checkLayoutStructureFromPng,
  formatStructureCheckReport,
  formatStructureReport,
  rememberLayoutStructureFromPng,
  watchUntilMatch
} from '../lib/layout-structure-engine.mjs';

const HELP = `Usage:
  node scripts/layout-structure.mjs remember --ref <ref.png> --regions <regions.json> [--write structure.json]
  node scripts/layout-structure.mjs check --structure <structure.json> --cur <cur.png> [--regions <regions.json>]
  node scripts/layout-structure.mjs until-match --structure <structure.json> --cur <cur.png> [--regions <regions.json>]

Remember the layout skeleton of ref, check cur, or keep checking until cur matches ref.

regions.json:
  { "regions": [ { "name": "photo", "x": 92, "y": 738, "width": 62, "height": 60 } ] }

Or pass inline regions:
  --region photo=92,738,62,60 --region qr=200,740,48,48

until-match options:
  --interval <sec>         Recheck interval while still mismatched (default: 2)
  --max-rounds <n>         Stop failing after N checks (default: 120)
  --capture-to <path>      When matched: copy cur.png here, then stop
  --capture-cmd <command>  When matched: run this command, then stop
  --write-status <path>    Write JSON status each round / final result

Options:
  --tolerance-px <n>   Position/size tolerance (default from structure or 4)
  --cols / --rows      ASCII fingerprint grid
  --json               Emit JSON
  -h, --help

Workflow:
  1. remember     → save ref structure
  2. until-match  → check throughout while you fix cur
  3. when ok      → capture (optional) and stop
`;

function asList(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function parseInlineRegion(text) {
  const match = String(text).match(/^([^=]+)=(\d+),(\d+),(\d+),(\d+)$/);
  if (!match) throw new Error(`Invalid --region value "${text}". Expected name=x,y,w,h`);
  return {
    name: match[1].trim(),
    x: Number(match[2]),
    y: Number(match[3]),
    width: Number(match[4]),
    height: Number(match[5])
  };
}

async function loadRegions(args) {
  const regions = [];
  if (args.regions) {
    const raw = JSON.parse(await fs.readFile(path.resolve(String(args.regions)), 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.regions;
    if (!Array.isArray(list)) throw new Error('regions file must be an array or { "regions": [...] }');
    regions.push(...list);
  }
  for (const item of asList(args.region)) regions.push(parseInlineRegion(item));
  return regions;
}

function runCaptureCommand(command) {
  const parsed = parseEngineeringCommand(command);
  const executable = process.platform === 'win32'
    && ['npm', 'npx', 'pnpm', 'yarn', 'bun'].includes(parsed.executable.toLowerCase())
    ? `${parsed.executable}.cmd`
    : parsed.executable;
  return new Promise((resolve, reject) => {
    const child = spawn(executable, parsed.args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr, command: String(command) });
    });
  });
}

try {
  const args = parseLooseArgs();
  if (args.help || args.h) printHelp(HELP);
  else {
    const command = args._[0]
      || (args.remember ? 'remember' : args.check ? 'check' : args['until-match'] ? 'until-match' : null);
    if (!['remember', 'check', 'until-match'].includes(command)) {
      printHelp(HELP);
      process.exitCode = 1;
    } else if (command === 'remember') {
      if (!args.ref) throw new Error('--ref is required');
      const regions = await loadRegions(args);
      if (!regions.length) throw new Error('Provide --regions file and/or --region name=x,y,w,h');
      const structure = await rememberLayoutStructureFromPng(path.resolve(String(args.ref)), regions, {
        cols: args.cols,
        rows: args.rows,
        invert: args.invert !== false,
        tolerancePx: args['tolerance-px']
      });
      const out = args.write ? path.resolve(String(args.write)) : null;
      if (out) {
        await writeJsonAtomic(out, structure);
        process.stdout.write(`Wrote ${out}\n`);
      }
      if (args.json) process.stdout.write(`${JSON.stringify(structure, null, 2)}\n`);
      else process.stdout.write(formatStructureReport(structure));
    } else if (command === 'check') {
      if (!args.structure) throw new Error('--structure is required');
      if (!args.cur) throw new Error('--cur is required');
      const structure = JSON.parse(await fs.readFile(path.resolve(String(args.structure)), 'utf8'));
      const regions = await loadRegions(args);
      const result = await checkLayoutStructureFromPng(
        structure,
        path.resolve(String(args.cur)),
        regions.length ? regions : null,
        { tolerancePx: args['tolerance-px'] }
      );
      if (args.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else process.stdout.write(formatStructureCheckReport(result));
      if (!result.ok) process.exitCode = 1;
    } else {
      if (!args.structure) throw new Error('--structure is required');
      if (!args.cur) throw new Error('--cur is required');
      const structurePath = path.resolve(String(args.structure));
      const curPath = path.resolve(String(args.cur));
      const structure = JSON.parse(await fs.readFile(structurePath, 'utf8'));
      const intervalSec = Number(args.interval ?? 2);
      const maxRounds = Number(args['max-rounds'] ?? 120);
      const captureTo = args['capture-to'] ? path.resolve(String(args['capture-to'])) : null;
      const captureCmd = args['capture-cmd'] ? String(args['capture-cmd']) : null;
      const statusPath = args['write-status'] ? path.resolve(String(args['write-status'])) : null;

      process.stdout.write(
        `until-match: checking ${curPath} against remembered ref every ${intervalSec}s`
        + ` (max ${maxRounds} rounds)\n`
        + 'Fix cur while this runs. When it matches ref → capture → stop.\n\n'
      );

      const final = await watchUntilMatch({
        maxRounds,
        intervalMs: Math.round(intervalSec * 1000),
        checkOnce: async (round) => {
          const regions = await loadRegions(args);
          return checkLayoutStructureFromPng(
            structure,
            curPath,
            regions.length ? regions : null,
            { tolerancePx: args['tolerance-px'] }
          );
        },
        onRound: async (entry, result) => {
          process.stdout.write(
            `round ${entry.round}: ok=${entry.ok} severity=${entry.severity}`
            + (entry.nextActions?.length ? ` | ${entry.nextActions[0]}` : '')
            + '\n'
          );
          if (!entry.ok && result && !args.json) {
            for (const action of (result.nextActions || []).slice(0, 3)) {
              process.stdout.write(`  - ${action}\n`);
            }
          }
          if (statusPath) {
            await writeJsonAtomic(statusPath, { phase: 'watching', entry, result });
          }
        },
        onMatch: async (result) => {
          const capture = { copiedTo: null, command: null };
          if (captureTo) {
            await ensureParent(captureTo);
            await fs.copyFile(curPath, captureTo);
            capture.copiedTo = captureTo;
            process.stdout.write(`\nMATCHED ref. Captured cur → ${captureTo}\n`);
          }
          if (captureCmd) {
            process.stdout.write(`\nMATCHED ref. Running capture command…\n`);
            const ran = await runCaptureCommand(captureCmd);
            capture.command = ran;
            if (ran.stdout) process.stdout.write(ran.stdout);
            if (ran.stderr) process.stderr.write(ran.stderr);
            if (ran.code !== 0) throw new Error(`capture-cmd exited ${ran.code}`);
          }
          if (!captureTo && !captureCmd) {
            process.stdout.write('\nMATCHED ref. Stopping (no capture requested).\n');
          }
          return capture;
        }
      });

      if (statusPath) await writeJsonAtomic(statusPath, { phase: 'done', ...final });
      if (args.json) process.stdout.write(`${JSON.stringify(final, null, 2)}\n`);
      else if (!final.matched) {
        process.stdout.write(`\nStopped without match (${final.stopped}).\n`);
      }
      if (!final.matched) process.exitCode = 1;
    }
  }
} catch (error) { fail(error); }
