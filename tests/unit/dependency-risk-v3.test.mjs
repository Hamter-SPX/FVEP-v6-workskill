import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDependencyManifest } from '../../lib/dependency-risk-engine.mjs';

test('dependency audit detects unpinned, remote, lifecycle, and missing-lockfile risks', () => {
  const report = auditDependencyManifest({
    manifest: { name: 'demo', dependencies: { a: '^1.2.3', b: 'git+https://example.com/b.git', c: 'https://example.com/c.tgz' }, scripts: { postinstall: 'node scripts/download.js' } },
    lockfilePresent: false
  });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'dependency-lockfile-missing'));
  assert.ok(report.findings.some((finding) => finding.code === 'dependency-version-unpinned'));
  assert.ok(report.findings.some((finding) => finding.code === 'dependency-remote-source'));
  assert.ok(report.findings.some((finding) => finding.code === 'dependency-lifecycle-script'));
});

test('dependency audit blocks a present lockfile that does not verify against the manifest', () => {
  const report = auditDependencyManifest({
    manifest: { name: 'demo', dependencies: { a: '1.2.3' } },
    lockfilePresent: true,
    lockfileVerified: false,
    lockfileIssues: ['dependencies.a differs from the root lock entry']
  });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'dependency-lockfile-unverified'));
});

test('dependency audit accepts exact dependencies backed by a verified lockfile', () => {
  const report = auditDependencyManifest({
    manifest: { name: 'demo', dependencies: { a: '1.2.3' } },
    lockfilePresent: true,
    lockfileVerified: true,
    lockfileKind: 'npm'
  });
  assert.equal(report.status, 'pass');
  assert.equal(report.coverage.confidence, 100);
});
