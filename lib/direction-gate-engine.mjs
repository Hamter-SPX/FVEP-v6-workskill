import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists } from './io.mjs';
import { processFinding, finalizeProcessAudit } from './process-audit-utils.mjs';
import { parseDirectionSpec, syncDirectionSpecToProfile } from './direction-spec-sync-engine.mjs';
import { parseIterationHistory } from './direction-iterate-engine.mjs';

function confirmReply(statusBody) {
  const line = String(statusBody ?? '').match(/^- \[[ xX]\]\s*User confirmed:\s*([^\n]+)/im)?.[0];
  if (!line) return null;
  const checked = /^- \[x\]/i.test(line);
  const value = line.replace(/^- \[[ xX]\]\s*User confirmed:\s*/i, '').trim();
  const last = value.match(/\(last:\s*(เริ่มเขียน|ปรับต่อ|เลือกใหม่)\)/i)?.[1] ?? null;
  if (checked) {
    if (/^เริ่มเขียน(?=\s|$|\()/i.test(value) && !/\|\s*ปรับต่อ/i.test(value)) return 'เริ่มเขียน';
    if (/^ปรับต่อ(?=\s|$|\()/i.test(value) && !/\|\s*เริ่มเขียน/i.test(value)) return 'ปรับต่อ';
    if (/^เลือกใหม่(?=\s|$|\()/i.test(value) && !/\|\s*เริ่มเขียน/i.test(value)) return 'เลือกใหม่';
    return null;
  }
  return last;
}

/**
 * Lightweight PR/CI gate: direction spec exists and (optionally) confirm = เริ่มเขียน.
 * No browser required.
 */
export async function evaluateDirectionGate(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const specPath = path.resolve(baseDir, options.specPath ?? 'design/visual-direction-spec.md');
  const profilePath = path.resolve(baseDir, options.profilePath ?? 'design/aesthetic-profile.json');
  const required = options.required !== false;
  const requireConfirm = options.requireConfirm !== false;
  const checkSync = options.checkSync === true;
  const findings = [];

  const exists = await fileExists(specPath);
  if (!exists) {
    findings.push(processFinding(
      'DIRECTION_SPEC_MISSING',
      required ? 'blocker' : 'info',
      `Direction spec not found at ${specPath}.`,
      { path: specPath, remediation: 'Run npm run direction:init or write design/visual-direction-spec.md after option choice.' }
    ));
    const audit = finalizeProcessAudit(findings, {
      schemaVersion: 5,
      evidenceCount: 0,
      evidenceConfidence: required ? 0 : 100,
      blockedStatus: true
    });
    return {
      ...audit,
      passed: !required && audit.ok,
      required,
      requireConfirm,
      checkSync,
      applicable: required,
      specPath,
      profilePath,
      parsed: null,
      iterations: [],
      sync: null
    };
  }

  const markdown = await fs.readFile(specPath, 'utf8');
  const parsed = parseDirectionSpec(markdown);
  const iterations = parseIterationHistory(markdown);
  const statusBody = markdown.match(/## Status\n([\s\S]*?)(?=\n## |$)/i)?.[1] ?? '';
  const reply = confirmReply(statusBody);

  findings.push(processFinding(
    'DIRECTION_SPEC_PRESENT',
    'info',
    `Direction spec found (${path.relative(baseDir, specPath) || specPath}).`,
    { path: specPath }
  ));

  if (!parsed.selectedOption && !String(parsed.chosenImage || '').trim()) {
    findings.push(processFinding(
      'DIRECTION_SELECTION_INCOMPLETE',
      'high',
      'Direction spec does not record a selected option or chosen image.',
      { path: 'Selection', remediation: 'Record Selected option and Chosen image / artifact after the user picks 1/2/3.' }
    ));
  }

  if (!parsed.thesis) {
    findings.push(processFinding(
      'DIRECTION_THESIS_MISSING',
      'high',
      'Direction spec has no direction thesis.',
      { path: 'Direction Thesis' }
    ));
  }

  if (requireConfirm) {
    if (reply === 'เริ่มเขียน') {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_START',
        'info',
        'User confirmed เริ่มเขียน on the direction spec.',
        { path: 'Status' }
      ));
    } else if (reply === 'ปรับต่อ') {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_REFINE',
        'blocker',
        'Direction spec is still in ปรับต่อ — do not merge UI until the user confirms เริ่มเขียน.',
        { path: 'Status', remediation: 'Revise the spec (npm run direction:iterate), then wait for เริ่มเขียน.' }
      ));
    } else if (reply === 'เลือกใหม่') {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_RESELECT',
        'blocker',
        'Direction spec asks for เลือกใหม่ — exploration is not finished.',
        { path: 'Status' }
      ));
    } else {
      findings.push(processFinding(
        'DIRECTION_CONFIRM_MISSING',
        'blocker',
        'Direction spec is not confirmed with เริ่มเขียน.',
        {
          path: 'Status',
          remediation: 'Check the Status box for User confirmed: เริ่มเขียน after the confirm gate.'
        }
      ));
    }
  }

  if (iterations.length) {
    findings.push(processFinding(
      'DIRECTION_ITERATIONS_RECORDED',
      'info',
      `${iterations.length} refinement round(s) recorded in Iteration History.`,
      { path: 'Iteration History', detail: iterations.map((item) => item.round) }
    ));
  }

  let sync = null;
  if (checkSync) {
    sync = await syncDirectionSpecToProfile({
      baseDir,
      specPath,
      profilePath,
      checkOnly: true
    });
    for (const item of sync.comparison.findings) {
      findings.push(processFinding(
        item.code,
        item.severity,
        item.message,
        { path: item.path }
      ));
    }
  }

  const audit = finalizeProcessAudit(findings, {
    schemaVersion: 5,
    evidenceCount: 1 + iterations.length,
    evidenceConfidence: 100
  });

  return {
    ...audit,
    passed: audit.ok && findings.every((item) => item.severity !== 'high'),
    required,
    requireConfirm,
    checkSync,
    applicable: true,
    specPath,
    profilePath,
    parsed: {
      selectedOption: parsed.selectedOption,
      thesis: parsed.thesis,
      confirmedStart: parsed.confirmedStart,
      confirmReply: reply,
      chosenImage: parsed.chosenImage
    },
    iterations,
    sync
  };
}
