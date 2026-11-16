/* Jaranow - the shared wash scene for the generated pieces (posters, price list,
   flyer). Palette colours only: no skin brown (one accent, BRAND-STANDARD 4.2), so
   people are Ink and need a light field behind them. Coordinates are a 1000x560
   box, ground at y=478; the attendant's working hand is at (368,318). */
const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";
const NAVY = "#173475"; // 40% ACCENT into INK
const WATER = "#93B1F4"; // 45% ACCENT into Paper - a tint, not a new hue
const SUDS_SHADE = "#C3D4F8";

const sparkle = (x, y, s, fill) =>
    `<path d="M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${fill}"/>`;

const DROP = "M50 8 L81 44 A34 34 0 1 1 19 44 Z M50 51 A13 13 0 1 1 50 77 A13 13 0 1 1 50 51 Z";

// Lather as one soft mass: a tinted under-layer gives it an edge on Paper and on paint.
const foam = (blobs) => `
    ${blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y + r * 0.26}" r="${r}" fill="${SUDS_SHADE}"/>`).join("")}
    ${blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join("")}`;

const bubbles = (list) =>
    list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".55" stroke="${WATER}" stroke-width="2.5"/>
    <path d="M${x - r * 0.45} ${y - r * 0.1} A${r * 0.5} ${r * 0.5} 0 0 1 ${x - r * 0.05} ${y - r * 0.5}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`).join("");

const drip = (x, y, h) => `<rect x="${x - 6}" y="${y}" width="12" height="${h}" rx="6" fill="#fff"/>`;

const wheel = (cx) => `
    <path d="M${cx - 64} 424 A64 64 0 0 1 ${cx + 64} 424Z" fill="${INK}" opacity=".55"/>
    <circle cx="${cx}" cy="424" r="54" fill="${INK}" stroke="${PAPER}" stroke-opacity=".22" stroke-width="3"/>
    <circle cx="${cx}" cy="424" r="35" fill="${PAPER}"/>
    ${[0, 72, 144, 216, 288].map((a) => `<line x1="${cx}" y1="424" x2="${cx}" y2="392" stroke="${INK}" stroke-width="7" stroke-linecap="round" transform="rotate(${a} ${cx} 424)"/>`).join("")}
    <circle cx="${cx}" cy="424" r="11" fill="${ACCENT}"/>`;

// `body`: Navy on a light field, accent on a dark one (Navy disappears into Ink).
const car = (body = NAVY) => `
    <ellipse cx="644" cy="482" rx="330" ry="10" fill="${INK}" opacity=".12"/>
    <path d="M340 404 Q340 352 392 342 L486 328 L574 258 Q590 246 614 246 L748 246 Q772 246 790 260 L862 326 L908 336 Q948 344 948 382 L948 408 Q948 424 932 424 L356 424 Q340 424 340 408Z" fill="${body}"/>
    <path d="M342 394 L946 394 L948 408 Q948 424 932 424 L356 424 Q340 424 340 408Z" fill="${INK}" opacity=".32"/>
    <path d="M590 266 L672 266 L672 326 L512 326Z" fill="${PAPER}"/>
    <path d="M686 266 L750 266 Q762 266 772 274 L830 326 L686 326Z" fill="${PAPER}"/>
    <path d="M562 326 L602 266 L626 266 L586 326Z M606 326 L646 266 L656 266 L616 326Z M716 326 L748 278 L758 284 L730 326Z" fill="${WATER}" opacity=".5"/>
    <line x1="679" y1="336" x2="679" y2="392" stroke="${INK}" stroke-opacity=".3" stroke-width="3"/>
    <rect x="700" y="346" width="34" height="9" rx="4.5" fill="${PAPER}" opacity=".85"/>
    <rect x="566" y="346" width="34" height="9" rx="4.5" fill="${PAPER}" opacity=".85"/>
    <ellipse cx="506" cy="322" rx="15" ry="9" fill="${INK}"/>
    <path d="M343 380 Q344 358 372 354 L396 352 L386 378Z" fill="${PAPER}"/>
    <path d="M946 372 Q944 352 918 348 L910 370Z" fill="${body === ACCENT ? INK : ACCENT}"/>
    <path d="M414 366 Q530 346 664 346" fill="none" stroke="${PAPER}" stroke-opacity=".4" stroke-width="5" stroke-linecap="round"/>
    <path d="M700 338 L850 338" fill="none" stroke="${PAPER}" stroke-opacity=".22" stroke-width="5" stroke-linecap="round"/>
    ${wheel(462)}${wheel(826)}`;

// Lather where a wash actually puts it: roof, bonnet, boot, running down the doors.
const CAR_FOAM = `
    ${drip(640, 250, 44)}${drip(716, 250, 62)}${drip(752, 256, 30)}${drip(438, 338, 34)}${drip(896, 336, 30)}
    ${foam([[606, 244, 20], [640, 232, 28], [682, 226, 32], [724, 234, 26], [758, 246, 18], [418, 336, 18], [446, 326, 24], [478, 330, 16], [876, 328, 17], [902, 334, 13], [560, 276, 13]])}`;

// Cap, crew tee (tee design B's accent cloth), rubber boots. `tool` goes in the hand.
const attendant = (tool = "") => `
    <path d="M204 340 L192 436" stroke="${NAVY}" stroke-width="36" stroke-linecap="round"/>
    <path d="M230 340 L250 436" stroke="${NAVY}" stroke-width="36" stroke-linecap="round"/>
    <path d="M170 422 H214 V452 Q236 456 238 478 H170Z" fill="${INK}"/>
    <path d="M230 422 H274 V452 Q296 456 298 478 H230Z" fill="${INK}"/>
    <rect x="170" y="422" width="44" height="9" fill="${ACCENT}"/>
    <rect x="230" y="422" width="44" height="9" fill="${ACCENT}"/>
    <path d="M184 226 L164 290 L176 338" fill="none" stroke="${INK}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="177" cy="342" r="13" fill="${INK}"/>
    <rect x="200" y="168" width="24" height="34" fill="${INK}"/>
    <path d="M164 222 Q164 194 192 194 L236 194 Q262 194 262 222 L256 348 Q256 360 244 360 L180 360 Q170 360 170 348Z" fill="${ACCENT}"/>
    <g transform="translate(216,212) scale(.32)"><path fill-rule="evenodd" fill="${PAPER}" d="${DROP}"/></g>
    <path d="M184 222 L172 262" stroke="${ACCENT}" stroke-width="36" stroke-linecap="round"/>
    <path d="M176 266 L160 262" stroke="${NAVY}" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>
    <circle cx="212" cy="142" r="39" fill="${INK}"/>
    <path d="M172 140 A40 40 0 0 1 252 140Z" fill="${ACCENT}"/>
    <rect x="238" y="130" width="50" height="11" rx="5.5" fill="${ACCENT}"/>
    <rect x="172" y="134" width="80" height="6" fill="${NAVY}" opacity=".55"/>
    <path d="M240 228 L304 274 L366 318" fill="none" stroke="${INK}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M238 222 L268 244" stroke="${ACCENT}" stroke-width="36" stroke-linecap="round"/>
    <circle cx="368" cy="318" r="13" fill="${INK}"/>
    ${tool}`;

// Spray gun, a solid fan of water onto the screen, and the splash where it lands.
const SPRAY = `
    <path d="M400 312 L562 262 Q586 300 520 350 L400 330Z" fill="${WATER}" opacity=".55"/>
    <path d="M404 316 L552 274 M404 321 L548 306 M404 326 L512 344" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>
    <path d="M566 250 l10 -16 M586 268 l18 -8 M590 296 l20 2 M546 240 l2 -18" fill="none" stroke="${WATER}" stroke-width="6" stroke-linecap="round"/>
    ${[[600, 236, 6], [622, 278, 5], [574, 216, 4], [616, 308, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${WATER}"/>`).join("")}
    <path d="M350 304 L400 310 L400 332 L378 330 L372 352 L354 350 L358 328 L348 326Z" fill="${NAVY}"/>
    <rect x="398" y="314" width="10" height="14" rx="3" fill="${INK}"/>`;

const HOSE = `
    <path d="M364 350 C360 436 332 468 286 472 L30 472" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;

// A soapy sponge, for the second pair of hands.
const SPONGE = `
    <rect x="346" y="298" width="60" height="38" rx="11" transform="rotate(-10 376 317)" fill="${WATER}"/>
    ${foam([[352, 300, 12], [374, 292, 15], [398, 298, 11], [408, 316, 9]])}`;

const BUCKET = `
    <path d="M68 412 Q104 356 140 412" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M60 414 L148 414 L138 478 L70 478Z" fill="${ACCENT}"/>
    <path d="M63 434 L145 434 L143 448 L65 448Z" fill="${PAPER}" opacity=".9"/>
    <rect x="54" y="406" width="100" height="15" rx="7.5" fill="${NAVY}"/>
    ${drip(134, 408, 40)}
    ${foam([[78, 400, 15], [102, 390, 22], [128, 398, 16], [146, 408, 10]])}`;

const GROUND_LINE = `<line x1="30" y1="478" x2="970" y2="478" stroke="${INK}" stroke-opacity=".16" stroke-width="4"/>`;

/* The scene every attendant piece uses: one attendant on the hose, a car in
   lather. Fits "10 76 950 424"; add to it rather than redrawing it per piece. */
const WASH_SCENE = `
    ${car()}${CAR_FOAM}
    ${HOSE}${BUCKET}${attendant(SPRAY)}
    ${bubbles([[318, 196, 9], [338, 170, 6], [300, 160, 4], [520, 200, 8], [806, 232, 10], [834, 206, 6], [900, 290, 7]])}
    ${sparkle(700, 150, 22, ACCENT)}${sparkle(906, 214, 15, ACCENT)}${sparkle(470, 236, 12, ACCENT)}`;

module.exports = {
    sparkle, DROP, car, CAR_FOAM, foam, bubbles, attendant, SPRAY, SPONGE, HOSE, BUCKET, GROUND_LINE, WASH_SCENE,
};
