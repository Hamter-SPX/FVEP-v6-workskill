import path from 'node:path';
import { finalizeProcessAudit, processFinding, unique } from './process-audit-utils.mjs';

function normalizePath(value) {
  return path.posix.normalize(String(value).replaceAll('\\', '/'));
}

function taskFiles(task) {
  const files = task?.files ?? {};
  return new Set(unique([...(files.create ?? []), ...(files.modify ?? []), ...(files.test ?? [])]).map(normalizePath));
}

function pairConflicts(left, right) {
  const conflicts = [];
  const leftFiles = taskFiles(left);
  const rightFiles = taskFiles(right);
  const sharedFiles = [...leftFiles].filter((file) => rightFiles.has(file));
  if (sharedFiles.length) conflicts.push({ kind: 'file', values: sharedFiles });
  const sharedResources = unique(left?.resources ?? []).filter((value) => unique(right?.resources ?? []).includes(value));
  if (sharedResources.length) conflicts.push({ kind: 'resource', values: sharedResources });
  const sharedState = unique(left?.sharedState ?? []).filter((value) => unique(right?.sharedState ?? []).includes(value));
  if (sharedState.length) conflicts.push({ kind: 'shared-state', values: sharedState });
  return conflicts;
}

function partitionLevel(levelTasks, conflictsByPair) {
  const waves = [];
  for (const task of [...levelTasks].sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    let placed = false;
    for (const wave of waves) {
      const safe = wave.every((existing) => !conflictsByPair.has([task.id, existing.id].sort().join('\u0000')));
      if (safe) { wave.push(task); placed = true; break; }
    }
    if (!placed) waves.push([task]);
  }
  return waves.map((wave) => wave.map((task) => String(task.id)).sort());
}

export function analyzeTaskGraph(tasksInput = [], policy = {}) {
  const findings = [];
  const tasks = Array.isArray(tasksInput) ? tasksInput : [];
  const byId = new Map();
  for (const [index, task] of tasks.entries()) {
    const id = String(task?.id ?? '');
    if (!id) findings.push(processFinding('TASK_ID_MISSING', 'blocker', 'Every task requires an id.', { path: `tasks[${index}]` }));
    else if (byId.has(id)) findings.push(processFinding('DUPLICATE_TASK_ID', 'blocker', `Duplicate task id: ${id}.`));
    else byId.set(id, { ...task, id });
  }

  const indegree = new Map([...byId.keys()].map((id) => [id, 0]));
  const outgoing = new Map([...byId.keys()].map((id) => [id, []]));
  for (const task of byId.values()) {
    for (const dependency of unique(task.dependsOn ?? [])) {
      if (!byId.has(dependency)) {
        findings.push(processFinding('UNKNOWN_TASK_DEPENDENCY', 'blocker', `Task ${task.id} depends on unknown task ${dependency}.`));
        continue;
      }
      indegree.set(task.id, indegree.get(task.id) + 1);
      outgoing.get(dependency).push(task.id);
    }
  }

  const conflicts = [];
  const conflictsByPair = new Set();
  const taskList = [...byId.values()];
  for (let i = 0; i < taskList.length; i += 1) {
    for (let j = i + 1; j < taskList.length; j += 1) {
      const left = taskList[i];
      const right = taskList[j];
      for (const conflict of pairConflicts(left, right)) {
        conflicts.push({ kind: conflict.kind, tasks: [left.id, right.id].sort(), values: conflict.values });
        conflictsByPair.add([left.id, right.id].sort().join('\u0000'));
      }
    }
  }
  if (conflicts.length) findings.push(processFinding('PARALLEL_CONFLICTS_DETECTED', 'low', 'Some dependency-ready tasks require separate execution waves.', { detail: conflicts }));

  const waves = [];
  let processed = 0;
  const remainingIndegree = new Map(indegree);
  let ready = [...remainingIndegree.entries()].filter(([, count]) => count === 0).map(([id]) => id).sort();
  while (ready.length) {
    const levelIds = ready;
    ready = [];
    const levelTasks = levelIds.map((id) => byId.get(id));
    waves.push(...partitionLevel(levelTasks, conflictsByPair));
    processed += levelIds.length;
    for (const id of levelIds) {
      for (const next of outgoing.get(id) ?? []) {
        remainingIndegree.set(next, remainingIndegree.get(next) - 1);
      }
    }
    ready = [...remainingIndegree.entries()]
      .filter(([id, count]) => count === 0 && !waves.flat().includes(id))
      .map(([id]) => id)
      .sort();
  }
  if (processed !== byId.size) findings.push(processFinding('TASK_GRAPH_CYCLE', 'blocker', 'Task graph contains a dependency cycle.'));

  const report = finalizeProcessAudit(findings, { evidenceCount: tasks.length + conflicts.length });
  return {
    ...report,
    waves,
    executionOrder: waves.flat(),
    conflicts,
    parallelizableTaskCount: waves.reduce((sum, wave) => sum + (wave.length > 1 ? wave.length : 0), 0),
    policy: { treatSharedResourcesAsExclusive: true, ...policy }
  };
}
