#!/usr/bin/env node
import path from 'node:path';
import { loadAestheticEvidence } from '../lib/aesthetic-audit-engine.mjs';
import { auditA11yAll } from '../lib/a11y-engine.mjs';
import { verifyBaselineForConfig } from '../lib/baseline-engine.mjs';
import { discoverBreakpoints } from '../lib/breakpoint-engine.mjs';
import { captureAll } from '../lib/capture-engine.mjs';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { compareAll } from '../lib/compare-engine.mjs';
import { loadConfig } from '../lib/config.mjs';
import { runEngineeringChecks } from '../lib/engineering.mjs';
import { inspectAll } from '../lib/inspect-engine.mjs';
import { inspectInteractionsAll } from '../lib/interaction-engine.mjs';
import { loadSemanticVisualReview } from '../lib/manual-review-engine.mjs';
import { captureAllMobile } from '../lib/mobile-capture-engine.mjs';
import { runMobileChecks } from '../lib/mobile-checks-engine.mjs';
import { auditPerformanceAll } from '../lib/performance-engine.mjs';
import { createRunProvenance } from '../lib/provenance.mjs';
import { writeRunSummary } from '../lib/run-summary.mjs';
import { crawlInteractionStatesAll } from '../lib/state-crawler-engine.mjs';
import { compareTokenProfileSets, extractTokenProfiles, loadStoredTokenProfiles } from '../lib/token-engine.mjs';
import { writeJsonAtomic, writeTextAtomic } from '../lib/io.mjs';

const HELP = `
Usage: node scripts/vision-loop.mjs [options]
  -c, --config <path>       Config file
      --base-url <url>      Override current application URL
      --reference-url <url> Override live reference application URL
      --headed              Show browser
      --refresh-reference   Capture a live reference before comparison
      --skip-capture        Skip current screenshot capture
      --skip-inspect        Skip DOM/style/overflow inspection
      --skip-a11y           Skip axe and keyboard probe
      --skip-interaction    Skip interaction inventory
      --skip-state-crawler  Skip hover/focus state crawling
      --skip-performance    Skip performance budgets
      --skip-tokens         Skip design-token extraction and drift
      --skip-breakpoints    Skip content-pressure breakpoint discovery
      --skip-engineering    Skip configured repository commands
      --skip-compare        Skip visual comparison
      --skip-manual-review  Skip loading recorded semantic review
      --skip-aesthetics     Skip loading aesthetic profile/review evidence
      --evidence-visual     Emit reports/visual-evidence.html after the run summary
      --route/--viewport/--state/--case <value>  Filter matrix
  -h, --help                Show help
`;

const OPTIONS = {
  'base-url': { type: 'string' },
  'reference-url': { type: 'string' },
  headed: { type: 'boolean', default: false },
  'refresh-reference': { type: 'boolean', default: false },
  'skip-capture': { type: 'boolean', default: false },
  'skip-inspect': { type: 'boolean', default: false },
  'skip-a11y': { type: 'boolean', default: false },
  'skip-interaction': { type: 'boolean', default: false },
  'skip-state-crawler': { type: 'boolean', default: false },
  'skip-performance': { type: 'boolean', default: false },
  'skip-tokens': { type: 'boolean', default: false },
  'skip-breakpoints': { type: 'boolean', default: false },
  'skip-engineering': { type: 'boolean', default: false },
  'skip-compare': { type: 'boolean', default: false },
  'skip-manual-review': { type: 'boolean', default: false },
  'skip-aesthetics': { type: 'boolean', default: false },
  'evidence-visual': { type: 'boolean', default: false },
  route: { type: 'string' },
  viewport: { type: 'string' },
  state: { type: 'string' },
  case: { type: 'string' }
};

async function collectTokenEvidence(config, { baseUrl, referenceUrl, headed, filters, refreshReference }) {
  if (!config.tokens.enabled) return null;
  const current = await extractTokenProfiles(config, { mode: 'current', baseUrl, headed, filters });
  let reference = [];
  const liveReferenceUrl = referenceUrl ?? config.referenceBaseUrl;
  if (refreshReference || liveReferenceUrl) {
    if (!liveReferenceUrl) throw new Error('--refresh-reference requires --reference-url or referenceBaseUrl in the config.');
    reference = await extractTokenProfiles(config, { mode: 'reference', baseUrl: liveReferenceUrl, headed, filters });
  } else {
    reference = await loadStoredTokenProfiles(config, { mode: 'reference', filters });
  }
  const comparisons = compareTokenProfileSets(reference.filter((item) => item.ok !== false), current.filter((item) => item.ok !== false));
  const reportPath = path.join(config.outputDir, 'reports', 'token-drift.json');
  await writeJsonAtomic(reportPath, {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    policy: { maxDriftScore: config.tokens.maxDriftScore },
    source: liveReferenceUrl ? 'live-reference' : 'approved-or-stored-reference',
    current: current.map(({ key, profilePath, ok, error }) => ({ key, profilePath, ok, error })),
    reference: reference.map(({ key, profilePath, ok, error, stored }) => ({ key, profilePath, ok, error, stored: Boolean(stored) })),
    comparisons
  });
  return { current, reference, comparisons, reportPath };
}

try {
  const args = parseCli(OPTIONS);
  if (args.help) {
    printHelp(HELP);
  } else {
    const config = await loadConfig(args.config);
    const provenance = createRunProvenance(config);
    const filters = { route: args.route, viewport: args.viewport, state: args.state, case: args.case };
    const currentBaseUrl = args['base-url'];
    const referenceUrl = args['reference-url'];
    const sections = {};
    // capture.type selects the driver: 'playwright' runs the web pipeline
    // below unchanged; ios-sim|android run the mobile matrix (capture,
    // optional stored-reference compare, per-case metrics+judge) instead.
    const captureType = config.capture?.type ?? 'playwright';
    const isMobile = captureType !== 'playwright';

    if (isMobile) {
      if (args['refresh-reference']) {
        sections.referenceCapture = await captureAllMobile(config, { mode: 'reference', filters });
      }
      if (!args['skip-capture']) sections.capture = await captureAllMobile(config, { mode: 'current', filters });
      if (!args['skip-compare']) sections.comparison = await compareAll(config, { filters });
      sections.mobileChecks = await runMobileChecks(config, { filters });
      for (const name of ['inspect', 'a11y', 'interaction', 'state-crawler', 'performance', 'tokens', 'breakpoints', 'engineering']) {
        process.stdout.write(`${name}: skipped (web-only section)\n`);
      }
    } else {
      if (args['refresh-reference']) {
        const liveReferenceUrl = referenceUrl ?? config.referenceBaseUrl;
        if (!liveReferenceUrl) throw new Error('--refresh-reference requires --reference-url or referenceBaseUrl in the config.');
        sections.referenceCapture = await captureAll(config, { mode: 'reference', baseUrl: liveReferenceUrl, headed: args.headed, filters });
      }
      if (!args['skip-capture']) sections.capture = await captureAll(config, { mode: 'current', baseUrl: currentBaseUrl, headed: args.headed, filters });
      if (!args['skip-inspect']) sections.inspection = await inspectAll(config, { baseUrl: currentBaseUrl, headed: args.headed, filters });
      if (!args['skip-a11y']) sections.accessibility = await auditA11yAll(config, { baseUrl: currentBaseUrl, headed: args.headed, filters });
      if (!args['skip-interaction']) sections.interaction = await inspectInteractionsAll(config, { baseUrl: currentBaseUrl, headed: args.headed, filters });
      if (!args['skip-state-crawler']) sections.stateCrawler = await crawlInteractionStatesAll(config, { baseUrl: currentBaseUrl, headed: args.headed, filters });
      if (!args['skip-performance']) sections.performance = await auditPerformanceAll(config, { baseUrl: currentBaseUrl, headed: args.headed, filters });
      if (!args['skip-tokens']) sections.tokens = await collectTokenEvidence(config, { baseUrl: currentBaseUrl, referenceUrl, headed: args.headed, filters, refreshReference: args['refresh-reference'] });
      if (!args['skip-breakpoints']) sections.breakpoints = await discoverBreakpoints(config, { baseUrl: currentBaseUrl, headed: args.headed, filters });
      if (config.baseline.enabled) sections.baseline = await verifyBaselineForConfig(config);
      if (!args['skip-engineering']) sections.engineering = await runEngineeringChecks(config);
      if (!args['skip-compare']) sections.comparison = await compareAll(config, { filters });
      if (!args['skip-manual-review']) sections.manualReview = await loadSemanticVisualReview(config, provenance.configHash);
      if (!args['skip-aesthetics']) sections.aesthetics = await loadAestheticEvidence(config, provenance.configHash);
    }

    // Mobile runs skip the web-only sections above, so the summary scores a
    // clone of the config with those sections' evidence gates disabled;
    // the web path keeps the original config untouched.
    const summaryConfig = isMobile
      ? {
          ...config,
          inspection: { ...config.inspection, enabled: false },
          accessibility: { ...config.accessibility, enabled: false },
          interaction: { ...config.interaction, enabled: false },
          stateCrawler: { ...config.stateCrawler, enabled: false },
          performance: { ...config.performance, enabled: false },
          tokens: { ...config.tokens, enabled: false },
          engineeringChecks: [],
          breakpoints: { ...config.breakpoints, enabled: false },
          // Aesthetic/baseline evidence is web-only: a mobile run can never
          // produce it, so leaving these enabled would hard-fail every mobile
          // run as required-but-absent evidence (gate-engine.mjs).
          aesthetics: { ...config.aesthetics, enabled: false },
          baseline: { ...config.baseline, enabled: false },
          // History recording follows the same clone family: mobile runs score
          // all-not-applicable (0/100) by definition, and recording those rows
          // would poison the trend analysis of a web repo adopting mobile.
          history: { ...config.history, enabled: false },
          // On mobile the authoritative gate is the mobileChecks verdict set
          // (plus a mobile comparison when present). The web score floor is
          // removed because no web gates are applicable — with the default
          // floors (85/85) an all-not-applicable score of 0/100 would fail
          // every clean mobile run regardless of its actual verdicts.
          quality: { ...config.quality, minScore: 0, minConfidence: 0 }
        }
      : config;
    const summary = await writeRunSummary(summaryConfig, sections, { provenance });
    // Post-summary, opt-in: fold the artifacts this run left on disk into one
    // self-contained HTML evidence report. Runs identically on web and mobile
    // configs; the engine degrades missing inputs to badges, never throws on
    // absent sections (outputDir itself exists — writeRunSummary just wrote it).
    let visualEvidencePath = null;
    if (args['evidence-visual']) {
      const { collectEvidence, renderEvidenceHtml } = await import('../lib/visual-evidence-engine.mjs');
      const evidence = await collectEvidence(config.outputDir);
      visualEvidencePath = path.join(config.outputDir, 'reports', 'visual-evidence.html');
      await writeTextAtomic(visualEvidencePath, renderEvidenceHtml(evidence));
    }
    process.stdout.write([
      `Automated evidence gate: ${summary.automatedGatePassed ? 'PASS' : 'FAIL'}`,
      `Quality score: ${summary.quality.score}/100 (${summary.quality.grade})`,
      `Evidence confidence: ${summary.quality.confidence}%`,
      `Aesthetic gate: ${summary.quality.gates.aesthetic?.status ?? 'not-applicable'}`,
      `Semantic visual review: ${summary.semanticVisualReviewPassed ? 'PASS' : 'PENDING/FAIL'}`,
      `Release decision: ${summary.releaseDecision}`,
      `Summary: ${summary.markdownPath ?? summary.jsonPath}`,
      ...(visualEvidencePath ? [`Visual evidence: ${visualEvidencePath}`] : [])
    ].join('\n') + '\n');
    if (isMobile) {
      // The mobile gate is the mobileChecks verdict set itself: any failing
      // case fails the run, independent of the web-derived quality gates.
      const checks = sections.mobileChecks ?? [];
      const failedChecks = checks.filter((result) => result.verdict === 'fail').length;
      process.stdout.write(`Mobile checks: ${checks.length - failedChecks} passed, ${failedChecks} failed\n`);
      if (failedChecks > 0) process.exitCode = 1;
    }
    if (!summary.automatedGatePassed) process.exitCode = 1;
  }
} catch (error) {
  fail(error);
}
