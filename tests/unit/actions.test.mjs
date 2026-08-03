import test from 'node:test';
import assert from 'node:assert/strict';
import { actionNeedsSelector, supportedActionTypes, validateAction, validateActions } from '../../lib/actions.mjs';

test('supported actions expose explicit selector requirements', () => {
  assert.ok(supportedActionTypes().includes('click'));
  assert.ok(supportedActionTypes().includes('evaluate'));
  assert.equal(actionNeedsSelector('click'), true);
  assert.equal(actionNeedsSelector('wait'), false);
});

test('validateAction rejects incomplete and unknown actions', () => {
  assert.throws(() => validateAction({ type: 'click' }), /selector/i);
  assert.throws(() => validateAction({ type: 'fill', selector: '#email' }), /value/i);
  assert.throws(() => validateAction({ type: 'destroyDatabase' }), /unsupported/i);
});

test('validateActions accepts a complete state sequence', () => {
  assert.doesNotThrow(() => validateActions([
    { type: 'click', selector: '[data-open]' },
    { type: 'fill', selector: '#email', value: 'demo@example.com' },
    { type: 'press', selector: '#email', key: 'Enter' },
    { type: 'wait', ms: 100 }
  ]));
});
