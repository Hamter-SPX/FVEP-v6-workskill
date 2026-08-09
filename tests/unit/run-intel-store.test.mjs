import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openIntelStore, sqliteAvailable } from '../../lib/run-intel-store.mjs';

function tmpOut(prefix = 'run-intel-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runRow(outputDir, over = {}) {
  return {
    run_id: 'run-1',
    output_dir: outputDir,
    gate_outcome: 'fail',
    score: 0.5,
    blockers: 1,
    cases_count: 3,
    created_at: '2026-08-09T10:00:00.000Z',
    ...over,
  };
}

function findingRow(outputDir, over = {}) {
  return {
    run_id: 'run-1',
    output_dir: outputDir,
    source: 'mobile-checks',
    rule: 'maxEmptyCells',
    severity: 'blocker',
    case_key: 'home__mobile__default',
    device: 'iphone-14',
    detail_json: '{"emptyCells":9}',
    created_at: '2026-08-09T10:00:01.000Z',
    ...over,
  };
}

async function seed(store, outputDir) {
  await store.recordRun(runRow(outputDir));
  await store.recordRun(runRow(outputDir, { run_id: 'run-2', created_at: '2026-08-10T10:00:00.000Z' }));
  await store.recordFindings([
    findingRow(outputDir),
    findingRow(outputDir, {
      rule: 'tapTargetSize',
      severity: 'major',
      source: 'comparison',
      case_key: 'cart__mobile__default',
      device: 'pixel-7',
      created_at: '2026-08-09T11:00:00.000Z',
    }),
    findingRow(outputDir, { run_id: 'run-2', created_at: '2026-08-10T10:00:01.000Z' }),
  ]);
}

test('sqlite mode: mode/path honest + record + query round-trip + persistence', async (t) => {
  if (!(await sqliteAvailable())) {
    t.skip('node:sqlite unavailable in this engine');
    return;
  }
  const dir = tmpOut();
  const store = await openIntelStore(dir);
  assert.equal(store.mode, 'sqlite');
  assert.equal(path.basename(store.path), 'intel.sqlite');
  await seed(store, dir);

  const all = await store.queryFindings({ outputDir: dir });
  assert.equal(all.length, 3);
  assert.equal(all[0].run_id, 'run-2'); // newest first

  const runs = await store.listRuns({ outputDir: dir });
  assert.equal(runs.length, 2);
  assert.equal(runs[0].run_id, 'run-2'); // newest first
  assert.deepEqual(runs[1], runRow(dir));

  await store.close();
  await store.close(); // harmless to call twice

  const again = await openIntelStore(dir); // data persists across reopen
  assert.equal(again.mode, 'sqlite');
  assert.equal((await again.queryFindings({ outputDir: dir })).length, 3);
  assert.equal((await again.listRuns({ outputDir: dir })).length, 2);
  await again.close();
});

for (const [label, opts] of [['sqlite', {}], ['jsonl', { forceJsonl: true }]]) {
  test(`filters rule/source/device/caseKey/since + limit (${label} mode)`, async (t) => {
    if (label === 'sqlite' && !(await sqliteAvailable())) {
      t.skip('node:sqlite unavailable in this engine');
      return;
    }
    const dir = tmpOut();
    const store = await openIntelStore(dir, opts);
    assert.equal(store.mode, label);
    await seed(store, dir);

    assert.equal((await store.queryFindings({ outputDir: dir, rule: 'maxEmptyCells' })).length, 2);
    assert.equal((await store.queryFindings({ outputDir: dir, source: 'comparison' })).length, 1);
    assert.equal((await store.queryFindings({ outputDir: dir, device: 'pixel-7' })).length, 1);
    assert.equal((await store.queryFindings({ outputDir: dir, caseKey: 'cart__mobile__default' })).length, 1);

    const since = await store.queryFindings({ outputDir: dir, since: '2026-08-10T00:00:00.000Z' });
    assert.equal(since.length, 1);
    assert.equal(since[0].run_id, 'run-2');

    const limited = await store.queryFindings({ outputDir: dir, limit: 1 });
    assert.equal(limited.length, 1);
    assert.equal(limited[0].created_at, '2026-08-10T10:00:01.000Z'); // newest first

    assert.equal((await store.queryFindings({ outputDir: tmpOut() })).length, 0); // foreign scope
    await store.close();
  });
}

test('jsonl fallback: file layout + valid JSON lines + run_id collision (last wins)', async () => {
  const dir = tmpOut();
  const store = await openIntelStore(dir, { forceJsonl: true });
  assert.equal(store.mode, 'jsonl');
  assert.equal(store.path, path.join(dir, '.fx', 'intel', 'findings.jsonl'));
  await seed(store, dir);

  const runsText = fs.readFileSync(path.join(dir, '.fx', 'intel', 'runs.jsonl'), 'utf8');
  const runLines = runsText.trim().split('\n');
  assert.equal(runLines.length, 2);
  for (const line of runLines) assert.ok(JSON.parse(line).run_id);

  const findingsText = fs.readFileSync(path.join(dir, '.fx', 'intel', 'findings.jsonl'), 'utf8');
  assert.equal(findingsText.trim().split('\n').length, 3);

  await store.recordRun(runRow(dir, { gate_outcome: 'pass' })); // re-record same run_id
  const runs = await store.listRuns({ outputDir: dir });
  assert.equal(runs.length, 2);
  assert.equal(runs.find((r) => r.run_id === 'run-1').gate_outcome, 'pass'); // last write wins
  assert.deepEqual(runs.map((r) => r.run_id), ['run-1', 'run-2']); // re-recorded run becomes newest
  await store.close();
});

test('jsonl store on empty dir: queries return [] without throwing', async () => {
  const dir = tmpOut();
  const store = await openIntelStore(dir, { forceJsonl: true });
  assert.deepEqual(await store.queryFindings({ outputDir: dir }), []);
  assert.deepEqual(await store.listRuns({ outputDir: dir }), []);
  await store.close();
});

test('close() idempotent + Symbol.dispose exposed (both modes)', async (t) => {
  for (const opts of [{}, { forceJsonl: true }]) {
    if (!opts.forceJsonl && !(await sqliteAvailable())) {
      t.skip('node:sqlite unavailable in this engine');
      return;
    }
    const store = await openIntelStore(tmpOut(), opts);
    await store.close();
    await store.close();
    if (typeof Symbol.dispose === 'symbol') {
      assert.equal(typeof store[Symbol.dispose], 'function');
      store[Symbol.dispose]();
    }
  }
});
