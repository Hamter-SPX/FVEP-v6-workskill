import crypto from 'node:crypto';
import path from 'node:path';
import { artifactPaths } from './artifacts.mjs';
import { runCaseMatrix } from './browser-runner.mjs';
import { ensureParent, writeJsonAtomic } from './io.mjs';
import { resolvePageRegions } from './region-engine.mjs';

export async function captureAll(config, { mode = 'current', baseUrl, headed = false, filters = {} } = {}) {
  if (!['current', 'reference'].includes(mode)) throw new TypeError('Capture mode must be current or reference.');
  return runCaseMatrix(config, async ({ page, caseDefinition, runtimeEvents, navigation }) => {
    const paths = artifactPaths(config.outputDir, caseDefinition);
    const screenshotPath = mode === 'reference' ? paths.referencePng : paths.currentPng;
    const metadataPath = mode === 'reference' ? paths.referenceCaptureJson : paths.currentCaptureJson;
    await ensureParent(screenshotPath);
    const mask = caseDefinition.maskSelectors.map((selector) => page.locator(selector));
    const regions = await resolvePageRegions(page, caseDefinition.regions, { fullPage: config.capture.fullPage });
    const screenshotBuffer = await page.screenshot({
      path: screenshotPath,
      fullPage: config.capture.fullPage,
      animations: config.capture.animations,
      caret: config.capture.caret,
      mask,
      maskColor: config.capture.maskColor
    });
    const documentEvidence = await page.evaluate(() => ({
      viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
      document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
      scroll: { x: window.scrollX, y: window.scrollY },
      devicePixelRatio: window.devicePixelRatio,
      fontStatus: document.fonts?.status ?? null,
      fonts: document.fonts ? [...document.fonts].map((font) => ({ family: font.family, style: font.style, weight: font.weight, status: font.status })).slice(0, 200) : [],
      imageCount: document.images.length,
      brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => ({ src: image.currentSrc || image.src, alt: image.alt })).slice(0, 100)
    }));
    const unresolvedRequiredRegions = regions.filter((region) => region.required && region.status !== 'resolved');
    const metadata = {
      schemaVersion: 2,
      mode,
      key: caseDefinition.key,
      route: caseDefinition.routeName,
      viewport: caseDefinition.viewport,
      state: caseDefinition.stateName,
      url: page.url(),
      title: await page.title(),
      navigation,
      maskSelectors: caseDefinition.maskSelectors,
      rectangularDiffMasks: caseDefinition.masks,
      regions,
      unresolvedRequiredRegions,
      documentEvidence,
      screenshotPath,
      screenshotSha256: crypto.createHash('sha256').update(screenshotBuffer).digest('hex'),
      screenshotBytes: screenshotBuffer.length,
      capturedAt: new Date().toISOString(),
      runtimeEvents
    };
    await writeJsonAtomic(metadataPath, metadata);
    return {
      screenshotPath,
      metadataPath,
      relativeScreenshot: path.relative(config.outputDir, screenshotPath),
      regionCount: regions.length,
      unresolvedRequiredRegionCount: unresolvedRequiredRegions.length,
      ok: unresolvedRequiredRegions.length === 0
    };
  }, { mode, baseUrl, headed, filters, label: `capture-${mode}` });
}
