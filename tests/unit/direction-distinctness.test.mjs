import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditDirectionDistinctness } from '../../lib/direction-distinctness-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const distinctSet = [
  {
    number: 1,
    thesis: 'Dense utilitarian field chrome with monospace telemetry strips',
    noveltyConcept: 'Instrument densemap as the primary surface language',
    changes: 'Compress vertical rhythm; mono readouts; flat tool chrome',
    stays: 'Shutter CTA and mode rail',
    personality: {
      seriousPlayful: 2, warmClinical: 4, understatedExpressive: 2, denseSpacious: 1, establishedNovel: 3
    }
  },
  {
    number: 2,
    thesis: 'Spacious editorial capture stage with quiet serif hierarchy',
    noveltyConcept: 'Magazine masthead hierarchy for a camera still task',
    changes: 'Open margins; editorial type roles; softer chrome',
    stays: 'Shutter CTA and mode rail',
    personality: {
      seriousPlayful: 3, warmClinical: 2, understatedExpressive: 4, denseSpacious: 5, establishedNovel: 4
    }
  },
  {
    number: 3,
    thesis: 'Playful high-chroma control dock with chunky tactile targets',
    noveltyConcept: 'Toy-instrument accent dock as the novelty spend',
    changes: 'Larger hit areas; saturated accent only on controls',
    stays: 'Shutter CTA position',
    personality: {
      seriousPlayful: 5, warmClinical: 2, understatedExpressive: 5, denseSpacious: 3, establishedNovel: 5
    }
  }
];

test('distinct option set passes the visual-direction distinctness gate', () => {
  const result = auditDirectionDistinctness(distinctSet);
  assert.equal(result.ok, true, result.findings.map((item) => item.message).join('; '));
  assert.equal(result.verdict, 'pass-distinct');
});

test('near-duplicate options fail for similarity and missing novelty', () => {
  const result = auditDirectionDistinctness([
    {
      number: 1,
      thesis: 'Modern clean camera UI with premium accents',
      noveltyConcept: 'clean',
      changes: 'slightly nicer',
      personality: { seriousPlayful: 3, denseSpacious: 3 }
    },
    {
      number: 2,
      thesis: 'Modern clean camera UI with premium blue accents',
      noveltyConcept: 'clean look',
      changes: 'same layout only accent hue',
      personality: { seriousPlayful: 3, denseSpacious: 3 }
    }
  ]);
  assert.equal(result.ok, false);
  assert.equal(result.verdict, 'fail-similar-or-weak-novelty');
  const codes = result.findings.map((item) => item.code);
  assert.ok(codes.includes('DIRECTION_OPTIONS_TOO_SIMILAR') || codes.includes('DIRECTION_OPTIONS_WEAK_SEPARATION'));
  assert.ok(codes.includes('DIRECTION_THESIS_VAGUE') || codes.includes('DIRECTION_NOVELTY_MISSING') || codes.includes('DIRECTION_TRIVIAL_VARIANT'));
});

test('direction-distinctness CLI exits 1 on weak set', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'direction-distinct-'));
  const file = path.join(dir, 'options.json');
  await fs.writeFile(file, JSON.stringify({
    options: [
      {
        number: 1,
        thesis: 'Soft rounded cards everywhere',
        noveltyConcept: 'soft cards',
        changes: 'rounder corners',
        personality: { seriousPlayful: 3, denseSpacious: 3, establishedNovel: 3 }
      },
      {
        number: 2,
        thesis: 'Soft rounded cards with slight blue tint',
        noveltyConcept: 'soft cards blue',
        changes: 'same layout only accent',
        personality: { seriousPlayful: 3, denseSpacious: 3, establishedNovel: 3 }
      }
    ]
  }));
  const result = spawnSync(process.execPath, [
    path.join(root, 'scripts/direction-distinctness.mjs'),
    '--options', file
  ], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /fail-similar-or-weak-novelty|DIRECTION_/);
});
