import crypto from 'node:crypto';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}

export function hashCanonical(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

function git(command, cwd) {
  const result = spawnSync('git', command, { cwd, encoding: 'utf8', timeout: 5000 });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function collectGitProvenance(cwd) {
  const commit = git(['rev-parse', 'HEAD'], cwd);
  if (!commit) return { available: false, commit: null, branch: null, dirty: null };
  return {
    available: true,
    commit,
    branch: git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd),
    dirty: Boolean(git(['status', '--porcelain'], cwd))
  };
}

export function createRunProvenance(config) {
  const configProjection = {
    version: config.version,
    mode: config.mode,
    baseUrl: config.baseUrl,
    referenceBaseUrl: config.referenceBaseUrl,
    runtime: config.runtime,
    capture: config.capture,
    diff: config.diff,
    accessibility: config.accessibility,
    inspection: config.inspection,
    interaction: config.interaction,
    stateCrawler: config.stateCrawler,
    performance: config.performance,
    tokens: config.tokens,
    breakpoints: config.breakpoints,
    quality: config.quality,
    baseline: config.baseline,
    manualReview: config.manualReview,
    aesthetics: config.aesthetics,
    history: config.history,
    engineeringChecks: config.engineeringChecks,
    routes: config.routes
  };
  const generatedAt = new Date().toISOString();
  const configHash = hashCanonical(configProjection);
  return {
    schemaVersion: 1,
    runId: `${generatedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}-${configHash.slice(0, 12)}`,
    generatedAt,
    configPath: config.configPath,
    configHash,
    git: collectGitProvenance(config.baseDir),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      release: os.release(),
      cpus: os.cpus()?.length ?? null,
      totalMemoryBytes: os.totalmem()
    }
  };
}
