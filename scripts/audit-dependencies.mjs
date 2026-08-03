#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { auditDependencyManifest } from '../lib/dependency-risk-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/audit-dependencies.mjs --manifest <package.json> [--lockfile <path>] [--output <report.json>]`;
try {
  const args = parseCli({ manifest: { type: 'string' }, lockfile: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const manifest = await readJsonFile(args.manifest, 'dependency manifest');
    let lockfilePresent = false;
    if (args.lockfile) { try { await fs.access(path.resolve(args.lockfile)); lockfilePresent = true; } catch { lockfilePresent = false; } }
    const report = auditDependencyManifest({ manifest, lockfilePresent }); await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
