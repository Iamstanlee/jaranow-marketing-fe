#!/usr/bin/env node
/**
 * Bakes per-route social metadata into static HTML after the CRA build.
 *
 * Why this exists: this is a client-rendered SPA, so react-helmet-async only
 * sets the document head once JavaScript has run. Facebook, WhatsApp, Twitter,
 * LinkedIn and friends do not run JavaScript - they read the raw HTML response.
 * Because every route is served the same public/index.html, every share preview
 * fell back to the homepage's tags.
 *
 * This script writes one real HTML file per route, each carrying that route's
 * own title/description/og:image, so a crawler gets the right answer without
 * executing anything. The app itself is untouched - the bundle still boots and
 * takes over as normal.
 *
 * Metadata comes from src/seo/routes.json, which is the same file the runtime
 * <SeoTags> component reads, so the static and client tags cannot drift.
 *
 * Two per-route fields here are about load time rather than crawlers, and apply
 * only to the route that declares them:
 *
 *   preloadChunk  Emit <link rel="preload"> for a lazy route's own chunk and the
 *                 siblings webpack loads alongside it. Without it the browser
 *                 cannot know a route needs those files until main.js has parsed
 *                 and React has matched the route - three serial round trips to
 *                 first paint instead of one.
 *   lean          Drop the marketing head this document inherits from
 *                 public/index.html: analytics, third-party preconnects, the hero
 *                 logo preload, and the display face. For internal tools.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const SOURCE_HTML = path.join(BUILD_DIR, 'index.html');
const ROUTES_FILE = path.join(ROOT, 'src', 'seo', 'routes.json');

/** Escape a value for use inside a double-quoted HTML attribute. */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape a value for use as HTML text content. */
function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Remove the tags we are about to replace, so a route never ends up with both
 * the homepage's version and its own. Anything not listed here (fonts, icons,
 * manifest, analytics) is deliberately left alone.
 */
function stripManagedTags(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
}

/**
 * Only for routes that declare their own: dropping these unconditionally would
 * leave every other route without a manifest or theme colour.
 */
function stripAppTags(html, meta) {
  let out = html;
  if (meta.manifest) out = out.replace(/<link\s+rel="manifest"[^>]*>/gi, '');
  if (meta.themeColor) out = out.replace(/<meta\s+name="theme-color"[^>]*>/gi, '');
  if (meta.appleTouchIcon) out = out.replace(/<link\s+rel="apple-touch-icon"[^>]*>/gi, '');
  return out;
}

/**
 * Webpack does not write a route -> chunk map we can read, so we recover one from
 * the built main.js, which contains both halves of it:
 *
 *   - the runtime's id -> contenthash table, e.g. {40:"fe2ea15a",533:"857b4646"}
 *   - each lazy import compiled to Promise.all([n.e(920),n.e(703),n.e(533)])
 *
 * A named chunk (webpackChunkName) lands as `<name>.<hash>.chunk.js` on disk, so we
 * find the file, take its id from the runtime table, and preload the whole group
 * that mentions it. Everything here degrades to "no preload tags" rather than
 * failing the build: a webpack upgrade that changes this output should cost the
 * optimisation, not the deploy.
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

  // id -> contenthash, from the runtime's chunk filename helper.
  const table = main.match(/\{(?:\d+:"[a-f0-9]+",){2,}\d+:"[a-f0-9]+"\}/);
  if (!table) return null;
  const byId = new Map();
  for (const [, id, hash] of table[0].matchAll(/(\d+):"([a-f0-9]+)"/g)) byId.set(id, hash);

  const entryHash = entry.slice(chunkName.length + 1).split('.')[0];
  const entryId = [...byId].find(([, hash]) => hash === entryHash)?.[0];
  if (!entryId) return null;

  // The lazy import group that pulls this chunk in. Its siblings are the vendor
  // chunks (firebase, and whatever else webpack split out) that the route cannot
  // start rendering without, so they are exactly what is worth preloading.
  for (const [, group] of main.matchAll(/Promise\.all\(\[([^\]]*)\]\)/g)) {
    const ids = [...group.matchAll(/\.e\((\d+)\)/g)].map((m) => m[1]);
    if (!ids.includes(entryId)) continue;
    return ids
      .map((id) => (id === entryId ? entry : files.find((f) => f.endsWith(`.${byId.get(id)}.chunk.js`))))
      .filter(Boolean)
      .map((file) => `/static/js/${file}`);
  }
  // A chunk not inside a Promise.all group is loaded on its own.
  return [`/static/js/${entry}`];
}

function preloadTags(chunkName) {
  const chunks = findChunkGroup(chunkName);
  if (!chunks || !chunks.length) return [];
  console.log(`[prerender-meta]   preloading ${chunks.length} chunk(s) for "${chunkName}"`);
  return chunks.map((href) => `<link rel="preload" as="script" href="${escapeAttr(href)}"/>`);
}

/**
 * The marketing head, removed for routes that are not marketing pages. Each of these
 * costs a connection or a render-blocking request on a page that has no use for it:
 * a PIN-gated internal tool does not need product analytics, a customer chat widget,
 * the homepage hero logo, or the display face it never sets.
 */
function stripMarketingHead(html) {
  return html
    .replace(/<script[^>]*googletagmanager\.com[^>]*><\/script>/gi, '')
    .replace(/<script>[^<]*gtag\([^<]*<\/script>/gi, '')
    .replace(/<script[^>]*analytics\.ahrefs\.com[^>]*><\/script>/gi, '')
    .replace(/<link\s+rel="(?:preconnect|dns-prefetch)"[^>]*(?:googletagmanager|google-analytics|ahrefs|chatway)[^>]*>/gi, '')
    .replace(/<link\s+rel="preload"\s+as="image"[^>]*>/gi, '')
    // Keep Rubik, which is the desk's body face; drop Archivo Black, which is a
    // signage face used only by the marketing pages (see BRAND-STANDARD 6.2).
    .replace(/(<link[^>]+fonts\.googleapis\.com[^>]*)&(?:amp;)?family=Archivo\+Black/gi, '$1');
}

function buildTags(routePath, meta, config) {
  const url = `${config.siteUrl}${routePath === '/' ? '' : routePath}`;
  const image = `${config.siteUrl}${meta.ogImage}`;

  const tags = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}"/>`,
    `<link rel="canonical" href="${escapeAttr(url)}"/>`,
    // An installable route needs its manifest in the first byte of the response.
    // Swapping the <link> from JavaScript once the page has booted is too late: the
    // browser has already read a manifest by then, and an install captured at that
    // moment carries the wrong start_url.
    ...(meta.manifest ? [`<link rel="manifest" href="${escapeAttr(meta.manifest)}"/>`] : []),
    ...(meta.themeColor ? [`<meta name="theme-color" content="${escapeAttr(meta.themeColor)}"/>`] : []),
    // iOS ignores the manifest's icons when adding to the home screen.
    ...(meta.appleTouchIcon ? [`<link rel="apple-touch-icon" href="${escapeAttr(meta.appleTouchIcon)}"/>`] : []),
    ...(meta.noindex ? [`<meta name="robots" content="noindex, nofollow"/>`] : []),
    // Load-time plumbing, not metadata - see the preloadChunk note at the top.
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
