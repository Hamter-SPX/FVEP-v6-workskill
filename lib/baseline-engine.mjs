import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { enumerateCases } from './config.mjs';
import { artifactPaths } from './artifacts.mjs';
import { ensureParent, fileExists, writeJsonAtomic } from './io.mjs';
import { hashCanonical } from './provenance.mjs';

async function hashFile(file) {
  const buffer = await fs.readFile(file);
  return { sha256: crypto.createHash('sha256').update(buffer).digest('hex'), size: buffer.length };
}

function safeRelative(root, file) {
  const absoluteRoot = path.resolve(root); const absolute = path.resolve(file);
  if (absolute !== absoluteRoot && !absolute.startsWith(`${absoluteRoot}${path.sep}`)) throw new Error(`Baseline file is outside root: ${absolute}`);
  return path.relative(absoluteRoot, absolute).split(path.sep).join('/');
}

export async function createBaselineManifest({ root, files, configHash, approvedBy, reason = null, gitCommit = null }) {
  if (!approvedBy || !String(approvedBy).trim()) throw new TypeError('approvedBy is required for baseline provenance.');
  const entries = [];
  for (const file of [...files].sort()) entries.push({ path: safeRelative(root, file), ...await hashFile(file) });
  return { schemaVersion: 1, createdAt: new Date().toISOString(), configHash: String(configHash ?? ''), approvedBy: String(approvedBy), reason, gitCommit, files: entries };
}

export async function verifyBaselineManifest(manifest, root, { expectedConfigHash = null, requireApprovalMetadata = false } = {}) {
  const changed = []; const missing = [];
  for (const entry of manifest?.files ?? []) {
    const file = path.resolve(root, entry.path);
    if (!file.startsWith(`${path.resolve(root)}${path.sep}`) && file !== path.resolve(root)) throw new Error(`Unsafe manifest path: ${entry.path}`);
    if (!await fileExists(file)) { missing.push(entry.path); continue; }
    const current = await hashFile(file); if (current.sha256 !== entry.sha256 || current.size !== entry.size) changed.push(entry.path);
  }
  const configMatches = expectedConfigHash ? manifest?.configHash === expectedConfigHash : true;
  const approvalValid = !requireApprovalMetadata || Boolean(manifest?.approvedBy && String(manifest.approvedBy).trim() && manifest?.createdAt);
  return { valid: changed.length === 0 && missing.length === 0 && configMatches && approvalValid, changed, missing, checked: (manifest?.files ?? []).length, configMatches, approvalValid };
}

export function baselineConfigHash(config) {
  return hashCanonical({ version: config.version, mode: config.mode, routes: config.routes, capture: config.capture, runtime: config.runtime, diff: config.diff, tokens: config.tokens });
}

export async function verifyBaselineForConfig(config, { manifestPath = path.join(config.outputDir, 'reference', 'baseline-manifest.json') } = {}) {
  if (!await fileExists(manifestPath)) return { valid: false, manifestPath, missingManifest: true, changed: [], missing: [], checked: 0, configMatches: false, approvalValid: false };
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const verification = await verifyBaselineManifest(manifest, config.outputDir, { expectedConfigHash: baselineConfigHash(config), requireApprovalMetadata: config.baseline?.requireApprovalMetadata !== false });
  return { ...verification, manifestPath, missingManifest: false, manifest };
}

export async function promoteCurrentToBaseline(config, { approvedBy, reason = null, gitCommit = null, filters = {} } = {}) {
  const promoted = [];
  for (const item of enumerateCases(config, { ...filters, mode: 'current' })) {
    const paths = artifactPaths(config.outputDir, item);
    if (!await fileExists(paths.currentPng)) throw new Error(`Current screenshot is missing for ${item.key}: ${paths.currentPng}`);
    await ensureParent(paths.referencePng); await fs.copyFile(paths.currentPng, paths.referencePng);
    promoted.push(paths.referencePng);
    if (await fileExists(paths.currentCaptureJson)) {
      await ensureParent(paths.referenceCaptureJson); await fs.copyFile(paths.currentCaptureJson, paths.referenceCaptureJson); promoted.push(paths.referenceCaptureJson);
    }
    if (await fileExists(paths.currentTokensJson)) {
      await ensureParent(paths.referenceTokensJson); await fs.copyFile(paths.currentTokensJson, paths.referenceTokensJson); promoted.push(paths.referenceTokensJson);
    }
  }
  const configHash = baselineConfigHash(config);
  const manifest = await createBaselineManifest({ root: config.outputDir, files: promoted, configHash, approvedBy, reason, gitCommit });
  const manifestPath = path.join(config.outputDir, 'reference', 'baseline-manifest.json');
  await writeJsonAtomic(manifestPath, manifest);
  return { manifestPath, promotedCount: promoted.length, manifest };
}
