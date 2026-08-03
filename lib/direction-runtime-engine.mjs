/**
 * Direction runtime adapter — classify the host (Cursor / Codex / CLI / CI)
 * and choose how to present visual options 1–2–3 without inventing images.
 *
 * Node cannot see the agent's tool list. Detection is best-effort from env,
 * plus explicit overrides the agent MUST set when it knows ImageGen presence.
 */

export const HOSTS = Object.freeze(['cursor', 'codex', 'cli', 'ci', 'unknown']);

export const PRESENTATION_MODES = Object.freeze({
  INLINE_AND_GALLERY: 'inline-and-gallery',
  GALLERY_ONLY: 'gallery-only',
  PROSE_GAP: 'prose-with-gap',
  CI_GATE_ONLY: 'ci-gate-only'
});

function truthy(value) {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const text = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on', 'likely'].includes(text)) return true;
  if (['0', 'false', 'no', 'off', 'none', 'unavailable'].includes(text)) return false;
  return null;
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

/**
 * Best-effort host classification from environment variables.
 */
export function detectHostRuntime(env = process.env, overrides = {}) {
  if (overrides.host && HOSTS.includes(String(overrides.host))) {
    return {
      host: String(overrides.host),
      signals: [`override:host=${overrides.host}`],
      confidence: 'high'
    };
  }

  const signals = [];
  const cursor = Boolean(
    env.CURSOR_VERSION
    || env.CURSOR_PROJECT_DIR
    || env.CURSOR_AGENT
    || env.CURSOR_TRACE_ID
    || env.CURSOR_WORKSPACE_LABEL
  );
  if (env.CURSOR_VERSION) signals.push('CURSOR_VERSION');
  if (env.CURSOR_PROJECT_DIR) signals.push('CURSOR_PROJECT_DIR');
  if (env.CURSOR_AGENT) signals.push('CURSOR_AGENT');
  if (env.CURSOR_TRACE_ID) signals.push('CURSOR_TRACE_ID');

  const codex = Boolean(
    env.CODEX_HOME
    || env.CODEX_THREAD_ID
    || env.CODEX_SANDBOX
    || env.CODEX_SANDBOX_NETWORK
    || env.OPENAI_CODEX
  );
  if (env.CODEX_HOME) signals.push('CODEX_HOME');
  if (env.CODEX_THREAD_ID) signals.push('CODEX_THREAD_ID');
  if (env.CODEX_SANDBOX || env.CODEX_SANDBOX_NETWORK) signals.push('CODEX_SANDBOX');

  const ci = Boolean(env.CI === 'true' || env.CI === '1' || env.GITHUB_ACTIONS === 'true');
  if (ci) signals.push(env.GITHUB_ACTIONS === 'true' ? 'GITHUB_ACTIONS' : 'CI');

  if (cursor && !codex) {
    return { host: 'cursor', signals, confidence: 'high', version: env.CURSOR_VERSION ?? null };
  }
  if (codex && !cursor) {
    return { host: 'codex', signals, confidence: 'high', version: null };
  }
  if (cursor && codex) {
    // Prefer Cursor when both appear (Cursor may nest Codex-compatible vars).
    return { host: 'cursor', signals, confidence: 'medium', version: env.CURSOR_VERSION ?? null };
  }
  if (ci) {
    return { host: 'ci', signals, confidence: 'high', version: null };
  }
  return {
    host: 'cli',
    signals: signals.length ? signals : ['fallback:cli'],
    confidence: 'medium',
    version: null
  };
}

function hostDefaults(host) {
  switch (host) {
    case 'cursor':
      return {
        imageGeneration: null, // agent must confirm GenerateImage is in the tool list
        imageGenerationHint: 'likely',
        inlineImages: true,
        browserGallery: true,
        imageTool: 'GenerateImage',
        referenceImagesSupported: true
      };
    case 'codex':
      return {
        imageGeneration: null,
        imageGenerationHint: 'maybe',
        inlineImages: null, // some Codex surfaces show media; some are text-only
        inlineImagesHint: 'maybe',
        browserGallery: true,
        imageTool: 'imagegen',
        referenceImagesSupported: true
      };
    case 'ci':
      return {
        imageGeneration: false,
        imageGenerationHint: 'unavailable',
        inlineImages: false,
        browserGallery: false,
        imageTool: null,
        referenceImagesSupported: false
      };
    case 'cli':
    case 'unknown':
    default:
      return {
        imageGeneration: false,
        imageGenerationHint: 'unavailable',
        inlineImages: false,
        browserGallery: true,
        imageTool: null,
        referenceImagesSupported: false
      };
  }
}

/**
 * Resolve concrete capability booleans from host defaults + overrides + env.
 *
 * Override / env keys:
 * - imageGeneration / DIRECTION_IMAGE_GEN / FVL_IMAGE_GEN
 * - inlineImages / DIRECTION_INLINE_IMAGES / FVL_INLINE_IMAGES
 * - browserGallery / DIRECTION_BROWSER_GALLERY
 * - imageTool / DIRECTION_IMAGE_TOOL
 */
export function resolveDirectionCapabilities(hostInfo, overrides = {}, env = process.env) {
  const host = hostInfo?.host ?? 'unknown';
  const defaults = hostDefaults(host);

  const imageGenOverride = truthy(firstDefined(
    overrides.imageGeneration,
    overrides.imageGen,
    env.DIRECTION_IMAGE_GEN,
    env.FVL_IMAGE_GEN
  ));
  const inlineOverride = truthy(firstDefined(
    overrides.inlineImages,
    env.DIRECTION_INLINE_IMAGES,
    env.FVL_INLINE_IMAGES
  ));
  const galleryOverride = truthy(firstDefined(
    overrides.browserGallery,
    env.DIRECTION_BROWSER_GALLERY,
    env.FVL_BROWSER_GALLERY
  ));

  const imageGeneration = imageGenOverride === null
    ? (defaults.imageGeneration === false ? false : null)
    : imageGenOverride;
  const inlineImages = inlineOverride === null
    ? (defaults.inlineImages === false ? false : defaults.inlineImages === true ? true : null)
    : inlineOverride;
  const browserGallery = galleryOverride === null
    ? defaults.browserGallery
    : galleryOverride;

  const imageTool = firstDefined(
    overrides.imageTool,
    env.DIRECTION_IMAGE_TOOL,
    defaults.imageTool
  ) ?? null;

  const known = imageGeneration !== null;
  const canGenerate = imageGeneration === true;
  const cannotGenerate = imageGeneration === false;

  return {
    host,
    imageGeneration,
    imageGenerationHint: defaults.imageGenerationHint,
    inlineImages,
    inlineImagesHint: defaults.inlineImagesHint ?? (inlineImages === true ? 'yes' : inlineImages === false ? 'no' : 'unknown'),
    browserGallery,
    imageTool: canGenerate || imageGeneration === null ? imageTool : null,
    referenceImagesSupported: defaults.referenceImagesSupported === true && (canGenerate || imageGeneration === null),
    known,
    canGenerate,
    cannotGenerate,
    needsAgentConfirmation: imageGeneration === null || inlineImages === null
  };
}

/**
 * Choose presentation mode and concrete agent steps.
 */
export function planDirectionPresentation(capabilities, options = {}) {
  const gaps = [];
  const steps = [];
  const warnings = [];
  const referenceAttached = options.referenceAttached !== false;
  if (options.referenceAttached === false) {
    gaps.push({
      code: 'REFERENCE_SCREENSHOT_MISSING',
      message: 'User could not attach a reference screenshot — invent distinct theses from the description and record referenceNote.'
    });
  }

  const host = capabilities.host;
  if (host === 'ci' || options.forceMode === PRESENTATION_MODES.CI_GATE_ONLY) {
    return {
      mode: PRESENTATION_MODES.CI_GATE_ONLY,
      title: 'CI / no exploration',
      steps: [
        'Do not run ImageGen exploration in CI.',
        'Require an already-confirmed design/visual-direction-spec.md.',
        'Run: npm run direction:gate -- --check-sync'
      ],
      gaps: [{
        code: 'CI_NO_IMAGEGEN',
        message: 'CI hosts do not generate direction images. Exploration must already be complete.'
      }],
      warnings,
      imageTool: null,
      openGallery: false,
      showInline: false,
      allowProseFallback: false
    };
  }

  if (capabilities.cannotGenerate || options.forceMode === PRESENTATION_MODES.PROSE_GAP) {
    gaps.push({
      code: 'IMAGEGEN_UNAVAILABLE',
      message: 'Image generation is unavailable on this runtime. Do not pretend pictures exist.'
    });
    steps.push('Draft 2–3 numbered prose theses that differ on at least two personality axes.');
    steps.push('State the verification gap explicitly: ImageGen unavailable on this host.');
    if (capabilities.browserGallery) {
      steps.push('Optional: npm run direction:gallery with thesis cards and image-pending placeholders.');
      steps.push('Open the gallery only as a thesis board — label images as pending.');
    }
    steps.push('Stop and wait for a numbered choice, then write visual-direction-spec.md.');
    return {
      mode: PRESENTATION_MODES.PROSE_GAP,
      title: 'Prose options with explicit ImageGen gap',
      steps,
      gaps,
      warnings,
      imageTool: null,
      openGallery: capabilities.browserGallery === true,
      showInline: false,
      allowProseFallback: true
    };
  }

  if (capabilities.canGenerate && capabilities.inlineImages === true) {
    steps.push(`Generate one image per thesis with ${capabilities.imageTool ?? 'the host image tool'}.`);
    if (capabilities.referenceImagesSupported && referenceAttached) {
      steps.push('Pass reference screenshot path(s) into the image tool when supported.');
    }
    steps.push('Show options 1 / 2 / 3 inline in chat.');
    if (capabilities.browserGallery) {
      steps.push('Also write npm run direction:gallery so the user can compare side-by-side in a browser.');
    }
    steps.push('Stop for the numbered choice. Do not write the direction spec until they pick.');
    return {
      mode: PRESENTATION_MODES.INLINE_AND_GALLERY,
      title: 'Inline images (+ optional browser gallery)',
      steps,
      gaps,
      warnings,
      imageTool: capabilities.imageTool,
      openGallery: capabilities.browserGallery === true,
      showInline: true,
      allowProseFallback: false
    };
  }

  if (capabilities.canGenerate && (capabilities.inlineImages === false || capabilities.inlineImages === null)) {
    if (capabilities.inlineImages === null) {
      warnings.push({
        code: 'INLINE_IMAGES_UNKNOWN',
        message: 'Inline chat images are unverified — prefer the browser gallery so options stay visible as pictures.'
      });
    } else {
      gaps.push({
        code: 'INLINE_IMAGES_UNAVAILABLE',
        message: 'Chat cannot display images — use the browser gallery instead of prose-only.'
      });
    }
    steps.push(`Generate one image per thesis with ${capabilities.imageTool ?? 'the host image tool'} and save under design/direction-options/.`);
    steps.push('Run: npm run direction:gallery -- --option \'N|thesis|path.png\' (repeat for 1–3).');
    steps.push('Paste the file:// link in chat and stop for a numbered choice.');
    steps.push('Do not fall back to prose-only while the image files exist.');
    return {
      mode: PRESENTATION_MODES.GALLERY_ONLY,
      title: 'Browser gallery (chat cannot show images)',
      steps,
      gaps,
      warnings,
      imageTool: capabilities.imageTool,
      openGallery: true,
      showInline: false,
      allowProseFallback: false
    };
  }

  // ImageGen unknown — ask the agent to confirm tools, default to safe prose+gap unless Cursor hint says likely.
  warnings.push({
    code: 'IMAGEGEN_UNCONFIRMED',
    message: 'ImageGen availability is unconfirmed. If the host exposes GenerateImage/imagegen, re-run with --image-gen true; otherwise keep --image-gen false.'
  });
  if (capabilities.imageGenerationHint === 'likely') {
    steps.push(`Likely host tool: ${capabilities.imageTool ?? 'GenerateImage'} — attempt generation if the tool is in your available tool list.`);
    steps.push('If the tool is missing or fails, switch immediately to prose-with-gap and record IMAGEGEN_UNAVAILABLE.');
    steps.push('When images exist but chat cannot show them, open npm run direction:gallery.');
  } else {
    steps.push('Do not invent images. Present numbered prose theses and record IMAGEGEN_UNAVAILABLE until --image-gen true is set.');
    if (capabilities.browserGallery) {
      steps.push('Optional placeholder gallery via npm run direction:gallery.');
    }
  }
  steps.push('Stop for a numbered choice, then write visual-direction-spec.md.');

  return {
    mode: capabilities.imageGenerationHint === 'likely'
      ? PRESENTATION_MODES.INLINE_AND_GALLERY
      : PRESENTATION_MODES.PROSE_GAP,
    title: capabilities.imageGenerationHint === 'likely'
      ? 'Attempt ImageGen (confirm tool first)'
      : 'Prose options until ImageGen is confirmed',
    steps,
    gaps,
    warnings,
    imageTool: capabilities.imageTool,
    openGallery: capabilities.browserGallery === true,
    showInline: capabilities.inlineImages === true,
    allowProseFallback: capabilities.imageGenerationHint !== 'likely',
    unconfirmed: true
  };
}

/**
 * Full adapter entry: detect host → capabilities → presentation plan.
 */
export function resolveDirectionRuntime(options = {}) {
  const env = options.env ?? process.env;
  const overrides = options.overrides ?? {};
  const hostInfo = detectHostRuntime(env, overrides);
  const capabilities = resolveDirectionCapabilities(hostInfo, overrides, env);
  const presentation = planDirectionPresentation(capabilities, {
    referenceAttached: options.referenceAttached,
    forceMode: options.forceMode
  });

  return {
    schemaVersion: 1,
    ok: true,
    detectedAt: new Date().toISOString(),
    host: hostInfo.host,
    hostConfidence: hostInfo.confidence,
    hostSignals: hostInfo.signals,
    hostVersion: hostInfo.version ?? null,
    capabilities,
    presentation,
    agentChecklist: [
      'Inspect your available tools before claiming ImageGen works.',
      'If GenerateImage / imagegen is present, pass --image-gen true (or DIRECTION_IMAGE_GEN=true).',
      'If the tool is absent or fails, pass --image-gen false and use prose-with-gap — never fake screenshots.',
      'If images exist but chat is text-only, open direction:gallery — do not drop to prose-only.',
      'After a numbered choice, write design/visual-direction-spec.md and wait for เริ่มเขียน | ปรับต่อ | เลือกใหม่.'
    ]
  };
}

export function formatDirectionRuntimeReport(report) {
  const lines = [
    `Direction runtime: ${report.host} (${report.hostConfidence})`,
    `Signals: ${(report.hostSignals ?? []).join(', ') || 'none'}`,
    `ImageGen: ${report.capabilities.imageGeneration === null ? `unconfirmed (hint: ${report.capabilities.imageGenerationHint})` : report.capabilities.imageGeneration}`,
    `Inline images: ${report.capabilities.inlineImages === null ? `unconfirmed (hint: ${report.capabilities.inlineImagesHint})` : report.capabilities.inlineImages}`,
    `Browser gallery: ${report.capabilities.browserGallery}`,
    `Image tool: ${report.capabilities.imageTool ?? 'none'}`,
    `Presentation mode: ${report.presentation.mode}`,
    `Title: ${report.presentation.title}`,
    'Steps:',
    ...report.presentation.steps.map((step) => `  - ${step}`),
    `Gaps: ${report.presentation.gaps.length}`,
    ...report.presentation.gaps.map((item) => `  - [${item.code}] ${item.message}`),
    `Warnings: ${report.presentation.warnings.length}`,
    ...report.presentation.warnings.map((item) => `  - [${item.code}] ${item.message}`)
  ];
  return `${lines.join('\n')}\n`;
}
