import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLooseArgs } from '../../lib/cli.mjs';

test('parseLooseArgs supports flags, equals syntax, typed values, and positionals', () => {
  assert.deepEqual(
    parseLooseArgs(['--config', 'custom.json', '--headed=false', '--threshold=0.12', '--baseline', 'extra']),
    { _: ['extra'], config: 'custom.json', headed: false, threshold: 0.12, baseline: true }
  );
});

test('parseLooseArgs treats json/yes/purge as booleans — never swallow positionals', () => {
  assert.deepEqual(parseLooseArgs(['--yes', '--purge', 'artifacts/vision-loop']),
    { _: ['artifacts/vision-loop'], yes: true, purge: true });
  assert.deepEqual(parseLooseArgs(['--purge', '--yes', 'artifacts/vision-loop']),
    { _: ['artifacts/vision-loop'], purge: true, yes: true });
  assert.deepEqual(parseLooseArgs(['--json', '--output-dir', 'd']),
    { _: [], json: true, 'output-dir': 'd' });
});
