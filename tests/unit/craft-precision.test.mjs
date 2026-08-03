import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCraftPrecision, expectedInnerRadius, parseShadow } from '../../lib/craft-precision-engine.mjs';

test('nested radius formula subtracts padding and clamps at zero', () => {
  assert.equal(expectedInnerRadius(12, 4), 8);
  assert.equal(expectedInnerRadius(4, 8), 0);
  assert.equal(expectedInnerRadius('x', 4), null);
});

test('shadow parsing splits layers without breaking on colour functions', () => {
  const layers = parseShadow('0 1px 2px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.06)');
  assert.equal(layers.length, 2);
  assert.equal(layers[0].offsetY, 1);
  assert.equal(layers[0].blur, 2);
  assert.equal(layers[0].spread, 0);
  assert.equal(layers[0].color, 'rgba(0, 0, 0, 0.1)');
  assert.equal(layers[1].blur, 24);
  assert.equal(parseShadow('none').length, 0);
});

test('craft audit passes a consistent surface treatment', () => {
  const report = analyzeCraftPrecision({
    radiiPx: [2, 4, 8],
    elevationLevels: 2,
    borderWidthsPx: [1],
    typographicCharacters: true,
    opticalAlignmentApplied: true,
    imagesHaveIntrinsicDimensions: true,
    nestedRadii: [{ name: 'input', outerRadiusPx: 8, paddingPx: 4, innerRadiusPx: 4 }],
    shadows: [{ name: 'raised', value: '0 1px 2px rgba(13,18,24,0.1), 0 2px 6px rgba(13,18,24,0.06)' }],
    icons: { families: ['lucide'], strokeWidthsPx: [1.5], opticalRatios: [0.78, 0.8] }
  });
  assert.equal(report.ok, true);
  assert.equal(report.status, 'pass');
  assert.equal(report.nestedRadii[0].ok, true);
});

test('craft audit detects non-nesting radii and conflicting light sources', () => {
  const report = analyzeCraftPrecision({
    nestedRadii: [{ name: 'card button', outerRadiusPx: 12, paddingPx: 8, innerRadiusPx: 12 }],
    shadows: [
      { name: 'left', value: '-4px 4px 12px rgba(0,0,0,0.2)' },
      { name: 'right', value: '4px 4px 12px rgba(0,0,0,0.2)' }
    ]
  });
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('CRAFT_RADIUS_NOT_NESTED'));
  assert.ok(codes.includes('CRAFT_SHADOW_LIGHT_SOURCE_INCONSISTENT'));
});

test('craft audit flags single-layer high elevation and light from below', () => {
  const report = analyzeCraftPrecision({
    shadows: [
      { name: 'modal', value: '0 24px 48px rgba(0,0,0,0.2)' },
      { name: 'upward', value: '0 -6px 12px rgba(0,0,0,0.2)' }
    ]
  });
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('CRAFT_SHADOW_SINGLE_LAYER'));
  assert.ok(codes.includes('CRAFT_SHADOW_LIGHT_FROM_BELOW'));
});

test('craft audit reports mixed icon families and excessive radius vocabulary', () => {
  const report = analyzeCraftPrecision({
    radiiPx: [1, 2, 3, 4, 6, 8, 12],
    icons: { families: ['lucide', 'material'], strokeWidthsPx: [1.5, 2] }
  }, { maxRadiusVocabulary: 4 });
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('CRAFT_RADIUS_VOCABULARY_EXCESSIVE'));
  assert.ok(codes.includes('CRAFT_ICON_FAMILIES_MIXED'));
  assert.ok(codes.includes('CRAFT_ICON_STROKE_INCONSISTENT'));
});
