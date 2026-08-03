import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const required = [
  'SUPERPOWERS_ADAPTATION_MATRIX.md', 'MIGRATION_V3_TO_V4.md',
  'references/process-kernel-overview.md', 'references/skill-routing-and-precedence.md',
  'references/design-before-implementation.md', 'references/executable-planning.md',
  'references/tdd-evidence-protocol.md', 'references/scientific-debugging-protocol.md',
  'references/parallel-task-isolation.md', 'references/subagent-task-lifecycle.md',
  'references/review-and-feedback-governance.md', 'references/workspace-and-branch-safety.md',
  'references/verification-and-claim-governance.md', 'references/integration-and-cleanup.md',
  'references/skill-authoring-conformance.md', 'references/context-recovery-ledger.md',
  'templates/task-brief.md', 'templates/review-package.md', 'templates/feedback-ruling.md',
  'templates/tdd-evidence.md', 'templates/debug-session.md', 'templates/integration-decision.md',
  'agents/process-controller.md', 'agents/task-implementer.md', 'agents/task-reviewer.md',
  'agents/re-reviewer.md', 'agents/final-reviewer.md',
  'prompts/process-controller.md', 'prompts/task-implementer.md', 'prompts/task-reviewer.md',
  'prompts/re-reviewer.md', 'prompts/final-reviewer.md',
  'tests/process-pressure-scenarios-v4.md'
];
const schemaFiles = [
  'process-config.schema.json', 'process-request.schema.json', 'process-design.schema.json',
  'implementation-plan.schema.json', 'workspace-snapshot.schema.json', 'process-ledger.schema.json',
  'tdd-evidence.schema.json', 'debug-session.schema.json', 'review-chain.schema.json',
  'feedback-disposition.schema.json', 'completion-claims.schema.json', 'integration-decision.schema.json'
];
const exampleFiles = [
  'request.feature.json', 'design.approved.json', 'implementation-plan.json',
  'workspace.linked-worktree.json', 'process-ledger.json', 'tdd-cycles.json',
  'debug-session.json', 'review-chain.json', 'claims.json', 'evidence.json',
  'integration.decision-required.json', 'process.config.json'
];
const skills = [
  'using-superpowers', 'brainstorming', 'dispatching-parallel-agents', 'executing-plans',
  'finishing-a-development-branch', 'receiving-code-review', 'requesting-code-review',
  'subagent-driven-development', 'systematic-debugging', 'test-driven-development',
  'using-git-worktrees', 'verification-before-completion', 'writing-plans', 'writing-skills'
];

test('v4 documentation, role, template, and process reference surface is complete', async () => {
  for (const relative of required) {
    const text = await fs.readFile(path.join(root, relative), 'utf8');
    assert.ok(text.length > 180, `${relative} is too thin`);
    assert.doesNotMatch(text, /\b(?:TODO|TBD|FIXME|implement later|fill in details)\b/i, relative);
  }
});

test('adaptation matrix explicitly covers every installed Superpowers process skill', async () => {
  const matrix = await fs.readFile(path.join(root, 'SUPERPOWERS_ADAPTATION_MATRIX.md'), 'utf8');
  for (const skill of skills) assert.match(matrix, new RegExp(`\\b${skill.replaceAll('-', '\\-')}\\b`), skill);
  assert.match(matrix, /original adaptation/i);
  assert.match(matrix, /deterministic engine/i);
});

test('all v4 process schemas and examples are valid JSON documents', async () => {
  for (const file of schemaFiles) {
    const parsed = JSON.parse(await fs.readFile(path.join(root, 'schemas', file), 'utf8'));
    assert.equal(parsed.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.ok(parsed.title, file);
    assert.equal(parsed.type, 'object');
  }
  for (const file of exampleFiles) {
    const parsed = JSON.parse(await fs.readFile(path.join(root, 'examples', 'process', file), 'utf8'));
    assert.equal(typeof parsed, 'object');
    assert.ok(parsed !== null && !Array.isArray(parsed), file);
  }
});

test('README and SKILL expose governed process entry points and explicit limitations', async () => {
  const [readme, thai, skill] = await Promise.all([
    fs.readFile(path.join(root, 'README.md'), 'utf8'),
    fs.readFile(path.join(root, 'README_TH.md'), 'utf8'),
    fs.readFile(path.join(root, 'SKILL.md'), 'utf8')
  ]);
  for (const text of [readme, thai, skill]) {
    assert.match(text, /process:audit/);
    assert.match(text, /review/i);
    assert.match(text, /evidence/i);
  }
  assert.match(readme, /does not provide.*subagent|cannot create.*subagent|host.*subagent/is);
  assert.match(thai, /ไม่สามารถ.*subagent|ไม่มี.*subagent/is);
});
