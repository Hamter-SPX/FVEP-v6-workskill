import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Interactive onboarding engine: walks the GOLDEN_PATH gates on a temporary
// copy of examples/golden-path. The source example is never modified — runs
// happen only inside the sandbox returned by prepareToyRun.

export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TOY_DIR = path.join(PACKAGE_ROOT, 'examples', 'golden-path');
export const TUTORIAL_TMP_PREFIX = 'fvep-tutorial-';
export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_BUFFER = 8 * 1024 * 1024;
export const TRANSCRIPT_MAX_LINES = 30;
export const SEPARATOR_WIDTH = 78;

// GOLDEN_PATH.md gates; 1 (visual direction) is intentionally absent — the toy
// has no visual surface, and the path itself skips that gate explicitly for
// non-visual work.
export const GOLDEN_PATH_GATE_ORDER = [0, 2, 3, 4, 5, 6, 7, 8];

export const TUTORIAL_STEPS = [
  {
    n: 1,
    gate: 0,
    id: 'route',
    title: { th: 'Route — ให้เฟรมเวิร์กผูกวินัยจากคำขอ', en: 'Route' },
    why: 'ก่อนเขียนโค้ด เฟรมเวิร์กอ่าน .fvep/request.json แล้วผูก skills และข้อบังคับที่งานนี้ต้องใช้ — ถ้าขาด artifact รายงานจะบอกชื่อ blocker ตรง ๆ ไม่ให้เดา',
    en: 'Routes the declared request, binds the required skills, names blockers.',
    command: 'npm run process:route -- --input .fvep/request.json',
    flowDoc: 'flow/using-one-framework.md',
    learn: 'อ่าน status ในรายงานให้เป็น ไม่ใช่แค่ $? — รายงาน blocked ยัง exit 0 ได้',
    run: { command: 'node scripts/route-skills.mjs --input {toy}/.fvep/request.json', cwd: 'root', expectExit: 0 },
    replay: ['.fvep/reports/route.report.json']
  },
  {
    n: 2,
    gate: 2,
    id: 'design-contract',
    title: { th: 'Design contract — สัญญาออกแบบที่อนุมัติและ commit ได้', en: 'Design contract' },
    why: 'งานสร้างสรรค์ต้องมีสัญญาออกแบบที่ approved ก่อน implement — ถ้าไม่มี router จะบล็อกด้วย DESIGN_APPROVAL_REQUIRED',
    en: 'An approved design is a committed artifact, not a chat memory.',
    command: null,
    flowDoc: 'flow/brainstorming.md',
    learn: 'จดทางเลือก ข้อแลกเปลี่ยง และการอนุมัติลงไฟล์ — ขั้นนี้เป็น documented step เพราะดุลยพินิจเป็นของมนุษย์',
    run: null,
    replay: ['.fvep/design.json']
  },
  {
    n: 3,
    gate: 3,
    id: 'plan',
    title: { th: 'Plan — แผนที่เครื่องตรวจได้', en: 'Plan' },
    why: 'แผนต้อง executable: ทุก task มีไฟล์ interfaces และ steps RED→GREEN→commit และ dependency graph ห้ามวนลูป',
    en: 'Executable plan: files, interfaces, RED→GREEN→commit steps, acyclic graph.',
    command: 'npm run process:plan -- --input .fvep/plan.json',
    flowDoc: 'flow/writing-plans.md',
    learn: 'แผนที่เครื่องตรวจได้ทำให้งานแตกกลางทางแล้วกลับมาต่อจาก ledger ได้โดยไม่ต้องจำ',
    run: { command: 'node scripts/validate-plan.mjs --input {toy}/.fvep/plan.json', cwd: 'root', expectExit: 0 },
    replay: ['.fvep/reports/plan.report.json']
  },
  {
    n: 4,
    gate: 4,
    id: 'isolation',
    title: { th: 'Isolation — ทำงานบนพื้นที่แยกเสมอ', en: 'Isolation' },
    why: 'implement บน branch/worktree ที่แยกจาก main — engine ปฏิเสธการเขียนบน protected branch; walkthrough จริงใช้ branch feature/slugify-helper',
    en: 'Implement on an isolated branch or worktree; protected-branch writes are blocked.',
    command: 'npm run process:workspace -- --cwd .',
    flowDoc: 'flow/using-git-worktrees.md',
    learn: 'sandbox ของ tutorial ไม่มี .git ติดมา จึง git init + สร้าง feature branch ให้ใน sandbox ก่อนรันเกตนี้เสมอ',
    run: {
      cwd: 'root',
      command: 'node scripts/inspect-workspace.mjs --cwd {toy}',
      expectExit: 0,
      setup: [
        { command: 'git init -b main -q', cwd: 'toy', note: 'สร้าง repo จำลองใน sandbox (walkthrough จริงมี .git อยู่แล้ว)' },
        { command: 'git switch -c feature/slugify-helper', cwd: 'toy', note: 'สลับไป feature branch เหมือน walkthrough จริง' }
      ]
    },
    replay: ['.fvep/reports/workspace.report.json']
  },
  {
    n: 5,
    gate: 5,
    id: 'implement-tdd',
    title: { th: 'Implement — วงจร TDD (RED → GREEN)', en: 'Implement (TDD loop)' },
    why: 'เขียนเทสต์ก่อน (RED: ล้มเพราะยังไม่มี implementation) แล้วค่อย implement ให้ผ่าน (GREEN) — ทุกวงจรบันทึกพร้อม hash ใน .fvep/tdd-evidence.json',
    en: 'Test first, watch it fail for the right reason, then make it pass.',
    command: 'node --test test/slug.test.mjs',
    flowDoc: 'flow/test-driven-development.md',
    learn: 'RED ที่ถูกต้องคือล้มเพราะ behavior หาย (Cannot find module) ไม่ใช่ syntax ผิด — ลองอีกแบบด้วย --variant red',
    run: {
      defaultVariant: 'green',
      variants: {
        green: { cwd: 'toy', command: 'node --test test/slug.test.mjs', expectExit: 0, label: 'GREEN — เทสต์ผ่านหลัง implement แล้ว' },
        red: { cwd: 'toy', command: 'node --test test/slug.test.mjs', expectExit: 1, hideFile: 'src/slug.js', label: 'RED — ซ่อน src/slug.js ชั่วคราวใน sandbox เพื่อให้เห็นเทสต์ล้มก่อนมี implementation' }
      }
    },
    replay: ['.fvep/reports/tdd.report.json']
  },
  {
    n: 6,
    gate: 6,
    id: 'quality-gate',
    title: { th: 'Quality gate — เกต full-stack ตาม scope จริง', en: 'Quality gate' },
    why: 'audit:fullstack ตรวจทุก section ตาม config ที่ scope ตามความจริง — toy ปิด api/data/frontend เพราะไม่มี surface นั้นจริง ๆ ไม่ใช่เพราะขี้เกียจ',
    en: 'The full-stack gate re-normalizes over honestly scoped sections.',
    command: 'npm run audit:fullstack -- --config fullstack.config.json',
    flowDoc: 'flow/verification-before-completion.md',
    learn: 'scoping ต้องซื่อสัตย์: "ไม่มี HTTP surface" คือข้อเท็จจริง ไม่ใช่การหลบเกต (gate นี้อ่าน process-report จึงรัน process:audit เงียบ ๆ ใน setup ก่อน)',
    run: {
      cwd: 'root',
      command: 'node scripts/audit-fullstack.mjs --config {toy}/fullstack.config.json',
      expectExit: 0,
      setup: [
        { command: 'node scripts/audit-process.mjs --config {toy}/.fvep/process.config.json', cwd: 'root', note: 'เตรียม process-report ที่ full-stack gate ต้องอ่าน' }
      ]
    },
    replay: ['artifacts/fullstack-audit/reports/fullstack-report.json', '.fvep/artifacts/process-report.json']
  },
  {
    n: 7,
    gate: 7,
    id: 'verification',
    title: { th: 'Verification — หลักฐานสดและผูก hash ก่อนบอกว่าเสร็จ', en: 'Verify claims' },
    why: 'process audit รวมทุก contract (route/design/plan/workspace/tdd/review/claims/ledger) แล้วออก releaseEligible — claims ทุกตัวต้องมี evidence สดและผูก sha256 ของ artifact',
    en: 'Every claim is bound to fresh, hash-pinned evidence before shipping.',
    command: 'npm run process:audit -- --config .fvep/process.config.json',
    flowDoc: 'flow/verification-before-completion.md',
    learn: 'releaseEligible: true มาจากรายงาน ไม่ใช่จากความมั่นใจ — ของ toy ได้ qualityScore 100 และ hardFailures ว่าง',
    run: { command: 'node scripts/audit-process.mjs --config {toy}/.fvep/process.config.json', cwd: 'root', expectExit: 0 },
    replay: ['.fvep/artifacts/process-report.json']
  },
  {
    n: 8,
    gate: 8,
    id: 'integrate',
    title: { th: 'Integrate — merge/PR คือการตัดสินใจของมนุษย์', en: 'Integrate' },
    why: 'engine ตรวจ decision inputs (verification สด, commit inventory, base branch) แล้วคำนวณ allowedOptions — แต่จะไม่ merge ให้เองเด็ดขาด',
    en: 'The engine computes allowed options; a human merges, PRs, keeps, or discards.',
    command: 'npm run process:integration -- --input .fvep/integration.json',
    flowDoc: 'flow/finishing-a-development-branch.md',
    learn: 'status: decision-required คือฟีเจอร์ ไม่ใช่ตัวขวาง — จุดนี้ judgment เป็นของคุณ (walkthrough ก็ปล่อยขั้นนี้เป็น documented เช่นกัน)',
    run: null,
    replay: ['.fvep/integration.json']
  }
];

// ---------------------------------------------------------------------------
// command → argv (shell-word split, no empty tokens — spawnSync without shell)

export function splitCommand(command) {
  if (typeof command !== 'string' || command.trim() === '') {
    throw new Error(`splitCommand expects a non-empty command string, got: ${String(command)}`);
  }
  const words = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = pattern.exec(command)) !== null) {
    const word = match[1] ?? match[2] ?? match[3];
    if (word) words.push(word);
  }
  return words;
}

function resolveCwd(cwd, toyDir) {
  return cwd === 'toy' ? toyDir : PACKAGE_ROOT;
}

function resolveCommand(command, toyDir) {
  return command.replaceAll('{toy}', toyDir);
}

export function defaultExec(argv, { cwd, timeoutMs = DEFAULT_TIMEOUT_MS, maxBuffer = DEFAULT_MAX_BUFFER } = {}) {
  const env = { ...process.env };
  // A tutorial step may itself spawn `node --test`; never inherit a parent
  // test-runner context or the child would skip running files.
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd,
    env,
    timeout: timeoutMs,
    maxBuffer,
    encoding: 'utf8',
    shell: false
  });
  const timedOut = result.signal === 'SIGTERM' || (result.error && result.error.code === 'ETIMEDOUT') === true;
  const stdout = [result.stdout, result.stderr].filter((chunk) => typeof chunk === 'string' && chunk !== '').join('\n');
  return {
    exit: typeof result.status === 'number' ? result.status : 1,
    stdout,
    timedOut,
    error: result.error ? String(result.error.message ?? result.error) : null
  };
}

function resolveRunSpec(step, variant) {
  const spec = step.run;
  if (!spec.variants) return { spec, variantId: null };
  const requested = variant ?? spec.defaultVariant ?? 'green';
  const picked = spec.variants[requested];
  if (!picked) {
    throw new Error(`unknown variant "${requested}" for step "${step.id}" (have: ${Object.keys(spec.variants).join(', ')})`);
  }
  return { spec: picked, variantId: requested };
}

export function runStep(step, { toyDir, exec = defaultExec, variant, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (toyDir === undefined || toyDir === null || toyDir === '') {
    throw new TypeError('runStep: toyDir is required — pass a sandbox path from prepareToyRun() (never the shipped example itself)');
  }
  if (!step || !step.run) {
    return { exit: null, stdout: '', timedOut: false, status: 'note', source: 'documented' };
  }
  const startedAt = Date.now();
  const { spec, variantId } = resolveRunSpec(step, variant);
  const setupSteps = Array.isArray(spec.setup) ? spec.setup : [];
  const isMutating = setupSteps.length > 0 || Boolean(spec.hideFile);
  if (toyDir === TOY_DIR && isMutating) {
    throw new Error(`runStep: refusing to run mutating step "${step.id}" on the shipped example — pass a sandbox tmp dir`);
  }
  const setupNotes = [];
  for (const setup of setupSteps) {
    const argv = splitCommand(resolveCommand(setup.command, toyDir));
    const res = exec(argv, { cwd: resolveCwd(setup.cwd ?? 'root', toyDir), timeoutMs });
    setupNotes.push({ note: setup.note ?? null, argv, exit: res.exit, timedOut: res.timedOut === true });
    if (res.timedOut || res.exit !== 0) {
      return {
        exit: res.exit,
        stdout: `[setup ล้มเหลว: ${argv.join(' ')}]\n${res.stdout ?? ''}`,
        timedOut: res.timedOut === true,
        status: 'warn',
        source: 'run',
        variant: variantId,
        setupNotes,
        durationMs: Date.now() - startedAt
      };
    }
  }
  const hiddenPath = spec.hideFile ? path.join(toyDir, spec.hideFile) : null;
  const stashedPath = hiddenPath ? `${hiddenPath}.__tutorial-hidden` : null;
  try {
    if (hiddenPath && fs.existsSync(hiddenPath)) fs.renameSync(hiddenPath, stashedPath);
    const command = resolveCommand(spec.command, toyDir);
    const argv = splitCommand(command);
    const res = exec(argv, { cwd: resolveCwd(spec.cwd ?? 'root', toyDir), timeoutMs });
    const expected = spec.expectExit ?? 0;
    const ok = !res.timedOut && res.exit === expected;
    return {
      exit: res.exit,
      stdout: res.stdout ?? '',
      timedOut: res.timedOut === true,
      status: ok ? 'pass' : 'warn',
      source: 'run',
      variant: variantId,
      variantLabel: spec.label ?? null,
      expectExit: expected,
      argv,
      cwd: resolveCwd(spec.cwd ?? 'root', toyDir),
      setupNotes,
      durationMs: Date.now() - startedAt
    };
  } finally {
    if (stashedPath && fs.existsSync(stashedPath)) fs.renameSync(stashedPath, hiddenPath);
  }
}

// ---------------------------------------------------------------------------
// OFF mode / documented steps: replay committed artifacts instead of running

function summarizeJson(json) {
  const parts = [];
  if (!json || typeof json !== 'object') return parts;
  if (json.approval && typeof json.approval === 'object') {
    parts.push(`approval: ${json.approval.status ?? 'unknown'}${json.approval.actor ? ` · by ${json.approval.actor}` : ''}${json.approval.at ? ` · ${json.approval.at}` : ''}`);
  }
  if (Array.isArray(json.approaches)) {
    parts.push(`approaches compared: ${json.approaches.length} → แนะนำ: ${json.recommendation?.approachId ?? '-'}`);
  }
  if (typeof json.status === 'string') {
    parts.push(`status: ${json.status}${typeof json.ok === 'boolean' ? ` · ok: ${json.ok}` : ''}`);
  }
  if (typeof json.score === 'number') parts.push(`score: ${json.score}`);
  if (json.quality && typeof json.quality.score === 'number') parts.push(`quality: ${json.quality.score}`);
  if (typeof json.mode === 'string') parts.push(`mode: ${json.mode}`);
  const branch = typeof json.branch === 'string' ? json.branch : json.workspace?.branch;
  if (typeof branch === 'string') parts.push(`branch: ${branch}`);
  if (typeof json.implementationAllowed === 'boolean') parts.push(`implementationAllowed: ${json.implementationAllowed}`);
  if (Array.isArray(json.required) && json.required.length > 0) parts.push(`required skills: ${json.required.join(', ')}`);
  if (Array.isArray(json.cycles) && json.cycles.length > 0) {
    parts.push(`cycles: ${json.cycles.map((cycle) => `${cycle.id ?? '?'}:${cycle.classification ?? '?'}${cycle.accepted === true ? ' (accepted)' : ''}`).join(', ')}`);
  }
  if (json.verification && typeof json.verification === 'object') {
    parts.push(`verification: fullSuitePass=${json.verification.fullSuitePass} · fresh=${json.verification.fresh}`);
  }
  if (typeof json.baseBranch === 'string') parts.push(`base: ${json.baseBranch}`);
  if (Array.isArray(json.commitInventory)) {
    parts.push(`commits: ${json.commitInventory.length} (${json.commitInventory.map((entry) => String(entry).split(' ')[0]).join(', ')})`);
  }
  if (typeof json.releaseEligible === 'boolean') parts.push(`releaseEligible: ${json.releaseEligible}`);
  if (Array.isArray(json.hardFailures)) {
    parts.push(`hardFailures: ${json.hardFailures.length === 0 ? 'none' : json.hardFailures.map((finding) => finding.code ?? String(finding)).join(', ')}`);
  }
  if (parts.length === 0) parts.push(`keys: ${Object.keys(json).slice(0, 8).join(', ')}`);
  return parts;
}

export function replayStep(step, toyDir = TOY_DIR) {
  const files = Array.isArray(step?.replay) ? step.replay : [];
  const lines = [];
  let found = false;
  for (const rel of files) {
    const file = path.join(toyDir, rel);
    if (!fs.existsSync(file)) continue;
    found = true;
    lines.push(`${rel}:`);
    try {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      for (const line of summarizeJson(json)) lines.push(`  ${line}`);
    } catch {
      lines.push('  (อ่าน JSON ไม่ได้ — แสดงเฉพาะชื่อไฟล์)');
    }
  }
  if (!found) {
    return {
      exit: null,
      stdout: `ไม่มี committed artifact ของขั้นนี้ใน toy — ขั้นนี้คือ example state step (อ่าน ${step?.flowDoc ?? 'GOLDEN_PATH.md'} ประกอบ)`,
      timedOut: false,
      status: 'note',
      source: 'missing'
    };
  }
  return { exit: 0, stdout: lines.join('\n'), timedOut: false, status: 'note', source: 'replay' };
}

// ---------------------------------------------------------------------------
// rendering

export function tailTranscript(text, maxLines = TRANSCRIPT_MAX_LINES) {
  const lines = String(text).replace(/\r/g, '').split('\n');
  return lines.length <= maxLines ? lines : lines.slice(lines.length - maxLines);
}

const STATUS_WORD = {
  pass: 'PASS (ผ่าน)',
  warn: 'WARN (ต้องตรวจ)',
  note: 'NOTE (ทราบ)'
};

function sourceBadge(step, result, mode) {
  if (mode === 'off') return '[OFF]';
  if (!step.run || result.source === 'documented') return '[DOCUMENTED]';
  return '[RUN]';
}

function transcriptHeader(step, result, mode) {
  if (mode === 'off') return '── REPLAY [OFF] · สรุปจาก artifact ที่ commit ไว้ (ไม่ได้รันคำสั่งจริง) ──';
  if (!step.run || result.source === 'documented') return `── DOCUMENTED · ไม่รันคำสั่ง — สรุปสถานะตัวอย่างที่ commit ไว้ ──`;
  const bits = [`exit ${result.exit}`];
  if (typeof result.expectExit === 'number') bits.push(`expected exit ${result.expectExit}`);
  if (result.variantLabel) bits.push(result.variantLabel);
  if (result.timedOut) bits.push('TIMEOUT');
  return `── RUN transcript (tail ≤ ${TRANSCRIPT_MAX_LINES} บรรทัด · ${bits.join(' · ')}) ──`;
}

export function renderStep(step, result, { mode = 'auto', stepIndex = step.n, totalSteps = TUTORIAL_STEPS.length } = {}) {
  const safeResult = result ?? { exit: null, stdout: '', timedOut: false, status: 'note', source: 'documented' };
  const lines = [];
  lines.push('─'.repeat(SEPARATOR_WIDTH));
  lines.push(`ขั้นที่ ${stepIndex}/${totalSteps} · gate ${step.gate} · ${step.title.th} (${step.title.en}) ${sourceBadge(step, safeResult, mode)}`);
  lines.push(`สถานะ: ${STATUS_WORD[safeResult.status] ?? safeResult.status}`);
  lines.push('');
  lines.push(`เหตุผล: ${step.why}`);
  lines.push(`        ${step.en}`);
  if (step.command) lines.push(`คำสั่ง: $ ${step.command}`);
  else lines.push(`คำสั่ง: — documented step ไม่มีคำสั่งรัน (ดู ${step.flowDoc})`);
  if (step.flowDoc) lines.push(`flow doc: ${step.flowDoc}`);
  for (const note of safeResult.setupNotes ?? []) {
    if (note.note) lines.push(`setup (sandbox): ${note.note} [${note.argv.join(' ')} → exit ${note.exit}]`);
  }
  lines.push('');
  lines.push(transcriptHeader(step, safeResult, mode));
  const output = (safeResult.stdout ?? '').trimEnd();
  if (output) lines.push(...tailTranscript(output, TRANSCRIPT_MAX_LINES).map((line) => `  ${line}`));
  else lines.push('  (ไม่มี output)');
  lines.push('');
  lines.push(`บทเรียน: ${step.learn}`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// interactive prompting
//
// Wraps readline's rl.question so an interface that closes mid-prompt (Ctrl+D /
// EOF on stdin) resolves the pending question with null instead of leaving a
// dangling promise. Without this guard an unsettled top-level await makes the
// CLI exit 13 mid-walk and skips the finally block — leaking the sandbox.
// Callers must treat a null answer as "input closed: end the walk quietly".

export function createPrompter(rl) {
  const pending = new Set();
  let closed = false;
  rl.on('close', () => {
    closed = true;
    for (const settle of [...pending]) settle(null);
  });
  return {
    ask(question) {
      if (closed) return Promise.resolve(null);
      return new Promise((resolve) => {
        const settle = (answer) => {
          pending.delete(settle);
          resolve(typeof answer === 'string' ? answer.trim() : null);
        };
        pending.add(settle);
        rl.question(question, settle);
      });
    }
  };
}

// ---------------------------------------------------------------------------
// sandbox lifecycle
//
// The walk creates its sandbox before stepping and removes it in a finally —
// but Ctrl+C/SIGTERM skips the finally entirely, stranding the sandbox.
// registerSandboxCleanup installs one-shot SIGINT/SIGTERM handlers for exactly
// the sandbox lifetime: on a signal they run the provided cleanup (the sandbox
// getter may answer `null` before creation, after disposal, or in read-only
// modes) and exit with the conventional 128+signo code (130/143) without
// printing a summary. The returned disposer removes both handlers — callers
// MUST invoke it once the walk ends so no handlers outlive the sandbox.

export function registerSandboxCleanup({ getSandbox, cleanup, exit } = {}) {
  if (typeof getSandbox !== 'function') throw new TypeError('registerSandboxCleanup: getSandbox must be a function');
  if (typeof cleanup !== 'function') throw new TypeError('registerSandboxCleanup: cleanup must be a function');
  const exitProcess = typeof exit === 'function' ? exit : (code) => process.exit(code);
  const makeHandler = (signo) => () => {
    const sandbox = getSandbox();
    if (sandbox) cleanup(sandbox);
    exitProcess(128 + signo);
  };
  const onSigint = makeHandler(2); // 130
  const onSigterm = makeHandler(15); // 143
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  return () => {
    process.off('SIGINT', onSigint);
    process.off('SIGTERM', onSigterm);
  };
}

export function prepareToyRun(srcToyDir = TOY_DIR, { baseDir = os.tmpdir() } = {}) {
  if (!fs.existsSync(srcToyDir)) throw new Error(`toy source not found: ${srcToyDir}`);
  const tmpDir = fs.mkdtempSync(path.join(baseDir, TUTORIAL_TMP_PREFIX));
  try {
    fs.cpSync(srcToyDir, tmpDir, {
      recursive: true,
      verbatimSymlinks: true,
      filter: (source) => !['.git', 'node_modules'].includes(path.basename(source))
    });
  } catch (error) {
    fs.rmSync(tmpDir, { recursive: true, force: true }); // never leave an orphan sandbox behind
    throw error;
  }
  return tmpDir;
}

// Idempotent — force:true makes a repeat call (e.g. signal handler + finally)
// a no-op once the directory is gone; callers still guard with a cleaned flag.
export function cleanupToyRun(tmpDir) {
  if (!tmpDir || path.basename(tmpDir).startsWith(TUTORIAL_TMP_PREFIX) !== true) {
    throw new Error(`cleanupToyRun refuses to remove unexpected path: ${String(tmpDir)}`);
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
