/* Jaranow — "No parking" notice: a3 / a2 plates and a 900x300 gate strip, plus
   an A3 comparison sheet. 300dpi + 3mm bleed (plates, not large format).
   No red, no roundel, nothing but lockup + headline + bar - all deliberate, see
   CLAUDE.md "No-parking notices". Not a statutory sign; enforceable signage is
   a different, regulated job.

   Usage: node gen-noparking.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "noparking");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

const DPI = 300;
const BLEED = 3;
const px = (n) => Math.round((n * DPI) / 25.4);

// §3 sub-brand frame; used to balance space under the block against the lockup above.
const LOCKUP_RATIO = 207 / 625.7;

const HEADLINE = { family: "Archivo Black", weight: 400, capRatio: 0.72 };
const BODY = { family: "Rubik", capRatio: 0.72 };

// ~120x cap height is a comfortable read; glance-legible is roughly double.
const capOf = (fontMm, face) => fontMm * face.capRatio;
const readAt = (fontMm, face) => (capOf(fontMm, face) * 120) / 1000;

// Headline lines are explicit so every plate breaks the same way.
const COPY = {
  headline: ["NO", "PARKING"],
  headlineOneLine: ["NO PARKING"],
  /* Parked copy - removed deliberately; re-adding is a decision, not a fix:

       reason:    ["We move cars in and out all day.",
                   "Please keep this space clear."]
       footLabel: "Blocked in, or need a car moved?"
       tel:       "0903 862 2012"

     Anything restored must be re-solved against the height table: the strip's
     110mm headline depends on nothing sitting under the block. */
};

/* Headline sizes solved from block inner width against a MEASURED metric: Archivo
   Black ~0.706x font size per capital here ("PARKING" 4.94x, "NO PARKING" 7.06x).
   Each leaves ~10% slack either side - don't spend it. */
const FORMATS = [
  {
    name: "a3",
    label: "A3 plate — wall beside the bay",
    w: 297,
    h: 420,
    safe: 18,
    bar: 10,
    lockup: 150,
    blockPad: 34,
    style: "stack",
    // Width-bound: 275mm inner width caps "PARKING" at ~50mm; spare height goes to padding.
    type: { headline: { mm: 50, face: HEADLINE, at: 4 } },
  },
  {
    name: "a2",
    label: "A2 plate — frontage",
    w: 420,
    h: 594,
    safe: 25,
    bar: 14,
    lockup: 240,
    blockPad: 60,
    style: "stack",
    // Same proportions as A3 (block ~42% of sheet) so the plates read as one notice.
    type: { headline: { mm: 71, face: HEADLINE, at: 6 } },
  },
  {
    name: "gate",
    label: "Gate strip — gate, rail or bay head",
    w: 900,
    h: 300,
    safe: 24,
    bar: 12,
    lockup: 120,
    blockPad: 24,
    style: "strip",
    // Height-bound: 110mm fits 240mm usable height only with nothing under the block.
    type: { headline: { mm: 110, face: HEADLINE, at: 9 } },
  },
];

// Lockup per §8.8. Paper where the wall behind is already dark.
const GROUNDS = {
  ink: {
    bg: INK, fg: PAPER, block: ACCENT, blockFg: PAPER,
    dot: "rgba(242,245,251,.10)",
    lockup: "jaranow-carwash-by-jaranow-white",
    wm: "white", wmOpacity: 0.05,
  },
  paper: {
    bg: PAPER, fg: INK, block: ACCENT, blockFg: PAPER,
    dot: "rgba(14,21,38,.10)",
    lockup: "jaranow-carwash-by-jaranow-duo",
    wm: "blue", wmOpacity: 0.08,
  },
};

// --u = 1mm in px (print and 1:5 sheet share one stylesheet); --bleed is 0 on the sheet.
const U = (n) => `calc(${n} * var(--u))`;
const UB = (n) => `calc((${n} + var(--bleed, 0)) * var(--u))`;

function inlineSvg(name, cls, style) {
  let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", `<svg class="${cls}" style="${style}" `);
}

const CSS = (f, g) => {
  const s = `.n-${f.name}`;
  const T = f.type;
  const strip = f.style === "strip";
  /* Centre the block on the plate: space below = lockup + its gap, or it rides
     high. The strip has no room (block takes 158 of 240mm), so it stays symmetric. */
  const gapAbove = strip ? 14 : 26;
  const gapBelow = strip ? 14 : gapAbove + f.lockup * LOCKUP_RATIO;
  return `
  ${s}{
    position:relative; overflow:hidden;
    width:calc((${f.w} + 2 * var(--bleed, 0)) * var(--u));
    height:calc((${f.h} + 2 * var(--bleed, 0)) * var(--u));
    background:${g.bg}; color:${g.fg};
    font-family:'Rubik',system-ui,sans-serif;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    /* No horizontal padding on the panel: the accent block is full bleed, so
       the safe margin is applied to each of the other children instead. */
    padding:${UB(f.safe)} 0 ${UB(f.safe + f.bar)};
    text-align:center;
  }
  ${s} .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(${g.dot} ${U(0.5)}, transparent ${U(0.5)});
    background-size:${U(9)} ${U(9)};
  }
  ${s} .wm{
    position:absolute; z-index:1; right:${U(-f.w * 0.16)}; top:50%;
    transform:translateY(-50%); height:${U(f.h * 1.1)}; width:auto;
    opacity:${g.wmOpacity};
  }
  ${s} .pad{position:relative; z-index:2; width:100%; padding:0 ${UB(f.safe)}}
  ${s} .lock{width:${U(f.lockup)}; height:auto; display:block; margin:0 auto}
  /* Full-bleed accent block. It is the reason this reads as a notice rather
     than as a poster - do not inset it to the safe margin. */
  ${s} .block{
    position:relative; z-index:2; width:100%; flex:0 0 auto;
    background:${g.block}; color:${g.blockFg};
    padding:${U(f.blockPad)} ${UB(f.safe * 0.6)};
    margin:${U(gapAbove)} 0 ${U(gapBelow)};
  }
  ${s} h1{
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-weight:${HEADLINE.weight}; font-size:${U(T.headline.mm)};
    line-height:${strip ? "1" : ".9"}; letter-spacing:-.005em; white-space:nowrap;
  }
  ${s} .bar{
    position:absolute; left:0; right:0; bottom:0; z-index:3;
    height:${UB(f.bar)}; background:${g.block};
  }`;
};

const panel = (f, g) => `<div class="np n-${f.name}">
  <div class="dots"></div>
  ${inlineSvg(`jaranow-symbol-${g.wm}`, "wm", "")}
  <div class="pad">${inlineSvg(g.lockup, "lock", `width:${U(f.lockup)};height:auto;display:block`)}</div>
  <div class="block">
    <h1>${(f.style === "strip" ? COPY.headlineOneLine : COPY.headline).join("<br>")}</h1>
  </div>
  <div class="bar"></div>
</div>`;

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

const sizes = [];
const emit = (base, w, h, html) => {
  fs.writeFileSync(path.join(OUT, "html", `${base}.html`), html);
  sizes.push(`${base} ${w} ${h}`);
  console.log(`  ${base}.html`.padEnd(38) + `${w}x${h}`);
};

console.log("print files");
for (const f of FORMATS) {
  for (const [gname, g] of Object.entries(GROUNDS)) {
    emit(
      `noparking-${f.name}-${gname}`,
      px(f.w + BLEED * 2),
      px(f.h + BLEED * 2),
      page(
        `No parking — ${f.label} (${gname})`,
        px(f.w + BLEED * 2),
        px(f.h + BLEED * 2),
        `  body{--u:${(DPI / 25.4).toFixed(4)}px; --bleed:${BLEED}}\n${CSS(f, g)}`,
        panel(f, g)
      )
    );
  }
}

// Comparison sheet, 1:5 on a 300dpi page: --u is a fifth of 300dpi's px-per-mm.
const SHEET_SCALE = 5;
const SHEET_U = DPI / 25.4 / SHEET_SCALE;
{
  const g = GROUNDS.ink;
  const css = `
  body{
    background:${PAPER}; color:${INK};
    font-family:'Rubik',system-ui,sans-serif;
    padding:${px(14)}px ${px(16)}px; display:flex; flex-direction:column;
  }
  header{border-bottom:${px(0.8)}px solid ${INK}; padding-bottom:${px(4)}px}
  header h1{font-size:${px(7)}px; font-weight:700; letter-spacing:-.02em}
  header p{font-size:${px(3.1)}px; opacity:.66; line-height:1.5; margin-top:${px(2)}px; max-width:${px(300)}px}
  /* margin:auto centres the row in the space between header and footer while
     align-items keeps the three sitting on one baseline. */
  .row{display:flex; align-items:flex-end; gap:${px(14)}px; margin:auto 0}
  figure{--u:${SHEET_U.toFixed(4)}px}
  figcaption{margin-top:${px(3)}px; font-size:${px(3)}px; line-height:1.45}
  figcaption b{display:block; font-weight:700}
  figcaption i{font-style:normal; opacity:.6}
  footer{margin-top:auto; padding-top:${px(5)}px; display:flex; gap:${px(10)}px;
    font-size:${px(2.9)}px; line-height:1.5; opacity:.72}
  footer div{flex:1}
  footer b{font-weight:700; opacity:.9}
${FORMATS.map((f) => CSS(f, g)).join("\n")}`;

  const body = `  <header>
    <h1>No parking — format comparison</h1>
    <p>All three at 1 : ${SHEET_SCALE}, trimmed. Same notice, three scales. Choose on where it fixes and
       how far it has to read; the strip reads furthest because "NO PARKING" fits on one line there.
       Private-property notice, not a statutory traffic sign. Generated by brand/gen-noparking.js.</p>
  </header>
  <div class="row">
    ${FORMATS.map(
      (f) => `<figure>
      ${panel(f, g)}
      <figcaption><b>${f.label}</b>${f.w} × ${f.h}mm<i> · headline ${f.type.headline.mm}mm, cap ${capOf(
        f.type.headline.mm,
        HEADLINE
      ).toFixed(0)}mm, reads ~${readAt(f.type.headline.mm, HEADLINE).toFixed(1)}m</i></figcaption>
    </figure>`
    ).join("\n    ")}
  </div>
  <footer>
    <div><b>Print</b><br>300dpi PNG, ${BLEED}mm bleed all round. 3mm ACM/aluminium composite for a plate,
      or laminated paper on an interior wall. Matt — gloss glares on a forecourt.</div>
    <div><b>Colour</b><br>Ink #0E1526 · Jaranow Blue #2563EB · Paper #F2F5FB. No red, and no
      circle-and-bar roundel: one accent at a time (§4.2), and a blue roundel is a counterfeit road sign.</div>
    <div><b>Fixing</b><br>Plates at 1400–1600mm to centre — eye height, above a parked car's roofline.
      The strip goes on the gate rail or over the bay head at whatever height the structure gives.</div>
    <div><b>Scope</b><br>This has no legal force. Anything enforceable — tow-away, clamping, a statutory
      restriction — is a regulated sign with prescribed wording and is not this file's job.</div>
  </footer>`;

  console.log("\ncomparison sheet");
  emit("noparking-formats", px(420 + BLEED * 2), px(297 + BLEED * 2), page(
    "No parking — format comparison",
    px(420 + BLEED * 2),
    px(297 + BLEED * 2),
    css,
    body
  ));
}

fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");

// Legibility table: falling short of `at` is the bug.
console.log(`\n${sizes.length} files @ ${DPI}dpi, ${BLEED}mm bleed\n`);
for (const f of FORMATS) {
  console.log(`${f.label}`);
  console.log(
    `  ${f.w}x${f.h}mm + ${BLEED}mm bleed -> ${px(f.w + BLEED * 2)}x${px(f.h + BLEED * 2)}px  ·  headline on ${
      f.style === "strip" ? "one line" : "two lines"
    }`
  );
  for (const [k, t] of Object.entries(f.type)) {
    const ok = readAt(t.mm, t.face) >= t.at;
    console.log(
      `    ${k.padEnd(8)} ${String(t.mm).padStart(5)}mm  cap ${capOf(t.mm, t.face)
        .toFixed(1)
        .padStart(5)}mm  reads ${readAt(t.mm, t.face).toFixed(1).padStart(5)}m  ` +
        `(designed ${String(t.at).padStart(3)}m)  ${ok ? "ok  " : "SHORT"}  ${t.face.family}`
    );
  }
  console.log();
}
