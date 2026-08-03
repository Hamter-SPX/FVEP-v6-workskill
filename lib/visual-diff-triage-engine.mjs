/**
 * Visual delta triage.
 *
 * `cur` is what the model produced. `ref` is what the user actually wanted.
 * Seeing that they differ is easy; knowing which difference to fix first is the skill.
 *
 * This engine ranks differences in perceptual order — structure, proportion, value,
 * colour, density, polish — and returns exactly one next change, because a loop that
 * edits five variables per round cannot attribute the improvement to anything.
 */

import { measureScene } from './scene-completeness-engine.mjs';

export const STAGE_ORDER = Object.freeze(['structure', 'proportion', 'value', 'colour', 'density', 'polish']);

const STAGE_RANK = Object.freeze(Object.fromEntries(STAGE_ORDER.map((stage, index) => [stage, index])));

const DEFAULT_POLICY = Object.freeze({
  grid: '6x4',
  focalShiftCells: 1,
  zoneLumaDelta: 0.1,
  zoneColourDelta: 24,
  zoneDetailDelta: 0.12,
  globalLumaDelta: 0.06,
  globalColourDelta: 0.08,
  valueStructureDelta: 0.08,
  regionShiftRatio: 0.02,
  regionScaleRatio: 0.1,
  maxZoneReports: 6,
  matchScore: 92,
  minRoundImprovement: 0.02,
  stallRounds: 3
});

function policyWith(policy = {}) {
  const merged = { ...DEFAULT_POLICY };
  for (const [key, value] of Object.entries(policy)) if (value !== undefined && value !== null) merged[key] = value;
  return merged;
}

function round(value, digits = 4) {
  return Number(Number(value).toFixed(digits));
}

function rgbDistance(left = [0, 0, 0], right = [0, 0, 0]) {
  const dr = left[0] - right[0];
  const dg = left[1] - right[1];
  const db = left[2] - right[2];
  return Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(3);
}

function issue(stage, code, message, fix, evidence = {}) {
  if (!STAGE_RANK[stage] && STAGE_RANK[stage] !== 0) throw new TypeError(`Unknown triage stage: ${stage}`);
  return { stage, rank: STAGE_RANK[stage], code, message, fix, evidence };
}

function zoneByName(measurement, name) {
  return (measurement.zones ?? []).find((zone) => zone.name === name) ?? null;
}

function focalDistance(reference, current) {
  const left = zoneByName(reference, reference.summary.focalZone);
  const right = zoneByName(current, current.summary.focalZone);
  if (!left || !right) return 0;
  return Math.hypot(left.col - right.col, left.row - right.row);
}

function normalizeRegions(regions) {
  if (!regions) return [];
  const entries = Array.isArray(regions)
    ? regions.map((region) => [region.name, region])
    : Object.entries(regions);
  return entries.map(([name, value]) => {
    const asRect = (rect) => {
      const list = Array.isArray(rect) ? rect : [rect?.x, rect?.y, rect?.width, rect?.height];
      const [x, y, width, height] = list.map(Number);
      if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
        throw new TypeError(`Region "${name}" needs a rect as [x, y, width, height].`);
      }
      return { x, y, width, height };
    };
    const reference = value?.ref ?? value?.reference ?? value?.rect ?? value;
    const current = value?.cur ?? value?.current ?? reference;
    return { name: String(name), reference: asRect(reference), current: asRect(current) };
  });
}

/** Compares two measured frames and returns an ordered correction plan. */
export function triageVisualDelta({ reference, current, regions } = {}, policyInput = {}) {
  if (!reference?.zones?.length || !current?.zones?.length) {
    throw new TypeError('triageVisualDelta requires measured reference and current frames.');
  }
  if (reference.grid.cols !== current.grid.cols || reference.grid.rows !== current.grid.rows) {
    throw new TypeError('Reference and current measurements must use the same grid.');
  }

  const policy = policyWith(policyInput);
  const issues = [];
  const zoneDeltas = [];

  for (let index = 0; index < reference.zones.length; index += 1) {
    const left = reference.zones[index];
    const right = current.zones[index];
    const lumaDelta = round(right.meanLuma - left.meanLuma);
    const colourDelta = round(rgbDistance(left.meanRgb ?? [0, 0, 0], right.meanRgb ?? [0, 0, 0]), 2);
    const detailDelta = round(right.detail - left.detail);
    zoneDeltas.push({
      zone: left.name,
      band: left.band,
      lumaDelta,
      colourDelta,
      detailDelta,
      total: round(Math.abs(lumaDelta) + colourDelta / 255 + Math.abs(detailDelta))
    });
  }

  const worst = [...zoneDeltas].sort((a, b) => b.total - a.total);

  const shift = round(focalDistance(reference, current), 2);
  if (shift > policy.focalShiftCells) {
    issues.push(issue(
      'structure',
      'FOCAL_ZONE_MOVED',
      `The eye lands in a different place: reference focal zone ${reference.summary.focalZone}, current ${current.summary.focalZone} (${shift} cells apart).`,
      `Move or re-light the subject so the densest, highest-contrast region returns to ${reference.summary.focalZone} before touching colour or texture.`,
      { referenceFocal: reference.summary.focalZone, currentFocal: current.summary.focalZone, cells: shift }
    ));
  }

  for (const region of normalizeRegions(regions)) {
    const dx = region.current.x - region.reference.x;
    const dy = region.current.y - region.reference.y;
    const shiftRatioX = Math.abs(dx) / Math.max(1, reference.page.width);
    const shiftRatioY = Math.abs(dy) / Math.max(1, reference.page.height);
    if (shiftRatioX > policy.regionShiftRatio || shiftRatioY > policy.regionShiftRatio) {
      issues.push(issue(
        'structure',
        'REGION_POSITION_DRIFT',
        `Region "${region.name}" sits ${dx >= 0 ? '+' : ''}${dx}px horizontally and ${dy >= 0 ? '+' : ''}${dy}px vertically from the reference.`,
        `Move "${region.name}" by ${-dx}px x and ${-dy}px y, then re-capture before changing anything else.`,
        { region: region.name, dx, dy }
      ));
    }
    const widthRatio = region.current.width / region.reference.width;
    const heightRatio = region.current.height / region.reference.height;
    if (Math.abs(widthRatio - 1) > policy.regionScaleRatio || Math.abs(heightRatio - 1) > policy.regionScaleRatio) {
      issues.push(issue(
        'proportion',
        'REGION_SCALE_DRIFT',
        `Region "${region.name}" is ${round(widthRatio, 3)}x wide and ${round(heightRatio, 3)}x tall relative to the reference.`,
        `Resize "${region.name}" to ${region.reference.width}x${region.reference.height}px (or the equivalent layout constraint) rather than nudging spacing around it.`,
        { region: region.name, widthRatio: round(widthRatio, 3), heightRatio: round(heightRatio, 3) }
      ));
    }
  }

  const lumaDelta = round(current.summary.meanLuma - reference.summary.meanLuma);
  if (Math.abs(lumaDelta) > policy.globalLumaDelta) {
    issues.push(issue(
      'value',
      'GLOBAL_BRIGHTNESS_OFF',
      `The whole frame is ${lumaDelta > 0 ? 'brighter' : 'darker'} than the reference by ${Math.abs(lumaDelta)} luma.`,
      `Correct overall exposure or surface lightness first; every local judgement below depends on it.`,
      { lumaDelta }
    ));
  }

  const darkDelta = round(current.summary.darkRatio - reference.summary.darkRatio);
  const lightDelta = round(current.summary.lightRatio - reference.summary.lightRatio);
  if (Math.abs(darkDelta) > policy.valueStructureDelta || Math.abs(lightDelta) > policy.valueStructureDelta) {
    issues.push(issue(
      'value',
      'VALUE_STRUCTURE_OFF',
      `Shadow and highlight distribution differs (dark ${darkDelta >= 0 ? '+' : ''}${darkDelta}, light ${lightDelta >= 0 ? '+' : ''}${lightDelta}).`,
      darkDelta < 0
        ? 'Deepen the shadow anchors; the current frame is missing the darks that give the reference its weight.'
        : 'Recover highlights or reduce crushed shadows so the value ladder matches the reference.',
      { darkDelta, lightDelta }
    ));
  }

  const colourZones = worst.filter((zone) => zone.colourDelta > policy.zoneColourDelta).slice(0, policy.maxZoneReports);
  if (colourZones.length) {
    issues.push(issue(
      'colour',
      'ZONE_COLOUR_DRIFT',
      `${colourZones.length} zone(s) differ in hue or saturation beyond tolerance: ${colourZones.map((zone) => `${zone.zone}(${zone.colourDelta})`).join(', ')}.`,
      `Rebind those zones to the palette from the reference, starting with ${colourZones[0].zone}.`,
      { zones: colourZones }
    ));
  }

  const chromaDelta = round(
    (current.zones.reduce((sum, zone) => sum + zone.colourfulness, 0) / current.zones.length)
    - (reference.zones.reduce((sum, zone) => sum + zone.colourfulness, 0) / reference.zones.length)
  );
  if (Math.abs(chromaDelta) > policy.globalColourDelta) {
    issues.push(issue(
      'colour',
      'GLOBAL_SATURATION_OFF',
      `Overall colourfulness is ${chromaDelta > 0 ? 'higher' : 'lower'} than the reference by ${Math.abs(chromaDelta)}.`,
      chromaDelta > 0 ? 'Desaturate toward the reference palette instead of repainting individual elements.' : 'Raise chroma on the palette anchors rather than boosting everything globally.',
      { chromaDelta }
    ));
  }

  const densityZones = worst.filter((zone) => Math.abs(zone.detailDelta) > policy.zoneDetailDelta).slice(0, policy.maxZoneReports);
  if (densityZones.length) {
    const missing = densityZones.filter((zone) => zone.detailDelta < 0);
    issues.push(issue(
      'density',
      'ZONE_DETAIL_DELTA',
      `${densityZones.length} zone(s) carry the wrong amount of detail: ${densityZones.map((zone) => `${zone.zone}(${zone.detailDelta >= 0 ? '+' : ''}${zone.detailDelta})`).join(', ')}.`,
      missing.length
        ? `Add the missing content in ${missing[0].zone} — the reference has material there that the current frame abandoned.`
        : `Simplify ${densityZones[0].zone}; the current frame is busier than the reference and steals attention.`,
      { zones: densityZones }
    ));
  }

  const lumaZones = worst.filter((zone) => Math.abs(zone.lumaDelta) > policy.zoneLumaDelta).slice(0, policy.maxZoneReports);
  if (lumaZones.length && !issues.some((item) => item.stage === 'value')) {
    issues.push(issue(
      'value',
      'ZONE_BRIGHTNESS_DELTA',
      `${lumaZones.length} zone(s) differ in local brightness: ${lumaZones.map((zone) => `${zone.zone}(${zone.lumaDelta >= 0 ? '+' : ''}${zone.lumaDelta})`).join(', ')}.`,
      `Match local lighting in ${lumaZones[0].zone} before adjusting its colour or texture.`,
      { zones: lumaZones }
    ));
  }

  const residual = worst.filter((zone) => zone.total > 0.02 && zone.total <= 0.08);
  if (!issues.length && residual.length) {
    issues.push(issue(
      'polish',
      'RESIDUAL_DELTA',
      `Only small residual differences remain (largest ${residual[0].zone} at ${residual[0].total}).`,
      'Decide explicitly whether this residual is acceptable, then stop iterating.',
      { zones: residual.slice(0, policy.maxZoneReports) }
    ));
  }

  issues.sort((a, b) => a.rank - b.rank || a.code.localeCompare(b.code));

  const totalDelta = round(zoneDeltas.reduce((sum, zone) => sum + zone.total, 0) / zoneDeltas.length);
  const score = Math.max(0, Math.min(100, Math.round(100 - totalDelta * 180)));
  const blocking = issues.filter((item) => item.stage !== 'polish');
  const matched = blocking.length === 0 && score >= policy.matchScore;

  return {
    schemaVersion: 1,
    verdict: matched ? 'match' : 'iterate',
    matched,
    score,
    totalDelta,
    grid: reference.grid,
    stages: STAGE_ORDER.filter((stage) => issues.some((item) => item.stage === stage)),
    issues,
    nextAction: issues.length
      ? {
          stage: issues[0].stage,
          code: issues[0].code,
          change: issues[0].fix,
          rule: 'Change this one thing, re-capture, and re-run the triage. Do not batch fixes across stages.'
        }
      : null,
    zoneDeltas,
    worstZones: worst.slice(0, policy.maxZoneReports),
    summary: {
      reference: reference.summary,
      current: current.summary,
      lumaDelta,
      chromaDelta,
      focalShiftCells: shift
    },
    policy
  };
}

/** Detects a loop that keeps editing without getting closer. */
export function evaluateLoopProgress(history = [], policyInput = {}) {
  const policy = policyWith(policyInput);
  const rounds = history
    .map((entry, index) => ({
      round: Number(entry.round ?? index + 1),
      totalDelta: Number(entry.totalDelta ?? entry.delta ?? NaN),
      change: entry.change ?? entry.nextAction?.change ?? null
    }))
    .filter((entry) => Number.isFinite(entry.totalDelta));

  if (rounds.length < policy.stallRounds) {
    return { stalled: false, rounds: rounds.length, improvement: null, recommendation: null };
  }

  const window = rounds.slice(-policy.stallRounds);
  const improvement = round(window[0].totalDelta - window[window.length - 1].totalDelta);
  const stalled = improvement < policy.minRoundImprovement;

  return {
    stalled,
    rounds: rounds.length,
    improvement,
    window,
    recommendation: stalled
      ? 'Three rounds produced no measurable convergence. Stop guessing: re-read the reference at region level, restate what the user actually asked for, and question whether the current structure can ever reach it.'
      : null
  };
}

export function renderDeltaHeatmap(result) {
  const { cols, rows } = result.grid;
  const lines = [];
  for (let row = 0; row < rows; row += 1) {
    let line = '';
    for (let col = 0; col < cols; col += 1) {
      const delta = result.zoneDeltas[row * cols + col];
      line += String(Math.min(9, Math.round((delta?.total ?? 0) * 18)));
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export function formatTriageReport(result) {
  const lines = [
    '=== VISUAL DELTA TRIAGE (ref vs cur) ===',
    `verdict=${result.verdict}  score=${result.score}  meanDelta=${result.totalDelta}`,
    `focal: ref=${result.summary.reference.focalZone} cur=${result.summary.current.focalZone} shift=${result.summary.focalShiftCells} cells`,
    '',
    'delta heatmap (0 identical → 9 far off):',
    renderDeltaHeatmap(result)
  ];

  if (result.issues.length) {
    lines.push('', 'ordered corrections (perceptual priority):');
    result.issues.forEach((item, index) => {
      lines.push(`${index + 1}. [${item.stage}] ${item.code}: ${item.message}`, `   fix: ${item.fix}`);
    });
    lines.push('', `NEXT SINGLE CHANGE → ${result.nextAction.change}`, `rule: ${result.nextAction.rule}`);
  } else {
    lines.push('', 'No differences above tolerance. The current render matches the reference.');
  }
  return `${lines.join('\n')}\n`;
}

export async function measureFrameFromPng(filePath, options = {}) {
  const fs = await import('node:fs/promises');
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await fs.readFile(filePath));
  return measureScene({ width: png.width, height: png.height, data: png.data }, options);
}
