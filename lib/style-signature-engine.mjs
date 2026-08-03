import { finalizeProcessAudit, processFinding } from './process-audit-utils.mjs';

export const SIGNATURE_FEATURES = Object.freeze(['radius', 'elevation', 'chroma', 'typeContrast', 'density', 'borderReliance', 'monospace', 'imagery']);

/**
 * Measurable signatures for the archetypes in references/visual-style-lexicon.md.
 * Values are normalized 0–1 on each feature axis.
 */
export const ARCHETYPE_SIGNATURES = Object.freeze({
  swiss: Object.freeze({ radius: 0.10, elevation: 0.05, chroma: 0.15, typeContrast: 0.45, density: 0.50, borderReliance: 0.30, monospace: 0.00, imagery: 0.30 }),
  editorial: Object.freeze({ radius: 0.15, elevation: 0.10, chroma: 0.30, typeContrast: 0.90, density: 0.25, borderReliance: 0.15, monospace: 0.00, imagery: 0.80 }),
  'neo-minimal': Object.freeze({ radius: 0.30, elevation: 0.15, chroma: 0.15, typeContrast: 0.40, density: 0.40, borderReliance: 0.20, monospace: 0.00, imagery: 0.25 }),
  utilitarian: Object.freeze({ radius: 0.10, elevation: 0.10, chroma: 0.20, typeContrast: 0.25, density: 0.95, borderReliance: 0.80, monospace: 0.35, imagery: 0.10 }),
  brutalist: Object.freeze({ radius: 0.00, elevation: 0.00, chroma: 0.50, typeContrast: 0.55, density: 0.60, borderReliance: 0.90, monospace: 0.60, imagery: 0.20 }),
  'soft-rounded': Object.freeze({ radius: 0.90, elevation: 0.60, chroma: 0.60, typeContrast: 0.50, density: 0.25, borderReliance: 0.15, monospace: 0.00, imagery: 0.50 }),
  'glass-layered': Object.freeze({ radius: 0.70, elevation: 0.85, chroma: 0.55, typeContrast: 0.50, density: 0.35, borderReliance: 0.35, monospace: 0.00, imagery: 0.55 }),
  bento: Object.freeze({ radius: 0.65, elevation: 0.35, chroma: 0.45, typeContrast: 0.50, density: 0.45, borderReliance: 0.25, monospace: 0.00, imagery: 0.40 }),
  'retro-digital': Object.freeze({ radius: 0.05, elevation: 0.05, chroma: 0.40, typeContrast: 0.30, density: 0.70, borderReliance: 0.70, monospace: 0.95, imagery: 0.10 })
});

const NORMALIZERS = Object.freeze({
  radius: { source: 'medianRadiusPx', max: 24 },
  elevation: { source: 'elevationLevels', max: 5 },
  chroma: { source: 'meanChroma', max: 0.2 },
  typeContrast: { source: 'typeScaleRatio', min: 1, max: 1.7 },
  density: { source: 'informationDensity', max: 1 },
  borderReliance: { source: 'borderReliance', max: 1 },
  monospace: { source: 'monospaceRatio', max: 1 },
  imagery: { source: 'imageAreaRatio', max: 1 }
});

function clamp01(value) { return Math.min(1, Math.max(0, value)); }
function round(value, digits = 3) { return Number(Number(value).toFixed(digits)); }

/** Converts raw measurements into the normalized feature vector used for classification. */
export function computeStyleSignature(measurements = {}) {
  const signature = {};
  const missing = [];
  for (const feature of SIGNATURE_FEATURES) {
    const rule = NORMALIZERS[feature];
    const raw = Number(measurements[rule.source]);
    if (!Number.isFinite(raw)) { missing.push(rule.source); signature[feature] = null; continue; }
    const min = rule.min ?? 0;
    signature[feature] = round(clamp01((raw - min) / (rule.max - min)));
  }
  return { signature, missing, completeness: round(((SIGNATURE_FEATURES.length - missing.length) / SIGNATURE_FEATURES.length) * 100, 2) };
}

/**
 * Ranks archetypes by distance from an observed signature. Features that could not be
 * measured are excluded rather than defaulted, so a partial signature does not fabricate a match.
 */
export function classifyStyle(signature = {}) {
  const available = SIGNATURE_FEATURES.filter((feature) => Number.isFinite(Number(signature[feature])));
  if (!available.length) return { matches: [], nearest: null, comparedFeatures: [] };
  const matches = Object.entries(ARCHETYPE_SIGNATURES).map(([name, prototype]) => {
    const squared = available.reduce((sum, feature) => sum + (Number(signature[feature]) - prototype[feature]) ** 2, 0);
    const distance = Math.sqrt(squared / available.length);
    return { archetype: name, distance: round(distance), match: round(Math.max(0, 100 - distance * 100), 2) };
  }).sort((a, b) => b.match - a.match);
  return { matches, nearest: matches[0], comparedFeatures: available };
}

export function analyzeStyleSignature(input = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const minCompleteness = Number(policy.minCompleteness ?? 60);
  const minDeclaredMatch = Number(policy.minDeclaredMatch ?? 70);
  const genericArchetypes = new Set(policy.genericArchetypes ?? ['soft-rounded']);

  const { signature, missing, completeness } = computeStyleSignature(input.measurements ?? {});
  if (completeness < minCompleteness) {
    findings.push(processFinding('STYLE_SIGNATURE_INCOMPLETE', 'low', `Only ${completeness}% of style features could be measured, below the ${minCompleteness}% needed for a reliable classification.`, { detail: missing }));
  } else {
    evidenceCount += 1;
  }

  const classification = classifyStyle(signature);
  const declared = input.declaredArchetype ? String(input.declaredArchetype) : null;

  if (declared && declared !== 'none') {
    if (!Object.hasOwn(ARCHETYPE_SIGNATURES, declared)) {
      findings.push(processFinding('STYLE_ARCHETYPE_UNKNOWN', 'low', `Declared archetype "${declared}" is not in the lexicon.`));
    } else if (classification.matches.length) {
      evidenceCount += 1;
      const declaredMatch = classification.matches.find((item) => item.archetype === declared);
      if (declaredMatch && declaredMatch.match < minDeclaredMatch) {
        findings.push(processFinding('STYLE_DRIFT_FROM_DECLARED', 'medium', `The artifact matches its declared archetype "${declared}" at ${declaredMatch.match}% but matches "${classification.nearest.archetype}" at ${classification.nearest.match}%. The implementation has drifted from its direction.`, { detail: classification.matches.slice(0, 3), remediation: 'Either bring the implementation back to the declared parameters or update the profile to state the direction actually chosen.' }));
      }
    }
  } else if (classification.nearest && genericArchetypes.has(classification.nearest.archetype) && classification.nearest.match >= minDeclaredMatch) {
    findings.push(processFinding('STYLE_UNDECLARED_DEFAULT', 'medium', `No archetype is declared and the artifact measures as "${classification.nearest.archetype}" at ${classification.nearest.match}%, which is where unexamined defaults land.`, { remediation: 'Declare a direction and spend the novelty budget deliberately, or accept this as a recorded decision.' }));
  }

  const report = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: completeness });
  return { ...report, signature, completeness, missing, classification, declaredArchetype: declared };
}
