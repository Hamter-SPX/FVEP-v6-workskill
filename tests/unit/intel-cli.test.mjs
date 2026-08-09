/**
 * CLI pins for scripts/intel.mjs (npm run intel) plus the shared
 * formatIntelAdvisory formatter the vision-loop summary block consumes.
 * CLI tests spawn the real script against a tmp store seeded through
 * lib/run-intel-store (mode-agnostic: whatever backend the engine provides):
 * help, text report, --json, --window-days filtering, and the --purge/--yes
 * refusal+confirmation flow.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { openIntelStore } from '../../lib/run-intel-store.mjs';
import { formatIntelAdvisory } from '../../lib/run-intel-engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(root, 'scripts', 'intel.mjs');
const DAY_MS = 24 * 60 * 60 * 1000;
const isoAt = (daysBack) => new Date(Date.now() - daysBack * DAY_MS).toISOString();

function tmpOut() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'intel-cli-'));
}

function runCli(argv) {
  return spawnSync(process.execPath, [SCRIPT, ...argv], { encoding: 'utf8', timeout: 120_000 });
}

// Two failing runs of the same (rule, case): enough for both the recurring
// and the streak insights under the engine defaults. `daysBack` is given
// newest-first; insertion happens oldest-first so store order is chronological.
async function seedTwoRuns(dir, daysBack = [0, 1]) {
  const store = await openIntelStore(dir);
  for (const back of [...daysBack].reverse()) {
    const runId = `run-${back}`;
    await store.recordRun({
      run_id: runId,
      output_dir: dir,
      gate_outcome: 'fail',
      score: 40,
      blockers: 1,
      cases_count: 1,
      created_at: isoAt(back),
    });
    await store.recordFindings([{
      run_id: runId,
      output_dir: dir,
      source: 'mobile-checks',
      rule: 'maxEmptyCells',
      severity: 'fail',
      case_key: 'home',
      device: null,
      detail_json: '{}',
      created_at: isoAt(back),
    }]);
  }
  store.close();
  return dir;
}

test('intel --help exits zero and documents every promised flag', () => {
  for (const flag of ['--help', '-h']) {
    const result = runCli([flag]);
    assert.equal(result.status ?? 0, 0, result.stderr);
    assert.match(result.stdout, /Usage:/);
    for (const option of ['--output-dir', '--window-days', '--json', '--purge', '--yes', '--help']) {
      assert.ok(result.stdout.includes(option), `help must mention ${option}`);
    }
  }
});

test('intel text report prints recurring + streak insights and exits 0', async () => {
  const dir = await seedTwoRuns(tmpOut());
  const result = runCli(['-o', dir]);
  assert.equal(result.status ?? 0, 0, result.stderr);
  assert.match(result.stdout, /Run intelligence: 2 run\(s\), 2 finding\(s\) over the last 14 day\(s\)/);
  assert.match(result.stdout, /rule 'maxEmptyCells' เกิด 2 ครั้งใน 2 รันที่บันทึก/);
  assert.match(result.stdout, /สตรีค/);
  assert.match(result.stdout, /rule 'maxEmptyCells' ล้มติดกัน 2 รัน/);
  assert.match(result.stdout, /exit code is 0 regardless/);
});

test('intel --json prints the full analysis envelope', async () => {
  const dir = await seedTwoRuns(tmpOut());
  const result = runCli(['--output-dir', dir, '--json']);
  assert.equal(result.status ?? 0, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.outputDir, dir);
  assert.equal(body.windowDays, 14);
  assert.equal(body.totals.runsInWindow, 2);
  assert.equal(body.totals.findingsInWindow, 2);
  assert.equal(body.recurring[0].rule, 'maxEmptyCells');
  assert.equal(body.recurring[0].occurrences, 2);
  assert.equal(body.streaks[0].consecutiveFailures, 2);
});

test('intel --window-days bounds the window; invalid values fail', async () => {
  const dir = await seedTwoRuns(tmpOut(), [0, 10]);
  const narrow = runCli(['-o', dir, '--window-days', '1', '--json']);
  assert.equal(narrow.status ?? 0, 0, narrow.stderr);
  assert.equal(JSON.parse(narrow.stdout).totals.runsInWindow, 1);
  const wide = runCli(['-o', dir, '--window-days', '30', '--json']);
  assert.equal(wide.status ?? 0, 0, wide.stderr);
  assert.equal(JSON.parse(wide.stdout).totals.runsInWindow, 2);
  const invalid = runCli(['-o', dir, '--window-days', 'abc']);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /--window-days must be a positive number/);
});

test('intel on an empty store prints the no-insights line and exits 0', () => {
  const result = runCli(['-o', tmpOut()]);
  assert.equal(result.status ?? 0, 0, result.stderr);
  assert.match(result.stdout, /Run intelligence: 0 run\(s\), 0 finding\(s\)/);
  assert.match(result.stdout, /ยังไม่มี insight/);
});

test('intel --purge refuses without --yes, deletes + reports files with it', async () => {
  const dir = await seedTwoRuns(tmpOut());
  const intelDir = path.join(dir, '.fx', 'intel');
  assert.ok(fs.existsSync(intelDir), 'seeded store must exist');

  const refused = runCli(['-o', dir, '--purge']);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /pass --yes/);
  assert.ok(fs.existsSync(intelDir), 'refused purge must not touch the store');

  const purged = runCli(['-o', dir, '--purge', '--yes']);
  assert.equal(purged.status ?? 0, 0, purged.stderr);
  assert.match(purged.stdout, /Purged run-intelligence store: [1-9]\d* file\(s\) deleted/);
  assert.match(purged.stdout, /intel\.sqlite|runs\.jsonl/); // backend-dependent file naming
  assert.ok(!fs.existsSync(intelDir), 'purge must remove the intel directory');

  const again = runCli(['-o', dir, '--purge', '--yes']);
  assert.equal(again.status ?? 0, 0, again.stderr);
  assert.match(again.stdout, /nothing to purge/);
});

test('formatIntelAdvisory renders the brief formats, capped at two lines', () => {
  const analysis = {
    recurring: [
      { rule: 'maxEmptyCells', occurrences: 3, lastSeenRunId: 'R1', sources: ['mobile-checks'], cases: { home: 3 }, devices: {} },
      { rule: 'ignored-beyond-cap', occurrences: 2, lastSeenRunId: 'R1', sources: [], cases: {}, devices: {} },
    ],
    streaks: [
      { rule: 'tapTargetSize', case_key: 'cart', device: null, consecutiveFailures: 2, lastRunId: 'R1' },
      { rule: 'also-cut', case_key: null, device: null, consecutiveFailures: 2, lastRunId: 'R1' },
    ],
  };
  const lines = formatIntelAdvisory(analysis, { windowDays: 14 });
  assert.deepEqual(lines, [
    'สถิติ run: rule \'maxEmptyCells\' เกิด 3 ครั้งในช่วง 14 วัน — ตรวจ home',
    'สตรีค: rule \'tapTargetSize\' ล้มติดกัน 2 รัน',
  ]);
  // streak-only history renders the streak form alone
  assert.deepEqual(
    formatIntelAdvisory({ recurring: [], streaks: [analysis.streaks[0]] }),
    ['สตรีค: rule \'tapTargetSize\' ล้มติดกัน 2 รัน'],
  );
  // a recurring rule without case keys omits the "— ตรวจ X" suffix
  assert.deepEqual(
    formatIntelAdvisory({ recurring: [{ rule: 'visual-diff', occurrences: 2, cases: {} }], streaks: [] }),
    ['สถิติ run: rule \'visual-diff\' เกิด 2 ครั้งในช่วง 14 วัน'],
  );
  assert.deepEqual(formatIntelAdvisory({ recurring: [], streaks: [] }), []);
  assert.deepEqual(formatIntelAdvisory(undefined), []);
});
