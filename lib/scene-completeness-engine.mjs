/**
 * Scene completeness for game frames and rendered worlds.
 *
 * A frame can have a beautiful hero asset in the centre and still fail, because the
 * corners are empty, the background is a flat wall, the same tile is copy-pasted, or
 * the value structure is mush. This engine measures the whole frame zone by zone so
 * "every corner is detailed" becomes evidence instead of an impression.
 */

import { finalizeProcessAudit, processFinding, nonEmpty } from './process-audit-utils.mjs';

const VAGUE_BRIEF = /\b(nice|cool|awesome|beautiful|epic|amazing|good looking|stunning|next[- ]gen|aaa quality)\b/i;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function assertImage(image) {
  const width = Number(image?.width);
  const height = Number(image?.height);
  const data = image?.data;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new TypeError('Scene image width and height must be positive integers.');
  }
  if (!data || typeof data.length !== 'number' || data.length < width * height * 4) {
    throw new TypeError('Scene image data must contain RGBA bytes for every pixel.');
  }
  return { width, height, data };
}

export function parseGrid(value, fallback = { cols: 6, rows: 4 }) {
  if (value == null || value === '') return { ...fallback };
  const text = String(value).toLowerCase().replace(/\s+/g, '');
  const match = text.match(/^(\d+)[x×](\d+)$/);
  if (!match) throw new TypeError(`Grid must look like 6x4, received "${value}".`);
  const cols = Number(match[1]);
  const rows = Number(match[2]);
  if (cols < 2 || rows < 2 || cols > 24 || rows > 24) throw new RangeError('Grid columns and rows must be between 2 and 24.');
  return { cols, rows };
}

function luma(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Hasler–Süsstrunk colourfulness, normalized into roughly 0..1 for UI/game frames. */
function colourfulness(rgMean, rgStd, ybMean, ybStd) {
  const stdRoot = Math.sqrt((rgStd ** 2) + (ybStd ** 2));
  const meanRoot = Math.sqrt((rgMean ** 2) + (ybMean ** 2));
  return clamp01((stdRoot + 0.3 * meanRoot) / 120);
}

function zoneStats(image, x0, y0, x1, y1, step) {
  const { width, data } = image;
  let count = 0;
  let redSum = 0;
  let greenSum = 0;
  let blueSum = 0;
  let lumaSum = 0;
  let lumaSquares = 0;
  let rgSum = 0;
  let rgSquares = 0;
  let ybSum = 0;
  let ybSquares = 0;
  let edgeSum = 0;
  let edgeCount = 0;
  let darkPixels = 0;
  let lightPixels = 0;

  const subCols = 4;
  const subRows = 4;
  const subSums = new Float64Array(subCols * subRows);
  const subCounts = new Float64Array(subCols * subRows);
  const zoneWidth = Math.max(1, x1 - x0);
  const zoneHeight = Math.max(1, y1 - y0);

  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const value = luma(r, g, b);

      redSum += r;
      greenSum += g;
      blueSum += b;
      lumaSum += value;
      lumaSquares += value * value;
      const rg = r - g;
      const yb = 0.5 * (r + g) - b;
      rgSum += rg;
      rgSquares += rg * rg;
      ybSum += yb;
      ybSquares += yb * yb;
      if (value < 0.2) darkPixels += 1;
      if (value > 0.8) lightPixels += 1;
      count += 1;

      const sx = Math.min(subCols - 1, Math.floor(((x - x0) / zoneWidth) * subCols));
      const sy = Math.min(subRows - 1, Math.floor(((y - y0) / zoneHeight) * subRows));
      const cell = sy * subCols + sx;
      subSums[cell] += value;
      subCounts[cell] += 1;

      if (x + step < x1) {
        const right = (y * width + (x + step)) * 4;
        edgeSum += Math.abs(value - luma(data[right], data[right + 1], data[right + 2]));
        edgeCount += 1;
      }
      if (y + step < y1) {
        const below = ((y + step) * width + x) * 4;
        edgeSum += Math.abs(value - luma(data[below], data[below + 1], data[below + 2]));
        edgeCount += 1;
      }
    }
  }

  if (!count) {
    return {
      meanLuma: 0, lumaStd: 0, edgeDensity: 0, colourfulness: 0, detail: 0,
      darkRatio: 0, lightRatio: 0, meanRgb: [0, 0, 0],
      signature: Array.from({ length: subCols * subRows }, () => 0)
    };
  }

  const meanLuma = lumaSum / count;
  const lumaStd = Math.sqrt(Math.max(0, lumaSquares / count - meanLuma * meanLuma));
  const rgMean = rgSum / count;
  const rgStd = Math.sqrt(Math.max(0, rgSquares / count - rgMean * rgMean));
  const ybMean = ybSum / count;
  const ybStd = Math.sqrt(Math.max(0, ybSquares / count - ybMean * ybMean));
  const edgeDensity = clamp01((edgeCount ? edgeSum / edgeCount : 0) * 6);
  const chroma = colourfulness(rgMean, rgStd, ybMean, ybStd);
  const detail = clamp01(0.55 * edgeDensity + 0.30 * clamp01(lumaStd * 3) + 0.15 * chroma);

  const signature = [];
  for (let index = 0; index < subSums.length; index += 1) {
    signature.push(Number((subCounts[index] ? subSums[index] / subCounts[index] : 0).toFixed(4)));
  }

  return {
    meanLuma: Number(meanLuma.toFixed(4)),
    lumaStd: Number(lumaStd.toFixed(4)),
    edgeDensity: Number(edgeDensity.toFixed(4)),
    colourfulness: Number(chroma.toFixed(4)),
    detail: Number(detail.toFixed(4)),
    darkRatio: Number((darkPixels / count).toFixed(4)),
    lightRatio: Number((lightPixels / count).toFixed(4)),
    meanRgb: [
      Number((redSum / count).toFixed(2)),
      Number((greenSum / count).toFixed(2)),
      Number((blueSum / count).toFixed(2))
    ],
    signature
  };
}

function signatureDistance(left, right) {
  const length = Math.min(left.length, right.length);
  if (!length) return 1;
  let total = 0;
  for (let index = 0; index < length; index += 1) total += Math.abs(left[index] - right[index]);
  return total / length;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Measures every zone of the frame plus global value structure and repetition. */
export function measureScene(image, options = {}) {
  const source = assertImage(image);
  const { cols, rows } = parseGrid(options.grid, {
    cols: Number(options.cols) || 6,
    rows: Number(options.rows) || 4
  });
  const pixels = source.width * source.height;
  const step = Math.max(1, Math.floor(Number(options.sampleStep) || Math.ceil(Math.sqrt(pixels / 240000))));

  const zones = [];
  for (let row = 0; row < rows; row += 1) {
    const y0 = Math.floor((row / rows) * source.height);
    const y1 = Math.max(y0 + 1, Math.floor(((row + 1) / rows) * source.height));
    for (let col = 0; col < cols; col += 1) {
      const x0 = Math.floor((col / cols) * source.width);
      const x1 = Math.max(x0 + 1, Math.floor(((col + 1) / cols) * source.width));
      const stats = zoneStats(source, x0, y0, x1, y1, step);
      const isCorner = (row === 0 || row === rows - 1) && (col === 0 || col === cols - 1);
      const isEdge = !isCorner && (row === 0 || row === rows - 1 || col === 0 || col === cols - 1);
      zones.push({
        name: `${String.fromCharCode(65 + row)}${col + 1}`,
        col,
        row,
        rect: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
        band: isCorner ? 'corner' : isEdge ? 'edge' : 'interior',
        ...stats
      });
    }
  }

  const details = zones.map((zone) => zone.detail);
  const medianDetail = Number(median(details).toFixed(4));
  const maxDetail = Number(Math.max(...details).toFixed(4));
  const minDetail = Number(Math.min(...details).toFixed(4));
  const meanLuma = Number((zones.reduce((sum, zone) => sum + zone.meanLuma, 0) / zones.length).toFixed(4));
  const darkRatio = Number((zones.reduce((sum, zone) => sum + zone.darkRatio, 0) / zones.length).toFixed(4));
  const lightRatio = Number((zones.reduce((sum, zone) => sum + zone.lightRatio, 0) / zones.length).toFixed(4));
  const midRatio = Number(Math.max(0, 1 - darkRatio - lightRatio).toFixed(4));
  const focal = zones.reduce((best, zone) => (zone.detail > best.detail ? zone : best), zones[0]);

  const repeated = [];
  const repetitionEpsilon = Number(options.repetitionEpsilon ?? 0.012);
  for (let i = 0; i < zones.length; i += 1) {
    for (let j = i + 1; j < zones.length; j += 1) {
      const distance = signatureDistance(zones[i].signature, zones[j].signature);
      if (distance <= repetitionEpsilon && zones[i].detail > 0.02) {
        repeated.push({ left: zones[i].name, right: zones[j].name, distance: Number(distance.toFixed(5)) });
      }
    }
  }

  return {
    schemaVersion: 1,
    page: { width: source.width, height: source.height },
    grid: { cols, rows },
    sampleStep: step,
    zones,
    summary: {
      medianDetail,
      maxDetail,
      minDetail,
      meanLuma,
      darkRatio,
      midRatio,
      lightRatio,
      focalZone: focal.name,
      focalDetail: focal.detail,
      focalRatio: Number((medianDetail ? focal.detail / medianDetail : 0).toFixed(3))
    },
    repeatedZones: repeated
  };
}

/**
 * Turns scene measurements into pass/fail findings.
 * Policy defaults target "readable game frame where no region was abandoned".
 */
export function auditSceneMeasurements(measurement, policy = {}) {
  const findings = [];
  const minZoneDetail = Number(policy.minZoneDetail ?? 0.08);
  const minCornerDetail = Number(policy.minCornerDetail ?? minZoneDetail * 0.75);
  const maxDeadZoneRatio = Number(policy.maxDeadZoneRatio ?? 0.15);
  const minFocalRatio = Number(policy.minFocalRatio ?? 1.35);
  const maxFocalRatio = Number(policy.maxFocalRatio ?? 12);
  const minDarkRatio = Number(policy.minDarkRatio ?? 0.02);
  const minLightRatio = Number(policy.minLightRatio ?? 0.01);
  const maxRepeatedPairs = Number(policy.maxRepeatedPairs ?? 2);
  const allowFlatBackground = policy.allowFlatBackground === true;

  const zones = measurement.zones ?? [];
  if (!zones.length) {
    return {
      ...finalizeProcessAudit([processFinding('SCENE_NO_ZONES', 'blocker', 'Scene measurement produced no zones.')], {
        schemaVersion: 1, evidenceCount: 0, evidenceConfidence: 0
      }),
      measurement
    };
  }

  const deadZones = zones.filter((zone) => zone.detail < (zone.band === 'corner' ? minCornerDetail : minZoneDetail));
  const deadCorners = deadZones.filter((zone) => zone.band === 'corner');
  const deadRatio = deadZones.length / zones.length;

  if (deadCorners.length && !allowFlatBackground) {
    findings.push(processFinding(
      'SCENE_EMPTY_CORNER',
      'blocker',
      `${deadCorners.length} corner zone(s) carry almost no detail: ${deadCorners.map((zone) => zone.name).join(', ')}.`,
      {
        detail: deadCorners.map((zone) => ({ zone: zone.name, detail: zone.detail })),
        remediation: 'Add occlusion, props, wear, lighting falloff, or framing geometry so the corners belong to the world.'
      }
    ));
  }

  if (deadRatio > maxDeadZoneRatio) {
    findings.push(processFinding(
      'SCENE_DEAD_ZONES',
      allowFlatBackground ? 'medium' : 'blocker',
      `${deadZones.length}/${zones.length} zones (${Math.round(deadRatio * 100)}%) fall below the detail floor.`,
      {
        detail: deadZones.map((zone) => zone.name),
        remediation: 'Fill abandoned regions with midground or background content, or reframe the shot.'
      }
    ));
  } else if (deadZones.length) {
    findings.push(processFinding(
      'SCENE_SPARSE_ZONES',
      'low',
      `${deadZones.length} low-detail zone(s) remain: ${deadZones.map((zone) => zone.name).join(', ')}.`,
      { remediation: 'Confirm each is intentional negative space, not an unfinished area.' }
    ));
  }

  const summary = measurement.summary ?? {};
  if (summary.focalRatio < minFocalRatio) {
    findings.push(processFinding(
      'SCENE_NO_FOCAL_HIERARCHY',
      'high',
      `No region leads the eye (focal/median detail ratio ${summary.focalRatio}).`,
      { remediation: 'Raise contrast, density, or lighting on the intended subject so hierarchy is measurable.' }
    ));
  } else if (summary.focalRatio > maxFocalRatio) {
    findings.push(processFinding(
      'SCENE_ISOLATED_SUBJECT',
      'high',
      `One zone carries nearly all detail (ratio ${summary.focalRatio}); the rest of the frame reads unfinished.`,
      { remediation: 'Extend the world around the subject: midground, background layers, and grounded contact.' }
    ));
  }

  if (summary.darkRatio < minDarkRatio || summary.lightRatio < minLightRatio) {
    findings.push(processFinding(
      'SCENE_VALUE_STRUCTURE_FLAT',
      'medium',
      `Value structure is compressed (dark ${summary.darkRatio}, mid ${summary.midRatio}, light ${summary.lightRatio}).`,
      { remediation: 'Introduce real shadow anchors and highlight accents so the frame has depth.' }
    ));
  }

  const repeated = measurement.repeatedZones ?? [];
  if (repeated.length > maxRepeatedPairs) {
    findings.push(processFinding(
      'SCENE_TILING_REPETITION',
      'high',
      `${repeated.length} zone pairs are near-identical, which reads as copy-paste tiling.`,
      {
        detail: repeated.slice(0, 8),
        remediation: 'Vary props, rotation, wear, and lighting between repeated modules.'
      }
    ));
  }

  const evidenceCount = zones.length;
  const audit = finalizeProcessAudit(findings, {
    schemaVersion: 1,
    evidenceCount,
    evidenceConfidence: 100
  });

  return {
    ...audit,
    verdict: audit.hardFailures.length
      ? 'fail-scene-incomplete'
      : audit.warnings.length
        ? 'pass-with-notes'
        : 'pass-scene-complete',
    policy: {
      minZoneDetail, minCornerDetail, maxDeadZoneRatio, minFocalRatio, maxFocalRatio,
      minDarkRatio, minLightRatio, maxRepeatedPairs, allowFlatBackground
    },
    measurement
  };
}

const BRIEF_LAYERS = Object.freeze(['foreground', 'midground', 'background']);

/**
 * Audits the authored intent for a scene. Measurement proves detail exists;
 * the brief proves the detail was designed rather than sprinkled.
 */
export function auditSceneBrief(brief = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;

  if (!nonEmpty(brief.name)) findings.push(processFinding('SCENE_BRIEF_NAME_MISSING', 'blocker', 'Scene brief requires a name.'));
  if (!nonEmpty(brief.fantasy) || String(brief.fantasy).length < 12) {
    findings.push(processFinding('SCENE_BRIEF_FANTASY_WEAK', 'blocker', 'Scene brief requires the player fantasy in one concrete sentence.'));
  } else if (VAGUE_BRIEF.test(brief.fantasy)) {
    findings.push(processFinding('SCENE_BRIEF_FANTASY_VAGUE', 'blocker', 'Scene fantasy uses empty praise words instead of describing the moment.'));
  } else evidenceCount += 1;

  const layers = brief.layers ?? {};
  const missingLayers = BRIEF_LAYERS.filter((layer) => !nonEmpty(layers[layer]));
  if (missingLayers.length) {
    findings.push(processFinding(
      'SCENE_BRIEF_LAYERS_MISSING',
      'blocker',
      `Scene brief must describe every depth layer. Missing: ${missingLayers.join(', ')}.`,
      { remediation: 'Name what occupies foreground, midground, and background so no plane is left empty.' }
    ));
  } else evidenceCount += BRIEF_LAYERS.length;

  if (!nonEmpty(brief.focalPoint)) {
    findings.push(processFinding('SCENE_BRIEF_FOCAL_MISSING', 'blocker', 'Scene brief must name the focal point and how the eye is led to it.'));
  } else evidenceCount += 1;

  if (!nonEmpty(brief.lighting)) {
    findings.push(processFinding('SCENE_BRIEF_LIGHTING_MISSING', 'blocker', 'Scene brief must declare the key light direction and mood.'));
  } else evidenceCount += 1;

  if (!nonEmpty(brief.palette)) {
    findings.push(processFinding('SCENE_BRIEF_PALETTE_MISSING', 'high', 'Scene brief should bind to a palette or aesthetic profile.'));
  } else evidenceCount += 1;

  const storyDetails = Array.isArray(brief.storyDetails) ? brief.storyDetails.filter(nonEmpty) : [];
  const minStoryDetails = Number(policy.minStoryDetails ?? 3);
  if (storyDetails.length < minStoryDetails) {
    findings.push(processFinding(
      'SCENE_BRIEF_STORY_DETAILS_THIN',
      'high',
      `Only ${storyDetails.length} story details declared; at least ${minStoryDetails} keep corners inhabited.`,
      { remediation: 'List wear, debris, signage, tool marks, or inhabitant traces that prove the space is used.' }
    ));
  } else evidenceCount += storyDetails.length;

  if (brief.styleBinding !== undefined && !nonEmpty(brief.styleBinding)) {
    findings.push(processFinding('SCENE_BRIEF_STYLE_EMPTY', 'medium', 'styleBinding is present but empty.'));
  }

  if (brief.negativeSpace !== undefined && !nonEmpty(brief.negativeSpace)) {
    findings.push(processFinding('SCENE_BRIEF_NEGATIVE_SPACE_EMPTY', 'low', 'negativeSpace is present but empty; say where quiet is intentional.'));
  }

  const audit = finalizeProcessAudit(findings, {
    schemaVersion: 1,
    evidenceCount,
    evidenceConfidence: evidenceCount ? 100 : 0
  });

  return { ...audit, brief: { ...brief, storyDetails } };
}

/** Combined gate: authored intent plus measured frame. */
export function auditScene({ image, measurement, brief } = {}, policy = {}) {
  const measured = measurement ?? (image ? measureScene(image, policy) : null);
  const measurementAudit = measured ? auditSceneMeasurements(measured, policy) : null;
  const briefAudit = brief ? auditSceneBrief(brief, policy) : null;

  const findings = [
    ...(briefAudit?.findings ?? []).map((finding) => ({ ...finding, section: 'brief' })),
    ...(measurementAudit?.findings ?? []).map((finding) => ({ ...finding, section: 'frame' }))
  ];

  if (!measurementAudit && !briefAudit) {
    findings.push(processFinding('SCENE_NO_INPUT', 'blocker', 'auditScene requires an image, a measurement, or a brief.'));
  }
  if (!measurementAudit && briefAudit) {
    findings.push(processFinding(
      'SCENE_FRAME_EVIDENCE_MISSING',
      'high',
      'Scene brief was audited without a rendered frame; detail coverage is unproven.',
      { remediation: 'Capture the frame and re-run with --image so corners are measured.' }
    ));
  }

  const audit = finalizeProcessAudit(findings, {
    schemaVersion: 1,
    evidenceCount: (measurementAudit?.evidenceCount ?? 0) + (briefAudit?.evidenceCount ?? 0),
    evidenceConfidence: measurementAudit ? 100 : 40
  });

  return {
    ...audit,
    verdict: audit.hardFailures.length
      ? 'fail-scene-incomplete'
      : audit.warnings.length
        ? 'pass-with-notes'
        : 'pass-scene-complete',
    brief: briefAudit ? briefAudit.brief : null,
    measurement: measured,
    sections: {
      brief: briefAudit ? { ok: briefAudit.ok, score: briefAudit.score } : null,
      frame: measurementAudit ? { ok: measurementAudit.ok, score: measurementAudit.score } : null
    }
  };
}

/** Digit heatmap of per-zone detail so an agent can see where the frame is empty. */
export function renderSceneHeatmap(measurement) {
  const { cols, rows } = measurement.grid;
  const lines = [];
  for (let row = 0; row < rows; row += 1) {
    let line = '';
    for (let col = 0; col < cols; col += 1) {
      const zone = measurement.zones[row * cols + col];
      line += String(Math.min(9, Math.round(zone.detail * 9)));
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export function formatSceneReport(result) {
  const measurement = result.measurement;
  const lines = ['=== SCENE COMPLETENESS ===', `verdict=${result.verdict}  ok=${result.ok}  score=${result.score}`];

  if (measurement) {
    const { summary, grid, page } = measurement;
    lines.push(
      `frame=${page.width}x${page.height}  grid=${grid.cols}x${grid.rows}`,
      `focal=${summary.focalZone} ratio=${summary.focalRatio}  detail min/median/max=${summary.minDetail}/${summary.medianDetail}/${summary.maxDetail}`,
      `value dark/mid/light=${summary.darkRatio}/${summary.midRatio}/${summary.lightRatio}`,
      '',
      'detail heatmap (0 empty → 9 dense):',
      renderSceneHeatmap(measurement)
    );
  }

  const actionable = (result.findings ?? []).filter((finding) => finding.severity !== 'info');
  if (actionable.length) {
    lines.push('', 'findings:');
    for (const finding of actionable) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.message}`);
      if (finding.remediation) lines.push(`  fix: ${finding.remediation}`);
    }
  } else {
    lines.push('', 'No blocking scene findings.');
  }
  return `${lines.join('\n')}\n`;
}

export async function measureSceneFromPng(filePath, options = {}) {
  const fs = await import('node:fs/promises');
  const { PNG } = await import('pngjs');
  const png = PNG.sync.read(await fs.readFile(filePath));
  const measurement = measureScene({ width: png.width, height: png.height, data: png.data }, options);
  return { ...measurement, source: String(filePath) };
}
