import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, writeJsonAtomic } from './io.mjs';

export function analyzeRunHistory(records = [], { stagnationWindow = 3, minMeaningfulDelta = 0.5 } = {}) {
  const normalized = records.map((record) => ({ ...record, score: Number(record.score ?? 0), blockers: Number(record.blockers ?? 0) }));
  if (normalized.length < 2) return { trend: 'insufficient-data', stagnant: false, scoreDelta: null, blockerDelta: null };
  const previous = normalized.at(-2); const current = normalized.at(-1);
  const scoreDelta = current.score - previous.score; const blockerDelta = current.blockers - previous.blockers;
  let trend = 'stable';
  if (blockerDelta > 0 || scoreDelta <= -Math.abs(minMeaningfulDelta)) trend = 'regressing';
  else if (blockerDelta < 0 || scoreDelta >= Math.abs(minMeaningfulDelta)) trend = 'improving';
  const window = normalized.slice(-Math.max(2, stagnationWindow));
  const scores = window.map((item) => item.score); const blockers = window.map((item) => item.blockers);
  const stagnant = window.length >= stagnationWindow && Math.max(...scores) - Math.min(...scores) < Math.abs(minMeaningfulDelta) && new Set(blockers).size === 1;
  return { trend, stagnant, scoreDelta: Number(scoreDelta.toFixed(2)), blockerDelta, window: window.length };
}

export async function appendRunHistory(config, summary, { maxRecords = 100 } = {}) {
  const historyPath = path.join(config.outputDir, 'reports', 'run-history.json');
  let records = [];
  if (await fileExists(historyPath)) {
    try { records = JSON.parse(await fs.readFile(historyPath, 'utf8')).records ?? []; } catch { records = []; }
  }
  records.push({
    runId: summary.provenance.runId,
    generatedAt: summary.generatedAt,
    score: summary.quality.score,
    confidence: summary.quality.confidence,
    grade: summary.quality.grade,
    passed: summary.quality.passed,
    blockers: summary.sections.comparison?.blockers ?? 0,
    majors: summary.sections.comparison?.majors ?? 0,
    remediationBlockers: summary.remediation?.blockers ?? 0,
    aestheticScore: summary.quality.gates?.aesthetic?.score ?? null,
    aestheticStatus: summary.quality.gates?.aesthetic?.status ?? 'not-applicable'
  });
  records = records.slice(-Math.max(2, Number(maxRecords) || 100));
  const analysis = analyzeRunHistory(records, { stagnationWindow: config.history?.stagnationWindow ?? 3, minMeaningfulDelta: config.history?.minMeaningfulDelta ?? 0.5 });
  await writeJsonAtomic(historyPath, { schemaVersion: 1, updatedAt: new Date().toISOString(), analysis, records });
  return { historyPath, analysis, records };
}
