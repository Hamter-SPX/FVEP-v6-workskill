/**
 * Direction option distinctness gate.
 * Fails option sets that are near-duplicates or lack a clear novelty concept —
 * matching the skill's visual-direction rule that theses must differ on ≥2
 * personality axes and trivial variants do not count.
 */

import { PERSONALITY_AXES } from './aesthetic-profile-engine.mjs';
import { finalizeProcessAudit, processFinding, nonEmpty } from './process-audit-utils.mjs';

const VAGUE = /\b(modern|clean|premium|sleek|professional|beautiful|elegant|intuitive|user-friendly|minimal(?:ist)?|simple|nice|better|improved|updated)\b/i;
const TRIVIAL_VARIANT = /\b(same layout|only (?:the )?accent|just (?:the )?colou?r|hue only|tweak(?:ed)?|slightly|minor (?:change|variant)|almost the same)\b/i;

function axisValue(axis) {
  if (axis == null) return null;
  if (typeof axis === 'number') return Number.isInteger(axis) && axis >= 1 && axis <= 5 ? axis : null;
  const value = Number(axis?.value ?? axis);
  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
}

function normalizePersonality(input = {}) {
  const out = {};
  for (const axis of PERSONALITY_AXES) out[axis] = axisValue(input[axis]);
  return out;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0e00-\u0e7f\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function thesisOverlapRatio(left, right) {
  const a = new Set(tokenize(left));
  const b = new Set(tokenize(right));
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

export function personalityAxisDistance(left, right) {
  const a = normalizePersonality(left);
  const b = normalizePersonality(right);
  let compared = 0;
  let differing = 0;
  const deltas = {};
  for (const axis of PERSONALITY_AXES) {
    if (a[axis] == null || b[axis] == null) continue;
    compared += 1;
    const delta = Math.abs(a[axis] - b[axis]);
    deltas[axis] = delta;
    if (delta >= 1) differing += 1;
  }
  return { compared, differing, deltas };
}

export function normalizeDirectionOption(option, index = 0) {
  if (!option || typeof option !== 'object') throw new TypeError(`Option ${index + 1} must be an object.`);
  const number = Number(option.number ?? index + 1);
  const thesis = String(option.thesis ?? option.label ?? '').trim();
  const noveltyConcept = String(
    option.noveltyConcept ?? option.concept ?? option.idea ?? option.novelty ?? ''
  ).trim();
  const stays = String(option.stays ?? option.keep ?? '').trim();
  const changes = String(option.changes ?? option.change ?? '').trim();
  return {
    number: Number.isInteger(number) && number > 0 ? number : index + 1,
    thesis,
    noveltyConcept,
    stays,
    changes,
    personality: normalizePersonality(option.personality ?? option.axes ?? {}),
    notes: String(option.notes ?? '')
  };
}

/**
 * Audit a set of direction options before showing them to the user.
 * Policy:
 * - minOptions (default 2), maxOptions (default 3)
 * - minAxisDifferences (default 2) between every pair with comparable axes
 * - minAxisDeltaSum (default 3) — sum of |deltas| across compared axes
 * - maxThesisOverlap (default 0.55)
 * - requireNoveltyConcept (default true)
 */
export function auditDirectionDistinctness(optionsInput = [], policy = {}) {
  const findings = [];
  const minOptions = Number(policy.minOptions ?? 2);
  const maxOptions = Number(policy.maxOptions ?? 3);
  const minAxisDifferences = Number(policy.minAxisDifferences ?? 2);
  const minAxisDeltaSum = Number(policy.minAxisDeltaSum ?? 3);
  const maxThesisOverlap = Number(policy.maxThesisOverlap ?? 0.55);
  const requireNovelty = policy.requireNoveltyConcept !== false;
  const requireChanges = policy.requireChanges !== false;

  let options = [];
  try {
    options = (optionsInput || []).map((item, index) => normalizeDirectionOption(item, index));
  } catch (error) {
    return {
      ...finalizeProcessAudit([processFinding('DIRECTION_OPTIONS_INVALID', 'blocker', error.message)], {
        schemaVersion: 1,
        evidenceCount: 0,
        evidenceConfidence: 0
      }),
      options: [],
      pairs: []
    };
  }

  if (options.length < minOptions || options.length > maxOptions) {
    findings.push(processFinding(
      'DIRECTION_OPTION_COUNT',
      'blocker',
      `Visual direction requires ${minOptions}–${maxOptions} options; received ${options.length}.`,
      { remediation: 'Draft two or three distinct theses — not one look with tiny variants.' }
    ));
  }

  for (const option of options) {
    if (!nonEmpty(option.thesis) || option.thesis.length < 12) {
      findings.push(processFinding(
        'DIRECTION_THESIS_WEAK',
        'blocker',
        `Option ${option.number} needs a concrete one-line visual thesis.`,
        { option: option.number }
      ));
    } else if (VAGUE.test(option.thesis)) {
      findings.push(processFinding(
        'DIRECTION_THESIS_VAGUE',
        'blocker',
        `Option ${option.number} thesis uses empty style words ("modern/clean/premium/…").`,
        { option: option.number, remediation: 'Name density, surface, type, chrome, and novelty positions instead.' }
      ));
    }

    if (requireNovelty) {
      if (!nonEmpty(option.noveltyConcept) || option.noveltyConcept.length < 8) {
        findings.push(processFinding(
          'DIRECTION_NOVELTY_MISSING',
          'blocker',
          `Option ${option.number} lacks a clear novelty concept (what is newly distinct).`,
          {
            option: option.number,
            remediation: 'State one checkable new idea, e.g. "editorial asymmetric masthead" or "utilitarian densemap chrome".'
          }
        ));
      } else if (VAGUE.test(option.noveltyConcept)) {
        findings.push(processFinding(
          'DIRECTION_NOVELTY_VAGUE',
          'blocker',
          `Option ${option.number} novelty concept is vague.`,
          { option: option.number }
        ));
      }
    }

    if (requireChanges && (!nonEmpty(option.changes) || option.changes.length < 8)) {
      findings.push(processFinding(
        'DIRECTION_CHANGES_MISSING',
        'major',
        `Option ${option.number} does not say what changes vs the reference.`,
        { option: option.number }
      ));
    }

    if (TRIVIAL_VARIANT.test(`${option.thesis} ${option.changes} ${option.notes}`)) {
      findings.push(processFinding(
        'DIRECTION_TRIVIAL_VARIANT',
        'blocker',
        `Option ${option.number} reads as a trivial variant (accent/hue-only or "same layout").`,
        { option: option.number, remediation: 'Replace it with a thesis that shifts structure, density, or craft language.' }
      ));
    }

    const filledAxes = PERSONALITY_AXES.filter((axis) => option.personality[axis] != null).length;
    if (filledAxes < 2) {
      findings.push(processFinding(
        'DIRECTION_AXES_UNDER_SPECIFIED',
        'blocker',
        `Option ${option.number} must declare at least two personality axis positions (1–5).`,
        { option: option.number, axes: PERSONALITY_AXES }
      ));
    }
  }

  const pairs = [];
  for (let i = 0; i < options.length; i += 1) {
    for (let j = i + 1; j < options.length; j += 1) {
      const left = options[i];
      const right = options[j];
      const distance = personalityAxisDistance(left.personality, right.personality);
      const overlap = thesisOverlapRatio(left.thesis, right.thesis);
      const noveltyOverlap = thesisOverlapRatio(left.noveltyConcept, right.noveltyConcept);
      const deltaSum = Object.values(distance.deltas).reduce((sum, value) => sum + value, 0);
      const pair = {
        left: left.number,
        right: right.number,
        axisDifferences: distance.differing,
        axesCompared: distance.compared,
        deltaSum,
        thesisOverlap: Number(overlap.toFixed(3)),
        noveltyOverlap: Number(noveltyOverlap.toFixed(3)),
        deltas: distance.deltas
      };
      pairs.push(pair);

      if (distance.compared >= 2 && distance.differing < minAxisDifferences) {
        findings.push(processFinding(
          'DIRECTION_OPTIONS_TOO_SIMILAR',
          'blocker',
          `Options ${left.number} and ${right.number} differ on only ${distance.differing} personality axis/axes (need ≥${minAxisDifferences}).`,
          {
            pair,
            remediation: 'Push theses farther apart on serious/playful, warm/clinical, understated/expressive, dense/spacious, or established/novel.'
          }
        ));
      }

      if (distance.compared >= 2 && deltaSum < minAxisDeltaSum) {
        findings.push(processFinding(
          'DIRECTION_OPTIONS_WEAK_SEPARATION',
          'blocker',
          `Options ${left.number} and ${right.number} are only weakly separated (axis delta sum ${deltaSum}, need ≥${minAxisDeltaSum}).`,
          { pair, remediation: 'Move at least two axes by 2+ points, or separate three axes by 1+.' }
        ));
      }

      if (overlap >= maxThesisOverlap) {
        findings.push(processFinding(
          'DIRECTION_THESIS_NEAR_DUPLICATE',
          'blocker',
          `Options ${left.number} and ${right.number} theses overlap too much (${pair.thesisOverlap}).`,
          { pair, remediation: 'Rewrite so each thesis names a different visual idea.' }
        ));
      }

      if (left.noveltyConcept && right.noveltyConcept && noveltyOverlap >= 0.7) {
        findings.push(processFinding(
          'DIRECTION_NOVELTY_NEAR_DUPLICATE',
          'blocker',
          `Options ${left.number} and ${right.number} share nearly the same novelty concept.`,
          { pair, remediation: 'Each option needs its own clear new idea — not the same concept rephrased.' }
        ));
      }
    }
  }

  const evidenceCount = options.length + pairs.length;
  const audit = finalizeProcessAudit(findings, {
    schemaVersion: 1,
    evidenceCount,
    evidenceConfidence: evidenceCount ? 1 : 0
  });

  return {
    ...audit,
    ok: audit.ok && !findings.some((item) => item.severity === 'blocker'),
    verdict: findings.some((item) => item.severity === 'blocker')
      ? 'fail-similar-or-weak-novelty'
      : findings.some((item) => item.severity === 'major')
        ? 'pass-with-majors'
        : 'pass-distinct',
    message: findings.some((item) => item.severity === 'blocker')
      ? 'Result does not meet visual-direction standards: options are too similar and/or lack a clear new concept.'
      : 'Option set is distinct enough to present.',
    options,
    pairs,
    policy: {
      minOptions,
      maxOptions,
      minAxisDifferences,
      minAxisDeltaSum,
      maxThesisOverlap,
      requireNoveltyConcept: requireNovelty,
      requireChanges
    }
  };
}

export function formatDirectionDistinctnessReport(result) {
  const lines = [
    '=== DIRECTION DISTINCTNESS ===',
    `verdict=${result.verdict}  ok=${result.ok}`,
    result.message,
    ''
  ];
  for (const option of result.options || []) {
    lines.push(
      `${option.number}. ${option.thesis || '(no thesis)'}`
      + (option.noveltyConcept ? ` | novelty: ${option.noveltyConcept}` : '')
    );
  }
  if (result.pairs?.length) {
    lines.push('', 'pairs:');
    for (const pair of result.pairs) {
      lines.push(
        `  ${pair.left}↔${pair.right}: axisDiff=${pair.axisDifferences}/${pair.axesCompared}`
        + ` deltaSum=${pair.deltaSum} thesisOverlap=${pair.thesisOverlap}`
      );
    }
  }
  const blockers = (result.findings || []).filter((item) => item.severity === 'blocker' || item.severity === 'major');
  if (blockers.length) {
    lines.push('', 'findings:');
    for (const finding of blockers) {
      lines.push(`- [${finding.severity}] ${finding.code}: ${finding.message}`);
      if (finding.remediation) lines.push(`  fix: ${finding.remediation}`);
    }
  }
  return `${lines.join('\n')}\n`;
}
