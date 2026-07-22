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

   This is not a wordmark substitution - BRAND-STANDARD §7.1 forbids re-setting
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
};

/* Each ground carries its own lockup and watermark colourway, because a
   knockout mark disappears on a light field. BRAND-STANDARD §7.8: the accent
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
  ["Vacuum wash", "Buffing"],
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

const CSS = (p, g) => {
  const T = p.type;
  /* Portrait has height to spare, so the drop sits low and centred. Landscape
     does not, so it bleeds off the right edge instead - same trick as the
     Open Graph cards. */
  /* Each branch sets BOTH width and height - do not append a shared
     `height:auto` after this, it clobbers the landscape height and the drop
     renders at its intrinsic size as a smudge across the middle. */
  const wm = p.stacked
    ? `left:50%; bottom:${mm(210)}px; transform:translateX(-50%); width:${mm(880)}px; height:auto;`
    : `right:${mm(-300)}px; top:50%; transform:translateY(-50%); height:${mm(1500)}px; width:auto;`;

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
    background-image:radial-gradient(${g.dot} ${mm(1.6)}px, transparent ${mm(1.6)}px);
    background-size:${mm(34)}px ${mm(34)}px;
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
`;
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
${watermark(g.wm)}
<div class="top">${mark(g.lockup, mm(p.lockup))}</div>
<div class="mid">
  <h1>${p.stacked ? "CAR<br>WASH" : "CAR WASH"}</h1>
  <p class="services">${
    p.stacked
      ? SERVICES.map((g) => g.join(" · ")).join("<br>")
      : SERVICES.flat().join(" · ")
  }</p>
  <p class="hours">Open daily · 8am–7pm</p>
</div>
<div class="band">
  <span class="addr">6th Avenue, Gwarinpa</span>
  <span class="tel">0903 862 2012</span>
</div>
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
