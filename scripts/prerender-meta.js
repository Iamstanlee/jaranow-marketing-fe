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

function buildTags(routePath, meta, config) {
  const url = `${config.siteUrl}${routePath === '/' ? '' : routePath}`;
  const image = `${config.siteUrl}${meta.ogImage}`;

  const tags = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}"/>`,
    `<link rel="canonical" href="${escapeAttr(url)}"/>`,
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

    const html = stripManagedTags(template).replace(
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
