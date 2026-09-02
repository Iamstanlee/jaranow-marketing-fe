/* Jaranow — "No parking" notice.

   The one piece in the system that has to be OBEYED rather than admired, and
   that changes how it is built.

   ---- what this is not ----
   It is a PRIVATE-PROPERTY NOTICE, not a statutory traffic sign. It carries no
   legal force on its own, and it deliberately does not imitate one: no red, no
   circle-and-bar roundel, no reflective spec. Two reasons, and both matter.

     - BRAND-STANDARD §4.2, one accent at a time. Red is a second accent hue and
       there is no version of this that gets an exemption.
     - A blue roundel is a counterfeit road sign. It reads as one at a glance,
       carries none of the authority, and looks worse the closer you get.

   If a site actually needs enforceable signage - a tow-away notice, a statutory
   restriction, anything that has to stand up when a car is clamped - that is a
   regulated artefact with prescribed colours and wording. It is a different job
   and it does not belong in this file.

   ---- the design ----
   Prohibition first, brand second, and NOTHING ELSE. The lockup, the headline,
   the accent bar. An earlier version carried a reason line and a number to call
   if somebody was blocked in; that was removed deliberately, and the copy is
   parked in COPY below rather than deleted.

   What the sheet gives up in warmth it gets back in obedience: a notice read
   from a moving car has one job, and every additional line is something the
   driver is not reading. It is also the only piece in the system with no
   sentence on it at all, which is itself a signal - anything on this wall with
   a paragraph is marketing, and this is not.

   The headline is knocked out of a FULL-BLEED ACCENT BLOCK rather than set on
   the field like every other piece. That is deliberate: a colour block spanning
   the full width has the visual grammar of a sign, and this notice has to be
   distinguishable at a glance from the marketing on the same wall. Somebody who
   reads it as an advert ignores it.

   ---- three formats, one design ----
   Same composition at three scales. The differences are which line the headline
   breaks on and how far it reads:

     a3    297x420   plate on a wall beside the bay        ~4.5m
     a2    420x594   plate on the frontage                 ~6.4m
     gate  900x300   strip for a gate, rail or bay head    ~8.3m

   The strip reads furthest despite being the shortest sheet, for the same
   reason the landscape roadside panel beats the portrait one: "NO PARKING" fits
   on ONE line there, and one line is not width-bound by the longer word. Prefer
   it wherever there is somewhere to fix it.

   TYPE IS SIZED FROM VIEWING DISTANCE, NOT BY EYE - the script prints what each
   element resolves at. 300dpi with 3mm bleed, same as the other print pieces;
   these are plates, not large format.

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

/* The sub-brand lockup's frame is 625.7 x 207 (BRAND-STANDARD §3), so its
   height is a fixed fraction of whatever width it is set at. Needed below to
   balance the plate: the lockup sits ABOVE the block and its mass has to be
   answered by equal space below, or the block rides high on the sheet. */
const LOCKUP_RATIO = 207 / 625.7;

const HEADLINE = { family: "Archivo Black", weight: 400, capRatio: 0.72 };
const BODY = { family: "Rubik", capRatio: 0.72 };

/* ~120x cap height is a comfortable read; glance-legible is roughly double. */
const capOf = (fontMm, face) => fontMm * face.capRatio;
const readAt = (fontMm, face) => (capOf(fontMm, face) * 120) / 1000;

/* ---- the copy ----
   One message, printed at three sizes. `headline` is an array of lines, so the
   break is chosen rather than left to wrapping - Archivo Black measures roughly
   0.67 x its font size per capital, and "PARKING" alone is 4.7x, which is what
   caps the portrait plates.

   The reason is given as lines for the same reason: a notice that wraps
   differently on each plate stops looking like one notice. */
const COPY = {
  headline: ["NO", "PARKING"],
  headlineOneLine: ["NO PARKING"],
  /* The notice is DELIBERATELY the lockup and the headline, nothing else.
     It carried a reason line and a contact block and they were removed on
     purpose - so re-adding them is a decision, not a fix. Kept here because
     they are the copy to bring back if the sheet ever needs to explain itself:

       reason:    ["We move cars in and out all day.",
                   "Please keep this space clear."]
       footLabel: "Blocked in, or need a car moved?"
       tel:       "0903 862 2012"

     Anything restored has to be re-solved against the height table below, not
     just dropped in: the gate strip's headline is 110mm precisely BECAUSE
     nothing sits under the block, and it was 90mm when something did. */
};

/* ---- formats ----
   `stack` is the portrait plate; `strip` is the same composition laid out
   horizontally. Headline sizes are solved from the block's inner width against
   a MEASURED metric: Archivo Black runs ~0.706 x its font size per capital at
   this tracking, so "PARKING" is 4.94x and "NO PARKING" 7.06x. Every figure
   below leaves ~10% of slack either side; do not spend it, because a headline
   that reaches the block edge reads as a mistake even though the block bleeds.

   The block carries less side padding than the field does (0.6 x safe): type
   knocked out of a full-bleed colour block can sit closer to the trim than type
   on the field, and that margin is what pays for the headline size. */
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
    /* Width-bound, not height-bound: the block's 275mm inner width caps a
       stacked "PARKING" at ~50mm however much vertical room is going spare.
       Removing the reason line bought this format almost nothing in size - what
       it bought was air, which is why the block padding runs generous. */
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
    /* Width-bound like the A3, and set to the same proportions: block ~42% of
       the sheet, content ~71% of the usable height. The two plates have to look
       like one another at a glance or they read as two different notices. */
    type: { headline: { mm: 71, face: HEADLINE, at: 6 } },
  },
  {
    /* The one to fix wherever there is a gate or a rail. "NO PARKING" on one
       line stops the headline being width-bound by "PARKING", which is what
       buys the extra ~2m over the A2 plate on a sheet less than half its area.
       Same trade as landscape vs portrait on the roadside panels. */
    name: "gate",
    label: "Gate strip — gate, rail or bay head",
    w: 900,
    h: 300,
    safe: 24,
    bar: 12,
    lockup: 120,
    blockPad: 24,
    style: "strip",
    /* This is the format that gained from stripping the sheet back. With a
       contact row under the block it was height-bound at 98mm; with nothing
       under it, 110mm fits in the 240mm of usable height AND still leaves 47mm
       either side of the type inside the block. That is ~9.5m against 8.5m, on
       a sheet less than a third of the A2's area. Still the one to fix wherever
       there is somewhere to fix it. */
    type: { headline: { mm: 110, face: HEADLINE, at: 9 } },
  },
];

/* §8.8: dark grounds take the -white lockup, light grounds -duo, and the accent
   colourway never goes on a dark field. Both grounds are high contrast; pick
   Ink where the notice sits among other signs and needs to be the dark one,
   Paper where the wall behind it is already dark. */
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

/* ---- the millimetre unit ----
   Sizes are written as calc(N * var(--u)) so the same markup renders at 300dpi
   as a print file and at 1:5 on the comparison sheet without a second
   stylesheet. --bleed is BLEED on a print file and 0 on the comparison sheet,
   where a plate is shown trimmed. */
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
  /* The block is the sign; it wants to sit on the plate's centre line. The
     stack centres the whole group, so the space UNDER the block has to equal
     the lockup plus its gap or the block rides high - which is exactly how it
     looked before this was worked out. The strip has no room for that: at
     240mm of usable height the block already takes 158, so it keeps a symmetric
     gap and lets the lockup sit snug above. */
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

/* ---- 1. the print files ---------------------------------------------- */
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

/* ---- 2. the comparison sheet ------------------------------------------
   All three trimmed, at one scale, on A3 landscape. The point is to choose a
   format: the three PNGs on their own do not show how much bigger the strip's
   headline actually is, which is the whole reason to prefer it. */
/* --u is one millimetre in PIXELS, and this sheet is a 300dpi page - so 1:5 is
   a fifth of 300dpi's px-per-mm, not a fifth of a pixel. */
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

/* ---- the legibility table ----
   `at` is what an element is designed for; `reads at` is what it resolves to.
   Under-shooting the design distance is the bug. */
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
