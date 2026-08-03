import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMigrationPlan } from '../../lib/migration-risk-engine.mjs';

test('migration audit blocks destructive changes without expand-contract, rollback, backup, and compatibility window', () => {
  const report = auditMigrationPlan({ migrations: [{
    id: 'drop-email', type: 'drop-column', table: 'users', owner: 'Data', estimatedRows: 5000000,
    expandContract: false, compatibilityWindowHours: 0, rollback: null, backup: null, verification: null
  }] });
  assert.equal(report.status, 'fail');
  for (const code of ['migration-expand-contract-missing', 'migration-rollback-missing', 'migration-backup-missing', 'migration-compatibility-window-missing']) {
    assert.ok(report.findings.some((finding) => finding.code === code));
  }
});

test('migration audit detects unbounded and non-idempotent large backfill', () => {
  const report = auditMigrationPlan({ migrations: [{
    id: 'backfill-slug', type: 'backfill', table: 'products', owner: 'Catalog', estimatedRows: 2000000,
    batchSize: null, checkpointing: false, idempotent: false, maxLockMs: 5000, rollback: 'Restore from shadow column', verification: 'Count missing slugs'
  }] });
  assert.equal(report.status, 'fail');
  assert.ok(report.findings.some((finding) => finding.code === 'migration-backfill-unbounded'));
  assert.ok(report.findings.some((finding) => finding.code === 'migration-backfill-not-idempotent'));
});
