import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lumaAtData,
  occupancyGrid,
  densityGrid,
  extractPalette,
  alignmentScore,
  computeVisionMetrics
} from '../../lib/vision-metrics-engine.mjs';

function solid(width, height, rgba) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    data[o] = rgba[0]; data[o + 1] = rgba[1]; data[o + 2] = rgba[2]; data[o + 3] = rgba[3] ?? 255;
  }
  return { width, height, data };
}

function paint(image, x0, y0, w, h, rgba) {
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      const o = (y * image.width + x) * 4;
      image.data[o] = rgba[0]; image.data[o + 1] = rgba[1];
      image.data[o + 2] = rgba[2]; image.data[o + 3] = rgba[3] ?? 255;
    }
  }
  return image;
}

test('lumaAtData — white ≈ 1, black ≈ 0, transparent ≈ 0', () => {
  const img = solid(2, 1, [255, 255, 255, 255]);
  assert.ok(lumaAtData(img.data, 0) > 0.99);
  const black = solid(2, 1, [0, 0, 0, 255]);
  assert.ok(lumaAtData(black.data, 0) < 0.01);
  const transparent = solid(2, 1, [255, 255, 255, 0]);
  assert.ok(lumaAtData(transparent.data, 0) < 0.01);
});

test('occupancyGrid — single blob in one cell of an 8x5 grid', () => {
  // background white, blob 10x8 black at (0,0) of 80x40 image
  // grid 8x5 → cell = 10x8 → blob fills cell (0,0) exactly
  const img = paint(solid(80, 40, [255, 255, 255, 255]), 0, 0, 10, 8, [0, 0, 0, 255]);
  const occ = occupancyGrid(img, { cols: 8, rows: 5 });
  assert.equal(occ.grid.cols, 8);
  assert.equal(occ.cells.length, 40);
  assert.ok(occ.cells[0] > 0.95, `cell(0,0) ~ full, got ${occ.cells[0]}`);
  assert.ok(occ.cells[1] < 0.05, `cell(1,0) ~ empty, got ${occ.cells[1]}`);
  assert.ok(occ.emptyCells.length >= 38);
  assert.deepEqual(occ.background, [255, 255, 255]);
  assert.ok(occ.balance.centerX < 0, 'mass left of center');
});

test('occupancyGrid — solid background image is all-empty', () => {
  const img = solid(40, 20, [10, 20, 30, 255]);
  const occ = occupancyGrid(img, { cols: 4, rows: 2 });
  assert.equal(occ.emptyCells.length, 8);
});

test('densityGrid — textured half has higher mean gradient', () => {
  const img = solid(40, 20, [255, 255, 255, 255]);
  // checkerboard left half (strong gradients), flat right half
  for (let y = 0; y < 20; y += 1) {
    for (let x = 0; x < 20; x += 1) {
      const v = (x + y) % 2 === 0 ? 0 : 255;
      paint(img, x, y, 1, 1, [v, v, v, 255]);
    }
  }
  const den = densityGrid(img, { cols: 2, rows: 1 });
  assert.ok(den.cells[0] > den.cells[1] * 3, `left dense: ${den.cells[0]} vs right flat: ${den.cells[1]}`);
});

test('extractPalette — dominant colors + harmony classification', () => {
  const img = solid(60, 60, [255, 255, 255, 255]);
  paint(img, 0, 0, 30, 60, [230, 57, 70, 255]);   // HeloS red half
  paint(img, 30, 0, 30, 60, [8, 8, 10, 255]);     // HeloS black half
  const pal = extractPalette(img, { topK: 3 });
  assert.ok(pal.colors.length >= 2);
  const shares = pal.colors.map((c) => c.share);
  assert.ok(Math.abs(shares[0] - 0.5) < 0.15, `top color ~50%: ${shares[0]}`);
  assert.ok(typeof pal.harmony === 'string' && pal.harmony.length > 0);
  const reds = pal.colors.filter((c) => c.rgb[0] > 150);
  assert.equal(reds.length, 1);
});

test('extractPalette — quantizeShift guard', () => {
  const img = solid(8, 8, [255, 255, 255, 255]);
  assert.throws(() => extractPalette(img, { quantizeShift: 0 }), RangeError);
  assert.throws(() => extractPalette(img, { quantizeShift: 5 }), RangeError);
  assert.doesNotThrow(() => extractPalette(img, { quantizeShift: 3 }));
});

test('alignmentScore — columned layout > scattered noise > single edge > none', () => {
  const cols = solid(60, 40, [255, 255, 255, 255]);
  paint(cols, 10, 0, 20, 40, [0, 0, 0, 255]);      // sharp vertical edges at x=10, x=30
  const structured = alignmentScore(cols);
  assert.ok(structured.vertical >= 0.6, `two-edge block ≈ 0.67 (1.0 × coverage 2/3), got ${structured.vertical}`);

  // truly irregular scatter — consecutive spacings all different
  const noisy = solid(70, 40, [255, 255, 255, 255]);
  for (const x of [3, 7, 16, 22, 35, 41, 55, 60]) paint(noisy, x, 0, 1, 40, [0, 0, 0, 255]);
  const noise = alignmentScore(noisy);
  assert.ok((noise.vertical ?? 0) < 0.5, `scattered noise must score low, got ${noise.vertical}`);

  const smear = solid(60, 40, [255, 255, 255, 255]);
  paint(smear, 20, 0, 16, 40, [0, 0, 0, 255]);      // one wide soft blob → 2 wide runs? edges ~2px each
  const single = alignmentScore(smear);
  assert.ok((single.vertical ?? 0) <= 0.67, `single block caps ≤0.67, got ${single.vertical}`);

  const flat = alignmentScore(solid(60, 40, [128, 128, 128, 255]));
  assert.equal(flat.vertical, null);
  assert.equal(flat.score, null);
});

test('occupancyGrid — suspectBackground flags', () => {
  // normal case: white page + content blob → not suspect
  const normal = paint(solid(80, 40, [255, 255, 255, 255]), 0, 0, 10, 8, [0, 0, 0, 255]);
  const occOk = occupancyGrid(normal, { cols: 8, rows: 5 });
  assert.equal(occOk.suspectBackground, false);
  assert.ok(occOk.backgroundShare > 0.5);

  // gradient border: every border pixel unique-ish → dominant share collapses
  const grad = solid(80, 40, [255, 255, 255, 255]);
  for (let x = 0; x < 80; x += 1) for (let y = 0; y < 4; y += 1) paint(grad, x, y, 1, 1, [x * 3 % 256, (x * 7) % 256, (x * 13) % 256, 255]);
  for (let x = 0; x < 80; x += 1) for (let y = 36; y < 40; y += 1) paint(grad, x, y, 1, 1, [(x * 5) % 256, (x * 11) % 256, (x * 17) % 256, 255]);
  for (let y = 0; y < 40; y += 1) for (let x = 0; x < 4; x += 1) paint(grad, x, y, 1, 1, [(y * 3) % 256, (y * 9) % 256, (y * 15) % 256, 255]);
  for (let y = 0; y < 40; y += 1) for (let x = 76; x < 80; x += 1) paint(grad, x, y, 1, 1, [(y * 7) % 256, (y * 5) % 256, (y * 11) % 256, 255]);
  const occGrad = occupancyGrid(grad, { cols: 8, rows: 5 });
  assert.equal(occGrad.suspectBackground, true, 'fragmented border must flag suspect');

  // modal ring case: colored full-perimeter ring + fully filled interior
  const ring = solid(80, 40, [200, 30, 30, 255]);
  paint(ring, 6, 6, 68, 28, [200, 30, 30, 255]);
  // interior also busy (all cells occupied) → suspect via minRatio
  for (let y = 6; y < 34; y += 1) for (let x = 6; x < 74; x += 1) paint(ring, x, y, 1, 1, [10 + (x % 40), 30, 60, 255]);
  const occRing = occupancyGrid(ring, { cols: 8, rows: 5 });
  assert.equal(occRing.suspectBackground, true, 'all-cells-full must flag suspect');
});

test('computeVisionMetrics — full shape', () => {
  const img = paint(solid(80, 40, [255, 255, 255, 255]), 0, 0, 20, 40, [230, 57, 70, 255]);
  const m = computeVisionMetrics(img, { cols: 8, rows: 5 });
  assert.deepEqual(m.dimensions, { width: 80, height: 40 });
  assert.ok(m.occupancy && Array.isArray(m.occupancy.cells));
  assert.ok(typeof m.density.mean === 'number');
  assert.ok(Array.isArray(m.palette.colors));
  assert.ok(typeof m.alignment === 'object');
  assert.ok(typeof m.contrast.darkShare === 'number');
});
