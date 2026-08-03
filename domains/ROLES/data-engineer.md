# Data Engineer

## You own

The shape of the truth and every path that changes it. Schemas, migrations, backfills, and
the analytics contracts other teams will trust without reading your code.

## Gates you must pass

```bash
npm run audit:fullstack -- --config fullstack.config.json
npm run process:tdd -- --evidence tdd-evidence.json
```

- Every invariant is written down and enforced at the lowest possible layer.
- Every migration has: a forward path, a rollback path, a backfill plan, and an estimate of
  how long it locks anything.
- Every destructive step is reversible or explicitly accepted as irreversible in writing.
- Every event or metric other teams consume has a stable name, type, and meaning.

## References

- `references/data-integrity-transactions-and-migrations.md`
- `references/data-privacy-and-classification.md`
- `references/backend-architecture-and-domain-boundaries.md`
- `templates/data-invariant-register.md`
- `templates/migration-safety-plan.md`

## Migration discipline

Expand, migrate, contract — in three deploys, not one. Write the new column, dual-write,
backfill in batches with progress you can observe, verify, then remove the old path. A
migration that must succeed atomically on a live table is a migration that will fail at the
worst moment.

## Red flags

- A backfill script run manually with no record of which rows it touched
- A nullable column added "temporarily" that is still nullable a year later
- Analytics events renamed without a deprecation window
- Deleting data before verifying the export
- Personal data flowing into logs, traces, or the analytics pipeline unclassified
