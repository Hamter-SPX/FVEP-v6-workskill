/**
 * Visual evidence report engine.
 *
 * Collects what a vision-loop run already leaves on disk — screenshots under
 * {current,reference,diff}/, schemaVersion-2 capture metadata and mobile
 * judgments under metadata/, reports/comparison.json and (optionally)
 * reports/run-summary.json — and renders one self-contained HTML report
 * (inline CSS, base64 thumbnails, no JS) that reviewers can open offline.
 *
 * Strictly read-only against the artifact tree: every missing or unreadable
 * input degrades to null/absent instead of throwing. The single hard error
 * is an output directory that does not exist at all.
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import { safeSegment } from './artifacts.mjs';
import { fileExists } from './io.mjs';
import { computeVisionMetrics } from './vision-metrics-engine.mjs';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// comparison.json severities (accepted|minor|major|blocker|unverified) and
// judge verdicts (pass|warn|fail) share one unified ladder in this report.
const UNIFIED_VERDICT = {
  pass: 'pass', accepted: 'pass',
  warn: 'warn', minor: 'warn', unverified: 'warn',
  fail: 'fail', major: 'fail', blocker: 'fail'
};
// Judgment verdicts also route through this: uncanonical values (missing or
// hostile strings from hand-written judgment JSON) normalize to null instead
// of leaking into rendered markup.
const mapVerdict = (value) => UNIFIED_VERDICT[value] ?? null;

// compare-engine writes mobile comparisons[].key as the RAW
// `${label}__${viewportName}__${key}` join (mobileCaseRuns,
// lib/mobile-capture-engine.mjs) — label, device key and case key go in
// unnormalized — while artifactPaths keys are safeSegment-normalized:
// 'Home Page'/'home_screen' would otherwise fracture one case into a joined
// card plus a phantom. Canonicalizing every three-part comparison key
// (route/viewport/state) by safeSegment-ing each segment and re-joining joins
// them under one rule: already-canonical segments pass through bit-identical,
// so legacy `__mobile__` keys keep their exact pinned spellings
// ('home-page__mobile__home-screen' ≡ safeSegment of each part) and
// device-matrix keys ('Home Page__iphone16__home') land on the same card too.
// Keys of any other shape (fewer/more segments) are left untouched.
function normalizeComparisonKey(key) {
  const parts = String(key).split('__');
  if (parts.length !== 3) return key;
  return parts.map(safeSegment).join('__');
}

// Sources larger than 32MP are refused before decode: decoding costs ~4 bytes
// per pixel in memory, and a runaway artifact must not stall the report.
const MAX_SOURCE_PIXELS = 32_000_000;

function asBuffer(bytes) {
  if (Buffer.isBuffer(bytes)) return bytes;
  if (bytes instanceof Uint8Array || Array.isArray(bytes)) return Buffer.from(bytes);
  return null;
}

// Cheap IHDR sniff; the expensive PNG.sync.read only runs for plausible,
// size-capped inputs.
function sniffPng(bytes) {
  if (!bytes || bytes.length < 24) return null;
  if (bytes.readUInt32BE(0) !== 0x89504e47) return null;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (!width || !height || width * height > MAX_SOURCE_PIXELS) return null;
  return { width, height };
}

function decodePng(bytes) {
  const buffer = asBuffer(bytes);
  if (!buffer || !sniffPng(buffer)) return null;
  try { return PNG.sync.read(buffer); } catch { return null; }
}

/**
 * Downscale a PNG to at most maxWidth wide (nearest-neighbor, aspect-ratio
 * preserving) and return a base64 payload for embedding. Images already at or
 * below maxWidth are passed through unchanged. Invalid or oversized input
 * returns null — thumbnails are cosmetic and must never abort a report.
 */
export function thumbnail(pngBytes, { maxWidth = 240 } = {}) {
  const buffer = asBuffer(pngBytes);
  if (!buffer || !Number.isFinite(maxWidth) || maxWidth <= 0) return null;
  const png = decodePng(buffer);
  if (!png) return null;
  if (png.width <= maxWidth) {
    return { base64: buffer.toString('base64'), width: png.width, height: png.height };
  }
  const scale = maxWidth / png.width;
  const width = Math.max(1, Math.round(png.width * scale));
  const height = Math.max(1, Math.round(png.height * scale));
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(png.height - 1, Math.floor(y / scale));
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(png.width - 1, Math.floor(x / scale));
      const from = (sourceY * png.width + sourceX) * 4;
      png.data.copy(out.data, (y * width + x) * 4, from, from + 4);
    }
  }
  return { base64: PNG.sync.write(out).toString('base64'), width, height };
}

async function readJsonIfExists(file) {
  if (!await fileExists(file)) return null;
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; }
}

// A present-but-unreadable artifact (EACCES, EISDIR) must degrade to absent
// bytes — never abort the whole report run.
async function readFileOrNull(file) {
  try { return await fs.readFile(file); } catch { return null; }
}

async function listKeys(directory, suffix) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    // Directories carrying the suffix are listed too: a `<key>.png` that is a
    // directory (or otherwise unreadable) is present-but-unreadable evidence
    // and must surface as a case with absent thumbs/metrics — invisibly
    // dropping it would make the report claim less than the disk holds.
    return entries
      .filter((entry) => (entry.isFile() || entry.isDirectory()) && entry.name.endsWith(suffix))
      .map((entry) => entry.name.slice(0, -suffix.length));
  } catch { return []; }
}

const CURRENT_CAPTURE_SUFFIX = '.current.capture.json';
const REFERENCE_CAPTURE_SUFFIX = '.reference.capture.json';
const MOBILE_JUDGMENT_SUFFIX = '.mobile.judgment.json';

async function readMetadata(directory) {
  const capture = { current: new Map(), reference: new Map() };
  const judgments = new Map();
  let count = 0;
  let entries = [];
  try { entries = await fs.readdir(directory, { withFileTypes: true }); } catch { return { capture, judgments, count }; }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    let bucket = null;
    let key = null;
    if (entry.name.endsWith(CURRENT_CAPTURE_SUFFIX)) { bucket = capture.current; key = entry.name.slice(0, -CURRENT_CAPTURE_SUFFIX.length); }
    else if (entry.name.endsWith(REFERENCE_CAPTURE_SUFFIX)) { bucket = capture.reference; key = entry.name.slice(0, -REFERENCE_CAPTURE_SUFFIX.length); }
    else if (entry.name.endsWith(MOBILE_JUDGMENT_SUFFIX)) { bucket = judgments; key = entry.name.slice(0, -MOBILE_JUDGMENT_SUFFIX.length); }
    else continue;
    const parsed = await readJsonIfExists(path.join(directory, entry.name));
    if (parsed) { bucket.set(key, parsed); count += 1; }
  }
  return { capture, judgments, count };
}

// Gate ladder sections — canonical order mirrors lib/run-summary.mjs
// summarizeSections; unknown extra sections append at the end.
const SECTION_ORDER = [
  'capture', 'comparison', 'mobileChecks', 'inspection', 'accessibility',
  'interaction', 'stateCrawler', 'performance', 'tokens', 'engineering',
  'breakpoints', 'baseline', 'manualReview', 'aesthetics'
];

function sectionStatus(value) {
  if (value == null || value.missing === true) return 'absent';
  const failures = Number(value.failed ?? 0) + Number(value.blockers ?? 0) + Number(value.requiredFailures ?? 0);
  if (value.status === 'fail' || value.passed === false || value.ok === false || value.valid === false || failures > 0) return 'fail';
  const warnings = Number(value.warnings ?? 0) + Number(value.majors ?? 0) + Number(value.unverified ?? 0);
  if (value.status === 'warn' || warnings > 0) return 'warn';
  return 'pass';
}

const SECTION_DETAILS = {
  capture: (v) => `${(v.total ?? 0) - (v.failed ?? 0)}/${v.total ?? 0} captured`,
  comparison: (v) => `blockers ${v.blockers ?? 0} · majors ${v.majors ?? 0} · minors ${v.minors ?? 0} · accepted ${v.accepted ?? 0} · unverified ${v.unverified ?? 0}`,
  mobileChecks: (v) => `${(v.total ?? 0) - (v.failed ?? 0)}/${v.total ?? 0} pass`,
  inspection: (v) => `overflow ${v.overflowCases ?? 0} · overlap ${v.overlapCases ?? 0} · clipped ${v.clippedTextCases ?? 0}`,
  accessibility: (v) => `blocking violations ${v.blockingViolations ?? 0} · incomplete ${v.incomplete ?? 0}`,
  interaction: (v) => `missing names ${v.missingNames ?? 0} · target size ${v.targetSizeViolations ?? 0}`,
  stateCrawler: (v) => `elements ${v.elements ?? 0} · focus gaps ${v.missingFocusFeedback ?? 0}`,
  performance: (v) => `avg score ${v.averageScore ?? '—'} · warnings ${v.warnings ?? 0}`,
  tokens: (v) => `max drift ${v.maxDriftScore ?? '—'} · comparisons ${v.comparisons ?? 0}`,
  engineering: (v) => `required failures ${v.requiredFailures ?? 0} · optional ${v.optionalFailures ?? 0}`,
  breakpoints: (v) => `candidates ${v.candidateCount ?? 0} · overflow samples ${v.overflowSampleCount ?? 0}`,
  baseline: (v) => `checked ${v.checked ?? 0} · changed ${v.changed ?? 0} · missing ${v.missing ?? 0}`,
  manualReview: (v) => `${v.status ?? 'unknown'}${v.score != null ? ` · score ${v.score}` : ''}`,
  aesthetics: (v) => `score ${v.score ?? '—'} · findings ${v.findings ?? 0} · blockers ${v.blockers ?? 0}`
};

function buildSections(runSummary) {
  const source = runSummary?.sections;
  if (!source || typeof source !== 'object') return [];
  const names = [
    ...SECTION_ORDER.filter((name) => name in source),
    ...Object.keys(source).filter((name) => !SECTION_ORDER.includes(name))
  ];
  return names.map((name) => {
    const value = source[name];
    const detail = value == null
      ? 'not recorded'
      : SECTION_DETAILS[name]
        ? SECTION_DETAILS[name](value)
        : Object.entries(value).filter(([, v]) => typeof v === 'number' || typeof v === 'boolean').slice(0, 4).map(([k, v]) => `${k} ${v}`).join(' · ');
    return { name, status: sectionStatus(value), detail };
  });
}

/**
 * Read the artifact tree under outputDir and fold every case identity (from
 * screenshots, capture metadata, mobile judgments, comparison rows) into one
 * verdict-carrying record each. Optional inputs degrade gracefully.
 */
export async function collectEvidence(outputDir) {
  const root = path.resolve(String(outputDir ?? ''));
  if (!outputDir || !await fileExists(root)) {
    throw new Error(`collectEvidence: output directory not found: ${root}`);
  }

  const [currentKeys, referenceKeys, diffKeys, metadata, comparison, runSummary] = await Promise.all([
    listKeys(path.join(root, 'current'), '.png'),
    listKeys(path.join(root, 'reference'), '.png'),
    listKeys(path.join(root, 'diff'), '.png'),
    readMetadata(path.join(root, 'metadata')),
    readJsonIfExists(path.join(root, 'reports', 'comparison.json')),
    readJsonIfExists(path.join(root, 'reports', 'run-summary.json'))
  ]);

  const comparisonsByKey = new Map(
    (Array.isArray(comparison?.comparisons) ? comparison.comparisons : [])
      .filter((item) => item && typeof item.key === 'string')
      .map((item) => [normalizeComparisonKey(item.key), item])
  );
  const caseKeys = new Set([
    ...currentKeys, ...referenceKeys, ...diffKeys,
    ...metadata.capture.current.keys(), ...metadata.capture.reference.keys(),
    ...metadata.judgments.keys(), ...comparisonsByKey.keys()
  ]);

  const cases = [];
  let capturePlatform = null;
  let latestCapturedAt = null;

  for (const key of [...caseKeys].sort()) {
    const hasCurrent = currentKeys.includes(key);
    const hasReference = referenceKeys.includes(key);
    const hasDiff = diffKeys.includes(key);
    // Unguarded reads here used to let one unreadable artifact (EACCES,
    // EISDIR) abort the entire collect — the case now degrades to null
    // bytes and renders absent thumbs/metrics, per the degradation contract.
    const currentBytes = hasCurrent ? await readFileOrNull(path.join(root, 'current', `${key}.png`)) : null;
    const referenceBytes = hasReference ? await readFileOrNull(path.join(root, 'reference', `${key}.png`)) : null;
    const diffBytes = hasDiff ? await readFileOrNull(path.join(root, 'diff', `${key}.png`)) : null;

    // current capture meta is the only trustworthy source of the CURRENT
    // screenshot's capture-time hash. A reference-only sidecar sits next to a
    // current PNG in promoted-baseline runs; using its hash as captureSha256
    // guaranteed a false "stale evidence" divergence, so that configuration
    // reports the capture hash as unknown (and badges the card) instead.
    const currentMeta = metadata.capture.current.get(key) ?? null;
    const referenceMeta = metadata.capture.reference.get(key) ?? null;
    const meta = currentMeta ?? referenceMeta;
    const metaSource = currentMeta ? 'current' : referenceMeta ? 'reference' : null;
    const judgment = metadata.judgments.get(key) ?? null;
    const cmp = comparisonsByKey.get(key) ?? null;
    if (!capturePlatform && typeof meta?.platform === 'string') capturePlatform = meta.platform;
    if (typeof meta?.capturedAt === 'string' && (!latestCapturedAt || meta.capturedAt > latestCapturedAt)) {
      latestCapturedAt = meta.capturedAt;
    }

    // Metrics + source hash come from the exact bytes the report displays —
    // if the file changed after capture/judging, metricsSha256 diverges from
    // captureSha256 and the HTML flags the evidence as stale.
    let metricsSha256 = null;
    let metrics = null;
    if (currentBytes) {
      const png = decodePng(currentBytes);
      if (png) {
        metricsSha256 = crypto.createHash('sha256').update(currentBytes).digest('hex');
        try {
          const computed = computeVisionMetrics({ width: png.width, height: png.height, data: png.data });
          metrics = {
            emptyCells: computed.occupancy.emptyCells.length,
            density: Number(computed.density.mean.toFixed(4)),
            harmony: computed.palette.harmony,
            align: computed.alignment.score,
            darkShare: Number(computed.contrast.darkShare.toFixed(4)),
            lightShare: Number(computed.contrast.lightShare.toFixed(4))
          };
        } catch { metrics = null; }
      }
    }
    // Only a current-capture sidecar records a capture-time hash of the
    // CURRENT screenshot. With no capture metadata at all the capture-time
    // hash is unknown — reusing the report-time metricsSha256 under the
    // captureSha256 label would fake provenance (two identical rows, one
    // pretending the capture engine recorded it), so the row is omitted.
    const captureSha256 = typeof currentMeta?.screenshotSha256 === 'string'
      ? currentMeta.screenshotSha256
      : null;

    // Absent slots are explicit null so consumers get a fixed triplet shape.
    const thumbs = (hasCurrent || hasReference || hasDiff)
      ? {
          reference: hasReference ? thumbnail(referenceBytes) : null,
          current: hasCurrent ? thumbnail(currentBytes) : null,
          diff: hasDiff ? thumbnail(diffBytes) : null
        }
      : null;

    const severity = cmp?.severity ?? null;
    const verdict = mapVerdict(judgment?.verdict) ?? mapVerdict(severity);
    const findings = Array.isArray(judgment?.findings)
      ? judgment.findings
      : (Array.isArray(cmp?.notes) ? cmp.notes : []).map((note) => ({
          rule: cmp.reason ?? 'comparison',
          severity: mapVerdict(severity) === 'pass' ? 'info' : (mapVerdict(severity) ?? 'info'),
          expected: 'reference parity',
          observed: note
        }));

    cases.push({
      key,
      label: meta?.label ?? meta?.route ?? judgment?.case_label ?? key,
      verdict,
      severity,
      findings,
      thumbs,
      metrics,
      metaSource,
      hashes: {
        ...(captureSha256 ? { captureSha256 } : {}),
        ...(metricsSha256 ? { metricsSha256 } : {})
      },
      paths: {
        ...(hasReference ? { reference: `reference/${key}.png` } : {}),
        ...(hasCurrent ? { current: `current/${key}.png` } : {}),
        ...(hasDiff ? { diff: `diff/${key}.png` } : {}),
        ...(meta ? { captureMetadata: `metadata/${key}${metaSource === 'reference' ? REFERENCE_CAPTURE_SUFFIX : CURRENT_CAPTURE_SUFFIX}` } : {}),
        ...(judgment ? { judgment: `metadata/${key}${MOBILE_JUDGMENT_SUFFIX}` } : {})
      }
    });
  }

  const passed = cases.filter((item) => item.verdict === 'pass').length;
  const failed = cases.filter((item) => item.verdict === 'fail').length;
  const warned = cases.filter((item) => item.verdict === 'warn').length;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    outputDir: root,
    runId: runSummary?.provenance?.runId ?? null,
    // A capture-recorded platform (ios-sim|android) is more informative than the
    // host OS; fall back to the provenance environment for web runs.
    platform: capturePlatform ?? runSummary?.provenance?.environment?.platform ?? null,
    capturedAt: runSummary?.generatedAt ?? comparison?.generatedAt ?? latestCapturedAt,
    configPath: runSummary?.configPath ?? comparison?.configPath ?? null,
    configHash: runSummary?.provenance?.configHash ?? null,
    summary: {
      passed,
      failed,
      warned,
      total: cases.length,
      ...(typeof runSummary?.quality?.score === 'number' ? { qualityScore: runSummary.quality.score } : {}),
      ...(runSummary?.releaseDecision ? { releaseDecision: runSummary.releaseDecision } : {})
    },
    sections: buildSections(runSummary),
    sources: {
      comparisonJson: Boolean(comparison),
      runSummaryJson: Boolean(runSummary),
      metadataFiles: metadata.count,
      images: currentKeys.length + referenceKeys.length + diffKeys.length
    },
    cases
  };
}

// --- HTML rendering ---------------------------------------------------------

const formatDynamic = (value) => escapeHtml(value == null ? '—' : value);
const formatJson = (value) => escapeHtml(JSON.stringify(value));
const formatPercent = (value) => (Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : '—');

function chip(verdict) {
  const kind = verdict ?? 'unknown';
  // kind is verdict-normalized upstream AND escaped here — it renders inside a
  // class attribute, so a hostile judgment verdict must never land raw.
  return `<span class="chip chip--${escapeHtml(kind)}">${escapeHtml(kind.toUpperCase())}</span>`;
}

function thumbFigure(label, key, thumb) {
  if (!thumb) return `<figure><figcaption>${escapeHtml(label)}</figcaption><div class="noimg">absent</div></figure>`;
  return `<figure><figcaption>${escapeHtml(label)}</figcaption><img loading="lazy" src="data:image/png;base64,${thumb.base64}" width="${thumb.width}" height="${thumb.height}" alt="${escapeHtml(`${label} of ${key}`)}"></figure>`;
}

function metricsLine(metrics) {
  if (!metrics) return '<p class="muted">metrics: absent (no decodable current capture)</p>';
  return `<p class="metrics">emptyCells ${formatDynamic(metrics.emptyCells)} · density ${formatDynamic(metrics.density)} · harmony ${formatDynamic(metrics.harmony)} · align ${formatDynamic(metrics.align ?? 'n/a')} · dark ${formatPercent(metrics.darkShare)} · light ${formatPercent(metrics.lightShare)}</p>`;
}

function findingsList(findings) {
  if (!Array.isArray(findings) || findings.length === 0) return '<p class="muted">No findings recorded.</p>';
  const rows = findings.map((finding) => `<li class="finding finding--${escapeHtml(finding?.severity ?? 'info')}"><code>${formatDynamic(finding?.rule)}</code> <span class="sev">${formatDynamic(finding?.severity)}</span> — expected ${formatJson(finding?.expected)} · observed ${formatJson(finding?.observed)}</li>`).join('\n');
  return `<ul class="findings">\n${rows}\n</ul>`;
}

function hashesBlock(item) {
  const hashes = item.hashes ?? {};
  const capture = hashes.captureSha256 ?? null;
  const metrics = hashes.metricsSha256 ?? null;
  const rows = [];
  if (capture) rows.push(`<div class="hash-row">captureSha256 <code class="hash">${escapeHtml(capture)}</code></div>`);
  if (metrics) rows.push(`<div class="hash-row">metricsSha256 <code class="hash">${escapeHtml(metrics)}</code></div>`);
  if (item.metaSource === 'reference') {
    rows.push('<div class="hash-row"><span class="badge badge--muted">reference-only meta — capture-time hash of the current screenshot is unknown; the sha256 above was computed at report time</span></div>');
  }
  const stale = capture && metrics && capture !== metrics;
  if (stale) rows.push('<div class="hash-row"><span class="stale">capture and metrics hashes diverge — the screenshot changed after it was judged; verdicts above describe different bytes. Re-run capture before trusting this card.</span></div>');
  if (!rows.length) return '<p class="muted">No hashes recorded.</p>';
  return `<div class="hashes">${rows.join('\n')}</div>`;
}

function pathsList(paths) {
  const entries = Object.entries(paths ?? {});
  if (!entries.length) return '';
  return `<ul class="paths">${entries.map(([name, value]) => `<li>${escapeHtml(name)} <code class="hash">${escapeHtml(value)}</code></li>`).join('')}</ul>`;
}

function caseCard(item) {
  const thumbs = item.thumbs
    ? `<div class="thumbs">${thumbFigure('reference', item.key, item.thumbs.reference)}${thumbFigure('current', item.key, item.thumbs.current)}${thumbFigure('diff', item.key, item.thumbs.diff)}</div>`
    : '<p class="muted">No screenshots on disk for this case.</p>';
  return `<article class="case verdict--${escapeHtml(item.verdict ?? 'unknown')}" data-case="${escapeHtml(item.key)}">
<header class="case-head"><h3>${escapeHtml(item.label)}</h3><code class="hash">${escapeHtml(item.key)}</code>${chip(item.verdict)}</header>
${thumbs}
${metricsLine(item.metrics)}
${hashesBlock(item)}
<h4>Findings</h4>
${findingsList(item.findings)}
${pathsList(item.paths)}
</article>`;
}

function gateLadder(sections) {
  if (!sections.length) return '<p class="muted">run-summary.json absent — gate ladder unavailable, judging from raw artifacts only.</p>';
  return `<div class="ladder">${sections.map((section) => `<div class="gate gate--${escapeHtml(section.status)}"><b>${escapeHtml(section.name)}</b><span>${escapeHtml(section.detail)}</span></div>`).join('\n')}</div>`;
}

function provenanceStrip(evidence) {
  const rows = [
    evidence.configPath ? `<div class="hash-row">configPath <code class="hash">${escapeHtml(evidence.configPath)}</code></div>` : '',
    evidence.configHash ? `<div class="hash-row">configHash <code class="hash">${escapeHtml(evidence.configHash)}</code></div>` : ''
  ].filter(Boolean).join('\n');
  return `<section><h2>Provenance &amp; verification</h2>
${rows || '<p class="muted">No run-summary.json — provenance unknown; hashes below come from raw artifacts.</p>'}
<p class="muted verify">Verify any artifact with <code>shasum -a 256 &lt;file&gt;</code> and match it against the per-case hashes:
<b>captureSha256</b> is the sha256 recorded by the capture engine — compare it against the on-disk screenshot (the <code>current/&lt;key&gt;.png</code> path listed on each card).
<b>metricsSha256</b> is the sha256 of the exact PNG bytes the deterministic metrics and this report were computed from — when it differs from captureSha256 the image changed after judgment and the evidence is stale.
<b>configHash</b> is the sha256 over the canonicalized config projection — compare it against <code>reports/provenance.json</code> of the same run.</p>
</section>`;
}

function partialBadges(sources) {
  const badges = [];
  if (!sources?.comparisonJson) badges.push('comparison.json absent — verdicts from artifacts only');
  if (!sources?.runSummaryJson) badges.push('run-summary.json absent — quality score, gate ladder and provenance unavailable');
  if (!badges.length) return '';
  return `<div class="badges">${badges.map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join('')}</div>`;
}

const STYLES = `:root{--bg:#08080A;--panel:#0F0F12;--accent:#E63946;--text:#EDEDEF;--muted:#8A8A93;--border:rgba(255,255,255,0.08);--pass:#2ECC71;--warn:#F5A623;--fail:#E63946}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:1120px;margin:0 auto;padding:32px 24px 64px}
h1{font-size:26px;margin:0}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:0 0 12px}
h3{margin:0;font-size:17px}
h4{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:14px 0 6px}
section{margin:28px 0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}
.hash{color:var(--muted);word-break:break-all}
.muted{color:var(--muted)}
.hero{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:1px solid var(--border);padding-bottom:20px;margin-bottom:8px}
.hero .meta{color:var(--muted);margin:8px 0 0}
.chip{display:inline-block;padding:6px 16px;border-radius:999px;font-weight:700;letter-spacing:.08em;font-size:13px;white-space:nowrap}
.chip--pass{color:var(--pass);border:1px solid var(--pass);background:rgba(46,204,113,.12)}
.chip--warn{color:var(--warn);border:1px solid var(--warn);background:rgba(245,166,35,.12)}
.chip--fail{color:var(--fail);border:1px solid var(--fail);background:rgba(230,57,70,.16)}
.chip--unknown{color:var(--muted);border:1px solid var(--border)}
.facts{display:flex;flex-wrap:wrap;gap:6px 22px;color:var(--muted);font-size:13px}
.facts b{color:var(--text);font-weight:600}
.ladder{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.gate{background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--muted);border-radius:8px;padding:10px 12px}
.gate--pass{border-left-color:var(--pass)}
.gate--warn{border-left-color:var(--warn)}
.gate--fail{border-left-color:var(--fail)}
.gate--absent{border-left-color:var(--border);opacity:.55}
.gate b{display:block;font-size:13px}
.gate span{color:var(--muted);font-size:12px}
.badges{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.badge{border:1px solid var(--warn);color:var(--warn);border-radius:6px;padding:3px 10px;font-size:12px}
.badge--muted{border-color:var(--border);color:var(--muted)}
.verify code{background:var(--panel);border:1px solid var(--border);border-radius:4px;padding:1px 5px}
.hash-row{margin:4px 0}
.hash-row .hash{margin-left:8px}
.stale{color:var(--warn);font-weight:600}
.case{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:16px 18px;margin:14px 0}
.case.verdict--fail{border-left:3px solid var(--fail)}
.case.verdict--warn{border-left:3px solid var(--warn)}
.case.verdict--pass{border-left:3px solid var(--pass)}
.case-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.case-head .chip{padding:3px 12px;font-size:11px}
.thumbs{display:flex;gap:12px;flex-wrap:wrap}
.thumbs figure{margin:0;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center}
.thumbs figcaption{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.thumbs img{display:block;border-radius:4px;max-width:240px;height:auto}
.noimg{color:var(--muted);font-size:12px;padding:26px 14px}
.metrics{font-size:13px;color:var(--text)}
.findings{list-style:none;margin:0;padding:0}
.findings li{padding:6px 0;border-top:1px solid var(--border);font-size:13px}
.findings li:first-child{border-top:none}
.findings .sev{font-weight:700;font-size:11px;text-transform:uppercase}
.finding--fail .sev{color:var(--fail)}
.finding--warn .sev{color:var(--warn)}
.finding--info .sev{color:var(--muted)}
.hashes{margin:8px 0}
.paths{list-style:none;margin:6px 0 0;padding:0;color:var(--muted);font-size:12px}
footer{color:var(--muted);border-top:1px solid var(--border);margin-top:36px;padding-top:14px;font-size:12px}`;

/**
 * Render the collected evidence into one self-contained HTML document:
 * inline CSS only, base64 thumbnails, no JS, no external references. Every
 * dynamic interpolation goes through escapeHtml.
 */
export function renderEvidenceHtml(evidence) {
  const summary = evidence?.summary ?? {};
  const sections = Array.isArray(evidence?.sections) ? evidence.sections : [];
  const cases = Array.isArray(evidence?.cases) ? evidence.cases : [];
  const failed = Number(summary.failed ?? 0);
  const warned = Number(summary.warned ?? 0);
  const unknown = cases.filter((item) => !item?.verdict).length;
  const overall = failed > 0 ? 'fail' : (warned > 0 || unknown > 0 || cases.length === 0 ? 'warn' : 'pass');

  const facts = [
    ['run', evidence.runId],
    ['captured', evidence.capturedAt],
    ['platform', evidence.platform],
    ['quality score', summary.qualityScore],
    ['release decision', summary.releaseDecision],
    ['cases', `${summary.passed ?? 0} pass / ${summary.warned ?? 0} warn / ${summary.failed ?? 0} fail of ${summary.total ?? cases.length}`]
  ].map(([name, value]) => `<span>${escapeHtml(name)} <b>${formatDynamic(value)}</b></span>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Visual Evidence — ${formatDynamic(evidence.runId ?? 'local run')}</title>
<style>${STYLES}</style>
</head>
<body>
<div class="wrap">
<header class="hero">
<div><h1>Visual Evidence</h1><p class="meta">${escapeHtml(evidence.outputDir ?? '')}</p></div>
${chip(overall)}
</header>
<div class="facts">${facts}</div>
${partialBadges(evidence.sources)}
${provenanceStrip(evidence)}
<section><h2>Gate ladder</h2>
${gateLadder(sections)}
</section>
<section><h2>Cases (${cases.length})</h2>
${cases.map(caseCard).join('\n') || '<p class="muted">No cases found under this output directory.</p>'}
</section>
<footer>Generated ${formatDynamic(evidence.generatedAt)} by scripts/visual-evidence.mjs. Automated evidence supports human review; it is not a pixel-perfect or production-ready claim.</footer>
</div>
</body>
</html>
`;
}
