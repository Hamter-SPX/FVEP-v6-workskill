#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { writeDirectionGallery } from '../lib/direction-gallery-engine.mjs';

const HELP = `Usage: node scripts/open-direction-gallery.mjs [options]
  -o, --output-dir <path>   Gallery folder (default: design/direction-options)
      --title <text>        Page title
      --reference-note <t>  Note when no reference screenshot could be attached
      --option <spec>       Repeatable. Format: N|label|imagePath(|notes)
      --no-open             Write HTML only; do not launch the browser

Builds a local HTML page showing direction options 1–3 as images and opens it
in the default browser. Use when chat cannot display images (CLI / some Codex
surfaces) or the user could not attach a reference screenshot.

Example:
  npm run direction:gallery -- \\
    --option '1|Dense utilitarian|design/direction-option-1.png' \\
    --option '2|Spacious editorial|design/direction-option-2.png' \\
    --option '3|Expressive accent|design/direction-option-3.png'
`;

function parseOption(spec) {
  const parts = String(spec ?? '').split('|').map((part) => part.trim());
  if (parts.length < 3) throw new Error(`Invalid --option spec (need N|label|imagePath): ${spec}`);
  return {
    number: Number(parts[0]),
    label: parts[1],
    thesis: parts[1],
    imagePath: parts[2],
    notes: parts[3] ?? ''
  };
}

try {
  const args = parseCli({
    'output-dir': { type: 'string', short: 'o' },
    title: { type: 'string' },
    'reference-note': { type: 'string' },
    option: { type: 'string', multiple: true },
    open: { type: 'boolean', default: true }
  });
  if (args.help) printHelp(HELP);
  else {
    const optionSpecs = args.option ?? [];
    if (!optionSpecs.length) throw new Error('Provide at least two --option entries.');
    const result = await writeDirectionGallery({
      outputDir: args['output-dir'] ? path.resolve(args['output-dir']) : path.resolve('design/direction-options'),
      title: args.title,
      referenceNote: args['reference-note'],
      options: optionSpecs.map(parseOption),
      open: args.open !== false
    });
    process.stdout.write([
      `Direction gallery: ${result.htmlPath}`,
      `Href: ${result.href}`,
      `Options: ${result.optionCount}`,
      `Browser: ${result.browser?.ok ? 'opened' : result.browser ? `not opened (${result.browser.error ?? 'unknown'})` : 'skipped'}`
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }
