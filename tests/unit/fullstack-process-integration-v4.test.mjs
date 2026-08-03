import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { normalizeFullstackConfig } from '../../lib/fullstack-config.mjs';
import { runFullstackAudit } from '../../lib/fullstack-audit-engine.mjs';

function processReport(overrides = {}) {
  return {
    schemaVersion: 4,
    status: 'pass',
    processGate: {
      status: 'pass', releaseEligible: true, qualityScore: 98, score: 98,
      evidenceConfidence: 100, evidenceCount: 8, hardFailures: [], blockers: [], findings: []
    },
    ...overrides
  };
}

const allDomainApplicabilityOff = {
  frontend: false, experience: false, api: false, architecture: false, data: false,
  security: false, resilience: false, observability: false, dependencies: false, risks: false
};

test('v4 full-stack config makes governed process evidence a required hard gate', () => {
  const config = normalizeFullstackConfig({ contracts: { processReport: 'artifacts/process/process-report.json' } }, '/tmp/project/fullstack.config.json');
  assert.equal(config.version, 4);
  assert.equal(config.contracts.processReport, path.resolve('/tmp/project/artifacts/process/process-report.json'));
  assert.equal(config.gates.process.required, true);
  assert.equal(config.gates.process.hard, true);
});

test('passing process report is admitted as a full-stack release gate', () => {
  const report = runFullstackAudit({ process: processReport() }, {
    quality: { minScore: 90, minConfidence: 90, failOnAnyGateFailure: true },
    applicability: allDomainApplicabilityOff
  });
  assert.equal(report.sections.process.status, 'pass');
  assert.equal(report.quality.passed, true);
  assert.equal(report.quality.gates.process.status, 'pass');
});

test('missing or blocked process evidence cannot be averaged away by other gates', () => {
  const missing = runFullstackAudit({}, {
    quality: { minScore: 0, minConfidence: 0, failOnAnyGateFailure: false },
    applicability: allDomainApplicabilityOff
  });
  assert.equal(missing.quality.passed, false);
  assert.ok(missing.quality.hardFailures.includes('process'));

  const blocked = runFullstackAudit({ process: processReport({ processGate: { status: 'fail', releaseEligible: false, qualityScore: 99, score: 99, evidenceConfidence: 100, evidenceCount: 8, hardFailures: [{ code: 'REVIEW_MISSING' }], blockers: [{ code: 'REVIEW_MISSING' }] } }) }, {
    quality: { minScore: 0, minConfidence: 0, failOnAnyGateFailure: false },
    applicability: allDomainApplicabilityOff
  });
  assert.equal(blocked.quality.passed, false);
  assert.ok(blocked.quality.hardFailures.includes('process'));
  assert.equal(blocked.sections.process.releaseEligible, false);
});
