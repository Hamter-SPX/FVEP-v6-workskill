import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExists, writeJsonAtomic } from './io.mjs';

export const AXIS_LABELS = Object.freeze({
  seriousPlayful: 'serious ↔ playful',
  warmClinical: 'warm ↔ clinical',
  understatedExpressive: 'understated ↔ expressive',
  denseSpacious: 'dense ↔ spacious',
  establishedNovel: 'established ↔ novel'
});

const LABEL_TO_KEY = Object.fromEntries(Object.entries(AXIS_LABELS).map(([key, label]) => [label.toLowerCase(), key]));

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sectionBody(markdown, heading) {
  const pattern = new RegExp(`## ${escapeRegExp(heading)}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  return markdown.match(pattern)?.[1]?.trim() ?? '';
}

function bulletValues(body) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim())
    .filter(Boolean);
}

function fieldValue(lines, label) {
  const row = lines.find((line) => line.toLowerCase().startsWith(`- ${label.toLowerCase()}`));
  if (!row) return '';
  return row.slice(row.indexOf(':') + 1).trim();
}

/**
 * Parses templates/visual-direction-spec.md shaped Markdown into structured fields.
 */
export function parseDirectionSpec(markdown) {
  const text = String(markdown ?? '');
  const selectionLines = sectionBody(text, 'Selection').split('\n').map((line) => line.trim()).filter(Boolean);
  const selectedRaw = fieldValue(selectionLines, 'Selected option');
  const selectedMatch = selectedRaw.match(/\b([123])\b/);
  const thesisBody = sectionBody(text, 'Direction Thesis');
  const thesis = (thesisBody.match(/^>\s*(.+)$/m)?.[1]
    ?? thesisBody.split('\n').map((line) => line.trim()).find((line) => line && !line.toLowerCase().startsWith('one sentence'))
    ?? '').trim();

  const personality = {};
  const tableBody = sectionBody(text, 'Personality Positions (draft)');
  for (const line of tableBody.split('\n')) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map((cell) => cell.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    if (/^axis$/i.test(cells[0]) || /^:?-+:?$/.test(cells[0])) continue;
    const key = LABEL_TO_KEY[cells[0].toLowerCase()];
    if (!key) continue;
    const value = Number(cells[1]);
    personality[key] = {
      value: Number.isFinite(value) ? value : null,
      reason: cells[2] ?? ''
    };
  }

  const likes = bulletValues(sectionBody(text, 'What We Like (from the chosen option)'));
  const keep = bulletValues(sectionBody(text, 'Keep from the Reference'));
  const change = bulletValues(sectionBody(text, 'Change from the Reference'));
  const nonGoals = bulletValues(sectionBody(text, 'Explicit Non-Goals'));
  const linkedLines = sectionBody(text, 'Linked Artifacts').split('\n').map((line) => line.trim()).filter(Boolean);
  const statusBody = sectionBody(text, 'Status');
  const confirmLine = statusBody.match(/^- \[[ xX]\]\s*User confirmed:\s*([^\n]+)/im)?.[0] ?? '';
  const confirmChecked = /^- \[x\]/i.test(confirmLine);
  const confirmValue = confirmLine.replace(/^- \[[ xX]\]\s*User confirmed:\s*/i, '').trim();
  const confirmedStart = confirmChecked
    && /^เริ่มเขียน(?=\s|$|\()/i.test(confirmValue)
    && !/\|\s*ปรับต่อ/i.test(confirmValue);

  const noveltyLine = change.find((line) => /novelty budget/i.test(line)) ?? '';
  const noveltyBudget = noveltyLine
    ? [{ position: 'Novelty budget', decision: noveltyLine.replace(/^[^:]+:\s*/, ''), reason: 'From visual-direction-spec.md' }]
    : [];

  return {
    selectedOption: selectedMatch ? Number(selectedMatch[1]) : null,
    selectedAt: fieldValue(selectionLines, 'Selected at (ISO timestamp)'),
    chosenImage: fieldValue(selectionLines, 'Chosen image / artifact'),
    referenceScreenshots: fieldValue(selectionLines, 'Reference screenshot(s)'),
    thesis,
    personality,
    likes,
    keep,
    change,
    nonGoals,
    noveltyBudget,
    confirmedStart,
    profilePath: fieldValue(linkedLines, 'Aesthetic profile path (to write next)'),
    contractPath: fieldValue(linkedLines, 'Design contract path')
  };
}

function axisScaffold(entry, fallbackReason) {
  const value = Number.isFinite(Number(entry?.value)) ? Number(entry.value) : null;
  return {
    value,
    reason: String(entry?.reason || fallbackReason || 'Fill from the direction spec.'),
    consequences: Array.isArray(entry?.consequences) && entry.consequences.length
      ? entry.consequences
      : ['Align implementation with the chosen direction thesis']
  };
}

/**
 * Builds or updates an aesthetic profile object from a parsed direction spec.
 */
export function profileFromDirectionSpec(parsed, existing = {}) {
  const product = existing.product || 'Product surface';
  const personality = {};
  for (const key of Object.keys(AXIS_LABELS)) {
    personality[key] = axisScaffold(
      parsed.personality?.[key] ?? existing.personality?.[key],
      parsed.thesis || 'Taken from the confirmed visual direction spec.'
    );
  }

  const adopted = [
    ...parsed.likes.map((line) => line.replace(/^[^:]+:\s*/, '').trim()).filter(Boolean),
    ...parsed.keep.map((line) => line.replace(/^[^:]+:\s*/, '').trim()).filter(Boolean)
  ].filter(Boolean);

  const rejected = parsed.nonGoals.map((line) => line.replace(/^-\s*/, '').trim()).filter(Boolean);
  const noveltyBudget = parsed.noveltyBudget.length
    ? parsed.noveltyBudget
    : (existing.noveltyBudget?.length
      ? existing.noveltyBudget
      : [{ position: 'Declare after confirm', decision: parsed.change[0] ?? 'Fill novelty budget from the direction spec', reason: parsed.thesis || '' }]);

  return {
    schemaVersion: 1,
    product,
    audience: existing.audience ?? '',
    rationale: parsed.thesis || existing.rationale || 'Synced from visual-direction-spec.md',
    personality,
    styleDirection: {
      archetype: existing.styleDirection?.archetype ?? 'none',
      adopted: adopted.length ? [...new Set(adopted)] : (existing.styleDirection?.adopted ?? []),
      rejected: rejected.length ? [...new Set(rejected)] : (existing.styleDirection?.rejected ?? [])
    },
    noveltyBudget,
    systems: existing.systems ?? {
      color: { neutralTemperature: 'cool', accentCount: 1, harmony: 'complementary', themes: ['light'] },
      typography: { scaleRatio: 1.25, roleCount: 5, families: [], maxMeasureCharacters: 72 },
      spacing: { baseUnitPx: 8, scale: [4, 8, 12, 16, 24, 32, 48], density: 'balanced' },
      shape: { radiiPx: [4, 8, 12], elevationLevels: 2 },
      motion: { durationsMs: [120, 200, 320], easings: ['ease-out'], overshoot: 'none', reducedMotionSupported: true }
    },
    voice: existing.voice ?? {
      person: { value: 3, reason: 'Fill from direction tone' },
      register: { value: 3, reason: 'Fill from direction tone' },
      density: { value: 3, reason: 'Fill from direction density' },
      certainty: { value: 3, reason: 'Fill from product stakes' },
      humour: { value: 1, reason: 'Default restrained until spec says otherwise' }
    },
    nonGoals: rejected.length ? rejected : (existing.nonGoals ?? []),
    references: [...new Set([...(existing.references ?? []), 'design/visual-direction-spec.md'])]
  };
}

/**
 * Compares a direction spec to an aesthetic profile and reports drift.
 */
export function compareDirectionSpecToProfile(parsed, profile) {
  const findings = [];
  if (!parsed.thesis) findings.push({ code: 'DIRECTION_THESIS_MISSING', severity: 'blocker', message: 'Direction spec has no thesis blockquote.' });
  if (!parsed.selectedOption) findings.push({ code: 'DIRECTION_OPTION_MISSING', severity: 'high', message: 'Direction spec does not record selected option 1/2/3.' });

  for (const [key, label] of Object.entries(AXIS_LABELS)) {
    const specValue = parsed.personality?.[key]?.value;
    const profileValue = profile?.personality?.[key]?.value;
    if (!Number.isFinite(specValue)) {
      findings.push({ code: 'DIRECTION_AXIS_UNSET', severity: 'high', message: `Spec personality "${label}" has no numeric value.`, path: key });
      continue;
    }
    if (!Number.isFinite(profileValue)) {
      findings.push({ code: 'PROFILE_AXIS_UNSET', severity: 'blocker', message: `Profile personality "${key}" is missing while the spec defines it.`, path: key });
      continue;
    }
    if (Number(specValue) !== Number(profileValue)) {
      findings.push({
        code: 'DIRECTION_PROFILE_AXIS_DRIFT',
        severity: 'blocker',
        message: `Axis ${key} differs: spec=${specValue}, profile=${profileValue}.`,
        path: key
      });
    }
  }

  if (parsed.thesis && profile?.rationale && parsed.thesis.trim() !== String(profile.rationale).trim()) {
    const thesisInRationale = String(profile.rationale).includes(parsed.thesis.trim());
    if (!thesisInRationale) {
      findings.push({
        code: 'DIRECTION_THESIS_DRIFT',
        severity: 'high',
        message: 'Profile rationale does not include the direction-spec thesis.'
      });
    }
  }

  const blockers = findings.filter((item) => item.severity === 'blocker');
  return {
    ok: blockers.length === 0,
    passed: blockers.length === 0 && findings.every((item) => item.severity !== 'high'),
    findings,
    selectedOption: parsed.selectedOption,
    thesis: parsed.thesis
  };
}

export async function syncDirectionSpecToProfile(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const specPath = path.resolve(baseDir, options.specPath ?? 'design/visual-direction-spec.md');
  const profilePath = path.resolve(baseDir, options.profilePath ?? 'design/aesthetic-profile.json');
  const checkOnly = options.checkOnly === true;

  if (!await fileExists(specPath)) throw new Error(`Direction spec not found: ${specPath}`);
  const markdown = await fs.readFile(specPath, 'utf8');
  const parsed = parseDirectionSpec(markdown);

  const profileExists = await fileExists(profilePath);
  let existing = {};
  if (profileExists) {
    existing = JSON.parse(await fs.readFile(profilePath, 'utf8'));
  }

  if (checkOnly && !profileExists) {
    const comparison = {
      ok: false,
      passed: false,
      findings: [{
        code: 'PROFILE_MISSING',
        severity: 'blocker',
        message: `Aesthetic profile not found for --check: ${profilePath}`
      }],
      selectedOption: parsed.selectedOption,
      thesis: parsed.thesis
    };
    return {
      ok: false,
      passed: false,
      checkOnly: true,
      wroteProfile: false,
      specPath,
      profilePath,
      parsed,
      profile: null,
      comparison
    };
  }

  const nextProfile = profileFromDirectionSpec(parsed, existing);
  const comparison = compareDirectionSpecToProfile(parsed, checkOnly ? existing : nextProfile);

  if (!checkOnly) {
    await writeJsonAtomic(profilePath, nextProfile);
  }

  return {
    ok: comparison.ok,
    passed: comparison.passed,
    checkOnly,
    wroteProfile: !checkOnly,
    specPath,
    profilePath,
    parsed,
    profile: checkOnly ? existing : nextProfile,
    comparison
  };
}
