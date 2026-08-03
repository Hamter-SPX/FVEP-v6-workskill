import { finalizeProcessAudit, processFinding, containsPlaceholder, nonEmpty } from './process-audit-utils.mjs';

export const PERSONALITY_AXES = Object.freeze(['seriousPlayful', 'warmClinical', 'understatedExpressive', 'denseSpacious', 'establishedNovel']);
export const VOICE_AXES = Object.freeze(['person', 'register', 'density', 'certainty', 'humour']);
export const STYLE_ARCHETYPES = Object.freeze(['swiss', 'editorial', 'neo-minimal', 'utilitarian', 'brutalist', 'soft-rounded', 'glass-layered', 'bento', 'retro-digital', 'none']);

const VAGUE_TERMS = /\b(modern|clean|premium|sleek|professional|beautiful|elegant|intuitive|user-friendly|cutting[- ]edge|world[- ]class)\b/i;

function axisValue(axis) {
  const value = Number(axis?.value ?? axis);
  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
}

export function validateAestheticProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new TypeError('Aesthetic profile must be an object.');
  if (!nonEmpty(profile.product)) throw new TypeError('Aesthetic profile requires a product name.');
  if (!profile.personality || typeof profile.personality !== 'object') throw new TypeError('Aesthetic profile requires a personality section.');
  for (const axis of PERSONALITY_AXES) {
    if (axisValue(profile.personality[axis]) === null) throw new RangeError(`Aesthetic profile personality.${axis} must be an integer from 1 to 5.`);
  }
  if (!Array.isArray(profile.noveltyBudget) || profile.noveltyBudget.length === 0) throw new TypeError('Aesthetic profile requires at least one novelty budget entry.');
  if (!profile.systems || typeof profile.systems !== 'object') throw new TypeError('Aesthetic profile requires a systems section.');
  for (const section of ['color', 'typography', 'spacing']) {
    if (!profile.systems[section] || typeof profile.systems[section] !== 'object') throw new TypeError(`Aesthetic profile requires systems.${section}.`);
  }
  const archetype = profile.styleDirection?.archetype;
  if (archetype !== undefined && !STYLE_ARCHETYPES.includes(String(archetype))) {
    throw new TypeError(`Aesthetic profile styleDirection.archetype must be one of: ${STYLE_ARCHETYPES.join(', ')}.`);
  }
  return profile;
}

/** Normalizes a profile into the flat shape the audit engines consume. */
export function normalizeAestheticProfile(profile) {
  validateAestheticProfile(profile);
  const personality = {};
  for (const axis of PERSONALITY_AXES) personality[axis] = axisValue(profile.personality[axis]);
  const voice = {};
  for (const axis of VOICE_AXES) voice[axis] = axisValue(profile.voice?.[axis]);
  return {
    schemaVersion: 1,
    product: String(profile.product),
    audience: profile.audience ? String(profile.audience) : null,
    personality,
    voice,
    archetype: profile.styleDirection?.archetype ? String(profile.styleDirection.archetype) : null,
    adopted: (profile.styleDirection?.adopted ?? []).map(String),
    rejected: (profile.styleDirection?.rejected ?? []).map(String),
    noveltyBudget: profile.noveltyBudget.map((entry) => ({
      position: String(entry?.position ?? ''),
      decision: String(entry?.decision ?? ''),
      reason: entry?.reason ? String(entry.reason) : null
    })),
    systems: {
      color: { ...profile.systems.color },
      typography: { ...profile.systems.typography },
      spacing: { ...profile.systems.spacing },
      shape: { ...(profile.systems.shape ?? {}) },
      motion: { ...(profile.systems.motion ?? {}) }
    },
    nonGoals: (profile.nonGoals ?? []).map(String),
    references: (profile.references ?? []).map(String)
  };
}

/**
 * Audits whether a profile is specific enough to be checked against a render. A profile that
 * cannot be falsified provides no direction, which is the failure mode this catches.
 */
export function auditAestheticProfile(profile, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  let normalized = null;

  try { normalized = normalizeAestheticProfile(profile); }
  catch (error) {
    return { ...finalizeProcessAudit([processFinding('PROFILE_INVALID', 'blocker', error.message)], { schemaVersion: 1, evidenceCount: 0, evidenceConfidence: 0 }), profile: null };
  }

  evidenceCount += PERSONALITY_AXES.length;
  const requireReasons = policy.requireAxisReasons !== false;
  for (const axis of PERSONALITY_AXES) {
    const entry = profile.personality[axis];
    if (requireReasons && !nonEmpty(entry?.reason)) {
      findings.push(processFinding('PROFILE_AXIS_REASON_MISSING', 'medium', `Personality axis ${axis} states a position without a reason, so the position cannot be reviewed or revisited.`, { path: `personality.${axis}` }));
    }
    if (!Array.isArray(entry?.consequences) || entry.consequences.length === 0) {
      findings.push(processFinding('PROFILE_AXIS_CONSEQUENCES_MISSING', 'medium', `Personality axis ${axis} lists no design consequences, so the position cannot be checked against a render.`, { path: `personality.${axis}` }));
    } else {
      evidenceCount += 1;
    }
  }

  for (const entry of normalized.noveltyBudget) {
    if (!nonEmpty(entry.position) || !nonEmpty(entry.decision)) {
      findings.push(processFinding('PROFILE_NOVELTY_ENTRY_INCOMPLETE', 'medium', 'A novelty budget entry does not name both the position and the decision.'));
    } else {
      evidenceCount += 1;
    }
  }
  const maxNovelty = Number(policy.maxNoveltyPositions ?? 3);
  if (normalized.noveltyBudget.length > maxNovelty) {
    findings.push(processFinding('PROFILE_NOVELTY_SCATTERED', 'low', `${normalized.noveltyBudget.length} novelty positions are declared but policy allows ${maxNovelty}. Distinctiveness spread across many positions reads as inconsistency rather than character.`));
  }

  const prose = [profile.rationale, ...Object.values(profile.personality).map((entry) => entry?.reason), ...normalized.noveltyBudget.map((entry) => entry.decision)].filter(Boolean).join(' ');
  if (containsPlaceholder(prose)) {
    findings.push(processFinding('PROFILE_PLACEHOLDER_LANGUAGE', 'high', 'The profile contains unresolved placeholder language.'));
  }
  const vague = prose.match(VAGUE_TERMS);
  if (vague) {
    findings.push(processFinding('PROFILE_VAGUE_LANGUAGE', 'medium', `The profile relies on the unconstraining term "${vague[0]}". Replace it with a position and its consequences.`, { remediation: 'State how hierarchy, density, typography, and interaction express this product rather than naming a mood.' }));
  }

  const colors = normalized.systems.color ?? {};
  if (Number(colors.accentCount) > Number(policy.maxAccents ?? 2)) {
    findings.push(processFinding('PROFILE_ACCENT_COUNT_HIGH', 'low', `The profile declares ${colors.accentCount} accents. Additional colours should be reserved for semantic status rather than emphasis.`));
  }
  const typography = normalized.systems.typography ?? {};
  if (Number(typography.roleCount) > Number(policy.maxTypeRoles ?? 8)) {
    findings.push(processFinding('PROFILE_TYPE_ROLES_HIGH', 'low', `The profile declares ${typography.roleCount} typographic roles, beyond the range where each role stays distinct.`));
  }
  if (Number.isFinite(Number(typography.scaleRatio)) && Number(typography.scaleRatio) < Number(policy.minScaleRatio ?? 1.12)) {
    findings.push(processFinding('PROFILE_SCALE_RATIO_LOW', 'medium', `The declared type scale ratio of ${typography.scaleRatio} produces steps below the distinguishable floor.`));
  }

  const density = normalized.systems.spacing?.density;
  const spacious = normalized.personality.denseSpacious;
  if (density && Number.isFinite(spacious)) {
    evidenceCount += 1;
    const expected = spacious <= 2 ? 'dense' : spacious >= 4 ? 'spacious' : 'comfortable';
    if (density !== expected) {
      findings.push(processFinding('PROFILE_DENSITY_CONTRADICTS_AXIS', 'medium', `The spacing density is declared as "${density}" while the dense-to-spacious axis sits at ${spacious}, which implies "${expected}".`));
    }
  }

  const motion = normalized.systems.motion ?? {};
  if (motion.reducedMotionSupported === false) {
    findings.push(processFinding('PROFILE_REDUCED_MOTION_UNSUPPORTED', 'blocker', 'The profile declares that reduced motion is not supported. Reduced-motion behaviour is a requirement.'));
  }
  const playful = normalized.personality.seriousPlayful;
  if (motion.overshoot === 'pronounced' && Number.isFinite(playful) && playful <= 2) {
    findings.push(processFinding('PROFILE_MOTION_CONTRADICTS_AXIS', 'low', `Pronounced motion overshoot contradicts a serious position of ${playful} on the serious-to-playful axis.`));
  }

  if (!normalized.nonGoals.length) {
    findings.push(processFinding('PROFILE_NON_GOALS_MISSING', 'low', 'No non-goals are recorded, so rejected directions will be rediscovered later.'));
  }

  const report = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount > 0 ? 100 : 0 });
  return { ...report, profile: normalized };
}
