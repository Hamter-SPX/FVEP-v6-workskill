import fs from 'node:fs/promises';
import path from 'node:path';

const CONTRACT_KEYS = Object.freeze(['experience', 'architecture', 'migrations', 'security', 'resilience', 'observability', 'risks', 'incident', 'apiCurrent', 'apiBaseline', 'frontendSummary', 'dependencyManifest', 'processReport']);
const DEFAULT_WEIGHTS = Object.freeze({ process: 15, frontend: 15, experience: 10, api: 10, architecture: 10, data: 10, security: 15, resilience: 10, observability: 10, dependencies: 5, risks: 5 });
const DEFAULT_GATES = Object.freeze({
  process: { required: true, hard: true }, frontend: { required: true, hard: false }, experience: { required: true, hard: false }, api: { required: true, hard: true },
  architecture: { required: true, hard: false }, data: { required: false, hard: true }, security: { required: true, hard: true },
  resilience: { required: true, hard: false }, observability: { required: true, hard: false }, dependencies: { required: true, hard: true }, risks: { required: true, hard: true }
});

function clone(value) { return structuredClone(value ?? {}); }
function resolveOptional(baseDir, value) { return value ? path.resolve(baseDir, String(value)) : null; }

export function normalizeFullstackConfig(input = {}, configPath = path.resolve('fullstack.config.json')) {
  const source = clone(input);
  const resolvedConfigPath = path.resolve(configPath);
  const baseDir = path.dirname(resolvedConfigPath);
  const contracts = {};
  for (const key of CONTRACT_KEYS) contracts[key] = resolveOptional(baseDir, source.contracts?.[key]);
  const gates = {};
  for (const [name, defaults] of Object.entries(DEFAULT_GATES)) gates[name] = { ...defaults, ...(source.gates?.[name] ?? {}) };
  return {
    version: 4,
    configPath: resolvedConfigPath,
    baseDir,
    project: {
      name: String(source.project?.name ?? 'Full-Stack Project'),
      rootDir: path.resolve(baseDir, source.project?.rootDir ?? '.'),
      criticalFlows: Array.isArray(source.project?.criticalFlows) ? clone(source.project.criticalFlows) : []
    },
    contracts,
    sourceScan: {
      enabled: source.sourceScan?.enabled !== false,
      roots: (source.sourceScan?.roots ?? ['src']).map((entry) => path.resolve(baseDir, String(entry))),
      extensions: Array.isArray(source.sourceScan?.extensions) ? source.sourceScan.extensions.map(String) : null,
      exclude: Array.isArray(source.sourceScan?.exclude) ? source.sourceScan.exclude.map(String) : ['node_modules', '.git', 'dist', 'build', 'coverage', 'artifacts'],
      maxFileBytes: Number(source.sourceScan?.maxFileBytes ?? 1_000_000)
    },
    outputDir: path.resolve(baseDir, source.outputDir ?? 'artifacts/fullstack-audit'),
    quality: {
      minScore: Number(source.quality?.minScore ?? 90),
      minConfidence: Number(source.quality?.minConfidence ?? 90),
      failOnAnyGateFailure: source.quality?.failOnAnyGateFailure !== false,
      weights: { ...DEFAULT_WEIGHTS, ...(source.quality?.weights ?? {}) }
    },
    gates,
    policies: clone(source.policies ?? {})
  };
}

export function validateFullstackConfig(config) {
  if (!config || typeof config !== 'object') throw new TypeError('Full-stack config must be an object.');
  for (const [name, value] of [['minScore', config.quality?.minScore], ['minConfidence', config.quality?.minConfidence]]) {
    if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) throw new RangeError(`${name} must be between 0 and 100.`);
  }
  if (!Number.isFinite(config.sourceScan?.maxFileBytes) || config.sourceScan.maxFileBytes <= 0) throw new RangeError('sourceScan.maxFileBytes must be positive.');
  const seen = new Set();
  for (const flow of config.project?.criticalFlows ?? []) {
    const id = String(flow?.id ?? '');
    if (!id) throw new TypeError('Every critical flow must have an id.');
    if (seen.has(id)) throw new TypeError(`Duplicate critical flow identifier: ${id}.`);
    seen.add(id);
  }
  for (const [name, gate] of Object.entries(config.gates ?? {})) {
    if (typeof gate?.required !== 'boolean' || typeof gate?.hard !== 'boolean') throw new TypeError(`Gate ${name} must declare boolean required and hard fields.`);
  }
  for (const [name, weight] of Object.entries(config.quality?.weights ?? {})) {
    if (!Number.isFinite(Number(weight)) || Number(weight) < 0) throw new RangeError(`Gate weight ${name} must be a non-negative number.`);
  }
  return config;
}

export async function loadFullstackConfig(configPath = 'fullstack.config.json') {
  const absolute = path.resolve(configPath);
  const parsed = JSON.parse(await fs.readFile(absolute, 'utf8'));
  return validateFullstackConfig(normalizeFullstackConfig(parsed, absolute));
}

export { DEFAULT_GATES as DEFAULT_FULLSTACK_GATES, DEFAULT_WEIGHTS as DEFAULT_FULLSTACK_WEIGHTS };
