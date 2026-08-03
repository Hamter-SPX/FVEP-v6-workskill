import fs from 'node:fs/promises';
import path from 'node:path';
import { routeProcessSkills } from './skill-router-engine.mjs';
import { auditDesignGovernance } from './design-governance-engine.mjs';
import { auditImplementationPlan } from './plan-quality-engine.mjs';
import { analyzeTaskGraph } from './task-graph-engine.mjs';
import { classifyWorkspace } from './workspace-safety-engine.mjs';
import { reduceProcessLedger } from './process-ledger-engine.mjs';
import { auditTddCycles } from './tdd-evidence-engine.mjs';
import { auditDebugSession } from './debug-session-engine.mjs';
import { auditReviewChain } from './review-governance-engine.mjs';
import { auditCompletionClaims } from './claim-verification-engine.mjs';
import { prepareIntegrationDecision } from './integration-decision-engine.mjs';
import { evaluateProcessGate } from './process-gate-engine.mjs';
import { ensureDir, fileExists, writeJsonAtomic, writeTextAtomic } from './io.mjs';
import { renderProcessMarkdown } from './process-report.mjs';

function notApplicable(label) {
  return {
    schemaVersion: 4, status: 'not-applicable', ok: true, score: 100,
    evidenceCount: 0, evidenceConfidence: 100, findings: [], hardFailures: [], blockers: [], warnings: [],
    label
  };
}

function remediationAction(finding = {}) {
  if (finding.remediation) return finding.remediation;
  return `resolve:${String(finding.code ?? 'unknown').toLowerCase().replaceAll('_', '-')}`;
}

export function runProcessAudit(input = {}, policy = {}) {
  const sections = {};
  sections.routing = routeProcessSkills(input.request ?? {}, policy.routing ?? {});
  sections.design = auditDesignGovernance(input.design ?? {}, policy.design ?? {});
  sections.plan = auditImplementationPlan(input.plan ?? {}, policy.plan ?? {});
  sections.taskGraph = analyzeTaskGraph(input.plan?.tasks ?? [], policy.taskGraph ?? {});
  sections.workspace = classifyWorkspace(input.workspace ?? {}, policy.workspace ?? {});
  sections.ledger = reduceProcessLedger(Array.isArray(input.ledger) ? input.ledger : input.ledger?.events ?? [], policy.ledger ?? {});
  sections.tdd = auditTddCycles(Array.isArray(input.tdd) ? input.tdd : input.tdd?.cycles ?? [], policy.tdd ?? {});
  sections.debugging = input.debug ? auditDebugSession(input.debug, policy.debugging ?? {}) : notApplicable('debugging');
  sections.review = auditReviewChain(input.review ?? {}, policy.review ?? {});
  sections.claims = auditCompletionClaims(Array.isArray(input.claims) ? input.claims : input.claims?.claims ?? [], Array.isArray(input.evidence) ? input.evidence : input.evidence?.evidence ?? [], policy.claims ?? {});
  sections.integration = prepareIntegrationDecision({
    ...(input.integration ?? {}),
    workspace: input.integration?.workspace ?? sections.workspace
  }, policy.integration ?? {});

  const processGate = evaluateProcessGate(sections, policy.processGate ?? {});
  const nextActions = [];
  if (!processGate.releaseEligible) {
    for (const item of processGate.hardFailures ?? []) nextActions.push(remediationAction(item));
  } else if (sections.integration.status === 'decision-required') nextActions.push('request-integration-decision');
  else if (sections.integration.status === 'ready') nextActions.push('execute-explicit-integration-choice');
  else nextActions.push('resolve-integration-decision');

  const verificationGaps = [];
  for (const [name, summary] of Object.entries(processGate.sections ?? {})) {
    if (summary.status === 'missing') verificationGaps.push(`${name} evidence absent`);
    else if (Number(summary.evidenceConfidence ?? 0) < 100) verificationGaps.push(`${name} evidence confidence ${summary.evidenceConfidence}%`);
  }

  return {
    schemaVersion: 4,
    generatedAt: String(policy.generatedAt ?? new Date().toISOString()),
    project: structuredClone(input.project ?? {}),
    status: processGate.releaseEligible ? 'pass' : 'fail',
    sections,
    recovery: {
      planId: sections.ledger.planId,
      state: sections.ledger.state,
      tasks: sections.ledger.tasks,
      lastSequence: sections.ledger.lastSequence,
      lastHash: sections.ledger.lastHash,
      recoverable: sections.ledger.recoverable
    },
    processGate,
    nextActions: [...new Set(nextActions)],
    verificationGaps
  };
}

async function readOptionalJson(filePath) {
  if (!filePath || !(await fileExists(filePath))) return undefined;
  try { return JSON.parse(await fs.readFile(filePath, 'utf8')); }
  catch (error) { throw new Error(`Unable to read process contract at ${filePath}: ${error.message}`); }
}

export async function runConfiguredProcessAudit(config) {
  const input = { project: config.project };
  for (const [key, filePath] of Object.entries(config.contracts ?? {})) {
    const value = await readOptionalJson(filePath);
    if (value !== undefined) input[key] = value;
  }
  const report = runProcessAudit(input, config.policy ?? {});
  await ensureDir(config.outputDir);
  const jsonPath = path.join(config.outputDir, 'process-report.json');
  const markdownPath = path.join(config.outputDir, 'process-report.md');
  await writeJsonAtomic(jsonPath, report);
  await writeTextAtomic(markdownPath, renderProcessMarkdown(report));
  return { report, paths: { json: jsonPath, markdown: markdownPath } };
}
