export function analyzeHeadingOutline(headings = []) {
  const normalized = headings.map((item) => ({ level: Number(item.level), text: String(item.text ?? '') })).filter((item) => Number.isInteger(item.level) && item.level >= 1 && item.level <= 6);
  const skippedLevels = [];
  for (let index = 1; index < normalized.length; index += 1) {
    const previous = normalized[index - 1]; const current = normalized[index];
    if (current.level > previous.level + 1) skippedLevels.push({ index, from: previous.level, to: current.level, text: current.text });
  }
  return {
    count: normalized.length,
    hasH1: normalized.some((item) => item.level === 1),
    h1Count: normalized.filter((item) => item.level === 1).length,
    skippedLevels,
    issues: [
      ...(normalized.some((item) => item.level === 1) ? [] : ['missing-h1']),
      ...(normalized.filter((item) => item.level === 1).length <= 1 ? [] : ['multiple-h1']),
      ...(skippedLevels.length ? ['skipped-heading-level'] : [])
    ]
  };
}

export function intersectionArea(left, right) {
  const width = Math.max(0, Math.min(Number(left.right), Number(right.right)) - Math.max(Number(left.left), Number(right.left)));
  const height = Math.max(0, Math.min(Number(left.bottom), Number(right.bottom)) - Math.max(Number(left.top), Number(right.top)));
  return width * height;
}

function containsPath(parent, child) {
  return parent && child && child.startsWith(`${parent}>`);
}

export function detectPotentialOverlaps(elements = [], { minOverlapRatio = 0.2, maxPairs = 200 } = {}) {
  const candidates = elements.filter((item) => item.visible && item.rect && Number(item.rect.width) > 0 && Number(item.rect.height) > 0);
  const results = [];
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    const left = candidates[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      const right = candidates[rightIndex];
      if (containsPath(left.domPath, right.domPath) || containsPath(right.domPath, left.domPath)) continue;
      const area = intersectionArea(left.rect, right.rect); if (!area) continue;
      const leftArea = Number(left.rect.width) * Number(left.rect.height); const rightArea = Number(right.rect.width) * Number(right.rect.height);
      const ratio = area / Math.max(1, Math.min(leftArea, rightArea));
      const positioned = ['fixed', 'sticky', 'absolute'].includes(left.style?.position) || ['fixed', 'sticky', 'absolute'].includes(right.style?.position);
      const competingInteractive = Boolean(left.interactive && right.interactive);
      if (ratio < minOverlapRatio || (!positioned && !competingInteractive)) continue;
      results.push({ left: left.domPath, right: right.domPath, overlapArea: area, overlapRatio: Number(ratio.toFixed(4)), blocking: competingInteractive, positioned });
      if (results.length >= maxPairs) return results;
    }
  }
  return results;
}
