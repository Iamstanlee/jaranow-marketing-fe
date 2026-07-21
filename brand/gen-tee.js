/* Jaranow — carwash tee mockup generator.
   Emits one HTML sheet per garment colourway (front + back view); rasterize-tee.sh
   screenshots them to PNG. Type is Rubik (the site face, pulled from Google Fonts
   at render time); the lockups are the real brand SVGs, inlined.

   THIS IS A MOCKUP, NOT PRINT ARTWORK. It exists to approve placement and
   colourway. The garment is drawn geometry with soft shading - the shading is on
   the *cloth*, never on the mark, which stays flat per BRAND-STANDARD 4.2. Send a
   printer the lockup SVGs plus the placement figures in the captions, not these
   PNGs.

   Scale is honest: the tee is drawn at a size L (530mm pit to pit), so the print
   widths below are real millimetres and the mark's size on the body is what you
   would actually get.

   Usage: node gen-tee.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "tee");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

/* ---- garment geometry ---------------------------------------------------- */
/* The tee is drawn in a 640 x 660 viewBox at real size-L proportions:
     pit to pit      396 units = 530mm   (the scale reference)
     sleeve to sleeve 548 units = 733mm
     HPS to hem       542 units = 725mm
   Everything in mm flows from CHEST_UNITS, so the print sizes below are honest.
   Get the length wrong and the whole thing reads as a nightshirt. */
const VB_W = 640;
const VB_H = 660;
const CHEST_UNITS = 396;
const CHEST_MM = 530;
const TEE_W = 620; // rendered px width of the viewBox
const pxPerUnit = TEE_W / VB_W;
const pxPerMm = (pxPerUnit * CHEST_UNITS) / CHEST_MM;
const mm = (n) => +(n * pxPerMm).toFixed(1);

/* print sizes, in real millimetres across */
const CHEST_PRINT_MM = 90; // left chest
const BACK_PRINT_MM = 280; // across the shoulder blades

const PAGE_W = 1800;
const PAGE_H = 1100;

/* garment colourways. `mark` picks the lockup per BRAND-STANDARD 5:
   knockout on dark cloth, duo on light. */
const GARMENTS = {
  ink: {
    base: INK,
    edge: "#080D18",
    lift: "#1B2740",
    rib: "#0A1020",
    mark: "white",
    sub: "rgba(242,245,251,.62)",
  },
  paper: {
    base: PAPER,
    edge: "#D7DEEC",
    /* Not #FFF - the garment is Paper, and blowing the highlight out to white
       makes the sheet lie about the cloth colour it exists to approve. */
    lift: "#FBFCFE",
    rib: "#E4E9F4",
    mark: "duo",
    sub: "rgba(14,21,38,.52)",
  },
};

/* inline a brand SVG at a fixed px width */
function mark(name, width) {
  let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", `<svg style="width:${width}px;height:auto;display:block" `);
}

/* The garment. Body outline, collar rib, sleeve hems and a few fold shadows -
   enough to read as cloth without pretending to be a photograph. */
function tee(g, id, neckDepth) {
  /* Neckline: shallower on the back view, as a real crew neck is. */
  const NECK = `M 250 58 C 258 ${58 + neckDepth} 382 ${58 + neckDepth} 390 58`;

  const BODY = `M 250 58
    C 220 62 190 68 170 74
    C 130 96 78 126 46 152
    C 50 176 54 198 60 216
    C 92 232 124 246 152 256
    C 146 232 132 210 122 196
    C 126 330 128 470 130 600
    C 258 612 382 612 510 600
    C 512 470 514 330 518 196
    C 508 210 494 232 488 256
    C 516 246 548 232 580 216
    C 586 198 590 176 594 152
    C 562 126 510 96 470 74
    C 450 68 420 62 390 58
    C 382 ${58 + neckDepth} 258 ${58 + neckDepth} 250 58 Z`;

  return `<svg class="tee" viewBox="0 0 ${VB_W} ${VB_H}">
  <defs>
    <linearGradient id="cloth${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${g.edge}"/>
      <stop offset=".16"  stop-color="${g.base}"/>
      <stop offset=".44"  stop-color="${g.lift}"/>
      <stop offset=".56"  stop-color="${g.lift}"/>
      <stop offset=".84"  stop-color="${g.base}"/>
      <stop offset="1"    stop-color="${g.edge}"/>
    </linearGradient>
    <linearGradient id="drop${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="${g.edge}" stop-opacity=".5"/>
      <stop offset=".18" stop-color="${g.edge}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="clip${id}"><path d="${BODY}"/></clipPath>
  </defs>

  <path d="${BODY}" fill="url(#cloth${id})"/>

  <g clip-path="url(#clip${id})" fill="none" stroke="${g.edge}" stroke-linecap="round">
    <!-- shoulder drop under the collar -->
    <path d="${BODY}" fill="url(#drop${id})" stroke="none"/>
    <!-- armhole seams -->
    <path d="M 122 196 C 136 160 152 118 170 74" stroke-opacity=".26" stroke-width="5"/>
    <path d="M 518 196 C 504 160 488 118 470 74" stroke-opacity=".26" stroke-width="5"/>
    <!-- folds -->
    <path d="M 196 280 C 208 380 204 480 194 588" stroke-opacity=".12" stroke-width="12"/>
    <path d="M 444 280 C 432 380 436 480 446 588" stroke-opacity=".12" stroke-width="12"/>
    <path d="M 320 400 C 326 470 324 540 320 596" stroke-opacity=".06" stroke-width="16"/>
    <!-- hem -->
    <path d="M 130 586 C 258 598 382 598 510 586" stroke-opacity=".2" stroke-width="7"/>
  </g>

  <!-- sleeve cuffs -->
  <path d="M 60 216 C 92 232 124 246 152 256" fill="none"
        stroke="${g.edge}" stroke-opacity=".26" stroke-width="8"/>
  <path d="M 580 216 C 548 232 516 246 488 256" fill="none"
        stroke="${g.edge}" stroke-opacity=".26" stroke-width="8"/>

  <!-- collar rib. Butt caps: round ones bulge past the shoulder as knobs. -->
  <path d="${NECK}" fill="none" stroke="${g.rib}" stroke-width="17" stroke-linecap="butt"/>
  <path d="${NECK}" fill="none" stroke="${g.edge}" stroke-opacity=".3" stroke-width="3"/>
</svg>`;
}

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden}
  body{
    font-family:'Rubik',system-ui,sans-serif;
    position:relative;
    display:flex; flex-direction:column;
    padding:64px 80px 0;
  }
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(var(--dot) 1.5px, transparent 1.5px);
    background-size:34px 34px;
  }
  .head{position:relative; z-index:2; display:flex; align-items:baseline; justify-content:space-between}
  .title{font-size:30px; font-weight:700; letter-spacing:-.02em}
  .kicker{
    font-size:17px; font-weight:500; letter-spacing:.26em; text-transform:uppercase;
    color:var(--muted);
  }

  .row{
    position:relative; z-index:2; flex:1;
    display:flex; align-items:center; justify-content:center; gap:110px;
  }
  .view{display:flex; flex-direction:column; align-items:center}
  .frame{position:relative; width:${TEE_W}px}
  .tee{width:${TEE_W}px; height:auto; display:block}

  /* Print placements. Percentages are of the tee frame, so they track the
     garment if TEE_W changes; widths are real millimetres via mm(). */
  .print{position:absolute; z-index:2}
  /* Left chest sits on the VIEWER'S right - a front view shows the wearer
     mirrored. Top edges are ~85mm below the shoulder, the usual placement. */
  .chest{top:25%; left:63%; transform:translateX(-50%)}
  .back{top:23%; left:50%; transform:translateX(-50%); text-align:center}
  .back .line{
    font-size:${mm(7)}px; font-weight:500; letter-spacing:.3em; text-transform:uppercase;
    color:var(--sub); margin-top:${mm(9)}px;
  }

  .cap{
    margin-top:34px; text-align:center;
    font-size:16px; font-weight:500; letter-spacing:.2em; text-transform:uppercase;
    color:var(--muted);
  }
  .cap b{color:var(--fg); font-weight:500}

  .bar{position:absolute; left:0; right:0; bottom:0; height:10px; background:${ACCENT}}
`;

const SHEETS = Object.entries(GARMENTS).map(([name, g]) => {
  const ground = name === "ink" ? PAPER : INK;
  const fg = name === "ink" ? INK : PAPER;
  const muted = name === "ink" ? "rgba(14,21,38,.5)" : "rgba(242,245,251,.5)";
  const dot = name === "ink" ? "rgba(14,21,38,.09)" : "rgba(242,245,251,.10)";

  return {
    file: `mockup-carwash-tee-${name}`,
    vars: `--fg:${fg};--muted:${muted};--dot:${dot};--sub:${g.sub};background:${ground};color:${fg}`,
    title: `Carwash by Jaranow — crew tee`,
    kicker: `${name} cloth · ${g.mark} mark`,
    front: tee(g, `F${name}`, 46),
    back: tee(g, `B${name}`, 22),
    chestMark: mark(`jaranow-carwash-by-jaranow-${g.mark}`, mm(CHEST_PRINT_MM)),
    backMark: mark(`jaranow-carwash-by-jaranow-${g.mark}`, mm(BACK_PRINT_MM)),
  };
});

for (const s of SHEETS) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=block" rel="stylesheet">
<style>${CSS}</style></head><body style="${s.vars}">
<div class="dots"></div>
<div class="head">
  <span class="title">${s.title}</span>
  <span class="kicker">${s.kicker}</span>
</div>
<div class="row">
  <div class="view">
    <div class="frame">
      ${s.front}
      <div class="print chest">${s.chestMark}</div>
    </div>
    <div class="cap">Front · left chest <b>${CHEST_PRINT_MM}mm</b></div>
  </div>
  <div class="view">
    <div class="frame">
      ${s.back}
      <div class="print back">
        ${s.backMark}
        <div class="line">6th Avenue · Gwarinpa</div>
      </div>
    </div>
    <div class="cap">Back · across shoulders <b>${BACK_PRINT_MM}mm</b></div>
  </div>
</div>
<div class="bar"></div>
</body></html>`;
  fs.writeFileSync(path.join(OUT, "html", `${s.file}.html`), html);
  console.log(`template  ${s.file}.html`);
}
console.log(`\n${SHEETS.length} sheets written to ${path.join(OUT, "html")}`);
console.log(`tee drawn at size L (${CHEST_MM}mm chest) · ${pxPerMm.toFixed(2)} px/mm`);
