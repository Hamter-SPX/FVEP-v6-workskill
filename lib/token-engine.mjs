import fs from 'node:fs/promises';
import path from 'node:path';
import { runCaseMatrix } from './browser-runner.mjs';
import { artifactPaths } from './artifacts.mjs';
import { fileExists, writeJsonAtomic } from './io.mjs';
import { enumerateCases } from './config.mjs';

export function normalizeCssValue(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function keysOfFrequencyMap(map) { return Object.keys(map ?? {}).sort(); }
function jaccard(left, right) {
  const a = new Set(left); const b = new Set(right); const union = new Set([...a, ...b]);
  if (!union.size) return 1;
  let intersection = 0; for (const item of a) if (b.has(item)) intersection += 1;
  return intersection / union.size;
}

export function compareTokenProfiles(reference = {}, current = {}) {
  const referenceVariables = reference.cssVariables ?? {}; const currentVariables = current.cssVariables ?? {};
  const referenceNames = Object.keys(referenceVariables).sort(); const currentNames = Object.keys(currentVariables).sort();
  const missing = referenceNames.filter((name) => !(name in currentVariables));
  const extra = currentNames.filter((name) => !(name in referenceVariables));
  const changed = referenceNames
    .filter((name) => name in currentVariables && normalizeCssValue(referenceVariables[name]) !== normalizeCssValue(currentVariables[name]))
    .map((name) => ({ name, reference: referenceVariables[name], current: currentVariables[name] }));
  const shared = referenceNames.filter((name) => name in currentVariables);
  const variableDenominator = new Set([...referenceNames, ...currentNames]).size || 1;
  const variableDrift = (missing.length + extra.length + changed.length) / variableDenominator;

  const primitiveCategories = ['fontFamilies', 'fontSizes', 'colors', 'backgroundColors', 'radii', 'shadows', 'spacings'];
  const primitiveSimilarity = primitiveCategories.map((category) => ({
    category,
    similarity: jaccard(keysOfFrequencyMap(reference.primitives?.[category]), keysOfFrequencyMap(current.primitives?.[category]))
  }));
  const meanPrimitiveSimilarity = primitiveSimilarity.length ? primitiveSimilarity.reduce((sum, item) => sum + item.similarity, 0) / primitiveSimilarity.length : 1;
  const driftScore = Math.min(100, (variableDrift * 70 + (1 - meanPrimitiveSimilarity) * 30) * 100);
  return {
    schemaVersion: 1,
    similarityScore: Number((100 - driftScore).toFixed(2)),
    driftScore: Number(driftScore.toFixed(2)),
    variables: { shared, missing, extra, changed },
    primitives: primitiveSimilarity
  };
}

function increment(map, value) {
  const normalized = normalizeCssValue(value);
  if (!normalized || ['none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)'].includes(normalized)) return;
  map[normalized] = (map[normalized] ?? 0) + 1;
}

export async function extractTokenProfiles(config, { baseUrl, headed = false, filters = {}, mode = 'current' } = {}) {
  if (!config.tokens?.enabled) return [];
  const results = await runCaseMatrix(config, async ({ page, caseDefinition }) => {
    const profile = await page.evaluate(({ selectors, maxElements }) => {
      const selected = []; const seen = new Set();
      for (const selector of selectors) {
        let elements = [];
        try { elements = [...document.querySelectorAll(selector)]; } catch { continue; }
        for (const element of elements) {
          if (!seen.has(element)) { seen.add(element); selected.push(element); }
          if (selected.length >= maxElements) break;
        }
        if (selected.length >= maxElements) break;
      }
      const cssVariables = {}; const rootStyle = getComputedStyle(document.documentElement);
      for (const name of rootStyle) if (name.startsWith('--')) { const value = rootStyle.getPropertyValue(name).trim(); if (value) cssVariables[name] = value; }
      const primitives = { fontFamilies: {}, fontSizes: {}, colors: {}, backgroundColors: {}, radii: {}, shadows: {}, spacings: {} };
      const add = (map, value) => { const normalized = String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase(); if (!normalized || ['none', 'normal', 'auto', '0px', 'rgba(0, 0, 0, 0)'].includes(normalized)) return; map[normalized] = (map[normalized] ?? 0) + 1; };
      for (const element of selected) {
        const style = getComputedStyle(element);
        add(primitives.fontFamilies, style.fontFamily); add(primitives.fontSizes, style.fontSize); add(primitives.colors, style.color); add(primitives.backgroundColors, style.backgroundColor); add(primitives.radii, style.borderRadius); add(primitives.shadows, style.boxShadow);
        for (const value of [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft, style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft, style.gap, style.rowGap, style.columnGap]) add(primitives.spacings, value);
      }
      return { url: location.href, cssVariables, primitives, elementCount: selected.length };
    }, { selectors: config.tokens.selectors, maxElements: config.tokens.maxElements });
    const paths = artifactPaths(config.outputDir, caseDefinition);
    const profilePath = mode === 'reference' ? paths.referenceTokensJson : paths.currentTokensJson;
    await writeJsonAtomic(profilePath, { schemaVersion: 1, key: caseDefinition.key, mode, capturedAt: new Date().toISOString(), profile });
    return { key: caseDefinition.key, mode, profile, profilePath, ok: true };
  }, { mode, baseUrl, headed, filters, label: `tokens-${mode}` });
  const reportPath = path.join(config.outputDir, 'reports', `tokens-${mode}.json`);
  await writeJsonAtomic(reportPath, { schemaVersion: 1, generatedAt: new Date().toISOString(), mode, results });
  results.reportPath = reportPath;
  return results;
}


export async function loadStoredTokenProfiles(config, { mode = 'reference', filters = {} } = {}) {
  const results = [];
  for (const caseDefinition of enumerateCases(config, { ...filters, mode })) {
    const paths = artifactPaths(config.outputDir, caseDefinition);
    const profilePath = mode === 'reference' ? paths.referenceTokensJson : paths.currentTokensJson;
    if (!await fileExists(profilePath)) continue;
    try {
      const payload = JSON.parse(await fs.readFile(profilePath, 'utf8'));
      if (!payload?.profile) continue;
      results.push({ key: caseDefinition.key, mode, profile: payload.profile, profilePath, stored: true, ok: true });
    } catch (error) {
      results.push({ key: caseDefinition.key, mode, profilePath, stored: true, ok: false, error: { name: error.name, message: error.message } });
    }
  }
  return results;
}

export function compareTokenProfileSets(referenceResults = [], currentResults = []) {
  const currentByKey = new Map(currentResults.map((item) => [item.key, item]));
  return referenceResults.map((reference) => {
    const current = currentByKey.get(reference.key);
    if (!current) return { key: reference.key, missingCurrent: true, driftScore: 100, similarityScore: 0 };
    return { key: reference.key, ...compareTokenProfiles(reference.profile, current.profile) };
  });
}

export { increment };
