#!/usr/bin/env node
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { emitJson, readJsonFile, setAuditExitCode } from '../lib/contract-cli.mjs';
import { auditImplementationPlan } from '../lib/plan-quality-engine.mjs';
import { analyzeTaskGraph } from '../lib/task-graph-engine.mjs';
const HELP = `Usage: node scripts/validate-plan.mjs --input <plan.json> [--output <report.json>]\nValidates executable plan quality, dependency order, and parallel safety.`;
try {
  const args = parseCli({ input: { type: 'string' }, output: { type: 'string' } });
  if (args.help) printHelp(HELP); else {
    if (!args.input) throw new TypeError('--input is required.');
    const input = await readJsonFile(args.input, 'implementation plan');
    const plan = input.plan ?? input;
    const quality = auditImplementationPlan(plan, input.policy?.plan ?? input.policy ?? {});
    const graph = analyzeTaskGraph(plan.tasks ?? [], input.policy?.taskGraph ?? {});
    const report = { schemaVersion: 4, status: quality.ok && graph.ok ? 'pass' : 'fail', quality, graph, hardFailures: [...quality.hardFailures, ...graph.hardFailures] };
    await emitJson(report, args.output); setAuditExitCode(report);
  }
} catch (error) { fail(error); }
