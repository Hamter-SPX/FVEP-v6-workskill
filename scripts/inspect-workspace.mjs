#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
import { classifyWorkspace } from '../lib/workspace-safety-engine.mjs';
const HELP = `Usage: node scripts/inspect-workspace.mjs [--input <workspace.json>] [--cwd <directory>] [--output <report.json>]\nClassifies repository/worktree safety without mutating git state.`;
function git(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false });
  return result.status === 0 ? result.stdout.trim() : null;
}
function snapshot(cwd) {
  const topLevel = git(cwd, 'rev-parse', '--show-toplevel');
  if (!topLevel) return { isGitRepo: false, topLevel: path.resolve(cwd), isolatedCopy: false };
  const gitDirRaw = git(cwd, 'rev-parse', '--git-dir');
  const commonRaw = git(cwd, 'rev-parse', '--git-common-dir');
  const branch = git(cwd, 'branch', '--show-current') ?? '';
  const superprojectWorkingTree = git(cwd, 'rev-parse', '--show-superproject-working-tree') ?? '';
  return {
    isGitRepo: true,
    topLevel: path.resolve(topLevel),
    gitDir: gitDirRaw ? path.resolve(topLevel, gitDirRaw) : null,
    gitCommonDir: commonRaw ? path.resolve(topLevel, commonRaw) : null,
    branch,
    detached: !branch,
    superprojectWorkingTree: superprojectWorkingTree || null
  };
}
try {
  const args = parseCli({ input: { type: 'string' }, cwd: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const input = args.input ? await readJsonFile(args.input, 'workspace snapshot') : snapshot(path.resolve(args.cwd ?? process.cwd()));
    const report = classifyWorkspace(input.workspace ?? input, input.policy ?? {});
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
