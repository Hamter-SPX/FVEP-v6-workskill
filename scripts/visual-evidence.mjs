#!/usr/bin/env node
import path from 'node:path';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { writeTextAtomic } from '../lib/io.mjs';
import { collectEvidence, renderEvidenceHtml } from '../lib/visual-evidence-engine.mjs';

const HELP = `Usage:
  node scripts/visual-evidence.mjs --output-dir <dir> [--out <file>]

Builds a self-contained visual evidence report (per-case reference/current/diff
thumbnails, deterministic metrics, verdicts, findings, hash anchors, gate
ladder, provenance) from the artifacts a vision loop run already produced.
Opens offline: inline CSS, base64 images, no JS, no external references.

Options:
  -o, --output-dir <dir>   Vision loop output directory (required; positional works too)
  --out <file>             HTML target (default: <outputDir>/reports/visual-evidence.html)
  -h, --help               Show help

Example:
  npm run evidence:visual -- --output-dir .vision-output
`;

try {
  // parseLooseArgs only understands --long flags; expand the short aliases
  // the interface promises before handing argv over.
  const argv = process.argv.slice(2).map((token) => {
    if (token === '-o') return '--output-dir';
    if (token === '-h') return '--help';
    return token;
  });
  const args = parseLooseArgs(argv);
  if (args.help) printHelp(HELP);
  else {
    const outputDir = args['output-dir'] ?? args.outputDir ?? args._[0];
    if (!outputDir) {
      printHelp(HELP);
      process.exitCode = 1;
    } else {
      const resolved = path.resolve(String(outputDir));
      const evidence = await collectEvidence(resolved);
      const html = renderEvidenceHtml(evidence);
      const out = path.resolve(String(args.out ?? path.join(resolved, 'reports', 'visual-evidence.html')));
      await writeTextAtomic(out, html);
      const { passed = 0, warned = 0, failed = 0 } = evidence.summary;
      process.stdout.write(`Visual evidence: ${out} (${passed} pass / ${warned} warn / ${failed} fail)\n`);
    }
  }
} catch (error) { fail(error); }
