import fs from 'node:fs/promises';
import path from 'node:path';
import { runFullstackAudit } from './fullstack-audit-engine.mjs';
import { rankIncidentHypotheses } from './debug-triage-engine.mjs';
import { collectSourceFiles } from './source-risk-scanner.mjs';
import { renderFullstackMarkdown } from './fullstack-report.mjs';
import { ensureDir, fileExists, writeJsonAtomic, writeTextAtomic } from './io.mjs';

async function readJsonMaybe(filePath) {
  if (!filePath || !await fileExists(filePath)) return null;
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

const LOCKFILE_NAMES = Object.freeze(['package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb']);
const DEPENDENCY_GROUPS = Object.freeze(['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']);

function isRegistryExactVersion(value) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(value ?? ''));
}

function compareNpmLockfile(lockfile, manifest) {
  const issues = [];
  const lockfileVersion = Number(lockfile?.lockfileVersion ?? 0);
  if (lockfileVersion < 2) issues.push(`Unsupported npm lockfileVersion ${lockfileVersion}; version 2 or 3 is required for deterministic package inspection.`);
  const root = lockfile?.packages?.[''];
  if (!root || typeof root !== 'object') issues.push('The npm lockfile does not contain packages[""] root metadata.');

  for (const group of DEPENDENCY_GROUPS) {
    const expected = manifest?.[group] ?? {};
    const locked = root?.[group] ?? {};
    for (const [name, version] of Object.entries(expected)) {
      if (String(locked?.[name] ?? '') !== String(version)) {
        issues.push(`${group}.${name} differs from the root lock entry: manifest=${String(version)} lock=${String(locked?.[name] ?? '<missing>')}`);
        continue;
      }
      const packageEntry = lockfile?.packages?.[`node_modules/${name}`];
      if (!packageEntry) {
        issues.push(`${group}.${name} has no node_modules/${name} package entry in the lockfile.`);
        continue;
      }
      if (isRegistryExactVersion(version) && String(packageEntry.version ?? '') !== String(version)) {
        issues.push(`${group}.${name} resolved version differs: manifest=${String(version)} lock=${String(packageEntry.version ?? '<missing>')}`);
      }
      if (isRegistryExactVersion(version) && (!packageEntry.resolved || !packageEntry.integrity)) {
        issues.push(`${group}.${name} lacks resolved and integrity metadata in the npm lockfile.`);
      }
    }
    for (const name of Object.keys(locked ?? {})) {
      if (!Object.hasOwn(expected, name)) issues.push(`${group}.${name} exists in the root lock entry but not in the reviewed manifest.`);
    }
  }
  return issues;
}

export async function inspectDependencyLockfile(projectRoot, manifest = {}) {
  const root = path.resolve(projectRoot);
  let lockfilePath = null;
  for (const name of LOCKFILE_NAMES) {
    const candidate = path.join(root, name);
    if (await fileExists(candidate)) { lockfilePath = candidate; break; }
  }
  if (!lockfilePath) return { lockfilePresent: false, lockfileVerified: false, lockfileKind: null, lockfilePath: null, lockfileIssues: ['No supported lockfile was found.'] };

  const name = path.basename(lockfilePath);
  if (name === 'package-lock.json' || name === 'npm-shrinkwrap.json') {
    try {
      const lockfile = JSON.parse(await fs.readFile(lockfilePath, 'utf8'));
      const lockfileIssues = compareNpmLockfile(lockfile, manifest);
      return { lockfilePresent: true, lockfileVerified: lockfileIssues.length === 0, lockfileKind: 'npm', lockfilePath, lockfileIssues };
    } catch (error) {
      return { lockfilePresent: true, lockfileVerified: false, lockfileKind: 'npm', lockfilePath, lockfileIssues: [`Unable to parse npm lockfile: ${error.message}`] };
    }
  }

  const kind = name.startsWith('pnpm') ? 'pnpm' : name.startsWith('yarn') ? 'yarn' : 'bun';
  return {
    lockfilePresent: true,
    lockfileVerified: null,
    lockfileKind: kind,
    lockfilePath,
    lockfileIssues: [`${kind} lockfile presence was detected, but this runtime does not perform semantic consistency verification for that format.`]
  };
}

async function dependencyEvidence(config) {
  const manifestPath = config.contracts.dependencyManifest ?? path.join(config.project.rootDir, 'package.json');
  const manifest = await readJsonMaybe(manifestPath);
  if (!manifest) return null;
  const lockfile = await inspectDependencyLockfile(config.project.rootDir, manifest);
  return { manifest, manifestPath, ...lockfile };
}

async function sourceEvidence(config) {
  if (!config.sourceScan.enabled) return null;
  const files = [];
  for (const root of config.sourceScan.roots) {
    if (!await fileExists(root)) continue;
    const collected = await collectSourceFiles(root, {
      extensions: config.sourceScan.extensions ?? undefined,
      exclude: config.sourceScan.exclude,
      maxFileBytes: config.sourceScan.maxFileBytes
    });
    for (const item of collected) files.push({ ...item, path: path.relative(config.project.rootDir, path.join(root, item.path)).split(path.sep).join('/') });
  }
  return files;
}

export async function collectConfiguredAuditInput(config) {
  const [processReport, frontend, experience, apiCurrent, apiBaseline, architecture, migrations, security, resilience, observability, risks, incident, dependencies, sourceFiles] = await Promise.all([
    readJsonMaybe(config.contracts.processReport),
    readJsonMaybe(config.contracts.frontendSummary),
    readJsonMaybe(config.contracts.experience),
    readJsonMaybe(config.contracts.apiCurrent),
    readJsonMaybe(config.contracts.apiBaseline),
    readJsonMaybe(config.contracts.architecture),
    readJsonMaybe(config.contracts.migrations),
    readJsonMaybe(config.contracts.security),
    readJsonMaybe(config.contracts.resilience),
    readJsonMaybe(config.contracts.observability),
    readJsonMaybe(config.contracts.risks),
    readJsonMaybe(config.contracts.incident),
    dependencyEvidence(config),
    sourceEvidence(config)
  ]);
  return {
    project: config.project,
    process: processReport,
    frontend: frontend?.quality ?? frontend,
    experience,
    api: apiCurrent ? { current: apiCurrent, baseline: apiBaseline } : null,
    architecture,
    migrations,
    security,
    resilience,
    observability,
    risks,
    incident,
    dependencies,
    sourceFiles
  };
}

export async function runConfiguredFullstackAudit(config) {
  const input = await collectConfiguredAuditInput(config);
  const report = runFullstackAudit(input, {
    quality: config.quality,
    gates: config.gates,
    policies: config.policies
  });
  report.project = config.project;
  if (input.incident) report.sections.incidentTriage = rankIncidentHypotheses(input.incident, config.policies?.debugging);
  report.verificationGaps = [];
  if (!input.process && config.gates.process.required) report.verificationGaps.push('Governed process audit report was not supplied.');
  if (!input.frontend && config.gates.frontend.required) report.verificationGaps.push('Frontend vision-loop summary was not supplied.');
  if (!input.observability && config.gates.observability.required) report.verificationGaps.push('Production observability contract or evidence was not supplied.');
  if (!input.api && config.gates.api.required) report.verificationGaps.push('Current API contract was not supplied.');
  if (config.sourceScan.enabled && input.sourceFiles === null) report.verificationGaps.push('Source scan could not be collected.');

  const reportsDir = path.join(config.outputDir, 'reports');
  await ensureDir(reportsDir);
  const jsonPath = path.join(reportsDir, 'fullstack-report.json');
  const markdownPath = path.join(reportsDir, 'fullstack-report.md');
  await writeJsonAtomic(jsonPath, report);
  await writeTextAtomic(markdownPath, `${renderFullstackMarkdown(report)}\n`);
  return { report, jsonPath, markdownPath };
}
