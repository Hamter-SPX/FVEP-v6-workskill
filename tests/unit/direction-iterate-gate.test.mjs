import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { initDirectionArtifacts } from '../../lib/direction-init-engine.mjs';
import { recordDirectionIteration, parseIterationHistory } from '../../lib/direction-iterate-engine.mjs';
import { evaluateDirectionGate } from '../../lib/direction-gate-engine.mjs';

const CONFIRMED_SPEC = `# Visual Direction Spec

## Selection

- Selected option: 2
- Selected at (ISO timestamp): 2026-08-03T10:00:00.000Z
- Chosen image / artifact: design/direction-options/direction-option-2.png
- Reference screenshot(s):
- Unchosen options (and why they were rejected, if stated):

## What We Like (from the chosen option)

- Hierarchy / focal point: shutter dominates

## Direction Thesis

> Calm one-handed capture with spacious chrome.

## Personality Positions (draft)

| Axis | Value (1–5) | Why (from the choice) |
|---|---:|---|
| serious ↔ playful | 2 | serious capture |
| warm ↔ clinical | 3 | cool neutrals |
| understated ↔ expressive | 2 | quiet |
| dense ↔ spacious | 4 | open margins |
| established ↔ novel | 3 | familiar grammar |

## Keep from the Reference

- Primary task / critical controls: shutter

## Change from the Reference

- What the chosen option deliberately changes: removes dense strips
- Novelty budget (at most 2–3 positions): amber accent only

## Explicit Non-Goals

- Neon gradients

## Linked Artifacts

- Aesthetic profile path (to write next): design/aesthetic-profile.json
- Design contract path: design/design-contract.json
- Acceptance cases (route × viewport × state):

## Status

- [x] Spec written from selected option
- [x] User confirmed: เริ่มเขียน
- [ ] Aesthetic profile bound to this spec
- [ ] Design contract bound to this spec
`;

async function tinyPng(filePath) {
  const bytes = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
}

test('direction iterate records keep/change round and resets confirm', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-dir-iter-'));
  await initDirectionArtifacts({ baseDir: root, product: 'Camera', selectedOption: 2 });
  const specPath = path.join(root, 'design', 'visual-direction-spec.md');
  await fs.writeFile(specPath, CONFIRMED_SPEC, 'utf8');
  const image = path.join(root, 'design', 'direction-options', 'direction-option-2b.png');
  await tinyPng(image);

  const result = await recordDirectionIteration({
    baseDir: root,
    from: '2',
    to: '2b',
    imagePath: image,
    keep: ['Layout structure from option 2'],
    change: ['Icons only — system glyphs'],
    note: 'เหลือ layout แก้แค่ icon',
    recordedAt: '2026-08-03T12:00:00.000Z'
  });

  assert.equal(result.round, 1);
  const spec = await fs.readFile(specPath, 'utf8');
  assert.match(spec, /## Iteration History/);
  assert.match(spec, /### Round 1 — 2026-08-03T12:00:00\.000Z/);
  assert.match(spec, /direction-option-2b\.png/);
  assert.match(spec, /Icons only/);
  assert.match(spec, /User confirmed:.*last: ปรับต่อ/);
  assert.doesNotMatch(spec, /\[x\] User confirmed:\s*เริ่มเขียน\s*$/m);
  const rounds = parseIterationHistory(spec);
  assert.equal(rounds.length, 1);
  assert.equal(rounds[0].change[0], 'Icons only — system glyphs');
  assert.equal(rounds[0].keep[0], 'Layout structure from option 2');
  const ledger = JSON.parse(await fs.readFile(result.ledgerPath, 'utf8'));
  assert.equal(ledger.rounds[0].to, '2b');
});

test('direction gate passes confirmed spec and fails refine / missing', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-dir-gate-'));
  const designDir = path.join(root, 'design');
  await fs.mkdir(designDir, { recursive: true });
  const specPath = path.join(designDir, 'visual-direction-spec.md');
  await fs.writeFile(specPath, CONFIRMED_SPEC, 'utf8');

  const passed = await evaluateDirectionGate({ baseDir: root });
  assert.equal(passed.passed, true);
  assert.equal(passed.parsed.confirmReply, 'เริ่มเขียน');

  const missing = await evaluateDirectionGate({
    baseDir: path.join(root, 'empty-project'),
    required: true
  });
  assert.equal(missing.passed, false);
  assert.ok(missing.findings.some((item) => item.code === 'DIRECTION_SPEC_MISSING'));

  const optional = await evaluateDirectionGate({
    baseDir: path.join(root, 'empty-project'),
    required: false
  });
  assert.equal(optional.passed, true);

  const image = path.join(designDir, 'direction-options', 'direction-option-2b.png');
  await tinyPng(image);
  await recordDirectionIteration({
    baseDir: root,
    from: '2',
    to: '2b',
    imagePath: image,
    change: ['Icon set only'],
    note: 'ปรับ icon'
  });
  const refining = await evaluateDirectionGate({ baseDir: root });
  assert.equal(refining.passed, false);
  assert.ok(refining.findings.some((item) => item.code === 'DIRECTION_CONFIRM_REFINE' || item.code === 'DIRECTION_CONFIRM_MISSING'));
});
