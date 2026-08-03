import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateKeyboardProbe } from '../../lib/a11y-engine.mjs';

test('keyboard probe evaluation identifies invisible focus and offscreen stops', () => {
  const result = evaluateKeyboardProbe([
    { selector: '#ok', visible: true, inViewport: true, focusIndicator: { outlineStyle: 'solid', outlineWidth: '2px', boxShadow: 'none' } },
    { selector: '#bad', visible: true, inViewport: true, focusIndicator: { outlineStyle: 'none', outlineWidth: '0px', boxShadow: 'none' } },
    { selector: '#off', visible: true, inViewport: false, focusIndicator: { outlineStyle: 'solid', outlineWidth: '1px', boxShadow: 'none' } }
  ]);
  assert.deepEqual(result.invisibleFocus.map((item) => item.selector), ['#bad']);
  assert.deepEqual(result.offscreenFocus.map((item) => item.selector), ['#off']);
  assert.equal(result.passed, false);
});
