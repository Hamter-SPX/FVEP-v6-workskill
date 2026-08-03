import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeColorSystem, analyzeRamp, classifyHarmony, contrastRatio, parseColor, toOklch } from '../../lib/color-harmony-engine.mjs';

const EVEN_NEUTRALS = ['#f4f9ff', '#d7dbe5', '#b9bfc7', '#9da3ab', '#828890', '#686e75', '#4f555c', '#383d44', '#21272d', '#0d1218'];

test('colour parsing accepts hex, shorthand, and functional notation', () => {
  assert.deepEqual(parseColor('#fff'), { r: 1, g: 1, b: 1, a: 1 });
  assert.deepEqual(parseColor('rgb(0, 0, 0)'), { r: 0, g: 0, b: 0, a: 1 });
  assert.equal(parseColor('rgba(255, 255, 255, 0.5)').a, 0.5);
  assert.throws(() => parseColor('chartreuse-ish'), TypeError);
});

test('OKLCH conversion separates lightness from hue as the colour reference requires', () => {
  const white = toOklch('#ffffff');
  const black = toOklch('#000000');
  assert.ok(white.l > 0.99 && white.c < 0.001);
  assert.ok(black.l < 0.01);
  // sRGB yellow and blue claim equal HSL lightness; OKLCH must not agree.
  assert.ok(toOklch('#ffff00').l - toOklch('#0000ff').l > 0.4);
});

test('WCAG contrast is symmetric and matches known reference pairs', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#ffffff', '#000000'), 21);
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1);
});

test('ramp analysis separates an even ramp from a clustered one', () => {
  const even = analyzeRamp(EVEN_NEUTRALS);
  assert.equal(even.monotonic, true);
  assert.ok(even.evenness > 95);
  const clustered = analyzeRamp(['#ffffff', '#fdfdfd', '#fbfbfb', '#111111']);
  assert.ok(clustered.evenness < 50);
  assert.ok(clustered.minStep < 0.02);
});

test('harmony classification names the hue relationship', () => {
  assert.equal(classifyHarmony([210]), 'monochromatic');
  assert.equal(classifyHarmony([200, 220, 240]), 'analogous');
  assert.equal(classifyHarmony([0, 180]), 'complementary');
  assert.equal(classifyHarmony([0, 120, 240]), 'triadic');
});

test('colour system audit passes a coherent palette', () => {
  const report = analyzeColorSystem({
    neutrals: EVEN_NEUTRALS,
    accents: ['#1d4ed8'],
    statuses: { success: '#15803d', warning: '#b45309', danger: '#b91c1c', info: '#1d4ed8' },
    statusReliesOnColorAlone: false,
    pairs: [{ name: 'body', usage: 'body', foreground: '#21272d', background: '#f4f9ff' }]
  });
  assert.equal(report.ok, true);
  assert.equal(report.status, 'pass');
  assert.equal(report.accentCount, 1);
  assert.equal(report.contrast[0].passed, true);
});

test('colour system audit blocks insufficient contrast and hue-only status', () => {
  const report = analyzeColorSystem({
    neutrals: EVEN_NEUTRALS,
    statuses: { success: '#15803d', danger: '#b91c1c' },
    statusReliesOnColorAlone: true,
    pairs: [{ name: 'muted body', usage: 'body', foreground: '#b9bfc7', background: '#f4f9ff' }]
  });
  assert.equal(report.ok, false);
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('COLOR_CONTRAST_BELOW_FLOOR'));
  assert.ok(codes.includes('COLOR_STATUS_HUE_ONLY'));
});

test('colour system audit flags accent competition and inverted dark themes', () => {
  const report = analyzeColorSystem({
    neutrals: EVEN_NEUTRALS,
    accents: ['#1d4ed8', '#b91c1c', '#15803d'],
    themes: ['light', 'dark'],
    darkThemeDerivation: 'inverted'
  }, { maxAccents: 1 });
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('COLOR_ACCENT_COMPETITION'));
  assert.ok(codes.includes('COLOR_DARK_THEME_INVERTED'));
});
