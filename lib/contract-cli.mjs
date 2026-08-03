import fs from 'node:fs/promises';
import path from 'node:path';
import { writeJsonAtomic } from './io.mjs';

export async function readJsonFile(filePath, label = 'input') {
  if (!filePath) throw new TypeError(`${label} path is required.`);
  const absolute = path.resolve(String(filePath));
  try { return JSON.parse(await fs.readFile(absolute, 'utf8')); }
  catch (error) { throw new Error(`Unable to read ${label} JSON at ${absolute}: ${error.message}`); }
}

export async function emitJson(report, outputPath) {
  if (outputPath) {
    const absolute = path.resolve(String(outputPath));
    await writeJsonAtomic(absolute, report);
    process.stdout.write(`${absolute}\n`);
    return absolute;
  }
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return null;
}

export function setAuditExitCode(report) {
  if (report?.status === 'fail' || report?.compatible === false || report?.quality?.passed === false) process.exitCode = 1;
}
