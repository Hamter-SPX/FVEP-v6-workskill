import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { initDirectionArtifacts } from '../../lib/direction-init-engine.mjs';
import {
  compareDirectionSpecToProfile,
  parseDirectionSpec,
  profileFromDirectionSpec,
  syncDirectionSpecToProfile
} from '../../lib/direction-spec-sync-engine.mjs';

const FILLED_SPEC = `# Visual Direction Spec

Durable record of the user’s chosen look for **Camera app**.

## Selection

- Selected option: 2
- Selected at (ISO timestamp): 2026-08-03T10:00:00.000Z
- Chosen image / artifact: design/direction-options/direction-option-2.png
- Reference screenshot(s): design/reference.png
- Unchosen options (and why they were rejected, if stated): 1 too dense, 3 too playful

## What We Like (from the chosen option)

- Hierarchy / focal point: shutter dominates the lower third
- Density / spacing character: generous margins, quiet chrome
- Colour temperature and accent discipline: cool neutrals, one amber accent
- Typography character (weight, scale, measure): medium sans, clear role steps
- Surface / chrome / elevation: flat glass, low elevation
- Motion character (if visible): short ease-out feedback only
- Tone / brand feeling in one sentence: calm precision for one-handed capture

## Direction Thesis

> Calm one-handed capture with spacious chrome and a single amber accent.

## Personality Positions (draft)

| Axis | Value (1–5) | Why (from the choice) |
|---|---:|---|
| serious ↔ playful | 2 | Capture stakes stay serious |
| warm ↔ clinical | 3 | Cool neutrals, amber warmth only in accent |
| understated ↔ expressive | 2 | Quiet chrome |
| dense ↔ spacious | 4 | Chosen option opened the margins |
| established ↔ novel | 3 | Familiar camera grammar, one novelty accent |

## Keep from the Reference

- Primary task / critical controls: shutter and mode switch stay reachable
- Layout regions that must survive: viewfinder fills the upper field
- Platform / safe-area / design-system constraints: iOS safe areas

## Change from the Reference

- What the chosen option deliberately changes: removes dense tool strips
- Novelty budget (at most 2–3 positions): amber accent + spacious chrome only

## Explicit Non-Goals

- Neon gradients and sticker chrome from option 3
- Dense utilitarian strip from option 1

## Linked Artifacts

- Aesthetic profile path (to write next): design/aesthetic-profile.json
- Design contract path: design/design-contract.json
- Acceptance cases (route × viewport × state): home__mobile__default

## Confirmation Gate

Do **not** start implementation until the user answers one of:

1. **เริ่มเขียน**

## Status

- [x] Spec written from selected option
- [x] User confirmed: เริ่มเขียน
- [ ] Aesthetic profile bound to this spec
- [ ] Design contract bound to this spec
`;

test('direction init scaffolds spec, profile, contract, and options readme', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-dir-init-'));
  const result = await initDirectionArtifacts({
    baseDir: root,
    product: 'Camera app',
    audience: 'field photographers',
    primaryTask: 'Capture a photo one-handed',
    selectedOption: 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.created.length, 4);
  assert.equal(result.skipped.length, 0);
  const spec = await fs.readFile(result.paths.specPath, 'utf8');
  assert.match(spec, /Selected option: 2/);
  assert.match(spec, /Camera app/);
  const profile = JSON.parse(await fs.readFile(result.paths.profilePath, 'utf8'));
  assert.equal(profile.product, 'Camera app');
  assert.equal(profile.audience, 'field photographers');
  const contract = JSON.parse(await fs.readFile(result.paths.contractPath, 'utf8'));
  assert.match(contract.objective, /Camera app/);
  assert.equal(contract.directionSpec, 'design/visual-direction-spec.md');
  const readme = await fs.readFile(path.join(result.paths.optionsDir, 'README.md'), 'utf8');
  assert.match(readme, /direction:gallery/);
});

test('direction init skips existing files unless force is set', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-dir-init-skip-'));
  await initDirectionArtifacts({ baseDir: root, product: 'First' });
  const second = await initDirectionArtifacts({ baseDir: root, product: 'Second' });
  assert.equal(second.created.length, 0);
  assert.equal(second.skipped.length, 4);
  const profile = JSON.parse(await fs.readFile(path.join(root, 'design', 'aesthetic-profile.json'), 'utf8'));
  assert.equal(profile.product, 'First');

  const forced = await initDirectionArtifacts({ baseDir: root, product: 'Forced', force: true });
  assert.equal(forced.created.length, 4);
  const forcedProfile = JSON.parse(await fs.readFile(path.join(root, 'design', 'aesthetic-profile.json'), 'utf8'));
  assert.equal(forcedProfile.product, 'Forced');
});

test('parseDirectionSpec reads selection, thesis, axes, and confirm status', () => {
  const parsed = parseDirectionSpec(FILLED_SPEC);
  assert.equal(parsed.selectedOption, 2);
  assert.equal(parsed.thesis, 'Calm one-handed capture with spacious chrome and a single amber accent.');
  assert.equal(parsed.personality.denseSpacious.value, 4);
  assert.equal(parsed.personality.seriousPlayful.value, 2);
  assert.equal(parsed.confirmedStart, true);
  assert.equal(parsed.profilePath, 'design/aesthetic-profile.json');
  assert.match(parsed.likes[0], /shutter dominates/);
  assert.equal(parsed.noveltyBudget[0].position, 'Novelty budget');
});

test('profileFromDirectionSpec maps axes and adopted likes', () => {
  const parsed = parseDirectionSpec(FILLED_SPEC);
  const profile = profileFromDirectionSpec(parsed, { product: 'Camera app', audience: 'pros' });
  assert.equal(profile.personality.denseSpacious.value, 4);
  assert.equal(profile.rationale, parsed.thesis);
  assert.ok(profile.styleDirection.adopted.some((item) => /shutter dominates/i.test(item)));
  assert.ok(profile.nonGoals.some((item) => /Neon gradients/i.test(item)));
});

test('compareDirectionSpecToProfile detects axis drift', () => {
  const parsed = parseDirectionSpec(FILLED_SPEC);
  const profile = profileFromDirectionSpec(parsed, { product: 'Camera app' });
  profile.personality.denseSpacious.value = 1;
  const comparison = compareDirectionSpecToProfile(parsed, profile);
  assert.equal(comparison.ok, false);
  assert.ok(comparison.findings.some((item) => item.code === 'DIRECTION_PROFILE_AXIS_DRIFT'));
});

test('syncDirectionSpecToProfile writes profile and check catches drift', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-dir-sync-'));
  const designDir = path.join(root, 'design');
  await fs.mkdir(designDir, { recursive: true });
  const specPath = path.join(designDir, 'visual-direction-spec.md');
  const profilePath = path.join(designDir, 'aesthetic-profile.json');
  await fs.writeFile(specPath, FILLED_SPEC, 'utf8');

  const written = await syncDirectionSpecToProfile({ baseDir: root });
  assert.equal(written.wroteProfile, true);
  assert.equal(written.passed, true);
  const profile = JSON.parse(await fs.readFile(profilePath, 'utf8'));
  assert.equal(profile.personality.denseSpacious.value, 4);

  profile.personality.seriousPlayful.value = 5;
  await fs.writeFile(profilePath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
  const checked = await syncDirectionSpecToProfile({ baseDir: root, checkOnly: true });
  assert.equal(checked.wroteProfile, false);
  assert.equal(checked.passed, false);
  assert.ok(checked.comparison.findings.some((item) => item.code === 'DIRECTION_PROFILE_AXIS_DRIFT'));
});

test('sync --check fails when profile is missing', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fvl-dir-sync-missing-'));
  const designDir = path.join(root, 'design');
  await fs.mkdir(designDir, { recursive: true });
  await fs.writeFile(path.join(designDir, 'visual-direction-spec.md'), FILLED_SPEC, 'utf8');
  const checked = await syncDirectionSpecToProfile({ baseDir: root, checkOnly: true });
  assert.equal(checked.passed, false);
  assert.ok(checked.comparison.findings.some((item) => item.code === 'PROFILE_MISSING'));
});
