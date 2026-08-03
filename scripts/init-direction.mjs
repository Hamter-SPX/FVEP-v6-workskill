#!/usr/bin/env node
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { initDirectionArtifacts } from '../lib/direction-init-engine.mjs';

const HELP = `Usage: node scripts/init-direction.mjs [options]
      --dir <path>           Project root (default: cwd)
      --design-dir <path>    Design folder relative to --dir (default: design)
      --product <name>       Product / surface name
      --audience <text>      Audience blurb
      --primary-task <text>  Primary user task
      --fidelity-mode <m>    exact-reference | brand-consistent | original-direction
      --selected-option <n>  Prefill selected option 1|2|3
      --force                Overwrite existing files

Scaffolds durable direction artifacts for IDE / CLI / CI:
  design/visual-direction-spec.md
  design/aesthetic-profile.json
  design/design-contract.json
  design/direction-options/README.md
`;

try {
  const args = parseCli({
    dir: { type: 'string' },
    'design-dir': { type: 'string' },
    product: { type: 'string' },
    audience: { type: 'string' },
    'primary-task': { type: 'string' },
    'fidelity-mode': { type: 'string' },
    'selected-option': { type: 'string' },
    force: { type: 'boolean', default: false }
  });
  if (args.help) printHelp(HELP);
  else {
    const result = await initDirectionArtifacts({
      baseDir: args.dir ? path.resolve(args.dir) : process.cwd(),
      designDir: args['design-dir'] ?? 'design',
      product: args.product,
      audience: args.audience,
      primaryTask: args['primary-task'],
      fidelityMode: args['fidelity-mode'],
      selectedOption: args['selected-option'],
      force: args.force === true
    });
    process.stdout.write([
      `Direction scaffold: ${result.paths.designDir}`,
      `Created: ${result.created.length}`,
      ...result.created.map((item) => `  + ${item.path}`),
      `Skipped: ${result.skipped.length}`,
      ...result.skipped.map((item) => `  = ${item.path}`),
      'Next: fill the spec after option choice, then npm run direction:sync'
    ].join('\n') + '\n');
  }
} catch (error) { fail(error); }
