/* Jaranow — recruitment posters: one HTML per JOBS x FORMATS entry;
   rasterize-poster.sh shoots them. All formats share a 216 design-mm width and
   render at their own px/mm. Never print an unconfirmed wage, shift or benefit.
   See CLAUDE.md "Recruitment posters".

   Usage: node gen-poster.js <outdir>
*/
const fs = require("fs");
const path = require("path");
const {sparkle, DROP, attendant, SPONGE, KIT, GROUND_LINE, WASH_SCENE} = require("./art");

const OUT = process.argv[2] || path.join(__dirname, "poster");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), {recursive: true});

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";
const NAVY = "#173475"; // 40% ACCENT into INK - a palette shade, not a new hue

/* w/h in design-mm (w always 216); px = output width. pxH pins print height:
   rounding 216mm to 2551px loses half a pixel. bar must exceed the bleed or the
   cut removes it. `type` multiplies every type size (phones read small).
   `src` is the ?src= the Book reports on - docs/hiring-playbook.html section 3.
   Only print carries a QR: nobody can scan the phone they are holding. */
const FORMATS = [
    {
        name: "a4",
        label: "A4 print, 210x297mm + 3mm bleed @ 300dpi",
        w: 216,
        h: 303,
        px: 2551,
        pxH: 3579, // 297 + 6mm bleed at 300dpi, exactly
        margin: 15, // 3mm bleed + 12mm quiet
        padBottom: 21,
        bar: 11, // 3 trimmed + 8 visible
        // Drop back toward 1 if a posting grows.
        type: 1.18,
        src: "qrcode",
        qr: true,
    },
    {
        name: "feed",
        label: "Meta feed 4:5, 1080x1350",
        w: 216,
        h: 270,
        px: 1080,
        margin: 13,
        padBottom: 17,
        bar: 7,
        // Runs out of room first: grow a posting and this must come back toward 1.
        type: 1.12,
        src: "meta",
    },
    {
        // padTop/padBottom clear Meta's UI (~top 13%, bottom 18%) - the air is deliberate.
        name: "story",
        label: "Meta story / Reels / WhatsApp status 9:16, 1080x1920",
        w: 216,
        h: 384,
        px: 1080,
        margin: 15,
        padTop: 52,
        padBottom: 74,
        bar: 7,
        type: 1.32,
        src: "meta",
    },
];

const CAREERS = "jaranow.com/careers";
const WHATSAPP = "0903 862 2012";
const WA_LINK = "https://wa.me/2349038622012";

// Figures as confirmed on /careers. A sheet on a wall outlives a deploy.
const ATTENDANT = {
    lockup: "jaranow-carwash-by-jaranow",
    tag: "We're hiring",
    kicker: "Car wash attendant · Full-time · Gwarinpa",
    facts: [
        {label: "Salary", value: "₦50,000–₦70,000", unit: "a month"},
        {label: "Work days", value: "5–6 days a week", unit: "8am–7pm"},
        {label: "Where", value: "6th Avenue", unit: "Gwarinpa, Abuja"},
    ],
    apply: {
        button: "Apply now",
        promise: "No CV · No form fee",
        scan: "Scan to apply",
        detail: "No CV. No form fee. Seven short questions on your phone.",
    },
};

/* One blunt headline over one picture: nobody should have to work out what the
   sheet is saying. Concepts differ in idea and look, so a winner says something:
   A the work, B the place, C how easy applying is, D the plain announcement.
   ground: "ink" | "paper" | "navy". layout: "split" (art, headline) |
   "stage" (headline, art). panel: "paper" puts the art on a Paper
   card, which any drawing with a person in it needs on a dark ground.
   Headline breaks only at \n. Sell on care and integrity, never on out-paying.

   Also worth testing: "Stay near Gwarinpa?\nWork near home." (B),
   "No CV. No connection.\nJust good work." (C), "We dey hire." as the tag.
*/
const JOBS = [
    {
        ...ATTENDANT,
        file: "poster-carwash-attendant-a",
        ground: "paper",
        layout: "split",
        art: "wash",
        headline: "Sharp eyes?\nWe have work for you.",
        sub: "Carwash by Jaranow is hiring attendants. Never washed cars before? We\u00a0will\u00a0teach\u00a0you.",
    },
    {
        ...ATTENDANT,
        file: "poster-carwash-attendant-b",
        ground: "ink",
        layout: "stage",
        art: "bay",
        panel: "paper",
        headline: "Car wash job\nin Gwarinpa.",
        sub: "We need attendants at 6th Avenue. Stay close by? Work near\u00a0home.",
    },
    {
        ...ATTENDANT,
        file: "poster-carwash-attendant-c",
        ground: "navy",
        layout: "stage",
        art: "phone",
        headline: "Apply free\non your phone.",
        sub: "Car wash attendant job at 6th Avenue, Gwarinpa.",
    },
    {
        ...ATTENDANT,
        file: "poster-carwash-attendant-d",
        ground: "ink",
        layout: "split",
        art: "crew",
        panel: "paper",
        // The headline says it, so the tag and kicker carry the rest.
        tag: "Full-time",
        kicker: "Carwash by Jaranow · 6th Avenue, Gwarinpa",
        headline: "We're hiring\ncar wash attendants.",
        sub: "Join the team. Never washed cars before? We\u00a0will\u00a0teach\u00a0you.",
    },
    {
        // No /careers form for cashiers yet, so this one applies by WhatsApp.
        file: "poster-carwash-cashier",
        lockup: "jaranow-carwash-by-jaranow",
        ground: "navy",
        layout: "split",
        art: "cashier",
        panel: "paper",
        tag: "We're hiring",
        kicker: "Cashier · Full-time · Gwarinpa",
        headline: "We're hiring\na cashier.",
        sub: "Straight with money and good with numbers? WhatsApp us your name and where you\u00a0live.",
        facts: [
            {label: "Salary", value: "₦50,000–₦70,000", unit: "a month"},
            {label: "Hours", value: "8am–7pm", unit: "Daily"},
            {label: "Where", value: "6th Avenue", unit: "Gwarinpa, Abuja"},
        ],
        apply: {
            whatsapp: true,
            button: "Apply now",
            promise: "On WhatsApp",
            scan: "Scan to WhatsApp us",
            detail: "Send your name and where you live.",
        },
    },
];

// Lockup colourway follows the ground (BRAND-STANDARD 8.8).
const GROUNDS = {
    ink: {bg: INK, fg: PAPER, rgb: "242,245,251", way: "white", wm: PAPER, wmOpacity: 0.05},
    paper: {bg: PAPER, fg: INK, rgb: "14,21,38", way: "duo", wm: INK, wmOpacity: 0.045},
    // accent-on-navy text is too low-contrast at kicker size
    navy: {bg: NAVY, fg: PAPER, rgb: "242,245,251", way: "white", wm: PAPER, wmOpacity: 0.05, kicker: "rgba(242,245,251,.82)"},
};

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Rubik:wght@400;500;700&display=block";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function mark(name, height) {
    let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

function watermark(fill = PAPER) {
    let s = fs.readFileSync(path.join(SVG, "jaranow-symbol-white.svg"), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    s = s.replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${fill}"`);
    return s.replace("<svg ", '<svg class="wm" ');
}

const pxH = (f) => f.pxH || Math.round((f.px * f.h) / f.w);

/* QR, version 3-M, byte mode, mask 0: 42 bytes, which the careers link fits.
   Hand-rolled so the brand scripts keep no dependencies. Scan the printed A4
   after touching this - a wrong module still looks like a QR code. */
function qrMatrix(text) {
    const N = 29, DATA = 44, EC = 26;
    const bytes = [...Buffer.from(text, "utf8")];
    if (bytes.length > 42) throw new Error(`QR: "${text}" is ${bytes.length} bytes, limit is 42`);

    const bits = [];
    const push = (v, n) => {
        for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1);
    };
    push(4, 4);
    push(bytes.length, 8);
    bytes.forEach((b) => push(b, 8));
    push(0, Math.min(4, DATA * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
    for (let p = 0; data.length < DATA; p ^= 1) data.push(p ? 0x11 : 0xec);

    const exp = [], log = [];
    for (let i = 0, x = 1; i < 255; i++) {
        exp[i] = x;
        log[x] = i;
        x <<= 1;
        if (x & 256) x ^= 0x11d;
    }
    const mul = (a, b) => (a && b ? exp[(log[a] + log[b]) % 255] : 0);
    let gen = [1];
    for (let i = 0; i < EC; i++) {
        const next = new Array(gen.length + 1).fill(0);
        gen.forEach((c, j) => {
            next[j] ^= c;
            next[j + 1] ^= mul(c, exp[i]);
        });
        gen = next;
    }
    const rem = new Array(EC).fill(0);
    for (const d of data) {
        const factor = d ^ rem.shift();
        rem.push(0);
        for (let j = 0; j < EC; j++) rem[j] ^= mul(gen[j + 1], factor);
    }
    const stream = [];
    data.concat(rem).forEach((b) => {
        for (let i = 7; i >= 0; i--) stream.push((b >> i) & 1);
    });

    const m = Array.from({length: N}, () => new Array(N).fill(null));
    const set = (r, c, v) => {
        if (r >= 0 && r < N && c >= 0 && c < N) m[r][c] = v;
    };
    const finder = (r0, c0) => {
        for (let r = -1; r <= 7; r++) {
            for (let c = -1; c <= 7; c++) {
                const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
                const ring = r === 0 || r === 6 || c === 0 || c === 6;
                const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
                set(r0 + r, c0 + c, inside && (ring || core) ? 1 : 0);
            }
        }
    };
    finder(0, 0);
    finder(0, N - 7);
    finder(N - 7, 0);
    for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) set(22 + r, 22 + c, Math.max(Math.abs(r), Math.abs(c)) !== 1 ? 1 : 0);
    }
    for (let i = 8; i < N - 8; i++) m[6][i] = m[i][6] = i % 2 === 0 ? 1 : 0;

    // Level M + mask 0, BCH-encoded and XOR-masked: a constant.
    const FORMAT = 0x5412;
    const fbit = (i) => (FORMAT >> i) & 1;
    for (let i = 0; i < 6; i++) m[i][8] = fbit(i);
    m[7][8] = fbit(6);
    m[8][8] = fbit(7);
    m[8][7] = fbit(8);
    for (let i = 9; i < 15; i++) m[8][14 - i] = fbit(i);
    for (let i = 0; i < 8; i++) m[8][N - 1 - i] = fbit(i);
    for (let i = 8; i < 15; i++) m[N - 15 + i][8] = fbit(i);
    m[N - 8][8] = 1;

    let k = 0;
    let up = true;
    for (let c = N - 1; c > 0; c -= 2) {
        if (c === 6) c--;
        for (let i = 0; i < N; i++) {
            const r = up ? N - 1 - i : i;
            for (const cc of [c, c - 1]) {
                if (m[r][cc] !== null) continue;
                m[r][cc] = (stream[k++] || 0) ^ ((r + cc) % 2 === 0 ? 1 : 0);
            }
        }
        up = !up;
    }
    return m;
}

function qrSvg(text) {
    const m = qrMatrix(text);
    let d = "";
    m.forEach((row, r) => row.forEach((v, c) => (d += v ? `M${c} ${r}h1v1h-1z` : "")));
    return `<svg viewBox="-2 -2 ${m.length + 4} ${m.length + 4}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><path d="${d}" fill="${INK}"/></svg>`;
}

/* Art lives in a 1000x560 box, flat, in palette colours only (no skin brown -
   one accent, BRAND-STANDARD 4.2): people are Ink, so they go on Paper. */
const plain = (content, box = "0 0 1000 560") =>
    `<svg class="art-svg" viewBox="${box}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

// A, B and D share one scene (art.js) so the three read as one campaign.
function washArt() {
    return plain(`${GROUND_LINE}${WASH_SCENE}${KIT}`, "20 96 1050 404");
}

// The same scene under the bay's canopy, which says what and where.
function bayArt() {
    return plain(`
    <rect x="30" y="96" width="1020" height="382" fill="${INK}" opacity=".04"/>
    <rect x="14" y="96" width="16" height="382" fill="${INK}"/>
    <rect x="1050" y="96" width="16" height="382" fill="${INK}"/>
    <rect x="-2" y="30" width="1084" height="58" rx="8" fill="${INK}"/>
    <rect x="-2" y="88" width="1084" height="10" fill="${ACCENT}"/>
    <text x="38" y="69" font-family="Rubik" font-weight="700" font-size="27" letter-spacing="9" fill="${PAPER}">CAR WASH</text>
    <path d="M742 44 a13 13 0 0 1 13 13 c0 10 -13 22 -13 22 s-13 -12 -13 -22 a13 13 0 0 1 13 -13z" fill="${ACCENT}"/>
    <circle cx="742" cy="57" r="5" fill="${INK}"/>
    <text x="1050" y="67" text-anchor="end" font-family="Rubik" font-weight="500" font-size="19" letter-spacing="2.4" fill="${PAPER}">6TH AVENUE, GWARINPA</text>
    ${GROUND_LINE}${WASH_SCENE}${KIT}`, "-6 20 1092 480");
}

// Applying is the picture: the form on a phone, a thumb on the button, what it does not ask for.
function phoneArt() {
    const badge = (x, y, text, rot) => {
        const w = text.length * 21 + 120;
        return `<g transform="rotate(${rot} ${x + w / 2} ${y + 42})">
      <rect x="${x}" y="${y}" width="${w}" height="84" rx="42" fill="${PAPER}"/>
      <circle cx="${x + 44}" cy="${y + 42}" r="26" fill="${ACCENT}"/>
      <path d="M${x + 32} ${y + 43} l9 9 l16 -18" fill="none" stroke="${PAPER}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${x + 86}" y="${y + 55}" font-family="Rubik" font-weight="700" font-size="36" letter-spacing="-.3" fill="${INK}">${text}</text></g>`;
    };
    const field = (y, label, value) => `
    <rect x="400" y="${y}" width="${label}" height="8" rx="4" fill="${INK}" opacity=".3"/>
    <rect x="400" y="${y + 16}" width="200" height="44" rx="10" fill="#fff" stroke="${ACCENT}" stroke-width="2.5"/>
    <rect x="414" y="${y + 34}" width="${value}" height="9" rx="4.5" fill="${INK}" opacity=".75"/>
    <path d="M568 ${y + 38} l6 6 l11 -12" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    return plain(`
    <circle cx="500" cy="230" r="236" fill="${ACCENT}" opacity=".22"/>
    <rect x="360" y="14" width="280" height="432" rx="42" fill="${INK}"/>
    <rect x="360" y="14" width="280" height="432" rx="42" fill="none" stroke="${PAPER}" stroke-opacity=".3" stroke-width="3"/>
    <rect x="376" y="32" width="248" height="396" rx="28" fill="${PAPER}"/>
    <rect x="468" y="44" width="64" height="10" rx="5" fill="${INK}"/>
    <g transform="translate(481,62) scale(.38)"><path fill-rule="evenodd" fill="${ACCENT}" d="${DROP}"/></g>
    <text x="500" y="136" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="22" fill="${INK}">Car wash attendant</text>
    <text x="500" y="159" text-anchor="middle" font-family="Rubik" font-weight="400" font-size="15" fill="${INK}" fill-opacity=".6">6th Avenue, Gwarinpa</text>
    ${field(186, 62, 104)}${field(262, 92, 78)}
    <rect x="400" y="346" width="200" height="60" rx="30" fill="${ACCENT}"/>
    <text x="500" y="385" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="24" fill="#fff">Apply now</text>
    <path d="M704 600 L612 420" stroke="${PAPER}" stroke-opacity=".3" stroke-width="78" stroke-linecap="round"/>
    <path d="M704 600 L612 420" stroke="${INK}" stroke-width="72" stroke-linecap="round"/>
    <ellipse cx="608" cy="412" rx="20" ry="15" transform="rotate(62 608 412)" fill="${PAPER}" opacity=".16"/>
    ${badge(108, 70, "No CV", -5)}${badge(4, 226, "No form fee", 4)}${badge(672, 110, "2 minutes", 5)}
    ${sparkle(320, 44, 16, PAPER)}${sparkle(930, 290, 20, PAPER)}${sparkle(700, 50, 12, PAPER)}${sparkle(250, 400, 14, PAPER)}`, "0 0 1000 460");
}

// The scene with a second pair of hands on the far side - the first attendant mirrored.
function crewArt() {
    return plain(`
    <line x1="24" y1="478" x2="1072" y2="478" stroke="${INK}" stroke-opacity=".14" stroke-width="3"/>
    ${WASH_SCENE}
    <g transform="translate(1244,0) scale(-1,1)">${attendant(SPONGE)}</g>`, "20 96 1060 404");
}

// The counter: a cashier behind it, the Book on a tablet, a card machine, a receipt.
function cashierArt() {
    const bars = (x, y, widths, fill, o) =>
        widths.map((w, i) => `<rect x="${x}" y="${y + i * 16}" width="${w}" height="7" rx="3.5" fill="${fill}" opacity="${o}"/>`).join("");
    return plain(`
    <line x1="420" y1="20" x2="420" y2="52" stroke="${INK}" stroke-width="4"/>
    <line x1="580" y1="20" x2="580" y2="52" stroke="${INK}" stroke-width="4"/>
    <rect x="360" y="50" width="280" height="58" rx="10" fill="${INK}"/>
    <text x="504" y="89" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="26" letter-spacing="9" fill="${PAPER}">CASHIER</text>

    <rect x="487" y="232" width="26" height="30" fill="${INK}"/>
    <rect x="414" y="252" width="172" height="240" rx="48" fill="${NAVY}"/>
    <g transform="translate(496,282) scale(.36)"><path fill-rule="evenodd" fill="${PAPER}" d="${DROP}"/></g>
    <circle cx="500" cy="194" r="46" fill="${INK}"/>
    <path d="M436 290 L404 356 L452 388" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M436 286 L420 322" stroke="${NAVY}" stroke-width="38" stroke-linecap="round"/>
    <path d="M564 290 L604 350 L668 338" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M564 286 L582 320" stroke="${NAVY}" stroke-width="38" stroke-linecap="round"/>
    <g transform="rotate(8 700 300)">
      <rect x="664" y="246" width="72" height="106" rx="6" fill="#fff" stroke="${INK}" stroke-opacity=".2" stroke-width="3"/>
      ${bars(676, 262, [48, 36, 44], INK, 0.35)}
      <rect x="676" y="318" width="48" height="12" rx="6" fill="${ACCENT}"/>
    </g>

    <rect x="208" y="252" width="168" height="124" rx="14" fill="${INK}"/>
    <rect x="218" y="262" width="148" height="104" rx="7" fill="${PAPER}"/>
    ${bars(232, 278, [84, 62, 96], INK, 0.4)}
    <rect x="232" y="332" width="120" height="20" rx="10" fill="${ACCENT}"/>
    <path d="M276 376 L308 376 L318 398 L266 398Z" fill="${INK}"/>

    <rect x="778" y="322" width="66" height="76" rx="10" fill="${NAVY}"/>
    <rect x="788" y="332" width="46" height="22" rx="4" fill="${PAPER}"/>
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${797 + c * 14}" cy="${365 + r * 10}" r="3" fill="${PAPER}" opacity=".7"/>`).join("")).join("")}

    <rect x="110" y="396" width="780" height="26" rx="8" fill="${ACCENT}"/>
    <rect x="130" y="422" width="740" height="118" fill="${INK}"/>
    <g transform="translate(470,440) scale(.6)"><path fill-rule="evenodd" fill="${PAPER}" opacity=".9" d="${DROP}"/></g>
    ${sparkle(300, 190, 18, ACCENT)}${sparkle(742, 190, 22, ACCENT)}${sparkle(170, 330, 12, ACCENT)}${sparkle(880, 280, 13, ACCENT)}`, "60 14 880 526");
}

const ARTS = {wash: washArt, bay: bayArt, phone: phoneArt, crew: crewArt, cashier: cashierArt};

// `u` = design-mm geometry; `t` = type, which also carries f.type.
const css = (f, g) => {
    const u = (n) => Math.round((n * f.px) / f.w);
    const t = (n) => Math.round((n * f.type * f.px) / f.w);
    const fg = (a) => `rgba(${g.rgb},${a})`;
    const rule = `${Math.max(1, u(0.3))}px solid ${fg(0.16)}`;
    return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${f.px}px;height:${pxH(f)}px;overflow:hidden}
  body{
    background:${g.bg}; color:${g.fg}; font-family:'Rubik',system-ui,sans-serif;
    position:relative; display:flex; flex-direction:column;
    padding:${u(f.padTop || f.margin)}px ${u(f.margin)}px ${u(f.padBottom || f.margin + 6)}px;
  }
  .dots{position:absolute; inset:0;
    background-image:radial-gradient(${fg(0.09)} ${u(0.5)}px, transparent ${u(0.5)}px);
    background-size:${u(9)}px ${u(9)}px}
  /* Bleeds off the right edge only - see CLAUDE.md "Price lists". */
  .wm{position:absolute; right:${-u(52)}px; bottom:${u((f.padBottom || 0) + 8)}px; height:${u(150)}px; width:auto; opacity:${g.wmOpacity}}
  .top,.kicker,.art,h1,.sub,.facts,.cta{position:relative; z-index:2}

  .top{display:flex; justify-content:space-between; align-items:center}
  .tag{background:${ACCENT}; color:#fff; white-space:nowrap; border-radius:999px;
    padding:${u(2.8)}px ${u(5.5)}px; font-size:${t(3.5)}px; font-weight:500;
    letter-spacing:.2em; text-transform:uppercase}
  .kicker{margin-top:${u(7)}px; font-size:${t(3.8)}px; font-weight:500; letter-spacing:.2em;
    text-transform:uppercase; white-space:nowrap; color:${g.kicker || ACCENT}}

  /* The picture or the card takes whatever height the format has left over, so
     one posting sits properly on 4:5, A4 and 9:16 without per-format tuning. */
  .art{margin-top:${u(8)}px; flex:1; min-height:0; overflow:hidden;
    border-radius:${u(5.5)}px; background:${fg(0.045)}; border:${Math.max(1, u(0.4))}px solid ${fg(0.08)}}
  .art-svg{width:100%; height:100%; display:block}
  .art.paper{background:${PAPER}; border-color:transparent}

  /* The one loud line (BRAND-STANDARD 6.2). Never bold it; breaks only at \\n. */
  h1{margin-top:${u(8)}px; font-family:'Archivo Black',system-ui,sans-serif; font-weight:400;
    font-size:${u(19)}px; line-height:1.02; letter-spacing:-.015em; white-space:pre}
  h1 .dot{color:${ACCENT}}
  .sub{margin-top:${u(4.5)}px; font-size:${t(5)}px; line-height:1.4; color:${fg(0.74)}}

  .facts{margin-top:${u(8)}px; padding-top:${u(5.5)}px; border-top:${rule};
    display:grid; grid-template-columns:repeat(3,auto); justify-content:space-between}
  .fact .label{font-size:${t(3.1)}px; font-weight:500; letter-spacing:.22em; text-transform:uppercase; color:${fg(0.5)}}
  .fact .value{margin-top:${u(1.4)}px; font-size:${t(5.3)}px; font-weight:700; letter-spacing:-.01em; white-space:nowrap}
  .fact .unit{margin-top:${u(0.5)}px; font-size:${t(4)}px; color:${fg(0.66)}; white-space:nowrap}

  .cta{margin-top:${u(8)}px; display:flex; align-items:center; gap:${u(6.5)}px}
  .btn{display:inline-flex; align-items:center; gap:${u(3.5)}px; background:${ACCENT}; color:#fff;
    font-size:${t(6.4)}px; font-weight:700; padding:${u(5)}px ${u(8)}px; border-radius:999px; white-space:nowrap}
  .btn svg{width:${t(6)}px; height:${t(6)}px}
  .go .label{font-size:${t(3.3)}px; font-weight:500; letter-spacing:.2em; text-transform:uppercase; color:${fg(0.6)}}
  .go .url{margin-top:${u(1.2)}px; font-size:${t(6.6)}px; font-weight:700; letter-spacing:-.01em; white-space:nowrap}
  /* White tile on every ground: a scanner needs dark modules on a light field. */
  .qr{flex:none; width:${u(42)}px; height:${u(42)}px; background:#fff; padding:${u(2.4)}px;
    border-radius:${u(3)}px; border:${Math.max(1, u(0.3))}px solid ${fg(0.14)}}
  .qr svg{width:100%; height:100%; display:block}
  .go .scan{font-size:${t(8.4)}px; font-weight:700; letter-spacing:-.015em}
  .go .or{margin-top:${u(1.6)}px; font-size:${t(5)}px; color:${fg(0.74)}}
  .go .or b{font-weight:700; color:${g.fg}}
  .go .detail{margin-top:${u(2.2)}px; font-size:${t(3.9)}px; line-height:1.4; color:${fg(0.6)}}
  .go .wa{margin-top:${u(3)}px; font-size:${t(4.4)}px; color:${fg(0.74)}}
  .go .wa b{font-weight:700; color:${g.fg}}

  .bar{position:absolute; left:0; right:0; bottom:0; height:${u(f.bar)}px; background:${ACCENT}}
`;
};

// Runs after fonts load: Archivo Black is much wider than the fallback.
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

// `whatsapp` roles have no careers form: the QR and the big line are the number instead.
const applyBand = (a, f) => {
    const target = a.whatsapp ? WHATSAPP : CAREERS;
    return f.qr
        ? `<div class="cta">
  <div class="qr">${qrSvg(a.whatsapp ? WA_LINK : `https://${CAREERS}?src=${f.src}`)}</div>
  <div class="go">
    <p class="scan">${esc(a.scan)}</p>
    <p class="or">${a.whatsapp ? "or message" : "or go to"} <b>${target}</b></p>
    <p class="detail">${esc(a.detail)}</p>
    ${a.whatsapp ? "" : `<p class="wa">Can't scan? WhatsApp <b>${WHATSAPP}</b></p>`}
  </div>
</div>`
        : `<div class="cta">
  <span class="btn">${esc(a.button)} ${ARROW}</span>
  <div class="go"><p class="label">${esc(a.promise)}</p><p class="url">${target}</p></div>
</div>`;
};

const conceptPage = (j, f) => {
    const g = GROUNDS[j.ground];
    const u = (n) => Math.round((n * f.px) / f.w);
    const copy = `<h1>${headline(j.headline)}</h1>
${j.sub ? `<p class="sub">${esc(j.sub)}</p>` : ""}`;
    const art = `<div class="art${j.panel ? ` ${j.panel}` : ""}">${ARTS[j.art]()}</div>`;
    const body = j.layout === "split" ? `${art}\n${copy}` : `${copy}\n${art}`;
    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet">
<style>${css(f, g)}</style></head><body>
<div class="dots"></div>
${watermark(g.wm)}
<div class="top">${mark(`${j.lockup}-${g.way}`, u(25))}<span class="tag">${esc(j.tag)}</span></div>
<p class="kicker">${esc(j.kicker)}</p>
${body}
<div class="facts">${j.facts.map((x) => `
  <div class="fact"><p class="label">${esc(x.label)}</p><p class="value">${esc(x.value)}</p><p class="unit">${esc(x.unit)}</p></div>`).join("")}
</div>
${applyBand(j.apply, f)}
<div class="bar"></div>
<script>${FIT}</script>
</body></html>`;
};

const sizes = [];

for (const j of JOBS) {
    for (const f of FORMATS) {
        const base = `${j.file}-${f.name}`;
        fs.writeFileSync(path.join(OUT, "html", `${base}.html`), conceptPage(j, f));
        sizes.push(`${base} ${f.px} ${pxH(f)}`);
        console.log(`template  ${base}.html`);
    }
}

fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");

console.log(`\n${JOBS.length} postings x ${FORMATS.length} formats = ${sizes.length} posters -> ${path.join(OUT, "html")}`);
for (const f of FORMATS) {
    const H = pxH(f);
    console.log(`  ${f.name.padEnd(6)} ${String(f.px).padStart(4)}x${String(H).padStart(4)}px  ${f.label}`);
}
