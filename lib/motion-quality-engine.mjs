import { finalizeProcessAudit, processFinding } from './process-audit-utils.mjs';

export const MOTION_PURPOSES = Object.freeze(['continuity', 'feedback', 'status', 'attention', 'expression']);

export const DURATION_FAMILIES = Object.freeze({
  instant: { min: 40, max: 110 },
  short: { min: 110, max: 220 },
  medium: { min: 220, max: 380 },
  long: { min: 380, max: 520 }
});

const COMPOSITOR_PROPERTIES = new Set(['transform', 'opacity', 'filter', 'translate', 'rotate', 'scale']);
const LAYOUT_PROPERTIES = new Set(['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'margin-top', 'margin-left', 'padding', 'inset']);
const POSITIONAL_PROPERTIES = new Set(['transform', 'translate', 'top', 'left', 'right', 'bottom', 'width', 'height', 'inset']);

function round(value, digits = 2) { return Number(Number(value).toFixed(digits)); }

/** Maps a duration onto the families defined in references/motion-quality-standards.md. */
export function classifyDuration(durationMs) {
  const value = Number(durationMs);
  if (!Number.isFinite(value) || value < 0) return null;
  for (const [name, range] of Object.entries(DURATION_FAMILIES)) {
    if (value >= range.min && value <= range.max) return name;
  }
  return value < DURATION_FAMILIES.instant.min ? 'below-instant' : 'above-long';
}

function isLinear(easing) {
  const value = String(easing ?? '').trim().toLowerCase();
  if (value === 'linear') return true;
  const bezier = value.match(/^cubic-bezier\(([^)]+)\)$/);
  if (!bezier) return false;
  const parts = bezier[1].split(',').map((part) => Number.parseFloat(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return false;
  return Math.abs(parts[0] - parts[1]) < 0.02 && Math.abs(parts[2] - parts[3]) < 0.02;
}

export function analyzeMotionSystem(input = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const maxDurationMs = Number(policy.maxDurationMs ?? DURATION_FAMILIES.long.max);
  const maxEasingVocabulary = Number(policy.maxEasingVocabulary ?? 4);
  const maxStaggerTotalMs = Number(policy.maxStaggerTotalMs ?? 500);
  const maxStaggerStepMs = Number(policy.maxStaggerStepMs ?? 80);

  const animations = Array.isArray(input.animations) ? input.animations : [];
  const results = [];
  const easings = new Set();

  for (const animation of animations) {
    const name = String(animation?.name ?? 'unnamed');
    const durationMs = Number(animation?.durationMs);
    const easing = animation?.easing === undefined ? null : String(animation.easing);
    const properties = (animation?.properties ?? []).map((value) => String(value).toLowerCase());
    const purpose = animation?.purpose ? String(animation.purpose) : null;
    evidenceCount += 1;
    if (easing) easings.add(easing.trim().toLowerCase());

    const family = classifyDuration(durationMs);
    results.push({ name, durationMs: Number.isFinite(durationMs) ? round(durationMs) : null, family, easing, purpose, properties });

    if (!purpose) {
      findings.push(processFinding('MOTION_PURPOSE_UNDECLARED', 'medium', `Animation ${name} declares no purpose. Every animation must serve continuity, feedback, status, attention, or a budgeted expressive moment.`, { path: name }));
    } else if (!MOTION_PURPOSES.includes(purpose)) {
      findings.push(processFinding('MOTION_PURPOSE_UNRECOGNIZED', 'low', `Animation ${name} declares purpose "${purpose}", which is not one of ${MOTION_PURPOSES.join(', ')}.`, { path: name }));
    }

    if (Number.isFinite(durationMs)) {
      // Continuous and looping motion such as a spinner or progress fill is not a transition,
      // so the perceptual transition ceiling does not apply to it.
      if (durationMs > maxDurationMs && animation?.continuous !== true && animation?.loops !== true) {
        findings.push(processFinding('MOTION_DURATION_TOO_LONG', 'medium', `Animation ${name} runs ${round(durationMs)}ms, beyond the ${maxDurationMs}ms point where a transition begins to feel like waiting.`, { path: name }));
      }
      if (family === 'below-instant' && purpose === 'continuity') {
        findings.push(processFinding('MOTION_DURATION_TOO_SHORT', 'low', `Animation ${name} runs ${round(durationMs)}ms, short enough to read as a jump rather than a transition carrying continuity.`, { path: name }));
      }
    } else {
      findings.push(processFinding('MOTION_DURATION_MISSING', 'low', `Animation ${name} has no declared duration.`, { path: name }));
    }

    const positional = properties.some((property) => POSITIONAL_PROPERTIES.has(property));
    if (easing && isLinear(easing) && positional && animation?.continuous !== true) {
      findings.push(processFinding('MOTION_LINEAR_POSITIONAL', 'medium', `Animation ${name} moves position on a linear curve, which reads as mechanical. Linear is correct only for continuous non-physical motion.`, { path: name }));
    }

    const layoutAnimated = properties.filter((property) => LAYOUT_PROPERTIES.has(property));
    if (layoutAnimated.length) {
      findings.push(processFinding('MOTION_LAYOUT_PROPERTY_ANIMATED', 'medium', `Animation ${name} animates layout properties (${layoutAnimated.join(', ')}), forcing reflow and producing frame drops.`, { path: name, remediation: 'Animate transform and opacity instead.' }));
    } else if (properties.length && properties.every((property) => COMPOSITOR_PROPERTIES.has(property))) {
      evidenceCount += 1;
    }

    if (animation?.interruptible === false) {
      findings.push(processFinding('MOTION_NOT_INTERRUPTIBLE', animation?.frequent === true ? 'blocker' : 'high', `Animation ${name} cannot be interrupted. A user who acts twice should not wait for the first animation to complete.`, { path: name }));
    }
    if (animation?.blocksInput === true) {
      findings.push(processFinding('MOTION_BLOCKS_INPUT', 'blocker', `Animation ${name} blocks input while running.`, { path: name }));
    }
    if (animation?.reversesFromCurrentState === false) {
      findings.push(processFinding('MOTION_REVERSAL_SNAPS', 'medium', `Animation ${name} reverses from its endpoint rather than from its current position and velocity, producing a visible snap.`, { path: name }));
    }

    const stagger = animation?.stagger;
    if (stagger && typeof stagger === 'object') {
      const stepMs = Number(stagger.stepMs);
      const count = Number(stagger.count);
      if (Number.isFinite(stepMs) && stepMs > maxStaggerStepMs) {
        findings.push(processFinding('MOTION_STAGGER_STEP_TOO_LONG', 'low', `Stagger step in ${name} is ${round(stepMs)}ms, beyond the interval where a sequence still reads as one arrival.`, { path: name }));
      }
      if (Number.isFinite(stepMs) && Number.isFinite(count) && stepMs * count > maxStaggerTotalMs) {
        findings.push(processFinding('MOTION_STAGGER_UNBOUNDED', 'medium', `Stagger in ${name} totals ${round(stepMs * count)}ms across ${count} items, leaving the last item waiting far too long.`, { path: name, remediation: 'Cap the number of staggered items and let the remainder arrive together.' }));
      }
    }
  }

  const entrances = results.filter((item) => item.purpose === 'continuity' && /enter|open|show|in$/i.test(item.name));
  const exits = results.filter((item) => item.purpose === 'continuity' && /exit|close|hide|out$/i.test(item.name));
  if (entrances.length && exits.length) {
    const meanEntrance = entrances.reduce((sum, item) => sum + (item.durationMs ?? 0), 0) / entrances.length;
    const meanExit = exits.reduce((sum, item) => sum + (item.durationMs ?? 0), 0) / exits.length;
    if (meanEntrance > 0 && meanExit > 0 && Math.abs(meanEntrance - meanExit) < meanEntrance * 0.1) {
      findings.push(processFinding('MOTION_ENTRANCE_EXIT_UNDIFFERENTIATED', 'low', 'Entrances and exits share the same duration. Exits should generally be faster, because the decision has already been made.'));
    }
  }

  if (easings.size > maxEasingVocabulary) {
    findings.push(processFinding('MOTION_EASING_VOCABULARY_EXCESSIVE', 'low', `${easings.size} easing curves are in use but policy allows ${maxEasingVocabulary}.`, { detail: [...easings] }));
  }
  if (animations.length >= 3 && easings.size === 1) {
    findings.push(processFinding('MOTION_EASING_UNIFORM', 'medium', 'A single easing curve is applied across all motion. Curves must match the direction and character of each transition.', { detail: [...easings] }));
  }

  const reduced = input.reducedMotion && typeof input.reducedMotion === 'object' ? input.reducedMotion : null;
  if (!reduced) {
    findings.push(processFinding('MOTION_REDUCED_VARIANT_MISSING', 'blocker', 'No reduced-motion behaviour is declared. A reduced-motion preference is a requirement, not an enhancement.'));
  } else {
    evidenceCount += 1;
    if (reduced.implemented === false) {
      findings.push(processFinding('MOTION_REDUCED_NOT_IMPLEMENTED', 'blocker', 'Reduced motion is declared but not implemented.'));
    }
    if (reduced.removesAllTransitions === true) {
      findings.push(processFinding('MOTION_REDUCED_REMOVES_FEEDBACK', 'medium', 'The reduced-motion variant removes all transitions, which can make the interface feel broken. Keep opacity transitions and instantaneous state changes.'));
    }
    if (reduced.preservesMeaning === false) {
      findings.push(processFinding('MOTION_REDUCED_LOSES_MEANING', 'high', 'The reduced-motion variant loses meaning that the motion carried. Provide a different signal for it.'));
    }
    if (reduced.rendered === false) {
      findings.push(processFinding('MOTION_REDUCED_NOT_RENDERED', 'medium', 'The reduced-motion path was never rendered or reviewed, so it is a verification gap.'));
    }
  }

  if (input.hidesRequiredState === true) {
    findings.push(processFinding('MOTION_HIDES_REQUIRED_STATE', 'blocker', 'Motion conceals a state the user must perceive.'));
  }

  const report = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount > 0 ? 100 : 0 });
  return { ...report, animations: results, easings: [...easings], reducedMotionDeclared: Boolean(reduced) };
}
