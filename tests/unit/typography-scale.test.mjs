import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeScaleSteps, analyzeTypography, expectedLineHeight } from '../../lib/typography-scale-engine.mjs';

const SOUND_ROLES = [
  { name: 'caption', sizePx: 12, weight: 400, lineHeight: 1.45 },
  { name: 'body', sizePx: 14, weight: 400, lineHeight: 1.55 },
  { name: 'body-emphasis', sizePx: 17, weight: 500, lineHeight: 1.5 },
  { name: 'section-heading', sizePx: 20, weight: 600, lineHeight: 1.35 },
  { name: 'page-title', sizePx: 24, weight: 600, lineHeight: 1.3 },
  { name: 'display', sizePx: 30, weight: 700, lineHeight: 1.25 }
];

test('scale step analysis identifies indistinguishable neighbours', () => {
  const sound = analyzeScaleSteps([12, 14, 17, 20, 24, 30]);
  assert.equal(sound.nearMisses.length, 0);
  assert.ok(sound.consistency > 80);
  const nearMiss = analyzeScaleSteps([14, 15, 16]);
  assert.equal(nearMiss.nearMisses.length, 2);
});

test('expected line height tightens as size grows', () => {
  assert.ok(expectedLineHeight(48) < expectedLineHeight(14));
  assert.equal(expectedLineHeight(0), null);
});

test('typography audit passes a coherent system', () => {
  const report = analyzeTypography({
    roles: SOUND_ROLES,
    families: ['Inter'],
    comparesNumbers: true,
    tabularFigures: true,
    measures: [{ region: 'article', characters: 66 }]
  });
  assert.equal(report.ok, true);
  assert.equal(report.status, 'pass');
  assert.equal(report.roleCount, 6);
});

test('typography audit flags near-miss steps, oversized scales, and wide measures', () => {
  const report = analyzeTypography({
    roles: [
      { name: 'a', sizePx: 14, weight: 400, lineHeight: 1.5 },
      { name: 'b', sizePx: 15, weight: 400, lineHeight: 1.5 },
      { name: 'c', sizePx: 16, weight: 400, lineHeight: 1.5 },
      { name: 'd', sizePx: 18, weight: 400, lineHeight: 1.5 },
      { name: 'e', sizePx: 21, weight: 400, lineHeight: 1.5 },
      { name: 'f', sizePx: 25, weight: 400, lineHeight: 1.5 },
      { name: 'g', sizePx: 30, weight: 400, lineHeight: 1.5 },
      { name: 'h', sizePx: 36, weight: 400, lineHeight: 1.5 }
    ],
    measures: [{ region: 'full-width description', characters: 128 }]
  }, { maxSizes: 7 });
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('TYPE_STEP_INDISTINGUISHABLE'));
  assert.ok(codes.includes('TYPE_SCALE_TOO_LARGE'));
  assert.ok(codes.includes('TYPE_MEASURE_TOO_WIDE'));
  assert.ok(codes.includes('TYPE_LINE_HEIGHT_CONSTANT'));
});

test('typography audit requires tabular figures where numbers are compared', () => {
  const report = analyzeTypography({ roles: SOUND_ROLES, comparesNumbers: true, tabularFigures: false });
  assert.ok(report.findings.some((item) => item.code === 'TYPE_FIGURES_NOT_TABULAR'));
});

test('typography audit reports a missing scale rather than passing silently', () => {
  const report = analyzeTypography({});
  assert.equal(report.ok, true);
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('TYPE_SCALE_MISSING'));
  assert.ok(codes.includes('TYPE_ROLES_UNDEFINED'));
  assert.equal(report.evidenceConfidence, 0);
});
