import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { finalizeAudit, makeFinding, percentage } from './audit-utils.mjs';

const DEFAULT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.rb', '.php', '.go', '.java', '.cs', '.sh', '.sql', '.env']);

const RULES = Object.freeze([
  { code: 'source-hardcoded-secret', severity: 'blocker', regex: /(?:api[_-]?key|apikey|secret|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'`]([^"'`\n]{8,})["'`]/i, message: 'Probable hardcoded credential or secret.', remediation: 'Move the value to an approved secret store and rotate the exposed credential.' },
  { code: 'source-dynamic-eval', severity: 'high', regex: /\beval\s*\(/, message: 'Dynamic evaluation can enable code injection.', remediation: 'Use a constrained parser or explicit dispatch table.' },
  { code: 'source-shell-injection-risk', severity: 'high', regex: /(?:child_process\.)?exec\s*\(\s*`[^`]*\$\{|(?:child_process\.)?exec\s*\([^"'`]/, message: 'Shell command appears to include dynamic input.', remediation: 'Use argument-vector execution and strict allow-list validation.' },
  { code: 'source-tls-verification-disabled', severity: 'blocker', regex: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["']?0/, message: 'TLS certificate verification is disabled.', remediation: 'Restore certificate verification and configure a trusted CA.' },
  { code: 'source-wildcard-cors', severity: 'high', regex: /Access-Control-Allow-Origin["'`\s:=-]+\*|origin\s*:\s*["']\*["']/, message: 'Wildcard CORS policy detected.', remediation: 'Allow only explicit trusted origins and review credential behavior.' },
  { code: 'source-weak-hash', severity: 'medium', regex: /createHash\s*\(\s*["'](?:md5|sha1)["']\s*\)|\bMD5\s*\(|\bSHA1\s*\(/i, message: 'Weak hash algorithm detected.', remediation: 'Use a modern password KDF or collision-resistant hash appropriate to the purpose.' },
  { code: 'source-unsafe-html', severity: 'medium', regex: /dangerouslySetInnerHTML|\.innerHTML\s*=/, message: 'Direct HTML injection surface detected.', remediation: 'Prefer structured rendering or sanitize with a reviewed policy.' },
  { code: 'source-sql-interpolation', severity: 'high', regex: /(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,120}(?:\$\{|\+\s*[a-zA-Z_$]|%s)/i, message: 'SQL text appears to include dynamic interpolation.', remediation: 'Use parameterized queries and typed query builders.' }
]);

function lineFor(content, index) { return content.slice(0, index).split('\n').length; }
function fingerprint(value) { return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12); }

export function scanSourceFiles(files = [], policy = {}) {
  const findings = [];
  let scannedBytes = 0;
  for (const file of files) {
    const filePath = String(file?.path ?? 'unknown');
    const content = String(file?.content ?? '');
    scannedBytes += Buffer.byteLength(content);
    for (const rule of RULES) {
      const match = rule.regex.exec(content);
      if (!match) continue;
      const detail = rule.code === 'source-hardcoded-secret' ? { fingerprint: fingerprint(match[1] ?? 'secret'), redacted: true } : { line: lineFor(content, match.index) };
      findings.push(makeFinding(rule.code, rule.severity, rule.message, { path: filePath, detail, remediation: rule.remediation }));
    }
  }
  const report = finalizeAudit(findings, { evidenceCount: files.length, evidenceConfidence: files.length ? 100 : (policy.required ? 0 : 100) });
  return { ...report, heuristic: true, filesScanned: files.length, bytesScanned: scannedBytes, ruleCount: RULES.length };
}

export async function collectSourceFiles(rootDir, options = {}) {
  const extensions = new Set(options.extensions ?? DEFAULT_EXTENSIONS);
  const excludes = (options.exclude ?? ['node_modules', '.git', 'dist', 'build', 'coverage', 'artifacts']).map(String);
  const maxFileBytes = Number(options.maxFileBytes ?? 1_000_000);
  const resolvedRoot = path.resolve(rootDir);
  const realRoot = await fs.realpath(resolvedRoot);
  const files = [];

  function allowedFileName(name) {
    const lower = name.toLowerCase();
    if (lower === '.env' || lower.startsWith('.env.')) return extensions.has('.env');
    return extensions.has(path.extname(lower));
  }

  function insideRoot(candidate) {
    const relative = path.relative(realRoot, candidate);
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
  }

  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(realRoot, absolute).split(path.sep).join('/');
      if (excludes.some((pattern) => relative === pattern || relative.startsWith(`${pattern}/`) || entry.name === pattern)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        const realDirectory = await fs.realpath(absolute);
        if (insideRoot(realDirectory)) await walk(realDirectory);
        continue;
      }
      if (!entry.isFile() || !allowedFileName(entry.name)) continue;
      const realFile = await fs.realpath(absolute);
      if (!insideRoot(realFile)) continue;
      const stat = await fs.lstat(realFile);
      if (stat.size <= maxFileBytes) files.push({ path: relative, content: await fs.readFile(realFile, 'utf8') });
    }
  }

  await walk(realRoot);
  return files;
}
