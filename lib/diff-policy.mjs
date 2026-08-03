export function dimensionsMatch(left, right) {
  return Number(left?.width) === Number(right?.width) && Number(left?.height) === Number(right?.height);
}

export function classifyDiff({ dimensionsEqual, mismatchRatio, maxMismatchRatio = 0.005, majorMismatchRatio = 0.02 }) {
  if (!dimensionsEqual) return { severity: 'blocker', acceptedByNumericGate: false, reason: 'image-dimensions-differ' };
  const ratio = Number(mismatchRatio);
  const max = Number(maxMismatchRatio);
  const major = Number(majorMismatchRatio);
  if (![ratio, max, major].every(Number.isFinite) || ratio < 0 || ratio > 1 || max < 0 || max > 1 || major < max || major > 1) {
    throw new RangeError('Diff ratios must satisfy 0 <= mismatchRatio <= 1 and 0 <= maxMismatchRatio <= majorMismatchRatio <= 1.');
  }
  if (ratio === 0) return { severity: 'accepted', acceptedByNumericGate: true, reason: 'no-pixel-difference' };
  if (ratio <= max) return { severity: 'minor', acceptedByNumericGate: true, reason: 'within-numeric-gate-semantic-review-required' };
  if (ratio <= major) return { severity: 'major', acceptedByNumericGate: false, reason: 'above-numeric-gate' };
  return { severity: 'blocker', acceptedByNumericGate: false, reason: 'large-pixel-difference' };
}

export function normalizeMaskRectangles(rectangles = []) {
  if (!Array.isArray(rectangles)) throw new TypeError('Mask rectangles must be an array.');
  return rectangles.map((rectangle, index) => {
    const value = {
      x: Math.floor(Number(rectangle.x)),
      y: Math.floor(Number(rectangle.y)),
      width: Math.floor(Number(rectangle.width)),
      height: Math.floor(Number(rectangle.height))
    };
    if (Object.values(value).some((entry) => !Number.isFinite(entry))) throw new TypeError(`Mask rectangle ${index} contains a non-finite coordinate.`);
    if (value.width <= 0 || value.height <= 0) throw new RangeError(`Mask rectangle ${index} must have positive width and height.`);
    return value;
  });
}

export function pointInRectangle(rectangle, x, y) {
  return x >= rectangle.x && x < rectangle.x + rectangle.width && y >= rectangle.y && y < rectangle.y + rectangle.height;
}

export function classifyPerceptual(similarity, { minSimilarity = 0.97, blockerSimilarity = 0.85 } = {}) {
  const value = Number(similarity); const minimum = Number(minSimilarity); const blocker = Number(blockerSimilarity);
  if (![value, minimum, blocker].every(Number.isFinite) || value < 0 || value > 1 || minimum < 0 || minimum > 1 || blocker < 0 || blocker > minimum) {
    throw new RangeError('Perceptual values must satisfy 0 <= blockerSimilarity <= minSimilarity <= 1 and 0 <= similarity <= 1.');
  }
  if (value >= minimum) return { severity: 'accepted', acceptedByPerceptualGate: true, reason: 'perceptual-similarity-within-gate' };
  if (value >= blocker) return { severity: 'major', acceptedByPerceptualGate: false, reason: 'perceptual-similarity-below-gate' };
  return { severity: 'blocker', acceptedByPerceptualGate: false, reason: 'perceptual-similarity-critically-low' };
}

export function worstSeverity(...severities) {
  const rank = { 'not-applicable': -1, unverified: -1, accepted: 0, minor: 1, major: 2, blocker: 3 };
  return severities.filter(Boolean).sort((left, right) => (rank[right] ?? 99) - (rank[left] ?? 99))[0] ?? 'accepted';
}
