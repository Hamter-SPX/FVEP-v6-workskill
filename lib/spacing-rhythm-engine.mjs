import { finalizeProcessAudit, processFinding } from './process-audit-utils.mjs';

function round(value, digits = 2) { return Number(Number(value).toFixed(digits)); }

function numericArray(values = []) {
  return values.map(Number).filter((value) => Number.isFinite(value) && value >= 0);
}

/** Returns the observed values that do not resolve to the declared scale or to a base-unit multiple. */
export function findOffScaleValues(observed = [], scale = [], baseUnitPx = 0, tolerancePx = 0.5) {
  const allowed = new Set(numericArray(scale));
  const base = Number(baseUnitPx);
  const offScale = [];
  for (const entry of observed) {
    const value = Number(entry?.valuePx ?? entry);
    if (!Number.isFinite(value) || value === 0) continue;
    const onScale = [...allowed].some((candidate) => Math.abs(candidate - value) <= tolerancePx);
    const onBase = Number.isFinite(base) && base > 0 && Math.abs(value / base - Math.round(value / base)) * base <= tolerancePx;
    if (!onScale && !onBase) offScale.push({ region: String(entry?.region ?? 'unnamed'), context: entry?.context ? String(entry.context) : null, valuePx: round(value) });
  }
  return offScale;
}

export function analyzeSpacingSystem(input = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const maxScaleSize = Number(policy.maxScaleSize ?? 12);
  const minScaleSize = Number(policy.minScaleSize ?? 4);
  const minGroupRatio = Number(policy.minGroupRatio ?? 1.5);
  const maxOffScaleRatio = Number(policy.maxOffScaleRatio ?? 0.1);
  const tolerancePx = Number(policy.tolerancePx ?? 0.5);

  const scale = numericArray(input.scale ?? []).sort((a, b) => a - b);
  const baseUnitPx = Number(input.baseUnitPx ?? 0);

  if (!scale.length) {
    findings.push(processFinding('SPACING_SCALE_MISSING', 'high', 'No spacing scale is declared, so spacing conformance cannot be assessed.'));
  } else {
    evidenceCount += 1;
    if (scale.length > maxScaleSize) {
      findings.push(processFinding('SPACING_SCALE_TOO_LARGE', 'medium', `${scale.length} spacing values are declared but policy allows ${maxScaleSize}. A scale this large is being chosen per component.`, { detail: scale }));
    }
    if (scale.length < minScaleSize) {
      findings.push(processFinding('SPACING_SCALE_TOO_SMALL', 'low', `Only ${scale.length} spacing values are declared, which forces the same gap to express both grouping and separation.`));
    }
    if (Number.isFinite(baseUnitPx) && baseUnitPx > 0) {
      const offBase = scale.filter((value) => Math.abs(value / baseUnitPx - Math.round(value / baseUnitPx)) * baseUnitPx > tolerancePx);
      if (offBase.length) {
        findings.push(processFinding('SPACING_SCALE_OFF_BASE_UNIT', 'low', `Scale values do not resolve to the ${baseUnitPx}px base unit.`, { detail: offBase }));
      }
    }
  }

  const observed = Array.isArray(input.observed) ? input.observed : [];
  const offScale = findOffScaleValues(observed, scale, baseUnitPx, tolerancePx);
  if (observed.length) {
    evidenceCount += 1;
    const ratio = offScale.length / observed.length;
    if (ratio > maxOffScaleRatio) {
      findings.push(processFinding('SPACING_OFF_SCALE_DRIFT', 'medium', `${offScale.length} of ${observed.length} observed spacing values do not resolve to the scale (${round(ratio * 100)}%, policy ${round(maxOffScaleRatio * 100)}%).`, { detail: offScale.slice(0, 20), remediation: 'Replace arbitrary values with scale steps, or document the optical correction that justifies each exception.' }));
    } else if (offScale.length) {
      findings.push(processFinding('SPACING_OFF_SCALE_EXCEPTIONS', 'low', `${offScale.length} observed spacing values sit off the scale.`, { detail: offScale.slice(0, 20) }));
    }
  }

  const groups = Array.isArray(input.groups) ? input.groups : [];
  const groupResults = [];
  for (const group of groups) {
    const within = Number(group.withinPx);
    const between = Number(group.betweenPx);
    if (!Number.isFinite(within) || !Number.isFinite(between) || within <= 0) continue;
    evidenceCount += 1;
    const ratio = round(between / within);
    const ok = ratio >= minGroupRatio;
    groupResults.push({ name: String(group.name ?? 'unnamed'), withinPx: round(within), betweenPx: round(between), ratio, ok });
    if (between <= within) {
      findings.push(processFinding('SPACING_PROXIMITY_INVERTED', 'blocker', `Group ${group.name ?? 'unnamed'} separates its members by ${round(within)}px and separates groups by ${round(between)}px, so the perceived structure is inverted.`, { path: group.name ? String(group.name) : undefined, remediation: 'Increase the between-group gap so it clearly exceeds the within-group gap.' }));
    } else if (!ok) {
      findings.push(processFinding('SPACING_PROXIMITY_AMBIGUOUS', 'medium', `Group ${group.name ?? 'unnamed'} has a between-to-within ratio of ${ratio}, below the ${minGroupRatio} needed for grouping to read at a glance.`, { path: group.name ? String(group.name) : undefined }));
    }
  }

  const nesting = Array.isArray(input.nesting) ? input.nesting : [];
  for (const level of nesting) {
    const outer = Number(level.outerPx);
    const inner = Number(level.innerPx);
    if (!Number.isFinite(outer) || !Number.isFinite(inner)) continue;
    evidenceCount += 1;
    if (inner > outer) {
      findings.push(processFinding('SPACING_NESTING_INVERTED', 'medium', `Nested padding in ${level.name ?? 'a container'} is larger inside (${round(inner)}px) than outside (${round(outer)}px), which inverts perceived depth.`, { path: level.name ? String(level.name) : undefined }));
    }
  }

  const responsive = input.responsive && typeof input.responsive === 'object' ? input.responsive : null;
  if (responsive) {
    evidenceCount += 1;
    const desktopMacro = Number(responsive.desktopMacroPx);
    const mobileMacro = Number(responsive.mobileMacroPx);
    if (Number.isFinite(desktopMacro) && Number.isFinite(mobileMacro) && mobileMacro >= desktopMacro) {
      findings.push(processFinding('SPACING_MACRO_NOT_COMPRESSED', 'medium', `Macro spacing does not compress at narrow widths (${round(desktopMacro)}px desktop against ${round(mobileMacro)}px mobile), so desktop section gaps consume a large fraction of a small screen.`));
    }
    const desktopMicro = Number(responsive.desktopMicroPx);
    const mobileMicro = Number(responsive.mobileMicroPx);
    if (Number.isFinite(desktopMicro) && Number.isFinite(mobileMicro) && Math.abs(desktopMicro - mobileMicro) > desktopMicro * 0.5) {
      findings.push(processFinding('SPACING_MICRO_UNSTABLE', 'low', 'Micro spacing changes substantially across viewports. Micro spacing is governed by legibility and target size rather than available width.'));
    }
  }

  const alignmentEdges = Number(input.alignmentEdgeCount);
  const maxAlignmentEdges = Number(policy.maxAlignmentEdges ?? 6);
  if (Number.isFinite(alignmentEdges)) {
    evidenceCount += 1;
    if (alignmentEdges > maxAlignmentEdges) {
      findings.push(processFinding('SPACING_ALIGNMENT_EDGES_EXCESSIVE', 'medium', `${alignmentEdges} distinct alignment edges were observed but policy allows ${maxAlignmentEdges}. Many edges read as disorder even when each element is individually placed with care.`));
    }
  }

  const report = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount > 0 ? 100 : 0 });
  return {
    ...report,
    scale,
    baseUnitPx: Number.isFinite(baseUnitPx) && baseUnitPx > 0 ? baseUnitPx : null,
    offScale,
    offScaleRatio: observed.length ? round(offScale.length / observed.length, 4) : null,
    groups: groupResults,
    density: input.density ? String(input.density) : null
  };
}
