import fs from 'node:fs/promises';
import path from 'node:path';

export const PROCESS_CONTRACT_KEYS = Object.freeze([
  'request', 'design', 'plan', 'workspace', 'ledger', 'tdd', 'debug', 'review',
  'claims', 'evidence', 'integration', 'fullstackReport'
]);

const DEFAULT_REQUIRED_SECTIONS = Object.freeze([
  'routing', 'design', 'plan', 'workspace', 'tdd', 'review', 'claims', 'ledger'
]);

function resolveOptional(baseDir, value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return path.resolve(baseDir, String(value));
}

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeProcessConfig(input = {}, configPath = path.resolve('process.config.json')) {
  const absoluteConfigPath = path.resolve(String(configPath));
  const baseDir = path.dirname(absoluteConfigPath);
  const contractInput = input.contracts && typeof input.contracts === 'object' ? input.contracts : {};
  const contracts = Object.fromEntries(PROCESS_CONTRACT_KEYS.map((key) => [key, resolveOptional(baseDir, contractInput[key])]));
  const processGate = input.policy?.processGate ?? {};
  const requiredSections = Array.isArray(processGate.requiredSections)
    ? processGate.requiredSections.map(String)
    : [...DEFAULT_REQUIRED_SECTIONS];

  return {
    version: 4,
    configPath: absoluteConfigPath,
    baseDir,
    project: {
      name: String(input.project?.name ?? path.basename(baseDir)),
      rootDir: path.resolve(baseDir, String(input.project?.rootDir ?? '.'))
    },
    contracts,
    outputDir: path.resolve(baseDir, String(input.outputDir ?? 'artifacts/process')),
    policy: {
      routing: { ...(input.policy?.routing ?? {}) },
      design: { ...(input.policy?.design ?? {}) },
      plan: { ...(input.policy?.plan ?? {}) },
      taskGraph: { ...(input.policy?.taskGraph ?? {}) },
      workspace: { ...(input.policy?.workspace ?? {}) },
      ledger: { ...(input.policy?.ledger ?? {}) },
      tdd: { ...(input.policy?.tdd ?? {}) },
      debugging: { ...(input.policy?.debugging ?? {}) },
      review: { ...(input.policy?.review ?? {}) },
      claims: { ...(input.policy?.claims ?? {}) },
      integration: { ...(input.policy?.integration ?? {}) },
      processGate: {
        minScore: numberOr(processGate.minScore, 90),
        minConfidence: numberOr(processGate.minConfidence, 90),
        requiredSections,
        weights: { ...(processGate.weights ?? {}) }
      }
    }
  };
}

export function validateProcessConfig(config = {}) {
  if (Number(config.version) !== 4) throw new TypeError('Process config version must be 4.');
  for (const key of ['minScore', 'minConfidence']) {
    const value = Number(config.policy?.processGate?.[key]);
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new RangeError(`${key} must be between 0 and 100.`);
  }
  const requiredSections = config.policy?.processGate?.requiredSections;
  if (!Array.isArray(requiredSections) || requiredSections.length === 0) throw new TypeError('processGate.requiredSections must be a non-empty array.');
  const seen = new Set();
  for (const section of requiredSections.map(String)) {
    if (!section.trim()) throw new TypeError('Required process section names cannot be empty.');
    if (seen.has(section)) throw new TypeError(`Duplicate required process section: ${section}`);
    seen.add(section);
  }
  if (!config.project?.rootDir || !path.isAbsolute(config.project.rootDir)) throw new TypeError('project.rootDir must resolve to an absolute path.');
  if (!config.outputDir || !path.isAbsolute(config.outputDir)) throw new TypeError('outputDir must resolve to an absolute path.');
  for (const [key, value] of Object.entries(config.contracts ?? {})) {
    if (!PROCESS_CONTRACT_KEYS.includes(key)) throw new TypeError(`Unsupported process contract key: ${key}`);
    if (value !== null && !path.isAbsolute(value)) throw new TypeError(`Contract path ${key} must resolve to an absolute path.`);
  }
  return config;
}

export async function loadProcessConfig(configPath = 'process.config.json') {
  const absolute = path.resolve(String(configPath));
  let parsed;
  try { parsed = JSON.parse(await fs.readFile(absolute, 'utf8')); }
  catch (error) { throw new Error(`Unable to read process config at ${absolute}: ${error.message}`); }
  return validateProcessConfig(normalizeProcessConfig(parsed, absolute));
}
