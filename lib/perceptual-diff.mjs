function clamp01(value) { return Math.min(1, Math.max(0, value)); }
function channel(value) { return clamp01(Number(value) / 255); }
function luma(r, g, b) { return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b); }

function assertImage(image) {
  const width = Number(image?.width); const height = Number(image?.height); const data = image?.data;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) throw new TypeError('Image width and height must be positive integers.');
  if (!data || typeof data.length !== 'number' || data.length < width * height * 4) throw new TypeError('Image data must contain RGBA bytes for every pixel.');
  return { width, height, data };
}

function mean(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
function standardDeviation(values, average = mean(values)) {
  return values.length ? Math.sqrt(values.reduce((sum, value) => sum + ((value - average) ** 2), 0) / values.length) : 0;
}

export function createPerceptualSignature(image, { gridSize = 16 } = {}) {
  const { width, height, data } = assertImage(image);
  const grid = Math.max(2, Math.min(64, Math.floor(Number(gridSize) || 16)));
  const cellSums = Array(grid * grid).fill(0); const cellCounts = Array(grid * grid).fill(0);
  const luminances = []; let red = 0; let green = 0; let blue = 0; let alpha = 0;
  let horizontalEdges = 0; let verticalEdges = 0; let comparisons = 0;
  let previousRow = new Float64Array(width);

  for (let y = 0; y < height; y += 1) {
    let previousLuma = null;
    const currentRow = new Float64Array(width);
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const r = data[offset]; const g = data[offset + 1]; const b = data[offset + 2]; const a = data[offset + 3];
      const value = luma(r, g, b);
      currentRow[x] = value; luminances.push(value);
      red += channel(r); green += channel(g); blue += channel(b); alpha += channel(a);
      const gx = Math.min(grid - 1, Math.floor((x / width) * grid));
      const gy = Math.min(grid - 1, Math.floor((y / height) * grid));
      const cell = gy * grid + gx; cellSums[cell] += value; cellCounts[cell] += 1;
      if (previousLuma !== null) { horizontalEdges += Math.abs(value - previousLuma); comparisons += 1; }
      if (y > 0) { verticalEdges += Math.abs(value - previousRow[x]); comparisons += 1; }
      previousLuma = value;
    }
    previousRow = currentRow;
  }

  const pixelCount = width * height;
  const meanLuminance = mean(luminances);
  const contrast = standardDeviation(luminances, meanLuminance);
  const gridLuminance = cellSums.map((sum, index) => cellCounts[index] ? sum / cellCounts[index] : 0);
  const averageEdge = comparisons ? (horizontalEdges + verticalEdges) / comparisons : 0;
  const edgeDensity = clamp01(averageEdge * 2);

  return {
    schemaVersion: 1,
    width,
    height,
    gridSize: grid,
    meanLuminance: Number(meanLuminance.toFixed(6)),
    contrast: Number(contrast.toFixed(6)),
    edgeDensity: Number(edgeDensity.toFixed(6)),
    meanColor: {
      r: Number((red / pixelCount).toFixed(6)),
      g: Number((green / pixelCount).toFixed(6)),
      b: Number((blue / pixelCount).toFixed(6)),
      a: Number((alpha / pixelCount).toFixed(6))
    },
    gridLuminance: gridLuminance.map((value) => Number(value.toFixed(6)))
  };
}

function averageAbsoluteDelta(left, right) {
  const length = Math.min(left.length, right.length);
  if (!length) return 1;
  let total = 0;
  for (let index = 0; index < length; index += 1) total += Math.abs(Number(left[index]) - Number(right[index]));
  return clamp01(total / length);
}

export function comparePerceptualSignatures(reference, current) {
  if (!reference || !current) throw new TypeError('Both perceptual signatures are required.');
  if (reference.gridSize !== current.gridSize) throw new TypeError('Perceptual signatures must use the same gridSize.');
  const luminanceDelta = clamp01(Math.abs(reference.meanLuminance - current.meanLuminance));
  const contrastDelta = clamp01(Math.abs(reference.contrast - current.contrast));
  const edgeDelta = clamp01(Math.abs(reference.edgeDensity - current.edgeDensity));
  const colorDelta = averageAbsoluteDelta(
    [reference.meanColor.r, reference.meanColor.g, reference.meanColor.b, reference.meanColor.a],
    [current.meanColor.r, current.meanColor.g, current.meanColor.b, current.meanColor.a]
  );
  const structureDelta = averageAbsoluteDelta(reference.gridLuminance, current.gridLuminance);
  const similarity = clamp01(
    (1 - structureDelta) * 0.35
    + (1 - colorDelta) * 0.25
    + (1 - luminanceDelta) * 0.20
    + (1 - contrastDelta) * 0.10
    + (1 - edgeDelta) * 0.10
  );
  return {
    similarity: Number(similarity.toFixed(6)),
    structureDelta: Number(structureDelta.toFixed(6)),
    colorDelta: Number(colorDelta.toFixed(6)),
    luminanceDelta: Number(luminanceDelta.toFixed(6)),
    contrastDelta: Number(contrastDelta.toFixed(6)),
    edgeDelta: Number(edgeDelta.toFixed(6))
  };
}
