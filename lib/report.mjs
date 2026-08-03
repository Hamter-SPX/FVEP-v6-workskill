export function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function percent(value) { return Number.isFinite(value) ? `${(value * 100).toFixed(3)}%` : '—'; }
function score(value) { return Number.isFinite(value) ? `${Number(value).toFixed(2)}` : '—'; }

export function summarizeComparisons(comparisons = []) {
  const summary = { total: comparisons.length, acceptedByNumericGate: 0, acceptedByPerceptualGate: 0, blockers: 0, majors: 0, minors: 0, accepted: 0, unverified: 0, averagePerceptualSimilarity: null, averageVisualScore: null };
  const similarities = []; const scores = [];
  for (const item of comparisons) {
    if (item.acceptedByNumericGate) summary.acceptedByNumericGate += 1;
    if (item.acceptedByPerceptualGate) summary.acceptedByPerceptualGate += 1;
    if (item.severity === 'blocker') summary.blockers += 1;
    else if (item.severity === 'major') summary.majors += 1;
    else if (item.severity === 'minor') summary.minors += 1;
    else if (item.severity === 'accepted') summary.accepted += 1;
    else if (item.severity === 'unverified') summary.unverified += 1;
    if (Number.isFinite(item.perceptual?.similarity)) similarities.push(item.perceptual.similarity);
    if (Number.isFinite(item.visualScore)) scores.push(item.visualScore);
  }
  if (similarities.length) summary.averagePerceptualSimilarity = similarities.reduce((sum, value) => sum + value, 0) / similarities.length;
  if (scores.length) summary.averageVisualScore = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  return summary;
}

function figure(label, source, key) {
  if (!source) return `<figure><figcaption>${escapeHtml(label)}</figcaption><div class="missing">Missing</div></figure>`;
  return `<figure><figcaption>${escapeHtml(label)}</figcaption><a href="${escapeHtml(source)}"><img loading="lazy" src="${escapeHtml(source)}" alt="${escapeHtml(`${label} for ${key}`)}"></a></figure>`;
}

function regionTable(regions = []) {
  if (!regions.length) return '';
  const rows = regions.map((region) => `<tr><td>${escapeHtml(region.name)}</td><td>${escapeHtml(region.severity)}</td><td>${percent(region.mismatchRatio)}</td><td>${percent(region.perceptual?.similarity)}</td><td>${escapeHtml(region.geometry?.reason ?? region.reason ?? '—')}</td></tr>`).join('');
  return `<details><summary>Region evidence (${regions.length})</summary><div class="table-wrap"><table><thead><tr><th>Region</th><th>Severity</th><th>Pixel mismatch</th><th>Perceptual</th><th>Geometry/reason</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
}

export function renderComparisonReport({ title, generatedAt, summary, comparisons }) {
  const rows = comparisons.map((item) => `<article class="case case--${escapeHtml(item.severity)}">
<header><h2>${escapeHtml(item.key)}</h2><span class="badge">${escapeHtml(item.severity)}</span></header>
<p><strong>Pixel mismatch:</strong> ${percent(item.mismatchRatio)} · <strong>Perceptual:</strong> ${percent(item.perceptual?.similarity)} · <strong>Visual score:</strong> ${score(item.visualScore)} · <strong>Numeric gate:</strong> ${item.acceptedByNumericGate ? 'pass' : 'fail/unverified'}</p>
<div class="grid">${figure('Reference', item.referenceRelative, item.key)}${figure('Current', item.currentRelative, item.key)}${figure('Diff', item.diffRelative, item.key)}</div>
${regionTable(item.regions)}
<ul>${(item.notes ?? []).map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></article>`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color-scheme:light dark}*{box-sizing:border-box}body{margin:0;padding:28px;background:#111827;color:#f9fafb}main{max-width:1600px;margin:auto}.summary{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 28px}.summary span,.badge{border:1px solid #4b5563;border-radius:999px;padding:6px 10px}.case{border:1px solid #374151;border-radius:16px;padding:18px;margin:0 0 22px;background:#1f2937}.case header{display:flex;justify-content:space-between;gap:16px;align-items:center}.case--blocker{border-color:#ef4444}.case--major{border-color:#f59e0b}.case--minor{border-color:#60a5fa}.case--accepted{border-color:#34d399}.case--unverified{border-color:#a78bfa}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}figure{margin:0}figcaption{margin:0 0 8px;font-weight:700}img,.missing{width:100%;min-height:180px;object-fit:contain;background:#fff;border-radius:8px}.missing{display:grid;place-items:center;color:#111}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{text-align:left;padding:8px;border-bottom:1px solid #4b5563}details{margin-top:16px}@media(max-width:900px){body{padding:14px}.grid{grid-template-columns:1fr}}</style></head><body><main>
<h1>${escapeHtml(title)}</h1><p>Generated ${escapeHtml(generatedAt)}. Automated metrics are evidence, not semantic visual approval.</p>
<div class="summary"><span>Total ${summary.total}</span><span>Pixel pass ${summary.acceptedByNumericGate}</span><span>Perceptual pass ${summary.acceptedByPerceptualGate}</span><span>Blockers ${summary.blockers}</span><span>Majors ${summary.majors}</span><span>Minors ${summary.minors}</span><span>Unverified ${summary.unverified}</span><span>Avg visual ${score(summary.averageVisualScore)}</span></div>${rows || '<p>No comparisons found.</p>'}</main></body></html>`;
}
