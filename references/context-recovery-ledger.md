# Context Recovery Ledger

Agent conversations can compact, reset, or lose task position. The recovery ledger moves durable coordination state into an append-only artifact. Every event has a sequence number, actor, timestamp, previous hash, data, and content hash.

The reducer validates order, hash linkage, process transitions, task transitions, findings, and fix rounds. It reconstructs plan identity, current lifecycle state, task histories, last sequence, and last hash. Tampering or a gap blocks recovery.

The ledger is not a substitute for git history or test evidence. It is the coordination index that points to those artifacts. A fresh controller should trust the validated ledger and repository history over unaudited conversational memory.
