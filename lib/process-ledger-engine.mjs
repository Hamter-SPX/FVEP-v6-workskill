import { hashCanonical } from './provenance.mjs';
import { finalizeProcessAudit, nonEmpty, processFinding } from './process-audit-utils.mjs';

const PROCESS_TRANSITIONS = Object.freeze({
  requested: ['routed'],
  routed: ['discovered'],
  discovered: ['designed'],
  designed: ['approved'],
  approved: ['planned'],
  planned: ['workspace-ready', 'final-reviewed'],
  'workspace-ready': ['task-in-progress', 'final-reviewed'],
  'task-in-progress': ['task-in-progress', 'final-reviewed'],
  'final-reviewed': ['release-verified'],
  'release-verified': ['integration-ready'],
  'integration-ready': []
});

const TASK_TRANSITIONS = Object.freeze({
  'in-progress': ['red-verified'],
  'red-verified': ['green-verified'],
  'green-verified': ['reviewed', 'fix-loop'],
  'fix-loop': ['green-verified', 'reviewed'],
  reviewed: ['complete', 'fix-loop'],
  complete: []
});

function eventProjection(event) {
  const { hash, ...projection } = event ?? {};
  return projection;
}

export function createLedgerEvent(input = {}) {
  const event = {
    schemaVersion: 1,
    sequence: Number(input.sequence),
    type: String(input.type ?? ''),
    actor: String(input.actor ?? ''),
    at: String(input.at ?? ''),
    previousHash: input.previousHash ?? null,
    data: structuredClone(input.data ?? {})
  };
  return { ...event, hash: hashCanonical(event) };
}

export function reduceProcessLedger(eventsInput = [], policy = {}) {
  const findings = [];
  const events = Array.isArray(eventsInput) ? eventsInput : [];
  let state = null;
  let planId = null;
  let previousHash = null;
  let expectedSequence = 1;
  const tasks = {};
  const ledgerFindings = [];
  const fixRounds = {};

  for (const [index, event] of events.entries()) {
    const path = `events[${index}]`;
    if (event?.sequence !== expectedSequence) findings.push(processFinding('LEDGER_SEQUENCE_GAP', 'blocker', `Expected sequence ${expectedSequence}, received ${String(event?.sequence)}.`, { path }));
    expectedSequence += 1;
    if (!nonEmpty(event?.actor) || !nonEmpty(event?.at) || !nonEmpty(event?.type)) findings.push(processFinding('LEDGER_EVENT_INCOMPLETE', 'blocker', 'Ledger event lacks actor, timestamp, or type.', { path }));
    const computed = hashCanonical(eventProjection(event));
    if (computed !== event?.hash) findings.push(processFinding('LEDGER_HASH_MISMATCH', 'blocker', 'Ledger event content does not match its hash.', { path }));
    if ((event?.previousHash ?? null) !== previousHash) findings.push(processFinding('LEDGER_CHAIN_BROKEN', 'blocker', 'Ledger previousHash does not match the prior event.', { path }));
    previousHash = event?.hash ?? previousHash;

    switch (event?.type) {
      case 'initialize': {
        if (index !== 0) findings.push(processFinding('LEDGER_REINITIALIZED', 'blocker', 'Initialize event must be first.', { path }));
        planId = String(event.data?.planId ?? '');
        state = String(event.data?.state ?? 'requested');
        if (!planId || state !== 'requested') findings.push(processFinding('INVALID_LEDGER_INITIALIZATION', 'blocker', 'Ledger must initialize a plan in requested state.', { path }));
        break;
      }
      case 'transition': {
        const from = String(event.data?.from ?? '');
        const to = String(event.data?.to ?? '');
        if (from !== state || !(PROCESS_TRANSITIONS[from] ?? []).includes(to)) findings.push(processFinding('INVALID_PROCESS_TRANSITION', 'blocker', `Process cannot transition from ${from || '<missing>'} to ${to || '<missing>'} while current state is ${state ?? '<uninitialized>'}.`, { path }));
        else state = to;
        break;
      }
      case 'task-started': {
        const taskId = String(event.data?.taskId ?? '');
        if (!taskId || tasks[taskId]) findings.push(processFinding('INVALID_TASK_START', 'blocker', 'Task start requires a new task id.', { path }));
        else tasks[taskId] = { state: 'in-progress', history: ['in-progress'], lastSequence: event.sequence };
        break;
      }
      case 'task-state': {
        const taskId = String(event.data?.taskId ?? '');
        const to = String(event.data?.state ?? '');
        const current = tasks[taskId]?.state;
        if (!current || !(TASK_TRANSITIONS[current] ?? []).includes(to)) findings.push(processFinding('INVALID_TASK_TRANSITION', 'blocker', `Task ${taskId || '<missing>'} cannot transition from ${current ?? '<not-started>'} to ${to || '<missing>'}.`, { path }));
        else {
          tasks[taskId].state = to;
          tasks[taskId].history.push(to);
          tasks[taskId].lastSequence = event.sequence;
        }
        break;
      }
      case 'finding':
        ledgerFindings.push(structuredClone(event.data ?? {}));
        break;
      case 'fix-round': {
        const taskId = String(event.data?.taskId ?? '');
        fixRounds[taskId] = Math.max(Number(fixRounds[taskId] ?? 0), Number(event.data?.round ?? 0));
        break;
      }
      case 'note':
      case 'supersede':
        break;
      default:
        findings.push(processFinding('UNKNOWN_LEDGER_EVENT', 'high', `Unknown ledger event type: ${String(event?.type)}.`, { path }));
    }
  }

  if (events.length === 0 || events[0]?.type !== 'initialize') findings.push(processFinding('LEDGER_INITIALIZATION_MISSING', 'blocker', 'Ledger must begin with an initialize event.'));
  const report = finalizeProcessAudit(findings, { evidenceCount: events.length, evidenceConfidence: events.length ? 100 : 0 });
  return {
    ...report,
    planId,
    state,
    tasks,
    findingsLedger: ledgerFindings,
    fixRounds,
    lastSequence: events.at(-1)?.sequence ?? 0,
    lastHash: events.at(-1)?.hash ?? null,
    recoverable: report.hardFailures.length === 0 && Boolean(planId),
    policy: { maxFixRounds: Number(policy.maxFixRounds ?? 5) }
  };
}
