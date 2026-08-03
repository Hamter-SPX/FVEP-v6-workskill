import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
export async function ensureDir(directory) { await fs.mkdir(directory, { recursive: true }); return directory; }
export async function ensureParent(filePath) { await ensureDir(path.dirname(filePath)); return filePath; }
export async function fileExists(filePath) { try { await fs.access(filePath); return true; } catch { return false; } }
export async function writeTextAtomic(filePath, content) { await ensureParent(filePath); const temp = `${filePath}.${process.pid}.${Date.now()}.tmp`; await fs.writeFile(temp, content, 'utf8'); await fs.rename(temp, filePath); }
export async function writeJsonAtomic(filePath, value) { await writeTextAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`); }
export function relativeWebPath(fromFile, toFile) { return path.relative(path.dirname(fromFile), toFile).split(path.sep).join('/'); }
export async function sha256(filePath) { return crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex'); }
