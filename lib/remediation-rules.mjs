/**
 * Remediation rule library for judge/mobile findings. Maps a deterministic
 * judge rule name (lib/vision-judge-engine.mjs, lib/mobile-checks-engine.mjs)
 * to curated guidance: why it fires (likelyCause), what to do (action), and
 * how to confirm the fix (verify). Lookup is exact first, then case-insensitive;
 * anything unresolved falls back to FALLBACK_RULE — never a partial match.
 */

export const JUDGE_RULES = Object.freeze([
  {
    matches: 'missingCapture',
    category: 'mobile-capture',
    why: 'The checks stage found no current PNG for this case, so there is no visual evidence to judge.',
    action: 'Run the mobile capture stage for this case and device, then confirm the output PNG exists at the expected current/ artifact path. Fix simulator/device availability before judging again.',
    verify: 'Re-run the vision loop or mobile checks and confirm the current PNG exists and a .mobile.judgment.json is written for the case.'
  },
  {
    matches: 'sourceMismatch',
    category: 'mobile-capture',
    why: 'The metrics were computed from a different image than the capture under judgment, so the verdict is not trustworthy.',
    action: 'Recompute the metrics from the exact current capture file and re-judge it. Do not reuse metrics across captures, devices, or config changes.',
    verify: 'Confirm the metrics source sha256 equals the capture sha256 in the judgment record, then re-run mobile checks.'
  },
  {
    matches: 'suspectBackground',
    category: 'mobile-visual',
    why: 'The engine-estimated background is unreliable (gradient edge, modal ring, or fully occupied grid), so occupancy and contrast metrics may be skewed.',
    action: 'Inspect the capture for gradients, overlays, or edge-to-edge content that confuses the background estimate. Treat threshold results for this capture as advisory until the background estimate is stable.',
    verify: 'Re-run mobile checks after adjusting the screen or thresholds and confirm suspectBackground no longer fires.'
  },
  {
    matches: 'maxEmptyCells',
    category: 'mobile-visual',
    why: 'Too many grid cells are empty; the screen underuses the available layout space.',
    action: 'Check the flagged capture for collapsed states, missing data, or oversized spacing. Fill or rebalance the content so empty regions drop to the allowed maximum, unless the whitespace is intentional.',
    verify: 'Re-run mobile checks for the same case and confirm the empty-cell count is at or below the maxEmptyCells threshold.'
  },
  {
    matches: 'minAlignment',
    category: 'mobile-visual',
    why: 'Detected edge alignment is weaker than required; content blocks likely drift off a shared axis.',
    action: 'Align the primary content blocks to a common leading or center axis with consistent insets. Check container padding and nested offsets in the flagged capture.',
    verify: 'Re-run mobile checks and confirm the alignment score meets the minAlignment threshold.'
  },
  {
    matches: 'maxDarkShare',
    category: 'mobile-visual',
    why: 'The capture is darker than allowed; large dark regions dominate the frame.',
    action: 'Check for unintended dark overlays, backgrounds, or a wrong theme state. Restore the intended light/dark balance for this case.',
    verify: 'Re-run mobile checks and confirm darkShare is at or below the maxDarkShare threshold.'
  },
  {
    matches: 'minDarkShare',
    category: 'mobile-visual',
    why: 'The capture contains less dark content than required; expected dark regions may not have rendered.',
    action: 'Confirm dark-themed regions (headers, media, controls) actually rendered. Restore missing assets or theme tokens and recapture the case.',
    verify: 'Re-run mobile checks and confirm darkShare meets the minDarkShare threshold.'
  },
  {
    matches: 'maxLightShare',
    category: 'mobile-visual',
    why: 'The capture is brighter than allowed; large light or blank regions dominate the frame.',
    action: 'Check for blank states, missing content, or an unintended full-light background. Restore the intended content density or theme balance.',
    verify: 'Re-run mobile checks and confirm lightShare is at or below the maxLightShare threshold.'
  },
  {
    matches: 'minLightShare',
    category: 'mobile-visual',
    why: 'The capture contains less light content than required; the screen may be unexpectedly dark overall.',
    action: 'Confirm the intended theme and background rendered and that content is not hidden behind dark overlays. Fix the theme state and recapture the case.',
    verify: 'Re-run mobile checks and confirm lightShare meets the minLightShare threshold.'
  }
]);

export const FALLBACK_RULE = Object.freeze({
  matches: null,
  category: 'judge',
  why: 'No curated remediation rule exists for this finding, so the cause must be read from the judgment evidence directly.',
  action: 'Open the judgment JSON and the capture for this case, compare expected vs observed, and correct the underlying screen or threshold.',
  verify: 'Re-run the checks that produced this finding and confirm the rule no longer fires.'
});

export function lookupRemediationRule(rule) {
  if (typeof rule !== 'string') return FALLBACK_RULE;
  const needle = rule.trim();
  if (needle === '') return FALLBACK_RULE;
  // 1) Exact string or anchored regex match.
  for (const entry of JUDGE_RULES) {
    if (typeof entry.matches === 'string' && entry.matches === needle) return entry;
    if (entry.matches instanceof RegExp && entry.matches.test(needle)) return entry;
  }
  // 2) Case-insensitive tolerance for hand-written rule names.
  const lower = needle.toLowerCase();
  for (const entry of JUDGE_RULES) {
    if (typeof entry.matches === 'string' && entry.matches.toLowerCase() === lower) return entry;
  }
  return FALLBACK_RULE;
}
