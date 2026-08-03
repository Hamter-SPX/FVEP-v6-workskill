# TDD Evidence

**Cycle ID / behavior ID / requirement reference**  
**Test identity:** file and test name  
**Risk:** normal or high

## RED

Command, exit status, failure kind, expected signature, observed signature, output hash, test hash, pre-change production hash, timestamp.

## Production change

Change ID, changed production hash, timestamp.

## GREEN

Command, exit status, pass count, output hash, same test hash, changed production hash, timestamp.

## Negative control

For high-risk behavior, record mutation/revert command, failed-as-expected status, and output hash.

## Refactor

When changed, record the fresh post-refactor verification command and result.
