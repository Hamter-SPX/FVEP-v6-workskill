function cell(value) { return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' '); }

export function renderFullstackMarkdown(report = {}) {
  const quality = report.quality ?? {};
  const gates = quality.gates ?? {};
  const findings = report.findings ?? [];
  const gaps = report.verificationGaps ?? [];
  const lines = [
    `# Full-Stack Evidence Report — ${report.project?.name ?? 'Project'}`,
    '',
    `Generated: ${report.generatedAt ?? 'unknown'}`,
    '',
    `**Release decision: ${quality.passed ? 'APPROVED' : 'BLOCKED'}**`,
    '',
    `- Quality score: ${quality.score ?? 0}/100 (${quality.grade ?? 'n/a'})`,
    `- Evidence confidence: ${quality.confidence ?? 0}%`,
    `- Hard failures: ${(quality.hardFailures ?? []).join(', ') || 'none'}`,
    '',
    '## Quality gates',
    '',
    '| Gate | Status | Score | Evidence confidence |',
    '|---|---:|---:|---:|'
  ];
  for (const [name, gate] of Object.entries(gates)) lines.push(`| ${cell(name)} | ${cell(gate.status)} | ${cell(gate.score ?? 'n/a')} | ${cell(gate.evidenceConfidence ?? 'n/a')}% |`);
  lines.push('', '## Findings', '');
  if (!findings.length) lines.push('No findings recorded.');
  else for (const finding of findings) { const location = finding.path ? ` \`${cell(finding.path)}\`` : ''; lines.push(`- **${cell(finding.severity)} — ${cell(finding.code)}:** ${cell(finding.message)}${location}`); }
  lines.push('', '## Verification gaps', '');
  if (!gaps.length) lines.push('No declared verification gaps.');
  else for (const gap of gaps) lines.push(`- ${cell(gap)}`);
  lines.push('');
  return lines.join('\n');
}
