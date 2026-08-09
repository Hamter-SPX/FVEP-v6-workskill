// Run intelligence engine: best-effort recorder (called from vision-loop after
// writeRunSummary) + deterministic rule-based analytics over the intel store.
// Every insight cites real run ids/counts — no claims beyond recorded evidence.
import crypto from 'node:crypto';
import path from 'node:path';
import { openIntelStore } from './run-intel-store.mjs';

// Comparison snapshots collapse to a single rule so pixel-diff recurrences can
// be tracked across runs; the comparison `reason` stays in detail_json.
const COMPARISON_DIFF_RULE = 'visual-diff';
// Severities worth recording from the comparison section (accepted/minor/unverified
// are routine gate noise, not recurring intelligence).
const RECORDED_COMPARISON_SEVERITIES = new Set(['blocker', 'major']);

const QUERY_LIMIT = 100000; // store-side clamp ceiling: analytics window scans want every row
const DAY_MS = 24 * 60 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function countByRun(map, key, runId) {
  if (key == null) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(runId);
}

function setSizes(map) {
  return Object.fromEntries([...map.entries()].map(([key, ids]) => [key, ids.size]).sort((a, b) => b[1] - a[1]));
}

// Idempotency key: brief-mandated uniqueness is (run_id, rule, case_key, device, source).
function dedupeKey(row) {
  return [row.rule, row.case_key, row.device, row.source].map((v) => v ?? '\u0000').join('\u{FFE8}');
}

// Flatten live loop sections into finding rows. Mobile-check judgments carry
// their own rule ids (vision-judge-engine); comparison rows become 'visual-diff'
// snapshots. Mobile compare keys follow mobileCaseRuns' raw join
// `${label}__${deviceKey ?? 'mobile'}__${caseKey}` — the middle segment IS the
// device key, so device correlations can be recovered honestly. Web compare
// keys are route__viewport__state (a viewport, not a device) → device stays null.
function findingsFromSections(config, sections = {}) {
  const rows = [];
  for (const check of sections.mobileChecks ?? []) {
    for (const finding of check.findings ?? []) {
      if (typeof finding?.rule !== 'string' || finding.rule === '') continue;
      rows.push({
        source: 'mobile-checks',
        rule: finding.rule,
        severity: finding.severity ?? null,
        case_key: check.key ?? null,
        device: null, // runMobileChecks reports per-case keys; device identity is not in this section
        detail: { expected: finding.expected ?? null, observed: finding.observed ?? null, verdict: check.verdict ?? null },
      });
    }
  }
  const comparisons = sections.comparison?.comparisons;
  if (Array.isArray(comparisons)) {
    const isMobile = (config.capture?.type ?? 'playwright') !== 'playwright';
    for (const item of comparisons) {
      if (!RECORDED_COMPARISON_SEVERITIES.has(item.severity)) continue;
      const parts = String(item.key ?? '').split('__');
      rows.push({
        source: 'comparison',
        rule: COMPARISON_DIFF_RULE,
        severity: item.severity,
        case_key: item.key ?? null,
        device: isMobile && parts.length === 3 ? parts[1] : null,
        detail: { reason: item.reason ?? null, mismatchRatio: item.mismatchRatio ?? null },
      });
    }
  }
  return rows;
}

// Never throws: every store interaction is guarded and failures land in
// warnings. Idempotent per runId — existing findings for the run are queried
// first and exact (rule, case_key, device, source) duplicates are skipped.
export async function recordRunIntel(config, sections, summary, { store: injected } = {}) {
  const warnings = [];
  let recordedRuns = 0;
  let recordedFindings = 0;
  let store = injected ?? null;
  let owned = false;
  const outputDir = path.resolve(config.outputDir);
  if (!store) {
    try {
      store = await openIntelStore(outputDir);
      owned = true;
    } catch (error) {
      warnings.push(`open intel store failed: ${error?.message ?? error}`);
    }
  }
  // Capture-time identity comes from provenance when present (run capture may
  // collide on timestamp-only ids); a fresh uuid is the last-resort fallback.
  const runId = summary?.provenance?.runId ?? `run-${crypto.randomUUID()}`;
  const createdAt = summary?.generatedAt ?? nowIso();

  if (store) {
    try {
      await store.recordRun({
        run_id: runId,
        output_dir: outputDir,
        gate_outcome: summary?.automatedGatePassed ? 'pass' : 'fail',
        score: summary?.quality?.score ?? null,
        blockers: summary?.remediation?.blockers ?? null,
        cases_count: sections?.mobileChecks?.length ?? sections?.comparison?.comparisons?.length ?? null,
        created_at: createdAt,
      });
      recordedRuns = 1; // runs are upserted (INSERT OR REPLACE / last-write-wins)
    } catch (error) {
      warnings.push(`record run ${runId} failed: ${error?.message ?? error}`);
    }

    const rows = findingsFromSections(config, sections).map((row) => ({
      run_id: runId,
      output_dir: outputDir,
      source: row.source,
      rule: row.rule,
      severity: row.severity,
      case_key: row.case_key,
      device: row.device,
      detail_json: JSON.stringify(row.detail),
      created_at: createdAt,
    }));

    if (rows.length > 0) {
      let existingKeys = null;
      try {
        const existing = await store.queryFindings({ outputDir, limit: QUERY_LIMIT });
        existingKeys = new Set(existing.filter((row) => row.run_id === runId).map(dedupeKey));
      } catch (error) {
        // Without the dedupe read we cannot guarantee idempotency — skipping
        // the insert is the graceful failure mode (dupes would corrupt trends).
        warnings.push(`dedupe query for run ${runId} failed — findings skipped: ${error?.message ?? error}`);
      }
      if (existingKeys) {
        const fresh = [];
        for (const row of rows) {
          const key = dedupeKey(row);
          if (existingKeys.has(key)) continue; // already recorded (or intra-batch twin)
          existingKeys.add(key);
          fresh.push(row);
        }
        try {
          await store.recordFindings(fresh);
          recordedFindings = fresh.length;
        } catch (error) {
          warnings.push(`record findings for run ${runId} failed: ${error?.message ?? error}`);
        }
      }
    }
  }
  if (owned) {
    try {
      store.close();
    } catch (error) {
      warnings.push(`close intel store failed: ${error?.message ?? error}`);
    }
  }
  return { recordedRuns, recordedFindings, warnings };
}

// Two-line advisory rendering for the vision-loop summary block: top
// recurring rule first, then top streak, capped at maxLines. Advisory only —
// callers must keep these lines out of any gate.
export function formatIntelAdvisory(analysis, { windowDays = 14, maxLines = 2 } = {}) {
  const lines = [];
  const recurring = analysis?.recurring?.[0];
  if (recurring) {
    const topCase = Object.keys(recurring.cases ?? {})[0]; // setSizes order: most-hit case first
    lines.push(`สถิติ run: rule '${recurring.rule}' เกิด ${recurring.occurrences} ครั้งในช่วง ${windowDays} วัน${topCase ? ` — ตรวจ ${topCase}` : ''}`);
  }
  const streak = analysis?.streaks?.[0];
  if (streak && lines.length < maxLines) {
    lines.push(`สตรีค: rule '${streak.rule}' ล้มติดกัน ${streak.consecutiveFailures} รัน`);
  }
  return lines.slice(0, maxLines);
}

// Five deterministic, evidence-backed insight families over the store window.
export async function analyzeRunIntel(outputDir, { windowDays = 14, minOccurrences = 2, streak = 2, limitRuns = 200, store: injected } = {}) {
  let store = injected ?? null;
  let owned = false;
  if (!store) {
    store = await openIntelStore(outputDir);
    owned = true;
  }
  try {
    const resolvedDir = path.resolve(outputDir);
    const sinceIso = daysAgoIso(windowDays);
    const runsAll = await store.listRuns({ outputDir: resolvedDir, limit: limitRuns });
    const runs = runsAll.filter((run) => String(run.created_at ?? '') >= sinceIso); // newest-first order preserved
    const runPos = new Map(runs.map((run, index) => [run.run_id, index])); // 0 = newest
    const runIds = new Set(runPos.keys());
    const findingsAll = await store.queryFindings({ outputDir: resolvedDir, since: sinceIso, limit: QUERY_LIMIT });
    // Findings are bucketed per run; rows from runs outside the window list
    // (e.g. pruned run rows) still count toward findingsInWindow but do not
    // feed run-ordered insights (streaks/regressions need adjacency).
    const byRun = new Map(runs.map((run) => [run.run_id, []]));
    for (const row of findingsAll) {
      if (runIds.has(row.run_id)) byRun.get(row.run_id).push(row);
    }

    // Per-rule aggregation over runs it appeared in.
    const ruleStats = new Map();
    for (const [runId, pos] of runPos) {
      for (const row of byRun.get(runId)) {
        if (row.rule == null) continue;
        if (!ruleStats.has(row.rule)) {
          ruleStats.set(row.rule, { runs: new Map(), sources: new Set(), cases: new Map(), devices: new Map() });
        }
        const stat = ruleStats.get(row.rule);
        stat.runs.set(runId, pos);
        stat.sources.add(row.source ?? 'unknown');
        countByRun(stat.cases, row.case_key, runId);
        countByRun(stat.devices, row.device, runId);
      }
    }

    // (1) Recurring: rules failing in >= minOccurrences runs of the window.
    const recurring = [];
    for (const [rule, stat] of ruleStats) {
      const occurrences = stat.runs.size;
      if (occurrences < minOccurrences) continue;
      const lastSeenRunId = [...stat.runs.entries()].sort((a, b) => a[1] - b[1])[0][0];
      recurring.push({
        rule,
        occurrences,
        lastSeenRunId,
        sources: [...stat.sources].sort(),
        cases: setSizes(stat.cases),
        devices: setSizes(stat.devices),
        insight: `rule '${rule}' เกิด ${occurrences} ครั้งใน ${runs.length} รันที่บันทึก (ล่าสุด run ${lastSeenRunId})`,
      });
    }
    recurring.sort((a, b) => b.occurrences - a.occurrences || runPos.get(a.lastSeenRunId) - runPos.get(b.lastSeenRunId));

    // Adjacency helper: does (rule, case_key, device) appear in run at index i?
    const hasTriple = (index, triple) =>
      (byRun.get(runs[index].run_id) ?? []).some((row) => dedupeKey(row) === triple);

    // (2) Streaks: (rule, case, device) failing in every run from the newest backwards.
    const streaks = [];
    if (runs.length > 0) {
      const newestTriples = new Map();
      for (const row of byRun.get(runs[0].run_id)) {
        const key = dedupeKey(row);
        if (!newestTriples.has(key)) newestTriples.set(key, { rule: row.rule, case_key: row.case_key, device: row.device });
      }
      for (const [key, info] of newestTriples) {
        let consecutive = 1;
        while (consecutive < runs.length && hasTriple(consecutive, key)) consecutive += 1;
        if (consecutive >= streak) {
          streaks.push({ ...info, consecutiveFailures: consecutive, lastRunId: runs[0].run_id });
        }
      }
      streaks.sort((a, b) => b.consecutiveFailures - a.consecutiveFailures);
    }

    // (3) Correlations: a rule pinned to exactly one non-null device.
    const correlations = [];
    for (const [rule, stat] of ruleStats) {
      if (stat.devices.size !== 1) continue;
      const [device, deviceRunIds] = [...stat.devices.entries()][0];
      const ruleCount = deviceRunIds.size;
      if (ruleCount < minOccurrences) continue;
      const totalRunsByDevice = runs.filter((run) =>
        (byRun.get(run.run_id) ?? []).some((row) => row.device === device),
      ).length;
      if (totalRunsByDevice === 0) continue;
      const ratio = ruleCount / totalRunsByDevice;
      correlations.push({
        rule,
        device,
        ruleCount,
        totalRunsByDevice,
        ratio: Number(ratio.toFixed(3)),
        note: `rule '${rule}' พบเฉพาะ device '${device}' — ${ruleCount} จาก ${totalRunsByDevice} รันที่มี finding ของ device นี้ (${Math.round(ratio * 100)}%)`,
      });
    }
    correlations.sort((a, b) => b.ratio - a.ratio || b.ruleCount - a.ruleCount);

    // (4) Resolved: rule absent from the newest `streak` runs but historically
    // recurring — resolvedAfterRuns = index of its newest occurrence.
    // Absence-as-resolution is list-presence-based (same proxy family as the
    // pass proxy in regressions below): runs recorded with --case/--route
    // filters under-represent absence — not a guarantee the issue was fixed.
    const resolved = [];
    for (const [rule, stat] of ruleStats) {
      if (stat.runs.size < minOccurrences) continue;
      const newestPos = Math.min(...stat.runs.values());
      if (newestPos < streak) continue; // still active within the streak window
      const lastFailureRunId = runs[newestPos].run_id;
      resolved.push({
        rule,
        lastFailureRunId,
        resolvedAfterRuns: newestPos,
        note: `rule '${rule}' ไม่พบใน ${newestPos} รันล่าสุด (fail ล่าสุด run ${lastFailureRunId})`,
      });
    }
    resolved.sort((a, b) => b.resolvedAfterRuns - a.resolvedAfterRuns);

    // (5) Regressions: per case, the most recent adjacent pass→fail transition.
    // "Passed" here means the run recorded no finding for that case (absence of
    // evidence as the pass proxy — the runs table has no per-case outcomes).
    const caseKeys = new Set(findingsAll.map((row) => row.case_key).filter((key) => key != null));
    const regressions = [];
    for (const caseKey of caseKeys) {
      const failsAt = (index) => (byRun.get(runs[index].run_id) ?? []).some((row) => row.case_key === caseKey);
      for (let i = 0; i + 1 < runs.length; i += 1) {
        if (failsAt(i) && !failsAt(i + 1)) {
          regressions.push({ case_key: caseKey, fromPassedToFailedRunIds: [runs[i + 1].run_id, runs[i].run_id] });
          break; // most recent transition only
        }
      }
    }

    return {
      recurring,
      streaks,
      correlations,
      resolved,
      regressions,
      totals: {
        runsInWindow: runs.length,
        findingsInWindow: findingsAll.length,
        dbMode: store.mode,
      },
    };
  } finally {
    if (owned) {
      try {
        store.close();
      } catch {
        // analyze is read-only; a close failure must not fail reporting
      }
    }
  }
}
