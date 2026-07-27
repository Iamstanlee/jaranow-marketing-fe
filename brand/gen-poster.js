/* Jaranow — recruitment posters.
   Emits one HTML page per role x format; rasterize-poster.sh screenshots them.
   Type is Rubik (the site face, pulled from Google Fonts at render time); the
   lockups are the real brand SVGs, inlined.

   Same construction as gen-pricelist.js - Ink field, dot grid, drop watermark,
   accent bar along the bottom - so a printed sheet and a Meta ad read as the
   same thing.

   TWO THINGS ARE VARIABLE HERE: the postings (JOBS) and the canvases (FORMATS).
   Every format is authored in one design-mm space 216mm wide and rendered at
   its own px/mm, so a single stylesheet drives print and social. A new size is
   an entry in FORMATS; a new opening is an entry in JOBS. Nothing below those
   two arrays needs touching to change what a poster says or what shape it is.

   Do not state a wage, a shift pattern or a benefit that has not been
   confirmed. `pay` is optional for exactly that reason - a sheet on a wall
   outlives the conversation that set it.

   Usage: node gen-poster.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "poster");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), {recursive: true});

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

/* ---------------------------------------------------------------------------
   THE FORMATS — the canvases.

   Widths are all 216 design-mm so one set of sizes works everywhere; only the
   height and the pixel width change. px/mm falls out as px / 216.

     w, h       canvas in design-mm (216 wide always; h sets the aspect)
     px         rendered width in pixels -> height follows from the aspect
     pxH        optional exact pixel height, overriding that. Print needs it:
                rounding 216mm to a whole 2551px loses half a pixel, and the
                sheet has to come out at exactly trim + bleed for the printer.
     margin     quiet edge, from the page edge inwards
     padTop     optional override for margin at the top
     padBottom  optional extra clearance above the accent bar
     bar        accent bar height. On the print sheet BLEED of it is trimmed
                away, so it has to be taller than the bleed to leave anything
                on the finished page.
     cols       columns for the bullet sections, default 2. The 9:16 canvas is
                narrow and tall, so it sets 1 - two columns there squeeze every
                bullet to three or four words a line.
     type       multiplier on every type size. 1 = the print proportions. The
                social canvases get more because they are read on a phone at a
                fraction of their pixel size, not held at arm's length.
     bleed      print bleed in mm, for the console note. Social has none.

   A note on Meta: text-heavy creative still gets throttled in delivery even
   though the hard 20% rule is gone. These carry a full job spec by design -
   they are the "read the details" creative, not the scroll-stopper. Pair them
   with short primary text rather than adding more copy to the image.
--------------------------------------------------------------------------- */
const FORMATS = [
    {
        // 210x297mm + 3mm bleed all round, at 300dpi. Printer-ready.
        name: "a4",
        label: "A4 print, 210x297mm + 3mm bleed @ 300dpi",
        w: 216,
        h: 303,
        px: 2551,
        pxH: 3579, // 297 + 6mm bleed at 300dpi, exactly
        margin: 15, // 3mm bleed + 12mm quiet
        padBottom: 21,
        bar: 11, // 3 trimmed + 8 visible
        /* 1 was the original print proportion, set when the postings carried two
           sections of four bullets. A short posting looks lost on A4 at that
           size, so this runs larger; drop it back toward 1 if a posting grows. */
        type: 1.18,
        bleed: 3,
    },
    {
        // Meta feed, 4:5. The tallest thing the feed will show, so it is the
        // one to run if you only run one.
        name: "feed",
        label: "Meta feed 4:5, 1080x1350",
        w: 216,
        h: 270,
        px: 1080,
        margin: 13,
        padBottom: 17,
        bar: 7,
        /* 4:5 is 11% shorter than A4 in the shared design space, so this is the
           canvas that runs out of room first. It holds a short posting at this
           scale with air to spare; if you grow a posting back to two sections
           of four bullets, this has to come back down to 1 or the walk-in line
           ends up under the accent bar. Check the render either way. */
        type: 1.12,
    },
    {
        // Stories and Reels, 9:16. Meta's own UI sits over roughly the top 13%
        // and bottom 18%, so the content is pulled well inside those bands -
        // that is why this one has so much air, and it is not a bug.
        name: "story",
        label: "Meta story / Reels 9:16, 1080x1920",
        w: 216,
        h: 384,
        px: 1080,
        margin: 15,
        padTop: 52,
        padBottom: 74,
        bar: 7,
        cols: 1,
        /* 9:16 has height to spare even after the safe zones, so this runs the
           largest type of the three - it is read at a glance while a thumb is
           moving, not studied. */
        type: 1.32,
    },
];

/* ---------------------------------------------------------------------------
   THE JOBS — this is the input to the design.

   job:
     file     output basename; the format name is appended (-a4, -feed, -story)
     lockup   lockup SVG (white, knockout - the page is Ink). Use the sub-brand
              lockup when the role belongs to one service, the master lockup
              (jaranow-lockup-horizontal-white) when it spans both.
     kicker   small line under the lockup                    default "We're hiring"
     role     the headline. Kept short - one line at the print size is about
              three words; a long title wraps and reads as a paragraph.
     blurb    optional single line under the role
     meta     [{label, value}] - the chip row. Location, type, hours. Three of
              confirmed length fit across one row; a fourth wraps.
     pay      optional string, printed verbatim as a chip in accent. Omit it
              unless the figure is confirmed.
     sections [{title, items}] - the bullet lists. Two sit side by side; one
              runs full width; three or more stack in the same two columns.
              About 4 bullets a section is what the 4:5 canvas holds.
     apply    { line?, whatsapp?, email?, walkin? } - the band above the bar.
              Every field is optional; only what is set is printed.
     note     optional single line under the apply band

   The hiring pitch is the same as the customer pitch: care, detail, integrity.
   Do not sell the job on beating someone else's rate.
--------------------------------------------------------------------------- */
const JOBS = [
    {
        file: "poster-carwash-attendant",
        lockup: "jaranow-carwash-by-jaranow-white",
        kicker: "We're hiring",
        role: "Car wash attendant",
        pay: "₦50,000–70,000/month",
        meta: [
            {label: "Location", value: "6th Avenue, Gwarinpa"},
            {label: "Type", value: "Full-time, on site"},
            {label: "Hours", value: "Daily · 8am–7pm"},
        ],
        sections: [
            {
                title: "What we're looking for",
                items: [
                    "An eye for detail",
                    "Reliable and honest",
                    "Experience with washing cars",
                ],
            },
        ],
        apply: {
            line: "To apply, send your name and where you live:",
            whatsapp: "0903 862 2012",
            walkin: "",
        },
    },
    {
        file: "poster-carwash-cashier",
        lockup: "jaranow-carwash-by-jaranow-white",
        kicker: "We're hiring",
        role: "Cashier",
        pay: "₦50,000–70,000/month",
        meta: [
            {label: "Location", value: "6th Avenue, Gwarinpa"},
            {label: "Type", value: "Full-time, on site"},
            {label: "Hours", value: "Daily · 8am–7pm"},
        ],
        sections: [
            {
                title: "What we're looking for",
                items: [
                    "Straight with money",
                    "Confident with numbers and records",
                    "Calm, courteous and good with communication",
                ],
            },
        ],
        apply: {
            line: "To apply, send your name and where you live:",
            whatsapp: "0903 862 2012",
            walkin: "",
        },
    },
];

/* inline a brand SVG at a fixed height */
function mark(name, height) {
    let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

/* the symbol, oversized and faint, bleeding off the right edge */
function watermark() {
    let s = fs.readFileSync(path.join(SVG, "jaranow-symbol-white.svg"), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", '<svg class="wm" ');
}

const pxH = (f) => f.pxH || Math.round((f.px * f.h) / f.w);

/* One stylesheet, parameterised by format. `u` is geometry in design-mm; `t` is
   type, which additionally carries the format's legibility multiplier. */
const CSS = (f) => {
    const u = (n) => Math.round((n * f.px) / f.w);
    const t = (n) => Math.round((n * f.type * f.px) / f.w);
    const H = pxH(f);
    return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${f.px}px;height:${H}px;overflow:hidden}
  body{
    background:${INK}; color:${PAPER};
    font-family:'Rubik',system-ui,sans-serif;
    position:relative;
    display:flex; flex-direction:column;
    /* Bottom clears the accent bar as well as the quiet margin. */
    padding:${u(f.padTop || f.margin)}px ${u(f.margin)}px ${u(f.padBottom || f.margin + 6)}px;
  }

  /* dot field — echoes the site hero, the share cards and the price lists */
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(rgba(242,245,251,.10) ${u(0.5)}px, transparent ${u(0.5)}px);
    background-size:${u(9)}px ${u(9)}px;
  }
  /* Bleeds off the right edge only - cropping it top or bottom as well leaves
     only the tip on the page, which reads as a smudge and not as a drop. */
  .wm{
    position:absolute; right:${-u(52)}px; bottom:${u(26)}px;
    height:${u(150)}px; width:auto; opacity:.05;
  }

  .head{position:relative; z-index:2}
  .kicker{
    display:block; margin-top:${u(8)}px;
    font-size:${t(4.6)}px; font-weight:500; letter-spacing:.34em;
    text-transform:uppercase; color:${ACCENT};
  }

  /* The body centres in whatever is left between the header and the apply band,
     so a short posting and a long one both sit properly, and the same content
     re-centres on a taller or shorter canvas without further tuning. */
  .body{
    position:relative; z-index:2; flex:1;
    display:flex; flex-direction:column; justify-content:center;
    gap:${u(9)}px;
  }
  .role{
    font-size:${t(17)}px; font-weight:700; line-height:1.02;
    letter-spacing:-.025em; max-width:${u(165)}px;
  }
  .blurb{
    font-size:${t(5.2)}px; font-weight:400; line-height:1.45;
    color:rgba(242,245,251,.6); max-width:${u(150)}px;
  }

  /* Chip row: the facts someone standing in front of the sheet checks first.
     Three chips of confirmed length fit across the content width; a fourth, or
     a pay chip alongside three, wraps to a second row - which still reads, but
     check the render. */
  .meta{display:flex; flex-wrap:wrap; gap:${u(3)}px; margin-top:${u(1)}px}
  /* Three chips fit across one row. A fourth (a pay chip beside location, type
     and hours) does not, and greedy wrapping orphans it alone on a second row -
     so four go 2x2 instead, which reads as a block rather than a leftover. */
  .meta.four{
    display:grid; grid-template-columns:repeat(2,max-content);
    justify-items:stretch;
  }
  .meta.four .chip{width:100%}
  .chip{
    border:${Math.max(1, u(0.3))}px solid rgba(242,245,251,.20);
    border-radius:${u(2.5)}px;
    padding:${u(3)}px ${u(4.5)}px;
  }
  .chip .label{
    display:block;
    font-size:${t(3.2)}px; font-weight:500; letter-spacing:.24em;
    text-transform:uppercase; color:rgba(242,245,251,.45);
  }
  /* Values never wrap - a wrapped chip grows taller than its neighbour and the
     2x2 block goes ragged. Keep them short: "6th Avenue, Gwarinpa" is about the
     longest that works on the narrowest (9:16) canvas. */
  .chip .value{
    display:block; margin-top:${u(1.4)}px; white-space:nowrap;
    font-size:${t(4.4)}px; font-weight:500; line-height:1.2;
  }
  .chip.pay{border-color:${ACCENT}}
  .chip.pay .value{color:${ACCENT}}

  /* Two columns. One section spans both; three or more wrap in the same grid. */
  .cols{
    display:grid; grid-template-columns:repeat(${f.cols || 2},1fr);
    gap:${u(8)}px ${u(10)}px;
    margin-top:${u(2)}px;
  }
  .cols.single{grid-template-columns:1fr}
  .section-title{
    font-size:${t(4.2)}px; font-weight:500; letter-spacing:.26em;
    text-transform:uppercase; color:rgba(242,245,251,.5);
    padding-bottom:${u(3.5)}px; margin-bottom:${u(3.5)}px;
    border-bottom:${Math.max(1, u(0.3))}px solid rgba(242,245,251,.16);
  }
  .section li{
    list-style:none; position:relative;
    padding-left:${u(5)}px; margin-bottom:${u(3.4)}px;
    font-size:${t(4.4)}px; font-weight:400; line-height:1.4;
    color:rgba(242,245,251,.82);
  }
  .section li:last-child{margin-bottom:0}
  /* Square accent tick rather than a bullet glyph - the dot is the drop's job. */
  .section li::before{
    content:""; position:absolute; left:0; top:${t(1.8)}px;
    width:${u(1.8)}px; height:${u(1.8)}px; background:${ACCENT};
  }

  .apply{
    position:relative; z-index:2;
    border-top:${Math.max(1, u(0.3))}px solid rgba(242,245,251,.16);
    padding-top:${u(6)}px;
  }
  .apply-line{font-size:${t(4.8)}px; font-weight:400; color:rgba(242,245,251,.62)}
  .contacts{
    display:flex; flex-wrap:wrap; align-items:baseline;
    gap:${u(3)}px ${u(9)}px; margin-top:${u(3.5)}px;
  }
  .contact{font-size:${t(6.6)}px; font-weight:700; letter-spacing:-.01em}
  .contact .via{
    font-size:${t(3.8)}px; font-weight:500; letter-spacing:.22em;
    text-transform:uppercase; color:${ACCENT}; margin-right:${u(2.5)}px;
  }
  .walkin{
    margin-top:${u(3.5)}px;
    font-size:${t(4.4)}px; font-weight:400; color:rgba(242,245,251,.62);
  }
  .note{
    position:relative; z-index:2; margin-top:${u(4)}px;
    font-size:${t(4)}px; line-height:1.45; color:rgba(242,245,251,.5);
  }

  .bar{position:absolute; left:0; right:0; bottom:0; height:${u(f.bar)}px; background:${ACCENT}}
`;
};

const chip = (m) => `<div class="chip">
    <span class="label">${m.label}</span>
    <span class="value">${m.value}</span>
  </div>`;

const section = (s) => `<div class="section">
  <div class="section-title">${s.title}</div>
  <ul>${s.items.map((i) => `<li>${i}</li>`).join("")}</ul>
</div>`;

const contact = (via, value) =>
    `<div class="contact"><span class="via">${via}</span>${value}</div>`;

const applyBand = (a) => `<div class="apply">
  ${a.line ? `<div class="apply-line">${a.line}</div>` : ""}
  <div class="contacts">
    ${a.whatsapp ? contact("WhatsApp", a.whatsapp) : ""}
    ${a.email ? contact("Email", a.email) : ""}
  </div>
  ${a.walkin ? `<div class="walkin">${a.walkin}</div>` : ""}
</div>`;

const jobBody = (j, f) => {
    const u = (n) => Math.round((n * f.px) / f.w);
    return `<div class="dots"></div>
${watermark()}
<div class="head">
  ${mark(j.lockup, u(26))}
  <span class="kicker">${j.kicker || "We're hiring"}</span>
</div>
<div class="body">
  <h1 class="role">${j.role}</h1>
  ${j.blurb ? `<p class="blurb">${j.blurb}</p>` : ""}
  ${
      j.meta || j.pay
          ? `<div class="meta${(j.meta || []).length + (j.pay ? 1 : 0) === 4 ? " four" : ""}">
    ${(j.meta || []).map(chip).join("\n    ")}
    ${j.pay ? `<div class="chip pay"><span class="label">Pay</span><span class="value">${j.pay}</span></div>` : ""}
  </div>`
          : ""
  }
  <div class="cols${j.sections.length === 1 || (f.cols || 2) === 1 ? " single" : ""}">
  ${j.sections.map(section).join("\n  ")}
  </div>
</div>
${applyBand(j.apply || {})}
${j.note ? `<p class="note">${j.note}</p>` : ""}`;
};

const page = (f, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=block" rel="stylesheet">
<style>${CSS(f)}</style></head><body>
${body}
<div class="bar"></div>
</body></html>`;

const sizes = [];

for (const j of JOBS) {
    for (const f of FORMATS) {
        const base = `${j.file}-${f.name}`;
        fs.writeFileSync(path.join(OUT, "html", `${base}.html`), page(f, jobBody(j, f)));
        sizes.push(`${base} ${f.px} ${pxH(f)}`);
        console.log(`template  ${base}.html`);
    }
}

/* Formats differ in pixel size, so the rasterizer reads dimensions from here
   rather than hardcoding one window size. */
fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");

console.log(`\n${JOBS.length} postings x ${FORMATS.length} formats = ${sizes.length} posters -> ${path.join(OUT, "html")}`);
for (const f of FORMATS) {
    const H = pxH(f);
    console.log(`  ${f.name.padEnd(6)} ${String(f.px).padStart(4)}x${String(H).padStart(4)}px  ${f.label}`);
}
