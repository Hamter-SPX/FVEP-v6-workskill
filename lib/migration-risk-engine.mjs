import { finalizeAudit, makeFinding, nonEmpty, percentage } from './audit-utils.mjs';

const DESTRUCTIVE = new Set(['drop-column', 'drop-table', 'rename-column', 'rename-table', 'alter-type', 'data-delete']);

export function auditMigrationPlan(plan = {}, policy = {}) {
  const migrations = Array.isArray(plan?.migrations) ? plan.migrations : [];
  const findings = [];
  const largeTableRows = Number(policy.largeTableRows ?? 100_000);
  const maxSafeLockMs = Number(policy.maxSafeLockMs ?? 1000);
  let checks = 0;
  let passed = 0;
  const seen = new Set();

  for (const [index, migration] of migrations.entries()) {
    const id = String(migration?.id ?? `migration-${index + 1}`);
    const path = `migrations.${id}`;
    if (seen.has(id)) findings.push(makeFinding('migration-id-duplicate', 'blocker', `Migration identifier ${id} is duplicated.`, { path }));
    seen.add(id);
    const type = String(migration?.type ?? 'unknown');
    const rows = Number(migration?.estimatedRows ?? 0);

    checks += 2;
    if (nonEmpty(migration?.owner)) passed += 1;
    else findings.push(makeFinding('migration-owner-missing', 'high', `Migration ${id} has no owner.`, { path }));
    if (nonEmpty(migration?.verification)) passed += 1;
    else findings.push(makeFinding('migration-verification-missing', 'high', `Migration ${id} has no post-change verification query or invariant.`, { path }));

    if (DESTRUCTIVE.has(type)) {
      const required = [
        ['expandContract', migration?.expandContract === true, 'migration-expand-contract-missing', 'Destructive migration lacks an expand-contract rollout.'],
        ['rollback', nonEmpty(migration?.rollback), 'migration-rollback-missing', 'Destructive migration lacks a rollback procedure.'],
        ['backup', nonEmpty(migration?.backup), 'migration-backup-missing', 'Destructive migration lacks backup or recovery evidence.'],
        ['compatibilityWindowHours', Number(migration?.compatibilityWindowHours ?? 0) > 0, 'migration-compatibility-window-missing', 'Destructive migration has no compatibility window.']
      ];
      for (const [, ok, code, message] of required) {
        checks += 1;
        if (ok) passed += 1;
        else findings.push(makeFinding(code, code === 'migration-compatibility-window-missing' ? 'high' : 'blocker', `${message} (${id}).`, { path }));
      }
    }

    if (type === 'backfill' && rows >= largeTableRows) {
      checks += 2;
      if (Number(migration?.batchSize ?? 0) > 0 && migration?.checkpointing === true) passed += 1;
      else findings.push(makeFinding('migration-backfill-unbounded', 'blocker', `Large backfill ${id} is not bounded by batches and checkpoints.`, { path, detail: rows }));
      if (migration?.idempotent === true) passed += 1;
      else findings.push(makeFinding('migration-backfill-not-idempotent', 'blocker', `Large backfill ${id} is not declared idempotent.`, { path }));
    }

    if (type === 'create-index' && rows >= largeTableRows) {
      checks += 1;
      if (migration?.online === true || migration?.concurrently === true) passed += 1;
      else findings.push(makeFinding('migration-index-lock-risk', 'high', `Large-table index migration ${id} is not online/concurrent.`, { path }));
    }

    if (Number.isFinite(Number(migration?.maxLockMs)) && Number(migration.maxLockMs) > maxSafeLockMs) findings.push(makeFinding('migration-lock-budget-exceeded', 'high', `Migration ${id} lock budget ${migration.maxLockMs}ms exceeds policy ${maxSafeLockMs}ms.`, { path }));
  }

  if (!migrations.length) findings.push(makeFinding('migration-plan-empty', policy.required === true ? 'blocker' : 'low', 'No database migrations are declared for this release.'));
  const confidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: migrations.length, evidenceConfidence: checks ? confidence : (policy.required ? 0 : 100) });
  return { ...report, migrationCount: migrations.length, policy: { largeTableRows, maxSafeLockMs }, coverage: { requiredChecks: checks, satisfiedChecks: passed, confidence: checks ? confidence : 100 } };
}
