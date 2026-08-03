import path from 'node:path';

export function safeSegment(value) {
  const normalized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  return normalized || 'unnamed';
}

export function artifactKey({ routeName, viewportName, stateName }) {
  return [routeName, viewportName, stateName].map(safeSegment).join('__');
}

export function artifactPaths(outputDir, identity) {
  const root = path.resolve(outputDir);
  const key = artifactKey(identity);
  const under = (folder, filename) => {
    const candidate = path.resolve(root, folder, filename);
    if (!candidate.startsWith(`${root}${path.sep}`)) throw new Error(`Unsafe artifact path: ${candidate}`);
    return candidate;
  };
  return {
    referencePng: under('reference', `${key}.png`),
    currentPng: under('current', `${key}.png`),
    diffPng: under('diff', `${key}.png`),
    currentCaptureJson: under('metadata', `${key}.current.capture.json`),
    referenceCaptureJson: under('metadata', `${key}.reference.capture.json`),
    inspectionJson: under('inspection', `${key}.dom.json`),
    accessibilityJson: under('accessibility', `${key}.axe.json`),
    performanceJson: under('performance', `${key}.performance.json`),
    interactionJson: under('interaction', `${key}.interaction.json`),
    stateCrawlerJson: under('state-crawler', `${key}.states.json`),
    currentTokensJson: under('tokens', `${key}.current.tokens.json`),
    referenceTokensJson: under('tokens', `${key}.reference.tokens.json`),
    runtimeJson: under('runtime', `${key}.runtime.json`)
  };
}

export function runtimeEvidencePath(outputDir, identity, label = 'run') {
  const root = path.resolve(outputDir);
  const filename = `${artifactKey(identity)}.${safeSegment(label)}.runtime.json`;
  const candidate = path.resolve(root, 'runtime', filename);
  if (!candidate.startsWith(`${root}${path.sep}`)) throw new Error(`Unsafe runtime evidence path: ${candidate}`);
  return candidate;
}
