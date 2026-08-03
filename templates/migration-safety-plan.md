# Migration Safety Plan

| Migration ID | Type | Table/data | Estimated size | Lock/load budget | Compatibility phase | Owner |
|---|---|---|---|---|---|---|

## Expand

Describe additive schema and compatible code behavior.

## Backfill/Migrate

Specify batch order, batch size, checkpointing, idempotency, rate limit, metrics, stop conditions, and verification.

## Contract

Specify consumer verification, compatibility window, destructive cleanup, and approval.

## Recovery

Record backup/restore, abort, rollback, old-code compatibility, queue/event compatibility, and irreversible risk.
