import test from 'node:test';
import assert from 'node:assert/strict';
import { createLedgerEvent, reduceProcessLedger } from '../../lib/process-ledger-engine.mjs';

function append(events, type, data, actor = 'controller') {
  events.push(createLedgerEvent({
    sequence: events.length + 1,
    type,
    actor,
    at: new Date(1_700_000_000_000 + events.length * 1_000).toISOString(),
    data,
    previousHash: events.at(-1)?.hash ?? null
  }));
}

test('append-only ledger reconstructs workflow and task state after context loss', () => {
  const events = [];
  append(events, 'initialize', { planId: 'plan-v4', state: 'requested' });
  append(events, 'transition', { from: 'requested', to: 'routed' });
  append(events, 'transition', { from: 'routed', to: 'discovered' });
  append(events, 'transition', { from: 'discovered', to: 'designed' });
  append(events, 'transition', { from: 'designed', to: 'approved' });
  append(events, 'transition', { from: 'approved', to: 'planned' });
  append(events, 'task-started', { taskId: 'task-1' });
  append(events, 'task-state', { taskId: 'task-1', state: 'red-verified' });
  append(events, 'task-state', { taskId: 'task-1', state: 'green-verified' });
  append(events, 'task-state', { taskId: 'task-1', state: 'reviewed' });
  append(events, 'task-state', { taskId: 'task-1', state: 'complete' });
  const report = reduceProcessLedger(events);
  assert.equal(report.status, 'pass');
  assert.equal(report.state, 'planned');
  assert.equal(report.tasks['task-1'].state, 'complete');
  assert.equal(report.recoverable, true);
  assert.equal(report.lastSequence, events.length);
});

test('tampered event hash and broken previous-hash chain fail', () => {
  const events = [];
  append(events, 'initialize', { planId: 'plan-v4', state: 'requested' });
  append(events, 'transition', { from: 'requested', to: 'routed' });
  events[1] = { ...events[1], data: { from: 'requested', to: 'release-verified' } };
  const report = reduceProcessLedger(events);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'LEDGER_HASH_MISMATCH'));
});

test('invalid lifecycle bypass is rejected even with valid hashes', () => {
  const events = [];
  append(events, 'initialize', { planId: 'plan-v4', state: 'requested' });
  append(events, 'transition', { from: 'requested', to: 'integration-ready' });
  const report = reduceProcessLedger(events);
  assert.ok(report.hardFailures.some((item) => item.code === 'INVALID_PROCESS_TRANSITION'));
});

test('task cannot complete before RED, GREEN, and review states', () => {
  const events = [];
  append(events, 'initialize', { planId: 'plan-v4', state: 'requested' });
  append(events, 'task-started', { taskId: 'task-1' });
  append(events, 'task-state', { taskId: 'task-1', state: 'complete' });
  const report = reduceProcessLedger(events);
  assert.ok(report.hardFailures.some((item) => item.code === 'INVALID_TASK_TRANSITION'));
});
