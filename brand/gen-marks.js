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

/* Construction: BRAND-STANDARD §2.1 (stroke centres, radius 14). Preserve the
   quirk: straight stems end at y=100 (overhang to 107), curved bottoms at 93.
   `w` advance; `top`/`bot` centre-coord bounds; `f` filled, unstroked geometry. */
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
  e:{w:54,top:46,bot:100, d:"M7 73 H47 M47 73 V67 A14 14 0 0 0 33 53 H21 A14 14 0 0 0 7 67 V79 A14 14 0 0 0 21 93 H33 A14 14 0 0 0 46 84"},

  // Stem at 14, not 7, to leave the crossbar its 7-unit left overhang.
  t:{w:35,top:30,bot:100, d:"M14 30 V79 A14 14 0 0 0 28 93 M7 53 H28"},
  v:{w:54,top:46,bot:100, d:"M7 53 L27 100 L47 53"},
  i:{w:14,top:23,bot:100, d:"M7 53 V100", f:"M0 23 H14 V37 H0 Z"},
  p:{w:54,top:46,bot:131, d:"M7 53 V124 M7 67 A14 14 0 0 1 21 53 H33 A14 14 0 0 1 47 67 V79 A14 14 0 0 1 33 93 H21 A14 14 0 0 1 7 79"},
  g:{w:54,top:46,bot:131, d:"M47 53 V110 A14 14 0 0 1 33 124 M47 67 A14 14 0 0 0 33 53 H21 A14 14 0 0 0 7 67 V79 A14 14 0 0 0 21 93 H33 A14 14 0 0 0 47 79"},
  "6":{w:54,top:16,bot:100, d:"M7 67 A14 14 0 0 1 21 53 H33 A14 14 0 0 1 47 67 V79 A14 14 0 0 1 33 93 H21 A14 14 0 0 1 7 79 Z M7 72 V30 A14 14 0 0 1 21 16 H30"},
  /* Capitals, for the books app icon only; copied into gen-appicon.js - change both.
     Cap height = ascender line. B is closed, so nothing overhangs at its stem foot. */
  O:{w:68,top:16,bot:100, d:"M7 30 A14 14 0 0 1 21 16 H47 A14 14 0 0 1 61 30 V79 A14 14 0 0 1 47 93 H21 A14 14 0 0 1 7 79 Z"},
  B:{w:61,top:16,bot:100, d:"M7 93 V16 H33 A14 14 0 0 1 47 30 V40 A14 14 0 0 1 33 54 H7 M7 54 H40 A14 14 0 0 1 54 68 V79 A14 14 0 0 1 40 93 H7"},
  K:{w:57,top:16,bot:100, d:"M7 16 V100 M50 16 L7 64 M21 48.4 L50 100"},
  // Square, like the tittles - a round dot would be the only circle in the face.
  "·":{w:14,top:66,bot:80, f:"M0 66 H14 V80 H0 Z"},
  // Advance only; setWord skips any character missing from G.
  " ":{w:20}
};

const SYM_VB = [16, 8, 68, 84];
const SYM_D = `<path fill-rule="evenodd" fill="COLOR" stroke="none" d="M50 8 L81 44 A34 34 0 1 1 19 44 Z M50 51 A13 13 0 1 1 50 77 A13 13 0 1 1 50 51 Z"/>`;

const R = (n) => Number(n.toFixed(2));

// `n` counts glyphs that moved the pen (spaces included) - the address tracking solve needs that.
function setWord(text, track = 0, colour) {
  let x = 0, n = 0, parts = [], top = Infinity, bot = -Infinity;
  for (const ch of text) {
    const g = G[ch];
    if (!g) continue;
    if (g.d || g.f) {
      let inner = g.d ? `<path d="${g.d}"/>` : "";
      if (g.f) inner += `<path d="${g.f}" fill="${colour}" stroke="none"/>`;
      parts.push(`<g transform="translate(${R(x)},0)">${inner}</g>`);
      top = Math.min(top, g.top); bot = Math.max(bot, g.bot);
    }
    x += g.w + M.gap + track;
    n++;
  }
  return { body: parts.join(""), w: x - M.gap - track, top, bot, n };
}

function symG(x, y, box, colour) {
  const s = box / Math.max(SYM_VB[2], SYM_VB[3]);
  const ox = x + (box - SYM_VB[2] * s) / 2, oy = y + (box - SYM_VB[3] * s) / 2;
  return `<g transform="translate(${ox - SYM_VB[0] * s},${oy - SYM_VB[1] * s}) scale(${s})">` +
         SYM_D.replace("COLOR", colour) + `</g>`;
}

// Clear space: half the 'o' height, all sides (BRAND-STANDARD §7).
const PAD = 27;

function doc(x, y, w, h, strokeColour, body, label) {
  const vb = `${R(x - PAD)} ${R(y - PAD)} ${R(w + PAD * 2)} ${R(h + PAD * 2)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ` +
    `width="${R(w + PAD * 2)}" height="${R(h + PAD * 2)}" ` +
    `role="img" aria-label="${label}" fill="none" stroke="${strokeColour}" stroke-width="${M.sw}" ` +
    `stroke-linecap="${M.cap}" stroke-linejoin="${M.join}">\n  ${body}\n</svg>\n`;
}

// `c` is {sym, word, service}
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

/* Shared by subBrand and addressLockup so they can't drift. These numbers give
   every service line the §3 625.7 x 207 frame - changing one changes them all. */
function subBrandParts(service, c) {
  const b = setWord("jaranow", 0, c.word);
  const box = (M.base - M.asc) * 1.30;
  const wx = box + box * 0.38;
  const s = 0.40, sv = setWord(service, 34, c.service);
  // Service baseline: must clear the 'j' descender (129) even under an ascender ('laundry').
  const svy = 176;
  const top = b.top, bot = svy;
  const symY = (top + bot) / 2 - box / 2;
  const W = wx + Math.max(b.w, sv.w * s);
  const body = symG(0, symY, box, c.sym) +
    `<g transform="translate(${R(wx)},0)">${b.body}</g>` +
    `<g transform="translate(${R(wx)},${R(svy - M.base * s)}) scale(${s})" stroke="${c.service}">${sv.body}</g>`;
  return { body, W, top, bot };
}

function subBrand(service, c) {
  const p = subBrandParts(service, c);
  return doc(0, p.top, p.W, p.bot - p.top, c.word, p.body, `${service} by Jaranow`);
}

/* Address lockup (BRAND-STANDARD §3.1). Tracking is solved to justify to the block;
   a line that would need tracking under minTrack stops the run rather than cramp. */
const ADDR = { rule: 216, base: 274, scale: 0.30, ruleWeight: 5, minTrack: 10 };

function addressLockup(service, text, c) {
  const p = subBrandParts(service, c);
  const s = ADDR.scale;

  /* `track` is EXTRA on top of M.gap, and flat.w already includes the gaps - don't
     subtract M.gap again or the line sets ~12% short of the rule. */
  const flat = setWord(text, 0, c.service);
  const track = (p.W / s - flat.w) / (flat.n - 1);
  if (track < ADDR.minTrack) {
    console.error(
      `${service}: "${text}" is too long for the ${R(p.W)}-unit block ` +
      `(needs ${R(track)} tracking, minimum ${ADDR.minTrack}). Shorten it or drop ADDR.scale.`
    );
    process.exit(1);
  }
  const a = setWord(text, track, c.service);

  const bot = ADDR.base + (a.bot - M.base) * s;

  const body = p.body +
    `<path d="M0 ${ADDR.rule} H${R(p.W)}" stroke="${c.service}" ` +
      `stroke-width="${ADDR.ruleWeight}" stroke-linecap="butt"/>` +
    `<g transform="translate(0,${R(ADDR.base - M.base * s)}) scale(${s})" stroke="${c.service}">${a.body}</g>`;

  return doc(0, p.top, p.W, bot - p.top, c.word, body, `${service} by Jaranow — ${text}`);
}

// Carwash only, deliberately - the other lines have no forecourt.
const CARWASH_ADDRESS = "6th avenue · gwarinpa";

A["carwash-by-jaranow"] = (c) => subBrand("carwash", c);
A["laundry-by-jaranow"] = (c) => subBrand("laundry", c);
A["rugwash-by-jaranow"] = (c) => subBrand("rugwash", c);
A["business-by-jaranow"] = (c) => subBrand("business", c);
A["carwash-address"] = (c) => addressLockup("carwash", CARWASH_ADDRESS, c);

// fill 0.52 = iOS safe area; 0.76 = favicon, to hold the counter open at 16px.
function appIcon(bg, fg, fill = 0.52, radius = 0.2237) {
  const S = 1024, r = S * radius, box = S * fill;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" ` +
    `role="img" aria-label="Jaranow app icon">\n  <rect width="${S}" height="${S}" rx="${R(r)}" fill="${bg}"/>\n  ` +
    symG((S - box) / 2, (S - box) / 2, box, fg) + `\n</svg>\n`;
}

const WAYS = {
  [THEME_NAME]: { sym: T.accent, word: T.accent, service: T.accent },
  duo:          { sym: T.accent, word: T.ink,    service: T.accent },
  black:        { sym: T.ink,    word: T.ink,    service: T.ink },
  white:        { sym: T.paper,  word: T.paper,  service: T.paper }
};

// A new service line must be listed here as well as in A, or nothing is written.
const DUO_ONLY = ["lockup-horizontal", "lockup-stacked", "carwash-by-jaranow", "laundry-by-jaranow",
                  "rugwash-by-jaranow", "business-by-jaranow",
                  "carwash-address"];
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
