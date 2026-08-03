import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQualityGateSummary } from '../../lib/gate-engine.mjs';

test('gate engine converts evidence sections into a strict quality decision', () => {
  const result = buildQualityGateSummary({
    comparison: { comparisons: [{ severity: 'minor', perceptual: { similarity: 0.98 } }], blockers: 0, majors: 0, minors: 1, ok: true },
    inspection: [{ ok: true, horizontalOverflow: false }],
    accessibility: [{ ok: true, blockingViolationCount: 0 }],
    performance: [{ ok: true, budget: { score: 92, hardFailures: [], warnings: [] } }],
    interaction: [{ ok: true, missingNameCount: 0, targetSizeViolationCount: 0 }],
    engineering: [{ required: true, ok: true }],
    capture: [{ ok: true, runtimeSummary: { status: 'pass' } }]
  }, { minScore: 80, minConfidence: 80 });
  assert.equal(result.passed, true);
  assert.equal(result.gates.visual.status, 'warning');
  assert.ok(result.score >= 80);
});

test('gate engine treats missing required evidence as reduced confidence', () => {
  const result = buildQualityGateSummary({ comparison: { comparisons: [], blockers: 0, majors: 0, minors: 0, ok: true } }, { minConfidence: 90 });
  assert.equal(result.passed, false);
  assert.ok(result.confidence < 90);
});

test('unverified visual evidence does not become a passing visual gate', () => {
  const result = buildQualityGateSummary({ comparison: { comparisons: [{ severity: 'unverified' }], blockers: 0, majors: 0, minors: 0, unverified: 1, ok: true } }, { minConfidence: 0 });
  assert.equal(result.gates.visual.status, 'skipped');
  assert.equal(result.gates.visual.evidenceStatus, 'missing');
});

test('semantic visual review can supply visual evidence when no reference comparison exists', () => {
  const result = buildQualityGateSummary({
    manualReview: { evaluation: { passed: true, score: 92, evidenceCount: 2, blockers: [], configMatches: true, fresh: true } },
    inspection: [{ ok: true, horizontalOverflow: false }],
    accessibility: [{ ok: true, blockingViolationCount: 0 }],
    performance: [{ ok: true, budget: { score: 90, hardFailures: [], warnings: [] } }],
    interaction: [{ ok: true, missingNameCount: 0, targetSizeViolationCount: 0 }],
    capture: [{ ok: true, runtimeSummary: { status: 'pass' } }]
  }, { applicability: { engineering: false }, minConfidence: 80 });
  assert.equal(result.gates.visual.status, 'pass');
  assert.equal(result.gates.visual.score, 92);
});

test('exact-reference quality is blocked by invalid baseline provenance', () => {
  const sections = {
    comparison: { comparisons: [{ severity: 'accepted', perceptual: { similarity: 1 } }], total: 1, blockers: 0, majors: 0, minors: 0, accepted: 1, ok: true },
    inspection: [{ ok: true, horizontalOverflow: false }],
    accessibility: [{ ok: true, blockingViolationCount: 0 }],
    performance: [{ ok: true, budget: { score: 100, confidence: 100, hardFailures: [], warnings: [] } }],
    interaction: [{ ok: true, missingNameCount: 0, targetSizeViolationCount: 0 }],
    engineering: [{ required: true, ok: true }],
    capture: [{ ok: true, runtimeSummary: { status: 'pass' } }]
  };
  sections.baseline = { valid: false, configMatches: false, approvalValid: true, changed: [], missing: [] };
  const result = buildQualityGateSummary(sections, { mode: 'exact-reference', baselineRequired: true, minScore: 0, minConfidence: 0 });
  assert.equal(result.gates.visual.status, 'fail');
  assert.ok(result.hardFailures.includes('visual'));
});

test('case-matrix coverage reduces gate confidence when only a subset was inspected', () => {
  const expectedCaseKeys = ['home__mobile__default', 'home__tablet__default', 'home__desktop__default'];
  const result = buildQualityGateSummary({
    accessibility: [{ key: expectedCaseKeys[0], ok: true, blockingViolationCount: 0, violationCount: 0 }]
  }, {
    expectedCaseKeys,
    minScore: 0,
    minConfidence: 0,
    failOnAnyGateFailure: false,
    applicability: { visual: false, responsive: false, accessibility: true, runtime: false, engineering: false, performance: false, interaction: false }
  });
  assert.equal(result.gates.accessibility.evidenceCount, 1);
  assert.equal(result.gates.accessibility.coverage.expected, 3);
  assert.equal(result.gates.accessibility.coverage.covered, 1);
  assert.equal(result.gates.accessibility.evidenceConfidence, 33.33);
  assert.deepEqual(result.gates.accessibility.coverage.missing, expectedCaseKeys.slice(1));
});
