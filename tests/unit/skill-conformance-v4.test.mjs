import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSkillConformance } from '../../lib/skill-conformance-engine.mjs';

const requiredSkills = [
  'using-superpowers', 'brainstorming', 'dispatching-parallel-agents', 'executing-plans',
  'finishing-a-development-branch', 'receiving-code-review', 'requesting-code-review',
  'subagent-driven-development', 'systematic-debugging', 'test-driven-development',
  'using-git-worktrees', 'verification-before-completion', 'writing-plans', 'writing-skills'
];
const requiredReferences = [
  'references/process-kernel-overview.md', 'references/skill-routing-and-precedence.md',
  'references/design-before-implementation.md', 'references/executable-planning.md',
  'references/tdd-evidence-protocol.md', 'references/scientific-debugging-protocol.md',
  'references/review-and-feedback-governance.md', 'references/verification-and-claim-governance.md'
];
const requiredAestheticReferences = [
  'references/aesthetic-direction-protocol.md', 'references/aesthetic-principles.md',
  'references/aesthetic-scoring-anchors.md', 'references/visual-craft-standards.md'
];

function validInput() {
  const allReferences = [...requiredReferences, ...requiredAestheticReferences];
  const references = allReferences.map((item) => `Read \`${item}\`.`).join('\n');
  return {
    skillText: `---\nname: fullstack-vision-engineering-pro\ndescription: Use when production full-stack work requires governed design, implementation, review, and release evidence.\n---\n# Skill\n${references}\nUse npm run process:audit.`,
    filePaths: [...allReferences, 'tests/process-pressure-scenarios-v4.md', 'tests/TDD_EVIDENCE_V4.md'],
    pressureScenariosText: '# Pressure\nTime pressure\nAuthority pressure\nSunk cost\nContext loss\nReview collusion\nFalse completion',
    tddEvidenceText: '# Evidence\n## RED\nCommand failed for missing behavior: FAIL\n## GREEN\nCommand passed: PASS\n## REFACTOR\nRegression remained green.',
    adaptationMatrixText: requiredSkills.join('\n'),
    packageJson: { name: 'fullstack-vision-engineering-pro', version: '5.0.0', scripts: { 'process:audit': 'x', 'process:tdd': 'x', 'process:review': 'x', 'audit:aesthetics': 'x', validate: 'x' } }
  };
}

const policy = { requiredSkills, requiredReferences, requiredAestheticReferences };

test('complete v5 skill surface passes conformance', () => {
  const report = auditSkillConformance(validInput(), policy);
  assert.equal(report.status, 'pass');
  assert.equal(report.hardFailures.length, 0);
  assert.equal(report.coverage.skills, 100);
  assert.equal(report.coverage.pressureCategories, 100);
});

test('malformed frontmatter and workflow summary in description fail discovery conformance', () => {
  const input = validInput();
  input.skillText = `---\nname: Full Stack!\ndescription: Use when coding, then write tests, then implement, then review and merge.\n---\n# Skill`;
  const report = auditSkillConformance(input, policy);
  assert.ok(report.hardFailures.some((item) => item.code === 'SKILL_NAME_INVALID'));
  assert.ok(report.hardFailures.some((item) => item.code === 'DESCRIPTION_SUMMARIZES_WORKFLOW'));
});

test('missing pressure categories and installed-skill adaptations fail closed', () => {
  const input = validInput();
  input.pressureScenariosText = 'Time pressure only';
  input.adaptationMatrixText = 'using-superpowers';
  const report = auditSkillConformance(input, policy);
  assert.ok(report.hardFailures.some((item) => item.code === 'PRESSURE_SCENARIO_COVERAGE_INCOMPLETE'));
  assert.ok(report.hardFailures.some((item) => item.code === 'SUPERPOWERS_ADAPTATION_INCOMPLETE'));
});

test('missing process references and absent RED evidence cannot pass', () => {
  const input = validInput();
  input.filePaths = [];
  input.tddEvidenceText = '# Evidence\nAll tests pass after implementation.';
  const report = auditSkillConformance(input, policy);
  assert.ok(report.hardFailures.some((item) => item.code === 'REQUIRED_PROCESS_REFERENCE_MISSING'));
  assert.ok(report.hardFailures.some((item) => item.code === 'TDD_RED_EVIDENCE_MISSING'));
});

test('the aesthetic direction layer must be surfaced on the skill', () => {
  const input = validInput();
  input.filePaths = input.filePaths.filter((item) => !requiredAestheticReferences.includes(item));
  const report = auditSkillConformance(input, policy);
  assert.ok(report.hardFailures.some((item) => item.code === 'REQUIRED_AESTHETIC_REFERENCE_MISSING'));
  assert.equal(report.coverage.aestheticReferences, 0);
});

test('unresolved placeholders and missing process CLI contract are blockers', () => {
  const input = validInput();
  input.skillText += '\nTBD';
  delete input.packageJson.scripts['process:review'];
  const report = auditSkillConformance(input, policy);
  assert.ok(report.hardFailures.some((item) => item.code === 'SKILL_PLACEHOLDER_LANGUAGE'));
  assert.ok(report.hardFailures.some((item) => item.code === 'PROCESS_CLI_SURFACE_INCOMPLETE'));
});
