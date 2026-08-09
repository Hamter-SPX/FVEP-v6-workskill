import fs from 'node:fs/promises';
import path from 'node:path';
import { artifactPaths } from './artifacts.mjs';
import { enumerateCases } from './config.mjs';
import { classifyDiff, classifyPerceptual, dimensionsMatch, pointInRectangle, worstSeverity } from './diff-policy.mjs';
import { ensureParent, fileExists, relativeWebPath, writeJsonAtomic, writeTextAtomic } from './io.mjs';
import { renderComparisonReport, summarizeComparisons } from './report.mjs';
import { comparePerceptualSignatures, createPerceptualSignature } from './perceptual-diff.mjs';
import { compareRegionGeometry } from './region-engine.mjs';

async function imageLibraries() {
  try {
    const [{ PNG }, pixelmatchModule] = await Promise.all([import('pngjs'), import('pixelmatch')]);
    return { PNG, pixelmatch: pixelmatchModule.default };
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') throw new Error('pixelmatch/pngjs are not installed. Run `npm install` inside the suite directory.');
    throw error;
  }
}

async function readJsonIfExists(file) {
  if (!await fileExists(file)) return null;
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (error) { return { parseError: error.message }; }
}

function applyMasks(reference, current, masks) {
  if (!masks.length) return;
  for (let y = 0; y < reference.height; y += 1) for (let x = 0; x < reference.width; x += 1) {
    if (!masks.some((mask) => pointInRectangle(mask, x, y))) continue;
    const index = (reference.width * y + x) << 2;
    for (const image of [reference, current]) {
      image.data[index] = 255; image.data[index + 1] = 0; image.data[index + 2] = 255; image.data[index + 3] = 255;
    }
  }
}

function cropPng(PNG, source, rect) {
  if (!rect) return null;
  const x = Math.max(0, Math.floor(Number(rect.x))); const y = Math.max(0, Math.floor(Number(rect.y)));
  const width = Math.min(source.width - x, Math.max(0, Math.floor(Number(rect.width))));
  const height = Math.min(source.height - y, Math.max(0, Math.floor(Number(rect.height))));
  if (width <= 0 || height <= 0) return null;
  const output = new PNG({ width, height });
  for (let row = 0; row < height; row += 1) {
    const sourceStart = ((y + row) * source.width + x) * 4;
    const targetStart = row * width * 4;
    source.data.copy(output.data, targetStart, sourceStart, sourceStart + width * 4);
  }
  return output;
}

function regionMap(metadata) {
  return new Map((metadata?.regions ?? []).map((region) => [region.name, region]));
}

function compareRegions({ PNG, pixelmatch, item, reference, current, referenceMetadata, currentMetadata, config }) {
  const referenceRegions = regionMap(referenceMetadata); const currentRegions = regionMap(currentMetadata);
  const results = [];
  for (const contract of item.regions ?? []) {
    const referenceRegion = referenceRegions.get(contract.name); const currentRegion = currentRegions.get(contract.name);
    const referenceResolved = referenceRegion?.status === 'resolved' ? referenceRegion.resolvedRect : null;
    const currentResolved = currentRegion?.status === 'resolved' ? currentRegion.resolvedRect : null;
    if (!referenceResolved || !currentResolved) {
      results.push({
        name: contract.name,
        weight: contract.weight,
        required: contract.required,
        severity: contract.required ? 'blocker' : 'unverified',
        reason: !referenceResolved && !currentResolved ? 'region-missing-in-both' : !referenceResolved ? 'region-missing-in-reference' : 'region-missing-in-current',
        referenceStatus: referenceRegion?.status ?? 'missing-metadata',
        currentStatus: currentRegion?.status ?? 'missing-metadata',
        geometry: null,
        mismatchRatio: null,
        perceptual: null
      });
      continue;
    }
    const geometry = compareRegionGeometry(referenceResolved, currentResolved, config.diff.regionTolerancePx);
    const referenceCrop = cropPng(PNG, reference, referenceResolved); const currentCrop = cropPng(PNG, current, currentResolved);
    if (!referenceCrop || !currentCrop || !dimensionsMatch(referenceCrop, currentCrop)) {
      results.push({ name: contract.name, weight: contract.weight, required: contract.required, severity: worstSeverity(geometry.severity, 'blocker'), reason: 'region-crop-dimensions-differ', referenceRect: referenceResolved, currentRect: currentResolved, geometry, mismatchRatio: null, perceptual: null });
      continue;
    }
    const diff = new PNG({ width: referenceCrop.width, height: referenceCrop.height });
    const mismatchPixels = pixelmatch(referenceCrop.data, currentCrop.data, diff.data, referenceCrop.width, referenceCrop.height, { threshold: config.diff.threshold, includeAA: config.diff.includeAA, alpha: config.diff.alpha });
    const totalPixels = referenceCrop.width * referenceCrop.height; const mismatchRatio = totalPixels ? mismatchPixels / totalPixels : 0;
    const pixelPolicy = classifyDiff({ dimensionsEqual: true, mismatchRatio, maxMismatchRatio: contract.maxMismatchRatio ?? config.diff.maxMismatchRatio, majorMismatchRatio: config.diff.majorMismatchRatio });
    const referenceSignature = createPerceptualSignature(referenceCrop, { gridSize: config.diff.perceptual.gridSize });
    const currentSignature = createPerceptualSignature(currentCrop, { gridSize: config.diff.perceptual.gridSize });
    const perceptual = comparePerceptualSignatures(referenceSignature, currentSignature);
    const perceptualPolicy = classifyPerceptual(perceptual.similarity, { minSimilarity: contract.minPerceptualSimilarity ?? config.diff.perceptual.minSimilarity, blockerSimilarity: config.diff.perceptual.blockerSimilarity });
    results.push({
      name: contract.name,
      weight: contract.weight,
      required: contract.required,
      severity: worstSeverity(geometry.severity, pixelPolicy.severity, config.diff.perceptual.enabled ? perceptualPolicy.severity : 'accepted'),
      reason: 'region-compared',
      referenceRect: referenceResolved,
      currentRect: currentResolved,
      geometry,
      mismatchPixels,
      totalPixels,
      mismatchRatio,
      pixelPolicy,
      perceptual: { ...perceptual, policy: perceptualPolicy }
    });
  }
  return results;
}

// Mobile cases (capture.type ios-sim|android) do not ride config.routes, so
// the web enumerator finds nothing. Project config.mobile.cases onto the same
// artifact identity captureAllMobile uses (lib/mobile-capture-engine.mjs):
// the label plays the route role, 'mobile' the viewport, the case key the
// state. Filter semantics mirror captureAllMobile: filters.route matches the
// label, filters.case matches the case key.
function enumerateMobileCasesForCompare(config, filters = {}) {
  return (config.mobile?.cases ?? [])
    .filter((c) => {
      if (filters.route && c.label !== filters.route) return false;
      if (filters.case && c.key !== filters.case) return false;
      return true;
    })
    .map((c) => ({
      key: `${c.label}__mobile__${c.key}`,
      routeName: c.label,
      viewportName: 'mobile',
      stateName: c.key,
      masks: Array.isArray(c.masks) ? c.masks : [],
      regions: Array.isArray(c.regions) ? c.regions : []
    }));
}

function visualScore(perceptual, regions) {
  if (!perceptual) return 0;
  const comparable = regions.filter((region) => Number.isFinite(region.perceptual?.similarity));
  if (!comparable.length) return Number((perceptual.similarity * 100).toFixed(2));
  const totalWeight = comparable.reduce((sum, region) => sum + Number(region.weight || 1), 0);
  const regionScore = comparable.reduce((sum, region) => sum + region.perceptual.similarity * Number(region.weight || 1), 0) / totalWeight;
  return Number(((perceptual.similarity * 0.65 + regionScore * 0.35) * 100).toFixed(2));
}

export async function compareAll(config, { filters = {} } = {}) {
  const { PNG, pixelmatch } = await imageLibraries();
  const reportJson = path.join(config.outputDir, 'reports', 'comparison.json');
  const reportHtml = path.join(config.outputDir, 'reports', 'comparison.html');
  const comparisons = [];
  // A missing capture.type means the default web pipeline ('playwright'), so
  // pre-mobile web configs never take the mobile branch.
  const isMobile = config.capture?.type && config.capture.type !== 'playwright';
  const items = isMobile
    ? enumerateMobileCasesForCompare(config, filters)
    : enumerateCases(config, { ...filters, mode: 'current' });
  for (const item of items) {
    const paths = artifactPaths(config.outputDir, item);
    const hasReference = await fileExists(paths.referencePng); const hasCurrent = await fileExists(paths.currentPng);
    const missingReferenceBlocks = config.mode === 'exact-reference' || config.diff.failOnMissingReference;
    if (!hasReference || !hasCurrent) {
      const missingCurrent = !hasCurrent;
      const severity = missingCurrent || missingReferenceBlocks ? 'blocker' : 'unverified';
      comparisons.push({
        key: item.key,
        severity,
        acceptedByNumericGate: false,
        acceptedByPerceptualGate: false,
        mismatchRatio: null,
        perceptual: null,
        visualScore: 0,
        reason: !hasReference && !hasCurrent ? 'missing-reference-and-current' : !hasReference ? 'missing-reference' : 'missing-current',
        referenceRelative: hasReference ? relativeWebPath(reportHtml, paths.referencePng) : null,
        currentRelative: hasCurrent ? relativeWebPath(reportHtml, paths.currentPng) : null,
        diffRelative: null,
        regions: [],
        notes: [severity === 'unverified' ? 'Reference evidence is absent. The automated visual gate is unverified and requires a documented manual design review.' : 'Required image evidence is missing. Visual acceptance cannot be established.']
      });
      continue;
    }

    const [referenceBuffer, currentBuffer, referenceMetadata, currentMetadata] = await Promise.all([
      fs.readFile(paths.referencePng), fs.readFile(paths.currentPng), readJsonIfExists(paths.referenceCaptureJson), readJsonIfExists(paths.currentCaptureJson)
    ]);
    const reference = PNG.sync.read(referenceBuffer); const current = PNG.sync.read(currentBuffer);
    if (!dimensionsMatch(reference, current)) {
      comparisons.push({
        key: item.key,
        ...classifyDiff({ dimensionsEqual: false, mismatchRatio: 0 }),
        acceptedByPerceptualGate: false,
        mismatchRatio: null,
        perceptual: null,
        visualScore: 0,
        referenceDimensions: { width: reference.width, height: reference.height },
        currentDimensions: { width: current.width, height: current.height },
        referenceRelative: relativeWebPath(reportHtml, paths.referencePng),
        currentRelative: relativeWebPath(reportHtml, paths.currentPng),
        diffRelative: null,
        regions: [],
        notes: ['Dimensions differ. Normalize viewport, DPR, full-page behavior, content height, and deterministic state.']
      });
      continue;
    }

    applyMasks(reference, current, item.masks);
    const diff = new PNG({ width: reference.width, height: reference.height });
    const mismatchPixels = pixelmatch(reference.data, current.data, diff.data, reference.width, reference.height, { threshold: config.diff.threshold, includeAA: config.diff.includeAA, alpha: config.diff.alpha });
    const totalPixels = reference.width * reference.height; const mismatchRatio = totalPixels ? mismatchPixels / totalPixels : 0;
    const pixelPolicy = classifyDiff({ dimensionsEqual: true, mismatchRatio, maxMismatchRatio: config.diff.maxMismatchRatio, majorMismatchRatio: config.diff.majorMismatchRatio });
    const referenceSignature = createPerceptualSignature(reference, { gridSize: config.diff.perceptual.gridSize });
    const currentSignature = createPerceptualSignature(current, { gridSize: config.diff.perceptual.gridSize });
    const perceptual = comparePerceptualSignatures(referenceSignature, currentSignature);
    const perceptualPolicy = classifyPerceptual(perceptual.similarity, config.diff.perceptual);
    const regions = compareRegions({ PNG, pixelmatch, item, reference, current, referenceMetadata, currentMetadata, config });
    const regionSeverity = regions.length ? worstSeverity(...regions.map((region) => region.severity)) : 'accepted';
    const severity = worstSeverity(pixelPolicy.severity, config.diff.perceptual.enabled ? perceptualPolicy.severity : 'accepted', regionSeverity);
    await ensureParent(paths.diffPng); await fs.writeFile(paths.diffPng, PNG.sync.write(diff));
    comparisons.push({
      key: item.key,
      severity,
      acceptedByNumericGate: pixelPolicy.acceptedByNumericGate,
      acceptedByPerceptualGate: !config.diff.perceptual.enabled || perceptualPolicy.acceptedByPerceptualGate,
      reason: worstSeverity(pixelPolicy.severity, perceptualPolicy.severity) === perceptualPolicy.severity ? perceptualPolicy.reason : pixelPolicy.reason,
      mismatchPixels,
      totalPixels,
      mismatchRatio,
      dimensions: { width: reference.width, height: reference.height },
      masks: item.masks,
      perceptual: { ...perceptual, policy: perceptualPolicy },
      visualScore: visualScore(perceptual, regions),
      regions,
      referenceRelative: relativeWebPath(reportHtml, paths.referencePng),
      currentRelative: relativeWebPath(reportHtml, paths.currentPng),
      diffRelative: relativeWebPath(reportHtml, paths.diffPng),
      notes: ['Pixel and perceptual metrics are diagnostics. Review semantic hierarchy, content, state, assets, responsiveness, interaction, and usability.']
    });
  }
  const summary = summarizeComparisons(comparisons);
  const report = { schemaVersion: 2, generatedAt: new Date().toISOString(), configPath: config.configPath, mode: config.mode, thresholds: config.diff, summary, comparisons };
  await writeJsonAtomic(reportJson, report);
  if (config.reports.html) await writeTextAtomic(reportHtml, renderComparisonReport({ title: 'Frontend Vision Loop Comparison', generatedAt: report.generatedAt, summary, comparisons }));
  return { ok: summary.blockers === 0 && summary.majors === 0, reportJson, reportHtml: config.reports.html ? reportHtml : null, ...summary, comparisons };
}
