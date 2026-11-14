/* Jaranow — carwash roadside signage: one HTML per PANELS x GROUNDS entry;
   rasterize-sign.sh shoots them. 2px/mm (~51dpi) is correct for large format -
   do not "fix" to 300dpi. Type is sized from viewing distance: read the printed
   legibility table after any size change. Layouts: CLAUDE.md "Roadside signage".

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

/* Archivo Black ships ONE weight; 700 gets a smeared synthetic bold. capRatio is
   per face - swap a face without its metric and every distance in the table is wrong. */
const HEADLINE = { family: "Archivo Black", weight: 400, capRatio: 0.72 };
const BODY = { family: "Rubik", capRatio: 0.72 };

// ~120x cap height is a comfortable read; glance-legible is roughly double.
const capOf = (fontMm, face = BODY) => fontMm * face.capRatio;
const readAt = (fontMm, face = BODY) => (capOf(fontMm, face) * 120) / 1000; // metres

/* Headline sizes are solved from measured Archivo Black widths (at this tracking):
   "CAR WASH" 5.960x font size, "CAR" 2.319x, "WASH" 3.313x. Portrait is
   width-bound by WASH (~50mm slack at 230). Lengthen the headline and re-solve.
   `reserve` must grow with the contact band or the band covers the copy. */
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
  // Width-bound: 2240/5.96 caps the headline at ~375mm.
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
  /* Height-bound once stacked: 1808mm left after lockup, gap and margins sets two
     lines of 1130 at .8 leading. Ragged right and the 60mm dot field are
     deliberate - see CLAUDE.md "Roadside signage". */
  "landscape-minimal-xl": {
    w: 4800,
    h: 2400,
    safe: 120,
    reserve: 180,
    // Below ~600 it looks forgotten; every mm above comes off the type.
    lockup: 640,
    stacked: true, // CAR / WASH on two lines
    minimal: true,
    style: "edge", // flush left, headline fills the panel, no drop
    bar: 80,
    gap: 80,
    type: { headline: 1130 },
    dot: { pitch: 60, size: 3.0 },
  },

  /* Width-bound by its column: 2736/3.313 = 826mm. col 0.6 is where both type and
     drop still read. The only build whose drop is NOT cropped - it must read as an object. */
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

  /* One line, width-bound at 4560/5.96 = 765mm. The body clears band + gap, so
     grow both together or the headline slides under the band. */
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

  /* No bar - the block IS the bar. Both words one size, or it reads as two messages. */
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

/* Grouped: portrait sets one group per line. Keep groups at two each (one
   orphans). Keep in step with gen-pricelist.js and carwash/Pricing.tsx. */
const SERVICES = [
  ["Exterior wash", "Full wash"],
  ["Vacuum wash", "Detailing"],
];

// Lockup and wmOpacity are per ground (§8.8; .04 that ghosts on Ink vanishes on Paper).
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
  paper: {
    bg: PAPER, fg: INK, band: ACCENT, bandFg: PAPER,
    dot: "rgba(14,21,38,.10)",
    lockup: "jaranow-carwash-by-jaranow-duo", wm: "blue", wmOpacity: 0.07,
  },
};

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

function solidDrop(colourway) {
  let s = fs.readFileSync(path.join(SVG, `jaranow-symbol-${colourway}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", '<svg class="drop" ');
}

const CSS = (p, g) => {
  const T = p.type;
  /* Each branch sets BOTH width and height - a shared `height:auto` after this
     clobbers the landscape drop into a smudge. Landscape is sized from the panel
     so it still bleeds off the XL sheets. */
  const wm = p.stacked
    ? `left:50%; bottom:${mm(210)}px; transform:translateX(-50%); width:${mm(880)}px; height:auto;`
    : `right:${mm(-p.w * 0.125)}px; top:50%; transform:translateY(-50%); height:${mm(p.h * 1.25)}px; width:auto;`;

  // Default suits panels up to ~2400mm; bigger ones override via p.dot.
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

// XL treatments, chosen per panel by `style`. Alternatives, not a set - a site gets one.
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
    // Always -white, never g.lockup (the FIELD colourway) - it vanishes on the band.
    return `<div class="topband">${mark("jaranow-carwash-by-jaranow-white", mm(p.lockup))}</div>
<div class="mid">${headline(p)}</div>
<div class="bar"></div>`;
  }

  if (p.style === "block") {
    return `${lockup(p.lockup)}
<div class="mid"><h1>CAR</h1></div>
<div class="block"><span class="w">WASH</span></div>`;
  }

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
