#!/usr/bin/env node
import readline from 'node:readline';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import {
  TUTORIAL_STEPS,
  TOY_DIR,
  prepareToyRun,
  cleanupToyRun,
  runStep,
  replayStep,
  renderStep,
  SEPARATOR_WIDTH
} from '../lib/tutorial-engine.mjs';

const HELP = `Usage:
  node scripts/tutorial.mjs [--interactive | --auto | --off] [--from <n>] [--variant red|green] [--json] [--keep] [-h]

เดิน GOLDEN_PATH 8 ขั้นบนสำเนาชั่วคราวของ examples/golden-path — ต้นฉบับไม่ถูกแตะ
interactive รอ Enter ระหว่างขั้น (เฉพาะ TTY), auto รันต่อเนื่อง, off ไม่รันคำสั่งจริง
แต่ replay สรุปจาก artifact ที่ commit ไว้ใน toy ([OFF] badge ชัดเจน)

Options:
  --interactive   รอ Enter ระหว่างขั้น (default เมื่อ stdout เป็น TTY)
  --auto          ไม่หยุดรอ เหมาะกับ CI / non-TTY
  --off           read-only replay จาก artifact ที่ commit ไว้ — ไม่ spawn คำสั่งจริง
  --from <n>      เริ่มที่ขั้นที่ n (1..8)
  --variant <v>   รอบ TDD ของขั้น 5: red | green (default green; interactive ถามให้)
  --json          พิมพ์เฉพาะสรุปผล JSON (ไม่พิมพ์ block รายขั้น)
  --keep          เก็บ sandbox ชั่วคราวไว้ดู (default: ลบอัตโนมัติหลังจบ)
  -h, --help

Walk the GOLDEN_PATH 8-step tutorial on a temp copy of the golden-path toy
(the source example is never modified; the sandbox is removed afterwards).
Exit 0 เมื่อเดินครบทุกขั้นโดยไม่มีขั้นที่รันจริงแล้วพลาด expectation, มิฉะนั้น exit 1.
`;

function resolveMode(args) {
  if (args.off) return 'off';
  if (args.auto) return 'auto';
  const tty = process.stdout.isTTY === true && process.stdin.isTTY === true;
  if (args.interactive) return tty ? 'interactive' : 'auto';
  return tty ? 'interactive' : 'auto';
}

function writeIntro(mode, sandbox) {
  const lines = [
    '═'.repeat(SEPARATOR_WIDTH),
    `FVEP Tutorial — GOLDEN_PATH 8 ขั้น · โหมด: ${mode.toUpperCase()}`,
    mode === 'off'
      ? 'อ่านอย่างเดียว: replay จาก artifact ที่ commit ไว้ใน examples/golden-path — ไม่มี sandbox, ไม่ spawn คำสั่งจริง'
      : `toy: examples/golden-path → sandbox: ${sandbox} (สำเนาชั่วคราว — ต้นฉบับไม่ถูกแตะ, ลบอัตโนมัติเมื่อจบ)`,
    'คำสั่งที่แสดง = รูปแบบมาตรฐานที่พิมพ์ในโปรเจกต์จริง; เบื้องหลัง engine รันซ้ำบนสำเนาเท่านั้น',
    '═'.repeat(SEPARATOR_WIDTH),
    ''
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

function writeSummary(results, failures) {
  const count = (status) => results.filter((entry) => entry.status === status).length;
  const lines = [
    '',
    '═'.repeat(SEPARATOR_WIDTH),
    `สรุป: ${results.length} ขั้น · PASS ${count('pass')} · NOTE ${count('note')} · WARN ${count('warn')}`,
    failures === 0
      ? 'ต่อไป: เปิด GOLDEN_PATH.md แล้วลองกับโปรเจกต์จริง — สร้าง .fvep/ ของคุณเอง'
      : 'มีขั้นที่รันแล้วไม่ตรง expectation — ตรวจ output ด้านบน แล้วลองใหม่ (sandbox ถูกลบแล้ว)',
    '═'.repeat(SEPARATOR_WIDTH)
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

try {
  const args = parseLooseArgs();
  if (args.help || args.h) {
    printHelp(HELP);
  } else {
    const mode = resolveMode(args);
    const total = TUTORIAL_STEPS.length;
    const from = Number.isInteger(args.from) ? args.from : 1;
    if (from < 1 || from > total) {
      fail(new Error(`--from ต้องอยู่ระหว่าง 1..${total} (ได้รับ: ${String(args.from)})`));
    } else {
      const steps = TUTORIAL_STEPS.filter((step) => step.n >= from);
      const variant = args.variant === 'red' || args.variant === 'green' ? args.variant : null;
      const jsonMode = args.json === true;

      let toyDir = TOY_DIR;
      let sandbox = null;
      if (mode !== 'off') {
        sandbox = prepareToyRun(TOY_DIR);
        toyDir = sandbox;
      }
      const rl = mode === 'interactive' ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;

      if (!jsonMode) writeIntro(mode, sandbox ?? '(read-only)');

      const results = [];
      let failures = 0;
      try {
        for (let index = 0; index < steps.length; index += 1) {
          const step = steps[index];
          let result;
          if (mode === 'off' || !step.run) {
            result = replayStep(step, mode === 'off' ? TOY_DIR : toyDir);
          } else {
            let pickedVariant = variant;
            if (step.run.variants && !pickedVariant && rl) {
              const answer = await ask(rl, '\nขั้น 5 เลือกรอบ TDD: [g]reen = ดูเทสต์ผ่านหลัง implement, [r]ed = ดูเทสต์ล้มก่อนมี implementation (Enter = green): ');
              pickedVariant = answer.toLowerCase().startsWith('r') ? 'red' : 'green';
            }
            result = runStep(step, { toyDir, variant: pickedVariant });
          }
          if (result.source === 'run' && result.status === 'warn') failures += 1;
          if (!jsonMode) process.stdout.write(`${renderStep(step, result, { mode, stepIndex: step.n, totalSteps: total })}\n`);
          results.push({ n: step.n, id: step.id, gate: step.gate, status: result.status, exit: result.exit ?? null, timedOut: result.timedOut === true });
          if (rl && index < steps.length - 1) {
            await ask(rl, `\nกด Enter เพื่อไปขั้นที่ ${steps[index + 1].n}/${total} (${steps[index + 1].id})… `);
          }
        }
      } finally {
        if (rl) rl.close();
        if (sandbox) {
          if (args.keep) process.stdout.write(`\nsandbox ยังอยู่: ${sandbox}\n`);
          else cleanupToyRun(sandbox);
        }
      }

      if (jsonMode) {
        process.stdout.write(`${JSON.stringify({ ok: failures === 0, mode, from, steps: results })}\n`);
      } else {
        writeSummary(results, failures);
      }
      if (failures > 0) process.exitCode = 1;
    }
  }
} catch (error) {
  fail(error);
}
