import fs from 'node:fs/promises';
import path from 'node:path';
import { validateActions } from './actions.mjs';
import { artifactKey } from './artifacts.mjs';
import { normalizeMaskRectangles } from './diff-policy.mjs';
import { normalizeEngineeringCheck } from './engineering.mjs';
import { normalizeRegion } from './region-engine.mjs';
import { DEFAULT_GATE_WEIGHTS } from './quality-model.mjs';

const DEFAULT_VIEWPORTS = Object.freeze([
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]);
const DEFAULT_STATES = Object.freeze([{ name: 'default', actions: [] }]);
const DEFAULT_INSPECTION_SELECTORS = Object.freeze([
  'header', 'nav', 'main', 'section', 'aside', 'footer',
  'h1', 'h2', 'h3', 'button', 'a', 'input', 'select', 'textarea',
  '[role="button"]', '[role="dialog"]', '[role="navigation"]'
]);
const DEFAULT_TOKEN_SELECTORS = Object.freeze(['html', 'body', 'header', 'nav', 'main', 'section', 'aside', 'footer', 'button', 'a', 'input', 'select', 'textarea', '[data-component]', '[class]']);
const DEFAULT_BREAKPOINT_SELECTORS = Object.freeze(['header', 'nav', 'main', 'aside', 'footer', '[data-layout-region]', '[role="navigation"]']);
const DEFAULT_PERFORMANCE_BUDGETS = Object.freeze({
  lcpMs: { max: 2500, hard: true, weight: 3 },
  inpMs: { max: 200, hard: true, weight: 2 },
  cls: { max: 0.1, hard: true, weight: 3 },
  longTaskTotalMs: { max: 500, hard: false, weight: 2 },
  transferBytes: { max: 2_000_000, hard: false, weight: 1 },
  jsTransferBytes: { max: 500_000, hard: false, weight: 2 },
  requestCount: { max: 100, hard: false, weight: 1 },
  domNodes: { max: 2500, hard: false, weight: 1 },
  imageMissingDimensions: { max: 0, hard: false, weight: 1 }
});

const clone = (value) => structuredClone(value);
const stringArray = (value, fallback = []) => Array.isArray(value) ? value.map(String) : [...fallback];

function normalizeViewport(viewport, index) {
  const width = Number(viewport?.width);
  const height = Number(viewport?.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 200 || height < 200 || width > 7680 || height > 7680) {
    throw new RangeError(`Viewport ${index} width and height must be integers from 200 to 7680.`);
  }
  return {
    name: String(viewport.name ?? `${width}x${height}`),
    width,
    height,
    deviceScaleFactor: viewport.deviceScaleFactor === undefined ? null : Number(viewport.deviceScaleFactor)
  };
}

function normalizeState(state, index) {
  if (typeof state === 'string') {
    return {
      name: state,
      query: {},
      localStorage: {},
      sessionStorage: {},
      cookies: [],
      actions: [],
      readySelector: null,
      readyScript: null,
      settleMs: null,
      maskSelectors: [],
      inspectSelectors: [],
      masks: [],
      regions: []
    };
  }
  const value = state && typeof state === 'object' ? state : {};
  return {
    name: String(value.name ?? `state-${index + 1}`),
    query: value.query && typeof value.query === 'object' ? clone(value.query) : {},
    localStorage: value.localStorage && typeof value.localStorage === 'object' ? clone(value.localStorage) : {},
    sessionStorage: value.sessionStorage && typeof value.sessionStorage === 'object' ? clone(value.sessionStorage) : {},
    cookies: Array.isArray(value.cookies) ? clone(value.cookies) : [],
    actions: Array.isArray(value.actions) ? clone(value.actions) : [],
    readySelector: value.readySelector ? String(value.readySelector) : null,
    readyScript: value.readyScript ? String(value.readyScript) : null,
    settleMs: value.settleMs === undefined ? null : Number(value.settleMs),
    maskSelectors: stringArray(value.maskSelectors),
    inspectSelectors: stringArray(value.inspectSelectors),
    masks: normalizeMaskRectangles(value.masks ?? []),
    regions: (value.regions ?? []).map(normalizeRegion)
  };
}

function normalizeRoute(route, index) {
  if (!route || typeof route !== 'object') throw new TypeError(`Route ${index} must be an object.`);
  const routePath = String(route.path ?? '/');
  if (!routePath.startsWith('/') && !/^https?:\/\//.test(routePath)) throw new TypeError(`Route ${index} path must start with / or be absolute.`);
  return {
    name: String(route.name ?? `route-${index + 1}`),
    path: routePath,
    referencePath: route.referencePath ? String(route.referencePath) : null,
    waitUntil: route.waitUntil ? String(route.waitUntil) : null,
    waitFor: route.waitFor ? String(route.waitFor) : null,
    readySelector: route.readySelector ? String(route.readySelector) : null,
    readyScript: route.readyScript ? String(route.readyScript) : null,
    settleMs: route.settleMs === undefined ? null : Number(route.settleMs),
    maskSelectors: stringArray(route.maskSelectors),
    inspectSelectors: stringArray(route.inspectSelectors),
    masks: normalizeMaskRectangles(route.masks ?? []),
    regions: (route.regions ?? []).map(normalizeRegion),
    viewports: (route.viewports ?? DEFAULT_VIEWPORTS).map(normalizeViewport),
    states: (route.states ?? DEFAULT_STATES).map(normalizeState)
  };
}

// Mobile masks share the web mask pipeline: w/h aliases are pre-mapped to
// width/height, then the SAME normalizer (lib/diff-policy.mjs) floors to
// integers and throws identically to web masks (TypeError on non-finite
// coordinates or a non-array value, RangeError on non-positive width/height).
function normalizeMobileMasks(masks) {
  // Non-array input is handed to the normalizer unmapped so its error wording
  // matches the web path exactly (web call sites do route.masks ?? []).
  if (!Array.isArray(masks)) return normalizeMaskRectangles(masks ?? []);
  return normalizeMaskRectangles(masks.map((m) => ({
    x: m.x,
    y: m.y,
    width: m.width ?? m.w,
    height: m.height ?? m.h
  })));
}

function normalizeBudgetMap(input) {
  const result = {};
  for (const [metric, raw] of Object.entries(input ?? DEFAULT_PERFORMANCE_BUDGETS)) {
    if (raw === false || raw === null) { result[metric] = null; continue; }
    if (typeof raw === 'number') result[metric] = { max: Number(raw), hard: false, weight: 1 };
    else result[metric] = { max: Number(raw.max), hard: Boolean(raw.hard), weight: Number(raw.weight ?? 1) };
  }
  return result;
}

export function normalizeConfig(input = {}, configPath = path.resolve('vision-loop.config.json')) {
  const source = clone(input);
  const baseDir = path.dirname(path.resolve(configPath));
  return {
    version: 2,
    configPath: path.resolve(configPath),
    baseDir,
    mode: String(source.mode ?? 'brand-consistent'),
    baseUrl: String(source.baseUrl ?? 'http://127.0.0.1:3000'),
    referenceBaseUrl: source.referenceBaseUrl ? String(source.referenceBaseUrl) : null,
    outputDir: path.resolve(baseDir, source.outputDir ?? 'artifacts/vision-loop'),
    runtime: {
      browser: String(source.runtime?.browser ?? 'chromium'),
      headed: Boolean(source.runtime?.headed ?? false),
      timeoutMs: Number(source.runtime?.timeoutMs ?? 30000),
      locale: String(source.runtime?.locale ?? 'en-US'),
      timezoneId: String(source.runtime?.timezoneId ?? 'UTC'),
      colorScheme: String(source.runtime?.colorScheme ?? 'light'),
      reducedMotion: String(source.runtime?.reducedMotion ?? 'reduce'),
      deviceScaleFactor: Number(source.runtime?.deviceScaleFactor ?? 1),
      userAgent: source.runtime?.userAgent ? String(source.runtime.userAgent) : null,
      freezeTime: source.runtime?.freezeTime ? String(source.runtime.freezeTime) : null,
      randomSeed: source.runtime?.randomSeed === undefined ? null : Number(source.runtime.randomSeed),
      extraHTTPHeaders: source.runtime?.extraHTTPHeaders && typeof source.runtime.extraHTTPHeaders === 'object' ? clone(source.runtime.extraHTTPHeaders) : {},
      allowedConsolePatterns: stringArray(source.runtime?.allowedConsolePatterns),
      allowedRequestPatterns: stringArray(source.runtime?.allowedRequestPatterns),
      allowedResponsePatterns: stringArray(source.runtime?.allowedResponsePatterns),
      failOnConsoleError: source.runtime?.failOnConsoleError !== false,
      failOnPageError: source.runtime?.failOnPageError !== false,
      failOnRequestFailure: Boolean(source.runtime?.failOnRequestFailure ?? false),
      failOnHttpError: Boolean(source.runtime?.failOnHttpError ?? false)
    },
    capture: {
      // Capture driver selector: absent = playwright (web, the default);
      // ios-sim|android select the mobile matrix drivers (xcrun simctl / adb).
      // The key is injected ONLY for mobile drivers — never as an explicit
      // 'playwright' — so pre-mobile web configs serialize byte-identical to
      // before the mobile wiring and their configHash (provenance.mjs) does not
      // churn on upgrade. Consumers (vision-loop.mjs, run-summary.mjs) default
      // a missing type to 'playwright', so unknown typo values also degrade to
      // the web pipeline.
      ...(['ios-sim', 'android'].includes(source.capture?.type) ? { type: source.capture.type } : {}),
      fullPage: source.capture?.fullPage !== false,
      animations: String(source.capture?.animations ?? 'disabled'),
      caret: String(source.capture?.caret ?? 'hide'),
      waitForFonts: source.capture?.waitForFonts !== false,
      waitForImages: source.capture?.waitForImages !== false,
      waitUntil: String(source.capture?.waitUntil ?? 'domcontentloaded'),
      settleMs: Number(source.capture?.settleMs ?? 250),
      maskColor: String(source.capture?.maskColor ?? '#ff00ff'),
      hideSelectors: stringArray(source.capture?.hideSelectors),
      style: source.capture?.style ? String(source.capture.style) : null
    },
    // Mobile capture matrix — consumed when capture.type is ios-sim or
    // android. Cases ride through the web artifact layout with identity
    // { routeName: label, viewportName: 'mobile', stateName: key } (see
    // lib/mobile-capture-engine.mjs). Per-case udid/serial override the
    // device-level defaults; adbPath (null → engine default 'adb' on PATH)
    // lets hosts point at a specific adb binary.
    mobile: {
      udid: source.mobile?.udid ? String(source.mobile.udid) : 'booted',
      serial: source.mobile?.serial ? String(source.mobile.serial) : 'emulator-5554',
      adbPath: source.mobile?.adbPath ? String(source.mobile.adbPath) : null,
      // Device matrix — explicit whitelist parse in the same style as cases
      // below. platform defaults to 'ios-sim' and unknown values degrade to it,
      // mirroring capture.type's defensive handling (the capture engine
      // resolves the effective driver per run).
      devices: Array.isArray(source.mobile?.devices)
        ? source.mobile.devices.map((d) => ({
            key: String(d.key ?? d.label ?? 'device'),
            label: d.label ? String(d.label) : null,
            udid: d.udid ? String(d.udid) : null,
            serial: d.serial ? String(d.serial) : null,
            platform: ['ios-sim', 'android'].includes(d.platform) ? d.platform : 'ios-sim'
          }))
        : [],
      cases: Array.isArray(source.mobile?.cases)
        ? source.mobile.cases.map((c) => ({
            key: String(c.key ?? c.label ?? 'case'),
            label: String(c.label ?? c.key ?? 'case'),
            bundleId: c.bundleId ? String(c.bundleId) : null,
            launchActivity: c.launchActivity ? String(c.launchActivity) : null,
            openUrl: c.openUrl ? String(c.openUrl) : null,
            settleMs: Number.isFinite(Number(c.settleMs)) ? Number(c.settleMs) : 1000,
            udid: c.udid ? String(c.udid) : null,
            serial: c.serial ? String(c.serial) : null,
            // Subset of mobile.devices keys this case runs on; absent, null,
            // or empty all mean "every device" (one null sentinel, so fan-out
            // logic never handles two spellings). Unknown keys are rejected in
            // validateConfig (device matrix guards below).
            devices: Array.isArray(c.devices) && c.devices.length ? c.devices.map(String) : null,
            // PNG-space ignore rectangles consumed by compare-engine
            // (applyMasks); normalized by the shared web mask pipeline.
            masks: normalizeMobileMasks(c.masks),
            // Region contracts pass through raw; mobile captures produce no
            // DOM-region metadata, so they are compare-time metadata only.
            regions: Array.isArray(c.regions) ? c.regions : []
          }))
        : [],
      judge: {
        thresholds: source.mobile?.judge?.thresholds && typeof source.mobile.judge.thresholds === 'object'
          ? clone(source.mobile.judge.thresholds)
          : {}
      }
    },
    diff: {
      threshold: Number(source.diff?.threshold ?? 0.1),
      includeAA: Boolean(source.diff?.includeAA ?? false),
      alpha: Number(source.diff?.alpha ?? 0.15),
      maxMismatchRatio: Number(source.diff?.maxMismatchRatio ?? 0.005),
      majorMismatchRatio: Number(source.diff?.majorMismatchRatio ?? 0.02),
      failOnMissingReference: source.diff?.failOnMissingReference !== false,
      regionTolerancePx: Number(source.diff?.regionTolerancePx ?? 2),
      perceptual: {
        enabled: source.diff?.perceptual?.enabled !== false,
        gridSize: Number(source.diff?.perceptual?.gridSize ?? 16),
        minSimilarity: Number(source.diff?.perceptual?.minSimilarity ?? 0.97),
        blockerSimilarity: Number(source.diff?.perceptual?.blockerSimilarity ?? 0.85)
      }
    },
    accessibility: {
      enabled: source.accessibility?.enabled !== false,
      tags: stringArray(source.accessibility?.tags, ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']),
      disabledRules: stringArray(source.accessibility?.disabledRules),
      failImpacts: stringArray(source.accessibility?.failImpacts, ['critical', 'serious']),
      excludeSelectors: stringArray(source.accessibility?.excludeSelectors),
      keyboardProbeLimit: Number(source.accessibility?.keyboardProbeLimit ?? 20),
      failOnInvisibleFocus: source.accessibility?.failOnInvisibleFocus !== false,
      failOnOffscreenFocus: Boolean(source.accessibility?.failOnOffscreenFocus ?? false)
    },
    inspection: {
      enabled: source.inspection?.enabled !== false,
      selectors: stringArray(source.inspection?.selectors, DEFAULT_INSPECTION_SELECTORS),
      maxElements: Number(source.inspection?.maxElements ?? 500),
      overlapProbeLimit: Number(source.inspection?.overlapProbeLimit ?? 300)
    },
    interaction: {
      enabled: source.interaction?.enabled !== false,
      selector: String(source.interaction?.selector ?? 'a[href],button,input,select,textarea,summary,[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"],[role="tab"],[tabindex]:not([tabindex="-1"])'),
      maxElements: Number(source.interaction?.maxElements ?? 1000),
      minTargetWidth: Number(source.interaction?.minTargetWidth ?? 24),
      minTargetHeight: Number(source.interaction?.minTargetHeight ?? 24),
      maxTargetSizeViolations: Number(source.interaction?.maxTargetSizeViolations ?? 0),
      failOnMissingAccessibleName: source.interaction?.failOnMissingAccessibleName !== false,
      failOnNestedInteractive: source.interaction?.failOnNestedInteractive !== false,
      failOnDuplicateIds: source.interaction?.failOnDuplicateIds !== false
    },
    stateCrawler: {
      enabled: Boolean(source.stateCrawler?.enabled ?? false),
      selector: String(source.stateCrawler?.selector ?? 'a[href],button,input,select,textarea,summary,[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])'),
      maxElements: Number(source.stateCrawler?.maxElements ?? 30),
      captureElementScreenshots: Boolean(source.stateCrawler?.captureElementScreenshots ?? false)
    },
    performance: {
      enabled: source.performance?.enabled !== false,
      failOnWarnings: Boolean(source.performance?.failOnWarnings ?? false),
      budgets: normalizeBudgetMap(source.performance?.budgets ?? DEFAULT_PERFORMANCE_BUDGETS)
    },
    tokens: {
      enabled: source.tokens?.enabled !== false,
      selectors: stringArray(source.tokens?.selectors, DEFAULT_TOKEN_SELECTORS),
      maxElements: Number(source.tokens?.maxElements ?? 1500),
      maxDriftScore: Number(source.tokens?.maxDriftScore ?? 20)
    },
    breakpoints: {
      enabled: Boolean(source.breakpoints?.enabled ?? false),
      minWidth: Number(source.breakpoints?.minWidth ?? 320),
      maxWidth: Number(source.breakpoints?.maxWidth ?? 1600),
      step: Number(source.breakpoints?.step ?? 40),
      height: Number(source.breakpoints?.height ?? 900),
      selectors: stringArray(source.breakpoints?.selectors, DEFAULT_BREAKPOINT_SELECTORS)
    },
    quality: {
      minScore: Number(source.quality?.minScore ?? 85),
      minConfidence: Number(source.quality?.minConfidence ?? 85),
      failOnAnyGateFailure: source.quality?.failOnAnyGateFailure !== false,
      weights: { ...DEFAULT_GATE_WEIGHTS, ...(source.quality?.weights ?? {}) }
    },
    baseline: {
      enabled: source.baseline?.enabled ?? String(source.mode ?? 'brand-consistent') === 'exact-reference',
      requireApprovalMetadata: source.baseline?.requireApprovalMetadata !== false,
      approvedBy: source.baseline?.approvedBy ? String(source.baseline.approvedBy) : null,
      reason: source.baseline?.reason ? String(source.baseline.reason) : null
    },
    manualReview: {
      path: source.manualReview?.path ? String(source.manualReview.path) : null,
      minScore: Number(source.manualReview?.minScore ?? 85),
      maxAgeHours: Number(source.manualReview?.maxAgeHours ?? 24),
      requireMatchingConfigHash: source.manualReview?.requireMatchingConfigHash !== false,
      weights: source.manualReview?.weights && typeof source.manualReview.weights === 'object' ? clone(source.manualReview.weights) : {}
    },
    aesthetics: {
      enabled: Boolean(source.aesthetics?.enabled ?? false),
      profilePath: source.aesthetics?.profilePath ? String(source.aesthetics.profilePath) : null,
      reviewPath: source.aesthetics?.reviewPath ? String(source.aesthetics.reviewPath) : null,
      measurementsPath: source.aesthetics?.measurementsPath ? String(source.aesthetics.measurementsPath) : null,
      minScore: Number(source.aesthetics?.minScore ?? 80),
      minConfidence: Number(source.aesthetics?.minConfidence ?? 70),
      dimensionFloor: Number(source.aesthetics?.dimensionFloor ?? 3),
      maxAgeHours: Number(source.aesthetics?.maxAgeHours ?? 24),
      requireReview: source.aesthetics?.requireReview !== false,
      requireTestEvidence: Boolean(source.aesthetics?.requireTestEvidence ?? false),
      requireMatchingConfigHash: source.aesthetics?.requireMatchingConfigHash !== false,
      weights: source.aesthetics?.weights && typeof source.aesthetics.weights === 'object' ? clone(source.aesthetics.weights) : {}
    },
    history: {
      enabled: source.history?.enabled !== false,
      maxRecords: Number(source.history?.maxRecords ?? 100),
      stagnationWindow: Number(source.history?.stagnationWindow ?? 3),
      minMeaningfulDelta: Number(source.history?.minMeaningfulDelta ?? 0.5)
    },
    reports: {
      html: source.reports?.html !== false,
      markdown: source.reports?.markdown !== false,
      remediation: source.reports?.remediation !== false,
      provenance: source.reports?.provenance !== false
    },
    engineeringChecks: Array.isArray(source.engineeringChecks) ? source.engineeringChecks.map(normalizeEngineeringCheck) : [],
    routes: (source.routes ?? [{ name: 'home', path: '/' }]).map(normalizeRoute)
  };
}

function assertRange(value, label, min = 0, max = 1) {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`${label} must be between ${min} and ${max}.`);
}

function validateRegions(regions, context) {
  const names = new Set();
  for (const region of regions) {
    const name = region.name.toLowerCase();
    if (names.has(name)) throw new Error(`Duplicate region name in ${context}: ${region.name}`);
    names.add(name);
  }
}

export function validateConfig(config) {
  const allowedModes = new Set(['exact-reference', 'brand-consistent', 'original-direction']);
  if (!allowedModes.has(config.mode)) throw new TypeError(`mode must be one of: ${[...allowedModes].join(', ')}.`);
  for (const [label, value] of [['baseUrl', config.baseUrl], ['referenceBaseUrl', config.referenceBaseUrl]]) {
    if (!value) continue;
    let parsed;
    try { parsed = new URL(value); } catch { throw new TypeError(`${label} is not a valid URL: ${value}`); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new TypeError(`${label} must use http or https.`);
  }
  if (!Array.isArray(config.routes) || config.routes.length === 0) throw new TypeError('At least one route is required.');

  const routeNames = new Set(); const keys = new Set();
  for (const route of config.routes) {
    const routeName = route.name.toLowerCase();
    if (routeNames.has(routeName)) throw new Error(`Duplicate route name: ${route.name}`);
    routeNames.add(routeName);
    validateRegions(route.regions, `route ${route.name}`);
    const viewportNames = new Set(); const stateNames = new Set();
    for (const viewport of route.viewports) {
      const name = viewport.name.toLowerCase();
      if (viewportNames.has(name)) throw new Error(`Duplicate viewport name in ${route.name}: ${viewport.name}`);
      viewportNames.add(name);
      if (viewport.deviceScaleFactor !== null && (!Number.isFinite(viewport.deviceScaleFactor) || viewport.deviceScaleFactor < 0.5 || viewport.deviceScaleFactor > 4)) throw new RangeError(`Invalid deviceScaleFactor for ${viewport.name}.`);
    }
    for (const state of route.states) {
      const name = state.name.toLowerCase();
      if (stateNames.has(name)) throw new Error(`Duplicate state name in ${route.name}: ${state.name}`);
      stateNames.add(name);
      validateActions(state.actions);
      validateRegions([...route.regions, ...state.regions], `route ${route.name} state ${state.name}`);
      for (const cookie of state.cookies) if (!cookie || typeof cookie.name !== 'string' || typeof cookie.value !== 'string') throw new TypeError(`State ${state.name} cookies require string name and value.`);
    }
    for (const viewport of route.viewports) for (const state of route.states) {
      const key = artifactKey({ routeName: route.name, viewportName: viewport.name, stateName: state.name });
      if (keys.has(key)) throw new Error(`Duplicate artifact identity: ${key}`);
      keys.add(key);
    }
  }

  // Mobile matrix guards. capture.type is absent for web configs (consumers
  // default it to 'playwright'), so resolve the effective driver the same way.
  const captureType = config.capture.type ?? 'playwright';
  if (captureType !== 'playwright' && config.mobile.cases.length === 0) {
    throw new TypeError(`At least one mobile case (mobile.cases) is required when capture.type is ${captureType}.`);
  }
  // Mirror the web duplicate-identity rule above: mobile cases ride the web
  // artifact layout as { routeName: label, viewportName: 'mobile', stateName:
  // key } (lib/mobile-capture-engine.mjs), and safeSegment can collapse
  // distinct cases ('My Case' ≡ 'my-case') onto one artifact — without this
  // check the later case would silently overwrite the earlier one's evidence.
  const mobileCaseIdentity = new Set();
  for (const mobileCase of config.mobile.cases) {
    const key = artifactKey({ routeName: mobileCase.label, viewportName: 'mobile', stateName: mobileCase.key });
    if (mobileCaseIdentity.has(key)) {
      throw new Error(`Duplicate mobile case artifact identity: ${key} (case label "${mobileCase.label}", key "${mobileCase.key}")`);
    }
    mobileCaseIdentity.add(key);
  }

  // Device matrix guards. Duplicate device keys would collide on the
  // per-device artifact identity (viewportName = device.key) used by the
  // fan-out engines, and case.devices may only reference declared device
  // keys (absent/null means "every device").
  const mobileDeviceKeys = new Set();
  for (const device of config.mobile.devices) {
    if (mobileDeviceKeys.has(device.key)) throw new TypeError(`Duplicate mobile device key: ${device.key}`);
    mobileDeviceKeys.add(device.key);
  }
  for (const mobileCase of config.mobile.cases) {
    for (const deviceKey of mobileCase.devices ?? []) {
      if (!mobileDeviceKeys.has(deviceKey)) {
        throw new TypeError(`Mobile case "${mobileCase.key}" references unknown device key: ${deviceKey}`);
      }
    }
  }

  if (!['chromium', 'firefox', 'webkit'].includes(config.runtime.browser)) throw new TypeError('runtime.browser must be chromium, firefox, or webkit.');
  if (!['light', 'dark', 'no-preference'].includes(config.runtime.colorScheme)) throw new TypeError('runtime.colorScheme is invalid.');
  if (!['reduce', 'no-preference'].includes(config.runtime.reducedMotion)) throw new TypeError('runtime.reducedMotion is invalid.');
  if (!['disabled', 'allow'].includes(config.capture.animations)) throw new TypeError('capture.animations must be disabled or allow.');
  if (!['hide', 'initial'].includes(config.capture.caret)) throw new TypeError('capture.caret must be hide or initial.');
  if (!['load', 'domcontentloaded', 'networkidle', 'commit'].includes(config.capture.waitUntil)) throw new TypeError('capture.waitUntil is invalid.');
  for (const field of ['threshold', 'alpha', 'maxMismatchRatio', 'majorMismatchRatio']) assertRange(config.diff[field], `diff.${field}`);
  if (config.diff.majorMismatchRatio < config.diff.maxMismatchRatio) throw new RangeError('majorMismatchRatio must be >= maxMismatchRatio.');
  assertRange(config.diff.perceptual.minSimilarity, 'diff.perceptual.minSimilarity');
  assertRange(config.diff.perceptual.blockerSimilarity, 'diff.perceptual.blockerSimilarity');
  if (config.diff.perceptual.blockerSimilarity > config.diff.perceptual.minSimilarity) throw new RangeError('diff.perceptual.blockerSimilarity must be <= minSimilarity.');
  if (!Number.isInteger(config.diff.perceptual.gridSize) || config.diff.perceptual.gridSize < 2 || config.diff.perceptual.gridSize > 64) throw new RangeError('diff.perceptual.gridSize must be an integer from 2 to 64.');
  if (!Number.isFinite(config.diff.regionTolerancePx) || config.diff.regionTolerancePx < 0) throw new RangeError('diff.regionTolerancePx must be non-negative.');

  for (const field of ['minScore', 'minConfidence']) assertRange(config.quality[field], `quality.${field}`, 0, 100);
  for (const [name, weight] of Object.entries(config.quality.weights)) if (!Number.isFinite(Number(weight)) || Number(weight) < 0) throw new RangeError(`quality.weights.${name} must be non-negative.`);

  if (!Number.isInteger(config.inspection.maxElements) || config.inspection.maxElements <= 0) throw new RangeError('inspection.maxElements must be a positive integer.');
  if (!Number.isInteger(config.interaction.maxElements) || config.interaction.maxElements <= 0) throw new RangeError('interaction.maxElements must be a positive integer.');
  for (const field of ['minTargetWidth', 'minTargetHeight']) if (!Number.isFinite(config.interaction[field]) || config.interaction[field] <= 0) throw new RangeError(`interaction.${field} must be positive.`);
  if (!Number.isInteger(config.interaction.maxTargetSizeViolations) || config.interaction.maxTargetSizeViolations < 0) throw new RangeError('interaction.maxTargetSizeViolations must be a non-negative integer.');
  if (!Number.isInteger(config.stateCrawler.maxElements) || config.stateCrawler.maxElements <= 0) throw new RangeError('stateCrawler.maxElements must be a positive integer.');

  for (const [metric, budget] of Object.entries(config.performance.budgets)) {
    if (budget === null) continue;
    if (!Number.isFinite(budget.max) || budget.max < 0) throw new RangeError(`performance.budgets.${metric}.max must be non-negative.`);
    if (!Number.isFinite(budget.weight) || budget.weight <= 0) throw new RangeError(`performance.budgets.${metric}.weight must be positive.`);
  }
  if (!Number.isInteger(config.tokens.maxElements) || config.tokens.maxElements <= 0) throw new RangeError('tokens.maxElements must be a positive integer.');
  assertRange(config.tokens.maxDriftScore, 'tokens.maxDriftScore', 0, 100);
  if (!Number.isFinite(config.breakpoints.minWidth) || !Number.isFinite(config.breakpoints.maxWidth) || config.breakpoints.maxWidth < config.breakpoints.minWidth) throw new RangeError('breakpoints.maxWidth must be >= minWidth.');
  if (!Number.isFinite(config.breakpoints.step) || config.breakpoints.step < 8) throw new RangeError('breakpoints.step must be at least 8.');
  assertRange(config.manualReview.minScore, 'manualReview.minScore', 0, 100);
  if (!Number.isFinite(config.manualReview.maxAgeHours) || config.manualReview.maxAgeHours < 0) throw new RangeError('manualReview.maxAgeHours must be non-negative.');
  for (const field of ['minScore', 'minConfidence']) assertRange(config.aesthetics[field], `aesthetics.${field}`, 0, 100);
  assertRange(config.aesthetics.dimensionFloor, 'aesthetics.dimensionFloor', 0, 5);
  if (!Number.isFinite(config.aesthetics.maxAgeHours) || config.aesthetics.maxAgeHours < 0) throw new RangeError('aesthetics.maxAgeHours must be non-negative.');
  if (config.aesthetics.enabled && !config.aesthetics.profilePath) throw new Error('aesthetics.enabled requires aesthetics.profilePath so the declared direction can be verified.');
  for (const [name, weight] of Object.entries(config.aesthetics.weights)) if (!Number.isFinite(Number(weight)) || Number(weight) < 0) throw new RangeError(`aesthetics.weights.${name} must be non-negative.`);
  if (!Number.isInteger(config.history.maxRecords) || config.history.maxRecords < 2) throw new RangeError('history.maxRecords must be an integer >= 2.');
  if (!Number.isInteger(config.history.stagnationWindow) || config.history.stagnationWindow < 2) throw new RangeError('history.stagnationWindow must be an integer >= 2.');
  if (!Number.isFinite(config.history.minMeaningfulDelta) || config.history.minMeaningfulDelta <= 0) throw new RangeError('history.minMeaningfulDelta must be positive.');
  return config;
}

function routeUrl(baseUrl, routePath, query) {
  const url = /^https?:\/\//.test(routePath) ? new URL(routePath) : new URL(routePath, baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      url.searchParams.delete(key);
      for (const item of value) url.searchParams.append(key, String(item));
    } else url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function enumerateCases(config, filters = {}) {
  const mode = filters.mode ?? 'current';
  const baseUrl = filters.baseUrl ?? (mode === 'reference' ? (config.referenceBaseUrl ?? config.baseUrl) : config.baseUrl);
  const cases = [];
  for (const route of config.routes) for (const viewport of route.viewports) for (const state of route.states) {
    const item = {
      key: artifactKey({ routeName: route.name, viewportName: viewport.name, stateName: state.name }),
      mode,
      routeName: route.name,
      viewportName: viewport.name,
      stateName: state.name,
      route,
      viewport,
      state,
      url: routeUrl(baseUrl, mode === 'reference' ? (route.referencePath ?? route.path) : route.path, state.query),
      readySelector: state.readySelector ?? route.readySelector ?? route.waitFor,
      readyScript: state.readyScript ?? route.readyScript,
      settleMs: state.settleMs ?? route.settleMs ?? config.capture.settleMs,
      waitUntil: route.waitUntil ?? config.capture.waitUntil,
      maskSelectors: [...route.maskSelectors, ...state.maskSelectors],
      inspectSelectors: [...config.inspection.selectors, ...route.inspectSelectors, ...state.inspectSelectors],
      masks: [...route.masks, ...state.masks],
      regions: [...route.regions, ...state.regions]
    };
    if (filters.case && item.key !== String(filters.case)) continue;
    if (filters.route && ![item.routeName, route.path].includes(String(filters.route))) continue;
    if (filters.viewport && item.viewportName !== String(filters.viewport)) continue;
    if (filters.state && item.stateName !== String(filters.state)) continue;
    cases.push(item);
  }
  return cases;
}

export async function loadConfig(configPath = 'vision-loop.config.json') {
  const absolute = path.resolve(configPath);
  let source;
  try { source = JSON.parse(await fs.readFile(absolute, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Config file not found: ${absolute}`);
    if (error instanceof SyntaxError) throw new Error(`Config file is not valid JSON: ${absolute}\n${error.message}`);
    throw error;
  }
  return validateConfig(normalizeConfig(source, absolute));
}
