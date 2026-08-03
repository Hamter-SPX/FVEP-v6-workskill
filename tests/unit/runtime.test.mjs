import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeRuntime } from '../../lib/browser-runtime.mjs';

test('summarizeRuntime filters allowed console errors and reports blocking failures', () => {
  const summary = summarizeRuntime({
    console: [{ type: 'error', text: 'ResizeObserver loop limit exceeded' }, { type: 'error', text: 'Unhandled application error' }],
    pageErrors: [], requestFailures: [], errorResponses: []
  }, { allowedConsolePatterns: ['ResizeObserver'], failOnConsoleError: true, failOnPageError: true, failOnRequestFailure: false });
  assert.equal(summary.consoleErrors.length, 1);
  assert.equal(summary.status, 'fail');
});

test('summarizeRuntime permits non-blocking request failures', () => {
  const summary = summarizeRuntime({ console: [], pageErrors: [], requestFailures: [{ url: 'analytics', failure: 'blocked' }], errorResponses: [] }, { allowedConsolePatterns: [], failOnConsoleError: true, failOnPageError: true, failOnRequestFailure: false });
  assert.equal(summary.status, 'pass');
});

test('summarizeRuntime can fail on unexpected HTTP errors while allowing declared patterns', () => {
  const summary = summarizeRuntime({
    console: [], pageErrors: [], requestFailures: [],
    errorResponses: [{ status: 404, url: 'https://app.test/api/missing' }, { status: 404, url: 'https://app.test/optional/avatar' }]
  }, {
    allowedConsolePatterns: [], allowedRequestPatterns: [], allowedResponsePatterns: ['optional/avatar'],
    failOnConsoleError: true, failOnPageError: true, failOnRequestFailure: false, failOnHttpError: true
  });
  assert.equal(summary.errorResponses.length, 1);
  assert.equal(summary.status, 'fail');
});
