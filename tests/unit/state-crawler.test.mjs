import test from 'node:test';
import assert from 'node:assert/strict';
import { compareStyleSnapshots, evaluateStateFeedback } from '../../lib/state-crawler-engine.mjs';

test('style snapshots report only meaningful changed properties', () => {
  const result = compareStyleSnapshots({ color: 'rgb(0, 0, 0)', outlineWidth: '0px', opacity: '1' }, { color: 'rgb(255, 0, 0)', outlineWidth: '0px', opacity: '1' });
  assert.deepEqual(result.changed, [{ property: 'color', from: 'rgb(0, 0, 0)', to: 'rgb(255, 0, 0)' }]);
});

test('state feedback treats missing focus feedback as blocking and missing hover as warning', () => {
  const result = evaluateStateFeedback([{ key: 'save', base: { color: 'black' }, hover: { color: 'black' }, focus: { color: 'black' } }]);
  assert.equal(result.passed, false);
  assert.equal(result.missingFocusFeedback.length, 1);
  assert.equal(result.missingHoverFeedback.length, 1);
});
