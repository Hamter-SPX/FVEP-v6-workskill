import { finalizeProcessAudit, processFinding } from './process-audit-utils.mjs';

const NAMED = Object.freeze({ black: '#000000', white: '#ffffff', transparent: '#00000000' });
const CONTRAST_FLOORS = Object.freeze({ body: 4.5, large: 3, ui: 3 });

function clamp01(value) { return Math.min(1, Math.max(0, value)); }
function round(value, digits = 4) { return Number(Number(value).toFixed(digits)); }

function expandHex(hex) {
  const raw = hex.replace('#', '');
  if (raw.length === 3 || raw.length === 4) return raw.split('').map((char) => char + char).join('');
  return raw;
}

/** Parses hex, rgb(), rgba(), and the handful of keywords that appear in computed styles. */
export function parseColor(value) {
  const input = String(value ?? '').trim().toLowerCase();
  if (!input) throw new TypeError('Colour value is required.');
  const resolved = NAMED[input] ?? input;
  if (resolved.startsWith('#')) {
    const hex = expandHex(resolved);
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) throw new TypeError(`Unsupported colour value: ${value}`);
    return {
      r: Number.parseInt(hex.slice(0, 2), 16) / 255,
      g: Number.parseInt(hex.slice(2, 4), 16) / 255,
      b: Number.parseInt(hex.slice(4, 6), 16) / 255,
      a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1
    };
  }
  const functional = resolved.match(/^rgba?\(([^)]+)\)$/);
  if (functional) {
    const parts = functional[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) throw new TypeError(`Unsupported colour value: ${value}`);
    const channel = (part) => part.endsWith('%') ? clamp01(Number.parseFloat(part) / 100) : clamp01(Number.parseFloat(part) / 255);
    const alpha = parts[3] === undefined ? 1 : (parts[3].endsWith('%') ? Number.parseFloat(parts[3]) / 100 : Number.parseFloat(parts[3]));
    return { r: channel(parts[0]), g: channel(parts[1]), b: channel(parts[2]), a: clamp01(alpha) };
  }
  throw new TypeError(`Unsupported colour value: ${value}`);
}

function linearize(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** Converts sRGB to OKLCH, the perceptual space the colour reference requires for ramp reasoning. */
export function toOklch(color) {
  const { r, g, b } = typeof color === 'string' ? parseColor(color) : color;
  const lr = linearize(r); const lg = linearize(g); const lb = linearize(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const okL = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const chroma = Math.hypot(okA, okB);
  const hue = chroma < 1e-6 ? 0 : ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360;
  return { l: round(okL), c: round(chroma), h: round(hue, 2) };
}

export function relativeLuminance(color) {
  const { r, g, b } = typeof color === 'string' ? parseColor(color) : color;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a >= b ? [a, b] : [b, a];
  return round((light + 0.05) / (dark + 0.05), 2);
}

/**
 * Measures whether a ramp steps evenly in perceptual lightness. `evenness` is 100 when every
 * step is identical and falls as the steps diverge; `minStep` exposes indistinguishable pairs.
 */
export function analyzeRamp(colors = []) {
  const entries = colors.map((value) => ({ value: String(value), ...toOklch(value) }));
  if (entries.length < 2) return { steps: [], evenness: 100, monotonic: true, minStep: null, maxStep: null, meanStep: null, entries };
  const ascending = entries[entries.length - 1].l > entries[0].l;
  const ordered = ascending ? entries : [...entries].reverse();
  const steps = [];
  let monotonic = true;
  for (let index = 1; index < ordered.length; index += 1) {
    const delta = ordered[index].l - ordered[index - 1].l;
    if (delta <= 0) monotonic = false;
    steps.push(round(Math.abs(delta)));
  }
  const meanStep = steps.reduce((sum, value) => sum + value, 0) / steps.length;
  const deviation = Math.sqrt(steps.reduce((sum, value) => sum + (value - meanStep) ** 2, 0) / steps.length);
  const evenness = meanStep > 0 ? round(Math.max(0, 100 - (deviation / meanStep) * 100), 2) : 0;
  return {
    steps, evenness, monotonic,
    minStep: round(Math.min(...steps)), maxStep: round(Math.max(...steps)), meanStep: round(meanStep),
    entries
  };
}

function hueSpread(hues = []) {
  if (hues.length < 2) return 0;
  const sorted = [...hues].sort((a, b) => a - b);
  let largestGap = (sorted[0] + 360) - sorted[sorted.length - 1];
  for (let index = 1; index < sorted.length; index += 1) largestGap = Math.max(largestGap, sorted[index] - sorted[index - 1]);
  return round(360 - largestGap, 2);
}

export function classifyHarmony(hues = []) {
  const unique = [...new Set(hues.map((value) => Math.round(value)))];
  if (unique.length <= 1) return 'monochromatic';
  const spread = hueSpread(unique);
  if (spread <= 60) return 'analogous';
  if (unique.length === 2) return spread >= 150 && spread <= 210 ? 'complementary' : 'unconstrained';
  if (unique.length === 3) {
    const sorted = [...unique].sort((a, b) => a - b);
    const gaps = [sorted[1] - sorted[0], sorted[2] - sorted[1], 360 - (sorted[2] - sorted[0])];
    if (gaps.every((gap) => Math.abs(gap - 120) <= 30)) return 'triadic';
    return 'split-complementary';
  }
  return 'unconstrained';
}

/**
 * Audits a declared colour system against the requirements in
 * references/color-system-and-perception.md. Input is a palette description, not a render.
 */
export function analyzeColorSystem(input = {}, policy = {}) {
  const findings = [];
  let evidenceCount = 0;
  const minRampEvenness = Number(policy.minRampEvenness ?? 60);
  const minLightnessStep = Number(policy.minLightnessStep ?? 0.03);
  const maxAccents = Number(policy.maxAccents ?? 2);
  const neutralChromaCeiling = Number(policy.neutralChromaCeiling ?? 0.04);

  const neutrals = (input.neutrals ?? []).map(String);
  let ramp = null;
  if (neutrals.length >= 3) {
    evidenceCount += 1;
    ramp = analyzeRamp(neutrals);
    if (!ramp.monotonic) {
      findings.push(processFinding('COLOR_RAMP_NOT_MONOTONIC', 'high', 'The neutral ramp does not move consistently in one lightness direction.', { detail: ramp.steps, remediation: 'Order the ramp by perceptual lightness and re-derive the intermediate steps.' }));
    }
    if (ramp.evenness < minRampEvenness) {
      findings.push(processFinding('COLOR_RAMP_UNEVEN', 'medium', `Neutral ramp lightness steps are uneven (evenness ${ramp.evenness}, policy ${minRampEvenness}).`, { detail: ramp.steps, remediation: 'Derive the ramp from an even perceptual lightness curve rather than by adjusting hex values by eye.' }));
    }
    if (ramp.minStep !== null && ramp.minStep < minLightnessStep) {
      findings.push(processFinding('COLOR_RAMP_STEP_INDISTINGUISHABLE', 'medium', `Adjacent neutral steps differ by ${ramp.minStep} lightness, below the distinguishable floor of ${minLightnessStep}.`, { remediation: 'Remove the redundant step or widen the interval so the difference reads as intentional.' }));
    }
    const chromas = neutrals.map((value) => toOklch(value).c);
    const hues = neutrals.map((value) => toOklch(value)).filter((entry) => entry.c > 0.005).map((entry) => entry.h);
    if (chromas.every((value) => value < 0.005)) {
      findings.push(processFinding('COLOR_NEUTRALS_PURE_GREY', 'info', 'Neutrals carry no chroma, so the interface will read as a default grey rather than a deliberate temperature.', { remediation: 'Introduce a small shared chroma tied to the brand hue to unify surfaces.' }));
    } else if (hueSpread(hues) > 60) {
      findings.push(processFinding('COLOR_NEUTRALS_MIXED_TEMPERATURE', 'medium', 'Neutral steps do not share a hue, which produces surfaces that read as belonging to different systems.', { detail: round(hueSpread(hues), 2) }));
    }
    if (chromas.some((value) => value > neutralChromaCeiling)) {
      findings.push(processFinding('COLOR_NEUTRAL_OVERSATURATED', 'low', `A neutral exceeds the chroma ceiling of ${neutralChromaCeiling} and will not behave as a neutral surface.`));
    }
  } else if (neutrals.length > 0) {
    findings.push(processFinding('COLOR_RAMP_TOO_SHORT', 'low', 'Fewer than three neutral steps were supplied, so ramp evenness could not be assessed.'));
  }

  const accents = (input.accents ?? []).map(String);
  if (accents.length) {
    evidenceCount += 1;
    if (accents.length > maxAccents) {
      findings.push(processFinding('COLOR_ACCENT_COMPETITION', 'medium', `${accents.length} accents are declared but policy allows ${maxAccents}. Multiple accents remove a single primary emphasis.`, { remediation: 'Reserve additional colours for semantic status rather than emphasis.' }));
    }
    const accentChroma = accents.map((value) => toOklch(value).c);
    if (accentChroma.some((value) => value < 0.05)) {
      findings.push(processFinding('COLOR_ACCENT_LOW_CHROMA', 'low', 'An accent has chroma close to neutral and will not read as an accent against the surface set.'));
    }
  }

  const harmony = accents.length ? classifyHarmony(accents.map((value) => toOklch(value).h)) : null;
  if (policy.expectedHarmony && harmony && policy.expectedHarmony !== 'unconstrained' && harmony !== policy.expectedHarmony) {
    findings.push(processFinding('COLOR_HARMONY_MISMATCH', 'low', `Accent hues classify as ${harmony} but the profile declares ${policy.expectedHarmony}.`));
  }

  const pairs = Array.isArray(input.pairs) ? input.pairs : [];
  const contrastResults = [];
  for (const pair of pairs) {
    const usage = String(pair.usage ?? 'body');
    const floor = Number(policy.contrastFloors?.[usage] ?? CONTRAST_FLOORS[usage] ?? CONTRAST_FLOORS.body);
    let ratio = null;
    try { ratio = contrastRatio(pair.foreground, pair.background); }
    catch (error) {
      findings.push(processFinding('COLOR_PAIR_UNPARSEABLE', 'low', `Contrast pair ${pair.name ?? '<unnamed>'} could not be parsed: ${error.message}`));
      continue;
    }
    evidenceCount += 1;
    const passed = ratio >= floor;
    contrastResults.push({ name: String(pair.name ?? `${pair.foreground} on ${pair.background}`), usage, ratio, floor, passed });
    if (!passed) {
      findings.push(processFinding('COLOR_CONTRAST_BELOW_FLOOR', pair.critical === false ? 'high' : 'blocker', `Contrast for ${pair.name ?? 'pair'} is ${ratio}:1 against a ${floor}:1 floor.`, { path: pair.region ? String(pair.region) : undefined, remediation: 'Increase the lightness difference against the real rendered background, including any overlay or image behind the text.' }));
    }
  }

  const statuses = input.statuses && typeof input.statuses === 'object' ? input.statuses : null;
  if (statuses) {
    evidenceCount += 1;
    if (input.statusReliesOnColorAlone === true) {
      findings.push(processFinding('COLOR_STATUS_HUE_ONLY', 'blocker', 'Status is conveyed by hue alone. Pair every status with an icon, label, or shape.'));
    }
    const statusHues = Object.values(statuses).map((value) => { try { return toOklch(value).h; } catch { return null; } }).filter((value) => value !== null);
    if (new Set(statusHues.map((value) => Math.round(value / 15))).size < statusHues.length) {
      findings.push(processFinding('COLOR_STATUS_HUES_COLLIDE', 'medium', 'Two status colours occupy the same hue region and will not be distinguishable at a glance.'));
    }
  }

  if (input.themes && Array.isArray(input.themes) && input.themes.includes('dark') && input.darkThemeDerivation === 'inverted') {
    findings.push(processFinding('COLOR_DARK_THEME_INVERTED', 'medium', 'The dark theme is described as an inversion of the light theme. Dark surfaces require independently tuned lightness, chroma, and elevation.'));
  }

  const report = finalizeProcessAudit(findings, { schemaVersion: 1, evidenceCount, evidenceConfidence: evidenceCount > 0 ? 100 : 0 });
  return { ...report, ramp, harmony, accentCount: accents.length, neutralCount: neutrals.length, contrast: contrastResults };
}
