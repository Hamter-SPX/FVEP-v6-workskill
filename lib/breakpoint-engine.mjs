import path from 'node:path';
import { runCaseMatrix } from './browser-runner.mjs';
import { writeJsonAtomic } from './io.mjs';

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  return value;
}

export function stableLayoutSignature(layout) {
  return JSON.stringify(stableValue(layout));
}

export function detectBreakpointCandidates(samples = []) {
  const sorted = [...samples].sort((left, right) => Number(left.width) - Number(right.width));
  const candidates = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1]; const current = sorted[index];
    const previousOverflow = Boolean(previous.horizontalOverflow); const currentOverflow = Boolean(current.horizontalOverflow);
    let kind = null;
    if (previousOverflow !== currentOverflow) kind = currentOverflow ? 'overflow-introduced' : 'overflow-resolved';
    else if (stableLayoutSignature(previous.layout) !== stableLayoutSignature(current.layout)) kind = 'layout-change';
    if (!kind) continue;
    candidates.push({
      kind,
      range: [Number(previous.width), Number(current.width)],
      estimatedWidth: Math.round((Number(previous.width) + Number(current.width)) / 2),
      from: { width: Number(previous.width), horizontalOverflow: previousOverflow, signature: stableLayoutSignature(previous.layout) },
      to: { width: Number(current.width), horizontalOverflow: currentOverflow, signature: stableLayoutSignature(current.layout) }
    });
  }
  return candidates;
}

function widthsFromPolicy(policy) {
  const minWidth = Math.max(200, Math.floor(Number(policy.minWidth ?? 320)));
  const maxWidth = Math.min(7680, Math.floor(Number(policy.maxWidth ?? 1600)));
  const step = Math.max(8, Math.floor(Number(policy.step ?? 40)));
  if (maxWidth < minWidth) throw new RangeError('breakpoints.maxWidth must be >= minWidth.');
  const widths = [];
  for (let width = minWidth; width <= maxWidth; width += step) widths.push(width);
  if (widths.at(-1) !== maxWidth) widths.push(maxWidth);
  return widths;
}

export async function discoverBreakpoints(config, { baseUrl, headed = false, filters = {} } = {}) {
  if (!config.breakpoints?.enabled) return { enabled: false, groups: [], reportPath: null };
  const widths = widthsFromPolicy(config.breakpoints);
  const scanConfig = structuredClone(config);
  scanConfig.routes = scanConfig.routes
    .filter((route) => !filters.route || [route.name, route.path].includes(String(filters.route)))
    .map((route) => ({
      ...route,
      viewports: widths.map((width) => ({ name: `scan-${width}`, width, height: Number(config.breakpoints.height ?? 900), deviceScaleFactor: 1 })),
      states: route.states.filter((state) => !filters.state || state.name === String(filters.state))
    }));
  const samples = await runCaseMatrix(scanConfig, async ({ page, caseDefinition }) => {
    const sample = await page.evaluate(({ selectors }) => {
      const viewportWidth = document.documentElement.clientWidth;
      const layout = [];
      for (const selector of selectors) {
        let elements = [];
        try { elements = [...document.querySelectorAll(selector)].slice(0, 30); } catch { continue; }
        for (const element of elements) {
          const style = getComputedStyle(element); const rect = element.getBoundingClientRect();
          const visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          const gridColumns = style.display.includes('grid') ? style.gridTemplateColumns.split(/\s+/).filter(Boolean).length : 0;
          layout.push({
            selector,
            tag: element.tagName.toLowerCase(),
            id: element.id || null,
            visible,
            display: style.display,
            position: style.position,
            flexDirection: style.flexDirection,
            flexWrap: style.flexWrap,
            gridColumns,
            order: style.order
          });
        }
      }
      return {
        horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
        layout
      };
    }, { selectors: config.breakpoints.selectors });
    return { width: caseDefinition.viewport.width, routeName: caseDefinition.routeName, stateName: caseDefinition.stateName, ...sample, ok: !sample.horizontalOverflow };
  }, { mode: 'current', baseUrl, headed, filters: {}, label: 'breakpoint-scan' });

  const grouped = new Map();
  for (const sample of samples) {
    const key = `${sample.routeName}__${sample.stateName}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(sample);
  }
  const groups = [...grouped.entries()].map(([key, groupSamples]) => ({ key, samples: groupSamples.sort((a, b) => a.width - b.width), candidates: detectBreakpointCandidates(groupSamples) }));
  const reportPath = path.join(config.outputDir, 'reports', 'breakpoints.json');
  await writeJsonAtomic(reportPath, { schemaVersion: 1, generatedAt: new Date().toISOString(), policy: config.breakpoints, groups });
  return { enabled: true, groups, reportPath, candidateCount: groups.reduce((sum, group) => sum + group.candidates.length, 0), overflowSampleCount: samples.filter((item) => item.horizontalOverflow).length, ok: samples.every((item) => !item.horizontalOverflow) };
}
