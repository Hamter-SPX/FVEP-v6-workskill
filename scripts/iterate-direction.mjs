#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { recordDirectionIteration } from '../lib/direction-iterate-engine.mjs';

const HELP = `Usage: node scripts/iterate-direction.mjs [options]
      --dir <path>       Project root (default: cwd)
      --spec <path>      Direction spec (default: design/visual-direction-spec.md)
      --from <id>        Previous option / round id (e.g. 2 or 2a)
      --to <id>          New option / round id (e.g. 2b)
      --image <path>     New ImageGen artifact (e.g. design/direction-options/direction-option-2b.png)
      --keep <text>      Repeatable. What stayed the same from the previous round
      --change <text>    Repeatable. What changed (required at least once)
      --note <text>      User request that triggered ปรับต่อ
      --from-artifact <p> Optional previous image path recorded in the round

Records a 「ปรับต่อ」 refinement round into visual-direction-spec.md and
design/direction-iterations.json, updates the chosen image, and clears the
เริ่มเขียน confirm so the agent must ask again before coding.

Example:
  npm run direction:iterate -- \\
    --from 2 --to 2b \\
    --image design/direction-options/direction-option-2b.png \\
    --keep 'Layout structure from option 2' \\
    --change 'Icons only — replace with system glyphs' \\
    --note 'เหลือ layout แก้แค่ icon'
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    spec: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
    image: { type: 'string' },
    keep: { type: 'string', multiple: true },
    change: { type: 'string', multiple: true },
    note: { type: 'string' },
    'from-artifact': { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await recordDirectionIteration({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      specPath: args.spec ?? 'design/visual-direction-spec.md',
      from: args.from,
      to: args.to,
      imagePath: args.image,
      keep: args.keep ?? [],
      change: args.change ?? [],
      note: args.note,
      fromArtifact: args['from-artifact']
    });
    process.stdout.write([
      `Direction iteration: round ${result.round}`,
      `Spec: ${result.specPath}`,
      `Ledger: ${result.ledgerPath}`,
      `From → to: ${result.from} → ${result.to}`,
      `Image: ${result.image}`,
      'Confirm status reset — ask again: เริ่มเขียน | ปรับต่อ | เลือกใหม่'
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }
