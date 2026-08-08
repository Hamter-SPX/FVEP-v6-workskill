/**
 * Deterministic vision metrics for text-only judgment.
 * Numbers over opinions: occupancy, density, palette, alignment, contrast —
 * pure functions over RGBA images ({width, height, data}).
 */
import { classifyHarmony } from './color-harmony-engine.mjs';

function clamp01(v) { return Math.min(1, Math.max(0, v)); }

export function lumaAtData(data, offset) {
  const a = data[offset + 3] / 255;
  const y = (0.2126 * (data[offset] / 255))
    + (0.7152 * (data[offset + 1] / 255))
    + (0.0722 * (data[offset + 2] / 255));
  return clamp01(y * a);
}

function assertImage(image) {
  const { width, height, data } = image ?? {};
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new TypeError('Image width and height must be positive integers.');
  }
  if (!data || data.length < width * height * 4) {
    throw new TypeError('Image data must contain RGBA bytes for every pixel.');
  }
}

function quantKey(r, g, b) {
  return `${r},${g},${b}`;
}

export function sampleBorderBackground(image, { border = 4 } = {}) {
  assertImage(image);
  const b = Math.max(1, Math.min(border, Math.floor(Math.min(image.width, image.height) / 4)));
  const counts = new Map();
  const push = (x, y) => {
    const o = (y * image.width + x) * 4;
    const key = quantKey(data8(image.data, o), data8(image.data, o + 1), data8(image.data, o + 2));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (x < b || y < b || x >= image.width - b || y >= image.height - b) push(x, y);
    }
  }
  let best = null;
  for (const [key, n] of counts) if (!best || n > best.n) best = { key, n };
  const [r, g, bch] = best.key.split(',').map(Number);
  return [r, g, bch];
}

function data8(data, o) { return data[o] ?? 0; }

function colorDistance(data, o, bg) {
  const dr = data[o] - bg[0]; const dg = data[o + 1] - bg[1]; const db = data[o + 2] - bg[2];
  const alphaFade = data[o + 3] / 255;
  return Math.sqrt(dr * dr + dg * dg + db * db) * alphaFade;
}

export function occupancyGrid(image, { cols = 8, rows = 5, tolerance = 48, emptyBelow = 0.02 } = {}) {
  assertImage(image);
  const bg = sampleBorderBackground(image);
  const cells = new Array(cols * rows).fill(0);
  const counts = new Array(cols * rows).fill(0);
  for (let y = 0; y < image.height; y += 1) {
    const rowIdx = Math.min(rows - 1, Math.floor((y / image.height) * rows));
    for (let x = 0; x < image.width; x += 1) {
      const colIdx = Math.min(cols - 1, Math.floor((x / image.width) * cols));
      const cell = rowIdx * cols + colIdx;
      counts[cell] += 1;
      if (colorDistance(image.data, (y * image.width + x) * 4, bg) > tolerance) cells[cell] += 1;
    }
  }
  const ratios = cells.map((n, i) => (counts[i] ? n / counts[i] : 0));
  const emptyCells = [];
  ratios.forEach((ratio, i) => {
    if (ratio < emptyBelow) emptyCells.push({ col: i % cols, row: Math.floor(i / cols), ratio });
  });
  let left = 0; let right = 0; let top = 0; let bottom = 0;
  ratios.forEach((ratio, i) => {
    const c = i % cols; const r = Math.floor(i / cols);
    const wx = cols > 1 ? (c / (cols - 1)) * 2 - 1 : 0;
    const wy = rows > 1 ? (r / (rows - 1)) * 2 - 1 : 0;
    if (wx < 0) left += ratio * -wx; else right += ratio * wx;
    if (wy < 0) top += ratio * -wy; else bottom += ratio * wy;
  });
  const total = Math.max(1e-9, ratios.reduce((a, b) => a + b, 0));
  return {
    grid: { cols, rows },
    cells: ratios,
    emptyCells,
    background: bg,
    balance: {
      left: left / total, right: right / total, top: top / total, bottom: bottom / total,
      centerX: right / total - left / total,
      centerY: bottom / total - top / total
    }
  };
}

export function densityGrid(image, { cols = 8, rows = 5 } = {}) {
  assertImage(image);
  const cells = new Array(cols * rows).fill(0);
  const counts = new Array(cols * rows).fill(0);
  for (let y = 0; y < image.height - 1; y += 1) {
    const rowIdx = Math.min(rows - 1, Math.floor((y / image.height) * rows));
    for (let x = 0; x < image.width - 1; x += 1) {
      const colIdx = Math.min(cols - 1, Math.floor((x / image.width) * cols));
      const o = (y * image.width + x) * 4;
      const gx = Math.abs(lumaAtData(image.data, o + 4) - lumaAtData(image.data, o));
      const gy = Math.abs(lumaAtData(image.data, o + image.width * 4) - lumaAtData(image.data, o));
      const cell = rowIdx * cols + colIdx;
      cells[cell] += gx + gy;
      counts[cell] += 1;
    }
  }
  const means = cells.map((n, i) => (counts[i] ? n / counts[i] : 0));
  return { grid: { cols, rows }, cells: means, mean: means.reduce((a, b) => a + b, 0) / means.length };
}

function rgbToHue(r, g, b) {
  const rr = r / 255; const gg = g / 255; const bb = b / 255;
  const max = Math.max(rr, gg, bb); const min = Math.min(rr, gg, bb);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === rr) h = 60 * (((gg - bb) / d) % 6);
  else if (max === gg) h = 60 * ((bb - rr) / d + 2);
  else h = 60 * ((rr - gg) / d + 4);
  return ((h % 360) + 360) % 360;
}

export function extractPalette(image, { topK = 6, quantizeShift = 3 } = {}) {
  assertImage(image);
  const counts = new Map();
  let total = 0;
  for (let o = 0; o < image.width * image.height * 4; o += 4) {
    if (image.data[o + 3] < 32) continue;
    const key = quantKey(
      image.data[o] >> quantizeShift,
      image.data[o + 1] >> quantizeShift,
      image.data[o + 2] >> quantizeShift
    );
    counts.set(key, (counts.get(key) ?? 0) + 1);
    total += 1;
  }
  const colors = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([key, n]) => {
      const [r, g, b] = key.split(',').map(Number);
      const rgb = [
        Math.min(255, (r << quantizeShift) + (1 << (quantizeShift - 1))),
        Math.min(255, (g << quantizeShift) + (1 << (quantizeShift - 1))),
        Math.min(255, (b << quantizeShift) + (1 << (quantizeShift - 1)))
      ];
      return { rgb, share: total ? n / total : 0 };
    });
  const hues = colors.map((c) => rgbToHue(c.rgb[0], c.rgb[1], c.rgb[2]));
  return { colors, harmony: colors.length ? classifyHarmony(hues) : 'none' };
}

export function alignmentScore(image, { threshold = 0.18 } = {}) {
  assertImage(image);
  const { width, height, data } = image;
  if (width < 8 || height < 8) return { vertical: null, horizontal: null, score: null };
  const vCols = [];
  for (let x = 1; x < width - 1; x += 1) {
    let acc = 0;
    for (let y = 1; y < height - 1; y += 1) {
      const o = (y * width + x) * 4;
      acc += Math.abs(lumaAtData(data, o + 4) - lumaAtData(data, o - 4));
    }
    if (acc / (height - 2) > threshold) vCols.push(x);
  }
  const hRows = [];
  for (let y = 1; y < height - 1; y += 1) {
    let acc = 0;
    for (let x = 1; x < width - 1; x += 1) {
      const o = (y * width + x) * 4;
      acc += Math.abs(lumaAtData(data, o + width * 4) - lumaAtData(data, o - width * 4));
    }
    if (acc / (width - 2) > threshold) hRows.push(y);
  }
  const clustered = (positions) => {
    if (positions.length === 0) return null;
    const runs = [];
    let start = positions[0]; let prev = positions[0];
    for (const p of positions.slice(1)) {
      if (p - prev <= 2) { prev = p; continue; }
      runs.push([start, prev]); start = p; prev = p;
    }
    runs.push([start, prev]);
    return Math.min(1, runs.length / Math.max(1, positions.length / 8));
  };
  const vertical = clustered(vCols);
  const horizontal = clustered(hRows);
  const present = [vertical, horizontal].filter((v) => v !== null);
  return {
    vertical, horizontal,
    score: present.length ? present.reduce((a, b) => a + b, 0) / present.length : null
  };
}

export function contrastHistogram(image, { bins = 10 } = {}) {
  assertImage(image);
  const hist = new Array(bins).fill(0);
  let total = 0;
  for (let o = 0; o < image.width * image.height * 4; o += 4) {
    const y = lumaAtData(image.data, o);
    hist[Math.min(bins - 1, Math.floor(y * bins))] += 1;
    total += 1;
  }
  const darkShare = total ? (hist[0] + hist[1]) / total : 0;
  const lightShare = total ? (hist[bins - 1] + hist[bins - 2]) / total : 0;
  return { bins: hist, darkShare, lightShare, midShare: 1 - darkShare - lightShare };
}

export function computeVisionMetrics(image, { cols = 8, rows = 5 } = {}) {
  assertImage(image);
  const occupancy = occupancyGrid(image, { cols, rows });
  const density = densityGrid(image, { cols, rows });
  const palette = extractPalette(image);
  const alignment = alignmentScore(image);
  const contrast = contrastHistogram(image);
  return {
    dimensions: { width: image.width, height: image.height },
    occupancy, density, palette, alignment, contrast
  };
}
