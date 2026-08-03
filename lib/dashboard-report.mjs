import { escapeHtml } from './report.mjs';

function formatNumber(value) { return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : '—'; }
function statusClass(status) { return ['pass', 'warning', 'fail', 'skipped', 'not-applicable'].includes(status) ? status : 'skipped'; }

function summarizeSection(name, section) {
  if (!section) return 'skipped';
  if (name === 'aesthetics') {
    const bits = [
      `score ${formatNumber(section.score)}`,
      `confidence ${formatNumber(section.evidenceConfidence)}%`,
      `${section.blockers ?? 0} blocker(s)`,
      section.reviewPassed === true ? 'review pass' : section.reviewPassed === false ? 'review fail' : 'review n/a'
    ];
    if (section.missingPaths?.length) bits.push(`missing ${section.missingPaths.join(', ')}`);
    return bits.join(' · ');
  }
  if (name === 'manualReview') {
    return [
      section.status ?? 'unknown',
      section.score !== undefined ? `score ${formatNumber(section.score)}` : null,
      section.blockers !== undefined ? `${section.blockers} blocker(s)` : null
    ].filter(Boolean).join(' · ');
  }
  return JSON.stringify(section);
}

export function renderRunDashboard({ summary, remediation }) {
  const gateCards = Object.entries(summary.quality.gates).map(([name, gate]) => `<article class="gate gate--${statusClass(gate.status)}"><header><h3>${escapeHtml(name)}</h3><span>${escapeHtml(gate.status)}</span></header><strong>${formatNumber(gate.score)}</strong><small>weight ${formatNumber(gate.weight)} · evidence ${escapeHtml(gate.evidenceStatus)}</small></article>`).join('');
  const remediationRows = (remediation.items ?? []).slice(0, 50).map((entry) => `<tr><td>${escapeHtml(entry.id)}</td><td><span class="pill pill--${escapeHtml(entry.severity)}">${escapeHtml(entry.severity)}</span></td><td>${escapeHtml(entry.category)}</td><td>${escapeHtml(entry.case ?? 'global')}</td><td>${escapeHtml(entry.finding)}</td><td>${escapeHtml(entry.action)}</td></tr>`).join('');
  const sections = Object.entries(summary.sections).map(([name, section]) => `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(section?.status ?? (section ? 'recorded' : 'skipped'))}</td><td><code>${escapeHtml(summarizeSection(name, section))}</code></td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Frontend Vision Loop Quality Report</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color-scheme:dark;background:#0b1020;color:#eef2ff}*{box-sizing:border-box}body{margin:0}.shell{max-width:1500px;margin:auto;padding:28px}.hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end;padding:24px;border:1px solid #27304b;border-radius:18px;background:#11182b}.score{font-size:clamp(44px,8vw,88px);line-height:.9;font-weight:800}.meta{color:#aeb9d6}.gates{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:20px 0}.gate{padding:16px;border:1px solid #27304b;border-radius:14px;background:#11182b}.gate header{display:flex;justify-content:space-between;gap:12px}.gate h3{margin:0;text-transform:capitalize}.gate strong{display:block;font-size:30px;margin:18px 0 4px}.gate small{color:#aeb9d6}.gate--pass{border-color:#2f9e73}.gate--warning{border-color:#d99b2b}.gate--fail{border-color:#e45b68}.gate--skipped,.gate--not-applicable{border-color:#68708a}.panel{margin-top:20px;padding:20px;border:1px solid #27304b;border-radius:18px;background:#11182b}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #27304b}code{white-space:pre-wrap;word-break:break-word;color:#c7d2fe}.pill{padding:3px 8px;border-radius:999px;border:1px solid #68708a}.pill--blocker{border-color:#e45b68}.pill--major{border-color:#d99b2b}.pill--minor{border-color:#65a7ff}@media(max-width:700px){.shell{padding:14px}.hero{grid-template-columns:1fr}}</style></head><body><main class="shell">
<section class="hero"><div><p class="meta">Run ${escapeHtml(summary.provenance.runId)}</p><h1>Frontend Vision Loop Quality Report</h1><p>Automated evidence gate: <strong>${summary.quality.passed ? 'PASS' : 'FAIL'}</strong> · Human semantic visual approval remains required.</p></div><div><div class="score">${formatNumber(summary.quality.score)}</div><p class="meta">grade ${escapeHtml(summary.quality.grade)} · confidence ${formatNumber(summary.quality.confidence)}%</p></div></section>
<section class="gates">${gateCards}</section>
<section class="panel"><h2>Prioritized remediation</h2><p>${remediation.total} finding(s): ${remediation.blockers} blocker(s), ${remediation.majors} major(s).</p><div class="table-wrap"><table><thead><tr><th>ID</th><th>Severity</th><th>Category</th><th>Case</th><th>Finding</th><th>Action</th></tr></thead><tbody>${remediationRows || '<tr><td colspan="6">No automated remediation items.</td></tr>'}</tbody></table></div></section>
<section class="panel"><h2>Evidence sections</h2><div class="table-wrap"><table><thead><tr><th>Section</th><th>Status</th><th>Summary</th></tr></thead><tbody>${sections}</tbody></table></div></section>
</main></body></html>`;
}
