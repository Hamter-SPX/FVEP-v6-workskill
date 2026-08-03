import { containsPlaceholder, finalizeProcessAudit, nonEmpty, processFinding, unique } from './process-audit-utils.mjs';

const REQUIRED_STEPS = Object.freeze(['write-failing-test', 'verify-red', 'implement', 'verify-green', 'commit']);

function graphOrder(tasks, findings) {
  const byId = new Map(tasks.map((task) => [String(task?.id ?? ''), task]));
  const indegree = new Map([...byId.keys()].map((id) => [id, 0]));
  const outgoing = new Map([...byId.keys()].map((id) => [id, []]));
  for (const task of tasks) {
    const id = String(task?.id ?? '');
    for (const dependency of unique(task?.dependsOn ?? [])) {
      if (!byId.has(dependency)) {
        findings.push(processFinding('UNKNOWN_DEPENDENCY', 'blocker', `Task ${id} depends on unknown task ${dependency}.`, { path: `tasks.${id}.dependsOn` }));
        continue;
      }
      indegree.set(id, (indegree.get(id) ?? 0) + 1);
      outgoing.get(dependency).push(id);
    }
  }
  const queue = [...indegree.entries()].filter(([, count]) => count === 0).map(([id]) => id).sort();
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const next of outgoing.get(id) ?? []) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) { queue.push(next); queue.sort(); }
    }
  }
  if (order.length !== byId.size) findings.push(processFinding('DEPENDENCY_CYCLE', 'blocker', 'Task dependency graph contains a cycle.'));
  return order;
}

export function auditImplementationPlan(plan = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  for (const field of ['id', 'goal', 'architecture']) {
    if (!nonEmpty(plan[field])) findings.push(processFinding('PLAN_FIELD_MISSING', 'blocker', `Plan field ${field} is required.`, { path: field }));
    else evidenceCount += 1;
  }
  if (!Array.isArray(plan.techStack) || plan.techStack.length === 0) findings.push(processFinding('TECH_STACK_MISSING', 'high', 'Plan must identify the implementation stack.'));
  if (!Array.isArray(plan.globalConstraints) || plan.globalConstraints.length === 0) findings.push(processFinding('GLOBAL_CONSTRAINTS_MISSING', 'high', 'Plan must define binding global constraints.'));
  if (containsPlaceholder(JSON.stringify(plan))) findings.push(processFinding('VAGUE_OR_PLACEHOLDER_STEP', 'blocker', 'Plan contains placeholder, vague, or deferred implementation language.'));

  const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];
  if (tasks.length === 0) findings.push(processFinding('TASKS_MISSING', 'blocker', 'Plan must contain at least one task.'));
  const seen = new Set();
  for (const [index, task] of tasks.entries()) {
    const id = String(task?.id ?? '');
    if (!id) findings.push(processFinding('TASK_ID_MISSING', 'blocker', 'Every task needs an identifier.', { path: `tasks[${index}]` }));
    else if (seen.has(id)) findings.push(processFinding('DUPLICATE_TASK_ID', 'blocker', `Duplicate task identifier: ${id}.`));
    else seen.add(id);

    const files = task?.files ?? {};
    if (![files.create, files.modify, files.test].some((value) => Array.isArray(value) && value.length > 0)) findings.push(processFinding('TASK_FILES_MISSING', 'high', `Task ${id || index} does not declare files.`));
    if (!Array.isArray(files.test) || files.test.length === 0) findings.push(processFinding('TASK_TEST_FILE_MISSING', 'blocker', `Task ${id || index} requires a test file.`));

    const steps = Array.isArray(task?.steps) ? task.steps : [];
    const kinds = new Set(steps.map((step) => String(step?.kind ?? '')));
    for (const required of REQUIRED_STEPS) if (!kinds.has(required)) findings.push(processFinding('MISSING_REQUIRED_STEP', 'blocker', `Task ${id || index} is missing ${required}.`, { path: `tasks.${id}.steps` }));
    for (const [stepIndex, step] of steps.entries()) {
      const text = `${step?.detail ?? ''} ${step?.command ?? ''} ${step?.expected ?? ''}`;
      if (containsPlaceholder(text)) findings.push(processFinding('VAGUE_OR_PLACEHOLDER_STEP', 'blocker', `Task ${id || index} contains a vague step.`, { path: `tasks.${id}.steps[${stepIndex}]` }));
      if (['verify-red', 'verify-green', 'commit'].includes(step?.kind) && (!nonEmpty(step?.command) || !nonEmpty(step?.expected))) findings.push(processFinding('INCOMPLETE_EXECUTABLE_STEP', 'blocker', `Task ${id || index} step ${step?.kind} requires command and expected outcome.`, { path: `tasks.${id}.steps[${stepIndex}]` }));
    }
    evidenceCount += steps.length;
  }

  const executionOrder = graphOrder(tasks, findings);
  const producers = new Map();
  for (const task of tasks) for (const produced of unique(task?.interfaces?.produces ?? [])) producers.set(produced, String(task.id));
  for (const task of tasks) {
    const dependencies = new Set(unique(task?.dependsOn ?? []));
    for (const consumed of unique(task?.interfaces?.consumes ?? [])) {
      const producer = producers.get(consumed);
      if (!producer || !dependencies.has(producer)) findings.push(processFinding('UNRESOLVED_INTERFACE', 'blocker', `Task ${task.id} consumes ${consumed} without a declared producing dependency.`, { path: `tasks.${task.id}.interfaces.consumes` }));
    }
  }

  const report = finalizeProcessAudit(findings, { evidenceCount });
  return { ...report, executionOrder, taskCount: tasks.length, policy: { requiredSteps: REQUIRED_STEPS, ...policy } };
}
