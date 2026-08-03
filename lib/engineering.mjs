import { spawn } from 'node:child_process';
import path from 'node:path';

const SHELL_OPERATOR = /[;&|><`\r\n]/;

export function parseEngineeringCommand(command) {
  const source = String(command ?? '');
  const tokens = [];
  let token = '';
  let tokenStarted = false;
  let quote = null;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (escaped) {
      token += character;
      tokenStarted = true;
      escaped = false;
      continue;
    }

    if (character === '\\' && quote !== "'") {
      escaped = true;
      tokenStarted = true;
      continue;
    }

    if (quote) {
      if (character === quote) quote = null;
      else token += character;
      tokenStarted = true;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      tokenStarted = true;
      continue;
    }

    if (character === '$' && next === '(') throw new TypeError('Engineering command contains a shell operator or command substitution; set allowShell only after explicit review.');
    if (SHELL_OPERATOR.test(character)) throw new TypeError('Engineering command contains a shell operator; set allowShell only after explicit review.');

    if (/\s/.test(character)) {
      if (tokenStarted) {
        tokens.push(token);
        token = '';
        tokenStarted = false;
      }
      continue;
    }

    token += character;
    tokenStarted = true;
  }

  if (escaped) throw new TypeError('Engineering command ends with an incomplete escape sequence.');
  if (quote) throw new TypeError('Engineering command contains an unterminated quote.');
  if (tokenStarted) tokens.push(token);
  if (!tokens.length || !tokens[0]) throw new TypeError('Engineering command must include an executable.');
  return { executable: tokens[0], args: tokens.slice(1) };
}

export function normalizeEngineeringCheck(check, index) {
  if (!check || typeof check !== 'object') throw new TypeError(`Engineering check ${index} must be an object.`);
  if (typeof check.name !== 'string' || !check.name.trim()) throw new TypeError(`Engineering check ${index} requires a name.`);
  if (typeof check.command !== 'string' || !check.command.trim()) throw new TypeError(`Engineering check ${index} requires a command.`);
  const timeoutMs = Number(check.timeoutMs ?? 120000);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new RangeError(`Engineering check ${index} timeoutMs must be positive.`);
  return {
    name: check.name.trim(),
    command: check.command.trim(),
    cwd: check.cwd ? String(check.cwd) : null,
    timeoutMs,
    required: check.required !== false,
    allowShell: check.allowShell === true
  };
}

function platformExecutable(executable) {
  if (process.platform !== 'win32') return executable;
  return ['npm', 'npx', 'pnpm', 'yarn', 'bun'].includes(executable.toLowerCase()) ? `${executable}.cmd` : executable;
}

export async function runEngineeringCheck(check, baseDir) {
  const normalized = normalizeEngineeringCheck(check, 0);
  const cwd = normalized.cwd ? path.resolve(baseDir, normalized.cwd) : baseDir;
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const parsed = normalized.allowShell ? null : parseEngineeringCommand(normalized.command);
  const executable = normalized.allowShell ? normalized.command : platformExecutable(parsed.executable);
  const args = normalized.allowShell ? [] : parsed.args;

  return new Promise((resolve) => {
    let settled = false;
    let timedOut = false;
    let stdout = '';
    let stderr = '';
    let timer = null;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve({
        ...normalized,
        executionMode: normalized.allowShell ? 'explicit-shell' : 'argv',
        executable: normalized.allowShell ? null : executable,
        args: normalized.allowShell ? null : args,
        cwd,
        startedAt,
        durationMs: Math.round(performance.now() - started),
        timedOut,
        stdout: stdout.slice(-200000),
        stderr: stderr.slice(-200000),
        ...result
      });
    };

    const child = spawn(executable, args, {
      cwd,
      shell: normalized.allowShell,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    child.stdout?.on('data', (chunk) => { stdout += chunk; });
    child.stderr?.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => finish({ exitCode: null, signal: null, error: error.message, ok: false }));
    child.on('close', (code, signal) => finish({ exitCode: code, signal, error: null, ok: code === 0 && !timedOut }));

    timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, normalized.timeoutMs);
  });
}

export async function runEngineeringChecks(config) {
  const results = [];
  for (let index = 0; index < config.engineeringChecks.length; index += 1) {
    const check = normalizeEngineeringCheck(config.engineeringChecks[index], index);
    process.stdout.write(`[engineering] ${check.name}\n`);
    results.push(await runEngineeringCheck(check, config.baseDir));
  }
  return results;
}
