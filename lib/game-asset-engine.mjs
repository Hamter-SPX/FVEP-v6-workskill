/**
 * Game asset direction.
 *
 * An asset is not "designed" because a picture exists. It is designed when the
 * silhouette reads, the scale is stated against a known reference, the material and
 * palette bind to the declared style, the budget is engine-real, and there is a plan
 * to verify it in context rather than floating on a turntable.
 *
 * This engine audits one asset spec and a whole asset set for coherence.
 */

import { containsPlaceholder, finalizeProcessAudit, nonEmpty, processFinding, unique } from './process-audit-utils.mjs';

export const ASSET_CLASSES = Object.freeze([
  'character', 'creature', 'prop', 'weapon', 'vehicle', 'environment',
  'architecture', 'terrain', 'vfx', 'ui', 'audio', 'animation'
]);

const VAGUE_TERMS = /\b(cool|awesome|nice|epic|modern|clean|premium|high[- ]quality|beautiful|stylish|next[- ]gen|realistic looking)\b/i;

/**
 * Fields a class needs beyond the universal ones. Effects and sound fail differently from
 * props: a prop that is wrong looks wrong, while an effect that is wrong hides the gameplay
 * information the player needed, and a sound that is wrong becomes fatigue within an hour.
 */
const CLASS_REQUIREMENTS = Object.freeze({
  vfx: [
    {
      field: 'timing', severity: 'blocker',
      message: 'VFX must declare timing: attack, hold, and decay in milliseconds.',
      remediation: 'An effect that outlives its gameplay meaning becomes screen clutter. State the numbers.'
    },
    {
      field: 'readability', severity: 'blocker',
      message: 'VFX must declare how it reads when several instances overlap and at play distance.',
      remediation: 'Say what stays legible when three of these fire at once in a fight.'
    },
    {
      field: 'gameplayRole', severity: 'high',
      message: 'VFX must say whether it carries gameplay information or is decorative.',
      remediation: 'Critical effects get palette roles, silhouette rules, and priority over decorative ones.'
    }
  ],
  audio: [
    {
      field: 'layers', severity: 'blocker',
      message: 'Sound must declare its layers: attack, body, and tail.',
      remediation: 'A single flat sample is why SFX feel weak and repetitive.'
    },
    {
      field: 'mixBus', severity: 'blocker',
      message: 'Sound must declare its mix bus and ducking behaviour.',
      remediation: 'Without a bus and a ducking rule, the important cue loses to ambience at the worst moment.'
    },
    {
      field: 'repetitionPlan', severity: 'high',
      message: 'Sound must declare how repetition fatigue is avoided.',
      remediation: 'Variation count, pitch and volume randomisation ranges, or a round-robin rule.'
    },
    {
      field: 'redundantCue', severity: 'high',
      message: 'Sound must state the visual or haptic cue that carries the same information.',
      remediation: 'Audio-only information excludes deaf players and anyone playing muted.'
    }
  ],
  animation: [
    {
      field: 'timing', severity: 'blocker',
      message: 'Animation must declare timing: anticipation, action, and recovery.',
      remediation: 'Feel is built from these numbers, not from the curve editor looking nice.'
    },
    {
      field: 'cancelWindow', severity: 'blocker',
      message: 'Animation must declare when the player may cancel or interrupt it.',
      remediation: 'Uncancellable animations are the most common cause of "the controls feel bad".'
    },
    {
      field: 'telegraph', severity: 'high',
      message: 'Animation must declare what the opponent or player reads before the effect lands.',
      remediation: 'Name the pose or motion that gives the reaction window.'
    }
  ]
});
const SCALE_UNIT = /(\d+(?:\.\d+)?)\s*(stud|studs|m|meter|meters|cm|px|pixel|pixels|tile|tiles|block|blocks|voxel|voxels|unit|units)\b/i;
const SCALE_REFERENCE = /\b(avatar|player|character|door|human|humanoid|hand|torso|camera|tile|block|grid|reference)\b/i;

/** Universal fields that do not apply to a class. A sound has no silhouette. */
const CLASS_EXEMPTIONS = Object.freeze({
  audio: ['silhouette', 'scale', 'materials', 'palette'],
  vfx: ['materials'],
  animation: ['scale', 'materials'],
  ui: ['materials']
});

export const CLASS_FIELD_REQUIREMENTS = CLASS_REQUIREMENTS;
export const CLASS_FIELD_EXEMPTIONS = CLASS_EXEMPTIONS;

function severityFor(policy, key, fallback) {
  const value = policy?.severity?.[key];
  return typeof value === 'string' ? value : fallback;
}

function text(value) {
  return String(value ?? '').trim();
}

/** One asset spec: is this buildable, checkable, and on-style? */
export function auditAssetSpec(spec = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const id = text(spec.id) || text(spec.name) || '<unnamed asset>';
  const at = (field) => ({ path: `${id}.${field}` });

  if (!nonEmpty(spec.id)) findings.push(processFinding('ASSET_ID_MISSING', 'blocker', 'Asset spec requires a stable id.', at('id')));
  if (!nonEmpty(spec.name)) findings.push(processFinding('ASSET_NAME_MISSING', 'blocker', 'Asset spec requires a human name.', at('name')));

  const assetClass = text(spec.class).toLowerCase();
  if (!ASSET_CLASSES.includes(assetClass)) {
    findings.push(processFinding(
      'ASSET_CLASS_INVALID', 'blocker',
      `Asset class must be one of: ${ASSET_CLASSES.join(', ')}.`,
      { ...at('class'), detail: spec.class ?? null }
    ));
  } else evidenceCount += 1;

  if (!nonEmpty(spec.styleBinding)) {
    findings.push(processFinding(
      'ASSET_STYLE_BINDING_MISSING', 'blocker',
      'Asset must bind to a declared style pack or aesthetic profile, otherwise every asset drifts on its own.',
      { ...at('styleBinding'), remediation: 'Reference the graphics pack (for example domains/GAME/graphics/low-poly.md) or aesthetic-profile.json.' }
    ));
  } else evidenceCount += 1;

  const purpose = text(spec.purpose);
  if (!purpose || purpose.length < 12) {
    findings.push(processFinding('ASSET_PURPOSE_MISSING', 'blocker', 'Asset must state what it does for the player, not only what it looks like.', at('purpose')));
  } else if (VAGUE_TERMS.test(purpose)) {
    findings.push(processFinding('ASSET_PURPOSE_VAGUE', 'high', 'Asset purpose uses unconstraining praise words instead of function.', at('purpose')));
  } else evidenceCount += 1;

  const exempt = new Set(CLASS_EXEMPTIONS[assetClass] ?? []);

  const silhouette = text(spec.silhouette);
  if (exempt.has('silhouette')) {
    // A sound has no shape; its class requirements carry the equivalent burden.
  } else if (!silhouette) {
    findings.push(processFinding(
      'ASSET_SILHOUETTE_MISSING', 'blocker',
      'Asset must describe the silhouette read: what shape identifies it as a black shape at thumbnail size.',
      { ...at('silhouette'), remediation: 'Name the dominant shape language and the one feature that stays legible when scaled down.' }
    ));
  } else if (VAGUE_TERMS.test(silhouette)) {
    findings.push(processFinding('ASSET_SILHOUETTE_VAGUE', 'high', 'Silhouette description is decoration, not a shape statement.', at('silhouette')));
  } else evidenceCount += 1;

  const scale = text(spec.scale);
  if (exempt.has('scale')) {
    // Sounds and animation clips are sized in time, not in studs.
  } else if (!scale) {
    findings.push(processFinding(
      'ASSET_SCALE_MISSING', 'blocker',
      'Asset must state real in-engine size.',
      { ...at('scale'), remediation: 'State size with units and a reference, for example "4.2 studs tall, 0.8x avatar height".' }
    ));
  } else {
    const hasUnit = SCALE_UNIT.test(scale);
    const hasReference = SCALE_REFERENCE.test(scale);
    if (!hasUnit) findings.push(processFinding('ASSET_SCALE_UNIT_MISSING', 'blocker', 'Scale has no numeric unit (studs, metres, tiles, voxels, pixels).', at('scale')));
    if (!hasReference) {
      findings.push(processFinding(
        'ASSET_SCALE_REFERENCE_MISSING', 'high',
        'Scale has no comparison reference, so nobody can tell whether it feels right in the world.',
        { ...at('scale'), remediation: 'Compare against the avatar, a door, a tile, or the camera framing.' }
      ));
    }
    if (hasUnit && hasReference) evidenceCount += 1;
  }

  const materials = Array.isArray(spec.materials) ? spec.materials.filter(nonEmpty) : nonEmpty(spec.materials) ? [text(spec.materials)] : [];
  if (!materials.length && !exempt.has('materials')) {
    findings.push(processFinding('ASSET_MATERIALS_MISSING', 'high', 'Asset must name its materials and surface treatment.', at('materials')));
  } else evidenceCount += materials.length;

  if (!nonEmpty(spec.palette) && !exempt.has('palette')) {
    findings.push(processFinding('ASSET_PALETTE_MISSING', 'high', 'Asset must bind to the palette so the set stays one world.', at('palette')));
  } else evidenceCount += 1;

  const wear = Array.isArray(spec.storyDetails) ? spec.storyDetails.filter(nonEmpty) : [];
  const minStoryDetails = Number(policy.minStoryDetails ?? 2);
  if (wear.length < minStoryDetails) {
    findings.push(processFinding(
      'ASSET_STORY_DETAILS_THIN', severityFor(policy, 'storyDetails', 'medium'),
      `Only ${wear.length} story detail(s); at least ${minStoryDetails} keep the asset from looking generated.`,
      { ...at('storyDetails'), remediation: 'Add use marks, repairs, maker marks, weathering, or owner traces tied to the fiction.' }
    ));
  } else evidenceCount += wear.length;

  const budget = spec.budget ?? {};
  const budgetKeys = Object.keys(budget).filter((key) => Number.isFinite(Number(budget[key])) || nonEmpty(budget[key]));
  if (!budgetKeys.length) {
    findings.push(processFinding(
      'ASSET_BUDGET_MISSING', 'blocker',
      'Asset must declare an engine budget (triangles, parts, texture size, draw calls, or memory).',
      { ...at('budget'), remediation: 'A budget makes the artist and the frame-rate argument the same conversation.' }
    ));
  } else evidenceCount += budgetKeys.length;

  if (['character', 'creature', 'vehicle', 'environment', 'architecture'].includes(assetClass) && !nonEmpty(spec.lod)) {
    findings.push(processFinding(
      'ASSET_LOD_MISSING', 'medium',
      'Large or frequently drawn assets should declare LOD or streaming behaviour.',
      at('lod')
    ));
  }

  const variants = Array.isArray(spec.variants) ? spec.variants.filter(nonEmpty) : [];
  if (spec.variants !== undefined && !variants.length) {
    findings.push(processFinding('ASSET_VARIANTS_EMPTY', 'low', 'variants is present but empty.', at('variants')));
  }

  const acceptance = Array.isArray(spec.acceptance) ? spec.acceptance.filter(nonEmpty) : [];
  if (!acceptance.length) {
    findings.push(processFinding(
      'ASSET_ACCEPTANCE_MISSING', 'blocker',
      'Asset must declare how it is accepted: which shots, which distance, which lighting.',
      { ...at('acceptance'), remediation: 'For example: "reads at 20 studs in night lighting", "silhouette legible at 64px".' }
    ));
  } else evidenceCount += acceptance.length;

  const inContext = spec.inContextEvidence ?? spec.inContext;
  if (!nonEmpty(inContext)) {
    findings.push(processFinding(
      'ASSET_IN_CONTEXT_EVIDENCE_MISSING', 'blocker',
      'Asset must be verified inside the scene, not on an empty turntable.',
      { ...at('inContextEvidence'), remediation: 'Name the capture: gameplay camera, real lighting, next to the avatar, at play distance.' }
    ));
  } else evidenceCount += 1;

  for (const requirement of CLASS_REQUIREMENTS[assetClass] ?? []) {
    if (nonEmpty(spec[requirement.field])) {
      evidenceCount += 1;
      continue;
    }
    findings.push(processFinding(
      `ASSET_${requirement.field.replace(/([A-Z])/g, '_$1').toUpperCase()}_MISSING`,
      severityFor(policy, requirement.field, requirement.severity),
      requirement.message,
      { ...at(requirement.field), remediation: requirement.remediation }
    ));
  }

  for (const [key, value] of Object.entries(spec)) {
    if (typeof value === 'string' && containsPlaceholder(value)) {
      findings.push(processFinding('ASSET_PLACEHOLDER_LANGUAGE', 'blocker', `Field "${key}" still contains placeholder language.`, at(key)));
    }
  }

  const audit = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount ? 100 : 0 });
  return { ...audit, assetId: id, assetClass: assetClass || null };
}

function normalizeScaleUnit(scale) {
  const match = SCALE_UNIT.exec(text(scale));
  if (!match) return null;
  const unit = match[2].toLowerCase().replace(/s$/, '');
  if (['meter', 'm'].includes(unit)) return 'meter';
  if (['pixel', 'px'].includes(unit)) return 'pixel';
  return unit;
}

/** A set of assets must feel like one world: same style, same scale language, distinct silhouettes. */
export function auditAssetSet(assets = [], policy = {}) {
  const list = Array.isArray(assets) ? assets : [];
  const findings = [];
  let evidenceCount = 0;

  if (!list.length) {
    return finalizeProcessAudit([processFinding('ASSET_SET_EMPTY', 'blocker', 'Asset set contains no assets.')], { schemaVersion: 1 });
  }

  const perAsset = list.map((asset) => auditAssetSpec(asset, policy));
  for (const result of perAsset) {
    evidenceCount += result.evidenceCount;
    for (const finding of result.findings) findings.push({ ...finding, section: 'asset' });
  }

  const ids = list.map((asset) => text(asset.id)).filter(Boolean);
  const duplicates = unique(ids.filter((value, index) => ids.indexOf(value) !== index));
  if (duplicates.length) {
    findings.push(processFinding('ASSET_SET_DUPLICATE_IDS', 'blocker', `Duplicate asset ids: ${duplicates.join(', ')}.`, { detail: duplicates }));
  }

  const styles = unique(list.map((asset) => text(asset.styleBinding)).filter(Boolean));
  const maxStyles = Number(policy.maxStyleBindings ?? 1);
  if (styles.length > maxStyles) {
    findings.push(processFinding(
      'ASSET_SET_STYLE_SPLIT', 'high',
      `Assets bind to ${styles.length} different style packs, so the set will not read as one world.`,
      { detail: styles, remediation: 'Collapse to one style pack, or state the deliberate contrast rule that keeps them coherent.' }
    ));
  } else evidenceCount += 1;

  const units = unique(list.map((asset) => normalizeScaleUnit(asset.scale)).filter(Boolean));
  if (units.length > 1) {
    findings.push(processFinding(
      'ASSET_SET_SCALE_UNIT_MIXED', 'high',
      `Scales are stated in mixed units (${units.join(', ')}), which hides sizing mistakes.`,
      { detail: units, remediation: 'Pick one authoring unit for the project and convert everything to it.' }
    ));
  } else if (units.length === 1) evidenceCount += 1;

  const silhouettes = list.map((asset) => text(asset.silhouette).toLowerCase()).filter(Boolean);
  const distinctSilhouettes = new Set(silhouettes);
  if (silhouettes.length >= 3 && distinctSilhouettes.size < Math.ceil(silhouettes.length * 0.75)) {
    findings.push(processFinding(
      'ASSET_SET_SILHOUETTE_REPETITION', 'medium',
      'Silhouette descriptions repeat across the set; assets will be hard to tell apart in play.',
      { remediation: 'Give each asset a different dominant shape or proportion so players read them instantly.' }
    ));
  }

  const palettes = unique(list.map((asset) => text(asset.palette)).filter(Boolean));
  const maxPalettes = Number(policy.maxPalettes ?? 3);
  if (palettes.length > maxPalettes) {
    findings.push(processFinding(
      'ASSET_SET_PALETTE_SPRAWL', 'medium',
      `${palettes.length} palette bindings across the set exceeds the limit of ${maxPalettes}.`,
      { detail: palettes }
    ));
  }

  const frameBudget = Number(policy.frameTriangleBudget ?? 0);
  if (frameBudget > 0) {
    const total = list.reduce((sum, asset) => sum + (Number(asset?.budget?.triangles) || 0), 0);
    if (total > frameBudget) {
      findings.push(processFinding(
        'ASSET_SET_BUDGET_EXCEEDED', 'high',
        `Declared triangles total ${total}, above the frame budget of ${frameBudget}.`,
        { detail: { total, frameBudget }, remediation: 'Cut density on background assets or add LODs before authoring continues.' }
      ));
    } else evidenceCount += 1;
  }

  const audit = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: 100 });
  return {
    ...audit,
    verdict: audit.hardFailures.length ? 'fail-asset-set' : audit.warnings.length ? 'pass-with-notes' : 'pass-asset-set',
    assetCount: list.length,
    assets: perAsset.map((result) => ({
      id: result.assetId,
      class: result.assetClass,
      ok: result.ok,
      score: result.score,
      blockers: result.hardFailures.length
    }))
  };
}

export function formatAssetReport(result) {
  const lines = ['=== GAME ASSET DIRECTION ===', `verdict=${result.verdict ?? (result.ok ? 'pass' : 'fail')}  ok=${result.ok}  score=${result.score}`];
  if (Array.isArray(result.assets)) {
    lines.push('', 'assets:');
    for (const asset of result.assets) {
      lines.push(`- ${asset.ok ? 'PASS' : 'FAIL'} ${asset.id} (${asset.class ?? 'unclassed'}) score=${asset.score} blockers=${asset.blockers}`);
    }
  }
  const actionable = (result.findings ?? []).filter((finding) => finding.severity !== 'info');
  if (actionable.length) {
    lines.push('', 'findings:');
    for (const finding of actionable) {
      lines.push(`- [${finding.severity}] ${finding.code}${finding.path ? ` (${finding.path})` : ''}: ${finding.message}`);
      if (finding.remediation) lines.push(`  fix: ${finding.remediation}`);
    }
  } else {
    lines.push('', 'No blocking asset findings.');
  }
  return `${lines.join('\n')}\n`;
}
