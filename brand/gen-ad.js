/* Jaranow — Meta ad creative for the new verticals (rug cleaning, fleet &
   corporate car wash).
   Emits one HTML page per ad x format; rasterize-ad.sh screenshots them.

   THE IDEA: one visual, the before/after split. Each ad is built around a flat
   illustration of the thing we clean - a rug, a company van - cut down the
   middle: dingy on the left, fresh on the right, with a slider handle between.
   It shows the result before anyone reads a word, and it is the same device on
   both ads, so they run as one campaign.

   The headline sells the end result, never the process (CLAUDE.md copy
   rules). Then one sentence, then the action: a button-shaped pill and the
   WhatsApp number. Nothing else - Meta delivers text-heavy images less, and a
   phone gives an ad about a second. Detail goes in the primary text.

   Brand rules held: Ink field, one accent, flat art (no gradients or shadows,
   §4.2), Archivo Black once per surface (§6.2), the accent bar along the foot.
   Grime is drawn in Ink at low opacity rather than in a brown - a second hue
   would break the palette, and darkening reads as dirt on its own.

   No prices, same rule as the flyer: the ad sells the result; figures live on
   /rugs and /pricing.

   WHAT TO EDIT: ADS (copy) and FORMATS (canvases).

   Usage: node gen-ad.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "ad");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), {recursive: true});

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

/* ---------------------------------------------------------------------------
   FORMATS — Meta's two placements, in pixels.

     padTop / padBottom  Stories: Meta's profile bar covers ~the top 13% and the
                         reply box ~the bottom 18%. Content is kept out of both;
                         the empty bands are deliberate.
     art                 illustration panel height
     head                headline ceiling in px (fit() only ever shrinks it)
--------------------------------------------------------------------------- */
const FORMATS = [
    {name: "feed", label: "Meta feed 4:5", w: 1080, h: 1350, pad: 64, padTop: 60, padBottom: 64, art: 500, head: 100, sub: 34, lockup: 58},
    {name: "story", label: "Meta story / Reels 9:16", w: 1080, h: 1920, pad: 72, padTop: 250, padBottom: 330, art: 560, head: 108, sub: 36, lockup: 62},
];

/* ---------------------------------------------------------------------------
   ADS — the input to the design.

     lockup    white knockout lockup. Sub-brand when the ad belongs to a line
               (the fleet ad is Carwash by Jaranow); master when it has none.
     kicker    who and where, for a cold viewer
     art       "rug" | "van" - the split illustration
     headline  Archivo Black. \n sets the breaks; lines never wrap on their own.
     sub       one sentence
     cta       { button, number, url }

   Alternatives worth testing as a second ad set, same art:
     rugs      "Harmattan dust lives in your rug." (Nov-Feb only)
     business  "Stop sending drivers to the car wash."
--------------------------------------------------------------------------- */
const ADS = [
    {
        file: "ad-rugs",
        lockup: "jaranow-lockup-horizontal-white",
        kicker: "Rug cleaning · Pickup & delivery · Abuja",
        art: "rug",
        headline: "Your rug, like the\nday you bought it.",
        sub: "We collect it from your door, deep-clean it and bring it back fresh. You don't lift a thing.",
        cta: {button: "Book a pickup", number: "0903 862 2012"},
    },
    {
        file: "ad-business",
        lockup: "jaranow-carwash-by-jaranow-white",
        lockupScale: 1.3, // sub-brand frame is taller; keeps the wordmark the same size as the master's
        kicker: "Fleet & corporate car wash · Abuja",
        art: "van",
        headline: "Your fleet is\nyour billboard.",
        sub: "Keep every company vehicle spotless. We wash them at your premises, on your schedule.",
        cta: {button: "Get a quote", number: "0903 862 2012"},
    },
];

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Rubik:wght@400;500;700&display=block";

function mark(name, height) {
    let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

function watermark() {
    let s = fs.readFileSync(path.join(SVG, "jaranow-symbol-white.svg"), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", '<svg class="wm" ');
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* ---------------------------------------------------------------------------
   THE ART. Both drawings live in a 1000x560 box. The clean drawing is painted
   whole; the grime layer is clipped to the left half, so the split is exact and
   the two halves are always the same object.
--------------------------------------------------------------------------- */

/* Deterministic scatter, so a re-render does not move every stain. */
function rng(seed) {
    let s = seed;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function grime(seed, box, {blotches, specks, mud}) {
    const r = rng(seed);
    const [x0, y0, x1, y1] = box;
    const out = [];
    for (let i = 0; i < blotches; i++) {
        const cx = (x0 + r() * (x1 - x0)).toFixed(0);
        const cy = (y0 + r() * (y1 - y0)).toFixed(0);
        out.push(`<ellipse cx="${cx}" cy="${cy}" rx="${(18 + r() * 46).toFixed(0)}" ry="${(12 + r() * 30).toFixed(0)}" transform="rotate(${(r() * 180).toFixed(0)} ${cx} ${cy})" fill="${INK}" opacity="${(0.18 + r() * 0.22).toFixed(2)}"/>`);
    }
    for (let i = 0; i < specks; i++) {
        out.push(`<circle cx="${(x0 + r() * (x1 - x0)).toFixed(0)}" cy="${(y0 + r() * (y1 - y0)).toFixed(0)}" r="${(1.5 + r() * 4).toFixed(1)}" fill="${INK}" opacity="${(0.35 + r() * 0.35).toFixed(2)}"/>`);
    }
    if (mud) {
        // splash along the bottom edge, heavier low down
        for (let i = 0; i < mud.n; i++) {
            const cx = x0 + r() * (x1 - x0);
            const cy = mud.y - Math.pow(r(), 2.2) * mud.rise;
            out.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(3 + r() * 11).toFixed(1)}" fill="${INK}" opacity="${(0.45 + r() * 0.35).toFixed(2)}"/>`);
        }
    }
    return out.join("");
}

/* A sparkle: the "clean" cue on the right half. Four-point star, flat. */
const sparkle = (x, y, s, fill) =>
    `<path d="M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${fill}"/>`;

/* The slider between the halves: a line and a handle with two chevrons. The
   handle's height is per drawing, so it never sits on something that has to be
   read (the van's side panel). */
const divider = (y) => `
  <line x1="500" y1="18" x2="500" y2="542" stroke="${PAPER}" stroke-width="5"/>
  <circle cx="500" cy="${y}" r="36" fill="${PAPER}"/>
  <path d="M486 ${y - 14} L472 ${y} L486 ${y + 14} M514 ${y - 14} L528 ${y} L514 ${y + 14}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;

const tag = (x, text, fill, color) => `
  <rect x="${x}" y="22" width="${text.length * 15 + 40}" height="44" rx="22" fill="${fill}"/>
  <text x="${x + 20}" y="51" font-family="Rubik" font-weight="500" font-size="20" letter-spacing="3" fill="${color}">${text}</text>`;

/* `shape` is the object's silhouette. Grime is clipped to it AND to the left
   half, so stains sit on the rug or the van, never on the panel behind. */
function art(clean, dirt, sparkles, shape, handleY = 280) {
    return `<svg class="art-svg" viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="left"><rect x="0" y="0" width="500" height="560"/></clipPath>
    <clipPath id="obj">${shape}</clipPath>
  </defs>
  ${clean}
  <g clip-path="url(#left)"><g clip-path="url(#obj)">${dirt}</g></g>
  ${sparkles.map(([x, y, s]) => sparkle(x, y, s, PAPER)).join("")}
  ${divider(handleY)}
  ${tag(40, "BEFORE", "rgba(242,245,251,.14)", PAPER)}
  ${tag(810, "AFTER", ACCENT, PAPER)}
</svg>`;
}

function rugArt() {
    const fringe = (x, dir) =>
        Array.from({length: 22}, (_, i) => {
            const y = 108 + i * 16;
            return `<line x1="${x}" y1="${y}" x2="${x + dir * 26}" y2="${y}" stroke="${PAPER}" stroke-width="4" stroke-linecap="round"/>`;
        }).join("");
    const diamond = (cx, cy, rx, ry, fill) => `<path d="M${cx} ${cy - ry} L${cx + rx} ${cy} L${cx} ${cy + ry} L${cx - rx} ${cy}Z" fill="${fill}"/>`;
    const rug = `
    ${fringe(150, -1)}${fringe(850, 1)}
    <rect x="150" y="92" width="700" height="376" rx="10" fill="${ACCENT}"/>
    <rect x="178" y="120" width="644" height="320" rx="4" fill="${PAPER}"/>
    <!-- Weave: alternating short warp and weft threads, faint, so the clean
         field reads as fabric rather than a blank card. -->
    <defs><pattern id="weave" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M2 4 H8 M10 12 H16 M12 2 V8 M4 10 V16" stroke="${ACCENT}" stroke-width="1.6" stroke-linecap="round" opacity=".16"/>
    </pattern></defs>
    <rect x="178" y="120" width="644" height="320" rx="4" fill="url(#weave)"/>
    <rect x="198" y="140" width="604" height="280" fill="none" stroke="${INK}" stroke-width="4"/>
    <rect x="212" y="154" width="576" height="252" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="10 8"/>
    ${[[240, 175], [760, 175], [240, 385], [760, 385]].map(([x, y]) => diamond(x, y, 14, 14, ACCENT)).join("")}`;
    const dirt = `
    <rect x="124" y="92" width="376" height="376" fill="${INK}" opacity=".42"/>
    ${grime(7, [130, 100, 500, 460], {blotches: 14, specks: 140})}`;
    const shape = `<rect x="120" y="92" width="760" height="376" rx="10"/>`;
    return art(rug, dirt, [[640, 170, 22], [790, 420, 16], [700, 470, 12]], shape);
}

/* The cab's side window, as glass: a pale accent tint with the driver seen
   through it - seat, head and shoulders, an arm to the wheel - and two streaks
   of glare. Everything is clipped to the window shape. Flat fills only. */
function cabWindow() {
    const win = "M740 146 L812 146 Q826 146 834 158 L880 250 L740 250Z";
    return `
    <defs><clipPath id="glass"><path d="${win}"/></clipPath></defs>
    <path d="${win}" fill="${PAPER}"/>
    <path d="${win}" fill="${ACCENT}" opacity=".22"/>
    <g clip-path="url(#glass)">
      <rect x="748" y="164" width="20" height="44" rx="9" fill="${INK}" opacity=".45"/>
      <rect x="744" y="204" width="30" height="60" rx="8" fill="${INK}" opacity=".45"/>
      <path d="M766 262 Q764 226 792 222 Q818 222 822 262Z" fill="${INK}"/>
      <rect x="787" y="206" width="12" height="18" fill="${INK}"/>
      <circle cx="794" cy="190" r="21" fill="${INK}"/>
      <path d="M812 232 L846 222" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <ellipse cx="852" cy="226" rx="6" ry="25" transform="rotate(-24 852 226)" fill="none" stroke="${INK}" stroke-width="6"/>
      <polygon points="748,250 786,146 800,146 762,250" fill="${PAPER}" opacity=".45"/>
      <polygon points="770,250 808,146 814,146 776,250" fill="${PAPER}" opacity=".35"/>
    </g>
    <path d="${win}" fill="none" stroke="${INK}" stroke-width="4"/>`;
}

function vanArt() {
    const wheel = (cx) => `
    <circle cx="${cx}" cy="440" r="62" fill="${INK}"/>
    <circle cx="${cx}" cy="440" r="62" fill="none" stroke="${PAPER}" stroke-opacity=".25" stroke-width="3"/>
    <circle cx="${cx}" cy="440" r="26" fill="${PAPER}"/>
    <circle cx="${cx}" cy="440" r="9" fill="${INK}"/>`;
    const van = `
    <line x1="60" y1="502" x2="940" y2="502" stroke="${PAPER}" stroke-opacity=".18" stroke-width="3"/>
    <path d="M90 150 Q90 118 122 118 L720 118 Q748 118 764 138 L874 262 Q900 290 900 326 L900 424 Q900 444 880 444 L110 444 Q90 444 90 424Z" fill="${PAPER}"/>
    ${cabWindow()}
    <rect x="712" y="146" width="8" height="280" fill="${INK}" opacity=".12"/>
    <rect x="90" y="360" width="810" height="26" fill="${ACCENT}"/>
    <text x="128" y="318" font-family="Archivo Black" font-size="86" letter-spacing="-1" fill="${INK}">YOUR <tspan fill="${ACCENT}">BRAND</tspan></text>
    <rect x="862" y="330" width="30" height="16" rx="6" fill="${INK}" opacity=".35"/>
    ${wheel(250)}${wheel(740)}`;
    const dirt = `
    <path d="M90 150 Q90 118 122 118 L500 118 L500 444 L110 444 Q90 444 90 424Z" fill="${INK}" opacity=".38"/>
    ${grime(11, [96, 124, 500, 430], {blotches: 12, specks: 90, mud: {n: 120, y: 444, rise: 150}})}
    ${grime(23, [180, 380, 500, 500], {blotches: 0, specks: 40})}`;
    const body = "M90 150 Q90 118 122 118 L720 118 Q748 118 764 138 L874 262 Q900 290 900 326 L900 424 Q900 444 880 444 L110 444 Q90 444 90 424Z";
    const shape = `<path d="${body}"/><circle cx="250" cy="440" r="62"/><circle cx="740" cy="440" r="62"/>`;
    return art(van, dirt, [[620, 92, 22], [930, 200, 16], [880, 480, 14]], shape, 492);
}

const ARTS = {rug: rugArt, van: vanArt};

/* ---------------------------------------------------------------------------
   THE PAGE
--------------------------------------------------------------------------- */
function css(f) {
    const BAR = 22;
    return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${f.w}px;height:${f.h}px;overflow:hidden}
  body{
    background:${INK}; color:${PAPER}; font-family:'Rubik',system-ui,sans-serif;
    position:relative; display:flex; flex-direction:column;
    padding:${f.padTop}px ${f.pad}px ${f.padBottom + BAR}px;
  }
  .dots{position:absolute; inset:0;
    background-image:radial-gradient(rgba(242,245,251,.08) 2px, transparent 2px);
    background-size:36px 36px}
  .wm{position:absolute; right:-260px; bottom:${f.padBottom + 40}px; height:760px; width:auto; opacity:.035}
  .top,.kicker,.art,.copy,.cta,.url{position:relative; z-index:2}
  .kicker{margin-top:26px; font-size:24px; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:${ACCENT}}
  /* The picture sits on a slightly lifted panel so it reads as one object. */
  .art{margin-top:36px; height:${f.art}px; flex:none; border-radius:28px; background:rgba(242,245,251,.045);
    border:2px solid rgba(242,245,251,.08); overflow:hidden}
  .art-svg{width:100%; height:100%; display:block}
  .copy{flex:1; display:flex; flex-direction:column; justify-content:center; padding:8px 0}
  /* The one loud line. Archivo Black ships one weight - never bold it.
     white-space:pre: lines break only at the \\n in the copy. */
  h1{font-family:'Archivo Black',system-ui,sans-serif; font-weight:400; font-size:${f.head}px;
    line-height:1.0; letter-spacing:-.015em; white-space:pre}
  h1 .dot{color:${ACCENT}}
  .sub{margin-top:24px; font-size:${f.sub}px; line-height:1.38; color:rgba(242,245,251,.76); max-width:900px}
  .cta{display:flex; align-items:center; gap:28px}
  .btn{display:inline-flex; align-items:center; gap:18px; background:${ACCENT}; color:#fff;
    font-size:38px; font-weight:700; padding:30px 44px; border-radius:999px; white-space:nowrap}
  .btn svg{width:34px; height:34px}
  .wa .label{font-size:20px; font-weight:500; letter-spacing:.2em; text-transform:uppercase; color:rgba(242,245,251,.55)}
  .wa .number{margin-top:6px; font-size:40px; font-weight:700; letter-spacing:-.01em; white-space:nowrap}
  .url{margin-top:22px; font-size:24px; font-weight:500; color:rgba(242,245,251,.5)}
  .bar{position:absolute; left:0; right:0; bottom:0; height:${BAR}px; background:${ACCENT}}
`;
}

/* Shrink the headline until its longest line fits. Runs after fonts load -
   Archivo Black is much wider than the fallback. Only ever shrinks. */
const FIT = `document.fonts.ready.then(() => {
  const h = document.querySelector('h1');
  let size = parseFloat(getComputedStyle(h).fontSize);
  while (h.scrollWidth > h.clientWidth && size > 40) { size -= 2; h.style.fontSize = size + 'px'; }
});`;

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const headline = (h) => {
    const s = esc(h);
    return s.endsWith(".") ? `${s.slice(0, -1)}<span class="dot">.</span>` : s;
};

const page = (ad, f) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet">
<style>${css(f)}</style></head><body>
<div class="dots"></div>
${watermark()}
<div class="top">${mark(ad.lockup, Math.round(f.lockup * (ad.lockupScale || 1)))}</div>
<p class="kicker">${esc(ad.kicker)}</p>
<div class="art">${ARTS[ad.art]()}</div>
<div class="copy">
  <h1>${headline(ad.headline)}</h1>
  <p class="sub">${esc(ad.sub)}</p>
</div>
<div class="cta">
  <span class="btn">${esc(ad.cta.button)} ${ARROW}</span>
  <div class="wa"><p class="label">WhatsApp</p><p class="number">${esc(ad.cta.number)}</p></div>
</div>
<div class="bar"></div>
<script>${FIT}</script>
</body></html>`;

const sizes = [];
for (const ad of ADS) {
    for (const f of FORMATS) {
        const base = `${ad.file}-${f.name}`;
        fs.writeFileSync(path.join(OUT, "html", `${base}.html`), page(ad, f));
        sizes.push(`${base} ${f.w} ${f.h}`);
        console.log(`template  ${base}.html  ${f.w}x${f.h}  ${f.label}`);
    }
}
fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");
console.log(`\n${sizes.length} ads written to ${path.join(OUT, "html")}`);
