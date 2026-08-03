function uniquePreserve(values) {
  const seen = new Set();
  const result = [];
  for (const raw of values ?? []) {
    const value = String(raw ?? '');
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function uniqueSorted(values) {
  return uniquePreserve(values).sort();
}

function defaultKeyOf(entry) {
  return entry && typeof entry === 'object' ? entry.key : null;
}

export function evaluateCaseCoverage(entries = [], expectedCaseKeys = [], options = {}) {
  const keyOf = typeof options.keyOf === 'function' ? options.keyOf : defaultKeyOf;
  const expectedKeys = uniquePreserve(expectedCaseKeys ?? []);
  const expectedSet = new Set(expectedKeys);
  const observed = [];
  const counts = new Map();
  for (const entry of entries ?? []) {
    const value = keyOf(entry);
    if (value === undefined || value === null || String(value).length === 0) continue;
    const key = String(value);
    observed.push(key);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const observedKeys = uniqueSorted(observed);
  const coveredKeys = expectedKeys.filter((key) => counts.has(key));
  const missing = expectedKeys.filter((key) => !counts.has(key));
  const unexpected = observedKeys.filter((key) => !expectedSet.has(key));
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key).sort();
  const ratio = expectedKeys.length ? coveredKeys.length / expectedKeys.length : 1;
  return {
    expected: expectedKeys.length,
    covered: coveredKeys.length,
    observed: observedKeys.length,
    ratio,
    confidence: Number((ratio * 100).toFixed(2)),
    complete: missing.length === 0,
    expectedKeys,
    coveredKeys,
    missing,
    unexpected,
    duplicates
  };
}

export function combineCoverage(families = []) {
  const requiredFamilies = (families ?? []).filter((family) => family?.required !== false);
  if (!requiredFamilies.length) {
    return { ratio: 1, confidence: 100, complete: true, families: [], incompleteFamilies: [] };
  }
  const normalized = requiredFamilies.map((family) => ({
    name: String(family.name ?? 'unnamed'),
    coverage: family.coverage ?? { ratio: 0, complete: false, expected: 0, covered: 0, missing: [] }
  }));
  const ratio = normalized.reduce((sum, family) => sum + Number(family.coverage.ratio ?? 0), 0) / normalized.length;
  const incompleteFamilies = normalized.filter((family) => family.coverage.complete === false || (family.coverage.complete === undefined && Number(family.coverage.ratio ?? 0) < 1)).map((family) => family.name);
  return {
    ratio,
    confidence: Number((ratio * 100).toFixed(2)),
    complete: incompleteFamilies.length === 0,
    families: normalized,
    incompleteFamilies
  };
}
