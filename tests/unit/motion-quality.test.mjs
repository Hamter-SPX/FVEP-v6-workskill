import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMotionSystem, classifyDuration } from '../../lib/motion-quality-engine.mjs';

const REDUCED = { implemented: true, removesAllTransitions: false, preservesMeaning: true, rendered: true };

test('duration classification maps onto the published families', () => {
  assert.equal(classifyDuration(80), 'instant');
  assert.equal(classifyDuration(180), 'short');
  assert.equal(classifyDuration(300), 'medium');
  assert.equal(classifyDuration(450), 'long');
  assert.equal(classifyDuration(900), 'above-long');
  assert.equal(classifyDuration(-1), null);
});

test('motion audit passes a considered system', () => {
  const report = analyzeMotionSystem({
    animations: [
      { name: 'press-feedback', purpose: 'feedback', durationMs: 80, easing: 'cubic-bezier(0.2, 0, 0, 1)', properties: ['opacity'], interruptible: true, reversesFromCurrentState: true },
      { name: 'panel-open', purpose: 'continuity', durationMs: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)', properties: ['transform', 'opacity'], interruptible: true, reversesFromCurrentState: true },
      { name: 'panel-close', purpose: 'continuity', durationMs: 160, easing: 'cubic-bezier(0.4, 0, 1, 1)', properties: ['transform', 'opacity'], interruptible: true, reversesFromCurrentState: true }
    ],
    reducedMotion: REDUCED
  });
  assert.equal(report.ok, true);
  assert.equal(report.status, 'pass');
  assert.equal(report.easings.length, 2);
});

test('continuous motion is exempt from the transition duration ceiling', () => {
  const report = analyzeMotionSystem({
    animations: [{ name: 'spinner', purpose: 'status', durationMs: 1000, easing: 'linear', properties: ['transform'], continuous: true, interruptible: true }],
    reducedMotion: REDUCED
  });
  const codes = report.findings.map((item) => item.code);
  assert.ok(!codes.includes('MOTION_DURATION_TOO_LONG'));
  assert.ok(!codes.includes('MOTION_LINEAR_POSITIONAL'));
});

test('missing reduced-motion handling blocks the motion system', () => {
  const report = analyzeMotionSystem({ animations: [{ name: 'x', purpose: 'feedback', durationMs: 100, easing: 'ease-out', properties: ['opacity'] }] });
  assert.equal(report.ok, false);
  assert.ok(report.hardFailures.some((item) => item.code === 'MOTION_REDUCED_VARIANT_MISSING'));
});

test('motion audit rejects linear positional motion and animated layout properties', () => {
  const report = analyzeMotionSystem({
    animations: [{ name: 'slide', purpose: 'continuity', durationMs: 300, easing: 'linear', properties: ['transform', 'width'], interruptible: true }],
    reducedMotion: REDUCED
  });
  const codes = report.findings.map((item) => item.code);
  assert.ok(codes.includes('MOTION_LINEAR_POSITIONAL'));
  assert.ok(codes.includes('MOTION_LAYOUT_PROPERTY_ANIMATED'));
});

test('non-interruptible motion on a frequent action is a blocker', () => {
  const report = analyzeMotionSystem({
    animations: [{ name: 'row-expand', purpose: 'continuity', durationMs: 240, easing: 'ease-out', properties: ['transform'], interruptible: false, frequent: true }],
    reducedMotion: REDUCED
  });
  assert.equal(report.ok, false);
  assert.ok(report.hardFailures.some((item) => item.code === 'MOTION_NOT_INTERRUPTIBLE'));
});

test('a single easing curve across all motion is reported', () => {
  const report = analyzeMotionSystem({
    animations: [
      { name: 'a', purpose: 'feedback', durationMs: 100, easing: 'ease-out', properties: ['opacity'], interruptible: true },
      { name: 'b', purpose: 'feedback', durationMs: 120, easing: 'ease-out', properties: ['opacity'], interruptible: true },
      { name: 'c', purpose: 'feedback', durationMs: 140, easing: 'ease-out', properties: ['opacity'], interruptible: true }
    ],
    reducedMotion: REDUCED
  });
  assert.ok(report.findings.some((item) => item.code === 'MOTION_EASING_UNIFORM'));
});

test('unbounded stagger is reported', () => {
  const report = analyzeMotionSystem({
    animations: [{ name: 'list-enter', purpose: 'continuity', durationMs: 240, easing: 'ease-out', properties: ['transform'], interruptible: true, stagger: { stepMs: 40, count: 40 } }],
    reducedMotion: REDUCED
  });
  assert.ok(report.findings.some((item) => item.code === 'MOTION_STAGGER_UNBOUNDED'));
});
