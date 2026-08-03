import { containsPlaceholder, finalizeProcessAudit, processFinding, unique } from './process-audit-utils.mjs';

export const INSTALLED_SUPERPOWERS_SKILLS = Object.freeze([
  'using-superpowers', 'brainstorming', 'dispatching-parallel-agents', 'executing-plans',
  'finishing-a-development-branch', 'receiving-code-review', 'requesting-code-review',
  'subagent-driven-development', 'systematic-debugging', 'test-driven-development',
  'using-git-worktrees', 'verification-before-completion', 'writing-plans', 'writing-skills'
]);

export const REQUIRED_PROCESS_REFERENCES = Object.freeze([
  'references/process-kernel-overview.md', 'references/skill-routing-and-precedence.md',
  'references/design-before-implementation.md', 'references/executable-planning.md',
  'references/tdd-evidence-protocol.md', 'references/scientific-debugging-protocol.md',
  'references/review-and-feedback-governance.md', 'references/verification-and-claim-governance.md'
]);

export const REQUIRED_AESTHETIC_REFERENCES = Object.freeze([
  'references/aesthetic-direction-protocol.md', 'references/aesthetic-principles.md',
  'references/aesthetic-scoring-anchors.md', 'references/visual-craft-standards.md',
  'references/visual-direction-exploration.md'
]);

const PRESSURE_CATEGORIES = Object.freeze({
  time: /time[ -]pressure/i,
  authority: /authority[ -]pressure/i,
  'sunk-cost': /sunk[ -]cost/i,
  'context-loss': /context[ -]loss/i,
  'review-collusion': /review[ -]collusion/i,
  'false-completion': /false[ -]completion/i
});

function percentage(count, total) {
  return total ? Number(((count / total) * 100).toFixed(2)) : 0;
}

function parseFrontmatter(text) {
  const match = String(text ?? '').match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const block = match[1];
  return {
    block,
    name: block.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? null,
    description: block.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? null
  };
}

function workflowLikeDescription(description) {
  const value = String(description ?? '');
  const sequenceMarkers = (value.match(/\b(?:then|after that|next|finally)\b|→|->/gi) ?? []).length;
  const processVerbs = (value.match(/\b(?:write|implement|test|review|dispatch|merge|refactor|verify|plan)\w*\b/gi) ?? []).length;
  return sequenceMarkers > 0 && processVerbs >= 2;
}

export function auditSkillConformance(input = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const skillText = String(input.skillText ?? '');
  const files = new Set(unique(input.filePaths ?? []));
  const frontmatter = parseFrontmatter(skillText);

  if (!frontmatter) findings.push(processFinding('SKILL_FRONTMATTER_MISSING', 'blocker', 'SKILL.md requires YAML frontmatter.'));
  else {
    evidenceCount += 1;
    if (!frontmatter.name || !/^[a-z0-9-]+$/.test(frontmatter.name)) findings.push(processFinding('SKILL_NAME_INVALID', 'blocker', 'Skill name must contain lowercase letters, numbers, and hyphens only.'));
    if (!frontmatter.description?.startsWith('Use when')) findings.push(processFinding('SKILL_DESCRIPTION_TRIGGER_INVALID', 'blocker', 'Skill description must begin with “Use when”.'));
    if ((frontmatter.description?.length ?? 0) > 500) findings.push(processFinding('SKILL_DESCRIPTION_TOO_LONG', 'blocker', 'Skill description exceeds 500 characters.'));
    if (frontmatter.block.length > 1024) findings.push(processFinding('SKILL_FRONTMATTER_TOO_LONG', 'blocker', 'Skill frontmatter exceeds 1024 characters.'));
    if (workflowLikeDescription(frontmatter.description)) findings.push(processFinding('DESCRIPTION_SUMMARIZES_WORKFLOW', 'blocker', 'Discovery description summarizes execution steps instead of only describing trigger conditions.'));
  }

  if (containsPlaceholder(skillText)) findings.push(processFinding('SKILL_PLACEHOLDER_LANGUAGE', 'blocker', 'SKILL.md contains unresolved placeholder language.'));
  if (!/process:audit/.test(skillText)) findings.push(processFinding('PROCESS_ENTRY_POINT_UNDOCUMENTED', 'high', 'SKILL.md does not document the governed process audit entry point.'));

  const surfaced = (reference) => (skillText.includes(`\`${reference}\``) || skillText.includes(reference)) && files.has(reference);

  const requiredReferences = unique(policy.requiredReferences ?? REQUIRED_PROCESS_REFERENCES);
  const missingReferences = requiredReferences.filter((reference) => !surfaced(reference));
  if (missingReferences.length) findings.push(processFinding('REQUIRED_PROCESS_REFERENCE_MISSING', 'blocker', 'Required process references are missing from the skill surface or filesystem.', { detail: missingReferences }));
  else evidenceCount += requiredReferences.length;

  const requiredAestheticReferences = unique(policy.requiredAestheticReferences ?? REQUIRED_AESTHETIC_REFERENCES);
  const missingAestheticReferences = requiredAestheticReferences.filter((reference) => !surfaced(reference));
  if (missingAestheticReferences.length) findings.push(processFinding('REQUIRED_AESTHETIC_REFERENCE_MISSING', 'blocker', 'Required aesthetic direction references are missing from the skill surface or filesystem.', { detail: missingAestheticReferences }));
  else evidenceCount += requiredAestheticReferences.length;

  const pressureText = String(input.pressureScenariosText ?? '');
  const pressureCoverage = Object.entries(PRESSURE_CATEGORIES).filter(([, pattern]) => pattern.test(pressureText)).map(([name]) => name);
  const missingPressure = Object.keys(PRESSURE_CATEGORIES).filter((name) => !pressureCoverage.includes(name));
  if (missingPressure.length) findings.push(processFinding('PRESSURE_SCENARIO_COVERAGE_INCOMPLETE', 'blocker', 'Pressure scenarios do not cover every required discipline-failure category.', { detail: missingPressure }));
  else evidenceCount += pressureCoverage.length;

  const requiredSkills = unique(policy.requiredSkills ?? INSTALLED_SUPERPOWERS_SKILLS);
  const matrixText = String(input.adaptationMatrixText ?? '');
  const coveredSkills = requiredSkills.filter((name) => matrixText.includes(name));
  const missingSkills = requiredSkills.filter((name) => !coveredSkills.includes(name));
  if (missingSkills.length) findings.push(processFinding('SUPERPOWERS_ADAPTATION_INCOMPLETE', 'blocker', 'Adaptation matrix does not cover every installed Superpowers skill.', { detail: missingSkills }));
  else evidenceCount += coveredSkills.length;

  const tdd = String(input.tddEvidenceText ?? '');
  const redPresent = /\bRED\b/i.test(tdd) && /\b(?:FAIL|FAILED|FAILING)\b/i.test(tdd);
  const greenPresent = /\bGREEN\b/i.test(tdd) && /\b(?:PASS|PASSED|PASSING)\b/i.test(tdd);
  if (!redPresent) findings.push(processFinding('TDD_RED_EVIDENCE_MISSING', 'blocker', 'Skill deployment evidence does not show an observed failing baseline or RED result.'));
  if (!greenPresent) findings.push(processFinding('TDD_GREEN_EVIDENCE_MISSING', 'blocker', 'Skill deployment evidence does not show a passing GREEN result.'));
  if (redPresent && greenPresent) evidenceCount += 2;

  const packageJson = input.packageJson ?? {};
  if (packageJson.name !== 'fullstack-vision-engineering-pro' || packageJson.version !== '5.0.0') findings.push(processFinding('PACKAGE_IDENTITY_INVALID', 'blocker', 'Package name and version must identify Full-Stack Vision Engineering Pro v5.0.0.'));
  const requiredScripts = unique(policy.requiredScripts ?? ['process:audit', 'process:tdd', 'process:review', 'audit:aesthetics', 'validate']);
  const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);
  if (missingScripts.length) findings.push(processFinding('PROCESS_CLI_SURFACE_INCOMPLETE', 'blocker', 'Required governed process CLI scripts are missing.', { detail: missingScripts }));
  else evidenceCount += requiredScripts.length;

  const report = finalizeProcessAudit(findings, { evidenceCount, evidenceConfidence: findings.some((item) => item.severity === 'blocker') ? 0 : 100 });
  return {
    ...report,
    coverage: {
      references: percentage(requiredReferences.length - missingReferences.length, requiredReferences.length),
      aestheticReferences: percentage(requiredAestheticReferences.length - missingAestheticReferences.length, requiredAestheticReferences.length),
      pressureCategories: percentage(pressureCoverage.length, Object.keys(PRESSURE_CATEGORIES).length),
      skills: percentage(coveredSkills.length, requiredSkills.length),
      processScripts: percentage(requiredScripts.length - missingScripts.length, requiredScripts.length)
    },
    frontmatter: frontmatter ? { name: frontmatter.name, descriptionLength: frontmatter.description?.length ?? 0, blockLength: frontmatter.block.length } : null,
    missing: { references: missingReferences, aestheticReferences: missingAestheticReferences, pressureCategories: missingPressure, skills: missingSkills, scripts: missingScripts }
  };
}
