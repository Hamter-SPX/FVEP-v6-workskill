import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSecurityContract } from '../../lib/security-review-engine.mjs';
import { scanSourceFiles } from '../../lib/source-risk-scanner.mjs';

test('security contract fails closed on missing object authorization and secret controls', () => {
  const report = auditSecurityContract({
    features: ['multi-tenant', 'file-upload'],
    controls: { authentication: { status: 'implemented', evidence: ['auth.test'] }, authorization: { status: 'partial', evidence: [] }, secrets: { status: 'missing', evidence: [] }, fileUploads: { status: 'partial', evidence: [] } }
  });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'security-object-authorization-incomplete'));
  assert.ok(report.findings.some((finding) => finding.code === 'security-secrets-control-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'security-upload-control-incomplete'));
});

test('source risk scanner reports dangerous patterns without leaking secret values', () => {
  const secret = 'sk_live_SUPER_SECRET_VALUE';
  const report = scanSourceFiles([
    { path: 'src/config.js', content: `const apiKey = "${secret}";` },
    { path: 'src/run.js', content: 'eval(userInput); child_process.exec(`convert ${filename}`);' },
    { path: 'src/http.js', content: 'const agent = { rejectUnauthorized: false };' }
  ]);
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'source-hardcoded-secret'));
  assert.ok(report.findings.some((finding) => finding.code === 'source-dynamic-eval'));
  assert.ok(report.findings.some((finding) => finding.code === 'source-shell-injection-risk'));
  assert.ok(report.findings.some((finding) => finding.code === 'source-tls-verification-disabled'));
  assert.equal(JSON.stringify(report).includes(secret), false);
  assert.equal(report.heuristic, true);
});
