#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { loadConfig } from '../lib/config.mjs';
import { loadFullstackConfig } from '../lib/fullstack-config.mjs';
import { runConfiguredFullstackAudit } from '../lib/fullstack-runner.mjs';
import { loadProcessConfig } from '../lib/process-config.mjs';
import { runConfiguredProcessAudit } from '../lib/process-orchestrator.mjs';
import { auditSkillConformance } from '../lib/skill-conformance-engine.mjs';

const HELP = `Usage:
  node scripts/validate-suite.mjs [--output <path>]
  npm run validate -- [--output <path>]

Runs the full skill validation suite: required files, JSON/syntax, dangerous
patterns, unit tests, CLI --help smoke tests, bundled example audits, and
skill conformance.

Options:
  --output <path>   Write VALIDATION_REPORT.json to this path instead of the
                    package root. Use when the skill directory is read-only
                    (for example a locked Codex/ChatGPT skill cache).
  -h, --help        Show this help and exit

Examples:
  npm run validate
  npm run validate -- --output /tmp/fvep-validation.json
  npm run validate -- --output ./artifacts/VALIDATION_REPORT.json
`;

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  printHelp(HELP);
  process.exit(0);
}

const cliArgs = parseLooseArgs(argv);
if (cliArgs.help || cliArgs.h) {
  printHelp(HELP);
  process.exit(0);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = path.resolve(
  cliArgs.output ? String(cliArgs.output) : path.join(root, 'VALIDATION_REPORT.json')
);
const trace = (stage) => { if (process.env.FVEP_VALIDATE_TRACE === '1') process.stderr.write(`[validate] ${new Date().toISOString()} ${stage}\n`); };
trace('start');
const ignoredDirectories = new Set(['node_modules', 'artifacts', '.git', '.superpowers']);
const generatedFiles = new Set([
  'VALIDATION_REPORT.json', 'MANIFEST.json', 'CHECKSUMS.sha256',
  'FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md'
]);

const required = [
  'SKILL.md', 'README.md', 'README_TH.md',
  'ARCHITECTURE.md', 'SECURITY.md', 'SUPERPOWERS_ADAPTATION_MATRIX.md',
  'MIGRATION_V3_TO_V4.md', 'MIGRATION_V4_TO_V5.md',
  'CHANGELOG.md', 'UPGRADE_REPORT_V4_TH.md', 'UPGRADE_REPORT_V5_TH.md',
  'FULLSTACK_VISION_ENGINEERING_PRO_V5_ALL_IN_ONE.md', 'package.json', 'vision-loop.config.example.json',
  'fullstack.config.example.json', 'setup.sh', 'setup.ps1',   'AESTHETIC_WALKTHROUGH.md',
  'domains/README.md',
  'domains/GAME/README.md',
  'domains/APPLICATION/README.md',
  'domains/DESIGN/README.md',
  'domains/GENERAL/README.md',
  'domains/ROLES/README.md',
  'domains/ROLES/frontend-engineer.md', 'domains/ROLES/backend-engineer.md',
  'domains/ROLES/security-engineer.md', 'domains/ROLES/data-engineer.md',
  'domains/ROLES/platform-sre.md', 'domains/ROLES/qa-engineer.md',
  'domains/ROLES/product-designer.md', 'domains/ROLES/visual-designer.md',
  'domains/ROLES/game-designer.md', 'domains/ROLES/gameplay-engineer.md',
  'domains/ROLES/technical-artist.md',

  // v5.1 scene, asset, and triage evidence layer.
  'lib/scene-completeness-engine.mjs', 'lib/game-asset-engine.mjs', 'lib/visual-diff-triage-engine.mjs',
  'scripts/audit-scene.mjs', 'scripts/audit-game-assets.mjs', 'scripts/vision-triage.mjs',
  'references/scene-completeness.md', 'references/game-asset-direction.md',
  'references/game-vision-loop.md', 'references/world-building-and-level-blockout.md',
  'references/visual-delta-triage.md',
  'schemas/game-asset-spec.schema.json', 'schemas/scene-brief.schema.json',
  'examples/game-assets.example.json', 'examples/scene-brief.example.json',
  'templates/game-asset-spec.md', 'templates/scene-brief.md',
  'references/visual-delta-triage_TH.md', 'references/game-vision-loop_TH.md',
  'prompts/vision-triage-loop.md', 'agents/scene-and-asset-critic.md',
  'PLAYBOOKS.md',

  // Operating modes and the adversarial re-check pass.
  'lib/mode-engine.mjs', 'scripts/mode.mjs',
  'lib/recheck-engine.mjs', 'scripts/recheck.mjs',
  'references/operating-modes.md', 'references/operating-modes_TH.md',
  'references/recheck-protocol.md', 'references/recheck-protocol_TH.md',
  'references/vfx-and-sfx-direction.md', 'references/game-feel-and-juice.md',
  'schemas/recheck-record.schema.json', 'templates/recheck-record.md',
  'examples/recheck.example.json', 'prompts/recheck-pass.md',

  // Retained frontend vision and evidence engines.
  'lib/config.mjs', 'lib/browser-runner.mjs', 'lib/compare-engine.mjs', 'lib/perceptual-diff.mjs',
  'lib/ascii-map-engine.mjs',
  'lib/layout-structure-engine.mjs',
  'lib/region-engine.mjs', 'lib/quality-model.mjs', 'lib/evidence-coverage.mjs', 'lib/gate-engine.mjs',
  'lib/baseline-engine.mjs', 'lib/manual-review-engine.mjs', 'lib/history-engine.mjs', 'lib/performance-engine.mjs',
  'lib/interaction-engine.mjs', 'lib/state-crawler-engine.mjs', 'lib/token-engine.mjs', 'lib/breakpoint-engine.mjs',

  // Retained full-stack domain and release engines.
  'lib/audit-utils.mjs', 'lib/risk-engine.mjs', 'lib/experience-contract-engine.mjs', 'lib/api-contract-engine.mjs',
  'lib/architecture-risk-engine.mjs', 'lib/migration-risk-engine.mjs', 'lib/security-review-engine.mjs',
  'lib/source-risk-scanner.mjs', 'lib/resilience-engine.mjs', 'lib/observability-engine.mjs',
  'lib/debug-triage-engine.mjs', 'lib/dependency-risk-engine.mjs', 'lib/fullstack-config.mjs',
  'lib/fullstack-gate-engine.mjs', 'lib/fullstack-audit-engine.mjs', 'lib/fullstack-report.mjs',
  'lib/fullstack-runner.mjs', 'lib/contract-cli.mjs',

  // v4 governed process kernel.
  'lib/process-audit-utils.mjs', 'lib/skill-router-engine.mjs', 'lib/design-governance-engine.mjs',
  'lib/plan-quality-engine.mjs', 'lib/task-graph-engine.mjs', 'lib/workspace-safety-engine.mjs',
  'lib/process-ledger-engine.mjs', 'lib/tdd-evidence-engine.mjs', 'lib/debug-session-engine.mjs',
  'lib/review-governance-engine.mjs', 'lib/feedback-adjudication-engine.mjs',
  'lib/claim-verification-engine.mjs', 'lib/integration-decision-engine.mjs', 'lib/process-gate-engine.mjs',
  'lib/process-config.mjs', 'lib/process-orchestrator.mjs', 'lib/process-report.mjs',
  'lib/skill-conformance-engine.mjs', 'lib/release-package-engine.mjs', 'lib/document-bundle-engine.mjs',

  // v5 aesthetic direction layer.
  'lib/aesthetic-profile-engine.mjs', 'lib/aesthetic-review-engine.mjs', 'lib/aesthetic-audit-engine.mjs',
  'lib/color-harmony-engine.mjs', 'lib/typography-scale-engine.mjs', 'lib/spacing-rhythm-engine.mjs',
  'lib/craft-precision-engine.mjs', 'lib/motion-quality-engine.mjs', 'lib/style-signature-engine.mjs',
  'scripts/audit-aesthetics.mjs', 'scripts/validate-aesthetic-review.mjs', 'scripts/open-direction-gallery.mjs',
  'scripts/init-direction.mjs', 'scripts/sync-direction-spec.mjs',
  'scripts/iterate-direction.mjs', 'scripts/direction-gate.mjs', 'scripts/direction-distinctness.mjs', 'scripts/detect-direction-runtime.mjs',
  'scripts/install-direction-cursor.mjs',
  'lib/direction-gallery-engine.mjs', 'lib/direction-init-engine.mjs', 'lib/direction-spec-sync-engine.mjs',
  'lib/direction-iterate-engine.mjs', 'lib/direction-gate-engine.mjs', 'lib/direction-runtime-engine.mjs',
  'lib/direction-distinctness-engine.mjs',
  'prompts/visual-direction-prompt-pack.md',
  'prompts/visual-direction-exploration-ide.md',
  'prompts/visual-direction-exploration-cli.md',
  'examples/direction-camera/README.md',
  'examples/direction-camera/visual-direction-spec.md',
  'examples/direction-camera/aesthetic-profile.json',
  'examples/direction-camera/design-contract.json',
  'examples/direction-camera/direction-options/options.json',
  'templates/cursor/README.md',
  'templates/cursor/hooks.json',
  'templates/cursor/rules/visual-direction-redesign.mdc',
  'templates/cursor/hooks/visual-direction-redesign.mjs',
  'schemas/aesthetic-profile.schema.json', 'schemas/aesthetic-review.schema.json',
  'examples/aesthetic-profile.example.json', 'examples/aesthetic-review.example.json',
  'examples/aesthetic-audit.example.json',
  'templates/aesthetic-profile.md', 'templates/aesthetic-review.md', 'templates/visual-direction-spec.md',
  'agents/aesthetic-critic.md', 'prompts/aesthetic-critique.md', 'prompts/aesthetic-direction.md',
  'prompts/motion-quality-review.md', 'prompts/copy-voice-review.md',
  'references/aesthetic-direction-protocol.md', 'references/aesthetic-principles.md',
  'references/aesthetic-direction-protocol_TH.md', 'references/aesthetic-principles_TH.md',
  'references/visual-direction-exploration.md', 'references/visual-direction-exploration_TH.md',
  'prompts/visual-direction-exploration.md',
  'references/aesthetic-scoring-anchors.md', 'references/visual-craft-standards.md',
  'references/color-system-and-perception.md', 'references/typographic-system-quality.md',
  'references/spatial-composition-and-rhythm.md', 'references/motion-quality-standards.md',
  'references/brand-personality-and-tone.md', 'references/visual-style-lexicon.md',
  'references/copy-voice-and-microcopy.md',
  'tests/aesthetic-pressure-scenarios-v5.md', 'tests/TDD_EVIDENCE_V5.md',

  // Frontend/full-stack and process CLI surface.
  'scripts/vision-loop.mjs', 'scripts/quality-gate.mjs', 'scripts/ascii-map.mjs', 'scripts/layout-structure.mjs', 'scripts/promote-baseline.mjs',
  'scripts/verify-baseline.mjs', 'scripts/create-review-template.mjs', 'scripts/validate-manual-review.mjs',
  'scripts/audit-fullstack.mjs', 'scripts/audit-experience.mjs', 'scripts/audit-api-contract.mjs',
  'scripts/audit-architecture.mjs', 'scripts/audit-migrations.mjs', 'scripts/audit-security.mjs',
  'scripts/audit-resilience.mjs', 'scripts/audit-observability.mjs', 'scripts/audit-dependencies.mjs',
  'scripts/audit-risks.mjs', 'scripts/triage-incident.mjs', 'scripts/fullstack-quality-gate.mjs',
  'scripts/audit-process.mjs', 'scripts/route-skills.mjs', 'scripts/inspect-workspace.mjs',
  'scripts/validate-plan.mjs', 'scripts/validate-tdd.mjs', 'scripts/validate-review-chain.mjs',
  'scripts/prepare-integration.mjs', 'scripts/validate-skill-conformance.mjs', 'scripts/build-release.mjs', 'scripts/generate-all-in-one.mjs', 'scripts/validate-suite.mjs',

  // v4 process references and governance.
  'references/process-kernel-overview.md', 'references/skill-routing-and-precedence.md',
  'references/design-before-implementation.md', 'references/executable-planning.md',
  'references/tdd-evidence-protocol.md', 'references/scientific-debugging-protocol.md',
  'references/parallel-task-isolation.md', 'references/subagent-task-lifecycle.md',
  'references/review-and-feedback-governance.md', 'references/workspace-and-branch-safety.md',
  'references/verification-and-claim-governance.md', 'references/integration-and-cleanup.md',
  'references/skill-authoring-conformance.md', 'references/context-recovery-ledger.md',

  // Full-stack and frontend domain references.
  'references/fullstack-operating-model.md', 'references/experience-design-to-system-contract.md',
  'references/backend-architecture-and-domain-boundaries.md', 'references/backend-design-quality-gates.md',
  'references/api-contracts-and-compatibility.md', 'references/data-integrity-transactions-and-migrations.md',
  'references/data-privacy-and-classification.md', 'references/application-security-and-threat-modeling.md',
  'references/resilience-and-distributed-failure-modes.md', 'references/observability-slos-and-incident-readiness.md',
  'references/fullstack-systematic-debugging.md', 'references/risk-discovery-and-adversarial-review.md',
  'references/dependency-and-supply-chain-risk.md', 'references/fullstack-release-and-rollback.md',
  'references/evidence-confidence-and-provenance-v3.md', 'references/fullstack-agent-orchestration.md',
  'references/vision-loop-protocol.md', 'references/frontend-engineering-gates.md',

  // Specialist role contracts.
  'agents/process-controller.md', 'agents/task-implementer.md', 'agents/task-reviewer.md',
  'agents/re-reviewer.md', 'agents/final-reviewer.md',
  'agents/product-experience-architect.md', 'agents/fullstack-architect.md', 'agents/api-data-contract-reviewer.md',
  'agents/application-security-reviewer.md', 'agents/reliability-observability-reviewer.md',
  'agents/incident-root-cause-investigator.md', 'agents/adversarial-release-verifier.md',

  // v4 process schemas.
  'schemas/process-config.schema.json', 'schemas/process-request.schema.json', 'schemas/process-design.schema.json',
  'schemas/implementation-plan.schema.json', 'schemas/workspace-snapshot.schema.json',
  'schemas/process-ledger.schema.json', 'schemas/tdd-evidence.schema.json', 'schemas/debug-session.schema.json',
  'schemas/review-chain.schema.json', 'schemas/feedback-disposition.schema.json',
  'schemas/completion-claims.schema.json', 'schemas/integration-decision.schema.json',

  // Existing domain schemas.
  'schemas/fullstack-config.schema.json', 'schemas/experience-contract.schema.json',
  'schemas/architecture-contract.schema.json', 'schemas/migration-plan.schema.json', 'schemas/security-contract.schema.json',
  'schemas/resilience-contract.schema.json', 'schemas/observability-contract.schema.json',
  'schemas/risk-register.schema.json', 'schemas/incident-evidence.schema.json',

  // Process and full-stack executable examples.
  'examples/process/process.config.json', 'examples/process/request.feature.json',
  'examples/process/design.approved.json', 'examples/process/implementation-plan.json',
  'examples/process/workspace.linked-worktree.json', 'examples/process/process-ledger.json',
  'examples/process/tdd-cycles.json', 'examples/process/debug-session.json',
  'examples/process/review-chain.json', 'examples/process/claims.json',
  'examples/process/evidence.json', 'examples/process/integration.decision-required.json',
  'examples/fullstack/fullstack.config.json', 'examples/fullstack/frontend-summary.json',
  'examples/fullstack/experience-contract.json', 'examples/fullstack/openapi.current.json',
  'examples/fullstack/openapi.baseline.json', 'examples/fullstack/architecture-contract.json',
  'examples/fullstack/migration-plan.json', 'examples/fullstack/security-contract.json',
  'examples/fullstack/resilience-contract.json', 'examples/fullstack/observability-contract.json',
  'examples/fullstack/risk-register.json', 'examples/fullstack/incident-evidence.json',
  'examples/fullstack/dependency-manifest.json', 'examples/fullstack/package-lock.json',

  // Skill deployment evidence and pressure tests.
  'tests/pressure-scenarios.md', 'tests/fullstack-pressure-scenarios.md',
  'tests/process-pressure-scenarios-v4.md', 'tests/TDD_EVIDENCE_V4.md', 'tests/TDD_EVIDENCE_V5.md',
  '.github/workflows/frontend-vision-loop.yml', '.github/workflows/fullstack-evidence-gate.yml',
  'ci/github-actions.md', 'ci/github-actions-fullstack.md'
];

async function walk(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(absolute));
    else result.push(absolute);
  }
  return result;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    maxBuffer: 40_000_000,
    timeout: options.timeout ?? 120_000,
    env: { ...process.env, ...(options.env ?? {}) }
  });
  return {
    command: [command, ...args].join(' '), status: result.status, signal: result.signal,
    stdout: result.stdout ?? '', stderr: result.stderr ?? '', error: result.error?.message ?? null
  };
}

function relative(file) { return path.relative(root, file).split(path.sep).join('/'); }
function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function exactVersion(value) { return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(value ?? '')); }

const errors = [];
const warnings = [];
const checks = {};

for (const file of required) {
  try { await fs.access(path.join(root, file)); }
  catch { errors.push(`Missing required file: ${file}`); }
}
trace('required-files');
checks.requiredFiles = {
  expected: required.length,
  missing: errors.filter((item) => item.startsWith('Missing required file')).length
};

const skill = await fs.readFile(path.join(root, 'SKILL.md'), 'utf8');
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatter) errors.push('SKILL.md is missing YAML frontmatter.');
else {
  const block = frontmatter[1];
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (name !== 'fullstack-vision-engineering-pro') errors.push(`Unexpected skill name: ${name ?? '<missing>'}.`);
  if (!name || !/^[a-z0-9-]+$/.test(name)) errors.push('Skill name must contain lowercase letters, numbers, and hyphens only.');
  if (!description?.startsWith('Use when')) errors.push('Skill description must begin with "Use when".');
  if ((description?.length ?? 0) > 500) errors.push('Skill description exceeds 500 characters.');
  if (block.length > 1024) errors.push('Skill frontmatter exceeds 1024 characters.');
  checks.skillFrontmatter = { name, descriptionLength: description?.length ?? 0, blockLength: block.length };
}

const skillReferences = [...skill.matchAll(/`((?:references|templates|prompts|agents|schemas)\/[^`]+)`/g)].map((match) => match[1]);
const missingSkillReferences = [];
for (const file of new Set(skillReferences)) {
  try { await fs.access(path.join(root, file)); }
  catch { missingSkillReferences.push(file); errors.push(`SKILL.md references a missing file: ${file}`); }
}
checks.skillReferences = { referenced: new Set(skillReferences).size, missing: missingSkillReferences };

const files = await walk(root);
trace(`walked-${files.length}-files`);
const relativeFiles = files.map(relative);
const jsonFiles = files.filter((file) => file.endsWith('.json') && !generatedFiles.has(relative(file)));
const jsonResults = [];
for (const file of jsonFiles) {
  try { JSON.parse(await fs.readFile(file, 'utf8')); jsonResults.push({ file: relative(file), status: 'PASS' }); }
  catch (error) {
    jsonResults.push({ file: relative(file), status: 'FAIL', message: error.message });
    errors.push(`Invalid JSON in ${relative(file)}: ${error.message}`);
  }
}
trace('json-parsed');
checks.json = { files: jsonResults.length, failed: jsonResults.filter((item) => item.status === 'FAIL').length };

for (const configFile of ['vision-loop.config.example.json', 'examples/advanced-state.config.json']) {
  try {
    const config = await loadConfig(path.join(root, configFile));
    if (config.version !== 2) errors.push(`${configFile} did not normalize to frontend config version 2.`);
  } catch (error) { errors.push(`${configFile} failed frontend runtime validation: ${error.message}`); }
}
for (const configFile of ['fullstack.config.example.json', 'examples/fullstack/fullstack.config.json']) {
  try {
    const config = await loadFullstackConfig(path.join(root, configFile));
    if (config.version !== 4) errors.push(`${configFile} did not normalize to full-stack config version 4.`);
  } catch (error) { errors.push(`${configFile} failed full-stack runtime validation: ${error.message}`); }
}
try {
  const config = await loadProcessConfig(path.join(root, 'examples/process/process.config.json'));
  if (config.version !== 4) errors.push('examples/process/process.config.json did not normalize to process config version 4.');
} catch (error) { errors.push(`examples/process/process.config.json failed process runtime validation: ${error.message}`); }
checks.exampleConfigs = errors.some((item) => item.includes('runtime validation') || item.includes('did not normalize')) ? 'FAIL' : 'PASS';

const placeholder = /\b(TODO|TBD|FIXME|implement later|fill in details)\b/i;
const wordCounts = {};
const hashes = {};
for (const file of files) {
  const rel = relative(file);
  if (generatedFiles.has(rel) || rel === 'scripts/validate-suite.mjs') continue;
  const buffer = await fs.readFile(file);
  hashes[rel] = sha256(buffer);
  if (/\.(md|json|sh|ps1|yml|yaml)$/.test(file)) {
    const text = buffer.toString('utf8');
    if (!rel.startsWith('tests/unit/') && placeholder.test(text)) errors.push(`Unresolved placeholder language found in ${rel}.`);
    if (file.endsWith('.md')) wordCounts[rel] = (text.match(/\b[\w'-]+\b/g) ?? []).length;
  }
}

trace('content-scanned');
const syntaxFiles = files.filter((file) => file.endsWith('.mjs'));
const syntaxFailures = [];
for (const file of syntaxFiles) {
  const result = run(process.execPath, ['--check', file]);
  if (result.status !== 0) {
    syntaxFailures.push(relative(file));
    errors.push(`Syntax check failed: ${relative(file)}\n${result.stderr}`);
  }
}
trace('syntax-complete');
checks.syntax = { files: syntaxFiles.length, failed: syntaxFailures };

const dangerousSourcePatterns = [
  { name: 'direct-eval', pattern: /(^|[^.\w])eval\s*\(/m },
  { name: 'dynamic-function-constructor', pattern: /new\s+Function\s*\(/m },
  { name: 'child-process-shell-true', pattern: /shell\s*:\s*true/m }
];
const dangerousMatches = [];
for (const file of syntaxFiles.filter((item) => /\/(?:lib|scripts)\//.test(item))) {
  const text = await fs.readFile(file, 'utf8');
  for (const check of dangerousSourcePatterns) {
    if (check.pattern.test(text)) dangerousMatches.push({ file: relative(file), pattern: check.name });
  }
}
if (dangerousMatches.length) errors.push(`Dangerous dynamic-execution patterns found: ${JSON.stringify(dangerousMatches)}`);
trace('dynamic-execution-scan');
checks.dynamicExecutionScan = { files: syntaxFiles.filter((item) => /\/(?:lib|scripts)\//.test(item)).length, findings: dangerousMatches };

const unitFiles = files.filter((file) => /tests\/unit\/[^/]+\.test\.mjs$/.test(relative(file))).sort();
const unit = run(process.execPath, ['--test', ...unitFiles.map(relative)], { timeout: 300_000 });
if (unit.status !== 0) errors.push(`Unit tests failed.\n${unit.stdout}\n${unit.stderr}`);
// The TAP reporter prefixes totals with "#" and the spec reporter with an info glyph.
const summaryCount = (label) => Number(unit.stdout.match(new RegExp(`^\\s*[#\u2139]\\s*${label}\\s+(\\d+)\\s*$`, 'm'))?.[1] ?? 0);
const testCount = summaryCount('tests');
const passCount = summaryCount('pass');
const failCount = summaryCount('fail');
if (unitFiles.length && testCount === 0) errors.push('Unit test totals could not be parsed from the test runner output, so the suite size is unverified.');
trace('unit-tests-complete');
checks.unitTests = { files: unitFiles.length, tests: testCount, passed: passCount, failed: failCount, exitStatus: unit.status };

const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
if (packageJson.name !== 'fullstack-vision-engineering-pro') errors.push(`Unexpected package name: ${packageJson.name}.`);
if (packageJson.version !== '5.0.0') errors.push(`package.json version must be 5.0.0, found ${packageJson.version}.`);
if (packageJson.private !== true) errors.push('The skill/tool suite must remain private unless a reviewed publication process is added.');
for (const dependency of ['playwright', 'axe-core', 'pixelmatch', 'pngjs']) {
  const value = packageJson.dependencies?.[dependency];
  if (!value) errors.push(`Missing dependency declaration: ${dependency}`);
  else if (!exactVersion(value)) errors.push(`Dependency ${dependency} must use an exact version, found ${value}.`);
}
for (const [name, target] of Object.entries(packageJson.bin ?? {})) {
  try { await fs.access(path.join(root, target)); }
  catch { errors.push(`Package binary ${name} points to missing file: ${target}`); }
}
const requiredScripts = [
  'test', 'validate', 'vision-loop', 'quality-gate', 'baseline:promote', 'baseline:verify',
  'review:create', 'review:validate', 'audit:fullstack', 'audit:experience', 'audit:api',
  'audit:architecture', 'audit:migrations', 'audit:security', 'audit:resilience',
  'audit:observability', 'audit:dependencies', 'audit:risks', 'debug:triage', 'fullstack:quality-gate',
  'process:audit', 'process:route', 'process:workspace', 'process:plan', 'process:tdd',
  'process:review', 'process:integration', 'skill:conformance', 'release:build', 'docs:all-in-one',
  'audit:aesthetics', 'aesthetics:review',
  'vision:triage', 'audit:scene', 'audit:game-assets', 'mode', 'recheck'
];
for (const script of requiredScripts) if (!packageJson.scripts?.[script]) errors.push(`Missing package script: ${script}`);
checks.package = {
  name: packageJson.name, version: packageJson.version,
  scripts: Object.keys(packageJson.scripts ?? {}).length,
  binaries: Object.keys(packageJson.bin ?? {}).length,
  exactDependencies: Object.values(packageJson.dependencies ?? {}).every(exactVersion),
  packageLockPresent: await fs.access(path.join(root, 'package-lock.json')).then(() => true).catch(() => false)
};
if (!checks.package.packageLockPresent) warnings.push('The distributed suite does not include its own package-lock.json. Generate and review one after dependency installation before using npm ci or publishing the package. The bundled full-stack example includes a verified lockfile fixture.');

trace('package-validated');
const cliHelpResults = [];
for (const target of [...new Set(Object.values(packageJson.bin ?? {}))]) {
  trace(`cli-help-start:${target}`);
  const result = run(process.execPath, [target, '--help']);
  trace(`cli-help-end:${target}:${result.status}`);
  const passed = result.status === 0 && result.stdout.trim().length > 0;
  cliHelpResults.push({ target, passed, exitStatus: result.status });
  if (!passed) errors.push(`CLI help smoke test failed for ${target}.\n${result.stdout}\n${result.stderr}`);
}
trace('cli-help-complete');
checks.cliHelp = {
  files: cliHelpResults.length,
  passed: cliHelpResults.filter((item) => item.passed).length,
  failed: cliHelpResults.filter((item) => !item.passed).map((item) => item.target)
};

trace('setup-shell-start');
const shellSyntax = run('bash', ['-n', 'setup.sh']);
trace(`setup-shell-end:${shellSyntax.status}`);
checks.setupShell = { checked: shellSyntax.error === null, passed: shellSyntax.status === 0 };
if (shellSyntax.error === null && shellSyntax.status !== 0) errors.push(`setup.sh syntax check failed.\n${shellSyntax.stderr}`);

const yamlFiles = files.filter((file) => /\.ya?ml$/.test(file));
trace(`yaml-start:${yamlFiles.length}`);
if (yamlFiles.length) {
  const yamlProgram = [
    'import sys',
    'try:',
    ' import yaml',
    'except Exception as exc:',
    ' print(exc, file=sys.stderr); sys.exit(3)',
    'for filename in sys.argv[1:]:',
    ' with open(filename, encoding="utf-8") as handle: yaml.safe_load(handle.read())'
  ].join('\n');
  const yamlCheck = run('python3', ['-c', yamlProgram, ...yamlFiles]);
  checks.yaml = { files: yamlFiles.length, checked: yamlCheck.error === null && yamlCheck.status !== 3, passed: yamlCheck.status === 0 };
  trace(`yaml-end:${yamlCheck.status}`);
  if (yamlCheck.status === 3 || yamlCheck.error) warnings.push('PyYAML was unavailable; workflow files received only required-file and text checks.');
  else if (yamlCheck.status !== 0) errors.push(`Workflow YAML parsing failed.\n${yamlCheck.stderr}`);
}

trace('setup-yaml-complete');
let processExample = null;
let fullstackExample = null;
let processTemp = null;
let fullstackTemp = null;
try {
  const processConfig = await loadProcessConfig(path.join(root, 'examples/process/process.config.json'));
  processTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'fullstack-v4-process-validation-'));
  processConfig.outputDir = processTemp;
  const processResult = await runConfiguredProcessAudit(processConfig);
  processExample = {
    passed: processResult.report.processGate.releaseEligible,
    score: processResult.report.processGate.score,
    confidence: processResult.report.processGate.evidenceConfidence,
    status: processResult.report.status,
    nextActions: processResult.report.nextActions
  };
  if (!processExample.passed) errors.push(`Bundled governed-process example did not pass: ${JSON.stringify(processExample)}`);

  const fullstackConfig = await loadFullstackConfig(path.join(root, 'examples/fullstack/fullstack.config.json'));
  fullstackTemp = await fs.mkdtemp(path.join(os.tmpdir(), 'fullstack-v4-domain-validation-'));
  fullstackConfig.outputDir = fullstackTemp;
  fullstackConfig.contracts.processReport = processResult.paths.json;
  const fullstackResult = await runConfiguredFullstackAudit(fullstackConfig);
  const dependency = fullstackResult.report.sections.dependencies;
  fullstackExample = {
    passed: fullstackResult.report.quality.passed,
    score: fullstackResult.report.quality.score,
    confidence: fullstackResult.report.quality.confidence,
    releaseDecision: fullstackResult.report.quality.releaseDecision,
    processGatePassed: fullstackResult.report.sections.process?.releaseEligible === true && fullstackResult.report.sections.process?.ok === true,
    dependencyLockfileVerified: dependency?.lockfile?.verified === true,
    findings: fullstackResult.report.findings.length
  };
  if (!fullstackExample.passed) errors.push(`Bundled full-stack example did not pass its evidence gate: ${JSON.stringify(fullstackExample)}`);
  if (!fullstackExample.processGatePassed) errors.push('Bundled full-stack example did not consume a passing governed-process report.');
  if (!fullstackExample.dependencyLockfileVerified) errors.push('Bundled full-stack example did not verify its dependency lockfile semantically.');
} catch (error) {
  errors.push(`Bundled v4 example audits failed to execute: ${error.stack ?? error.message}`);
} finally {
  if (processTemp) await fs.rm(processTemp, { recursive: true, force: true });
  if (fullstackTemp) await fs.rm(fullstackTemp, { recursive: true, force: true });
}
trace('examples-complete');
checks.processExampleAudit = processExample;
checks.fullstackExampleAudit = fullstackExample;

let conformance = null;
try {
  conformance = auditSkillConformance({
    skillText: skill,
    pressureScenariosText: await fs.readFile(path.join(root, 'tests/process-pressure-scenarios-v4.md'), 'utf8'),
    tddEvidenceText: await fs.readFile(path.join(root, 'tests/TDD_EVIDENCE_V4.md'), 'utf8'),
    adaptationMatrixText: await fs.readFile(path.join(root, 'SUPERPOWERS_ADAPTATION_MATRIX.md'), 'utf8'),
    packageJson,
    filePaths: relativeFiles
  });
  if (!conformance.ok) {
    for (const finding of conformance.findings ?? []) errors.push(`Skill conformance ${finding.code}: ${finding.message}`);
  }
} catch (error) { errors.push(`Skill conformance audit failed to execute: ${error.stack ?? error.message}`); }
trace('conformance-complete');
checks.skillConformance = conformance;

const dependencyProbe = run(process.execPath, ['-e', "Promise.all(['playwright','axe-core','pixelmatch','pngjs'].map(x=>import(x))).then(()=>console.log('available')).catch(e=>{console.error(e.message);process.exit(2)})"]);
checks.browserDependencies = { installedInValidationEnvironment: dependencyProbe.status === 0 };
if (dependencyProbe.status !== 0) warnings.push('Browser dependencies are declared but not installed in this validation environment, so live browser execution was not performed.');
warnings.push('Live screenshot, accessibility, performance, network, database, and interaction evidence requires a runnable target system and environment-specific configuration.');
warnings.push('Behavioral pressure scenarios require fresh independent agent contexts; static validation and deterministic engine tests do not certify those multi-agent runs.');

const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
const readmeTh = await fs.readFile(path.join(root, 'README_TH.md'), 'utf8');
for (const [name, text] of [['README.md', readme], ['README_TH.md', readmeTh]]) {
  if (!text.includes('v5.0.0')) errors.push(`${name} does not identify version v5.0.0.`);
  if (!text.includes('fullstack.config')) errors.push(`${name} does not document the full-stack configuration.`);
  if (!text.includes('process.config')) errors.push(`${name} does not document the governed process configuration.`);
  if (!text.includes('vision-loop')) errors.push(`${name} does not document the retained frontend vision loop.`);
  if (!text.includes('audit:aesthetics')) errors.push(`${name} does not document the aesthetic direction audit.`);
}
checks.documentation = { englishReadmeBytes: Buffer.byteLength(readme), thaiReadmeBytes: Buffer.byteLength(readmeTh) };

trace('documentation-complete');
const report = {
  schemaVersion: 4,
  generatedAt: new Date().toISOString(),
  package: { name: packageJson.name, version: packageJson.version },
  status: errors.length ? 'FAIL' : 'PASS',
  errors,
  warnings,
  checks: { ...checks, filesScanned: files.length },
  wordCounts,
  sha256: hashes
};
trace('writing-report');
try {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
} catch (error) {
  const code = error?.code;
  const hint = code === 'EPERM' || code === 'EACCES'
    ? `\nThe report path is not writable. Re-run with a writable destination:\n  npm run validate -- --output /tmp/VALIDATION_REPORT.json\n`
    : '';
  process.stderr.write(`Failed to write validation report to ${reportPath}: ${error.message}${hint}`);
  process.exitCode = 1;
  process.exit(1);
}
process.stdout.write(`${report.status}: ${errors.length} error(s), ${warnings.length} warning(s), ${passCount}/${testCount} unit tests passed. Report: ${reportPath}\n`);
if (errors.length) process.exitCode = 1;
