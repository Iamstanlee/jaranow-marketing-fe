/* Jaranow — carwash roadside signage.
   Emits one HTML panel per orientation x ground colourway; rasterize-sign.sh
   screenshots them. Type is Rubik (the site face, pulled from Google Fonts at
   render time); the lockups are the real brand SVGs, inlined.

   Panels are rendered at 2 px/mm, i.e. ~51 dpi at full size. That is correct for
   large format, where the viewer is metres away. Do NOT "fix" this to 300dpi -
   the portrait panel would be 10630 x 21260 px for no visible gain.

   TYPE IS SIZED FROM VIEWING DISTANCE, NOT BY EYE. The rule of thumb is 25mm of
   cap height per 3m of comfortable reading distance. The script prints what each
   element actually resolves at, per panel. If you change a size, read the table.

   Usage: node gen-sign.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "sign");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

const PX_PER_MM = 2;
const BLEED = 20;
const mm = (n) => Math.round(n * PX_PER_MM);

/* ---- headline face ----
   The headline is set in Archivo Black, not Rubik. Rubik's 700 is a text bold;
   at 20m what carries is stroke WEIGHT and letter WIDTH, and Archivo Black has
   markedly more of both. Everything else on the panel stays Rubik, so the sign
   reads as one family with the site.

   This is not a wordmark substitution - BRAND-STANDARD §8.1 forbids re-setting
   `jaranow` in a typeface, but CAR WASH is a service descriptor in type, and
   the lockup beside it is still the drawn SVG.

   Archivo Black ships ONE weight (400). Asking for 700 gets you a synthetic
   bold - the renderer smears the outline and the edges go soft at size, which
   is exactly what a sign cannot afford. Keep the weight at 400.

   capRatio is per face because the legibility table below is computed from it:
   swap the face and the metric has to come with it or every distance is wrong. */
const HEADLINE = { family: "Archivo Black", weight: 400, capRatio: 0.72 };
const BODY = { family: "Rubik", capRatio: 0.72 };

/* ---- legibility ----
   Comfortable reading distance is ~120x cap height (the "25mm of letter per 3m"
   rule); glance-legible, which is what matters for traffic, is roughly double. */
const capOf = (fontMm, face = BODY) => fontMm * face.capRatio;
const readAt = (fontMm, face = BODY) => (capOf(fontMm, face) * 120) / 1000; // metres

/* ---- panels ----
   The headline is CAR WASH, not the brand: the `carwash` line inside the lockup
   renders at ~30mm cap, legible from about 3.6m, so at road distance the lockup
   says WHO but never WHAT. The service name has to carry that.

   Orientation drives how big it can get, and they are not equivalent:

     portrait   900 x 1800  headline STACKED. One line caps out at ~140mm against
                            the 780mm content width; two lines fit 230mm.
                            At 230mm in Archivo Black, WASH now very nearly fills
                            that 780mm - there is ~50mm of slack left, where Rubik
                            left far more. The size is width-bound by that word:
                            a heavier or wider face, or a longer headline, does
                            not fit and has to come down.
     landscape 2400 x 1200  headline on ONE line. The width is there, so it fits
                            300mm - a single fixation AND the longer read of the
                            two. Landscape is the better sign where the site
                            allows it.

   `reserve` is the vertical space held clear at the bottom for the full-bleed
   contact band. Grow the band and this has to grow with it, or the band will
   sit on top of the copy. */
const PANELS = {
  portrait: {
    w: 900,
    h: 1800,
    safe: 60,
    reserve: 300,
    lockup: 620,
    stacked: true,
    type: { headline: 230, services: 56, band: 44 },
  },
  landscape: {
    w: 2400,
    h: 1200,
    safe: 80,
    reserve: 270,
    lockup: 700,
    stacked: false,
    type: { headline: 300, services: 76, band: 60 },
  },
  /* ---- the minimal panel ----
     The lockup and CAR WASH, and nothing else: no services line, no hours, no
     contact band. It is not a stripped-down version of the panel above so much
     as a different job - this one is read at speed from the road, where a
     driver gets one fixation and a phone number is unreadable anyway. Use the
     full panel where people are stopped or walking past, this one where they
     are moving.

     Dropping the band and the services is what pays for the size: the headline
     is width-bound, and "CAR WASH" in Archivo Black measures 5.96x its font
     size, so 2240mm of content width caps it at ~375mm. At 355 it reads about
     30m against the full panel's 26m, and the removed lines were resolving at
     ~7m regardless - they were never the thing carrying the sign at distance.

     The dot field, the drop and the accent bar stay. They are the panel's
     construction rather than content, and without them this is a headline on a
     rectangle that could belong to anyone. */
  "landscape-minimal": {
    w: 2400,
    h: 1200,
    safe: 80,
    reserve: 120,
    lockup: 880,
    stacked: false,
    minimal: true,
    bar: 40,
    gap: 90, // lockup to headline
    type: { headline: 355 },
  },
  /* ---- the minimal panel at 2x, and a different design ----
     4800 x 2400mm - a gantry, a wall or a hoarding rather than legs at the
     kerb. NOT the panel above scaled. Scaling it would have been defensible and
     was the first cut, but it wastes what the size actually buys: a centred
     lockup over a centred headline holds its proportions and therefore reads at
     the same *relative* size, so the panel gets bigger without getting louder.

     This one is built the other way round. The headline is the panel: CAR /
     WASH stacked flush left, filling the sheet corner to corner, with the
     lockup reduced to a signature above it. `style: "edge"` is what turns that on
     (flush-left stack, no drop).

     The arithmetic, since the sizes are solved rather than chosen. Archivo
     Black measures (at this letter-spacing, MEASURED not guessed):

       "CAR WASH"  5.960 x font size      "CAR"   2.319 x
                                          "WASH"  3.313 x   <- the binding word

     One line would be width-bound at 4560/5.96 = 765mm. Stacked, width allows
     4560/3.313 = 1376mm, so the panel stops being width-bound and becomes
     height-bound instead - and height is what two big lines eat. What is left
     after the lockup (212mm), the gap and the margins is 1808mm, which at 0.8
     line-height sets two lines of 1130mm. That is 814mm of cap, comfortable at
     ~98m against the scaled version's 61m. Stacking is worth ~37m here, the
     exact opposite of the portrait panel where stacking was forced by width.

     WASH then measures 3744mm of the 4560mm content width - 82%, ragged right
     by design. Do not track the lines out to justify them flush both edges:
     CAR is 70% of WASH's width and needs ~200mm of letter-spacing to match it,
     which opens the counters at exactly the distance this panel exists for.

     No drop on this one. At this size the dot field and the bar carry the
     construction on their own, and a cropped drop behind letters this heavy
     reads as a printing fault rather than as a watermark. The dot field is 60mm
     rather than the default 34 or a doubled 68: doubling is optically identical
     at twice the viewing distance, but this panel is walked past too, and at
     68mm the field reads as a pattern of discs instead of texture. Bleed stays
     20mm - a fabrication allowance, not a proportion.

     If you lengthen the headline, WASH stops being the binding word and the
     size has to be re-solved from whatever is longest. Read the legibility
     table the script prints. */
  "landscape-minimal-xl": {
    w: 4800,
    h: 2400,
    safe: 120,
    reserve: 180,
    /* A signature, not a header - a fraction of the 880mm the 2400mm panel
       gives it, because here the headline is the panel. Below ~600mm it stops
       reading as a deliberate mark and starts looking like it was forgotten in
       the corner; every millimetre above that comes straight off the type. */
    lockup: 640,
    stacked: true, // CAR / WASH on two lines
    minimal: true,
    style: "edge", // flush left, headline fills the panel, no drop
    bar: 80,
    gap: 80,
    type: { headline: 1130 },
    dot: { pitch: 60, size: 3.0 },
  },

  /* ---- XL, split ----
     The symbol stops being a watermark and becomes half the composition: type
     stacked in a 60% column on the left, drop anchoring the right. The one of
     the four that is recognisably Jaranow with the type covered, which is worth
     something on a site where the panel is seen obliquely or in passing.

     It costs distance, and the cost is the point of the trade: the headline is
     width-bound by its column, 2736/3.313 = 826mm, so 810 sets ~583mm of cap
     and ~70m against the edge build's ~98m. Widen `col` and the drop stops
     being a shape and becomes a sliver; narrow it and the type falls away.
     0.6 is where both still read.

     The drop is 1500mm on a 2400mm panel, fully on the sheet - this is the one
     build where it is NOT cropped, because a cropped drop reads as a watermark
     and the whole point here is that it is an object. */
  "landscape-minimal-xl-split": {
    w: 4800,
    h: 2400,
    safe: 120,
    reserve: 180,
    lockup: 560,
    stacked: true,
    minimal: true,
    style: "split",
    bar: 80,
    gap: 70,
    col: 0.6, // left column as a fraction of the content width
    drop: 1500, // solid symbol height
    type: { headline: 810 },
    dot: { pitch: 60, size: 3.0 },
  },

  /* ---- XL, band ----
     A full-bleed accent band across the top carrying the lockup, one line of
     headline below. The most structured of the four, and the only one that is
     identifiable before the type resolves - a 440mm bar of Jaranow blue across
     4.8m reads as a colour block from further away than any letter on the
     panel. Good where the sign is one of several competing for attention.

     One line means width-bound again: 4560/5.96 = 765mm, so 730 leaves the
     usual slack and sets ~526mm of cap, ~63m. That is the price of the
     structure - the two stacked builds are half again as legible. Take this one
     for the presence, not the distance.

     `band` is the band's own height; the body clears it with band + gap, so
     growing one without the other pushes the headline under it. */
  "landscape-minimal-xl-band": {
    w: 4800,
    h: 2400,
    safe: 120,
    reserve: 180,
    lockup: 700,
    stacked: false,
    minimal: true,
    style: "band",
    bar: 80,
    band: 440,
    gap: 140, // clearance between band and headline
    type: { headline: 730 },
    dot: { pitch: 60, size: 3.0 },
  },

  /* ---- XL, block ----
     The headline crosses a colour boundary: CAR sits on the field, WASH is
     knocked out of a full-bleed accent block that replaces the bar. The
     boundary does the work the line break does in the edge build, so it holds
     up at distance while looking nothing like it.

     Height is shared between a line of type on the field and a block that has
     to hold a line of type, so this one runs smaller than the other stacked
     build - 920mm, ~662mm cap, ~79m. The block is 1.15x the type size: less and
     the descenderless caps sit tight against the trim, more and the panel is
     half accent and the field stops being the ground.

     Both words are one size. Setting WASH larger reads as two messages, and the
     block is already giving it all the emphasis it needs. There is no separate
     bar - the block IS the bar, grown until it can hold type. */
  "landscape-minimal-xl-block": {
    w: 4800,
    h: 2400,
    safe: 120,
    reserve: 0, // the block sets the bottom clearance
    lockup: 520,
    stacked: false,
    minimal: true,
    style: "block",
    gap: 60,
    type: { headline: 920 },
    dot: { pitch: 60, size: 3.0 },
  },
};

/* Each ground carries its own lockup and watermark colourway, because a
   knockout mark disappears on a light field. BRAND-STANDARD §8.8: the accent
   colourway never goes on a dark ground - dark grounds take `-white`, light
   grounds take `-duo`.

   `wmOpacity` is per ground too: .04 reads as a ghost on Ink, but the same
   value in blue on Paper is effectively invisible, so the light panel carries
   the drop a little stronger. */
/* ---- services line ----
   Grouped, not a flat list, because the two panels have very different room.
   Portrait sets ONE GROUP PER LINE - all four on one line overruns the 780mm
   content width at 56mm type and wraps somewhere the design did not choose.
   Landscape has 2240mm and runs them together on a single line.

   Keep the groups balanced at two each: a group of one orphans on portrait.
   These must stay in step with the services on the price list (gen-pricelist.js)
   and with src/components/carwash/Pricing.tsx. */
const SERVICES = [
  ["Exterior wash", "Full wash"],
  ["Vacuum wash", "Detailing"],
];

const GROUNDS = {
  ink: {
    bg: INK, fg: PAPER, band: ACCENT, bandFg: PAPER,
    dot: "rgba(242,245,251,.10)",
    lockup: "jaranow-carwash-by-jaranow-white", wm: "white", wmOpacity: 0.04,
  },
  blue: {
    bg: ACCENT, fg: PAPER, band: INK, bandFg: PAPER,
    dot: "rgba(242,245,251,.13)",
    lockup: "jaranow-carwash-by-jaranow-white", wm: "white", wmOpacity: 0.04,
  },
  /* Light panel. Reads as the site does - Paper field, Ink type, one accent
     band anchoring the contact line. Best where the sign is under cover or
     against a dark wall; the Ink panels hold up better in direct sun. */
  paper: {
    bg: PAPER, fg: INK, band: ACCENT, bandFg: PAPER,
    dot: "rgba(14,21,38,.10)",
    lockup: "jaranow-carwash-by-jaranow-duo", wm: "blue", wmOpacity: 0.07,
  },
};

/* inline a brand SVG at a fixed px width */
function mark(name, width) {
  let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", `<svg style="width:${width}px;height:auto;display:block" `);
}

function watermark(colourway) {
  let s = fs.readFileSync(path.join(SVG, `jaranow-symbol-${colourway}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", '<svg class="wm" ');
}

/* The symbol as a composition element rather than a watermark - `split` sets it
   beside the type at real presence. Same file, same colourway rule as the
   watermark (§8.8, misuse item 8: the accent colourway never goes on a dark
   ground, so dark grounds get the white symbol and light grounds the blue). */
function solidDrop(colourway) {
  let s = fs.readFileSync(path.join(SVG, `jaranow-symbol-${colourway}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", '<svg class="drop" ');
}

const CSS = (p, g) => {
  const T = p.type;
  /* Portrait has height to spare, so the drop sits low and centred. Landscape
     does not, so it bleeds off the right edge instead - same trick as the
     Open Graph cards. */
  /* Each branch sets BOTH width and height - do not append a shared
     `height:auto` after this, it clobbers the landscape height and the drop
     renders at its intrinsic size as a smudge across the middle.

     The landscape drop is sized FROM THE PANEL, not fixed: taller than the
     sheet and cropped an eighth of the width past the right edge. Hardcoding
     1500/300mm reproduces the 2400x1200 panel exactly, but on the 2x panel the
     same figures stop bleeding off anything and leave a small drop hanging in
     the field. */
  const wm = p.stacked
    ? `left:50%; bottom:${mm(210)}px; transform:translateX(-50%); width:${mm(880)}px; height:auto;`
    : `right:${mm(-p.w * 0.125)}px; top:50%; transform:translateY(-50%); height:${mm(p.h * 1.25)}px; width:auto;`;

  /* Dot field. Per panel, because the pitch is in millimetres on the sheet:
     the default suits panels up to ~2400mm, and a bigger one overrides it
     rather than inheriting a field that reads as noise. */
  const dot = { pitch: 34, size: 1.6, ...(p.dot || {}) };

  return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${mm(p.w + BLEED * 2)}px;height:${mm(p.h + BLEED * 2)}px;overflow:hidden}
  body{
    background:${g.bg}; color:${g.fg};
    font-family:'Rubik',system-ui,sans-serif;
    position:relative;
    display:flex; flex-direction:column; align-items:center;
    padding:${mm(BLEED + p.safe)}px ${mm(BLEED + p.safe)}px ${mm(BLEED + p.reserve)}px;
    text-align:center;
  }
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(${g.dot} ${mm(dot.size)}px, transparent ${mm(dot.size)}px);
    background-size:${mm(dot.pitch)}px ${mm(dot.pitch)}px;
  }
  .wm{position:absolute; ${wm} opacity:${g.wmOpacity}}
  .top{position:relative; z-index:2}
  /* The message block centres in whatever is left between lockup and band, so
     neither panel ends up with a dead zone. */
  .mid{
    position:relative; z-index:2; flex:1;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
  }
  h1{
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    /* 400 is Archivo Black's only weight - see the HEADLINE note above. */
    font-size:${mm(T.headline)}px; line-height:${p.stacked ? ".9" : "1"};
    font-weight:${HEADLINE.weight};
    /* Looser than Rubik's -.03em: the face is already tight, and heavy letters
       need air between them or the counters close up at distance. */
    letter-spacing:-.005em;
  }
  .services{
    font-size:${mm(T.services)}px; line-height:1.3; font-weight:500;
    letter-spacing:.02em; margin-top:${mm(p.stacked ? 56 : 44)}px;
  }
  .hours{
    font-size:${mm(T.services)}px; font-weight:400; opacity:.72;
    margin-top:${mm(20)}px;
  }
  /* Full-bleed contact band - the line people photograph from the kerb. */
  .band{
    position:absolute; left:0; right:0; bottom:0; z-index:2;
    background:${g.band}; color:${g.bandFg};
    padding:${mm(58)}px ${mm(40)}px ${mm(BLEED + 52)}px;
    display:flex; flex-direction:column; align-items:center; gap:${mm(20)}px;
  }
  .addr{
    font-size:${mm(T.band)}px; font-weight:700; letter-spacing:.12em;
    text-transform:uppercase;
  }
  .tel{font-size:${mm(T.band * 1.25)}px; font-weight:700; font-variant-numeric:tabular-nums}
${
  !p.minimal
    ? ""
    : `
  /* Minimal panel: no band to sit above, so the whole stack centres in the
     panel instead of hanging off the top edge. */
  body{justify-content:center}
  .top{margin-bottom:${mm(p.gap)}px}
  .mid{flex:0 0 auto}
${styleCSS(p, g)}
${
  p.style === "block"
    ? ""
    : `  /* Slim accent bar in place of the contact band - the same device that closes
     the price lists and posters. It is cut into by the bleed, so it has to be
     taller than BLEED to leave anything on the finished panel. */
  .bar{
    position:absolute; left:0; right:0; bottom:0; z-index:2;
    height:${mm(BLEED + p.bar)}px; background:${g.band};
  }`
}`
}
`;
};

/* ---- the XL styles ----
   Everything above draws the centred panel. These four are alternative
   treatments of the SAME content (lockup + CAR WASH) on the 4800x2400 sheet,
   selected per panel with `style`. They are alternatives to choose between, not
   a set to print together - a site gets one.

   Each one solves its type size differently, which is the actual difference
   between them; the note on each panel in PANELS carries the arithmetic. */
const styleCSS = (p, g) => {
  const T = p.type;
  const contentW = p.w - p.safe * 2;

  if (p.style === "edge") {
    return `
  /* EDGE - the headline IS the panel. Flush left rather than centred: centred
     type at this size floats, and the left edge gives the two lines a spine to
     hang off. Tighter leading than the portrait stack (.8 against .9) because
     every millimetre between the lines comes off the type size, and at .8 there
     is still ~.08em of clear space between cap bottom and cap top. */
  body{align-items:flex-start; text-align:left}
  .mid{align-items:flex-start}
  h1{line-height:.8}`;
  }

  if (p.style === "split") {
    /* The type is width-bound by its column rather than by the sheet, which is
       what pays for the drop: give the symbol a third of the panel and the
       headline is solved from the remaining 60%. */
    const leftW = contentW * p.col;
    return `
  /* SPLIT - the symbol as a composition element, not a watermark. Type stacked
     flush left in its own column, drop anchoring the right. Vertically centred
     as a pair, so the two halves read as one block rather than as type with
     something floating beside it. */
  body{align-items:stretch; text-align:left; justify-content:center}
  .split{
    position:relative; z-index:2; width:100%;
    display:flex; align-items:center; justify-content:space-between;
  }
  .left{width:${mm(leftW)}px; flex:0 0 auto}
  .right{flex:1; display:flex; justify-content:flex-end; align-items:center}
  /* Solid rather than the .04 ghost, but still short of full strength: at 100%
     a drop this size is a second focal point competing with the headline.
     Derived from the ground's own watermark value so the light panel, which
     needs more, keeps getting more. */
  .drop{height:${mm(p.drop)}px; width:auto; opacity:${Math.min(1, g.wmOpacity * 4).toFixed(2)}}
  .top{margin-bottom:${mm(p.gap)}px}
  h1{line-height:.8}`;
  }

  if (p.style === "band") {
    return `
  /* BAND - the lockup in a full-bleed accent band across the top, headline on
     one line below. The most structured of the four and the only one that reads
     as branded from behind: the band is visible as a colour block long before
     the type resolves. One line costs size (width-bound at ${(contentW / 5.96).toFixed(0)}mm against
     the stacked builds), and buys an unbroken horizontal read. */
  body{
    align-items:flex-start; text-align:left; justify-content:center;
    padding-top:${mm(BLEED + p.band + p.gap)}px;
  }
  .topband{
    position:absolute; top:0; left:0; right:0; z-index:2;
    height:${mm(BLEED + p.band)}px; background:${g.band};
    display:flex; align-items:center;
    padding:${mm(BLEED)}px 0 0 ${mm(BLEED + p.safe)}px;
  }
  .mid{align-items:flex-start}
  h1{line-height:1}`;
  }

  if (p.style === "block") {
    /* The block is the bar grown until it can hold a line of type. It replaces
       the bar rather than joining it - two accent edges on one panel and the
       sheet reads as a sandwich. */
    const blockH = T.headline * 1.05;
    return `
  /* BLOCK - the headline split across the two grounds: CAR on the field, WASH
     knocked out of a full-bleed accent block. The colour change does the work
     the stacking does in the edge build, so it carries at distance while
     looking nothing like it. Both words share one size - setting them
     differently makes it read as two messages. */
  body{
    align-items:flex-start; text-align:left; justify-content:flex-start;
    padding-bottom:${mm(BLEED + blockH)}px;
  }
  /* CAR sits hard against the top of the block rather than centring in the
     space above it. Centred, the two words read as two messages with a colour
     change between them; pushed together, the boundary falls INSIDE one
     headline, which is the whole idea. The lockup keeps the top corner and the
     pair goes bottom-weighted - that is deliberate, not a gap to close. */
  .mid{flex:1; align-items:flex-start; justify-content:flex-end}
  h1{line-height:.85}
  .block{
    position:absolute; left:0; right:0; bottom:0; z-index:2;
    height:${mm(BLEED + blockH)}px; background:${g.band}; color:${g.bandFg};
    display:flex; align-items:center;
    padding:0 0 ${mm(BLEED)}px ${mm(BLEED + p.safe)}px;
  }
  /* Same face and size as the h1 above it - the two words are one headline that
     happens to cross a colour boundary. */
  .w{
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-size:${mm(T.headline)}px; font-weight:${HEADLINE.weight};
    line-height:1; letter-spacing:-.005em; display:block;
  }`;
  }

  return "";
};

/* ---- markup ----
   One function per style, because the four XL treatments are different
   compositions and not one composition with different numbers. The headline
   text is the same in all of them: it is CAR WASH, stacked or not. */
const headline = (p) => `<h1>${p.stacked ? "CAR<br>WASH" : "CAR WASH"}</h1>`;

const body = (p, g) => {
  const lockup = (w) => `<div class="top">${mark(g.lockup, mm(w))}</div>`;

  if (p.style === "split") {
    return `<div class="split">
  <div class="left">
    ${lockup(p.lockup)}
    ${headline(p)}
  </div>
  <div class="right">${solidDrop(g.wm)}</div>
</div>
<div class="bar"></div>`;
  }

  if (p.style === "band") {
    /* The band is accent or Ink on every ground, so the lockup inside it is
       always the knockout - never `g.lockup`, which is the colourway for the
       FIELD and goes invisible against the band on the paper panel. */
    return `<div class="topband">${mark("jaranow-carwash-by-jaranow-white", mm(p.lockup))}</div>
<div class="mid">${headline(p)}</div>
<div class="bar"></div>`;
  }

  if (p.style === "block") {
    return `${lockup(p.lockup)}
<div class="mid"><h1>CAR</h1></div>
<div class="block"><span class="w">WASH</span></div>`;
  }

  /* edge, and the centred panels it inherits from */
  return `${p.style === "edge" ? "" : watermark(g.wm)}
${lockup(p.lockup)}
<div class="mid">
  ${headline(p)}
${
  p.minimal
    ? ""
    : `  <p class="services">${
        p.stacked
          ? SERVICES.map((s) => s.join(" · ")).join("<br>")
          : SERVICES.flat().join(" · ")
      }</p>
  <p class="hours">Open daily · 8am–7pm</p>`
}
</div>
${
  p.minimal
    ? `<div class="bar"></div>`
    : `<div class="band">
  <span class="addr">6th Avenue, Gwarinpa</span>
  <span class="tel">0903 862 2012</span>
</div>`
}`;
};

const sizes = [];

for (const [pname, p] of Object.entries(PANELS)) {
  for (const [gname, g] of Object.entries(GROUNDS)) {
    const base = `sign-carwash-${pname}-${gname}`;
    const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Archivo+Black&display=block" rel="stylesheet">
<style>${CSS(p, g)}</style></head><body>
<div class="dots"></div>
${body(p, g)}
</body></html>`;
    fs.writeFileSync(path.join(OUT, "html", `${base}.html`), html);
    sizes.push(`${base} ${mm(p.w + BLEED * 2)} ${mm(p.h + BLEED * 2)}`);
    console.log(`template  ${base}.html`);
  }
}

/* Panels differ in pixel size, so the rasterizer reads dimensions from here
   rather than hardcoding one window size. */
fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");

console.log(`\n${sizes.length} panels @ ${PX_PER_MM}px/mm (~${(PX_PER_MM * 25.4).toFixed(0)}dpi at full size)`);
for (const [pname, p] of Object.entries(PANELS)) {
  console.log(`\n${pname}  ${p.w}x${p.h}mm + ${BLEED}mm bleed  ->  ${mm(p.w + BLEED * 2)}x${mm(p.h + BLEED * 2)}px`);
  console.log("  legibility (comfortable read; glance-legible is roughly double):");
  for (const [k, v] of Object.entries(p.type)) {
    const face = k === "headline" ? HEADLINE : BODY;
    console.log(
      `    ${k.padEnd(9)} ${String(v).padStart(3)}mm type  cap ${capOf(v, face).toFixed(0).padStart(3)}mm  ->  ${readAt(v, face).toFixed(1)}m   ${face.family}`
    );
  }
}
