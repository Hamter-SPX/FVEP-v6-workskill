import test from 'node:test';
import assert from 'node:assert/strict';
import { auditArchitectureContract } from '../../lib/architecture-risk-engine.mjs';

test('architecture audit detects dangling edges, unprotected trust crossings, cycles, and critical single points of failure', () => {
  const report = auditArchitectureContract({
    components: [
      { id: 'web', type: 'frontend', owner: 'Web', criticality: 'high', trustZone: 'public', replicas: 2 },
      { id: 'api', type: 'service', owner: '', criticality: 'critical', trustZone: 'private', replicas: 1, slo: null, fallback: null },
      { id: 'db', type: 'database', owner: 'Data', criticality: 'critical', trustZone: 'restricted', replicas: 1, slo: { availability: 99.9 }, fallback: null }
    ],
    edges: [
      { from: 'web', to: 'api', protocol: 'https', authentication: null, authorization: null, encryption: true, timeoutMs: 5000 },
      { from: 'api', to: 'db', protocol: 'postgres', authentication: 'workload-identity', authorization: 'least-privilege', encryption: false, timeoutMs: 2000 },
      { from: 'db', to: 'api', protocol: 'event', authentication: 'service', authorization: 'allowlist', encryption: true, timeoutMs: 1000 },
      { from: 'api', to: 'missing-worker', protocol: 'queue' }
    ]
  });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'architecture-edge-dangling'));
  assert.ok(report.findings.some((finding) => finding.code === 'architecture-trust-auth-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'architecture-trust-encryption-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'architecture-cycle-detected'));
  assert.ok(report.findings.some((finding) => finding.code === 'architecture-critical-spof'));
});
