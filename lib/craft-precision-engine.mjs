import { finalizeProcessAudit, processFinding } from './process-audit-utils.mjs';

function round(value, digits = 2) { return Number(Number(value).toFixed(digits)); }

/**
 * Parses a CSS box-shadow layer. Only the geometry needed for light-source consistency is
 * extracted; colour is returned verbatim for the caller to inspect.
 */
export function parseShadowLayer(value) {
  const raw = String(value ?? '').trim();
  if (!raw || raw === 'none') return null;
  const inset = /\binset\b/.test(raw);
  const color = raw.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/)?.[1] ?? null;
  // Strip the colour function before extracting lengths so rgba channel values are not
  // mistaken for offset, blur, or spread.
  const geometry = color ? raw.replace(color, ' ') : raw;
  const lengths = geometry.match(/-?\d*\.?\d+(?:px|rem|em)?/g) ?? [];
  const toPx = (token) => {
    if (token === undefined) return null;
    const number = Number.parseFloat(token);
    if (!Number.isFinite(number)) return null;
    if (token.endsWith('rem') || token.endsWith('em')) return number * 16;
    return number;
  };
  const numeric = lengths.map(toPx).filter((item) => item !== null);
  if (numeric.length < 2) return null;
  return {
    raw,
    inset,
    offsetX: round(numeric[0]),
    offsetY: round(numeric[1]),
    blur: numeric[2] === undefined ? 0 : round(numeric[2]),
    spread: numeric[3] === undefined ? 0 : round(numeric[3]),
    color
  };
}

/** Splits a full box-shadow declaration into its comma-separated layers. */
export function parseShadow(value) {
  const raw = String(value ?? '').trim();
  if (!raw || raw === 'none') return [];
  const layers = [];
  let depth = 0;
  let current = '';
  for (const char of raw) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) { layers.push(current); current = ''; continue; }
    current += char;
  }
  layers.push(current);
  return layers.map(parseShadowLayer).filter(Boolean);
}

/**
 * An inner corner must be smaller than its outer corner by the padding between them, or the
 * two curves will not run parallel. See references/visual-craft-standards.md.
 */
export function expectedInnerRadius(outerRadiusPx, paddingPx) {
  const outer = Number(outerRadiusPx);
  const padding = Number(paddingPx);
  if (!Number.isFinite(outer) || !Number.isFinite(padding)) return null;
  return Math.max(0, round(outer - padding));
}

export function analyzeCraftPrecision(input = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const radiusTolerancePx = Number(policy.radiusTolerancePx ?? 1);
  const maxRadiusVocabulary = Number(policy.maxRadiusVocabulary ?? 5);
  const maxElevationLevels = Number(policy.maxElevationLevels ?? 5);
  const minShadowLayers = Number(policy.minShadowLayers ?? 2);
  const highElevationBlurPx = Number(policy.highElevationBlurPx ?? 16);

  const radii = [...new Set((input.radiiPx ?? []).map(Number).filter((value) => Number.isFinite(value) && value >= 0))].sort((a, b) => a - b);
  if (radii.length) {
    evidenceCount += 1;
    if (radii.length > maxRadiusVocabulary) {
      findings.push(processFinding('CRAFT_RADIUS_VOCABULARY_EXCESSIVE', 'medium', `${radii.length} distinct radii are in use but policy allows ${maxRadiusVocabulary}. A radius appearing once is either a mistake or an undocumented decision.`, { detail: radii }));
    }
  }

  const nestedPairs = Array.isArray(input.nestedRadii) ? input.nestedRadii : [];
  const nestingResults = [];
  for (const pair of nestedPairs) {
    const expected = expectedInnerRadius(pair.outerRadiusPx, pair.paddingPx);
    const actual = Number(pair.innerRadiusPx);
    if (expected === null || !Number.isFinite(actual)) continue;
    evidenceCount += 1;
    const delta = round(actual - expected);
    const ok = Math.abs(delta) <= radiusTolerancePx;
    nestingResults.push({ name: String(pair.name ?? 'unnamed'), expected, actual: round(actual), delta, ok });
    if (!ok) {
      findings.push(processFinding('CRAFT_RADIUS_NOT_NESTED', 'low', `Nested radius in ${pair.name ?? 'a container'} is ${round(actual)}px where ${expected}px keeps the curves parallel across ${round(Number(pair.paddingPx))}px of padding.`, { path: pair.name ? String(pair.name) : undefined, remediation: 'Set the inner radius to the outer radius minus the padding, clamped at zero.' }));
    }
  }

  const shadowDeclarations = Array.isArray(input.shadows) ? input.shadows : [];
  const shadowResults = [];
  const horizontalSigns = new Set();
  for (const declaration of shadowDeclarations) {
    const name = String(declaration?.name ?? declaration ?? 'unnamed');
    const layers = parseShadow(declaration?.value ?? declaration);
    if (!layers.length) continue;
    evidenceCount += 1;
    const outer = layers.filter((layer) => !layer.inset);
    if (!outer.length) { shadowResults.push({ name, layers: layers.length, insetOnly: true }); continue; }
    const maxBlur = Math.max(...outer.map((layer) => layer.blur));
    const offsetY = Math.max(...outer.map((layer) => layer.offsetY));
    for (const layer of outer) if (layer.offsetX !== 0) horizontalSigns.add(Math.sign(layer.offsetX));
    shadowResults.push({ name, layers: outer.length, maxBlur, offsetY });
    if (offsetY < 0) {
      findings.push(processFinding('CRAFT_SHADOW_LIGHT_FROM_BELOW', 'medium', `Shadow ${name} has a negative vertical offset, describing a light source below the interface.`, { path: name }));
    }
    if (maxBlur >= highElevationBlurPx && outer.length < minShadowLayers) {
      findings.push(processFinding('CRAFT_SHADOW_SINGLE_LAYER', 'low', `Shadow ${name} uses a single ${maxBlur}px layer at high elevation. A considered shadow pairs a tight contact layer with a wide ambient layer.`, { path: name }));
    }
    if (maxBlur > 0 && offsetY > maxBlur) {
      findings.push(processFinding('CRAFT_SHADOW_OFFSET_EXCEEDS_BLUR', 'low', `Shadow ${name} offsets further (${offsetY}px) than it blurs (${maxBlur}px), which reads as a duplicated shape rather than a shadow.`, { path: name }));
    }
  }
  if (horizontalSigns.size > 1) {
    findings.push(processFinding('CRAFT_SHADOW_LIGHT_SOURCE_INCONSISTENT', 'medium', 'Shadows use horizontal offsets in both directions, so the interface describes more than one light source.'));
  }

  const elevationLevels = Number(input.elevationLevels ?? shadowResults.length);
  if (Number.isFinite(elevationLevels) && elevationLevels > maxElevationLevels) {
    findings.push(processFinding('CRAFT_ELEVATION_VOCABULARY_EXCESSIVE', 'low', `${elevationLevels} elevation levels are defined but policy allows ${maxElevationLevels}. Levels beyond the distinguishable range are decorative.`));
  }

  const doubled = Array.isArray(input.borderAndShadowElements) ? input.borderAndShadowElements : [];
  if (doubled.length) {
    evidenceCount += 1;
    findings.push(processFinding('CRAFT_BORDER_AND_SHADOW_REDUNDANT', 'low', 'Elements carry both a visible border and a shadow on the same edge, producing a heavy redundant boundary.', { detail: doubled.slice(0, 20) }));
  }

  const hairlines = Array.isArray(input.borderWidthsPx) ? input.borderWidthsPx.map(Number).filter(Number.isFinite) : [];
  if (hairlines.some((value) => value > 0 && value < 1)) {
    findings.push(processFinding('CRAFT_SUBPIXEL_BORDER', 'low', 'A sub-pixel border width is in use, which renders inconsistently across device pixel ratios and produces uneven line weight.'));
  }

  const icons = input.icons && typeof input.icons === 'object' ? input.icons : null;
  if (icons) {
    evidenceCount += 1;
    const families = [...new Set((icons.families ?? []).map(String))];
    if (families.length > 1) {
      findings.push(processFinding('CRAFT_ICON_FAMILIES_MIXED', 'medium', `Icons come from ${families.length} families. Mixed families are visible immediately even to untrained viewers.`, { detail: families }));
    }
    const strokes = [...new Set((icons.strokeWidthsPx ?? []).map(Number).filter(Number.isFinite))];
    if (strokes.length > 1) {
      findings.push(processFinding('CRAFT_ICON_STROKE_INCONSISTENT', 'low', 'Icons use more than one stroke weight within the same family.', { detail: strokes }));
    }
    const opticalRatios = (icons.opticalRatios ?? []).map(Number).filter(Number.isFinite);
    if (opticalRatios.length >= 2 && Math.max(...opticalRatios) - Math.min(...opticalRatios) > 0.2) {
      findings.push(processFinding('CRAFT_ICON_OPTICAL_SIZE_INCONSISTENT', 'low', 'Glyphs occupy noticeably different fractions of their bounding boxes, so icons of the same nominal size appear different sizes.'));
    }
  }

  if (input.typographicCharacters === false) {
    findings.push(processFinding('CRAFT_TYPOGRAPHIC_CHARACTERS_MISSING', 'low', 'Straight quotes, hyphens used as dashes, or the letter x used as a multiplication sign are present. Use true typographic characters.'));
  }
  if (input.opticalAlignmentApplied === false) {
    findings.push(processFinding('CRAFT_OPTICAL_ALIGNMENT_MISSING', 'low', 'Icons and text are centred geometrically rather than optically, so glyphs with uneven mass sit off centre.'));
  }
  if (input.imagesHaveIntrinsicDimensions === false) {
    findings.push(processFinding('CRAFT_IMAGE_DIMENSIONS_MISSING', 'medium', 'Images lack intrinsic dimensions, so layout shifts during load.'));
  }
  if (input.gradientInterpolation === 'srgb' && input.gradientHueSpanDegrees > 30) {
    findings.push(processFinding('CRAFT_GRADIENT_MUDDY_MIDPOINT', 'low', 'A multi-hue gradient interpolates in sRGB, which desaturates the midpoint. Interpolate in a perceptual space.'));
  }

  const report = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount > 0 ? 100 : 0 });
  return { ...report, radii, nestedRadii: nestingResults, shadows: shadowResults, elevationLevels: Number.isFinite(elevationLevels) ? elevationLevels : null };
}
