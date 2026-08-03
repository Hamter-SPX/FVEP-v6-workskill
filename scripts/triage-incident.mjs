#!/usr/bin/env node
import { rankIncidentHypotheses } from '../lib/debug-triage-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile } from '../lib/contract-cli.mjs';
const HELP = `Usage: node scripts/triage-incident.mjs --input <incident-evidence.json> [--output <report.json>]`;
try { const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } }); if (args.help) printHelp(HELP); else await emitJson(rankIncidentHypotheses(await readJsonFile(args.input, 'incident evidence')), args.output); } catch (error) { fail(error); }
