import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  MODE_IDS,
  auditModeExit,
  flowForMode,
  formatModeCard,
  formatModeList,
  getMode,
  listModes,
  resolveMode
} from '../../lib/mode-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('the ten operating modes are defined with complete contracts', () => {
  assert.deepEqual(MODE_IDS, [
    'analyze', 'design-ui', 'match-ref', 'design-game', 'implement',
    'debug', 'review', 'ship', 'author-skill', 'recover'
  ]);
  for (const definition of listModes()) {
    assert.ok(definition.purpose.length > 20, `${definition.id} needs a real purpose`);
    assert.ok(definition.allows.length >= 3, `${definition.id} needs allowed actions`);
    assert.ok(definition.forbids.length >= 2, `${definition.id} needs forbidden actions`);
    assert.ok(definition.exit.length >= 2, `${definition.id} needs exit conditions`);
    assert.ok(definition.recheck.length >= 3, `${definition.id} needs re-check steps`);
    assert.ok(definition.references.length >= 1, `${definition.id} needs references`);
  }
});

test('getMode is case-insensitive and rejects unknown modes', () => {
  assert.equal(getMode('DESIGN-UI').id, 'design-ui');
  assert.throws(() => getMode('vibes'), RangeError);
});

test('Thai and English requests route to the right mode', () => {
  assert.equal(resolveMode('ช่วยรีดีไซน์หน้านี้ให้หน่อย').mode, 'design-ui');
  assert.equal(resolveMode('ทำให้ตรงกับรูป ref ที่ส่งไป').mode, 'match-ref');
  assert.equal(resolveMode('สร้างแมพ roblox map ใหม่').mode, 'design-game');
  assert.equal(resolveMode('มันพัง error ตอนกดปุ่ม').mode, 'debug');
  assert.equal(resolveMode('please review this pull request').mode, 'review');
  assert.equal(resolveMode('ปล่อยงาน merge ได้เลย').mode, 'ship');
  assert.equal(resolveMode('ทำต่อจากเดิม context หาย').mode, 'recover');
});

test('a request with no trigger falls back to analyze and asks for confirmation', () => {
  const result = resolveMode('hello there');
  assert.equal(result.mode, 'analyze');
  assert.equal(result.confidence, 'none');
  assert.equal(result.needsConfirmation, true);
  assert.match(result.reason, /Confirm the mode/);
});

test('a strong trigger produces high confidence without confirmation', () => {
  const result = resolveMode('เริ่มเขียน implement ได้เลย');
  assert.equal(result.mode, 'implement');
  assert.equal(result.confidence, 'high');
  assert.equal(result.needsConfirmation, false);
});

test('every operating mode is bound to a flow doc that exists on disk', () => {
  for (const id of MODE_IDS) {
    const { flow, flowCompanions } = flowForMode(id);
    assert.ok(typeof flow === 'string' && flow.startsWith('flow/'), `${id} has no flow doc bound`);
    assert.ok(existsSync(path.join(root, flow)), `${id}: ${flow} missing on disk`);
    assert.ok(Array.isArray(flowCompanions), `${id}: flowCompanions must be a list`);
  }
});

test('resolveMode exposes the flow doc bound to the resolved mode', () => {
  const result = resolveMode('ช่วยรีดีไซน์หน้านี้ให้หน่อย');
  assert.equal(result.mode, 'design-ui');
  assert.equal(result.flow, 'flow/brainstorming.md');
  assert.deepEqual(result.flowCompanions, ['flow/writing-plans.md']);
});

test('auditModeExit exposes the flow doc alongside the verdict', () => {
  const result = auditModeExit({ mode: 'debug', completedGates: [], recheckPerformed: false });
  assert.equal(result.flow, 'flow/systematic-debugging.md');
  assert.deepEqual(result.flowCompanions, ['flow/receiving-code-review.md']);
});

test('mode exit is blocked until gates run and the re-check happens', () => {
  const blocked = auditModeExit({ mode: 'match-ref', completedGates: [], recheckPerformed: false });
  const codes = blocked.findings.map((finding) => finding.code);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.verdict, 'mode-open');
  assert.ok(codes.includes('MODE_GATE_NOT_RUN'));
  assert.ok(codes.includes('MODE_RECHECK_NOT_PERFORMED'));

  const closed = auditModeExit({
    mode: 'match-ref',
    completedGates: ['npm run vision:triage'],
    recheckPerformed: true
  });
  assert.equal(closed.ok, true, closed.findings.map((f) => f.message).join('; '));
  assert.equal(closed.verdict, 'mode-closed');
});

test('design-ui cannot close without the เริ่มเขียน confirmation', () => {
  const result = auditModeExit({
    mode: 'design-ui',
    completedGates: ['npm run direction:runtime', 'npm run direction:distinctness', 'npm run direction:gate'],
    recheckPerformed: true
  });
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((finding) => finding.code === 'MODE_CONFIRMATION_MISSING'));

  const confirmed = auditModeExit({
    mode: 'design-ui',
    completedGates: ['npm run direction:runtime', 'npm run direction:distinctness', 'npm run direction:gate'],
    confirmations: ['เริ่มเขียน'],
    recheckPerformed: true
  });
  assert.equal(confirmed.ok, true, confirmed.findings.map((f) => f.message).join('; '));
});

test('performing a forbidden action blocks the mode', () => {
  const result = auditModeExit({
    mode: 'analyze',
    completedGates: ['npm run process:route'],
    recheckPerformed: true,
    performedForbidden: ['Edited src/App.tsx during analysis']
  });
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((finding) => finding.code === 'MODE_FORBIDDEN_ACTION'));
});

test('the mode card shows the contract and the list shows every mode', () => {
  const card = formatModeCard('design-game');
  assert.match(card, /MODE: DESIGN GAME CONTENT/);
  assert.match(card, /FORBIDDEN/);
  assert.match(card, /audit:scene/);
  assert.match(card, /RE-CHECK BEFORE CLOSING/);
  assert.match(card, /FLOW\n  - flow\/brainstorming\.md \(governing\)/);

  const list = formatModeList();
  for (const id of MODE_IDS) assert.ok(list.includes(id), `${id} missing from the list`);
});

test('mode CLI lists, shows, resolves, and checks', async () => {
  const script = path.join(root, 'scripts/mode.mjs');

  const list = spawnSync(process.execPath, [script, 'list'], { encoding: 'utf8' });
  assert.equal(list.status ?? 0, 0, list.stderr);
  assert.match(list.stdout, /OPERATING MODES/);

  const show = spawnSync(process.execPath, [script, 'show', 'ship'], { encoding: 'utf8' });
  assert.match(show.stdout, /MODE: SHIP/);
  assert.match(show.stdout, /flow\/verification-before-completion\.md \(governing\)/);

  const showJson = spawnSync(process.execPath, [script, 'show', 'ship', '--json'], { encoding: 'utf8' });
  const shown = JSON.parse(showJson.stdout);
  assert.equal(shown.flow, 'flow/verification-before-completion.md');
  assert.deepEqual(shown.flowCompanions, ['flow/finishing-a-development-branch.md']);

  const ambiguous = spawnSync(process.execPath, [script, 'resolve', 'hello'], { encoding: 'utf8' });
  assert.equal(ambiguous.status, 1);
  assert.match(ambiguous.stdout, /CONFIRM THE MODE/);

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'mode-check-'));
  const statePath = path.join(dir, 'state.json');
  await fs.writeFile(statePath, JSON.stringify({ completedGates: [], recheckPerformed: false }), 'utf8');
  const check = spawnSync(process.execPath, [script, 'check', '--mode', 'implement', '--state', statePath], { encoding: 'utf8' });
  assert.equal(check.status, 1);
  assert.match(check.stdout, /MODE EXIT CHECK: implement/);
  assert.match(check.stdout, /MODE_GATE_NOT_RUN/);
});
