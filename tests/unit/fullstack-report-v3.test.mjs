import test from 'node:test';
import assert from 'node:assert/strict';
import { renderFullstackMarkdown } from '../../lib/fullstack-report.mjs';

test('fullstack Markdown report exposes decision, score, confidence, gates, findings, and verification gaps', () => {
  const markdown = renderFullstackMarkdown({
    generatedAt: '2026-07-27T00:00:00.000Z',
    project: { name: 'Demo' },
    quality: { passed: false, score: 91, confidence: 72, grade: 'A', hardFailures: ['security'], gates: { security: { status: 'fail', score: 40, evidenceConfidence: 100 }, observability: { status: 'warning', score: 85, evidenceConfidence: 40 } } },
    findings: [{ code: 'security-authz', severity: 'blocker', message: 'Authorization missing', path: 'controls.authorization' }],
    verificationGaps: ['Production traces were not connected.']
  });
  assert.match(markdown, /Release decision: BLOCKED/);
  assert.match(markdown, /Quality score: 91/);
  assert.match(markdown, /Evidence confidence: 72%/);
  assert.match(markdown, /security-authz/);
  assert.match(markdown, /Production traces were not connected/);
});
