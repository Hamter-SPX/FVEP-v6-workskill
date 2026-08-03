import test from 'node:test';
import assert from 'node:assert/strict';
import { auditAestheticProfile, normalizeAestheticProfile, PERSONALITY_AXES, validateAestheticProfile } from '../../lib/aesthetic-profile-engine.mjs';

function axis(value, reason = 'Because the task demands it.', consequences = ['Cool neutrals']) {
  return { value, reason, consequences };
}

function baseProfile(overrides = {}) {
  return {
    schemaVersion: 1,
    product: 'Reconciliation console',
    rationale: 'Analysts resolve payment breaks before a same-day cut-off.',
    personality: {
      seriousPlayful: axis(1),
      warmClinical: axis(4),
      understatedExpressive: axis(2),
      denseSpacious: axis(1),
      establishedNovel: axis(2)
    },
    noveltyBudget: [{ position: 'Break-age indicator', decision: 'Inline bar encoding time to cut-off', reason: 'Urgency is judged on every row.' }],
    systems: {
      color: { neutralTemperature: 'cool', accentCount: 1 },
      typography: { scaleRatio: 1.2, roleCount: 6 },
      spacing: { baseUnitPx: 4, density: 'dense' },
      motion: { overshoot: 'none', reducedMotionSupported: true }
    },
    nonGoals: ['A dashboard-first landing surface'],
    ...overrides
  };
}

test('profile validation requires every personality axis', () => {
  assert.doesNotThrow(() => validateAestheticProfile(baseProfile()));
  for (const missing of PERSONALITY_AXES) {
    const profile = baseProfile();
    delete profile.personality[missing];
    assert.throws(() => validateAestheticProfile(profile), RangeError, missing);
  }
});

test('profile normalization flattens axes and style direction', () => {
  const normalized = normalizeAestheticProfile(baseProfile({ styleDirection: { archetype: 'utilitarian', adopted: ['dense rows'], rejected: ['tiny type'] } }));
  assert.equal(normalized.personality.seriousPlayful, 1);
  assert.equal(normalized.archetype, 'utilitarian');
  assert.deepEqual(normalized.adopted, ['dense rows']);
});

test('a specific profile audits clean', () => {
  const report = auditAestheticProfile(baseProfile());
  assert.equal(report.ok, true);
  assert.equal(report.status, 'pass');
  assert.equal(report.profile.product, 'Reconciliation console');
});

test('an invalid profile is a blocker rather than an exception', () => {
  const report = auditAestheticProfile({ product: 'x' });
  assert.equal(report.ok, false);
  assert.equal(report.profile, null);
  assert.ok(report.hardFailures.some((item) => item.code === 'PROFILE_INVALID'));
});

test('unconstraining language is rejected as direction', () => {
  const report = auditAestheticProfile(baseProfile({ rationale: 'A modern and premium experience for our users.' }));
  assert.ok(report.findings.some((item) => item.code === 'PROFILE_VAGUE_LANGUAGE'));
});

test('positions without reasons or consequences cannot be reviewed', () => {
  const profile = baseProfile();
  profile.personality.warmClinical = { value: 4 };
  const report = auditAestheticProfile(profile);
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('PROFILE_AXIS_REASON_MISSING'));
  assert.ok(codes.includes('PROFILE_AXIS_CONSEQUENCES_MISSING'));
});

test('density that contradicts the declared axis is reported', () => {
  const profile = baseProfile();
  profile.systems.spacing.density = 'spacious';
  const report = auditAestheticProfile(profile);
  assert.ok(report.findings.some((item) => item.code === 'PROFILE_DENSITY_CONTRADICTS_AXIS'));
});

test('declining reduced-motion support blocks the profile', () => {
  const profile = baseProfile();
  profile.systems.motion.reducedMotionSupported = false;
  const report = auditAestheticProfile(profile);
  assert.equal(report.ok, false);
  assert.ok(report.hardFailures.some((item) => item.code === 'PROFILE_REDUCED_MOTION_UNSUPPORTED'));
});
