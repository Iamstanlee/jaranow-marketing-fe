/* Jaranow — carwash bay banners: back 40x7ft (3 zones), left/right 17x7ft.
   Hanging line, zones, grounds and the deliberate §8.12 departure: CLAUDE.md
   "Wash-bay banners". Back-wall rendering (dsf + tiles): "Generated assets".

   Nigeria drives on the right, so the driver's window faces the LEFT wall - that
   is why the phone number is there. The returns are identical in construction,
   so swapping them is a data edit.

   Usage: node gen-bay.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "bay");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

const ft = (n) => Math.round(n * 304.8);

// ~51dpi is deliberate for large format - see CLAUDE.md "Generated assets".
const PX_PER_MM = 2;
const BLEED = 20; // fabrication allowance; a hemmed banner takes its hem from it
const WINDOW_MAX = 16000; // headless Chrome stops opening windows around 16,384px
/* Widest surface Chrome paints, in DEVICE px. Measured: 10,444 paints whole, 24,464
   came out as a ~7,200px band. Lower it if a panel ever renders part-painted. */
const PAINT_MAX = 12000;
const mm = (n) => Math.round(n * PX_PER_MM);

const HEADLINE = { family: "Archivo Black", weight: 400, capRatio: 0.72 };
const BODY = { family: "Rubik", capRatio: 0.72 };

// ~120x cap height is a comfortable read; glance-legible is roughly double.
const capOf = (fontMm, face) => fontMm * face.capRatio;
const readAt = (fontMm, face) => (capOf(fontMm, face) * 120) / 1000;

// Measured site geometry. Re-measure for a second site - every size follows.
const BAY = {
  bays: 4,
  w: ft(40),
  d: ft(17),
  h: 3000, // clear height of the wall, not the banner
  eye: 1600,
  camera: 10000, // rendering viewpoint for the mockup, not a real standing spot
  car: { w: 1800, h: 1500, l: 4400 },
};
BAY.pitch = Math.round(BAY.w / BAY.bays);

const TOP_LINE = 2700;
const PANEL_H = ft(7);
const MOUNT = TOP_LINE - PANEL_H;
// A 1500mm saloon seen from outside the opening masks the wall up to about this.
const CAR_LINE = 1380;

/* `type` sizes are FONT sizes in mm, not cap heights - read the printed table
   after any change. `at` = design distance in m. */
const PANELS = [
  {
    id: "back",
    label: "Back wall — the promise, who we are, the reassurance",
    ftSize: "40 × 7 ft",
    w: BAY.w,
    /* Sized to carry the centre zone alone, not to match the headlines. Width-bound
       by the 3824mm zone content box (4064 less 120 padding a side). */
    lockup: 3200,
    /* Solved from measured widths per font size: "GET A FREE WASH." 8.72x,
       "CONFIDENCE" 6.28x (Archivo Black), "Ask for your loyalty card." 10.36x
       (Rubik 400), against 3824mm. Set below what fits so the lockup leads. */
    type: {
      headline: { mm: 340, face: HEADLINE, at: 20 },
      sub: { mm: 108, face: BODY, at: 8 },
      hours: { mm: 110, face: BODY, at: 8 },
      // Smaller than the headline so zone 1 leads on cap height, which is what carries at distance.
      value: { mm: 250, face: HEADLINE, at: 12 },
    },
    zones: [
      {
        kind: "promise", copy: ["WASH FIVE TIMES", "GET A FREE WASH."],
        sub: "Ask for your loyalty card.",
      },
      { kind: "brand", copy: "" },
      /* ALTERNATIVES - swap `copy` and re-check width against the 3824mm zone:
           ["SEE IT FIRST", "THEN PAY"]        shortest, sets biggest
           ["LOOK IT OVER", "BEFORE YOU PAY"]  softer, same idea
           ["NOT DONE", "TILL YOU SAY SO"]     boldest - reads as an open-ended
                                               promise of rework, so only use it
                                               if that is genuinely the policy
           ["WE FINISH", "WHAT WE START"]      care rather than inspection */
      {kind: "value", copy: ["A CLEAN CAR", "=", "ELEVATED", "CONFIDENCE"]},
    ],
    spec: {
      distance: "4m (the driver, stopped) to 20m (from the street)",
      material: "Matt PVC frontlit banner, 510gsm",
      finish: "Welded hem all round, brass eyelets at 500mm centres",
      fixing: "Bottom edge 566mm AFL, 20mm standoff battens, tensioned corner to corner",
      note:
        "ONE PIECE, 40ft long. 7ft high runs across a 2.5m roll, so the length " +
        "is unlimited - refuse a vertical seam through the copy. If the shop " +
        "only has 1.6m, weld horizontally 534mm up from the bottom edge " +
        "(1100mm AFL), which falls in the empty field just below the copy.",
    },
  },
  {
    id: "left",
    label: "Left wall (driver's side) — the offer",
    ftSize: "17 × 7 ft",
    w: BAY.d,
    // Five stamps, the SIXTH wash free - never a free fifth (CLAUDE.md "Pocket cards").
    type: {
      headline: { mm: 300, face: HEADLINE, at: 5 },
      sub: { mm: 100, face: BODY, at: 5 },
      tel: { mm: 130, face: BODY, at: 5 },
      web: { mm: 62, face: BODY, at: 4 },
    },
    zones: [
      {
        kind: "offer",
        copy: ["WASH FIVE TIMES,", "GET A FREE WASH."],
        sub: "Ask for your loyalty card.",
        tel: "0903 862 2012",
        web: "jaranow.com · @jara_now",
      },
    ],
    spec: {
      distance: "1.5m (beside the car) to 5m (across a bay)",
      material: "Matt PVC frontlit banner, 440gsm",
      finish: "Welded hem all round, brass eyelets at 500mm centres",
      fixing: "Bottom edge 566mm AFL, 20mm standoff battens, tensioned corner to corner",
      note:
        "17ft x 7ft prints in one piece on any 2.5m roll. The composition is " +
        "centred, so it hangs either way round - there is no leading end to " +
        "get wrong.",
    },
  },
  {
    id: "right",
    label: "Right wall (passenger side) — the care",
    ftSize: "17 × 7 ft",
    w: BAY.d,
    // No wash names here - deliberate, see CLAUDE.md "Wash-bay banners".
    type: {
      statement: { mm: 360, face: HEADLINE, at: 5 },
      sub: { mm: 110, face: BODY, at: 4 },
    },
    zones: [
      /* ALTERNATIVES - swap `copy`/`sub` and re-check width against 4662mm:
           ["INSIDE", "AND OUTSIDE"]      + "Body, wheels and glass on every wash."
           ["DONE", "PROPERLY"]           + "Inside and outside, wheels and glass included."
           ["EVERY PANEL", "EVERY WHEEL"] + "Body, wheels and glass on every wash."
           ["WE CLEAN", "INSIDE AND OUT"] + "The parts people miss are the parts we check."
         Never name or count the wash types - a banner outlives a service list. */
      {
        kind: "statement",
        copy: ["BRING BACK YOUR", "CAR'S SHINE"],
        sub: "We wash every car like it's the only car we're washing today.",
      },
    ],
    spec: {
      distance: "1.5m (beside the car) to 5m (across a bay)",
      material: "Matt PVC frontlit banner, 440gsm",
      finish: "Welded hem all round, brass eyelets at 500mm centres",
      fixing: "Bottom edge 566mm AFL, 20mm standoff battens, tensioned corner to corner",
      note:
        "Same size and construction as the left wall, so the pair can be " +
        "quoted and hung as one job. Centred composition - hangs either way round.",
    },
  },
];

for (const p of PANELS) {
  Object.assign(p, { h: PANEL_H, mount: MOUNT, safe: 140, bar: 200 });
  p.zoneW = Math.round(p.w / p.zones.length);
}
const byId = Object.fromEntries(PANELS.map((p) => [p.id, p]));

/* Lockup per §8.8. `wall`/`ceil`/`floor` are mockup room surfaces - deliberately
   not brand colours, so a banner reads as a banner rather than as the room. */
const GROUNDS = {
  ink: {
    bg: INK, fg: PAPER, band: ACCENT, bandFg: PAPER,
    dot: "rgba(242,245,251,.10)",
    lockup: "jaranow-carwash-by-jaranow-white",
    wm: "white", wmOpacity: 0.05,
    wall: "#cfd5de", ceil: "#eceff3",
    floor: "linear-gradient(#98a1ae,#5c6675)",
  },
  paper: {
    bg: PAPER, fg: INK, band: ACCENT, bandFg: PAPER,
    dot: "rgba(14,21,38,.10)",
    lockup: "jaranow-carwash-by-jaranow-duo",
    wm: "blue", wmOpacity: 0.08,
    wall: "#9fa8b5", ceil: "#c3cad3",
    floor: "linear-gradient(#8b94a2,#4d5665)",
  },
};

/* --u = 1mm in px, so one stylesheet serves print, the 2x dsf shot and the mockup
   (custom properties don't compound; `em` would). --bleed is 0 outside print files. */
const U = (n) => `calc(${n} * var(--u))`;
const UB = (n) => `calc((${n} + var(--bleed, 0)) * var(--u))`;

function inlineSvg(name, cls, style) {
  let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", `<svg class="${cls}" style="${style}" `);
}

// Scoped to `.p-<id>` so all three walls can share one document (mockup, spec sheet).
const CSS = (p, g) => {
  const s = `.p-${p.id}`;
  const T = p.type;
  return `
  ${s}{
    position:relative; overflow:hidden;
    width:calc((${p.w} + 2 * var(--bleed, 0)) * var(--u));
    height:calc((${p.h} + 2 * var(--bleed, 0)) * var(--u));
    background:${g.bg}; color:${g.fg};
    font-family:'Rubik',system-ui,sans-serif;
    padding:${UB(p.safe)} ${UB(p.safe)} 0;
  }
  ${s} .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(${g.dot} ${U(1.6)}, transparent ${U(1.6)});
    background-size:${U(34)} ${U(34)};
  }
  /* One ghost drop per zone. Repeated as a field rather than placed once:
     a single watermark on a 40ft sheet is a stray shape, one per zone is a
     rhythm, and it gives the empty band below the copy something to be. */
  ${s} .wm{
    position:absolute; z-index:1; bottom:${U(-p.h * 0.12)};
    height:${U(p.h * 0.95)}; width:auto; opacity:${g.wmOpacity};
    transform:translateX(-50%);
  }
  /* Copy is centred in the panel, in the whole space between the safe top and
     the accent bar. The block's optical centre lands at ~1660mm AFL, which is
     about standing eye height in the bay. */
  ${s} .zones{
    position:relative; z-index:2; width:100%; height:${U(p.h - p.safe - p.bar)};
    display:flex; align-items:center;
  }
  ${s} .zone{
    flex:1 1 0; height:100%; padding:0 ${U(120)};
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    text-align:center;
  }
  /* Slim accent bar closing the bottom edge - the device that finishes every
     printed piece in the system. It is cut into by the bleed, so it has to be
     taller than BLEED to leave anything on the hung banner. */
  ${s} .bar{
    position:absolute; left:0; right:0; bottom:0; z-index:3;
    height:${UB(p.bar)}; background:${g.band};
  }
  ${s} h1{
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-weight:${HEADLINE.weight}; font-size:${U((T.headline || {}).mm || 0)};
    line-height:.92; letter-spacing:-.005em; white-space:nowrap;
  }
  /* The two plain value statements are set in the display face too - see the
     §8.12 note at the top of this file. Same line-height and tracking as h1, so
     a heading reads the same whichever zone it is in. */
  ${s} .value,${s} .statement{
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-weight:${HEADLINE.weight};
    font-size:${U((T.value || T.statement || {}).mm || 0)};
    line-height:.92; letter-spacing:-.005em; white-space:nowrap;
  }
  ${s} .lock{width:${U(p.lockup || 0)}; height:auto; display:block}
  ${s} .hours{
    font-size:${U((T.hours || {}).mm || 0)}; font-weight:500; letter-spacing:.1em;
    text-transform:uppercase; opacity:.72; margin-top:${U(110)};
  }
  ${s} .sub{
    font-size:${U((T.sub || {}).mm || 0)}; font-weight:400; line-height:1.25;
    opacity:.82; margin-top:${U(60)}; white-space:nowrap;
  }
  /* Contact in an accent block: the one thing in the whole room a customer
     might act on, so it gets the only filled shape besides the bars. Rubik 700,
     not the display face - Archivo Black is already spent on the headline
     above it (§8.12). */
  ${s} .contact{
    margin-top:${U(70)}; background:${g.band}; color:${g.bandFg};
    padding:${U(46)} ${U(80)};
    display:flex; align-items:baseline; gap:${U(50)};
  }
  ${s} .tel{
    font-size:${U((T.tel || {}).mm || 0)}; font-weight:700; line-height:1;
    font-variant-numeric:tabular-nums; white-space:nowrap;
  }
  ${s} .web{font-size:${U((T.web || {}).mm || 0)}; font-weight:400; opacity:.9; white-space:nowrap}`;
};

const ZONEHTML = {
  promise: (z) => `<h1>${z.copy.join("<br>")}</h1>
      <p class="sub">${z.sub}</p>`,
  brand: (z, p, g) =>
    `${inlineSvg(g.lockup, "lock", `width:${U(p.lockup)};height:auto;display:block`)}
      <p class="hours">${z.copy}</p>`,
  value: (z) => `<p class="value">${z.copy.join("<br>")}</p>`,
  statement: (z) => `<p class="statement">${z.copy.join("<br>")}</p>
      <p class="sub">${z.sub}</p>`,
  offer: (z) => `<h1>${z.copy.join("<br>")}</h1>
      <p class="sub">${z.sub}</p>
      `,
};

const panelBody = (p, g) => `
<div class="dots"></div>
${p.zones
  .map((_, i) =>
    inlineSvg(`jaranow-symbol-${g.wm}`, "wm", `left:${U(Math.round(p.zoneW * (i + 0.5)))}`)
  )
  .join("\n")}
<div class="zones">
  ${p.zones.map((z) => `<div class="zone">${ZONEHTML[z.kind](z, p, g)}</div>`).join("\n  ")}
</div>
<div class="bar"></div>`;

const panel = (p, g, extraClass = "") =>
  `<div class="panel p-${p.id} ${extraClass}">${panelBody(p, g)}</div>`;

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Archivo+Black&display=block" rel="stylesheet">`;

/* `slice`: same full-size layout shifted left inside a tile-wide viewport, so
   tiles join seamlessly. */
const page = (title, w, h, css, body, slice) => `<!doctype html><html><head><meta charset="utf-8">
<title>${title}${slice ? ` [tile @${slice.x}]` : ""}</title>
${FONTS}
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${slice ? slice.w : w}px;height:${h}px;overflow:hidden}
${css}
</style></head><body>
${
  slice
    ? `<div style="position:absolute;left:${-slice.x}px;top:0;width:${w}px;height:${h}px">${body}</div>`
    : body
}
</body></html>`;

/* Applies both Chrome ceilings (dsf above WINDOW_MAX, tiles above PAINT_MAX).
   sizes.txt, one line per output PNG:  base winW winH dsf tiles tileW
   (window CSS px; the last tile is the remainder). */
const sizes = [];
const emit = (base, wPx, hPx, mkPage) => {
  const dsf = Math.max(wPx, hPx) > WINDOW_MAX ? 2 : 1;
  const winW = Math.round(wPx / dsf);
  const winH = Math.round(hPx / dsf);
  const tiles = Math.ceil(wPx / PAINT_MAX);
  const tileW = Math.ceil(winW / tiles);
  const write = (name, html) => fs.writeFileSync(path.join(OUT, "html", name), html);

  if (tiles === 1) write(`${base}.html`, mkPage(dsf, winW, winH, null));
  else
    for (let i = 0; i < tiles; i++) {
      const x = i * tileW;
      write(`${base}.t${i}.html`, mkPage(dsf, winW, winH, { x, w: Math.min(tileW, winW - x) }));
    }

  sizes.push(`${base} ${winW} ${winH} ${dsf} ${tiles} ${tileW}`);
  console.log(
    `  ${base}.html`.padEnd(36) +
      `${wPx}x${hPx}px` +
      (dsf > 1 ? `  (window ${winW}x${winH} @${dsf}x` : "") +
      (tiles > 1 ? `${dsf > 1 ? ", " : "  ("}${tiles} tiles of ${tileW}px` : "") +
      (dsf > 1 || tiles > 1 ? ")" : "")
  );
};

console.log("print files");
for (const p of PANELS) {
  for (const [gname, g] of Object.entries(GROUNDS)) {
    emit(`bay-carwash-${p.id}-${gname}`, mm(p.w + BLEED * 2), mm(p.h + BLEED * 2), (dsf, w, h, slice) =>
      page(
        `${p.label} (${gname})`,
        w,
        h,
        `  body{--u:${PX_PER_MM / dsf}px; --bleed:${BLEED}}\n${CSS(p, g)}`,
        panel(p, g),
        slice
      )
    );
  }
}

/* Mockup (not artwork): a true CSS 3D room, so how much wall a car hides is real
   perspective rather than drawn. The cars are the point - they explain the band. */
const MK = 0.26;
const mk = (n) => +(n * MK).toFixed(2);
const CANVAS = { w: Math.round(mk(BAY.w)) + 180, h: Math.round(mk(BAY.h)) + 60 + 250 };

const CAR = `<svg viewBox="0 0 1800 1500" xmlns="http://www.w3.org/2000/svg">
  <g fill="#141b28">
    <path d="M300 470 q60 -300 190 -330 h620 q130 30 190 330 z"/>
    <rect x="150" y="450" width="1500" height="720" rx="130"/>
    <rect x="250" y="1130" width="330" height="230" rx="80"/>
    <rect x="1220" y="1130" width="330" height="230" rx="80"/>
  </g>
  <path d="M360 455 q55 -250 165 -275 h550 q110 25 165 275 z" fill="#33405a"/>
</svg>`;

console.log("\nmockup");
for (const [gname, g] of Object.entries(GROUNDS)) {
  const cars = Array.from({ length: BAY.bays }, (_, i) => {
    const cx = BAY.pitch * (i + 0.5);
    return `<div class="car" style="left:${mk(cx - BAY.car.w / 2)}px">${CAR}</div>`;
  }).join("\n      ");

  const css = `
  body{
    background:${PAPER}; color:${INK};
    font-family:'Rubik',system-ui,sans-serif;
    display:flex; flex-direction:column; align-items:center;
    padding:40px 90px;
  }
  .stage{
    width:${mk(BAY.w)}px; height:${mk(BAY.h)}px;
    perspective:${mk(BAY.camera)}px;
    perspective-origin:50% ${(((BAY.h - BAY.eye) / BAY.h) * 100).toFixed(1)}%;
  }
  .room{position:relative; width:100%; height:100%; transform-style:preserve-3d}
  .face{position:absolute; background:${g.wall}}
  .back{left:0; top:0; width:${mk(BAY.w)}px; height:${mk(BAY.h)}px;
    transform:translateZ(${mk(-BAY.d)}px)}
  .lw{left:0; top:0; width:${mk(BAY.d)}px; height:${mk(BAY.h)}px;
    transform-origin:left center; transform:rotateY(90deg)}
  .rw{left:${mk(BAY.w - BAY.d)}px; top:0; width:${mk(BAY.d)}px; height:${mk(BAY.h)}px;
    transform-origin:right center; transform:rotateY(-90deg)}
  .floor{left:0; top:${mk(BAY.h)}px; width:${mk(BAY.w)}px; height:${mk(BAY.d)}px;
    transform-origin:top center; transform:rotateX(-90deg); background:${g.floor}}
  .ceil{left:0; top:0; width:${mk(BAY.w)}px; height:${mk(BAY.d)}px;
    transform-origin:top center; transform:rotateX(-90deg); background:${g.ceil}}
  .car{position:absolute; bottom:0; width:${mk(BAY.car.w)}px; height:${mk(BAY.car.h)}px;
    transform:translateZ(${mk(-(BAY.d - BAY.car.l))}px)}
  .car svg{width:100%; height:100%; display:block}
  /* --u is the mockup's millimetre; --bleed stays unset (0) because a hung
     banner is trimmed. The two-class selector beats the .p-<id> rule on
     specificity - .panel alone would not, and the banners would fall into
     flow at the top of each wall. */
  .panel{--u:${MK}px}
  .panel.mount{position:absolute; left:0; bottom:${mk(MOUNT)}px}
  .cap{width:${mk(BAY.w)}px; margin-top:28px}
  .cap h2{font-size:26px; font-weight:700; letter-spacing:-.01em}
  .cap p{font-size:15px; line-height:1.55; opacity:.68; margin-top:8px; max-width:1150px}
  .cap ul{margin-top:16px; display:flex; gap:30px; list-style:none; flex-wrap:wrap}
  .cap li{font-size:14px; line-height:1.5}
  .cap b{display:block; font-weight:700}
  .cap i{font-style:normal; opacity:.62}
${PANELS.map((p) => CSS(p, g)).join("\n")}`;

  const body = `  <div class="stage"><div class="room">
    <div class="face ceil"></div>
    <div class="face floor"></div>
    <div class="face lw">${panel(byId.left, g, "mount")}</div>
    <div class="face rw">${panel(byId.right, g, "mount")}</div>
    <div class="face back">${panel(byId.back, g, "mount")}</div>
    ${cars}
  </div></div>
  <div class="cap">
    <h2>Carwash bay — three-wall banner set (${gname})</h2>
    <p>Mockup for placement and colourway. Not print artwork. Bay drawn at
       ${(BAY.w / 1000).toFixed(2)}m wide (${BAY.bays} bays at ${BAY.pitch}mm) × ${(BAY.d / 1000).toFixed(2)}m deep × ${BAY.h / 1000}m clear, viewed from
       the opening at ${BAY.eye / 1000}m eye height with all four bays occupied. All three banners are
       ${PANEL_H}mm (7ft) high and hang with their tops on one line at ${TOP_LINE}mm AFL, bottom edge ${MOUNT}mm;
       copy is centred in the panel. A parked car masks the wall to about ${CAR_LINE}mm.</p>
    <ul>
      ${PANELS.map(
        (p) =>
          `<li><b>${p.label}</b>${p.ftSize} · ${p.w} × ${p.h}mm<i> · bottom edge ${p.mount}mm AFL</i></li>`
      ).join("\n      ")}
    </ul>
  </div>`;

  emit(`bay-mockup-${gname}`, CANVAS.w, CANVAS.h, () =>
    page(`Bay mockup (${gname})`, CANVAS.w, CANVAS.h, css, body)
  );
}

// Spec sheet: A3 landscape, 300dpi - for the printer and fitter.
const SPEC_DPI = 300;
const sp = (n) => Math.round((n * SPEC_DPI) / 25.4);
const SPEC_U = 0.115; // px per banner-mm in the previews; one scale for all three

{
  const g = GROUNDS.ink;
  const row = (p) => `<section class="row">
  <div class="prev">${panel(p, g)}<span class="scale">1 : ${Math.round(1 / SPEC_U)}</span></div>
  <div class="info">
    <h3>${p.label}</h3>
    <dl>
      <dt>Trim</dt><dd>${p.ftSize} — ${p.w} × ${p.h}mm${p.zones.length > 1 ? `, one piece, ${p.zones.length} zones of ${p.zoneW}mm` : ""}</dd>
      <dt>Bleed</dt><dd>${BLEED}mm all round → file ${p.w + BLEED * 2} × ${p.h + BLEED * 2}mm</dd>
      <dt>File</dt><dd>${mm(p.w + BLEED * 2)} × ${mm(p.h + BLEED * 2)}px PNG · ${PX_PER_MM}px/mm (${(PX_PER_MM * 25.4).toFixed(0)}dpi at full size)</dd>
      <dt>Mount</dt><dd>Bottom edge ${p.mount}mm AFL · top edge ${p.mount + p.h}mm</dd>
      <dt>Viewed at</dt><dd>${p.spec.distance}</dd>
      <dt>Material</dt><dd>${p.spec.material}</dd>
      <dt>Finishing</dt><dd>${p.spec.finish}</dd>
      <dt>Fixing</dt><dd>${p.spec.fixing}</dd>
    </dl>
    <p class="warn">${p.spec.note}</p>
    <table>
      <tr><th>element</th><th>type</th><th>cap</th><th>reads at</th><th>designed for</th><th>face</th></tr>
      ${Object.entries(p.type)
        .map(
          ([k, t]) =>
            `<tr><td>${k}</td><td>${t.mm}mm</td><td>${capOf(t.mm, t.face).toFixed(0)}mm</td>` +
            `<td>${readAt(t.mm, t.face).toFixed(1)}m</td><td>${t.at}m</td><td>${t.face.family}</td></tr>`
        )
        .join("")}
    </table>
  </div>
</section>`;

  const css = `
  body{
    background:${PAPER}; color:${INK};
    font-family:'Rubik',system-ui,sans-serif;
    padding:${sp(12)}px ${sp(14)}px; display:flex; flex-direction:column;
  }
  header{display:flex; align-items:flex-end; justify-content:space-between;
    border-bottom:${sp(0.8)}px solid ${INK}; padding-bottom:${sp(3.5)}px}
  header h1{font-size:${sp(6.4)}px; font-weight:700; letter-spacing:-.02em}
  header p{font-size:${sp(2.9)}px; opacity:.66; text-align:right; line-height:1.5}
  .row{display:flex; gap:${sp(8)}px; align-items:center;
    padding:${sp(4.2)}px 0; border-bottom:${sp(0.3)}px solid rgba(14,21,38,.16)}
  .prev{flex:0 0 ${Math.round(BAY.w * SPEC_U)}px; --u:${SPEC_U}px}
  .scale{display:block; margin-top:${sp(1.6)}px; font-size:${sp(2.4)}px;
    letter-spacing:.14em; text-transform:uppercase; opacity:.45}
  .info{flex:1; display:flex; flex-direction:column; gap:${sp(2)}px}
  .info h3{font-size:${sp(4.2)}px; font-weight:700}
  dl{display:grid; grid-template-columns:${sp(18)}px 1fr; column-gap:${sp(3)}px;
    row-gap:${sp(0.9)}px; font-size:${sp(2.85)}px; line-height:1.35}
  dt{font-weight:700; opacity:.55}
  .warn{font-size:${sp(2.85)}px; line-height:1.4; color:${ACCENT}; font-weight:500;
    border-left:${sp(1)}px solid ${ACCENT}; padding-left:${sp(2.4)}px}
  table{border-collapse:collapse; font-size:${sp(2.5)}px}
  th,td{text-align:left; padding:${sp(0.5)}px ${sp(3.2)}px ${sp(0.5)}px 0;
    font-variant-numeric:tabular-nums; white-space:nowrap}
  th{font-weight:700; opacity:.5; text-transform:uppercase; letter-spacing:.08em}
  footer{margin-top:auto; padding-top:${sp(3.5)}px; font-size:${sp(2.8)}px;
    line-height:1.5; opacity:.72; display:flex; gap:${sp(9)}px}
  footer div{flex:1}
  footer b{font-weight:700; opacity:.9}
${PANELS.map((p) => CSS(p, g)).join("\n")}`;

  const body = `  <header>
    <h1>Carwash bay — three-wall banner set · print specification</h1>
    <p>${BAY.bays}-bay wash. Back 40 × 7 ft, both returns 17 × 7 ft. Three banners, six files
       (Ink shown; a Paper set is supplied for covered bays — pick ONE ground for the room).<br>
       All three hang with tops on one line at ${TOP_LINE}mm AFL, bottom edge ${MOUNT}mm, copy centred in the panel.
       Generated by brand/gen-bay.js; do not edit the artwork by hand.</p>
  </header>
  ${PANELS.map(row).join("\n  ")}
  <footer>
    <div><b>Colour</b><br>Ink #0E1526 · Jaranow Blue #2563EB · Paper #F2F5FB.
      Match to the hex, not to how the PNG looks on a screen.</div>
    <div><b>Resolution</b><br>${(PX_PER_MM * 25.4).toFixed(0)}dpi at full size is correct for banners read from 1.5m up.
      Scale the file; do not resample it. Vector lockups available on request.</div>
    <div><b>Environment</b><br>Constant water and detergent. Matt finish — gloss glares under bay
      lighting — hemmed edges, and a 20mm standoff so the wall dries behind the banner.</div>
    <div><b>Install</b><br>Top edges of all three on one line at ${TOP_LINE}mm AFL. Every composition is
      centred, so the two returns hang either way round.</div>
  </footer>`;

  console.log("\nspec sheet");
  emit("bay-spec", sp(420), sp(297), () =>
    page("Bay banner set — print specification", sp(420), sp(297), css, body)
  );
}

fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");

// Legibility table: falling short of `at` is the bug; overshooting is fine.
console.log(`\n${sizes.length} files @ ${PX_PER_MM}px/mm (~${(PX_PER_MM * 25.4).toFixed(0)}dpi at full size)`);
console.log(
  `bay ${BAY.w}x${BAY.d}x${BAY.h}mm — ${BAY.bays} bays at ${BAY.pitch}mm pitch`
);
console.log(
  `all three banners ${PANEL_H}mm (7ft) high · tops on one line at ${TOP_LINE}mm AFL · bottom edge ${MOUNT}mm · copy centred\n`
);
for (const p of PANELS) {
  console.log(`${p.label}`);
  console.log(
    `  ${p.ftSize}  ${p.w}x${p.h}mm + ${BLEED}mm bleed -> ${mm(p.w + BLEED * 2)}x${mm(
      p.h + BLEED * 2
    )}px  ·  ${p.zones.length} zone${p.zones.length > 1 ? `s of ${p.zoneW}mm` : ""}`
  );
  for (const [k, t] of Object.entries(p.type)) {
    const ok = readAt(t.mm, t.face) >= t.at;
    console.log(
      `    ${k.padEnd(9)} ${String(t.mm).padStart(3)}mm  cap ${capOf(t.mm, t.face)
        .toFixed(0)
        .padStart(3)}mm  reads ${readAt(t.mm, t.face).toFixed(1).padStart(5)}m  ` +
        `(designed ${String(t.at).padStart(2)}m)  ${ok ? "ok  " : "SHORT"}  ${t.face.family}`
    );
  }
  console.log();
}
