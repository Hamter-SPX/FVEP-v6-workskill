import { artifactPaths } from './artifacts.mjs';
import { runCaseMatrix } from './browser-runner.mjs';
import { writeJsonAtomic } from './io.mjs';
import { analyzeHeadingOutline, detectPotentialOverlaps } from './layout-analysis.mjs';

export async function inspectAll(config, { baseUrl, headed = false, filters = {} } = {}) {
  if (!config.inspection.enabled) return [];
  return runCaseMatrix(config, async ({ page, caseDefinition, runtimeEvents }) => {
    const selectors = [...new Set(caseDefinition.inspectSelectors)];
    const inspection = await page.evaluate(({ selectors, maxElements }) => {
      const selected = []; const seen = new Set(); const invalidSelectors = [];
      const domPath = (element) => {
        const parts = [];
        let current = element;
        while (current instanceof Element && current !== document.documentElement) {
          const tag = current.tagName.toLowerCase();
          if (current.id) { parts.unshift(`${tag}#${CSS.escape(current.id)}`); break; }
          const siblings = current.parentElement ? [...current.parentElement.children].filter((item) => item.tagName === current.tagName) : [];
          const suffix = siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(current) + 1})` : '';
          parts.unshift(`${tag}${suffix}`); current = current.parentElement;
        }
        return ['html', ...parts].join('>');
      };
      const isInteractive = (element) => {
        const tag = element.tagName.toLowerCase(); const role = element.getAttribute('role');
        return ['a', 'button', 'input', 'select', 'textarea', 'summary'].includes(tag)
          || ['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option', 'slider', 'spinbutton', 'textbox', 'combobox'].includes(role)
          || element.tabIndex >= 0;
      };
      for (const selector of selectors) {
        let matches = [];
        try { matches = [...document.querySelectorAll(selector)]; }
        catch (error) { invalidSelectors.push({ selector, message: error.message }); }
        for (const element of matches) {
          if (!seen.has(element)) { seen.add(element); selected.push(element); }
          if (selected.length >= maxElements) break;
        }
        if (selected.length >= maxElements) break;
      }
      const elementData = selected.map((element, index) => {
        const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
        return {
          index,
          domPath: domPath(element),
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          classes: typeof element.className === 'string' ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 20) : [],
          role: element.getAttribute('role'),
          ariaLabel: element.getAttribute('aria-label'),
          name: element.getAttribute('name'),
          interactive: isInteractive(element),
          text: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300),
          visible: style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
          box: { clientWidth: element.clientWidth, clientHeight: element.clientHeight, scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight },
          style: {
            display: style.display, position: style.position, zIndex: style.zIndex,
            overflowX: style.overflowX, overflowY: style.overflowY, opacity: style.opacity,
            color: style.color, backgroundColor: style.backgroundColor,
            fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight,
            lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, textAlign: style.textAlign,
            whiteSpace: style.whiteSpace, textOverflow: style.textOverflow,
            border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow,
            padding: style.padding, margin: style.margin, gap: style.gap,
            flexDirection: style.flexDirection, flexWrap: style.flexWrap, gridTemplateColumns: style.gridTemplateColumns
          }
        };
      });
      const viewportWidth = document.documentElement.clientWidth; const viewportHeight = document.documentElement.clientHeight;
      const bodyElements = [...document.querySelectorAll('body *')].slice(0, Math.max(maxElements * 4, 1000));
      const overflowOffenders = bodyElements
        .map((element) => ({ element, rect: element.getBoundingClientRect(), style: getComputedStyle(element) }))
        .filter(({ rect, style }) => style.display !== 'none' && rect.width > 0 && (rect.right > viewportWidth + 1 || rect.left < -1))
        .slice(0, 100)
        .map(({ element, rect }) => ({ domPath: domPath(element), tag: element.tagName.toLowerCase(), id: element.id || null, classes: typeof element.className === 'string' ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 10) : [], text: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140), rect: { left: rect.left, right: rect.right, width: rect.width } }));
      const textClippingOffenders = bodyElements
        .map((element) => ({ element, style: getComputedStyle(element) }))
        .filter(({ element, style }) => style.display !== 'none' && element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1 && ['hidden', 'clip'].includes(style.overflowX))
        .slice(0, 100)
        .map(({ element, style }) => ({ domPath: domPath(element), text: (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, whiteSpace: style.whiteSpace, textOverflow: style.textOverflow }));
      const fixedObstructions = bodyElements
        .map((element) => ({ element, rect: element.getBoundingClientRect(), style: getComputedStyle(element) }))
        .filter(({ rect, style }) => ['fixed', 'sticky'].includes(style.position) && rect.width > 0 && rect.height > 0 && (rect.width * rect.height) / Math.max(1, viewportWidth * viewportHeight) > 0.25)
        .slice(0, 50)
        .map(({ element, rect, style }) => ({ domPath: domPath(element), position: style.position, zIndex: style.zIndex, areaRatio: Number(((rect.width * rect.height) / Math.max(1, viewportWidth * viewportHeight)).toFixed(4)), rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } }));
      const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((heading) => ({ level: Number(heading.tagName.slice(1)), text: (heading.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300), domPath: domPath(heading) }));
      const rootStyle = getComputedStyle(document.documentElement); const customProperties = {};
      for (const property of rootStyle) if (property.startsWith('--')) { const value = rootStyle.getPropertyValue(property).trim(); if (value) customProperties[property] = value; }
      const imagesWithoutDimensions = [...document.images].filter((image) => !image.getAttribute('width') && !image.getAttribute('height') && getComputedStyle(image).aspectRatio === 'auto').map((image) => ({ domPath: domPath(image), src: image.currentSrc || image.src, alt: image.alt })).slice(0, 100);
      return {
        url: location.href,
        title: document.title,
        document: { viewportWidth, viewportHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1 },
        headings,
        customProperties,
        overflowOffenders,
        textClippingOffenders,
        fixedObstructions,
        imagesWithoutDimensions,
        invalidSelectors,
        elements: elementData
      };
    }, { selectors, maxElements: config.inspection.maxElements });

    const headingOutline = analyzeHeadingOutline(inspection.headings);
    const overlaps = detectPotentialOverlaps(inspection.elements.slice(0, config.inspection.overlapProbeLimit), { maxPairs: 200 });
    const blockingOverlaps = overlaps.filter((entry) => entry.blocking);
    const analysis = { headingOutline, overlaps, blockingOverlaps };
    const paths = artifactPaths(config.outputDir, caseDefinition);
    await writeJsonAtomic(paths.inspectionJson, { schemaVersion: 2, key: caseDefinition.key, capturedAt: new Date().toISOString(), inspection, analysis, runtimeEvents });
    return {
      inspectionPath: paths.inspectionJson,
      horizontalOverflow: inspection.document.horizontalOverflow,
      overflowOffenderCount: inspection.overflowOffenders.length,
      textClippingCount: inspection.textClippingOffenders.length,
      fixedObstructionCount: inspection.fixedObstructions.length,
      imageDimensionRiskCount: inspection.imagesWithoutDimensions.length,
      headingIssueCount: headingOutline.issues.length,
      overlapCount: overlaps.length,
      blockingOverlapCount: blockingOverlaps.length,
      ok: !inspection.document.horizontalOverflow && blockingOverlaps.length === 0
    };
  }, { mode: 'current', baseUrl, headed, filters, label: 'inspect' });
}
