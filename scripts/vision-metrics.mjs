#!/usr/bin/env node
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { fail, parseLooseArgs, printHelp } from '../lib/cli.mjs';
import { computeVisionMetrics } from '../lib/vision-metrics-engine.mjs';

const HELP = `Usage:
  node scripts/vision-metrics.mjs --image <cur.png> [options]

Compute deterministic vision metrics (occupancy/density/palette/alignment/contrast)
so an agent can judge a render without seeing the image.

Options:
  --image <file>      PNG to analyze (required)
  --grid <CxR>        Occupancy/density grid, e.g. 8x5 (default: 8x5)
  --out <file>        Write metrics JSON here (default: stdout only)
  --compact           Print single-line summary instead of full JSON
  -h, --help          Show help

Examples:
  node scripts/vision-metrics.mjs --image .fx/cur.png --grid 8x5 --out .fx/metrics.json
`;

function parseGrid(value) {
  const m = /^(\d+)x(\d+)$/.exec(String(value ?? '8x5'));
  if (!m) throw new TypeError('--grid must look like 8x5');
  return { cols: Number(m[1]), rows: Number(m[2]) };
}

try {
  const args = parseLooseArgs();
  if (args.help || args.h) { printHelp(HELP); process.exitCode = 0; }
  else if (!args.image) { printHelp(HELP); process.exitCode = 1; }
  else {
    const png = PNG.sync.read(fs.readFileSync(args.image));
    const grid = parseGrid(args.grid);
    const metrics = computeVisionMetrics({ width: png.width, height: png.height, data: png.data }, grid);
    if (args.out) fs.writeFileSync(args.out, `${JSON.stringify(metrics, null, 2)}\n`);
    if (args.compact) {
      const o = metrics.occupancy;
      process.stdout.write([
        `emptyCells=${o.emptyCells.length}/${o.cells.length}`,
        `balanceX=${o.balance.centerX.toFixed(2)}`,
        `density=${metrics.density.mean.toFixed(4)}`,
        `topPalette=${metrics.palette.colors.slice(0, 3).map((c) => `#${c.rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}(${Math.round(c.share * 100)}%)`).join(' ')}`,
        `harmony=${metrics.palette.harmony}`,
        `align=${metrics.alignment.score?.toFixed(2) ?? 'n/a'}`,
        `dark=${metrics.contrast.darkShare.toFixed(2)}/light=${metrics.contrast.lightShare.toFixed(2)}`
      ].join(' | ') + '\n');
    } else {
      process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`);
    }
  }
} catch (error) { fail(error); }
