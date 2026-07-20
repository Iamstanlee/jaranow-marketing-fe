/* Jaranow - "Drop" mark generator.
   Emits standalone, self-contained SVG files. No fonts, no external refs.
   Usage:  node gen-marks.js <theme> <outdir>

   Colourways per theme:
     <theme>  every element in the accent
     duo      symbol + service name in the accent, wordmark in ink
     black    single-colour ink
     white    single-colour knockout
*/
const fs = require("fs");
const path = require("path");

const THEMES = {
  brass: { accent: "#B07C12", ink: "#171410", paper: "#F6F2E8" },
  blue:  { accent: "#2563EB", ink: "#0E1526", paper: "#F2F5FB" }
};

const THEME_NAME = process.argv[2];
const OUT = process.argv[3];
const T = THEMES[THEME_NAME];
if (!T) { console.error(`unknown theme: ${THEME_NAME}`); process.exit(1); }
fs.mkdirSync(path.join(OUT, "svg"), { recursive: true });

const M = { sw: 14, gap: 12, cap: "round", join: "round", base: 100, asc: 16 };

const G = {
  j:{w:28,top:23,bot:129, d:"M21 53 V108 A14 14 0 0 1 7 122", f:"M14 23 H28 V37 H14 Z"},
  a:{w:54,top:46,bot:100, d:"M47 53 V100 M47 67 A14 14 0 0 0 33 53 H21 A14 14 0 0 0 7 67 V79 A14 14 0 0 0 21 93 H33 A14 14 0 0 0 47 79"},
  r:{w:37,top:46,bot:100, d:"M7 100 V67 A14 14 0 0 1 21 53 H30"},
  n:{w:54,top:46,bot:100, d:"M7 100 V67 A14 14 0 0 1 21 53 H33 A14 14 0 0 1 47 67 V100"},
  o:{w:54,top:46,bot:100, d:"M7 67 A14 14 0 0 1 21 53 H33 A14 14 0 0 1 47 67 V79 A14 14 0 0 1 33 93 H21 A14 14 0 0 1 7 79 Z"},
  w:{w:68,top:46,bot:100, d:"M7 53 L20 100 L34 56 L48 100 L61 53"},
  c:{w:54,top:46,bot:100, d:"M47 62 A14 14 0 0 0 33 53 H21 A14 14 0 0 0 7 67 V79 A14 14 0 0 0 21 93 H33 A14 14 0 0 0 47 84"},
  h:{w:54,top:16,bot:100, d:"M7 100 V16 M7 67 A14 14 0 0 1 21 53 H33 A14 14 0 0 1 47 67 V100"},
  s:{w:54,top:44,bot:102, d:"M47 60 C47 49 7 48 7 63 C7 77 47 74 47 88 C47 101 9 102 9 89"},
  u:{w:54,top:46,bot:100, d:"M7 53 V79 A14 14 0 0 0 21 93 H33 A14 14 0 0 0 47 79 V53 M47 53 V100"},
  d:{w:54,top:16,bot:100, d:"M47 16 V100 M47 67 A14 14 0 0 0 33 53 H21 A14 14 0 0 0 7 67 V79 A14 14 0 0 0 21 93 H33 A14 14 0 0 0 47 79"},
  y:{w:54,top:46,bot:131, d:"M7 53 L27 96 M47 53 L17 124"},
  l:{w:14,top:16,bot:100, d:"M7 16 V100"},
  b:{w:54,top:16,bot:100, d:"M7 16 V100 M7 67 A14 14 0 0 1 21 53 H33 A14 14 0 0 1 47 67 V79 A14 14 0 0 1 33 93 H21 A14 14 0 0 1 7 79"},
  e:{w:54,top:46,bot:100, d:"M7 73 H47 M47 73 V67 A14 14 0 0 0 33 53 H21 A14 14 0 0 0 7 67 V79 A14 14 0 0 0 21 93 H33 A14 14 0 0 0 46 84"}
};

const SYM_VB = [16, 8, 68, 84];
const SYM_D = `<path fill-rule="evenodd" fill="COLOR" stroke="none" d="M50 8 L81 44 A34 34 0 1 1 19 44 Z M50 51 A13 13 0 1 1 50 77 A13 13 0 1 1 50 51 Z"/>`;

const R = (n) => Number(n.toFixed(2));

function setWord(text, track = 0, colour) {
  let x = 0, parts = [], top = Infinity, bot = -Infinity;
  for (const ch of text) {
    const g = G[ch];
    if (!g) continue;
    let inner = `<path d="${g.d}"/>`;
    if (g.f) inner += `<path d="${g.f}" fill="${colour}" stroke="none"/>`;
    parts.push(`<g transform="translate(${x},0)">${inner}</g>`);
    top = Math.min(top, g.top); bot = Math.max(bot, g.bot);
    x += g.w + M.gap + track;
  }
  return { body: parts.join(""), w: x - M.gap - track, top, bot };
}

function symG(x, y, box, colour) {
  const s = box / Math.max(SYM_VB[2], SYM_VB[3]);
  const ox = x + (box - SYM_VB[2] * s) / 2, oy = y + (box - SYM_VB[3] * s) / 2;
  return `<g transform="translate(${ox - SYM_VB[0] * s},${oy - SYM_VB[1] * s}) scale(${s})">` +
         SYM_D.replace("COLOR", colour) + `</g>`;
}

/* Clear space: half the height of the 'o' (x-height 54u), on all four sides,
   so no asset is ever flush to its own bounding box. */
const PAD = 27;

function doc(x, y, w, h, strokeColour, body, label) {
  const vb = `${R(x - PAD)} ${R(y - PAD)} ${R(w + PAD * 2)} ${R(h + PAD * 2)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ` +
    `width="${R(w + PAD * 2)}" height="${R(h + PAD * 2)}" ` +
    `role="img" aria-label="${label}" fill="none" stroke="${strokeColour}" stroke-width="${M.sw}" ` +
    `stroke-linecap="${M.cap}" stroke-linejoin="${M.join}">\n  ${body}\n</svg>\n`;
}

/* ---- assets. `c` is {sym, word, service} ---- */
const A = {};

A.wordmark = (c) => {
  const b = setWord("jaranow", 0, c.word);
  return doc(0, b.top, b.w, b.bot - b.top, c.word, b.body, "jaranow wordmark");
};

A.symbol = (c) => {
  const [x, y, w, h] = SYM_VB, P = 14;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x-P} ${y-P} ${w+P*2} ${h+P*2}" ` +
    `width="${w+P*2}" height="${h+P*2}" ` +
    `role="img" aria-label="Jaranow symbol">\n  ${SYM_D.replace("COLOR", c.sym)}\n</svg>\n`;
};

A["lockup-horizontal"] = (c) => {
  const b = setWord("jaranow", 0, c.word);
  const box = (M.base - M.asc) * 1.24;
  const symY = (b.top + b.bot) / 2 - box / 2;
  const gap = box * 0.42;
  const W = box + gap + b.w;
  const top = Math.min(symY, b.top), bot = Math.max(symY + box, b.bot);
  const body = symG(0, symY, box, c.sym) +
    `<g transform="translate(${R(box + gap)},0)">${b.body}</g>`;
  return doc(0, top, W, bot - top, c.word, body, "Jaranow horizontal lockup");
};

A["lockup-stacked"] = (c) => {
  const b = setWord("jaranow", 0, c.word);
  const box = b.w * 0.40, gap = box * 0.34;
  const W = Math.max(box, b.w);
  const H = box + gap + (b.bot - b.top);
  const body = symG((W - box) / 2, 0, box, c.sym) +
    `<g transform="translate(${R((W - b.w) / 2)},${R(box + gap - b.top)})">${b.body}</g>`;
  return doc(0, 0, W, H, c.word, body, "Jaranow stacked lockup");
};

function subBrand(service, c) {
  const b = setWord("jaranow", 0, c.word);
  const box = (M.base - M.asc) * 1.30;
  const wx = box + box * 0.38;
  const s = 0.40, sv = setWord(service, 34, c.service);
  /* Baseline of the service line. Must clear the 'j' descender (bot 129) even
     when the service word starts with an ascender - 'laundry' does. */
  const svy = 176;
  const top = b.top, bot = svy;
  const symY = (top + bot) / 2 - box / 2;
  const W = wx + Math.max(b.w, sv.w * s);
  const body = symG(0, symY, box, c.sym) +
    `<g transform="translate(${R(wx)},0)">${b.body}</g>` +
    `<g transform="translate(${R(wx)},${R(svy - M.base * s)}) scale(${s})" stroke="${c.service}">${sv.body}</g>`;
  return doc(0, top, W, bot - top, c.word, body, `${service} by Jaranow`);
}

A["carwash-by-jaranow"] = (c) => subBrand("carwash", c);
A["laundry-by-jaranow"] = (c) => subBrand("laundry", c);

/* Solid rounded square with the symbol centred.
   fill 0.52 = iOS home-screen safe area; 0.76 = favicon, where the counter
   has to stay open at 16px and the tile edge is doing no work anyway. */
function appIcon(bg, fg, fill = 0.52, radius = 0.2237) {
  const S = 1024, r = S * radius, box = S * fill;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" ` +
    `role="img" aria-label="Jaranow app icon">\n  <rect width="${S}" height="${S}" rx="${R(r)}" fill="${bg}"/>\n  ` +
    symG((S - box) / 2, (S - box) / 2, box, fg) + `\n</svg>\n`;
}

/* ---- colourways ---- */
const WAYS = {
  [THEME_NAME]: { sym: T.accent, word: T.accent, service: T.accent },
  duo:          { sym: T.accent, word: T.ink,    service: T.accent },
  black:        { sym: T.ink,    word: T.ink,    service: T.ink },
  white:        { sym: T.paper,  word: T.paper,  service: T.paper }
};

/* duo only means something where two elements can differ */
const DUO_ONLY = ["lockup-horizontal", "lockup-stacked", "carwash-by-jaranow", "laundry-by-jaranow"];
const ALL = ["wordmark", "symbol", ...DUO_ONLY];

const files = [];
const put = (name, svg) => {
  fs.writeFileSync(path.join(OUT, "svg", name + ".svg"), svg);
  files.push(name);
};

for (const [way, c] of Object.entries(WAYS)) {
  const keys = way === "duo" ? DUO_ONLY : ALL;
  for (const key of keys) put(`jaranow-${key}-${way}`, A[key](c));
}
put("jaranow-app-icon-ink", appIcon(T.ink, T.paper));
put(`jaranow-app-icon-${THEME_NAME}`, appIcon(T.accent, T.paper));
put("jaranow-favicon", appIcon(T.ink, T.paper, 0.76, 0.16));

console.log(`${THEME_NAME}: ${files.length} files`);
