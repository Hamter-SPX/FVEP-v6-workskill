import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  TUTORIAL_STEPS,
  GOLDEN_PATH_GATE_ORDER,
  PACKAGE_ROOT,
  TOY_DIR,
  TRANSCRIPT_MAX_LINES,
  splitCommand,
  tailTranscript,
  runStep,
  renderStep,
  replayStep,
  createPrompter,
  prepareToyRun,
  cleanupToyRun
} from '../../lib/tutorial-engine.mjs';

const CLI_PATH = path.join(PACKAGE_ROOT, 'scripts', 'tutorial.mjs');
const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

function mockExec(canned = { exit: 0, stdout: 'ok', timedOut: false }) {
  const calls = [];
  const exec = (argv, options) => {
    calls.push({ argv, options });
    return { ...canned };
  };
  return { exec, calls };
}

// ---------------------------------------------------------------- step data

test('TUTORIAL_STEPS has exactly 8 steps in GOLDEN_PATH gate order', () => {
  assert.equal(TUTORIAL_STEPS.length, 8);
  assert.deepEqual(
    TUTORIAL_STEPS.map((step) => step.gate),
    GOLDEN_PATH_GATE_ORDER
  );
  assert.deepEqual(
    TUTORIAL_STEPS.map((step) => step.id),
    ['route', 'design-contract', 'plan', 'isolation', 'implement-tdd', 'quality-gate', 'verification', 'integrate']
  );
  assert.deepEqual(TUTORIAL_STEPS.map((step) => step.n), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('every "npm run X" step command exists in package.json scripts', () => {
  for (const step of TUTORIAL_STEPS) {
    if (!step.command) continue;
    const match = step.command.match(/^npm run ([^\s]+)/);
    if (!match) continue;
    assert.ok(
      Object.prototype.hasOwnProperty.call(packageJson.scripts, match[1]),
      `step "${step.id}" references missing npm script "${match[1]}"`
    );
  }
  // spot-check the tutorial entrypoint itself
  assert.equal(packageJson.scripts.tutorial, 'node scripts/tutorial.mjs');
});

test('every step carries thai-first content and a flow doc pointer', () => {
  for (const step of TUTORIAL_STEPS) {
    assert.match(step.title.th, /[ก-๙]/, `step ${step.id} needs thai title`);
    assert.equal(typeof step.why, 'string');
    assert.match(step.why, /[ก-๙]/, `step ${step.id} needs thai why`);
    assert.equal(typeof step.learn, 'string');
    assert.match(step.learn, /[ก-๙]/, `step ${step.id} needs thai learning point`);
    assert.ok(fs.existsSync(path.join(PACKAGE_ROOT, step.flowDoc)), `step ${step.id} flow doc missing: ${step.flowDoc}`);
  }
});

// ------------------------------------------------------------------- runner

test('splitCommand splits shell words, strips quotes, keeps no empty tokens', () => {
  assert.deepEqual(splitCommand('node scripts/route-skills.mjs --input /tmp/toy/.fvep/request.json'), [
    'node',
    'scripts/route-skills.mjs',
    '--input',
    '/tmp/toy/.fvep/request.json'
  ]);
  assert.deepEqual(splitCommand('git commit -m "feat: hello world"'), ['git', 'commit', '-m', 'feat: hello world']);
  assert.deepEqual(splitCommand("echo  'a b'   c"), ['echo', 'a b', 'c']);
  assert.throws(() => splitCommand(''));
  assert.throws(() => splitCommand('   '));
});

test('runStep documented step never executes and reports note status', () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === 'design-contract');
  const { exec, calls } = mockExec();
  const result = runStep(step, { toyDir: '/tmp/whatever', exec });
  assert.equal(calls.length, 0);
  assert.equal(result.exit, null);
  assert.equal(result.stdout, '');
  assert.equal(result.timedOut, false);
  assert.equal(result.status, 'note');
  assert.equal(result.source, 'documented');
});

test('runStep requires an explicit toyDir (no silent default onto the real example)', () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === 'route');
  const { exec, calls } = mockExec();
  assert.throws(() => runStep(step, { exec }), (error) => error instanceof TypeError && /toyDir is required/.test(error.message));
  assert.throws(() => runStep(step, { toyDir: '', exec }), TypeError);
  assert.equal(calls.length, 0, 'exec must not run without a sandbox');
});

test('runStep refuses mutating steps on the shipped example dir', () => {
  const isolation = TUTORIAL_STEPS.find((entry) => entry.id === 'isolation'); // has setup (git init/switch)
  const tdd = TUTORIAL_STEPS.find((entry) => entry.id === 'implement-tdd'); // red variant hides src/slug.js
  const qualityGate = TUTORIAL_STEPS.find((entry) => entry.id === 'quality-gate'); // setup writes .fvep/artifacts
  const route = TUTORIAL_STEPS.find((entry) => entry.id === 'route'); // read-only
  const { exec, calls } = mockExec();
  const refusal = /refusing to run mutating step .* on the shipped example — pass a sandbox tmp dir/;
  assert.throws(() => runStep(isolation, { toyDir: TOY_DIR, exec }), refusal);
  assert.throws(() => runStep(tdd, { toyDir: TOY_DIR, exec, variant: 'red' }), refusal);
  assert.throws(() => runStep(qualityGate, { toyDir: TOY_DIR, exec }), refusal);
  assert.equal(calls.length, 0, 'no mutating command may execute on the shipped example');
  const result = runStep(route, { toyDir: TOY_DIR, exec });
  assert.equal(result.status, 'pass', 'read-only steps may still target the shipped example');
  assert.equal(calls.length, 1);
});

test('runStep mock exec: pass when exit matches expectation, argv and cwd resolved', () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === 'route');
  const { exec, calls } = mockExec({ exit: 0, stdout: '{"status":"pass"}', timedOut: false });
  const result = runStep(step, { toyDir: '/tmp/toy-copy', exec });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].argv, ['node', 'scripts/route-skills.mjs', '--input', '/tmp/toy-copy/.fvep/request.json']);
  assert.equal(calls[0].options.cwd, PACKAGE_ROOT);
  assert.equal(result.exit, 0);
  assert.equal(result.stdout, '{"status":"pass"}');
  assert.equal(result.timedOut, false);
  assert.equal(result.status, 'pass');
  assert.equal(result.source, 'run');
});

test('runStep mock exec: unexpected exit and timeout become warn', () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === 'route');
  const mismatch = mockExec({ exit: 1, stdout: 'boom', timedOut: false });
  assert.equal(runStep(step, { toyDir: '/tmp/toy', exec: mismatch.exec }).status, 'warn');
  const timedOut = mockExec({ exit: 1, stdout: '', timedOut: true });
  const late = runStep(step, { toyDir: '/tmp/toy', exec: timedOut.exec });
  assert.equal(late.status, 'warn');
  assert.equal(late.timedOut, true);
});

test('runStep isolation step runs git setup commands inside the toy first', () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === 'isolation');
  const { exec, calls } = mockExec({ exit: 0, stdout: '', timedOut: false });
  const result = runStep(step, { toyDir: '/tmp/toy-copy', exec });
  assert.equal(result.status, 'pass');
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0].argv, ['git', 'init', '-b', 'main', '-q']);
  assert.deepEqual(calls[1].argv, ['git', 'switch', '-c', 'feature/slugify-helper']);
  assert.equal(calls[0].options.cwd, '/tmp/toy-copy');
  assert.equal(calls[1].options.cwd, '/tmp/toy-copy');
  assert.equal(calls[2].options.cwd, PACKAGE_ROOT);
});

test('runStep red variant hides the production file during exec and restores it', () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === 'implement-tdd');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fvep-engine-test-'));
  try {
    fs.mkdirSync(path.join(dir, 'src'));
    const source = path.join(dir, 'src', 'slug.js');
    fs.writeFileSync(source, 'export const slugify = () => "x";\n');
    const seen = [];
    const exec = () => {
      seen.push({ hidden: fs.existsSync(source), stashed: fs.existsSync(`${source}.__tutorial-hidden`) });
      return { exit: 1, stdout: 'Cannot find module', timedOut: false };
    };
    const red = runStep(step, { toyDir: dir, exec, variant: 'red' });
    assert.equal(red.variant, 'red');
    assert.equal(red.expectExit, 1);
    assert.equal(red.status, 'pass', 'exit 1 passes when the RED variant expects 1');
    assert.deepEqual(seen, [{ hidden: false, stashed: true }]);
    assert.equal(fs.existsSync(source), true, 'file restored after run');
    assert.equal(fs.existsSync(`${source}.__tutorial-hidden`), false);

    const green = runStep(step, { toyDir: dir, exec: () => ({ exit: 0, stdout: 'pass 5', timedOut: false }), variant: 'green' });
    assert.equal(green.variant, 'green');
    assert.equal(green.status, 'pass');

    assert.throws(() => runStep(step, { toyDir: dir, exec: () => ({ exit: 0, stdout: '', timedOut: false }), variant: 'purple' }));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('runStep setup failure stops the step and reports warn', () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === 'isolation');
  const exec = (argv) => (argv[0] === 'git' ? { exit: 128, stdout: 'git missing', timedOut: false } : { exit: 0, stdout: '', timedOut: false });
  const result = runStep(step, { toyDir: '/tmp/toy', exec });
  assert.equal(result.status, 'warn');
  assert.match(result.stdout, /setup/);
});

// ------------------------------------------------------------------ replay

test('replayStep summarizes committed artifacts from the toy', () => {
  const route = TUTORIAL_STEPS.find((entry) => entry.id === 'route');
  const result = replayStep(route, TOY_DIR);
  assert.equal(result.source, 'replay');
  assert.equal(result.status, 'note');
  assert.match(result.stdout, /route\.report\.json/);
  assert.match(result.stdout, /status: pass/);
  assert.match(result.stdout, /required skills: .*brainstorming/);
});

test('replayStep is honest when the toy keeps no artifact for a step', () => {
  const fake = { id: 'nowhere', flowDoc: 'flow/brainstorming.md', replay: ['.fvep/no-such-report.json'] };
  const result = replayStep(fake, TOY_DIR);
  assert.equal(result.source, 'missing');
  assert.equal(result.status, 'note');
  assert.match(result.stdout, /ไม่มี committed artifact/);
});

// ------------------------------------------------------------------ render

test('renderStep includes every required field and caps the transcript', () => {
  const step = TUTORIAL_STEPS[0];
  const longOutput = Array.from({ length: 60 }, (_, index) => `line ${index + 1}`).join('\n');
  const block = renderStep(step, { exit: 0, stdout: longOutput, timedOut: false, status: 'pass', source: 'run', expectExit: 0 }, { mode: 'auto', stepIndex: 1, totalSteps: 8 });
  assert.match(block, /^─+$/m, 'separator line');
  assert.match(block, /ขั้นที่ 1\/8 · gate 0 ·/);
  assert.match(block, /Route/);
  assert.match(block, /\[RUN\]/);
  assert.match(block, /สถานะ: PASS \(ผ่าน\)/);
  assert.match(block, new RegExp(`เหตุผล: ${step.why.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(block, /คำสั่ง: \$ npm run process:route -- --input \.fvep\/request\.json/);
  assert.match(block, /── RUN transcript/);
  assert.match(block, new RegExp(`บทเรียน: ${step.learn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(block, /line 60/);
  assert.doesNotMatch(block, /line 29/, 'keeps only the tail');
  const transcriptLines = block.split('\n').filter((line) => line.startsWith('  line '));
  assert.ok(transcriptLines.length <= TRANSCRIPT_MAX_LINES, `transcript ≤ ${TRANSCRIPT_MAX_LINES} lines`);
});

test('renderStep marks documented steps and off-mode replays distinctly', () => {
  const design = TUTORIAL_STEPS[1];
  const documented = renderStep(design, replayStep(design, TOY_DIR), { mode: 'auto', stepIndex: 2, totalSteps: 8 });
  assert.match(documented, /\[DOCUMENTED\]/);
  assert.match(documented, /── DOCUMENTED/);
  assert.match(documented, /ไม่มีคำสั่งรัน/);
  assert.match(documented, /design\.json/);
  assert.match(documented, /approval: approved/);

  const off = renderStep(design, replayStep(design, TOY_DIR), { mode: 'off', stepIndex: 2, totalSteps: 8 });
  assert.match(off, /\[OFF\]/);
  assert.match(off, /── REPLAY \[OFF\]/);
});

test('tailTranscript keeps the last lines only', () => {
  assert.deepEqual(tailTranscript('a\nb\nc', 2), ['b', 'c']);
  assert.deepEqual(tailTranscript('a', 30), ['a']);
});

// ----------------------------------------------------------------- prompter

function fakeReadline() {
  const emitter = new EventEmitter();
  const asked = [];
  return {
    asked,
    question(question, callback) { asked.push({ question, callback }); },
    on: emitter.on.bind(emitter),
    emit: emitter.emit.bind(emitter)
  };
}

test('createPrompter resolves trimmed answers for answered questions', async () => {
  const rl = fakeReadline();
  const prompter = createPrompter(rl);
  const first = prompter.ask('press enter ');
  rl.asked[0].callback('  green  ');
  assert.equal(await first, 'green');
  const second = prompter.ask('again ');
  rl.asked[1].callback('');
  assert.equal(await second, '');
});

test('createPrompter resolves null on interface close instead of dangling', async () => {
  const rl = fakeReadline();
  const prompter = createPrompter(rl);
  const pending = prompter.ask('about to close ');
  rl.emit('close');
  assert.equal(await pending, null, 'EOF must quietly resolve the pending prompt');
  const after = await prompter.ask('never asked ');
  assert.equal(after, null, 'asks after close resolve null immediately');
  assert.equal(rl.asked.length, 1, 'a closed interface is never questioned again');
});

// ------------------------------------------------------------------ sandbox

test('prepareToyRun copies the toy and cleanup removes only the sandbox', () => {
  const before = fs.readFileSync(path.join(TOY_DIR, 'test', 'slug.test.mjs'), 'utf8');
  const srcPackage = fs.readFileSync(path.join(TOY_DIR, 'package.json'), 'utf8');
  const tmpDir = prepareToyRun(TOY_DIR);
  try {
    assert.equal(path.dirname(tmpDir), os.tmpdir().replace(/[\\/]+$/, ''), 'sandbox lives under os.tmpdir()');
    assert.ok(path.basename(tmpDir).startsWith('fvep-tutorial-'));
    assert.equal(fs.readFileSync(path.join(tmpDir, 'test', 'slug.test.mjs'), 'utf8'), before);
    // source untouched
    assert.equal(fs.readFileSync(path.join(TOY_DIR, 'package.json'), 'utf8'), srcPackage);
    assert.equal(fs.readFileSync(path.join(TOY_DIR, 'test', 'slug.test.mjs'), 'utf8'), before);
  } finally {
    cleanupToyRun(tmpDir);
  }
  assert.equal(fs.existsSync(tmpDir), false);
  assert.throws(() => cleanupToyRun('/tmp'));
  assert.throws(() => cleanupToyRun(TOY_DIR));
});

test('prepareToyRun removes the orphan dir when the copy fails', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'fvep-engine-test-'));
  const unreadableSrc = path.join(base, 'locked-src');
  fs.mkdirSync(unreadableSrc);
  fs.writeFileSync(path.join(unreadableSrc, 'secret.txt'), 'x');
  fs.chmodSync(unreadableSrc, 0o000); // existsSync passes, cpSync throws EACCES
  const before = fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('fvep-tutorial-'));
  try {
    assert.throws(() => prepareToyRun(unreadableSrc));
    const after = fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('fvep-tutorial-'));
    assert.deepEqual(after, before, 'failed copy must not leave an orphan sandbox');
  } finally {
    fs.chmodSync(unreadableSrc, 0o700);
    fs.rmSync(base, { recursive: true, force: true });
  }
});

// --------------------------------------------------------------------- CLI

function runCli(cliArgs, options = {}) {
  return spawnSync(process.execPath, [CLI_PATH, ...cliArgs], {
    encoding: 'utf8',
    timeout: 180_000,
    cwd: PACKAGE_ROOT,
    ...options
  });
}

test('CLI --help prints usage without running anything', () => {
  const result = runCli(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /--auto/);
  assert.match(result.stdout, /--off/);
  assert.match(result.stdout, /--from/);
  assert.match(result.stdout, /--variant/);
});

test('CLI --off --auto replays 8 steps from committed artifacts without spawning', () => {
  const result = runCli(['--off', '--auto']);
  assert.equal(result.status, 0, result.stderr);
  const stepCount = (result.stdout.match(/ขั้นที่ \d\/8/g) ?? []).length;
  assert.equal(stepCount, 8);
  assert.match(result.stdout, /โหมด: OFF/);
  assert.match(result.stdout, /\[OFF\]/);
  assert.match(result.stdout, /ไม่ spawn คำสั่งจริง/);
  assert.match(result.stdout, /สรุป: 8 ขั้น/);
});

test('CLI --off --from 7 resumes from step 7 only', () => {
  const result = runCli(['--off', '--from', '7']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ขั้นที่ 7\/8/);
  assert.match(result.stdout, /ขั้นที่ 8\/8/);
  assert.doesNotMatch(result.stdout, /ขั้นที่ 1\/8/);
});

test('CLI --interactive falls back to AUTO when stdio is not a TTY (no prompt, no hang)', () => {
  const result = runCli(['--interactive', '--from', '8'], { input: '' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /โหมด: AUTO/);
  assert.doesNotMatch(result.stdout, /กด Enter/);
  assert.doesNotMatch(result.stdout, /เลือกรอบ TDD/);
});

test('CLI --json emits a single machine-readable summary', () => {
  const result = runCli(['--off', '--auto', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.ok, true);
  assert.equal(summary.mode, 'off');
  assert.equal(summary.steps.length, 8);
  assert.equal(summary.steps[4].id, 'implement-tdd');
});

test('CLI --json --keep keeps stdout JSON-parseable (keep notice goes to stderr)', () => {
  const result = runCli(['--auto', '--json', '--keep']);
  assert.equal(result.status, 0, result.stderr);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.ok, true);
  assert.equal(summary.mode, 'auto');
  assert.equal(summary.steps.length, 8);
  const kept = result.stderr.match(/sandbox ยังอยู่: (\S+)/);
  assert.ok(kept, 'keep notice printed on stderr');
  assert.equal(fs.existsSync(kept[1]), true, '--keep leaves the sandbox on disk');
  fs.rmSync(kept[1], { recursive: true, force: true });
});

test('CLI rejects an out-of-range --from', () => {
  const result = runCli(['--off', '--from', '99']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--from/);
});

test('CLI --auto (non-TTY default path) actually runs the whole path on a temp copy and exits 0', () => {
  const result = runCli(['--auto']);
  assert.equal(result.status, 0, `stderr: ${result.stderr}\nstdout tail: ${result.stdout.slice(-2000)}`);
  assert.ok(result.stdout.includes(`sandbox: ${path.join(os.tmpdir(), 'fvep-tutorial-')}`), `sandbox path under os.tmpdir(), got: ${result.stdout.split('\n')[2]}`);
  assert.match(result.stdout, /สถานะ: PASS \(ผ่าน\)/);
  assert.match(result.stdout, /Full-stack gate: PASS/);
  assert.match(result.stdout, /"implementationAllowed": true/);
  assert.match(result.stdout, /pass 5/);
  const stepCount = (result.stdout.match(/ขั้นที่ \d\/8/g) ?? []).length;
  assert.equal(stepCount, 8);
  assert.match(result.stdout, /Implement \(TDD loop\)/);
  assert.match(result.stdout, /Integrate/);
  assert.doesNotMatch(result.stdout, /WARN \(ต้องตรวจ\)/);
});

test('CLI --auto --variant red shows the failing first run and still passes the step', () => {
  const result = runCli(['--auto', '--from', '5', '--variant', 'red']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /expected exit 1 · RED/);
  assert.match(result.stdout, /Cannot find module/);
  assert.doesNotMatch(result.stdout, /WARN \(ต้องตรวจ\)/);
});

test('CLI --auto --from 3 resumes at step 3 and walks through step 8', () => {
  const result = runCli(['--auto', '--from', '3']);
  assert.equal(result.status, 0, `stderr: ${result.stderr}\nstdout tail: ${result.stdout.slice(-1200)}`);
  assert.match(result.stdout, /ขั้นที่ 3\/8/);
  assert.match(result.stdout, /ขั้นที่ 8\/8/);
  assert.doesNotMatch(result.stdout, /ขั้นที่ 1\/8/);
  assert.doesNotMatch(result.stdout, /ขั้นที่ 2\/8/);
  assert.match(result.stdout, /สรุป: 6 ขั้น · PASS 5 · NOTE 1 · WARN 0/);
});
