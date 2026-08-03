/**
 * ASCII / digit density maps for agent vision-in-the-loop.
 * Crops a PNG region, downsamples luminance, and renders a compact text map
 * agents can reason over when comparing ref (desired) vs cur (current).
 */

const RAMPS = {
  digits: '0123456789',
  blocks: ' .:-=+*#%@',
  binary: ' #'
};

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function assertImage(image) {
  const width = Number(image?.width);
  const height = Number(image?.height);
  const data = image?.data;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new TypeError('Image width and height must be positive integers.');
  }
  if (!data || typeof data.length !== 'number' || data.length < width * height * 4) {
    throw new TypeError('Image data must contain RGBA bytes for every pixel.');
  }
  return { width, height, data };
}

function lumaAt(data, width, x, y) {
  const offset = (y * width + x) * 4;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const a = data[offset + 3] / 255;
  const yLinear = (0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)) * a;
  return clamp01(yLinear);
}

export function normalizeCropRect(rect, imageWidth, imageHeight) {
  if (rect == null) {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }
  const x = Math.max(0, Math.floor(Number(rect.x) || 0));
  const y = Math.max(0, Math.floor(Number(rect.y) || 0));
  const width = Math.floor(Number(rect.width ?? rect.w));
  const height = Math.floor(Number(rect.height ?? rect.h));
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RangeError('Crop width and height must be positive integers.');
  }
  const clippedWidth = Math.min(width, imageWidth - x);
  const clippedHeight = Math.min(height, imageHeight - y);
  if (clippedWidth <= 0 || clippedHeight <= 0) {
    throw new RangeError('Crop rectangle is outside the image bounds.');
  }
  return { x, y, width: clippedWidth, height: clippedHeight };
}

export function cropImage(image, rect) {
  const source = assertImage(image);
  const crop = normalizeCropRect(rect, source.width, source.height);
  const data = Buffer.alloc(crop.width * crop.height * 4);
  for (let row = 0; row < crop.height; row += 1) {
    const srcStart = ((crop.y + row) * source.width + crop.x) * 4;
    const dstStart = row * crop.width * 4;
    data.set(source.data.subarray(srcStart, srcStart + crop.width * 4), dstStart);
  }
  return { width: crop.width, height: crop.height, data, crop };
}

export function downsampleLuma(image, cols, rows) {
  const source = assertImage(image);
  const outCols = Math.max(1, Math.floor(Number(cols) || 1));
  const outRows = Math.max(1, Math.floor(Number(rows) || 1));
  const grid = new Float64Array(outCols * outRows);

  for (let row = 0; row < outRows; row += 1) {
    const y0 = Math.floor((row / outRows) * source.height);
    const y1 = Math.max(y0 + 1, Math.floor(((row + 1) / outRows) * source.height));
    for (let col = 0; col < outCols; col += 1) {
      const x0 = Math.floor((col / outCols) * source.width);
      const x1 = Math.max(x0 + 1, Math.floor(((col + 1) / outCols) * source.width));
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          sum += lumaAt(source.data, source.width, x, y);
          count += 1;
        }
      }
      grid[row * outCols + col] = count ? sum / count : 0;
    }
  }

  return { cols: outCols, rows: outRows, values: grid };
}

function resolveRamp(ramp) {
  if (typeof ramp === 'string' && ramp.length > 1 && !RAMPS[ramp]) return ramp;
  return RAMPS[ramp] || RAMPS.digits;
}

export function renderAsciiFromGrid(grid, { ramp = 'digits', invert = false } = {}) {
  const chars = resolveRamp(ramp);
  const last = chars.length - 1;
  const lines = [];
  for (let row = 0; row < grid.rows; row += 1) {
    let line = '';
    for (let col = 0; col < grid.cols; col += 1) {
      let value = clamp01(grid.values[row * grid.cols + col]);
      if (invert) value = 1 - value;
      const index = Math.min(last, Math.max(0, Math.round(value * last)));
      line += chars[index];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export function contentCentroid(grid, { threshold = 0.15, polarity = 'auto' } = {}) {
  let mean = 0;
  const total = grid.cols * grid.rows;
  for (let i = 0; i < total; i += 1) mean += grid.values[i];
  mean = total ? mean / total : 0;
  const useDarkContent = polarity === 'dark' || (polarity === 'auto' && mean >= 0.5);

  let mass = 0;
  let mx = 0;
  let my = 0;
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      const value = grid.values[row * grid.cols + col];
      const weight = useDarkContent ? 1 - value : value;
      if (weight < threshold) continue;
      mass += weight;
      mx += col * weight;
      my += row * weight;
    }
  }
  if (!mass) return { x: null, y: null, mass: 0, polarity: useDarkContent ? 'dark' : 'bright' };
  return {
    x: Number((mx / mass).toFixed(3)),
    y: Number((my / mass).toFixed(3)),
    mass: Number(mass.toFixed(3)),
    polarity: useDarkContent ? 'dark' : 'bright'
  };
}

export function asciiMapFromImage(image, options = {}) {
  const source = assertImage(image);
  const cropped = cropImage(source, options.rect);
  const cols = Math.max(1, Math.floor(Number(options.cols) || Math.min(80, cropped.width)));
  const aspect = cropped.height / cropped.width;
  const rows = Math.max(1, Math.floor(Number(options.rows) || Math.max(1, Math.round(cols * aspect * 0.5))));
  const grid = downsampleLuma(cropped, cols, rows);
  const ascii = renderAsciiFromGrid(grid, { ramp: options.ramp, invert: options.invert });
  const centroid = contentCentroid(grid, { threshold: options.threshold });
  return {
    width: source.width,
    height: source.height,
    crop: cropped.crop,
    cols,
    rows,
    ramp: typeof options.ramp === 'string' ? options.ramp : 'digits',
    ascii,
    grid,
    centroid
  };
}

export async function loadPngImage(filePath) {
  const fs = await import('node:fs/promises');
  const { PNG } = await import('pngjs');
  const buffer = await fs.readFile(filePath);
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, data: png.data };
}

export async function asciiMapFromPngFile(filePath, options = {}) {
  const image = await loadPngImage(filePath);
  return { path: filePath, ...asciiMapFromImage(image, options) };
}

export function compareAsciiMaps(reference, current) {
  if (!reference?.grid || !current?.grid) throw new TypeError('Both reference and current maps require grids.');
  if (reference.grid.cols !== current.grid.cols || reference.grid.rows !== current.grid.rows) {
    throw new TypeError('ASCII maps must use the same cols and rows to compare.');
  }
  const { cols, rows, values: refValues } = reference.grid;
  const curValues = current.grid.values;
  let total = 0;
  let maxDelta = 0;
  let maxAt = null;
  const rowDeltas = [];
  for (let row = 0; row < rows; row += 1) {
    let rowSum = 0;
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const delta = Math.abs(refValues[index] - curValues[index]);
      total += delta;
      rowSum += delta;
      if (delta > maxDelta) {
        maxDelta = delta;
        maxAt = { col, row, delta: Number(delta.toFixed(4)) };
      }
    }
    rowDeltas.push(Number((rowSum / cols).toFixed(4)));
  }
  const meanAbsDelta = total / (cols * rows);
  const refCentroid = reference.centroid || contentCentroid(reference.grid);
  const curCentroid = current.centroid || contentCentroid(current.grid);
  const shift = {
    x: refCentroid.x == null || curCentroid.x == null ? null : Number((curCentroid.x - refCentroid.x).toFixed(3)),
    y: refCentroid.y == null || curCentroid.y == null ? null : Number((curCentroid.y - refCentroid.y).toFixed(3))
  };
  return {
    meanAbsDelta: Number(meanAbsDelta.toFixed(6)),
    maxDelta: Number(maxDelta.toFixed(4)),
    maxAt,
    rowDeltas,
    referenceCentroid: refCentroid,
    currentCentroid: curCentroid,
    centroidShiftCells: shift,
    similar: meanAbsDelta <= Number(reference.tolerance ?? current.tolerance ?? 0.08)
  };
}

export function formatAsciiReport({ label, role, map, comparison } = {}) {
  const title = [role, label].filter(Boolean).join(' ').toUpperCase() || 'ASCII MAP';
  const lines = [
    `=== ${title} ===`,
    `crop=${map.crop.x},${map.crop.y} ${map.crop.width}x${map.crop.height}  grid=${map.cols}x${map.rows}  centroid=${map.centroid.x},${map.centroid.y}`,
    map.ascii
  ];
  if (comparison) {
    lines.push(
      '',
      '=== COMPARE REF vs CUR ===',
      `meanAbsDelta=${comparison.meanAbsDelta}  maxDelta=${comparison.maxDelta} @${comparison.maxAt ? `${comparison.maxAt.col},${comparison.maxAt.row}` : 'n/a'}`,
      `centroidShiftCells dx=${comparison.centroidShiftCells.x} dy=${comparison.centroidShiftCells.y}`,
      `similar=${comparison.similar}`
    );
  }
  return `${lines.join('\n')}\n`;
}
