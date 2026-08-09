import { parseArgs as nodeParseArgs } from 'node:util';

const BOOLEAN_KEYS = new Set(['baseline', 'headed', 'help', 'skip-capture', 'skip-inspect', 'skip-a11y', 'skip-compare', 'skip-engineering', 'reference', 'json', 'purge', 'yes']);
function coerce(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) return Number(value);
  return value;
}

export function parseLooseArgs(argv = process.argv.slice(2)) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--') { result._.push(...argv.slice(index + 1)); break; }
    if (!token.startsWith('--')) { result._.push(token); continue; }
    if (token.startsWith('--no-')) { result[token.slice(5)] = false; continue; }
    const body = token.slice(2);
    const equals = body.indexOf('=');
    if (equals >= 0) { result[body.slice(0, equals)] = coerce(body.slice(equals + 1)); continue; }
    if (BOOLEAN_KEYS.has(body)) { result[body] = true; continue; }
    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith('--')) { result[body] = coerce(next); index += 1; }
    else result[body] = true;
  }
  return result;
}

export function parseCli(extraOptions = {}, argv = process.argv.slice(2)) {
  return nodeParseArgs({
    args: argv,
    options: { config: { type: 'string', short: 'c', default: 'vision-loop.config.json' }, help: { type: 'boolean', short: 'h', default: false }, ...extraOptions },
    allowPositionals: false,
    strict: true
  }).values;
}

export function printHelp(text) { process.stdout.write(`${text.trim()}\n`); }
export function fail(error) { process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`); process.exitCode = 1; }
