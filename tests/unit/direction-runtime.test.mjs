import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESENTATION_MODES,
  detectHostRuntime,
  planDirectionPresentation,
  resolveDirectionCapabilities,
  resolveDirectionRuntime
} from '../../lib/direction-runtime-engine.mjs';

test('detectHostRuntime prefers Cursor and Codex signals', () => {
  assert.equal(detectHostRuntime({ CURSOR_VERSION: '2.6.0' }).host, 'cursor');
  assert.equal(detectHostRuntime({ CODEX_HOME: '/tmp/.codex' }).host, 'codex');
  assert.equal(detectHostRuntime({ CI: 'true', GITHUB_ACTIONS: 'true' }).host, 'ci');
  assert.equal(detectHostRuntime({}).host, 'cli');
  assert.equal(detectHostRuntime({}, { host: 'cursor' }).host, 'cursor');
});

test('Cursor with confirmed ImageGen plans inline-and-gallery', () => {
  const report = resolveDirectionRuntime({
    env: { CURSOR_VERSION: '2.6.0' },
    overrides: { imageGeneration: true, inlineImages: true }
  });
  assert.equal(report.host, 'cursor');
  assert.equal(report.capabilities.imageTool, 'GenerateImage');
  assert.equal(report.presentation.mode, PRESENTATION_MODES.INLINE_AND_GALLERY);
  assert.equal(report.presentation.showInline, true);
  assert.equal(report.presentation.allowProseFallback, false);
});

test('ImageGen unavailable forces prose-with-gap and never invents images', () => {
  const report = resolveDirectionRuntime({
    env: { CURSOR_VERSION: '2.6.0' },
    overrides: { imageGeneration: false }
  });
  assert.equal(report.presentation.mode, PRESENTATION_MODES.PROSE_GAP);
  assert.equal(report.presentation.allowProseFallback, true);
  assert.ok(report.presentation.gaps.some((item) => item.code === 'IMAGEGEN_UNAVAILABLE'));
  assert.ok(report.presentation.steps.some((step) => /verification gap|ImageGen unavailable/i.test(step)));
});

test('ImageGen with no inline images opens gallery-only', () => {
  const caps = resolveDirectionCapabilities(
    { host: 'codex' },
    { imageGeneration: true, inlineImages: false }
  );
  const plan = planDirectionPresentation(caps);
  assert.equal(plan.mode, PRESENTATION_MODES.GALLERY_ONLY);
  assert.equal(plan.openGallery, true);
  assert.equal(plan.allowProseFallback, false);
  assert.ok(plan.steps.some((step) => /direction:gallery/.test(step)));
});

test('CI host plans gate-only without exploration', () => {
  const report = resolveDirectionRuntime({
    env: { CI: 'true', GITHUB_ACTIONS: 'true' }
  });
  assert.equal(report.host, 'ci');
  assert.equal(report.presentation.mode, PRESENTATION_MODES.CI_GATE_ONLY);
  assert.ok(report.presentation.steps.some((step) => /direction:gate/.test(step)));
});

test('unconfirmed ImageGen on CLI stays prose-with-gap', () => {
  const report = resolveDirectionRuntime({ env: {} });
  assert.equal(report.host, 'cli');
  assert.equal(report.capabilities.imageGeneration, false);
  assert.equal(report.presentation.mode, PRESENTATION_MODES.PROSE_GAP);
});

test('missing reference screenshot is recorded as a gap', () => {
  const report = resolveDirectionRuntime({
    env: { CURSOR_VERSION: '1' },
    overrides: { imageGeneration: true, inlineImages: true },
    referenceAttached: false
  });
  assert.ok(report.presentation.gaps.some((item) => item.code === 'REFERENCE_SCREENSHOT_MISSING'));
});

test('Cursor ImageGen true keeps inline + gallery defaults when overrides omit them', () => {
  const report = resolveDirectionRuntime({
    env: { CURSOR_VERSION: '2.6.0' },
    overrides: { imageGeneration: true }
  });
  assert.equal(report.capabilities.inlineImages, true);
  assert.equal(report.capabilities.browserGallery, true);
  assert.equal(report.presentation.mode, PRESENTATION_MODES.INLINE_AND_GALLERY);
});
