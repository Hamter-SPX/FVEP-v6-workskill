import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, renderComparisonReport, summarizeComparisons } from '../../lib/report.mjs';

test('escapeHtml prevents report injection', () => {
  assert.equal(escapeHtml('<script>"x" & y</script>'), '&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;');
});

test('comparison summary and report preserve evidence and missing-image states', () => {
  const comparisons = [{ key: 'home__desktop__default', severity: 'blocker', acceptedByNumericGate: false, mismatchRatio: null, referenceRelative: null, currentRelative: 'current/a.png', diffRelative: null, notes: ['Missing reference.'] }];
  const summary = summarizeComparisons(comparisons);
  assert.equal(summary.blockers, 1);
  const html = renderComparisonReport({ title: 'Vision <Loop>', generatedAt: '2026-07-27T00:00:00Z', summary, comparisons });
  assert.match(html, /Vision &lt;Loop&gt;/);
  assert.match(html, /Missing reference/);
  assert.doesNotMatch(html, /src="null"/);
});
