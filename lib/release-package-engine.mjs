import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

const DEFAULT_EXCLUDED_DIRECTORIES = Object.freeze([
  '.git', '.superpowers', '.worktrees', 'worktrees', 'node_modules', 'artifacts', 'coverage', 'dist', 'build'
]);
const GENERATED_METADATA = new Set(['MANIFEST.json', 'CHECKSUMS.sha256']);

function comparePaths(a, b) {
  return Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'));
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function normalizeMemberPath(value, { allowPrefix = false } = {}) {
  const raw = String(value ?? '');
  if (!raw || raw.includes('\\') || raw.includes('\0') || raw.startsWith('/') || /^[A-Za-z]:/.test(raw)) {
    throw new Error(`Unsafe archive path: ${raw || '<empty>'}`);
  }
  const stripped = allowPrefix ? raw.replace(/\/+$/, '') : raw;
  const segments = stripped.split('/');
  if (!stripped || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe archive path: ${raw || '<empty>'}`);
  }
  return segments.join('/');
}

function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export async function collectReleaseEntries(rootDirectory, options = {}) {
  const root = await fs.realpath(path.resolve(String(rootDirectory)));
  const excludedDirectories = new Set(options.excludedDirectories ?? DEFAULT_EXCLUDED_DIRECTORIES);
  const excludedFiles = new Set(options.excludedFiles ?? []);
  const entries = [];

  async function visit(directory) {
    const children = await fs.readdir(directory, { withFileTypes: true });
    children.sort((a, b) => comparePaths(a.name, b.name));
    for (const child of children) {
      if (child.isDirectory() && excludedDirectories.has(child.name)) continue;
      const absolute = path.join(directory, child.name);
      const stat = await fs.lstat(absolute);
      if (stat.isSymbolicLink()) continue;
      const resolved = await fs.realpath(absolute);
      if (!isInside(root, resolved)) continue;
      if (stat.isDirectory()) {
        await visit(absolute);
        continue;
      }
      if (!stat.isFile()) continue;
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      const safePath = normalizeMemberPath(relative);
      if (excludedFiles.has(safePath)) continue;
      const data = await fs.readFile(absolute);
      entries.push({ path: safePath, data, bytes: data.length, sha256: sha256(data), mode: stat.mode & 0o777 });
    }
  }

  await visit(root);
  entries.sort((a, b) => comparePaths(a.path, b.path));
  return entries;
}

export function renderChecksums(entries = []) {
  return [...entries]
    .map((entry) => ({ path: normalizeMemberPath(entry.path), sha256: String(entry.sha256 ?? sha256(Buffer.from(entry.data ?? ''))) }))
    .sort((a, b) => comparePaths(a.path, b.path))
    .map((entry) => `${entry.sha256}  ${entry.path}`)
    .join('\n') + (entries.length ? '\n' : '');
}

export function verifyChecksumDocument(document, entries = []) {
  const expected = new Map();
  for (const line of String(document ?? '').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = line.match(/^([a-f0-9]{64})  (.+)$/i);
    if (!match) return { ok: false, missing: [], mismatched: [], extra: [], malformed: [line] };
    const member = normalizeMemberPath(match[2]);
    if (expected.has(member)) return { ok: false, missing: [], mismatched: [], extra: [], duplicates: [member] };
    expected.set(member, match[1].toLowerCase());
  }

  const actual = new Map(entries.map((entry) => [normalizeMemberPath(entry.path), String(entry.sha256 ?? sha256(Buffer.from(entry.data ?? ''))).toLowerCase()]));
  const missing = [...actual.keys()].filter((member) => !expected.has(member)).sort();
  const extra = [...expected.keys()].filter((member) => !actual.has(member)).sort();
  const mismatched = [...actual.keys()].filter((member) => expected.has(member) && expected.get(member) !== actual.get(member)).sort();
  return { ok: missing.length === 0 && extra.length === 0 && mismatched.length === 0, missing, mismatched, extra };
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let k = 0; k < 8; k += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    table[n] = value >>> 0;
  }
  return table;
})();

function crc32(data) {
  let value = 0xffffffff;
  for (const byte of data) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(input) {
  const value = new Date(input ?? '2026-07-27T00:00:00.000Z');
  if (Number.isNaN(value.getTime())) throw new Error(`Invalid ZIP timestamp: ${input}`);
  const year = Math.min(2107, Math.max(1980, value.getUTCFullYear()));
  const month = value.getUTCMonth() + 1;
  const day = value.getUTCDate();
  const hour = value.getUTCHours();
  const minute = value.getUTCMinutes();
  const second = Math.floor(value.getUTCSeconds() / 2);
  return {
    date: ((year - 1980) << 9) | (month << 5) | day,
    time: (hour << 11) | (minute << 5) | second
  };
}

function assertUint32(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw new RangeError(`${label} exceeds ZIP32 limits.`);
}

export function createDeterministicZip(entries = [], options = {}) {
  const rootPrefix = options.rootPrefix ? `${normalizeMemberPath(options.rootPrefix, { allowPrefix: true })}/` : '';
  const { date, time } = dosDateTime(options.timestamp);
  const normalized = entries.map((entry) => {
    const member = `${rootPrefix}${normalizeMemberPath(entry.path)}`;
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data ?? '');
    return { member, data, mode: Number(entry.mode ?? 0o644) & 0o777 };
  }).sort((a, b) => comparePaths(a.member, b.member));

  const seen = new Set();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of normalized) {
    if (seen.has(entry.member)) throw new Error(`Duplicate archive member: ${entry.member}`);
    seen.add(entry.member);
    const name = Buffer.from(entry.member, 'utf8');
    const compressed = deflateRawSync(entry.data, { level: 9 });
    const checksum = crc32(entry.data);
    assertUint32(entry.data.length, 'Uncompressed file size');
    assertUint32(compressed.length, 'Compressed file size');
    assertUint32(offset, 'Local header offset');

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(((0o100000 | entry.mode) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + compressed.length;
  }

  if (normalized.length > 0xffff) throw new RangeError('ZIP32 entry count exceeded.');
  const centralOffset = offset;
  const centralDirectory = Buffer.concat(centralParts);
  assertUint32(centralDirectory.length, 'Central directory size');
  assertUint32(centralOffset, 'Central directory offset');
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(normalized.length, 8);
  end.writeUInt16LE(normalized.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function findEndRecord(buffer) {
  const minimum = Math.max(0, buffer.length - 0xffff - 22);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

export function verifyZipStructure(input, options = {}) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input ?? '');
  const findings = [];
  const endOffset = buffer.length >= 22 ? findEndRecord(buffer) : -1;
  if (endOffset < 0) return { ok: false, entries: [], findings: ['ZIP end-of-central-directory record is missing.'] };
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  const centralSize = buffer.readUInt32LE(endOffset + 12);
  const centralOffset = buffer.readUInt32LE(endOffset + 16);
  if (centralOffset + centralSize !== endOffset) findings.push('Central directory size or offset is inconsistent.');

  const entries = [];
  const seen = new Set();
  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > buffer.length || buffer.readUInt32LE(cursor) !== 0x02014b50) {
      findings.push(`Central directory entry ${index} is invalid.`);
      break;
    }
    const method = buffer.readUInt16LE(cursor + 10);
    const expectedCrc = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd > buffer.length) {
      findings.push(`Central directory entry ${index} has an invalid name length.`);
      break;
    }
    const member = buffer.subarray(nameStart, nameEnd).toString('utf8');
    try { normalizeMemberPath(member); }
    catch { findings.push(`Unsafe ZIP member path: ${member}`); }
    if (options.requiredPrefix && !member.startsWith(options.requiredPrefix)) findings.push(`ZIP member is outside required prefix: ${member}`);
    if (seen.has(member)) findings.push(`Duplicate ZIP member: ${member}`);
    seen.add(member);
    entries.push(member);

    if (localOffset + 30 > buffer.length || buffer.readUInt32LE(localOffset) !== 0x04034b50) {
      findings.push(`Local header missing for ${member}.`);
    } else {
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const dataEnd = dataStart + compressedSize;
      if (dataEnd > buffer.length) findings.push(`Compressed data exceeds archive bounds for ${member}.`);
      else {
        try {
          const compressed = buffer.subarray(dataStart, dataEnd);
          const data = method === 8 ? inflateRawSync(compressed) : method === 0 ? compressed : null;
          if (!data) findings.push(`Unsupported compression method ${method} for ${member}.`);
          else {
            if (data.length !== uncompressedSize) findings.push(`Uncompressed size mismatch for ${member}.`);
            if (crc32(data) !== expectedCrc) findings.push(`CRC mismatch for ${member}.`);
          }
        } catch (error) { findings.push(`Unable to decompress ${member}: ${error.message}`); }
      }
    }
    cursor = nameEnd + extraLength + commentLength;
  }
  if (entries.length !== entryCount) findings.push(`ZIP entry count mismatch: expected ${entryCount}, parsed ${entries.length}.`);
  return { ok: findings.length === 0, entries, findings, entryCount, centralOffset, centralSize };
}

export function buildReleaseManifest(entries = [], metadata = {}) {
  const files = entries.map((entry) => ({
    path: normalizeMemberPath(entry.path),
    bytes: Number(entry.bytes ?? Buffer.byteLength(entry.data ?? '')),
    sha256: String(entry.sha256 ?? sha256(Buffer.from(entry.data ?? ''))),
    mode: Number(entry.mode ?? 0o644) & 0o777
  })).sort((a, b) => comparePaths(a.path, b.path));
  return {
    schemaVersion: 4,
    package: {
      name: String(metadata.name ?? 'fullstack-vision-engineering-pro'),
      version: String(metadata.version ?? '5.0.0')
    },
    generatedAt: String(metadata.generatedAt ?? '2026-07-27T00:00:00.000Z'),
    fileCount: files.length,
    totalBytes: files.reduce((sum, item) => sum + item.bytes, 0),
    files
  };
}

async function writeEntries(outputDirectory, entries) {
  for (const entry of entries) {
    const safe = normalizeMemberPath(entry.path);
    const target = path.join(outputDirectory, ...safe.split('/'));
    if (!isInside(outputDirectory, target)) throw new Error(`Release target escaped output directory: ${safe}`);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, entry.data);
    await fs.chmod(target, Number(entry.mode ?? 0o644) & 0o777);
  }
}

export async function buildReleaseArtifact(options = {}) {
  const sourceRoot = path.resolve(String(options.sourceRoot ?? '.'));
  const outputDirectory = path.resolve(String(options.outputDirectory ?? 'release/fullstack-vision-engineering-pro-v4'));
  const archivePath = path.resolve(String(options.archivePath ?? `${outputDirectory}.zip`));
  const timestamp = String(options.timestamp ?? '2026-07-27T00:00:00.000Z');
  const rootPrefix = String(options.rootPrefix ?? path.basename(outputDirectory));
  if (isInside(sourceRoot, outputDirectory)) throw new Error('Release output directory must be outside the source tree to prevent recursive packaging.');

  const sourceEntries = await collectReleaseEntries(sourceRoot, {
    excludedDirectories: options.excludedDirectories ?? DEFAULT_EXCLUDED_DIRECTORIES,
    excludedFiles: [...GENERATED_METADATA, ...(options.excludedFiles ?? [])]
  });
  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.mkdir(outputDirectory, { recursive: true });
  await writeEntries(outputDirectory, sourceEntries);

  const manifest = buildReleaseManifest(sourceEntries, {
    name: options.name,
    version: options.version,
    generatedAt: timestamp
  });
  const manifestData = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const manifestEntry = { path: 'MANIFEST.json', data: manifestData, bytes: manifestData.length, sha256: sha256(manifestData), mode: 0o644 };
  await writeEntries(outputDirectory, [manifestEntry]);

  const checksumEntries = [...sourceEntries, manifestEntry];
  const checksumData = Buffer.from(renderChecksums(checksumEntries), 'utf8');
  const checksumEntry = { path: 'CHECKSUMS.sha256', data: checksumData, bytes: checksumData.length, sha256: sha256(checksumData), mode: 0o644 };
  await writeEntries(outputDirectory, [checksumEntry]);
  const checksumVerification = verifyChecksumDocument(checksumData.toString('utf8'), checksumEntries);
  if (!checksumVerification.ok) throw new Error(`Generated checksum document failed verification: ${JSON.stringify(checksumVerification)}`);

  const finalEntries = [...sourceEntries, manifestEntry, checksumEntry].sort((a, b) => comparePaths(a.path, b.path));
  const archive = createDeterministicZip(finalEntries, { rootPrefix, timestamp });
  await fs.mkdir(path.dirname(archivePath), { recursive: true });
  await fs.writeFile(archivePath, archive);
  const zipVerification = verifyZipStructure(archive, { requiredPrefix: `${normalizeMemberPath(rootPrefix, { allowPrefix: true })}/` });
  if (!zipVerification.ok) throw new Error(`Generated ZIP failed structural verification: ${JSON.stringify(zipVerification.findings)}`);

  return {
    sourceRoot,
    outputDirectory,
    archivePath,
    archiveBytes: archive.length,
    archiveSha256: sha256(archive),
    fileCount: finalEntries.length,
    manifest,
    checksumVerification,
    zipVerification
  };
}
