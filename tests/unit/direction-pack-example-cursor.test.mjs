import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { validateAestheticProfile, auditAestheticProfile } from '../../lib/aesthetic-profile-engine.mjs';
import { evaluateDirectionGate } from '../../lib/direction-gate-engine.mjs';
import { syncDirectionSpecToProfile } from '../../lib/direction-spec-sync-engine.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cameraDir = path.join(skillRoot, 'examples', 'direction-camera');

test('direction-camera example profile validates and audits clean enough', async () => {
  const profile = JSON.parse(await fs.readFile(path.join(cameraDir, 'aesthetic-profile.json'), 'utf8'));
  validateAestheticProfile(profile);
  const audit = auditAestheticProfile(profile);
  assert.equal(audit.ok, true, audit.findings.map((item) => item.message).join('; '));
});

test('direction-camera example gate and sync --check pass', async () => {
  const gate = await evaluateDirectionGate({
    baseDir: cameraDir,
    specPath: 'visual-direction-spec.md',
    profilePath: 'aesthetic-profile.json',
    requireConfirm: true,
    checkSync: true
  });
  assert.equal(gate.passed, true, gate.findings.map((item) => `${item.code}:${item.message}`).join('; '));
  assert.equal(gate.parsed.confirmReply, 'เริ่มเขียน');

  const sync = await syncDirectionSpecToProfile({
    baseDir: cameraDir,
    specPath: 'visual-direction-spec.md',
    profilePath: 'aesthetic-profile.json',
    checkOnly: true
  });
  assert.equal(sync.passed, true, sync.comparison.findings.map((item) => item.message).join('; '));
});

test('prompt pack and cursor templates exist', async () => {
  for (const rel of [
    'prompts/visual-direction-prompt-pack.md',
    'prompts/visual-direction-exploration-ide.md',
    'prompts/visual-direction-exploration-cli.md',
    'templates/cursor/README.md',
    'templates/cursor/hooks.json',
    'templates/cursor/rules/visual-direction-redesign.mdc',
    'templates/cursor/hooks/visual-direction-redesign.mjs',
    'examples/direction-camera/README.md',
    'examples/direction-camera/visual-direction-spec.md'
  ]) {
    await fs.access(path.join(skillRoot, rel));
  }
});

test('visual-direction hook continues and reminds on redesign prompts', async () => {
  const script = path.join(skillRoot, 'templates', 'cursor', 'hooks', 'visual-direction-redesign.mjs');
  const payload = JSON.stringify({
    prompt: 'Please redesign this camera UI',
    attachments: [{ type: 'file', file_path: '/tmp/shot.png' }]
  });
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], { cwd: os.tmpdir(), stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.stdin.write(payload);
    child.stdin.end();
  });
  assert.equal(result.code, 0, result.stderr);
  const body = JSON.parse(result.stdout.trim());
  assert.equal(body.continue, true);
  assert.match(body.user_message, /visual direction|เริ่มเขียน/i);
});

test('direction:cursor-install copies rule and hook into a project', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-cursor-install-'));
  const install = path.join(skillRoot, 'scripts', 'install-direction-cursor.mjs');
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [install, '--dir', root], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
  assert.equal(result.code, 0, result.stderr);
  await fs.access(path.join(root, '.cursor', 'rules', 'visual-direction-redesign.mdc'));
  await fs.access(path.join(root, '.cursor', 'hooks', 'visual-direction-redesign.mjs'));
  const hooks = JSON.parse(await fs.readFile(path.join(root, '.cursor', 'hooks.json'), 'utf8'));
  assert.ok(hooks.hooks.beforeSubmitPrompt.some((item) => /visual-direction-redesign/.test(item.command)));
});
