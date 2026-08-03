import test from 'node:test';
import assert from 'node:assert/strict';
import { renderProcessMarkdown } from '../../lib/process-report.mjs';

test('process Markdown report exposes decision quality confidence sections and next actions', () => {
  const markdown = renderProcessMarkdown({
    project: { name: 'Example' }, generatedAt: '2026-07-27T12:00:00.000Z', status: 'fail',
    processGate: { releaseEligible: false, qualityScore: 98, evidenceConfidence: 75, hardFailures: [{ code: 'REVIEW_MISSING', message: 'review missing' }], sections: { review: { status: 'missing', score: null, evidenceConfidence: 0 } } },
    nextActions: ['complete-review'], verificationGaps: ['review evidence absent']
  });
  assert.match(markdown, /Process decision: BLOCKED/);
  assert.match(markdown, /Quality score: 98/);
  assert.match(markdown, /Evidence confidence: 75%/);
  assert.match(markdown, /REVIEW_MISSING/);
  assert.match(markdown, /complete-review/);
});
