import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSpacingSystem, findOffScaleValues } from '../../lib/spacing-rhythm-engine.mjs';

const SCALE = [4, 8, 12, 16, 24, 32, 48];

test('off-scale detection accepts base-unit multiples and rejects arbitrary values', () => {
  const offScale = findOffScaleValues(
    [{ region: 'a', valuePx: 8 }, { region: 'b', valuePx: 20 }, { region: 'c', valuePx: 13 }],
    SCALE,
    4
  );
  assert.deepEqual(offScale.map((item) => item.region), ['c']);
});

test('spacing audit passes a system where proximity encodes structure', () => {
  const report = analyzeSpacingSystem({
    baseUnitPx: 4,
    scale: SCALE,
    density: 'dense',
    alignmentEdgeCount: 4,
    observed: [{ region: 'row', valuePx: 8 }, { region: 'toolbar', valuePx: 12 }],
    groups: [{ name: 'field', withinPx: 4, betweenPx: 16 }],
    nesting: [{ name: 'panel', outerPx: 24, innerPx: 12 }],
    responsive: { desktopMacroPx: 48, mobileMacroPx: 24, desktopMicroPx: 8, mobileMicroPx: 8 }
  });
  assert.equal(report.ok, true);
  assert.equal(report.status, 'pass');
  assert.equal(report.offScaleRatio, 0);
});

test('inverted proximity is a blocker because it inverts perceived structure', () => {
  const report = analyzeSpacingSystem({
    baseUnitPx: 4,
    scale: SCALE,
    groups: [{ name: 'label and field', withinPx: 16, betweenPx: 8 }]
  });
  assert.equal(report.ok, false);
  assert.ok(report.hardFailures.some((item) => item.code === 'SPACING_PROXIMITY_INVERTED'));
});

test('ambiguous grouping is reported without blocking', () => {
  const report = analyzeSpacingSystem({
    baseUnitPx: 4,
    scale: SCALE,
    groups: [{ name: 'metric block', withinPx: 8, betweenPx: 10 }]
  });
  assert.equal(report.ok, true);
  assert.ok(report.findings.some((item) => item.code === 'SPACING_PROXIMITY_AMBIGUOUS'));
});

test('spacing audit reports drift, inverted nesting, and uncompressed macro spacing', () => {
  const report = analyzeSpacingSystem({
    baseUnitPx: 4,
    scale: SCALE,
    observed: [{ region: 'a', valuePx: 13 }, { region: 'b', valuePx: 17 }, { region: 'c', valuePx: 8 }],
    nesting: [{ name: 'card', outerPx: 8, innerPx: 24 }],
    responsive: { desktopMacroPx: 32, mobileMacroPx: 48 },
    alignmentEdgeCount: 11
  });
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('SPACING_OFF_SCALE_DRIFT'));
  assert.ok(codes.includes('SPACING_NESTING_INVERTED'));
  assert.ok(codes.includes('SPACING_MACRO_NOT_COMPRESSED'));
  assert.ok(codes.includes('SPACING_ALIGNMENT_EDGES_EXCESSIVE'));
});

test('an absent scale is reported rather than silently accepted', () => {
  const report = analyzeSpacingSystem({});
  assert.ok(report.findings.some((item) => item.code === 'SPACING_SCALE_MISSING'));
  assert.equal(report.evidenceConfidence, 0);
});
