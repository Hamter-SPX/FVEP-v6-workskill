#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { promoteCurrentToBaseline } from '../lib/baseline-engine.mjs';
import { loadConfig } from '../lib/config.mjs';
import { createRunProvenance } from '../lib/provenance.mjs';
const HELP = `Usage: node scripts/promote-baseline.mjs [options]\n  -c, --config <path>\n      --approved-by <name>  Required unless baseline.approvedBy exists\n      --reason <text>\n      --route/--viewport/--state/--case <value>\n`;
try {
  const args = parseCli({ 'approved-by': { type: 'string' }, reason: { type: 'string' }, route: { type: 'string' }, viewport: { type: 'string' }, state: { type: 'string' }, case: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    const config = await loadConfig(args.config); const provenance = createRunProvenance(config);
    const approvedBy = args['approved-by'] ?? config.baseline.approvedBy; const reason = args.reason ?? config.baseline.reason;
    const result = await promoteCurrentToBaseline(config, { approvedBy, reason, gitCommit: provenance.git.commit, filters: { route: args.route, viewport: args.viewport, state: args.state, case: args.case } });
    process.stdout.write(`Promoted baseline artifacts: ${result.promotedCount}; manifest: ${result.manifestPath}\n`);
  }
} catch (error) { fail(error); }
