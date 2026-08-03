import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTaskGraph } from '../../lib/task-graph-engine.mjs';

function task(id, dependsOn = [], files = [], resources = []) {
  return { id, dependsOn, files: { create: files, modify: [] }, resources, sharedState: [] };
}

test('independent tasks are placed in the same parallel wave', () => {
  const report = analyzeTaskGraph([
    task('api', [], ['lib/api.mjs']),
    task('ui', [], ['lib/ui.mjs']),
    task('docs', [], ['README.md'])
  ]);
  assert.equal(report.status, 'pass');
  assert.deepEqual(report.waves, [['api', 'docs', 'ui']]);
});

test('tasks touching the same file or exclusive resource are separated', () => {
  const report = analyzeTaskGraph([
    task('a', [], ['lib/shared.mjs'], ['db-fixture']),
    task('b', [], ['lib/shared.mjs'], []),
    task('c', [], ['lib/c.mjs'], ['db-fixture'])
  ]);
  assert.equal(report.status, 'warning');
  assert.equal(report.waves.flat().length, 3);
  assert.ok(report.conflicts.some((item) => item.kind === 'file' && item.tasks.includes('a') && item.tasks.includes('b')));
  assert.ok(report.conflicts.some((item) => item.kind === 'resource' && item.tasks.includes('a') && item.tasks.includes('c')));
  const waveIndex = Object.fromEntries(report.waves.flatMap((wave, index) => wave.map((id) => [id, index])));
  assert.notEqual(waveIndex.a, waveIndex.b);
  assert.notEqual(waveIndex.a, waveIndex.c);
});

test('dependency order is preserved across waves', () => {
  const report = analyzeTaskGraph([
    task('base'),
    task('api', ['base']),
    task('ui', ['base']),
    task('release', ['api', 'ui'])
  ]);
  assert.deepEqual(report.waves, [['base'], ['api', 'ui'], ['release']]);
});

test('dependency cycle blocks execution', () => {
  const report = analyzeTaskGraph([task('a', ['b']), task('b', ['a'])]);
  assert.equal(report.status, 'fail');
  assert.ok(report.hardFailures.some((item) => item.code === 'TASK_GRAPH_CYCLE'));
});
