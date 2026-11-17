/* Jaranow - the shared wash scene for the generated pieces (posters, flyer).
   Drawn like a stock illustration, not a pictogram: true proportions, shaded
   paint and glass, a faceless uniformed attendant. Still palette-only - every
   shade is a step between Ink, the accent and Paper, with no skin brown (one
   accent, BRAND-STANDARD 4.2), so the figure needs a light field behind it.
   Shading is fine here; it is the mark that stays flat.
   1000x560 box, ground at y=478. The car is seen from behind, x 500-900. The attendant
   stands at x~240; hands at (330,262) and (300,274). */
const fs = require("fs");
const path = require("path");

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";
const NAVY = "#173475"; // 40% ACCENT into INK
const WATER = "#93B1F4"; // 45% ACCENT into Paper - a tint, not a new hue
const SKIN = "#1B2740"; // Ink lifted one step, so the figure has form
const SKIN_LIT = "#2C3A5A";

const sparkle = (x, y, s, fill) =>
    `<path d="M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${fill}"/>`;

const DROP = "M50 8 L81 44 A34 34 0 1 1 19 44 Z M50 51 A13 13 0 1 1 50 77 A13 13 0 1 1 50 51 Z";

const bubbles = (list) =>
    list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".5" stroke="${WATER}" stroke-width="2"/>
    <path d="M${x - r * 0.45} ${y - r * 0.1} A${r * 0.5} ${r * 0.5} 0 0 1 ${x - r * 0.05} ${y - r * 0.5}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`).join("");

// Suds as real lather: many small bubbles packed together, never one cloud.
const suds = (list) =>
    list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".94" stroke="${WATER}" stroke-opacity=".55" stroke-width="1.2"/>`).join("");

/* The car is a photograph, not a drawing: the owner's reference shot of a
   Mercedes GLE Coupe from behind (brand/gle-coupe.png, 1050x670), cut out along
   CUT and placed by REF - 440 wide, centred on x=700, tyres on the ground line.
   Drawn versions were rejected as not looking like the car. It keeps its own
   colours (black paint, red lamps) on purpose; only the stranger's number plate
   is covered, with ours. CUT is in the photo's pixel coordinates: a new photo
   needs a new CUT and REF, so check the edges for slivers of background. */
const REF = "translate(358.1,73.5) scale(.642)";
const PHOTO = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, "gle-coupe.png")).toString("base64")}`;
const CUT = `
    <path d="M370 105 Q533 94 698 104 Q720 106 729 116 L775 192 C800 201 828 225 851 260 C865 288 871 330 871 380 L870 470 C870 510 863 540 849 558 L217 558 C205 542 198 512 198 470 L199 380 C199 332 207 294 227 262 C244 234 268 210 296 196 L341 120 Q350 106 370 105Z"/>
    <path d="M524 100 L528 86 L540 86 L544 100Z"/>
    <rect x="195" y="528" width="124" height="102" rx="18"/>
    <rect x="747" y="528" width="124" height="102" rx="18"/>`;

const car = () => `
    <defs>
      <clipPath id="cut">${CUT}</clipPath>
      <filter id="soft" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>
    <g transform="${REF}">
    <ellipse cx="532" cy="632" rx="372" ry="15" fill="${INK}" opacity=".34" filter="url(#soft)"/>
    <image href="${PHOTO}" x="0" y="0" width="1050" height="670" preserveAspectRatio="none" clip-path="url(#cut)"/>
    <rect x="456" y="438" width="148" height="45" rx="4" fill="${PAPER}" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>
    <g transform="translate(511,441) scale(.38)"><path fill-rule="evenodd" fill="${ACCENT}" d="${DROP}"/></g>
    </g>`;

// Light lather on the panel being worked, a run of it down the door, beads of water.
const CAR_SUDS = `<g transform="translate(-34,-24)">
    <path d="M592 352 C590 372 594 388 590 402 M616 360 C614 376 618 392 616 406 M640 356 C642 372 638 384 640 396" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="6" stroke-linecap="round"/>
    ${suds([[578, 346, 9], [592, 338, 12], [608, 344, 10], [622, 336, 13], [638, 344, 9], [652, 338, 7], [600, 356, 7], [628, 354, 8], [586, 360, 5], [646, 354, 5], [566, 352, 6], [614, 330, 6], [660, 348, 4]])}</g>
    ${[[730, 318, 3], [790, 328, 3.5], [860, 300, 2.5], [742, 400, 3], [870, 388, 3], [620, 396, 2.5], [540, 356, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.5}" fill="#fff" opacity=".6"/>`).join("")}
    ${sparkle(766, 196, 13, "#fff")}${sparkle(846, 278, 9, "#fff")}${sparkle(770, 372, 8, "#fff")}`;

/* Roughly seven and a half heads tall, leaning into the work, both hands forward.
   No face: stock figures are faceless, and it keeps the skin a plain shade.
   `tool` is whatever the hands hold. */
const attendant = (tool = "") => `
    <ellipse cx="240" cy="481" rx="74" ry="8" fill="${INK}" opacity=".16"/>
    <path d="M220 300 L210 384" stroke="#0F2352" stroke-width="38" stroke-linecap="round"/>
    <path d="M210 384 L204 446" stroke="#0F2352" stroke-width="30" stroke-linecap="round"/>
    <path d="M186 440 H222 V462 Q244 464 248 478 H186Z" fill="${INK}"/>
    <path d="M226 206 L262 262 L300 274" fill="none" stroke="${SKIN}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M224 204 L246 238" stroke="#1D4FCC" stroke-width="27" stroke-linecap="round"/>
    <path d="M238 300 L262 380" stroke="${NAVY}" stroke-width="38" stroke-linecap="round"/>
    <path d="M262 380 L270 446" stroke="${NAVY}" stroke-width="30" stroke-linecap="round"/>
    <path d="M252 440 H288 V462 Q310 464 314 478 H252Z" fill="${INK}"/>
    <path d="M254 446 H286" stroke="#fff" stroke-opacity=".16" stroke-width="3" stroke-linecap="round"/>
    <path d="M206 206 Q208 186 232 186 L256 188 Q274 192 272 214 L260 302 Q258 312 246 312 L214 310 Q202 308 202 296Z" fill="${ACCENT}"/>
    <path d="M206 206 Q208 186 232 186 L236 186 L224 310 L214 310 Q202 308 202 296Z" fill="${INK}" opacity=".2"/>
    <path d="M202 292 L260 298 L259 310 Q256 312 246 312 L214 310 Q202 308 202 296Z" fill="${INK}" opacity=".5"/>
    <g transform="translate(240,206) scale(.26)"><path fill-rule="evenodd" fill="${PAPER}" d="${DROP}"/></g>
    <path d="M236 170 H254 V192 H236Z" fill="${SKIN}"/>
    <ellipse cx="247" cy="154" rx="21" ry="24" fill="${SKIN}"/>
    <path d="M256 138 Q270 150 266 170 Q262 178 252 178 Q262 164 256 138Z" fill="${SKIN_LIT}"/>
    <ellipse cx="239" cy="158" rx="5" ry="7" fill="${SKIN_LIT}"/>
    <path d="M224 150 Q222 124 248 124 Q270 124 271 148Z" fill="${ACCENT}"/>
    <path d="M224 150 Q223 138 230 131 L236 150Z" fill="${INK}" opacity=".22"/>
    <path d="M266 141 L298 148 Q301 152 296 154 L268 150Z" fill="#1D4FCC"/>
    <path d="M252 208 L288 250 L330 262" fill="none" stroke="${SKIN}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M252 206 L274 232" stroke="${ACCENT}" stroke-width="27" stroke-linecap="round"/>
    ${tool}
    <circle cx="300" cy="274" r="10" fill="${SKIN}"/>
    <circle cx="330" cy="262" r="10" fill="${SKIN}"/>
    <path d="M324 258 L336 256 M323 263 L336 262" stroke="${SKIN_LIT}" stroke-width="2.5" stroke-linecap="round"/>`;

// Pressure-washer lance: the fan and the mist where it lands on the door.
const LANCE = `
    <defs>
      <linearGradient id="jet" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/>
      </linearGradient>
      <filter id="mist" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <path d="M286 286 C282 380 262 452 210 470 L24 472" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="578" cy="304" rx="58" ry="34" fill="#fff" opacity=".7" filter="url(#mist)"/>
    <path d="M430 246 L604 264 L574 346 L430 252Z" fill="${WATER}" opacity=".5"/>
    <path d="M430 246 L604 264 L574 346 L430 252Z" fill="url(#jet)"/>
    <path d="M432 248 L592 272 M432 249 L586 302 M432 250 L574 332" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
    <path d="M280 282 L424 249" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M276 276 L312 268 L318 290 L300 294 L304 314 L290 316 L284 296Z" fill="${NAVY}"/>
    <path d="M414 244 L434 240 L436 256 L418 258Z" fill="${ACCENT}"/>
    ${[[620, 254, 4], [636, 284, 3], [612, 232, 3], [598, 362, 3.5], [642, 316, 2.5], [560, 244, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${WATER}" stroke-width="1.5"/>`).join("")}`;

// A soapy sponge held to the panel, for the second pair of hands.
const SPONGE = `
    <rect x="312" y="246" width="52" height="34" rx="9" transform="rotate(-8 338 263)" fill="${WATER}"/>
    <rect x="312" y="246" width="52" height="12" rx="6" transform="rotate(-8 338 263)" fill="#fff" opacity=".4"/>
    ${suds([[322, 248, 9], [338, 242, 11], [356, 248, 8], [366, 262, 7], [346, 284, 8], [330, 286, 6], [362, 280, 5]])}`;

const BUCKET = `
    <ellipse cx="104" cy="481" rx="52" ry="6" fill="${INK}" opacity=".16"/>
    <path d="M66 410 Q104 350 142 410" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 412 L148 412 L138 478 L70 478Z" fill="${ACCENT}"/>
    <path d="M60 412 L82 412 L88 478 L70 478Z" fill="#fff" opacity=".2"/>
    <path d="M126 412 L148 412 L138 478 L122 478Z" fill="${INK}" opacity=".22"/>
    <ellipse cx="104" cy="412" rx="46" ry="9" fill="#1A47B8"/>
    ${suds([[78, 408, 8], [92, 402, 11], [108, 404, 10], [124, 408, 8], [100, 396, 7], [116, 398, 6], [86, 400, 5], [134, 412, 5]])}`;

// Spray bottle and folded cloths: fills the right of a one-attendant scene.
const KIT = `
    <ellipse cx="1014" cy="481" rx="44" ry="6" fill="${INK}" opacity=".16"/>
    <rect x="982" y="456" width="68" height="22" rx="8" fill="${NAVY}"/>
    <rect x="986" y="436" width="60" height="20" rx="8" fill="${WATER}"/>
    <rect x="982" y="416" width="68" height="20" rx="8" fill="${ACCENT}"/>
    <path d="M988 422 H1044" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>`;

const GROUND_LINE = `<line x1="24" y1="478" x2="1060" y2="478" stroke="${INK}" stroke-opacity=".14" stroke-width="3"/>`;

/* The scene every attendant piece uses: one attendant on the lance, a wet car
   seen from behind, lather where the water lands. Spans x 50-960, y 116-490; add to it
   rather than redrawing it per piece. */
const WASH_SCENE = `
    ${car()}${CAR_SUDS}
    ${BUCKET}${attendant(LANCE)}
    ${bubbles([[468, 196, 7], [490, 168, 5], [930, 226, 7], [952, 196, 4], [452, 320, 5], [918, 330, 5]])}
    ${sparkle(540, 150, 15, ACCENT)}${sparkle(898, 156, 12, ACCENT)}${sparkle(940, 280, 9, ACCENT)}`;

module.exports = {
    sparkle, DROP, car, CAR_SUDS, suds, bubbles, attendant, LANCE, SPONGE, BUCKET, KIT, GROUND_LINE, WASH_SCENE,
};
