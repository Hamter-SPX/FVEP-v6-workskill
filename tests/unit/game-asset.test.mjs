import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditAssetSet, auditAssetSpec, formatAssetReport } from '../../lib/game-asset-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const solidAsset = {
  id: 'prop.crate.harbour',
  name: 'Harbour supply crate',
  class: 'prop',
  styleBinding: 'domains/GAME/graphics/low-poly.md',
  purpose: 'Blocks sightlines on the dock and can be pushed to reach the upper walkway',
  silhouette: 'Wide low box with one splintered corner that breaks the symmetry at thumbnail size',
  scale: '3 studs cube, about 0.6x avatar height',
  materials: ['weathered pine planks', 'iron banding'],
  palette: 'wet slate and bleached timber',
  storyDetails: ['Stencil half scrubbed off', 'One plank replaced with fresher wood'],
  budget: { triangles: 320, textureSize: '256x256' },
  acceptance: ['Readable as pushable from 25 studs', 'Silhouette distinct from the barrel prop'],
  inContextEvidence: 'Dock gameplay capture next to the avatar in day and night lighting'
};

test('a complete asset spec passes', () => {
  const result = auditAssetSpec(solidAsset);
  assert.equal(result.ok, true, result.findings.map((f) => f.message).join('; '));
  assert.equal(result.assetClass, 'prop');
});

test('missing silhouette, scale, budget, and in-context evidence are blockers', () => {
  const result = auditAssetSpec({
    id: 'prop.thing',
    name: 'Thing',
    class: 'prop',
    styleBinding: 'style pack',
    purpose: 'Makes the level look cool and premium'
  });
  const codes = result.findings.map((finding) => finding.code);
  assert.equal(result.ok, false);
  assert.ok(codes.includes('ASSET_SILHOUETTE_MISSING'));
  assert.ok(codes.includes('ASSET_SCALE_MISSING'));
  assert.ok(codes.includes('ASSET_BUDGET_MISSING'));
  assert.ok(codes.includes('ASSET_ACCEPTANCE_MISSING'));
  assert.ok(codes.includes('ASSET_IN_CONTEXT_EVIDENCE_MISSING'));
  assert.ok(codes.includes('ASSET_PURPOSE_VAGUE'));
});

test('scale without a unit or reference is caught separately', () => {
  const noUnit = auditAssetSpec({ ...solidAsset, scale: 'about as tall as the player' });
  assert.ok(noUnit.findings.some((finding) => finding.code === 'ASSET_SCALE_UNIT_MISSING'));

  const noReference = auditAssetSpec({ ...solidAsset, scale: '3 studs cube' });
  assert.ok(noReference.findings.some((finding) => finding.code === 'ASSET_SCALE_REFERENCE_MISSING'));
});

test('invalid class and placeholder language are blockers', () => {
  const result = auditAssetSpec({ ...solidAsset, class: 'thingy', purpose: 'TODO decide later' });
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes('ASSET_CLASS_INVALID'));
  assert.ok(codes.includes('ASSET_PLACEHOLDER_LANGUAGE'));
});

test('set audit catches mixed units, split styles, and duplicate ids', () => {
  const result = auditAssetSet([
    solidAsset,
    { ...solidAsset, id: 'prop.crate.harbour' },
    { ...solidAsset, id: 'prop.barrel', scale: '1.2 meters tall, about 0.7x avatar height', styleBinding: 'photoreal pack' }
  ]);
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes('ASSET_SET_DUPLICATE_IDS'));
  assert.ok(codes.includes('ASSET_SET_SCALE_UNIT_MIXED'));
  assert.ok(codes.includes('ASSET_SET_STYLE_SPLIT'));
  assert.equal(result.ok, false);
  assert.equal(result.verdict, 'fail-asset-set');
});

test('set audit enforces a frame triangle budget', () => {
  const result = auditAssetSet([
    { ...solidAsset, budget: { triangles: 200000 } },
    { ...solidAsset, id: 'prop.barrel', budget: { triangles: 200000 } }
  ], { frameTriangleBudget: 250000 });
  assert.ok(result.findings.some((finding) => finding.code === 'ASSET_SET_BUDGET_EXCEEDED'));
});

test('VFX must declare timing, readability under overlap, and gameplay role', () => {
  const result = auditAssetSpec({
    ...solidAsset,
    id: 'vfx.spark',
    class: 'vfx',
    materials: []
  });
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes('ASSET_TIMING_MISSING'));
  assert.ok(codes.includes('ASSET_READABILITY_MISSING'));
  assert.ok(codes.includes('ASSET_GAMEPLAY_ROLE_MISSING'));
  assert.ok(!codes.includes('ASSET_MATERIALS_MISSING'), 'VFX is exempt from materials');
});

test('sound must declare layers, mix bus, repetition plan, and a redundant cue', () => {
  const result = auditAssetSpec({
    id: 'audio.hit',
    name: 'Hit sound',
    class: 'audio',
    styleBinding: 'design/aesthetic-profile.json',
    purpose: 'Confirms the melee hit connected and how heavy it was',
    budget: { voices: 2 },
    acceptance: ['Distinct from the block sound with eyes closed'],
    inContextEvidence: 'Recording of ten consecutive hits under full ambience'
  });
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes('ASSET_LAYERS_MISSING'));
  assert.ok(codes.includes('ASSET_MIX_BUS_MISSING'));
  assert.ok(codes.includes('ASSET_REPETITION_PLAN_MISSING'));
  assert.ok(codes.includes('ASSET_REDUNDANT_CUE_MISSING'));
  assert.ok(!codes.includes('ASSET_SILHOUETTE_MISSING'), 'a sound has no silhouette');
  assert.ok(!codes.includes('ASSET_SCALE_MISSING'), 'a sound is sized in time, not studs');
});

test('animation must declare timing, cancel window, and telegraph', () => {
  const result = auditAssetSpec({
    ...solidAsset,
    id: 'anim.swing',
    class: 'animation',
    scale: undefined,
    materials: []
  });
  const codes = result.findings.map((finding) => finding.code);
  assert.ok(codes.includes('ASSET_TIMING_MISSING'));
  assert.ok(codes.includes('ASSET_CANCEL_WINDOW_MISSING'));
  assert.ok(codes.includes('ASSET_TELEGRAPH_MISSING'));
  assert.ok(!codes.includes('ASSET_SCALE_MISSING'), 'animation is sized in time');
});

test('the shipped example asset set passes its own policy', async () => {
  const raw = JSON.parse(await fs.readFile(path.join(root, 'examples/game-assets.example.json'), 'utf8'));
  const result = auditAssetSet(raw.assets, raw.policy);
  assert.equal(result.ok, true, result.findings.map((f) => `${f.code}: ${f.message}`).join('; '));
  assert.match(formatAssetReport(result), /GAME ASSET DIRECTION/);
});

test('audit:game-assets CLI reports and exits non-zero on failure', () => {
  const pass = spawnSync(process.execPath, [
    path.join(root, 'scripts/audit-game-assets.mjs'), '--assets', path.join(root, 'examples/game-assets.example.json')
  ], { encoding: 'utf8' });
  assert.equal(pass.status ?? 0, 0, pass.stdout + pass.stderr);
  assert.match(pass.stdout, /GAME ASSET DIRECTION/);

  const help = spawnSync(process.execPath, [path.join(root, 'scripts/audit-game-assets.mjs')], { encoding: 'utf8' });
  assert.equal(help.status, 1);
});
