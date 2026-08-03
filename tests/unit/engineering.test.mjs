import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEngineeringCheck, parseEngineeringCommand } from '../../lib/engineering.mjs';

test('normalizeEngineeringCheck defaults to shell-free execution', () => {
  assert.deepEqual(normalizeEngineeringCheck({ name: 'typecheck', command: 'npm run typecheck' }, 0), {
    name: 'typecheck', command: 'npm run typecheck', cwd: null, timeoutMs: 120000, required: true, allowShell: false
  });
  assert.throws(() => normalizeEngineeringCheck({ name: 'bad' }, 0), /command/i);
});

test('parseEngineeringCommand preserves quoted arguments without invoking a shell', () => {
  assert.deepEqual(parseEngineeringCommand('npm run test -- --grep "checkout flow"'), {
    executable: 'npm', args: ['run', 'test', '--', '--grep', 'checkout flow']
  });
});

test('parseEngineeringCommand rejects shell operators by default', () => {
  assert.throws(() => parseEngineeringCommand('npm test && rm -rf build'), /shell operator/i);
  assert.throws(() => parseEngineeringCommand('echo $(cat secret.txt)'), /shell operator/i);
});

test('normalizeEngineeringCheck requires explicit opt-in for shell execution', () => {
  const normalized = normalizeEngineeringCheck({ name: 'pipeline', command: 'npm test && npm run build', allowShell: true }, 0);
  assert.equal(normalized.allowShell, true);
});
