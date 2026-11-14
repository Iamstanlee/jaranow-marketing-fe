#!/usr/bin/env node
/**
 * Writes one static HTML file per route in src/seo/routes.json with its meta tags
 * baked in, because share crawlers do not run JS (see CLAUDE.md "SEO").
 *
 *   preloadChunk  preload a lazy route's chunk group, saving serial round trips.
 *   lean          strip the marketing head (analytics, pixel, display face).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const SOURCE_HTML = path.join(BUILD_DIR, 'index.html');
const ROUTES_FILE = path.join(ROOT, 'src', 'seo', 'routes.json');

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripManagedTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
}

// Conditional: stripping unconditionally would leave other routes with no manifest.
function stripAppTags(html, meta) {
  let out = html;
  if (meta.manifest) out = out.replace(/<link\s+rel="manifest"[^>]*>/gi, '');
  if (meta.themeColor) out = out.replace(/<meta\s+name="theme-color"[^>]*>/gi, '');
  if (meta.appleTouchIcon) out = out.replace(/<link\s+rel="apple-touch-icon"[^>]*>/gi, '');
  return out;
}

/**
 * Webpack writes no route -> chunk map, so recover one from main.js: the runtime's
 * {id:"hash"} table plus each lazy import's Promise.all([n.e(id),...]) group.
 * Every failure returns null (no preload) so a webpack change never breaks the build.
 */
function findChunkGroup(chunkName) {
  const jsDir = path.join(BUILD_DIR, 'static', 'js');
  if (!fs.existsSync(jsDir)) return null;

  const files = fs.readdirSync(jsDir);
  const entry = files.find((f) => new RegExp(`^${chunkName}\\.[a-f0-9]+\\.chunk\\.js$`).test(f));
  if (!entry) {
    console.warn(`[prerender-meta] WARNING: no chunk named "${chunkName}" in the build - skipping preload.`);
    return null;
  }

  const mainFile = files.find((f) => /^main\.[a-f0-9]+\.js$/.test(f));
  if (!mainFile) return null;
  const main = fs.readFileSync(path.join(jsDir, mainFile), 'utf8');

  const table = main.match(/\{(?:\d+:"[a-f0-9]+",){2,}\d+:"[a-f0-9]+"\}/);
  if (!table) return null;
  const byId = new Map();
  for (const [, id, hash] of table[0].matchAll(/(\d+):"([a-f0-9]+)"/g)) byId.set(id, hash);

  const entryHash = entry.slice(chunkName.length + 1).split('.')[0];
  const entryId = [...byId].find(([, hash]) => hash === entryHash)?.[0];
  if (!entryId) return null;

  // Siblings in the group are the vendor chunks the route cannot render without.
  for (const [, group] of main.matchAll(/Promise\.all\(\[([^\]]*)\]\)/g)) {
    const ids = [...group.matchAll(/\.e\((\d+)\)/g)].map((m) => m[1]);
    if (!ids.includes(entryId)) continue;
    return ids
      .map((id) => (id === entryId ? entry : files.find((f) => f.endsWith(`.${byId.get(id)}.chunk.js`))))
      .filter(Boolean)
      .map((file) => `/static/js/${file}`);
  }
  return [`/static/js/${entry}`];
}

function preloadTags(chunkName) {
  const chunks = findChunkGroup(chunkName);
  if (!chunks || !chunks.length) return [];
  console.log(`[prerender-meta]   preloading ${chunks.length} chunk(s) for "${chunkName}"`);
  return chunks.map((href) => `<link rel="preload" as="script" href="${escapeAttr(href)}"/>`);
}

function stripMarketingHead(html) {
  return html
    .replace(/<script[^>]*googletagmanager\.com[^>]*><\/script>/gi, '')
    .replace(/<script>[^<]*gtag\([^<]*<\/script>/gi, '')
    .replace(/<script[^>]*analytics\.ahrefs\.com[^>]*><\/script>/gi, '')
    .replace(/<!-- Meta Pixel[^>]*-->\s*/gi, '')
    .replace(/<script>[^<]*fbq\([^<]*<\/script>/gi, '')
    .replace(/<noscript><img[^>]*facebook\.com\/tr[^>]*\/><\/noscript>/gi, '')
    .replace(/<link\s+rel="(?:preconnect|dns-prefetch)"[^>]*(?:googletagmanager|google-analytics|ahrefs|chatway)[^>]*>/gi, '')
    .replace(/<link\s+rel="preload"\s+as="image"[^>]*>/gi, '')
    // Keep Rubik (body face); Archivo Black is marketing-only (BRAND-STANDARD 6.2).
    .replace(/(<link[^>]+fonts\.googleapis\.com[^>]*)&(?:amp;)?family=Archivo\+Black/gi, '$1');
}

function buildTags(routePath, meta, config) {
  const url = `${config.siteUrl}${routePath === '/' ? '' : routePath}`;
  const image = `${config.siteUrl}${meta.ogImage}`;

  const tags = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}"/>`,
    `<link rel="canonical" href="${escapeAttr(url)}"/>`,
    // Must be in the served HTML: a JS swap is too late, installs get the wrong start_url.
    ...(meta.manifest ? [`<link rel="manifest" href="${escapeAttr(meta.manifest)}"/>`] : []),
    ...(meta.themeColor ? [`<meta name="theme-color" content="${escapeAttr(meta.themeColor)}"/>`] : []),
    // iOS ignores the manifest's icons when adding to the home screen.
    ...(meta.appleTouchIcon ? [`<link rel="apple-touch-icon" href="${escapeAttr(meta.appleTouchIcon)}"/>`] : []),
    ...(meta.noindex ? [`<meta name="robots" content="noindex, nofollow"/>`] : []),
    ...(meta.preloadChunk ? preloadTags(meta.preloadChunk) : []),
    `<meta property="og:type" content="website"/>`,
    `<meta property="og:site_name" content="${escapeAttr(meta.siteName)}"/>`,
    `<meta property="og:locale" content="en_NG"/>`,
    `<meta property="og:url" content="${escapeAttr(url)}"/>`,
    `<meta property="og:title" content="${escapeAttr(meta.ogTitle)}"/>`,
    `<meta property="og:description" content="${escapeAttr(meta.ogDescription)}"/>`,
    `<meta property="og:image" content="${escapeAttr(image)}"/>`,
    `<meta property="og:image:width" content="1200"/>`,
    `<meta property="og:image:height" content="630"/>`,
    `<meta property="og:image:alt" content="${escapeAttr(meta.ogImageAlt)}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:site" content="${escapeAttr(config.twitterSite)}"/>`,
    `<meta name="twitter:url" content="${escapeAttr(url)}"/>`,
    `<meta name="twitter:title" content="${escapeAttr(meta.ogTitle)}"/>`,
    `<meta name="twitter:description" content="${escapeAttr(meta.ogDescription)}"/>`,
    `<meta name="twitter:image" content="${escapeAttr(image)}"/>`,
    `<meta name="twitter:image:alt" content="${escapeAttr(meta.ogImageAlt)}"/>`,
  ];

  return `\n    ${tags.join('\n    ')}\n  `;
}

function main() {
  if (!fs.existsSync(SOURCE_HTML)) {
    console.error(
      `[prerender-meta] ${path.relative(ROOT, SOURCE_HTML)} not found. Run this after "react-scripts build".`
    );
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf8'));
  const template = fs.readFileSync(SOURCE_HTML, 'utf8');

  if (!/<\/head>/i.test(template)) {
    console.error('[prerender-meta] No </head> found in the built HTML - refusing to guess.');
    process.exit(1);
  }

  const entries = Object.entries(config.routes);
  let written = 0;

  for (const [routePath, meta] of entries) {
    const missingImage = path.join(BUILD_DIR, meta.ogImage.replace(/^\//, ''));
    if (!fs.existsSync(missingImage)) {
      console.warn(
        `[prerender-meta] WARNING: og:image for ${routePath} is missing from the build: ${meta.ogImage}`
      );
    }

    const base = meta.lean ? stripMarketingHead(template) : template;
    const html = stripAppTags(stripManagedTags(base), meta).replace(
      /<\/head>/i,
      `${buildTags(routePath, meta, config)}</head>`
    );

    const outFile = path.join(BUILD_DIR, meta.file);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, html, 'utf8');
    written += 1;
    console.log(`[prerender-meta] ${routePath.padEnd(26)} -> build/${meta.file}`);
  }

  console.log(`[prerender-meta] Wrote ${written} route document(s).`);
}

main();
