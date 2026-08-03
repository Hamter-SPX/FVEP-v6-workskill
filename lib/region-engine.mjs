function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be a finite number.`);
  return number;
}

function normalizeRect(rect, label) {
  if (!rect || typeof rect !== 'object') return null;
  const value = {
    x: finiteNumber(rect.x, `${label}.x`),
    y: finiteNumber(rect.y, `${label}.y`),
    width: finiteNumber(rect.width, `${label}.width`),
    height: finiteNumber(rect.height, `${label}.height`)
  };
  if (value.width <= 0 || value.height <= 0) throw new RangeError(`${label} width and height must be positive.`);
  return value;
}

export function normalizeRegion(region, index = 0) {
  if (!region || typeof region !== 'object' || Array.isArray(region)) throw new TypeError(`Region ${index} must be an object.`);
  const selector = typeof region.selector === 'string' && region.selector.trim() ? region.selector.trim() : null;
  const rect = normalizeRect(region.rect, `Region ${index}.rect`);
  if (!selector && !rect) throw new TypeError(`Region ${index} requires a selector or rect.`);
  const weight = finiteNumber(region.weight ?? 1, `Region ${index}.weight`);
  if (weight <= 0) throw new RangeError(`Region ${index}.weight must be positive.`);
  const maxMismatchRatio = region.maxMismatchRatio === undefined || region.maxMismatchRatio === null ? null : finiteNumber(region.maxMismatchRatio, `Region ${index}.maxMismatchRatio`);
  const minPerceptualSimilarity = region.minPerceptualSimilarity === undefined || region.minPerceptualSimilarity === null ? null : finiteNumber(region.minPerceptualSimilarity, `Region ${index}.minPerceptualSimilarity`);
  if (maxMismatchRatio !== null && (maxMismatchRatio < 0 || maxMismatchRatio > 1)) throw new RangeError(`Region ${index}.maxMismatchRatio must be between 0 and 1.`);
  if (minPerceptualSimilarity !== null && (minPerceptualSimilarity < 0 || minPerceptualSimilarity > 1)) throw new RangeError(`Region ${index}.minPerceptualSimilarity must be between 0 and 1.`);
  return {
    name: String(region.name ?? `region-${index + 1}`),
    selector,
    rect,
    weight,
    required: region.required !== false,
    maxMismatchRatio,
    minPerceptualSimilarity
  };
}

export function compareRegionGeometry(reference, current, tolerancePx = 2) {
  if (!reference || !current) return { severity: 'blocker', reason: 'missing-region-geometry', deltas: null };
  const tolerance = Math.max(0, Number(tolerancePx) || 0);
  const deltas = {
    x: Math.abs(Number(reference.x) - Number(current.x)),
    y: Math.abs(Number(reference.y) - Number(current.y)),
    width: Math.abs(Number(reference.width) - Number(current.width)),
    height: Math.abs(Number(reference.height) - Number(current.height))
  };
  if (deltas.width > tolerance || deltas.height > tolerance) return { severity: 'blocker', reason: 'region-dimensions-differ', deltas };
  if (deltas.x > tolerance || deltas.y > tolerance) return { severity: 'major', reason: 'region-position-differs', deltas };
  return { severity: 'accepted', reason: 'region-geometry-within-tolerance', deltas };
}

export async function resolvePageRegions(page, regions = [], { fullPage = true } = {}) {
  const resolved = [];
  for (const region of regions) {
    if (region.rect) {
      resolved.push({ ...region, status: 'resolved', resolvedRect: { ...region.rect }, source: 'rect' });
      continue;
    }
    let locator;
    try { locator = page.locator(region.selector).first(); }
    catch (error) { resolved.push({ ...region, status: 'invalid-selector', message: error.message, resolvedRect: null, source: 'selector' }); continue; }
    try {
      const count = await locator.count();
      if (!count) { resolved.push({ ...region, status: 'missing', resolvedRect: null, source: 'selector' }); continue; }
      const box = await locator.boundingBox();
      if (!box) { resolved.push({ ...region, status: 'not-visible', resolvedRect: null, source: 'selector' }); continue; }
      const scroll = fullPage ? await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })) : { x: 0, y: 0 };
      resolved.push({
        ...region,
        status: 'resolved',
        resolvedRect: { x: box.x + scroll.x, y: box.y + scroll.y, width: box.width, height: box.height },
        source: 'selector'
      });
    } catch (error) {
      resolved.push({ ...region, status: 'error', message: error.message, resolvedRect: null, source: 'selector' });
    }
  }
  return resolved;
}
