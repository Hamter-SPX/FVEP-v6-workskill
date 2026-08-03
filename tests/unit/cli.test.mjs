import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLooseArgs } from '../../lib/cli.mjs';

test('parseLooseArgs supports flags, equals syntax, typed values, and positionals', () => {
  assert.deepEqual(
    parseLooseArgs(['--config', 'custom.json', '--headed=false', '--threshold=0.12', '--baseline', 'extra']),
    { _: ['extra'], config: 'custom.json', headed: false, threshold: 0.12, baseline: true }
  );
});
