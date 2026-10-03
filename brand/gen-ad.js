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
const NAVY = "#173475"; // 40% ACCENT into INK - a palette shade, not a new hue

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

     ground    "ink" (default) | "paper" | "accent" | "navy" - the field colour.
               Lockup must match: -white on dark fields, -duo on Paper (§8.8)
     layout    "split" (default: picture, then headline) | "stage" (headline,
               then picture) | "list" (headline, then a card of `points`)
     points    list layout only: [[result, detail], ...] - three, each a result
               or benefit the customer gets, never a step in the process

   TWO CONCEPTS PER OFFER, for A/B testing in Ads Manager:
     A  "result"  - Ink, split layout, before/after art. Shows the outcome.
     B  "problem" - Paper, stage layout, a situation drawing. Names the pain
                    the customer already has, then answers it.
     C  "outcome" - navy field, split layout, the finished result in the
                    customer's world (a fresh rug in a living room; a
                    spotless fleet lined up) and the benefit it brings. A
                    shows the change; C shows life after it.
     D  "benefits" - Paper, list layout, no drawing: the headline, then an
                    Ink card of three ticked results. For the skimmer who
                    wants reasons, not a picture.
   They differ in idea AND in look, so a winner tells you something.

   Also worth testing later: rugs "Harmattan dust lives in your rug." (Nov-Feb).
--------------------------------------------------------------------------- */
const ADS = [
    {
        file: "ad-rugs-a",
        lockup: "jaranow-rugwash-by-jaranow-white",
        lockupScale: 1.3,
        kicker: "Rug cleaning · Free pickup & delivery · Abuja",
        art: "rug",
        headline: "Dirty rug?\nWe'll make it fresh.",
        sub: "We pick it up from your house, wash it professionally and deliver it back neat. Pickup and delivery are\u00a0free.",
        cta: {button: "Book free pickup", number: "0903 862 2012"},
    },
    {
        file: "ad-business-a",
        lockup: "jaranow-business-by-jaranow-white",
        lockupScale: 1.3, // sub-brand frame is taller; keeps the wordmark the same size as the master's
        kicker: "Office, school & fleet car wash · Abuja",
        art: "van",
        headline: "Company cars washed\nat your office.",
        sub: "Pool cars, vans and staff buses kept neat at your office or our Gwarinpa site, on your\u00a0schedule.",
        cta: {button: "Get a quote", number: "0903 862 2012"},
    },
    {
        file: "ad-rugs-b",
        lockup: "jaranow-rugwash-by-jaranow-duo",
        lockupScale: 1.3,
        ground: "paper",
        layout: "stage",
        kicker: "Rug cleaning · Free pickup & delivery · Abuja",
        art: "machine",
        headline: "Rug too big to\nwash at home?",
        sub: "No stress. We pick it up from your house, give it a proper wash and deliver it back\u00a0fresh.",
        cta: {button: "Book free pickup", number: "0903 862 2012"},
    },
    {
        file: "ad-business-b",
        lockup: "jaranow-business-by-jaranow-duo",
        lockupScale: 1.3,
        ground: "paper",
        layout: "stage",
        kicker: "Office, school & fleet car wash · Abuja",
        art: "carpark",
        headline: "Stop sending drivers\nto the car wash.",
        sub: "We come to your office, school or depot and wash every vehicle while work goes\u00a0on.",
        cta: {button: "Get a quote", number: "0903 862 2012"},
    },
    {
        file: "ad-rugs-c",
        lockup: "jaranow-rugwash-by-jaranow-white",
        lockupScale: 1.3,
        ground: "navy",
        kicker: "Rug cleaning · Free pickup & delivery · Abuja",
        art: "room",
        headline: "Clean rug.\nFresh sitting room.",
        sub: "The whole room feels new. We pick your rug up from your house and bring it back\u00a0fresh.",
        cta: {button: "Book free pickup", number: "0903 862 2012"},
    },
    {
        file: "ad-business-c",
        lockup: "jaranow-business-by-jaranow-white",
        lockupScale: 1.3,
        ground: "navy",
        kicker: "Office, school & fleet car wash · Abuja",
        art: "fleet",
        headline: "Neat vehicles.\nSharp company image.",
        sub: "Car washing for offices, schools and businesses in Abuja, on a schedule that works for\u00a0you.",
        cta: {button: "Get a quote", number: "0903 862 2012"},
    },
];

/* Field colours. `rgb` is the foreground as an rgba() triple, for the muted
   text, rules and dot field; `wm` recolours the drop watermark. */
const GROUNDS = {
    ink: {bg: INK, fg: PAPER, rgb: "242,245,251", wm: PAPER, wmOpacity: 0.035},
    paper: {bg: PAPER, fg: INK, rgb: "14,21,38", wm: INK, wmOpacity: 0.045},
    /* On the accent field the accent cannot also mark the kicker, the full
       stop, the button or the bar - it would vanish. Those roles move to Paper
       and Ink: the button inverts to Paper, the bar and the stop go Ink. */
    accent: {
        bg: ACCENT, fg: PAPER, rgb: "242,245,251", wm: PAPER, wmOpacity: 0.07,
        kicker: "rgba(242,245,251,.82)", dot: INK, btnBg: PAPER, btnFg: INK, bar: INK,
    },
    /* Deep navy: 40% accent into Ink, so it is a shade of the palette rather
       than a new hue. Dark enough that the accent reads again for the button,
       the bar and the stop; the kicker goes Paper because accent-on-navy text
       is too low-contrast at 24px. */
    navy: {bg: NAVY, fg: PAPER, rgb: "242,245,251", wm: PAPER, wmOpacity: 0.05, kicker: "rgba(242,245,251,.82)"},
};

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Rubik:wght@400;500;700&display=block";

function mark(name, height) {
    let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

function watermark(g) {
    let s = fs.readFileSync(path.join(SVG, "jaranow-symbol-white.svg"), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    s = s.replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${g.wm}"`);
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

/* ---------------------------------------------------------------------------
   CONCEPT B ART - situation drawings, set straight on the Paper field.
--------------------------------------------------------------------------- */
const plain = (content) => `<svg class="art-svg" viewBox="0 0 1000 560" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

/* A rolled rug lying in front of a washing machine it is far too long for -
   the reason rugs go uncleaned, drawn as a joke the viewer gets instantly. */
function machineArt() {
    const stripes = Array.from({length: 14}, (_, i) =>
        `<rect x="${226 + i * 36}" y="364" width="8" height="132" fill="${PAPER}" opacity=".22"/>`).join("");
    const fringe = Array.from({length: 10}, (_, i) => {
        const y = 378 + i * 12;
        return `<line x1="116" y1="${y}" x2="90" y2="${y + 2}" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
    }).join("");
    const bubbles = [[706, 262, 9], [772, 250, 6], [740, 312, 12], [690, 330, 5]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" opacity=".55"/>`).join("");
    return plain(`
    <defs><clipPath id="door"><circle cx="745" cy="290" r="80"/></clipPath></defs>
    <line x1="40" y1="500" x2="960" y2="500" stroke="${INK}" stroke-opacity=".14" stroke-width="4"/>
    <rect x="600" y="70" width="290" height="420" rx="26" fill="${INK}"/>
    <line x1="600" y1="160" x2="890" y2="160" stroke="${PAPER}" stroke-opacity=".14" stroke-width="3"/>
    <circle cx="648" cy="115" r="15" fill="${PAPER}" opacity=".85"/>
    <circle cx="692" cy="115" r="7" fill="${ACCENT}"/>
    <rect x="760" y="101" width="96" height="28" rx="8" fill="${ACCENT}"/>
    <circle cx="745" cy="290" r="102" fill="${PAPER}" opacity=".16"/>
    <circle cx="745" cy="290" r="80" fill="${ACCENT}"/>
    <g clip-path="url(#door)">
      <path d="M655 290 Q700 262 745 290 T835 290 L835 380 L655 380Z" fill="${PAPER}" opacity=".2"/>
      ${bubbles}
    </g>
    <rect x="626" y="490" width="34" height="10" rx="3" fill="${INK}"/>
    <rect x="830" y="490" width="34" height="10" rx="3" fill="${INK}"/>
    <rect x="150" y="364" width="610" height="132" fill="${ACCENT}"/>
    ${stripes}
    <rect x="186" y="364" width="14" height="132" fill="${PAPER}" opacity=".7"/>
    <rect x="712" y="364" width="14" height="132" fill="${PAPER}" opacity=".7"/>
    <ellipse cx="760" cy="430" rx="30" ry="66" fill="${ACCENT}"/>
    <ellipse cx="760" cy="430" rx="30" ry="66" fill="${INK}" opacity=".2"/>
    ${fringe}
    <ellipse cx="150" cy="430" rx="34" ry="66" fill="${PAPER}" stroke="${ACCENT}" stroke-width="6"/>
    <ellipse cx="152" cy="432" rx="22" ry="46" fill="none" stroke="${ACCENT}" stroke-width="5"/>
    <ellipse cx="154" cy="434" rx="11" ry="25" fill="none" stroke="${ACCENT}" stroke-width="5"/>
    <circle cx="156" cy="436" r="4" fill="${ACCENT}"/>`);
}

/* A car, a van and a school bus parked in marked bays, all gleaming, under a
   "your car park" tag - the fleet washed where it already stands. */
function carparkArt() {
    const wheel = (cx) => `<circle cx="${cx}" cy="462" r="26" fill="${INK}"/><circle cx="${cx}" cy="462" r="26" fill="none" stroke="${PAPER}" stroke-width="5"/><circle cx="${cx}" cy="462" r="9" fill="${PAPER}"/>`;
    const glass = `fill="${PAPER}" opacity=".92"`;
    const car = (x) => `
    <path d="M${x} 440 Q${x} 410 ${x + 30} 406 L${x + 60} 404 L${x + 95} 360 Q${x + 102} 352 ${x + 114} 352 L${x + 178} 352 Q${x + 190} 352 ${x + 198} 362 L${x + 226} 404 Q${x + 240} 408 ${x + 240} 424 L${x + 240} 452 Q${x + 240} 462 ${x + 230} 462 L${x + 10} 462 Q${x} 462 ${x} 452Z" fill="${INK}"/>
    <path d="M${x + 104} 366 L${x + 146} 366 L${x + 146} 402 L${x + 76} 402Z" ${glass}/>
    <path d="M${x + 156} 366 L${x + 186} 366 L${x + 212} 402 L${x + 156} 402Z" ${glass}/>
    <rect x="${x}" y="426" width="240" height="8" fill="${ACCENT}"/>
    ${wheel(x + 55)}${wheel(x + 190)}`;
    const van = (x) => `
    <path d="M${x} 300 Q${x} 284 ${x + 16} 284 L${x + 180} 284 Q${x + 196} 284 ${x + 204} 298 L${x + 244} 372 Q${x + 250} 384 ${x + 250} 398 L${x + 250} 452 Q${x + 250} 462 ${x + 240} 462 L${x + 10} 462 Q${x} 462 ${x} 452Z" fill="${INK}"/>
    <path d="M${x + 186} 300 L${x + 200} 300 L${x + 236} 370 L${x + 186} 370Z" ${glass}/>
    <rect x="${x + 128}" y="300" width="44" height="50" rx="6" ${glass}/>
    <rect x="${x}" y="408" width="250" height="10" fill="${ACCENT}"/>
    ${wheel(x + 55)}${wheel(x + 200)}`;
    const bus = (x) => `
    <rect x="${x}" y="260" width="270" height="202" rx="20" fill="${INK}"/>
    ${Array.from({length: 5}, (_, i) => `<rect x="${x + 16 + i * 50}" y="282" width="40" height="62" rx="6" ${glass}/>`).join("")}
    <rect x="${x}" y="380" width="270" height="10" fill="${ACCENT}"/>
    ${wheel(x + 60)}${wheel(x + 215)}`;
    const bay = (x) => `<line x1="${x}" y1="300" x2="${x}" y2="490" stroke="${INK}" stroke-opacity=".16" stroke-width="6" stroke-linecap="round"/>`;
    return plain(`
    <line x1="30" y1="490" x2="970" y2="490" stroke="${INK}" stroke-opacity=".16" stroke-width="4"/>
    ${[40, 345, 640, 960].map(bay).join("")}
    ${car(72)}${van(368)}${bus(668)}
    ${sparkle(250, 318, 18, ACCENT)}${sparkle(470, 246, 14, ACCENT)}${sparkle(930, 222, 20, ACCENT)}
    <rect x="340" y="120" width="320" height="58" rx="29" fill="${INK}"/>
    <path d="M378 134 a13 13 0 0 1 13 13 c0 10 -13 22 -13 22 s-13 -12 -13 -22 a13 13 0 0 1 13 -13z" fill="${ACCENT}"/>
    <circle cx="378" cy="147" r="5" fill="${INK}"/>
    <text x="408" y="157" font-family="Rubik" font-weight="500" font-size="22" letter-spacing="3" fill="${PAPER}">YOUR CAR PARK</text>`);
}

/* ---------------------------------------------------------------------------
   CONCEPT C ART - the outcome, drawn for the accent field. Objects are Paper
   and Ink so they hold against the blue; the accent reappears only where it
   sits on Paper (the rug pattern, the vans' stripe).
--------------------------------------------------------------------------- */

/* A small Ink pill with a Paper label, top centre of the panel. */
const pill = (text) => {
    const w = text.length * 15 + 56;
    return `<rect x="${500 - w / 2}" y="34" width="${w}" height="54" rx="27" fill="${INK}"/>
    <text x="500" y="69" text-anchor="middle" font-family="Rubik" font-weight="500" font-size="21" letter-spacing="3" fill="${PAPER}">${text}</text>`;
};

/* A calm living room: sofa, lamp, plant, a framed picture - and the fresh rug
   laid in front, the brightest thing in the scene. */
function roomArt() {
    const weave = `<pattern id="weave-c" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M2 4 H8 M10 12 H16 M12 2 V8 M4 10 V16" stroke="${ACCENT}" stroke-width="1.6" stroke-linecap="round" opacity=".18"/></pattern>`;
    const fringe = (x0, x1, y) => Array.from({length: Math.floor((x1 - x0) / 14)}, (_, i) =>
        `<line x1="${x0 + i * 14}" y1="${y}" x2="${x0 + i * 14}" y2="${y + 14}" stroke="${PAPER}" stroke-width="4" stroke-linecap="round"/>`).join("");
    return plain(`
    <defs>${weave}</defs>
    ${pill("BACK LOOKING NEW")}
    <line x1="30" y1="430" x2="970" y2="430" stroke="${PAPER}" stroke-opacity=".3" stroke-width="3"/>
    <!-- picture on the wall -->
    <rect x="410" y="130" width="180" height="110" rx="6" fill="none" stroke="${PAPER}" stroke-opacity=".55" stroke-width="6"/>
    <path d="M430 222 L480 176 L516 206 L546 184 L572 222Z" fill="${PAPER}" opacity=".45"/>
    <!-- sofa -->
    <rect x="270" y="262" width="460" height="104" rx="30" fill="${INK}"/>
    <rect x="236" y="330" width="528" height="76" rx="24" fill="${INK}"/>
    <rect x="222" y="300" width="64" height="106" rx="24" fill="${INK}"/>
    <rect x="714" y="300" width="64" height="106" rx="24" fill="${INK}"/>
    <line x1="500" y1="338" x2="500" y2="398" stroke="${PAPER}" stroke-opacity=".12" stroke-width="3"/>
    <rect x="252" y="404" width="14" height="26" rx="4" fill="${INK}"/>
    <rect x="734" y="404" width="14" height="26" rx="4" fill="${INK}"/>
    <!-- lamp -->
    <line x1="852" y1="200" x2="852" y2="430" stroke="${INK}" stroke-width="7"/>
    <rect x="826" y="424" width="52" height="8" rx="4" fill="${INK}"/>
    <path d="M812 200 L892 200 L872 146 L832 146Z" fill="${PAPER}"/>
    <!-- plant -->
    <path d="M118 360 Q96 300 120 250 Q138 300 126 360Z" fill="${PAPER}" opacity=".9"/>
    <path d="M132 360 Q150 292 196 262 Q176 322 140 362Z" fill="${PAPER}" opacity=".75"/>
    <path d="M114 362 Q72 318 70 276 Q108 306 122 362Z" fill="${PAPER}" opacity=".6"/>
    <path d="M96 360 L156 360 L148 430 L104 430Z" fill="${INK}"/>
    <!-- the rug: fresh, laid in perspective in front of the sofa -->
    ${fringe(128, 876, 540)}
    <path d="M210 440 L790 440 L880 540 L120 540Z" fill="${INK}"/>
    <path d="M232 450 L768 450 L848 530 L152 530Z" fill="${PAPER}"/>
    <path d="M232 450 L768 450 L848 530 L152 530Z" fill="url(#weave-c)"/>
    <path d="M266 462 L734 462 L800 518 L200 518Z" fill="none" stroke="${ACCENT}" stroke-width="5" stroke-dasharray="14 10"/>
    <path d="M500 470 L540 490 L500 510 L460 490Z" fill="${ACCENT}"/>
    ${sparkle(250, 436, 22, PAPER)}${sparkle(760, 428, 16, PAPER)}${sparkle(900, 512, 18, PAPER)}`);
}

/* Three matching company vans lined up, all spotless - the fleet as a
   customer sees it. Paper bodies so they glow against the dark field. */
function fleetArt() {
    const wheel = (cx) => `<circle cx="${cx}" cy="440" r="30" fill="${INK}"/><circle cx="${cx}" cy="440" r="11" fill="${PAPER}"/>`;
    const van = (x) => `
    <path d="M${x} 262 Q${x} 244 ${x + 18} 244 L${x + 196} 244 Q${x + 214} 244 ${x + 222} 260 L${x + 266} 344 Q${x + 272} 356 ${x + 272} 372 L${x + 272} 430 Q${x + 272} 440 ${x + 262} 440 L${x + 10} 440 Q${x} 440 ${x} 430Z" fill="${PAPER}"/>
    <path d="M${x + 206} 262 L${x + 220} 262 L${x + 258} 340 L${x + 206} 340Z" fill="${INK}"/>
    <rect x="${x}" y="382" width="272" height="14" fill="${ACCENT}"/>
    <rect x="${x + 26}" y="286" width="150" height="16" rx="8" fill="${INK}" opacity=".12"/>
    <rect x="${x + 26}" y="314" width="96" height="16" rx="8" fill="${INK}" opacity=".12"/>
    ${wheel(x + 62)}${wheel(x + 218)}`;
    // Shifted up so the row sits centred in the panel now there is no tag above it.
    return plain(`<g transform="translate(0,-60)">
    <line x1="30" y1="472" x2="970" y2="472" stroke="${PAPER}" stroke-opacity=".3" stroke-width="3"/>
    ${van(28)}${van(364)}${van(700)}
    ${sparkle(250, 214, 20, PAPER)}${sparkle(590, 204, 16, PAPER)}${sparkle(930, 220, 22, PAPER)}
    ${sparkle(120, 470, 12, PAPER)}${sparkle(820, 480, 12, PAPER)}</g>`);
}

const ARTS = {rug: rugArt, van: vanArt, machine: machineArt, carpark: carparkArt, room: roomArt, fleet: fleetArt};

/* ---------------------------------------------------------------------------
   THE PAGE
--------------------------------------------------------------------------- */
function css(f, g) {
    const BAR = 22;
    const fg = (a) => `rgba(${g.rgb},${a})`;
    return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${f.w}px;height:${f.h}px;overflow:hidden}
  body{
    background:${g.bg}; color:${g.fg}; font-family:'Rubik',system-ui,sans-serif;
    position:relative; display:flex; flex-direction:column;
    padding:${f.padTop}px ${f.pad}px ${f.padBottom + BAR}px;
  }
  .dots{position:absolute; inset:0;
    background-image:radial-gradient(${fg(0.08)} 2px, transparent 2px);
    background-size:36px 36px}
  .wm{position:absolute; right:-260px; bottom:${f.padBottom + 40}px; height:760px; width:auto; opacity:${g.wmOpacity}}
  .top,.kicker,.art,.copy,.cta,.url{position:relative; z-index:2}
  .kicker{margin-top:26px; font-size:24px; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:${g.kicker || ACCENT}}
  /* The picture sits on a slightly lifted panel so it reads as one object. */
  .art{margin-top:36px; height:${f.art}px; flex:none; border-radius:28px; background:${fg(0.045)};
    border:2px solid ${fg(0.08)}; overflow:hidden}
  .art-svg{width:100%; height:100%; display:block}
  .copy{flex:1; display:flex; flex-direction:column; justify-content:center; padding:8px 0}
  /* Stage layout (concept B): headline leads, the drawing fills what is left. */
  .stage .copy{flex:none; margin-top:34px; padding:0}
  .stage .art{flex:1; height:auto; min-height:300px; margin:40px 0}
  /* List layout (concept D): the headline, then an Ink card of ticked results
     that fills the space. The card is Ink on any ground, so it reads as the
     one solid object on the page. */
  .list .copy{flex:none; margin-top:34px; padding:0}
  .points{flex:1; margin:44px 0; background:${INK}; color:${PAPER}; border-radius:32px;
    padding:12px 52px; display:flex; flex-direction:column; justify-content:space-evenly}
  .point{display:flex; align-items:center; gap:34px; padding:26px 0}
  .point + .point{border-top:2px solid rgba(242,245,251,.1)}
  .tick{flex:none; width:${Math.round(f.sub * 2.1)}px; height:${Math.round(f.sub * 2.1)}px; border-radius:50%;
    background:${ACCENT}; display:flex; align-items:center; justify-content:center}
  .tick svg{width:52%; height:52%}
  .point .t{font-size:${Math.round(f.sub * 1.35)}px; font-weight:700; letter-spacing:-.01em; line-height:1.1}
  .point .d{margin-top:8px; font-size:${Math.round(f.sub * 0.9)}px; line-height:1.35; color:rgba(242,245,251,.66)}
  /* The one loud line. Archivo Black ships one weight - never bold it.
     white-space:pre: lines break only at the \\n in the copy. */
  h1{font-family:'Archivo Black',system-ui,sans-serif; font-weight:400; font-size:${f.head}px;
    line-height:1.0; letter-spacing:-.015em; white-space:pre}
  h1 .dot{color:${g.dot || ACCENT}}
  .sub{margin-top:24px; font-size:${f.sub}px; line-height:1.38; color:${fg(0.74)}; max-width:900px}
  .cta{display:flex; align-items:center; gap:28px}
  .btn{display:inline-flex; align-items:center; gap:18px; background:${g.btnBg || ACCENT}; color:${g.btnFg || "#fff"};
    font-size:38px; font-weight:700; padding:30px 44px; border-radius:999px; white-space:nowrap}
  .btn svg{width:34px; height:34px}
  .wa .label{font-size:20px; font-weight:500; letter-spacing:.2em; text-transform:uppercase; color:${fg(0.55)}}
  .wa .number{margin-top:6px; font-size:40px; font-weight:700; letter-spacing:-.01em; white-space:nowrap}
  .bar{position:absolute; left:0; right:0; bottom:0; height:${BAR}px; background:${g.bar || ACCENT}}
`;
}

/* Shrink the headline until its longest line fits. Runs after fonts load -
   Archivo Black is much wider than the fallback. Only ever shrinks. */
const FIT = `document.fonts.ready.then(() => {
  const h = document.querySelector('h1');
  let size = parseFloat(getComputedStyle(h).fontSize);
  while (h.scrollWidth > h.clientWidth && size > 40) { size -= 2; h.style.fontSize = size + 'px'; }
});`;

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const headline = (h) => {
    const s = esc(h);
    return s.endsWith(".") ? `${s.slice(0, -1)}<span class="dot">.</span>` : s;
};

const page = (ad, f) => {
    const g = GROUNDS[ad.ground || "ink"];
    const layout = ad.layout || "split";
    const copy = `<div class="copy">
  <h1>${headline(ad.headline)}</h1>
  ${ad.sub ? `<p class="sub">${esc(ad.sub)}</p>` : ""}
</div>`;
    const TICK = `<svg viewBox="0 0 24 24" fill="none" stroke="${PAPER}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
    const body = {
        split: () => `<div class="art">${ARTS[ad.art]()}</div>\n${copy}`,
        stage: () => `${copy}\n<div class="art">${ARTS[ad.art]()}</div>`,
        list: () => `${copy}
<div class="points">${ad.points.map(([t, d]) => `
  <div class="point"><span class="tick">${TICK}</span><div><p class="t">${esc(t)}</p><p class="d">${esc(d)}</p></div></div>`).join("")}
</div>`,
    }[layout]();
    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet">
<style>${css(f, g)}</style></head><body class="${layout}">
<div class="dots"></div>
${watermark(g)}
<div class="top">${mark(ad.lockup, Math.round(f.lockup * (ad.lockupScale || 1)))}</div>
<p class="kicker">${esc(ad.kicker)}</p>
${body}
<div class="cta">
  <span class="btn">${esc(ad.cta.button)} ${ARROW}</span>
  <div class="wa"><p class="label">WhatsApp</p><p class="number">${esc(ad.cta.number)}</p></div>
</div>
<div class="bar"></div>
<script>${FIT}</script>
</body></html>`;
};

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
