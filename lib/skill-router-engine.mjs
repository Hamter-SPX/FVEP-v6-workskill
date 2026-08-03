import { finalizeProcessAudit, processFinding, unique } from './process-audit-utils.mjs';

const ORDER = Object.freeze([
  'using-superpowers',
  'brainstorming',
  'systematic-debugging',
  'writing-plans',
  'using-git-worktrees',
  'dispatching-parallel-agents',
  'subagent-driven-development',
  'executing-plans',
  'writing-skills',
  'test-driven-development',
  'requesting-code-review',
  'receiving-code-review',
  'verification-before-completion',
  'finishing-a-development-branch'
]);

function ordered(values) {
  const set = new Set(values);
  return ORDER.filter((name) => set.has(name)).concat([...set].filter((name) => !ORDER.includes(name)).sort());
}

export function routeProcessSkills(context = {}, policy = {}) {
  const required = new Set(['using-superpowers']);
  const recommended = new Set();
  const constraints = new Set();
  const findings = [];
  const kind = String(context.kind ?? 'general');
  const stage = String(context.stage ?? 'discovery');
  const creative = context.creative === true || ['feature', 'redesign', 'architecture', 'skill-authoring'].includes(kind);
  const implementation = ['implementation', 'fix', 'refactor', 'review', 'pre-merge', 'completion', 'integration'].includes(stage);

  if (creative) required.add('brainstorming');
  if (context.hasUnexpectedBehavior === true || ['bugfix', 'incident', 'debugging'].includes(kind)) required.add('systematic-debugging');
  if (context.needsIsolation === true || implementation) required.add('using-git-worktrees');
  if (context.multiStep === true || context.hasImplementationPlan === true || implementation) required.add('writing-plans');
  if (kind === 'skill-authoring') required.add('writing-skills');
  if (implementation) required.add('test-driven-development');
  if (context.receivingReviewFeedback === true || kind === 'review-feedback') required.add('receiving-code-review');
  if (context.requestingReview === true || ['review', 'pre-merge'].includes(stage)) required.add('requesting-code-review');

  if (Number(context.independentDomains ?? 0) >= Number(policy.parallelDomainThreshold ?? 2)) {
    recommended.add('dispatching-parallel-agents');
    if (context.parallelImplementationHasSharedFiles === true || context.sharedMutableState === true) constraints.add('parallel-analysis-only');
  }

  if (context.hasImplementationPlan === true && implementation) {
    required.add(context.subagentsAvailable === true ? 'subagent-driven-development' : 'executing-plans');
  }

  if (['implementation', 'review', 'pre-merge', 'completion', 'integration'].includes(stage)) required.add('verification-before-completion');
  if (['completion', 'integration'].includes(stage) || kind === 'finish-branch') required.add('finishing-a-development-branch');

  if (creative && context.hasApprovedDesign !== true && !policy.allowUnapprovedDesign) {
    findings.push(processFinding('DESIGN_APPROVAL_REQUIRED', 'blocker', 'Creative or architectural work requires an approved design before implementation.', { remediation: 'Complete design governance and record approval.' }));
  }
  if (context.hasImplementationPlan === false && implementation && !policy.allowPlanlessImplementation) {
    findings.push(processFinding('IMPLEMENTATION_PLAN_REQUIRED', 'blocker', 'Implementation work requires a validated plan.', { remediation: 'Create and validate a task-level implementation plan.' }));
  }
  if (context.subagentsAvailable !== true && context.hasImplementationPlan === true && implementation) constraints.add('inline-execution-with-checkpoints');
  if (required.has('systematic-debugging')) constraints.add('root-cause-before-fix');
  if (required.has('test-driven-development')) constraints.add('red-before-production-code');
  constraints.add('fresh-verification-before-claim');

  const report = finalizeProcessAudit(findings, { blockedStatus: true, evidenceCount: Object.keys(context).length });
  return {
    ...report,
    required: ordered(required),
    recommended: ordered(recommended),
    constraints: unique([...constraints]),
    reasons: ordered(required).map((skill) => ({ skill, trigger: kind === 'general' ? stage : `${kind}:${stage}` }))
  };
}
