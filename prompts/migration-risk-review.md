# Migration Risk Review Prompt

Review each schema and data migration for table size, lock behavior, compatibility, deployment order, transaction scope, backfill bounds, checkpointing, idempotency, load budget, replica/CDC impact, verification, backup, abort, rollback, and irreversible effects. Require expand-contract for destructive change. Return the exact sequence and the invariant checked after each step.
