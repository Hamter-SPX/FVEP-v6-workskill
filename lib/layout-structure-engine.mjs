/**
 * Ref layout structure memory for vision-in-the-loop.
 * Capture the skeleton of the desired screenshot (ref), persist it, then
 * check cur against that remembered structure until it matches.
 */

import {
  asciiMapFromImage,
  asciiMapFromPngFile,
  loadPngImage
} from './ascii-map-engine.mjs';

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be a finite number.`);
  return number;
}

export function normalizeNamedRegion(region, index = 0) {
  if (!region || typeof region !== 'object') throw new TypeError(`Region ${index} must be an object.`);
  const name = String(region.name || `region-${index + 1}`).trim();
  if (!name) throw new TypeError(`Region ${index} needs a name.`);
  const x = Math.floor(finite(region.x ?? region.rect?.x, `${name}.x`));
  const y = Math.floor(finite(region.y ?? region.rect?.y, `${name}.y`));
  const width = Math.floor(finite(region.width ?? region.w ?? region.rect?.width, `${name}.width`));
  const height = Math.floor(finite(region.height ?? region.h ?? region.rect?.height, `${name}.height`));
  if (width <= 0 || height <= 0) throw new RangeError(`${name} width/height must be positive.`);
  return { name, x, y, width, height };
}

function relativeBox(rect, pageWidth, pageHeight) {
  return {
    x: Number((rect.x / pageWidth).toFixed(6)),
    y: Number((rect.y / pageHeight).toFixed(6)),
    width: Number((rect.width / pageWidth).toFixed(6)),
    height: Number((rect.height / pageHeight).toFixed(6)),
    cx: Number(((rect.x + rect.width / 2) / pageWidth).toFixed(6)),
    cy: Number(((rect.y + rect.height / 2) / pageHeight).toFixed(6))
  };
}

function measureRegion(image, region, { cols = 24, rows = 12, invert = true } = {}) {
  const map = asciiMapFromImage(image, {
    rect: region,
    cols,
    rows,
    ramp: 'digits',
    invert
  });
  return {
    name: region.name,
    rect: { x: region.x, y: region.y, width: region.width, height: region.height },
    relative: relativeBox(region, image.width, image.height),
    centroid: map.centroid,
    ascii: map.ascii,
    cols: map.cols,
    rows: map.rows
  };
}

function pairRelations(elements) {
  const relations = [];
  for (let i = 0; i < elements.length; i += 1) {
    for (let j = i + 1; j < elements.length; j += 1) {
      const a = elements[i];
      const b = elements[j];
      relations.push({
        from: a.name,
        to: b.name,
        dx: b.rect.x - a.rect.x,
        dy: b.rect.y - a.rect.y,
        gapX: b.rect.x - (a.rect.x + a.rect.width),
        gapY: b.rect.y - (a.rect.y + a.rect.height),
        alignLeft: Math.abs(a.rect.x - b.rect.x),
        alignTop: Math.abs(a.rect.y - b.rect.y),
        alignCenterX: Math.abs((a.rect.x + a.rect.width / 2) - (b.rect.x + b.rect.width / 2)),
        alignCenterY: Math.abs((a.rect.y + a.rect.height / 2) - (b.rect.y + b.rect.height / 2))
      });
    }
  }
  return relations;
}

/**
 * Remember the layout skeleton of a ref image from named region boxes.
 */
export function rememberLayoutStructure(image, regions, options = {}) {
  const named = (regions || []).map((region, index) => normalizeNamedRegion(region, index));
  if (!named.length) throw new TypeError('At least one named region is required to remember structure.');
  const elements = named.map((region) => measureRegion(image, region, options));
  const page = { width: image.width, height: image.height };
  return {
    schemaVersion: 1,
    role: 'ref-structure',
    purpose: 'Desired layout skeleton. Fix cur until it matches this structure.',
    page,
    createdAt: new Date().toISOString(),
    options: {
      cols: options.cols ?? 24,
      rows: options.rows ?? 12,
      invert: options.invert !== false,
      tolerancePx: options.tolerancePx ?? 4
    },
    elements,
    relations: pairRelations(elements),
    summary: elements.map((el) => ({
      name: el.name,
      rect: el.rect,
      relative: el.relative
    }))
  };
}

export async function rememberLayoutStructureFromPng(filePath, regions, options = {}) {
  const image = await loadPngImage(filePath);
  const structure = rememberLayoutStructure(image, regions, options);
  return { ...structure, source: { role: 'ref', path: filePath } };
}

/**
 * Measure the same named regions on cur and compare against remembered ref structure.
 */
export function checkLayoutStructure(structure, image, regions, options = {}) {
  if (!structure?.elements?.length) throw new TypeError('Structure must include remembered elements.');
  const tolerancePx = Number(options.tolerancePx ?? structure.options?.tolerancePx ?? 4);
  const named = (regions || structure.elements.map((el) => ({ name: el.name, ...el.rect })))
    .map((region, index) => normalizeNamedRegion(region, index));
  const byName = new Map(named.map((region) => [region.name, region]));
  const findings = [];
  const currentElements = [];

  for (const expected of structure.elements) {
    const region = byName.get(expected.name);
    if (!region) {
      findings.push({
        severity: 'blocker',
        name: expected.name,
        reason: 'missing-region',
        message: `Region "${expected.name}" is in ref structure but missing from cur measurement.`
      });
      continue;
    }
    const measured = measureRegion(image, region, {
      cols: structure.options?.cols,
      rows: structure.options?.rows,
      invert: structure.options?.invert
    });
    currentElements.push(measured);

    const dx = measured.rect.x - expected.rect.x;
    const dy = measured.rect.y - expected.rect.y;
    const dw = measured.rect.width - expected.rect.width;
    const dh = measured.rect.height - expected.rect.height;
    const positionOk = Math.abs(dx) <= tolerancePx && Math.abs(dy) <= tolerancePx;
    const sizeOk = Math.abs(dw) <= tolerancePx && Math.abs(dh) <= tolerancePx;

    if (!positionOk || !sizeOk) {
      findings.push({
        severity: !sizeOk ? 'blocker' : 'major',
        name: expected.name,
        reason: !sizeOk ? 'scale-mismatch' : 'locate-mismatch',
        message: `"${expected.name}" locate/scale differs from ref.`,
        expected: expected.rect,
        current: measured.rect,
        delta: { dx, dy, dw, dh },
        fixHint: [
          !positionOk ? `move ${expected.name} by dx=${-dx} dy=${-dy}` : null,
          !sizeOk ? `scale ${expected.name} by dw=${-dw} dh=${-dh}` : null
        ].filter(Boolean).join('; ')
      });
    } else {
      findings.push({
        severity: 'accepted',
        name: expected.name,
        reason: 'within-tolerance',
        delta: { dx, dy, dw, dh }
      });
    }
  }

  const pageDelta = {
    width: image.width - structure.page.width,
    height: image.height - structure.page.height
  };
  if (pageDelta.width !== 0 || pageDelta.height !== 0) {
    findings.push({
      severity: 'major',
      name: 'page',
      reason: 'page-size-differs',
      message: 'cur page size differs from remembered ref page size.',
      expected: structure.page,
      current: { width: image.width, height: image.height },
      delta: pageDelta
    });
  }

  const worst = findings.some((f) => f.severity === 'blocker')
    ? 'blocker'
    : findings.some((f) => f.severity === 'major')
      ? 'major'
      : 'accepted';

  return {
    ok: worst === 'accepted',
    severity: worst,
    tolerancePx,
    page: { width: image.width, height: image.height },
    expectedPage: structure.page,
    elements: currentElements,
    findings,
    nextActions: findings
      .filter((f) => f.severity !== 'accepted')
      .map((f) => f.fixHint || f.message)
  };
}

export async function checkLayoutStructureFromPng(structure, filePath, regions, options = {}) {
  const image = await loadPngImage(filePath);
  const result = checkLayoutStructure(structure, image, regions, options);
  return { ...result, source: { role: 'cur', path: filePath } };
}

export function formatStructureReport(structure) {
  const lines = [
    '=== REF STRUCTURE (remembered) ===',
    `page=${structure.page.width}x${structure.page.height}  elements=${structure.elements.length}`,
    ''
  ];
  for (const el of structure.elements) {
    lines.push(
      `${el.name}: x=${el.rect.x} y=${el.rect.y} ${el.rect.width}x${el.rect.height}`
      + `  rel=(${el.relative.x},${el.relative.y})`
    );
  }
  if (structure.relations?.length) {
    lines.push('', 'relations:');
    for (const rel of structure.relations.slice(0, 12)) {
      lines.push(`  ${rel.from} → ${rel.to}: dx=${rel.dx} dy=${rel.dy} gapX=${rel.gapX} gapY=${rel.gapY}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

export function formatStructureCheckReport(result) {
  const lines = [
    '=== CUR vs REMEMBERED REF ===',
    `ok=${result.ok}  severity=${result.severity}  tolerancePx=${result.tolerancePx}`,
    ''
  ];
  for (const finding of result.findings) {
    const delta = finding.delta
      ? ` dx=${finding.delta.dx} dy=${finding.delta.dy} dw=${finding.delta.dw ?? 0} dh=${finding.delta.dh ?? 0}`
      : '';
    lines.push(`[${finding.severity}] ${finding.name}: ${finding.reason}${delta}`);
    if (finding.fixHint) lines.push(`  fix: ${finding.fixHint}`);
  }
  if (result.nextActions?.length) {
    lines.push('', 'next:');
    for (const action of result.nextActions) lines.push(`- ${action}`);
  }
  return `${lines.join('\n')}\n`;
}

export async function asciiFingerprintRegion(filePath, region, options = {}) {
  return asciiMapFromPngFile(filePath, {
    rect: normalizeNamedRegion(region),
    cols: options.cols ?? 24,
    rows: options.rows ?? 12,
    ramp: 'digits',
    invert: options.invert !== false
  });
}

function sleep(ms, sleepFn = (delay) => new Promise((resolve) => setTimeout(resolve, delay))) {
  return sleepFn(ms);
}

/**
 * Keep checking cur against remembered ref structure.
 * When it matches, run onMatch (capture) once, then stop.
 */
export async function watchUntilMatch(options = {}) {
  const checkOnce = options.checkOnce;
  if (typeof checkOnce !== 'function') throw new TypeError('checkOnce callback is required.');
  const maxRounds = Math.max(1, Math.floor(Number(options.maxRounds) || 120));
  const intervalMs = Math.max(50, Math.floor(Number(options.intervalMs) || 1000));
  const sleepFn = options.sleepFn;
  const onRound = typeof options.onRound === 'function' ? options.onRound : null;
  const onMatch = typeof options.onMatch === 'function' ? options.onMatch : null;
  const shouldContinue = typeof options.shouldContinue === 'function'
    ? options.shouldContinue
    : async () => true;

  const rounds = [];
  for (let round = 1; round <= maxRounds; round += 1) {
    const result = await checkOnce(round);
    const entry = {
      round,
      ok: result?.ok === true,
      severity: result?.severity ?? null,
      nextActions: result?.nextActions ?? [],
      at: new Date().toISOString()
    };
    rounds.push(entry);
    if (onRound) await onRound(entry, result);

    if (result?.ok === true) {
      let capture = null;
      if (onMatch) capture = await onMatch(result, entry);
      return {
        matched: true,
        stopped: 'matched',
        rounds,
        result,
        capture
      };
    }

    if (round >= maxRounds) break;
    if (!(await shouldContinue(entry, result))) {
      return { matched: false, stopped: 'cancelled', rounds, result };
    }
    await sleep(intervalMs, sleepFn);
  }

  return {
    matched: false,
    stopped: 'max-rounds',
    rounds,
    result: rounds.at(-1) ? undefined : null,
    last: rounds.at(-1) ?? null
  };
}
