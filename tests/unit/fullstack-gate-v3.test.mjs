import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFullstackGate } from '../../lib/fullstack-gate-engine.mjs';

test('fullstack gate blocks a hard security failure despite high scores elsewhere', () => {
  const report = buildFullstackGate({
    process: { status: 'pass', score: 100, evidenceConfidence: 100, evidenceCount: 8, blockers: [] },
    frontend: { score: 98, confidence: 100, passed: true },
    experience: { status: 'pass', score: 96, evidenceConfidence: 100, evidenceCount: 2 },
    api: { status: 'pass', score: 95, evidenceConfidence: 100, evidenceCount: 10 },
    architecture: { status: 'pass', score: 90, evidenceConfidence: 100, evidenceCount: 5 },
    data: { status: 'pass', score: 95, evidenceConfidence: 100, evidenceCount: 1 },
    security: { status: 'fail', score: 40, evidenceConfidence: 100, evidenceCount: 4, blockers: [{ code: 'authz' }] },
    resilience: { status: 'pass', score: 90, evidenceConfidence: 100, evidenceCount: 4 },
    observability: { status: 'pass', score: 90, evidenceConfidence: 100, evidenceCount: 4 },
    dependencies: { status: 'pass', score: 95, evidenceConfidence: 100, evidenceCount: 1 },
    risks: { status: 'pass', score: 95, evidenceConfidence: 100, evidenceCount: 3 }
  });
  assert.equal(report.passed, false);
  assert.ok(report.hardFailures.includes('security'));
});

test('fullstack gate separates high measured quality from incomplete evidence confidence', () => {
  const report = buildFullstackGate({
    process: { status: 'pass', score: 100, evidenceConfidence: 100, evidenceCount: 8, blockers: [] },
    frontend: { score: 98, confidence: 30, passed: false },
    experience: { status: 'pass', score: 98, evidenceConfidence: 40, evidenceCount: 1 },
    api: { status: 'pass', score: 98, evidenceConfidence: 100, evidenceCount: 5 },
    architecture: { status: 'pass', score: 98, evidenceConfidence: 100, evidenceCount: 4 },
    data: { status: 'not-applicable', score: null, evidenceConfidence: null, evidenceCount: 0 },
    security: { status: 'pass', score: 98, evidenceConfidence: 100, evidenceCount: 8 },
    resilience: { status: 'pass', score: 98, evidenceConfidence: 100, evidenceCount: 4 },
    observability: { status: 'pass', score: 98, evidenceConfidence: 50, evidenceCount: 1 },
    dependencies: { status: 'pass', score: 98, evidenceConfidence: 100, evidenceCount: 1 },
    risks: { status: 'pass', score: 98, evidenceConfidence: 100, evidenceCount: 3 }
  }, { minScore: 90, minConfidence: 90, failOnAnyGateFailure: false });
  assert.ok(report.score >= 90);
  assert.ok(report.confidence < 90);
  assert.equal(report.passed, false);
});
