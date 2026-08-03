import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileExists, writeTextAtomic } from './io.mjs';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toFileUrl(filePath) {
  const resolved = path.resolve(filePath);
  if (process.platform === 'win32') {
    return `file:///${resolved.replaceAll('\\', '/')}`;
  }
  return `file://${resolved}`;
}

/**
 * Opens a local file or URL in the default browser. Returns how it was launched.
 * Never throws for “open failed” — callers treat that as a degraded path.
 */
export async function openInDefaultBrowser(target) {
  const url = String(target ?? '');
  if (!url) throw new Error('openInDefaultBrowser requires a path or URL.');
  const href = url.startsWith('file:') || url.startsWith('http') ? url : toFileUrl(url);
  const platform = process.platform;
  const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = platform === 'darwin' ? [href] : platform === 'win32' ? ['/c', 'start', '', href] : [href];
  return await new Promise((resolve) => {
    const child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.unref();
    child.on('error', (error) => resolve({ ok: false, href, error: error.message }));
    child.on('spawn', () => resolve({ ok: true, href, command }));
  });
}

function normalizeOptions(options = []) {
  return options.slice(0, 3).map((item, index) => {
    const number = Number(item.number ?? index + 1);
    return {
      number,
      label: String(item.label ?? item.thesis ?? `Option ${number}`),
      thesis: String(item.thesis ?? item.label ?? ''),
      imagePath: item.imagePath ? path.resolve(String(item.imagePath)) : null,
      imageHref: item.imageHref ? String(item.imageHref) : null,
      notes: String(item.notes ?? '')
    };
  });
}

/**
 * Writes a self-contained HTML gallery for direction options 1–3 and optionally opens it.
 * Use this when the chat runtime cannot display attached/generated images inline
 * (CLI, some Codex surfaces) or when the user cannot send a reference screenshot into chat.
 */
export async function writeDirectionGallery(config = {}) {
  const outputDir = path.resolve(config.outputDir ?? path.join(process.cwd(), 'design', 'direction-options'));
  const title = String(config.title ?? 'Visual direction options');
  const referenceNote = String(config.referenceNote ?? '');
  const options = normalizeOptions(config.options ?? []);
  if (options.length < 2) throw new Error('writeDirectionGallery requires at least two options.');

  await fs.mkdir(outputDir, { recursive: true });
  const htmlPath = path.join(outputDir, 'index.html');

  const cards = [];
  for (const option of options) {
    let src = option.imageHref;
    if (!src && option.imagePath) {
      const exists = await fileExists(option.imagePath);
      if (!exists) throw new Error(`Option ${option.number} image missing: ${option.imagePath}`);
      const fileName = path.basename(option.imagePath);
      const copied = path.join(outputDir, fileName);
      if (path.resolve(option.imagePath) !== path.resolve(copied)) {
        await fs.copyFile(option.imagePath, copied);
      }
      src = fileName;
    }
    if (!src) {
      src = '';
    }
    cards.push(`<article class="card" id="option-${option.number}">
  <header><span class="num">${option.number}</span><h2>${escapeHtml(option.label)}</h2></header>
  <p class="thesis">${escapeHtml(option.thesis)}</p>
  ${src
    ? `<figure><img src="${escapeHtml(src)}" alt="Direction option ${option.number}"/></figure>`
    : '<p class="missing">Image pending — generate with ImageGen then re-run the gallery.</p>'}
  ${option.notes ? `<p class="notes">${escapeHtml(option.notes)}</p>` : ''}
</article>`);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; background:#0b1020; color:#eef2ff; }
    body { margin:0; }
    main { max-width: 1400px; margin: 0 auto; padding: 28px 20px 48px; }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 4vw, 40px); letter-spacing: -0.03em; }
    .lede { color:#aeb9d6; max-width: 60ch; line-height: 1.5; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-top: 28px; }
    .card { background:#11182b; border:1px solid #27304b; border-radius: 18px; padding: 16px; display:flex; flex-direction:column; gap:12px; }
    .card header { display:flex; align-items:center; gap:12px; }
    .num { display:inline-grid; place-items:center; width:36px; height:36px; border-radius:999px; background:#1d4ed8; font-weight:700; }
    h2 { margin:0; font-size:18px; }
    .thesis, .notes, .missing { margin:0; color:#c7d2fe; line-height:1.45; }
    .missing { border:1px dashed #68708a; border-radius:12px; padding:24px; text-align:center; }
    figure { margin:0; }
    img { width:100%; border-radius:12px; background:#fff; display:block; }
    .footer { margin-top: 28px; color:#aeb9d6; font-size:14px; }
    kbd { background:#1a2238; border:1px solid #27304b; border-radius:6px; padding:2px 6px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p class="lede">Pick <kbd>1</kbd>, <kbd>2</kbd>, or <kbd>3</kbd> in chat. Images are direction evidence — not production assets.</p>
    ${referenceNote ? `<p class="lede">${escapeHtml(referenceNote)}</p>` : ''}
    <section class="grid">${cards.join('\n')}</section>
    <p class="footer">Generated for visual direction exploration. Reply in chat with the option number, then expect a direction spec before implementation.</p>
  </main>
</body>
</html>
`;

  await writeTextAtomic(htmlPath, html);
  const manifestPath = path.join(outputDir, 'gallery.manifest.json');
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    title,
    htmlPath,
    options: options.map((item) => ({
      number: item.number,
      label: item.label,
      thesis: item.thesis,
      imagePath: item.imagePath,
      notes: item.notes
    }))
  };
  await writeTextAtomic(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  let browser = null;
  if (config.open !== false) {
    browser = await openInDefaultBrowser(htmlPath);
  }

  return {
    ok: true,
    outputDir,
    htmlPath,
    manifestPath,
    href: toFileUrl(htmlPath),
    optionCount: options.length,
    browser
  };
}
