import fs from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_BUNDLE_FILES = Object.freeze([
  'SKILL.md',
  'README.md',
  'README_TH.md',
  'PLAYBOOKS.md',
  'ARCHITECTURE.md',
  'SECURITY.md',
  'SUPERPOWERS_ADAPTATION_MATRIX.md',
  'MIGRATION_V3_TO_V4.md',
  'MIGRATION_V4_TO_V5.md',
  'UPGRADE_REPORT_V4_TH.md',
  'UPGRADE_REPORT_V5_TH.md',
  'references/process-kernel-overview.md',
  'references/skill-routing-and-precedence.md',
  'references/design-before-implementation.md',
  'references/executable-planning.md',
  'references/tdd-evidence-protocol.md',
  'references/scientific-debugging-protocol.md',
  'references/parallel-task-isolation.md',
  'references/subagent-task-lifecycle.md',
  'references/review-and-feedback-governance.md',
  'references/workspace-and-branch-safety.md',
  'references/verification-and-claim-governance.md',
  'references/integration-and-cleanup.md',
  'references/skill-authoring-conformance.md',
  'references/context-recovery-ledger.md',
  'references/fullstack-operating-model.md',
  'references/experience-design-to-system-contract.md',
  'references/backend-architecture-and-domain-boundaries.md',
  'references/backend-design-quality-gates.md',
  'references/api-contracts-and-compatibility.md',
  'references/data-integrity-transactions-and-migrations.md',
  'references/data-privacy-and-classification.md',
  'references/application-security-and-threat-modeling.md',
  'references/resilience-and-distributed-failure-modes.md',
  'references/observability-slos-and-incident-readiness.md',
  'references/fullstack-systematic-debugging.md',
  'references/risk-discovery-and-adversarial-review.md',
  'references/dependency-and-supply-chain-risk.md',
  'references/fullstack-release-and-rollback.md',
  'references/vision-loop-protocol.md',
  'references/reference-reconstruction.md',
  'references/responsive-and-state-matrix.md',
  'references/frontend-engineering-gates.md',
  'references/accessibility-and-interaction.md',
  'references/performance-and-runtime.md',
  'references/anti-generic-design.md',
  'references/visual-delta-triage.md',
  'references/scene-completeness.md',
  'references/game-vision-loop.md',
  'references/game-asset-direction.md',
  'references/world-building-and-level-blockout.md',
  'references/visual-delta-triage_TH.md',
  'references/game-vision-loop_TH.md',
  'prompts/vision-triage-loop.md',
  'agents/scene-and-asset-critic.md',
  'domains/README.md',
  'domains/ROLES/README.md',
  'lib/scene-completeness-engine.mjs',
  'scripts/audit-scene.mjs',
  'lib/game-asset-engine.mjs',
  'scripts/audit-game-assets.mjs',
  'lib/visual-diff-triage-engine.mjs',
  'scripts/vision-triage.mjs',
  'lib/direction-gallery-engine.mjs',
  'scripts/open-direction-gallery.mjs',
  'lib/direction-init-engine.mjs',
  'scripts/init-direction.mjs',
  'lib/direction-spec-sync-engine.mjs',
  'scripts/sync-direction-spec.mjs',
  'lib/direction-iterate-engine.mjs',
  'scripts/iterate-direction.mjs',
  'lib/direction-gate-engine.mjs',
  'scripts/direction-gate.mjs',
  'lib/direction-runtime-engine.mjs',
  'scripts/detect-direction-runtime.mjs',
  'scripts/install-direction-cursor.mjs',
  'prompts/visual-direction-prompt-pack.md',
  'prompts/visual-direction-exploration-ide.md',
  'prompts/visual-direction-exploration-cli.md',
  'examples/direction-camera/README.md',
  'templates/cursor/README.md',
  'references/visual-direction-exploration.md',
  'references/visual-direction-exploration_TH.md',
  'references/aesthetic-direction-protocol.md',
  'references/aesthetic-principles.md',
  'references/aesthetic-direction-protocol_TH.md',
  'references/aesthetic-principles_TH.md',
  'AESTHETIC_WALKTHROUGH.md',
  'references/aesthetic-scoring-anchors.md',
  'references/visual-craft-standards.md',
  'references/color-system-and-perception.md',
  'references/typographic-system-quality.md',
  'references/spatial-composition-and-rhythm.md',
  'references/motion-quality-standards.md',
  'references/brand-personality-and-tone.md',
  'references/visual-style-lexicon.md',
  'references/copy-voice-and-microcopy.md',
  'templates/task-brief.md',
  'templates/scene-brief.md',
  'templates/game-asset-spec.md',
  'templates/aesthetic-profile.md',
  'templates/aesthetic-review.md',
  'templates/visual-direction-spec.md',
  'templates/review-package.md',
  'templates/feedback-ruling.md',
  'templates/tdd-evidence.md',
  'templates/debug-session.md',
  'templates/integration-decision.md',
  'agents/process-controller.md',
  'agents/task-implementer.md',
  'agents/task-reviewer.md',
  'agents/re-reviewer.md',
  'agents/final-reviewer.md',
  'agents/aesthetic-critic.md',
  'prompts/process-controller.md',
  'prompts/visual-direction-exploration.md',
  'prompts/aesthetic-critique.md',
  'prompts/aesthetic-direction.md',
  'prompts/task-implementer.md',
  'prompts/task-reviewer.md',
  'prompts/re-reviewer.md',
  'prompts/final-reviewer.md',
  'tests/process-pressure-scenarios-v4.md',
  'tests/TDD_EVIDENCE_V4.md'
]);

function safeRelative(value) {
  const raw = String(value ?? '');
  if (!raw || raw.includes('\\') || raw.includes('\0') || raw.startsWith('/') || /^[A-Za-z]:/.test(raw)) {
    throw new Error(`Unsafe bundle source path: ${raw || '<empty>'}`);
  }
  const segments = raw.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) throw new Error(`Unsafe bundle source path: ${raw}`);
  return segments.join('/');
}

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

export async function renderMarkdownBundle(rootDirectory, options = {}) {
  const root = await fs.realpath(path.resolve(String(rootDirectory)));
  const files = [...(options.files ?? DEFAULT_BUNDLE_FILES)].map(safeRelative);
  const seen = new Set();
  for (const file of files) {
    if (seen.has(file)) throw new Error(`Duplicate bundle source: ${file}`);
    seen.add(file);
  }
  const title = String(options.title ?? 'Full-Stack Vision Engineering Pro v5 — All-in-One Reference');
  const version = String(options.version ?? '5.0.0');
  const sections = [];

  for (const relative of files) {
    const absolute = path.resolve(root, ...relative.split('/'));
    if (!inside(root, absolute)) throw new Error(`Bundle source escaped root: ${relative}`);
    const stat = await fs.lstat(absolute);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Bundle source must be a regular file: ${relative}`);
    const real = await fs.realpath(absolute);
    if (!inside(root, real)) throw new Error(`Bundle source resolved outside root: ${relative}`);
    const text = (await fs.readFile(real, 'utf8')).replace(/\r\n/g, '\n').trimEnd();
    sections.push({ relative, text });
  }

  const lines = [
    `# ${title}`,
    '',
    `> Version: ${version}`,
    '> This file is generated deterministically from the authoritative modular documents listed below. Edit the source files, then regenerate this bundle.',
    '',
    '## Contents',
    ''
  ];
  sections.forEach((section, index) => lines.push(`${index + 1}. \`${section.relative}\``));
  lines.push('');

  for (const section of sections) {
    lines.push('---', '', `## Source: \`${section.relative}\``, '', `<!-- BEGIN SOURCE: ${section.relative} -->`, '', section.text, '', `<!-- END SOURCE: ${section.relative} -->`, '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

export async function writeMarkdownBundle(rootDirectory, outputPath, options = {}) {
  const root = path.resolve(String(rootDirectory));
  const output = path.resolve(root, String(outputPath));
  if (!inside(root, output)) throw new Error('Bundle output must remain inside the source root.');
  const content = await renderMarkdownBundle(root, options);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, content, 'utf8');
  return { output, bytes: Buffer.byteLength(content), files: (options.files ?? DEFAULT_BUNDLE_FILES).length };
}
