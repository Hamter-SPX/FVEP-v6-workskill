#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, setAuditExitCode } from '../lib/contract-cli.mjs';
import { auditSkillConformance } from '../lib/skill-conformance-engine.mjs';

const HELP = `Usage: node scripts/validate-skill-conformance.mjs [--root <skill-directory>] [--output <report.json>]\nAudits SKILL metadata, references, Superpowers adaptation coverage, pressure scenarios, TDD deployment evidence, and process CLI identity.`;
const ignored = new Set(['node_modules', '.git', 'artifacts']);

async function walk(directory, root, result = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute, root, result);
    else result.push(path.relative(root, absolute).split(path.sep).join('/'));
  }
  return result;
}

async function read(root, relative) {
  try { return await fs.readFile(path.join(root, relative), 'utf8'); }
  catch (error) { throw new Error(`Unable to read ${relative}: ${error.message}`); }
}

try {
  const args = parseCli({ root: { type: 'string', default: '.' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const root = path.resolve(args.root);
    const [skillText, pressureScenariosText, tddEvidenceText, adaptationMatrixText, packageText, filePaths] = await Promise.all([
      read(root, 'SKILL.md'),
      read(root, 'tests/process-pressure-scenarios-v4.md'),
      read(root, 'tests/TDD_EVIDENCE_V4.md'),
      read(root, 'SUPERPOWERS_ADAPTATION_MATRIX.md'),
      read(root, 'package.json'),
      walk(root, root)
    ]);
    const report = auditSkillConformance({
      skillText, pressureScenariosText, tddEvidenceText, adaptationMatrixText,
      packageJson: JSON.parse(packageText), filePaths
    });
    await emitJson(report, args.output);
    setAuditExitCode(report);
  }
} catch (error) { fail(error); }
