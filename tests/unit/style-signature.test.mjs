import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeStyleSignature, ARCHETYPE_SIGNATURES, classifyStyle, computeStyleSignature, SIGNATURE_FEATURES } from '../../lib/style-signature-engine.mjs';

const UTILITARIAN_MEASUREMENTS = {
  medianRadiusPx: 4,
  elevationLevels: 2,
  meanChroma: 0.04,
  typeScaleRatio: 1.2,
  informationDensity: 0.9,
  borderReliance: 0.8,
  monospaceRatio: 0.3,
  imageAreaRatio: 0.05
};

const SOFT_MEASUREMENTS = {
  medianRadiusPx: 22,
  elevationLevels: 3,
  meanChroma: 0.12,
  typeScaleRatio: 1.35,
  informationDensity: 0.25,
  borderReliance: 0.15,
  monospaceRatio: 0,
  imageAreaRatio: 0.5
};

test('signature normalization clamps to 0–1 and reports completeness', () => {
  const complete = computeStyleSignature(UTILITARIAN_MEASUREMENTS);
  assert.equal(complete.completeness, 100);
  for (const feature of SIGNATURE_FEATURES) assert.ok(complete.signature[feature] >= 0 && complete.signature[feature] <= 1);
  const partial = computeStyleSignature({ medianRadiusPx: 4 });
  assert.ok(partial.completeness < 20);
  assert.ok(partial.missing.includes('meanChroma'));
});

test('each archetype prototype classifies as itself', () => {
  for (const [name, prototype] of Object.entries(ARCHETYPE_SIGNATURES)) {
    assert.equal(classifyStyle(prototype).nearest.archetype, name, name);
  }
});

test('classification excludes unmeasured features rather than defaulting them', () => {
  const result = classifyStyle({ radius: 0.9 });
  assert.deepEqual(result.comparedFeatures, ['radius']);
  assert.equal(classifyStyle({}).nearest, null);
});

test('a declared archetype that matches the measurements produces no drift finding', () => {
  const report = analyzeStyleSignature({ declaredArchetype: 'utilitarian', measurements: UTILITARIAN_MEASUREMENTS });
  assert.equal(report.ok, true);
  assert.equal(report.classification.nearest.archetype, 'utilitarian');
  assert.ok(!report.findings.some((item) => item.code === 'STYLE_DRIFT_FROM_DECLARED'));
});

test('drift from the declared archetype is reported', () => {
  const report = analyzeStyleSignature({ declaredArchetype: 'utilitarian', measurements: SOFT_MEASUREMENTS });
  assert.ok(report.findings.some((item) => item.code === 'STYLE_DRIFT_FROM_DECLARED'));
});

test('an undeclared artifact that measures as the default archetype is flagged', () => {
  const report = analyzeStyleSignature({ measurements: SOFT_MEASUREMENTS });
  assert.ok(report.findings.some((item) => item.code === 'STYLE_UNDECLARED_DEFAULT'));
});

test('an incomplete signature lowers confidence instead of fabricating a match', () => {
  const report = analyzeStyleSignature({ measurements: { medianRadiusPx: 8, elevationLevels: 1 } });
  assert.ok(report.evidenceConfidence < 60);
  assert.ok(report.findings.some((item) => item.code === 'STYLE_SIGNATURE_INCOMPLETE'));
});
