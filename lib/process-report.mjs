function text(value, fallback = 'n/a') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

function findingLine(item = {}) {
  const detail = item.path ? ` (${item.path})` : '';
  return `- **${text(item.code, 'UNSPECIFIED')}** [${text(item.severity, 'unknown')}] ${text(item.message, '')}${detail}`;
}

export function renderProcessMarkdown(report = {}) {
  const gate = report.processGate ?? {};
  const decision = gate.releaseEligible === true ? 'PASS' : 'BLOCKED';
  const lines = [
    `# Process Audit — ${text(report.project?.name, 'Unnamed project')}`,
    '',
    `Generated: ${text(report.generatedAt)}`,
    '',
    `**Process decision: ${decision}**`,
    '',
    `- Quality score: ${text(gate.qualityScore, 0)}`,
    `- Evidence confidence: ${text(gate.evidenceConfidence, 0)}%`,
    `- Status: ${text(report.status, 'unknown')}`,
    '',
    '## Required process sections',
    '',
    '| Section | Status | Score | Confidence | Hard failures |',
    '|---|---:|---:|---:|---:|'
  ];
  for (const [name, section] of Object.entries(gate.sections ?? {})) {
    lines.push(`| ${name} | ${text(section?.status)} | ${text(section?.score)} | ${text(section?.evidenceConfidence, 0)}% | ${text(section?.hardFailureCount, 0)} |`);
  }
  lines.push('', '## Hard failures', '');
  const failures = Array.isArray(gate.hardFailures) ? gate.hardFailures : [];
  if (failures.length) lines.push(...failures.map(findingLine));
  else lines.push('- None');
  lines.push('', '## Next actions', '');
  const actions = Array.isArray(report.nextActions) ? report.nextActions : [];
  if (actions.length) lines.push(...actions.map((item) => `- ${text(item)}`));
  else lines.push('- None');
  lines.push('', '## Verification gaps', '');
  const gaps = Array.isArray(report.verificationGaps) ? report.verificationGaps : [];
  if (gaps.length) lines.push(...gaps.map((item) => `- ${text(item)}`));
  else lines.push('- None');
  return `${lines.join('\n')}\n`;
}
