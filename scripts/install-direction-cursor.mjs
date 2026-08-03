#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { ensureDir, fileExists, writeJsonAtomic, writeTextAtomic } from '../lib/io.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateRoot = path.join(skillRoot, 'templates', 'cursor');

const HELP = `Usage: node scripts/install-direction-cursor.mjs [options]
      --dir <path>     Project root that should receive .cursor/ templates (default: cwd)
      --force          Overwrite existing rule/hook files

Copies visual-direction Cursor rule + beforeSubmitPrompt hook into the target project.
`;

async function readText(rel) {
  return fs.readFile(path.join(templateRoot, rel), 'utf8');
}

function mergeHooksJson(existing, incoming) {
  const base = existing && typeof existing === 'object' ? existing : { version: 1, hooks: {} };
  const next = {
    version: Number(base.version ?? incoming.version ?? 1),
    hooks: { ...(base.hooks ?? {}) }
  };
  const list = [...(next.hooks.beforeSubmitPrompt ?? [])];
  const incomingList = incoming.hooks?.beforeSubmitPrompt ?? [];
  for (const entry of incomingList) {
    const command = entry.command;
    if (!list.some((item) => item.command === command)) list.push(entry);
  }
  next.hooks.beforeSubmitPrompt = list;
  return next;
}

try {
  const args = parseCli({
    dir: { type: 'string' },
    force: { type: 'boolean', default: false }
  });
  if (args.help) printHelp(HELP);
  else {
    const projectRoot = path.resolve(args.dir ?? process.cwd());
    const cursorDir = path.join(projectRoot, '.cursor');
    const rulesDir = path.join(cursorDir, 'rules');
    const hooksDir = path.join(cursorDir, 'hooks');
    await ensureDir(rulesDir);
    await ensureDir(hooksDir);

    const created = [];
    const skipped = [];

    async function writeFile(target, contents, kind) {
      if (await fileExists(target) && !args.force) {
        skipped.push({ path: target, kind });
        return;
      }
      if (typeof contents === 'string') await writeTextAtomic(target, contents.endsWith('\n') ? contents : `${contents}\n`);
      else await writeJsonAtomic(target, contents);
      created.push({ path: target, kind });
    }

    await writeFile(
      path.join(rulesDir, 'visual-direction-redesign.mdc'),
      await readText('rules/visual-direction-redesign.mdc'),
      'rule'
    );

    const hookScript = await readText('hooks/visual-direction-redesign.mjs');
    const hookTarget = path.join(hooksDir, 'visual-direction-redesign.mjs');
    await writeFile(hookTarget, hookScript, 'hook-script');
    try { await fs.chmod(hookTarget, 0o755); } catch { /* best-effort on platforms without chmod */ }

    const incomingHooks = JSON.parse(await readText('hooks.json'));
    const hooksJsonPath = path.join(cursorDir, 'hooks.json');
    if (await fileExists(hooksJsonPath) && !args.force) {
      const existing = JSON.parse(await fs.readFile(hooksJsonPath, 'utf8'));
      const merged = mergeHooksJson(existing, incomingHooks);
      await writeJsonAtomic(hooksJsonPath, merged);
      created.push({ path: hooksJsonPath, kind: 'hooks-json-merged' });
    } else {
      await writeFile(hooksJsonPath, incomingHooks, 'hooks-json');
    }

    process.stdout.write([
      `Cursor visual-direction templates → ${cursorDir}`,
      `Created/updated: ${created.length}`,
      ...created.map((item) => `  + ${item.path}`),
      `Skipped: ${skipped.length}`,
      ...skipped.map((item) => `  = ${item.path}`),
      'Reload Cursor hooks after install.'
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }
