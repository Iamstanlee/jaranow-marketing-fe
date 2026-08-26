/* Jaranow — carwash BAY banners: the three walls of a four-car wash bay.

   Real measured sizes, in feet because that is how the banner is ordered:

     back        40 x 7 ft   12192 x 2134mm   one piece, three zones
     left/right  17 x 7 ft    5182 x 2134mm   one zone each

   THE BAY IS WIDE, NOT DEEP. Four cars park side by side facing the back wall,
   so the back is the long side and the two returns are short. All three are the
   SAME HEIGHT, which is what lets the whole room use one construction: a dot
   field, a ghost drop per zone, a band of copy, an accent bar. Five zones in
   total - three on the back, one on each return - built identically and
   differing only in what they say.

   ---- how they hang ----
   All three are 7ft and hang with their TOPS ON ONE LINE at 2700mm AFL, so the
   bottom edge is 566 on every wall. That single line all the way round the room
   is what makes three surfaces read as one space rather than three signs.

   Copy is CENTRED in the panel, between the safe top and the accent bar, so the
   block's optical centre lands at ~1660mm AFL - about standing eye height in
   the bay. Worth knowing when a site differs: a 1500mm saloon parked in front
   masks the wall up to roughly 1380mm from a viewer a few metres outside the
   opening, so on a tall block the last line (a sub line, the contact chip) can
   fall behind a car when the bay is full. That is the cost of a centred
   composition and it is accepted here; the fix on a site where it bites is to
   raise the whole banner, not to shuffle the copy upward inside it.

   ---- what each wall says ----
     BACK   the promise · who we are · the reassurance   (three zones)
     LEFT   the offer, and the number                    (driver's side)
     RIGHT  the care                                     (passenger side)

   Nigeria drives on the right, so the driver sits on the LEFT of the car and
   their window faces the LEFT wall. That is why the number they might
   photograph is on the left. The two returns are the same size and the same
   construction, so swapping them is a data edit.

   The four values are spread one per zone and never repeated: "WE TAKE OUR
   TIME" already says "we don't rush your car", so only one of them is on a
   wall. Two lines saying the same thing in one room is the failure mode.

   ---- three zones, not four ----
   The back wall's zones are THIRDS OF THE WALL, not one per bay. With four bays
   at a 3048mm pitch and three zones at 4064mm the boundaries fall mid-bay, and
   the centre zone serves the two middle cars - which is the right trade,
   because it puts the lockup dead centre on the wall and that is the shot every
   finished car gets photographed in front of.

   RENDERING THE BACK IN ONE PIECE NEEDS THE DEVICE-SCALE TRICK. 12,232mm at
   2px/mm is 24,464px and headless Chrome will not open a window past ~16,384.
   The page is authored at half the unit and shot with
   `--force-device-scale-factor=2`: the window is legal, the screenshot is full
   size. `dsf` in the manifest carries that per file and `emit` picks it
   automatically above WINDOW_MAX, so a bigger bay keeps working.

   ---- rules carried over from the rest of the system ----
   EVERY HEADING IS ARCHIVO BLACK, and that is a DELIBERATE DEPARTURE from
   BRAND-STANDARD §8.12, which lists "more than once on a surface" as misuse.
   The back wall is one 40ft banner and carries two of them - the promise in
   zone 1 and the reassurance in zone 3. The reasoning: §8.12 exists so one line
   is the loudest thing a viewer takes in, and a 12m wall read from four
   different bays is three surfaces in every sense except how it is printed. A
   driver in bay 1 never sees zone 3 as competition.

   Hierarchy is therefore carried by SIZE, not by face: zone 1 at 430mm leads,
   the two statements sit at 310-360, and Rubik 700 is left to the sub lines and
   the phone number. If a future zone is added, keep it below 430 or the wall
   stops having a lead line. On a smaller surface the §8.12 rule still applies
   as written - do not cite this file as a precedent for a flyer or a card.

   THE LOCKUP APPEARS ONCE IN THE ROOM, in the back wall's centre zone. The
   other zones carry the ghost drop only.

   NO PRICES. A banner is up for years; the laminated A4 at the desk is not.

   NO BLUE FIELD. gen-sign.js offers an accent ground; a whole room of it does
   not work - "a surface that is mostly accent has no accent" (§9). Ink or
   Paper: Ink for an open or sunlit bay, and it is what makes a wet car read as
   clean in front of it; Paper for a covered or dim one. One ground for the
   whole room - a mixed set reads as three separate signs.

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

/* Sizes are ordered in feet and designed in millimetres. */
const ft = (n) => Math.round(n * 304.8);

/* Same 2px/mm as the roadside panels (~51dpi at full size). Correct for large
   format and NOT a bug: the closest anyone reads these from is ~1.5m, where
   half a millimetre of edge quantisation is at the limit of acuity. */
const PX_PER_MM = 2;
const BLEED = 20; // fabrication allowance; a hemmed banner takes its hem from it
const WINDOW_MAX = 16000; // headless Chrome stops opening windows around 16,384px
const mm = (n) => Math.round(n * PX_PER_MM);

const HEADLINE = { family: "Archivo Black", weight: 400, capRatio: 0.72 };
const BODY = { family: "Rubik", capRatio: 0.72 };

/* ~120x cap height is a comfortable read; glance-legible is roughly double. */
const capOf = (fontMm, face) => fontMm * face.capRatio;
const readAt = (fontMm, face) => (capOf(fontMm, face) * 120) / 1000;

/* ---- the bay ----
   Depth is the return wall's own length, so the side banners span it exactly.
   Four bays across 40ft is a 10ft pitch. `car` is the parked-car envelope the
   sightline is worked out from; `eye` the standing eye height the mockup is
   rendered from. Re-measure if a second site differs - every size follows. */
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

/* Every banner is 7ft and hangs with its TOP on one line at 2700mm AFL, which
   puts the bottom at 566 - clear of the splash zone, and low enough that the
   panel is not floating near the ceiling. Tops on one line all the way round is
   what makes three surfaces read as one room. */
const TOP_LINE = 2700;
const PANEL_H = ft(7);
const MOUNT = TOP_LINE - PANEL_H;
/* Where a parked car cuts the wall off, for the note in the mockup: a 1500mm
   saloon seen from a few metres outside the opening masks up to about this. */
const CAR_LINE = 1380;

/* ---- the panels ----
   Copy is data. `type` sizes are FONT sizes in millimetres, not cap heights -
   the table the script prints converts them, so read it after any change
   instead of guessing. `at` is the distance an element is designed for:

     back wall   4m   the driver, stopped, nose to the wall
                20m   from the street, through the opening
     returns     5m   across a bay; nobody gets further from a side wall
*/
const PANELS = [
  {
    id: "back",
    label: "Back wall — the promise, who we are, the reassurance",
    ftSize: "40 × 7 ft",
    w: BAY.w,
    /* Sized to sit inside a 4064mm third with air either side. "OUR TIME" is
       the binding word at ~5.9x its font size in Archivo Black; "before you
       pay." at ~8.3x in Rubik 700. Both have ~1000mm of slack at these sizes -
       lengthen a line and re-solve from whichever is now longest. */
    lockup: 2300,
    type: {
      headline: { mm: 430, face: HEADLINE, at: 20 },
      sub: { mm: 108, face: BODY, at: 8 },
      hours: { mm: 110, face: BODY, at: 8 },
      /* Archivo Black, so 14 characters is a much wider line than zone 1's
         "OUR TIME" at the same size. 310 keeps the line to 76% of the zone and
         keeps zone 1 leading on cap height, which is what carries hierarchy at
         distance - line length just reflects word count. */
      value: { mm: 310, face: HEADLINE, at: 12 },
    },
    zones: [
      /* "WE TAKE OUR TIME" is the promise and it is doing a second job: it
         tells a waiting customer that the wait IS the service - the care value
         stated exactly where impatience happens. The sub line is what stops it
         reading as "we are slow", so do not drop it. Stacked because one line
         of Archivo Black in a 4064mm zone would cap at ~340mm. */
      { kind: "promise", copy: ["WE TAKE", "OUR TIME"], sub: "so your car leaves clean, inside and out." },
      { kind: "brand", copy: "" },
      /* The reassurance. An invitation rather than a claim, and it states the
         actual policy: nobody pays for a wash they have not looked at.
         ALTERNATIVES, all true and all price-free - swap `copy` for one of
         these and re-check the width against the 3824mm zone:
           ["SEE IT FIRST", "THEN PAY"]        shortest, sets biggest
           ["LOOK IT OVER", "BEFORE YOU PAY"]  softer, same idea
           ["NOT DONE", "TILL YOU SAY SO"]     boldest - reads as an open-ended
                                               promise of rework, so only use it
                                               if that is genuinely the policy
           ["WE FINISH", "WHAT WE START"]      care rather than inspection */
      { kind: "value", copy: ["CLEAN CAR", "", "ELEVATED" ,"CONFIDENCE"] },
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
    /* The offer is five stamps and the SIXTH wash free - never a free fifth.
       The loyalty card's sixth slot is the reward, not a stamp (CLAUDE.md). */
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
    /* Rubik 700, not the display face. Archivo Black is spent on the back
       wall's promise and the left wall's offer (§8.12, one shout per surface),
       and the room needs the quiet statement to be quiet - two shouting returns
       facing each other across four metres is a shouting match.

       This wall used to carry the three wash names and a pointer to the price
       board. That was a price list with the figures taken out: it made a
       waiting passenger read a menu they had already ordered from, and said
       nothing about why to come back. The wash names live on the laminated A4
       at the desk (gen-pricelist.js) and on /pricing. */
    type: {
      statement: { mm: 360, face: HEADLINE, at: 5 },
      sub: { mm: 110, face: BODY, at: 4 },
    },
    zones: [
      /* The detail value: thoroughness, where the back wall's promise is about
         time. The shout is the detail, the sub is the plain approved sentence
         from the flyer - so someone handed that sheet last month meets the same
         words on the wall.
         ALTERNATIVES - swap `copy`/`sub` and re-check the width against the
         4662mm content width:
           ["INSIDE", "AND OUTSIDE"]      + "Body, wheels and glass on every wash."
           ["DONE", "PROPERLY"]           + "Inside and outside, wheels and glass included."
           ["EVERY PANEL", "EVERY WHEEL"] + "Body, wheels and glass on every wash."
           ["WE CLEAN", "INSIDE AND OUT"] + "The parts people miss are the parts we check."
         Do not reach for a line that names or counts the wash types - that is
         the laminated A4's job, and a banner outlives a service list. */
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

/* Geometry is uniform across the room, so it is applied rather than repeated. */
for (const p of PANELS) {
  Object.assign(p, { h: PANEL_H, mount: MOUNT, safe: 140, bar: 200 });
  p.zoneW = Math.round(p.w / p.zones.length);
}
const byId = Object.fromEntries(PANELS.map((p) => [p.id, p]));

/* Ground colourways. §8.8: dark grounds take the -white lockup, light grounds
   -duo, and the accent colourway never goes on a dark field. `wall`/`ceil`/
   `floor` are the bay's own surfaces in the mockup - painted block, not brand
   colour, so a banner reads as a banner rather than as the room. */
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

/* ---- the millimetre unit ----
   Every dimension is written as `calc(N * var(--u))`, where --u is one
   millimetre in pixels. That is what lets the same markup render at 2px/mm as a
   print file, at 1px/mm behind a 2x device scale, and at 0.26px/mm inside the
   mockup, all without a second stylesheet. Custom properties inherit and do not
   compound, which `em` would. --bleed is BLEED on a print file and 0 everywhere
   else, because a hung banner is trimmed. */
const U = (n) => `calc(${n} * var(--u))`;
const UB = (n) => `calc((${n} + var(--bleed, 0)) * var(--u))`;

function inlineSvg(name, cls, style) {
  let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", `<svg class="${cls}" style="${style}" `);
}

/* ---- one stylesheet for all three walls ----
   Scoped to `.p-<id>` so all three can live in one document (the mockup and the
   spec sheet both need that). The only per-wall differences are the width, the
   number of zones and which zone kinds are present. */
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

const page = (title, w, h, css, body) => `<!doctype html><html><head><meta charset="utf-8">
<title>${title}</title>
${FONTS}
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden}
${css}
</style></head><body>
${body}
</body></html>`;

/* ---- emit ----
   `dsf` is the device-scale trick described at the top: anything whose final
   pixel size would exceed the window ceiling is authored at half the unit and
   shot at 2x. The manifest carries the WINDOW size and the scale factor; the
   rasterizer multiplies. Picked automatically so a bigger bay keeps working. */
const sizes = [];
const emit = (base, wPx, hPx, mkPage) => {
  const dsf = Math.max(wPx, hPx) > WINDOW_MAX ? 2 : 1;
  const winW = Math.round(wPx / dsf);
  const winH = Math.round(hPx / dsf);
  fs.writeFileSync(path.join(OUT, "html", `${base}.html`), mkPage(dsf, winW, winH));
  sizes.push(`${base} ${winW} ${winH} ${dsf}`);
  console.log(
    `  ${base}.html`.padEnd(36) + `${wPx}x${hPx}px` + (dsf > 1 ? `  (window ${winW}x${winH} @${dsf}x)` : "")
  );
};

/* ---- 1. the print files ---------------------------------------------- */
console.log("print files");
for (const p of PANELS) {
  for (const [gname, g] of Object.entries(GROUNDS)) {
    emit(`bay-carwash-${p.id}-${gname}`, mm(p.w + BLEED * 2), mm(p.h + BLEED * 2), (dsf, w, h) =>
      page(
        `${p.label} (${gname})`,
        w,
        h,
        `  body{--u:${PX_PER_MM / dsf}px; --bleed:${BLEED}}\n${CSS(p, g)}`,
        panel(p, g)
      )
    );
  }
}

/* ---- 2. the mockup ----------------------------------------------------
   A real box interior in CSS 3D rather than three skewed rectangles: the room
   is built at 1mm = MK px, the camera sits BAY.camera in front of the opening
   at BAY.eye off the floor, and the walls are planes rotated into place. The
   perspective is therefore the bay's actual perspective, so what this says
   about how much of each wall a car hides is true rather than drawn.

   The four cars are the point of the drawing. Delete them and the 1500mm band
   looks arbitrary; with them it is obvious why nothing sits lower.

   THIS IS A MOCKUP, NOT ARTWORK. It exists to approve placement and colourway. */
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

/* ---- 3. the spec sheet ------------------------------------------------
   A3 landscape at 300dpi. The PNGs on their own do not say how big they are,
   what they print on, how high they hang or what each element is sized to be
   read from - this is the sheet that goes to the printer and the fitter. */
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

/* ---- the legibility table ----
   Read this after changing any size. `at` is what an element was designed for;
   `reads at` is what it resolves to. Under-shooting the design distance is the
   bug - over-shooting is only a bug if it broke the layout. */
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
