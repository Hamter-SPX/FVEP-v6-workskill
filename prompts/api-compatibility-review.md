# API Compatibility Review Prompt

Compare baseline and current API or event contracts. Enumerate removed operations/responses, new required inputs, type/nullability/enum/meaning changes, authorization changes, pagination/order changes, error-code changes, idempotency changes, and consumer deployment constraints. Do not call a schema additive until consumer tolerance is evidenced. Return breaking changes, affected consumers, safe rollout sequence, contract tests, deprecation plan, and rollback behavior.
