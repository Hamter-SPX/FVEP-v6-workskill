import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, writeTextAtomic } from './io.mjs';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function bulletList(items = []) {
  const values = items.map((item) => String(item ?? '').trim()).filter(Boolean);
  if (!values.length) return '- (none recorded)';
  return values.map((item) => `- ${item}`).join('\n');
}

function nextRoundNumber(markdown) {
  const matches = [...String(markdown).matchAll(/### Round (\d+)\b/gi)];
  if (!matches.length) return 1;
  return Math.max(...matches.map((match) => Number(match[1]))) + 1;
}

function upsertSelectionField(markdown, label, value) {
  const pattern = new RegExp(`^(-\\s*${escapeRegExp(label)}:\\s*).*$`, 'im');
  if (pattern.test(markdown)) return markdown.replace(pattern, `$1${value}`);
  return markdown.replace(
    /(## Selection\n)/i,
    `$1- ${label}: ${value}\n`
  );
}

function resetConfirmStatus(markdown, reply = 'ปรับต่อ') {
  let text = markdown;
  text = text.replace(
    /- \[[ xX]\]\s*User confirmed:.*/i,
    `- [ ] User confirmed: เริ่มเขียน | ปรับต่อ | เลือกใหม่ (last: ${reply})`
  );
  if (!/- \[[ xX]?\]\s*User confirmed:/i.test(text)) {
    text = text.replace(
      /(## Status\n)/i,
      `$1- [ ] User confirmed: เริ่มเขียน | ปรับต่อ | เลือกใหม่ (last: ${reply})\n`
    );
  }
  return text;
}

function appendOrReplaceIterationSection(markdown, roundBlock) {
  if (/^## Iteration History\s*$/im.test(markdown)) {
    return markdown.replace(
      /(## Iteration History\n)([\s\S]*?)(?=\n## [A-Z]|\n## Confirmation Gate|\n## Status|$)/i,
      (_, heading, body) => `${heading}${String(body).trimEnd()}\n\n${roundBlock}\n\n`
    );
  }
  // Insert before Confirmation Gate when present, otherwise before Status, else append.
  if (/^## Confirmation Gate\b/im.test(markdown)) {
    return markdown.replace(
      /(## Confirmation Gate\b)/i,
      `## Iteration History\n\n${roundBlock}\n\n$1`
    );
  }
  if (/^## Status\b/im.test(markdown)) {
    return markdown.replace(
      /(## Status\b)/i,
      `## Iteration History\n\n${roundBlock}\n\n$1`
    );
  }
  return `${ensureTrailingNewline(markdown)}\n## Iteration History\n\n${roundBlock}\n`;
}

/**
 * Parses iteration rounds from a visual-direction-spec.md body.
 */
export function parseIterationHistory(markdown) {
  const section = String(markdown ?? '').match(/## Iteration History\n([\s\S]*?)(?=\n## |$)/i)?.[1] ?? '';
  const rounds = [];
  const blocks = section.split(/^### Round /im).slice(1);
  for (const block of blocks) {
    const lines = block.split('\n');
    const header = lines[0] ?? '';
    const roundMatch = header.match(/^(\d+)\s*(?:—|-)?\s*(.*)$/);
    const bodyLines = lines.slice(1).map((line) => line.trim()).filter(Boolean);
    const field = (label) => {
      const row = bodyLines.find((line) => line.toLowerCase().startsWith(`- ${label.toLowerCase()}`));
      return row ? row.slice(row.indexOf(':') + 1).trim() : '';
    };
    const listAfter = (label) => {
      const start = bodyLines.findIndex((line) => {
        const lower = line.toLowerCase();
        return lower === `- ${label.toLowerCase()}:` || lower.startsWith(`- ${label.toLowerCase()}:`);
      });
      if (start < 0) return [];
      const inline = field(label);
      const items = [];
      for (let index = start + 1; index < bodyLines.length; index += 1) {
        const line = bodyLines[index];
        if (/^- (From option|To option|Keep|Change|User note|Status after round)\b/i.test(line)) break;
        if (line.startsWith('- ')) items.push(line.slice(2).trim());
      }
      if (!items.length && inline && inline !== '(none recorded)') return [inline];
      return items.filter((item) => item && item !== '(none recorded)');
    };
    rounds.push({
      round: roundMatch ? Number(roundMatch[1]) : rounds.length + 1,
      recordedAt: (roundMatch?.[2] ?? '').trim(),
      from: field('From option / artifact'),
      to: field('To option / artifact'),
      keep: listAfter('Keep'),
      change: listAfter('Change'),
      note: field('User note'),
      statusAfter: field('Status after round')
    });
  }
  return rounds;
}

/**
 * Records a 「ปรับต่อ」 refinement round into the direction spec.
 * Typical naming: direction-option-2.png → direction-option-2b.png
 */
export async function recordDirectionIteration(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const specPath = path.resolve(baseDir, options.specPath ?? 'design/visual-direction-spec.md');
  if (!await fileExists(specPath)) throw new Error(`Direction spec not found: ${specPath}`);

  const from = String(options.from ?? '').trim();
  const to = String(options.to ?? '').trim();
  if (!from || !to) throw new Error('recordDirectionIteration requires --from and --to (e.g. 2 and 2b).');

  const keep = [].concat(options.keep ?? []).map(String).filter(Boolean);
  const change = [].concat(options.change ?? []).map(String).filter(Boolean);
  if (!change.length) throw new Error('recordDirectionIteration requires at least one --change entry describing what was adjusted.');

  const imagePath = options.imagePath ? path.resolve(baseDir, options.imagePath) : null;
  if (imagePath && !await fileExists(imagePath)) {
    throw new Error(`Iteration image not found: ${imagePath}`);
  }

  const relativeImage = imagePath
    ? path.relative(baseDir, imagePath).split(path.sep).join('/')
    : String(options.artifact ?? `design/direction-options/direction-option-${to}.png`);

  const markdown = await fs.readFile(specPath, 'utf8');
  const round = Number(options.round) || nextRoundNumber(markdown);
  const recordedAt = options.recordedAt ?? new Date().toISOString();
  const note = String(options.note ?? '').trim();

  const roundBlock = [
    `### Round ${round} — ${recordedAt}`,
    '',
    `- From option / artifact: ${from}${options.fromArtifact ? ` / ${options.fromArtifact}` : ''}`,
    `- To option / artifact: ${to} / ${relativeImage}`,
    '- Keep:',
    bulletList(keep),
    '- Change:',
    bulletList(change),
    `- User note: ${note || '(none)'}`,
    '- Status after round: awaiting confirm (เริ่มเขียน | ปรับต่อ | เลือกใหม่)'
  ].join('\n');

  let next = appendOrReplaceIterationSection(markdown, roundBlock);
  next = upsertSelectionField(next, 'Selected option', String(to).replace(/[^0-9].*$/, '') || to);
  next = upsertSelectionField(next, 'Chosen image / artifact', relativeImage);
  next = upsertSelectionField(next, 'Selected at (ISO timestamp)', recordedAt);
  next = resetConfirmStatus(next, 'ปรับต่อ');

  await writeTextAtomic(specPath, ensureTrailingNewline(next));

  const ledgerPath = path.resolve(baseDir, options.ledgerPath ?? 'design/direction-iterations.json');
  let ledger = { schemaVersion: 1, rounds: [] };
  if (await fileExists(ledgerPath)) {
    try { ledger = JSON.parse(await fs.readFile(ledgerPath, 'utf8')); }
    catch { ledger = { schemaVersion: 1, rounds: [] }; }
  }
  if (!Array.isArray(ledger.rounds)) ledger.rounds = [];
  const entry = {
    round,
    recordedAt,
    from,
    to,
    image: relativeImage,
    keep,
    change,
    note: note || null,
    statusAfter: 'awaiting-confirm'
  };
  ledger.rounds = [...ledger.rounds.filter((item) => Number(item.round) !== round), entry]
    .sort((a, b) => Number(a.round) - Number(b.round));
  await writeTextAtomic(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

  return {
    ok: true,
    round,
    specPath,
    ledgerPath,
    image: relativeImage,
    from,
    to,
    keep,
    change,
    note: note || null,
    parsedRounds: parseIterationHistory(next)
  };
}
