/* Jaranow — printed price list.
   Emits one HTML page per list; rasterize-pricelist.sh turns them into 300dpi
   PNGs. Type is Rubik (the site face, pulled from Google Fonts at render time);
   the lockups are the real brand SVGs, inlined.

   A4 portrait, 210x297mm trim + 3mm bleed, at 300dpi:
     trim  2480 x 3508 px
     bleed 2551 x 3579 px  <- the emitted page size
   Content sits 12mm inside the trim. Intended to be printed and laminated for
   the forecourt wall or the counter, so type is sized for a read of about 1.5m,
   not for a poster - see gen-sign.js if you need something road-legible.

   WHAT TO EDIT: the LISTS array. Services and prices are data, not markup - a
   new service is a row in `items`, a new list is an entry in LISTS. Nothing
   below LISTS should need touching to change what a list says.

   Prices are stated as plain fact here. Do not add persuasion around them
   ("best value", "no hidden fees", comparisons) - see the brand positioning
   note in CLAUDE.md.

   Usage: node gen-pricelist.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "pricelist");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), {recursive: true});

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

const DPI = 300;
const mm = (n) => Math.round((n * DPI) / 25.4);

const BLEED = 3;
const PAGE_W = mm(210 + BLEED * 2); // 2551
const PAGE_H = mm(297 + BLEED * 2); // 3579
const SAFE = mm(BLEED + 12); // bleed + 12mm quiet margin from trim

/* ---------------------------------------------------------------------------
   THE LISTS — this is the input to the design.

   Each list emits the price page (`<file>.html`). If it also carries a `cover`,
   it emits a matching front (`<file>-front.html`) - a cover sheet to sit ahead
   of the prices, same construction as the pocket cards' front/back. A list with
   no `cover` is prices-only, as before.

   list:
     file     output basename (price page; the front adds `-front`)
     lockup   sub-brand lockup SVG (white, knockout - the page is Ink)
     kicker   small line under the lockup
     sections [{ title?, items }]  - title is optional; one untitled section
                                     reads as a plain list
     footer   { left, right }      - the band above the accent bar
     note     optional single line under the footer band
     cover    optional { headline?, sub } - if present, a front sheet is emitted.
              headline is itself optional (the sub carries the cover without it);
              when set it sells on care/detail, NEVER on price (positioning rule).

   item:
     name     the service
     note     optional second line, e.g. what is included
     price    a number in naira (formatted and grouped) OR a string, which is
              printed verbatim for anything that is not a flat figure
     unit     optional suffix set smaller beside the price, e.g. "/month"

   Every figure below is from CLAUDE.md. Do not invent a price, a turnaround or
   a capability that is not confirmed there.
--------------------------------------------------------------------------- */
const LISTS = [
    {
        file: "pricelist-carwash",
        lockup: "jaranow-carwash-by-jaranow-white",
        kicker: "Price list",
        sections: [
            {
                items: [
                    {
                        name: "Exterior wash",
                        note: "Body, wheels and glass",
                        price: 2000,
                    },
                    {
                        name: "Full wash",
                        note: "Exterior wash · interior cleaned",
                        price: 3000,
                    },
                    {
                        name: "Vacuum wash",
                        note: "Exterior wash · interior vacuumed",
                        price: 4000,
                    },
                    {
                        name: "Buffing",
                        note: "Full wash · paintwork machine-polished",
                        price: 20000,
                    },
                ],
            },
        ],
        footer: {left: "6th Avenue, Gwarinpa", right: "Open daily · 8am–7pm"},
        note: "We treat every car like it's the only one we're washing today - pay after your wash.",
        cover: {
            sub: "Exterior, full, vacuum and buffing - done properly.",
        },
    },
    {
        file: "pricelist-laundry",
        lockup: "jaranow-laundry-by-jaranow-white",
        kicker: "Price list",
        sections: [
            {
                title: "Monthly plans",
                items: [
                    {
                        name: "Lite",
                        note: "2 washes · up to 12 clothes each",
                        price: 14999,
                        unit: "/month",
                    },
                    {
                        name: "Premium",
                        note: "3 washes · up to 15 clothes each",
                        price: 24999,
                        unit: "/month",
                    },
                ],
            },
            {
                title: "Per item",
                items: [
                    {
                        name: "Regular items",
                        note: "Shirts, trousers, dresses, skirts, tops",
                        price: 700,
                        unit: "/item",
                    },
                    {
                        name: "Special items",
                        note: "Suits, long dresses, towels, duvet sets, curtains",
                        price: 2000,
                        unit: "/item",
                    },
                ],
            },
        ],
        footer: {left: "Pickup and delivery", right: "48-hour turnaround"},
        note: "Pickup windows: Tuesday & Saturday (Lite) · Tuesday, Thursday & Saturday (Premium).",
        cover: {
            sub: "Picked up, cleaned and returned within 48 hours.",
        },
    },
];

/* ₦ lives at U+20A6, which Google Fonts serves in Rubik's latin-ext subset. If
   a render comes back with a box or a mismatched glyph, the subset did not
   load - check the network, do not swap the symbol for "N". */
const naira = (n) =>
    typeof n === "number" ? `₦${n.toLocaleString("en-NG")}` : n;

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

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden}
  body{
    background:${INK}; color:${PAPER};
    font-family:'Rubik',system-ui,sans-serif;
    position:relative;
    display:flex; flex-direction:column;
    /* Bottom clears the accent bar as well as the bleed. */
    padding:${SAFE}px ${SAFE}px ${mm(BLEED + 8 + 10)}px;
  }

  /* dot field — echoes the site hero, the share cards and the pocket cards */
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(rgba(242,245,251,.10) ${mm(0.5)}px, transparent ${mm(0.5)}px);
    background-size:${mm(9)}px ${mm(9)}px;
  }
  /* Bleeds off the right edge only. Crop it top or bottom as well and the drop
     stops reading as a drop - it becomes a triangular smudge, because the tip
     is the only part left on the page. Keep the whole height on the sheet. */
  .wm{
    position:absolute; right:${-mm(52)}px; bottom:${mm(22)}px;
    height:${mm(150)}px; width:auto; opacity:.05;
  }

  .head{position:relative; z-index:2}
  .kicker{
    display:block; margin-top:${mm(9)}px;
    font-size:${mm(4.6)}px; font-weight:500; letter-spacing:.34em;
    text-transform:uppercase; color:${ACCENT};
  }

  /* The list centres in whatever is left between the header and the footer, so
     a two-row card and a two-section one both sit properly on the page instead
     of hugging the top. */
  .list{
    position:relative; z-index:2; flex:1;
    display:flex; flex-direction:column; justify-content:center;
    gap:${mm(16)}px;
  }
  .section-title{
    font-size:${mm(4.4)}px; font-weight:500; letter-spacing:.26em;
    text-transform:uppercase; color:rgba(242,245,251,.5);
    padding-bottom:${mm(4)}px; margin-bottom:${mm(2)}px;
    border-bottom:${mm(0.3)}px solid rgba(242,245,251,.16);
  }
  .row{
    display:flex; align-items:baseline; justify-content:space-between;
    gap:${mm(10)}px;
    padding:${mm(6)}px 0;
    border-bottom:${mm(0.3)}px solid rgba(242,245,251,.10);
  }
  .row:last-child{border-bottom:none}
  .name{font-size:${mm(9)}px; font-weight:500; line-height:1.15}
  /* Sized to hold the longest confirmed note ("Suits, long dresses, towels,
     duvet sets, curtains") on one line against the price column. */
  .item-note{
    font-size:${mm(4.4)}px; font-weight:400; line-height:1.4;
    color:rgba(242,245,251,.56); margin-top:${mm(2)}px;
  }
  .price{
    font-size:${mm(11)}px; font-weight:700; line-height:1;
    letter-spacing:-.02em; font-variant-numeric:tabular-nums;
    white-space:nowrap; text-align:right;
  }
  .unit{font-size:${mm(4.6)}px; font-weight:400; color:rgba(242,245,251,.56)}

  .foot{
    position:relative; z-index:2;
    border-top:${mm(0.3)}px solid rgba(242,245,251,.16);
    padding-top:${mm(6)}px;
    display:flex; align-items:baseline; justify-content:space-between; gap:${mm(10)}px;
  }
  .foot span{font-size:${mm(5)}px; font-weight:500; letter-spacing:.02em}
  .foot .right{color:rgba(242,245,251,.62); font-weight:400; text-align:right}
  .note{
    position:relative; z-index:2; margin-top:${mm(4)}px;
    font-size:${mm(4)}px; line-height:1.45; color:rgba(242,245,251,.5);
  }

  /* The bar must survive the cut: BLEED of its height is trimmed away, so it
     needs to be taller than the bleed to leave anything on the finished page.
     11mm here prints as an 8mm band along the bottom edge. */
  .bar{position:absolute; left:0; right:0; bottom:0; height:${mm(BLEED + 8)}px; background:${ACCENT}}

  /* ---- front / cover sheet ----
     Same Ink field, dots and accent bar as the price page, but the content is
     centred and the drop is bigger and more central - the cover is allowed the
     presence the working price page is not. */
  body.cover{justify-content:center; align-items:flex-start; text-align:left}
  /* Centred behind the copy rather than bleeding off the edge. Still whole -
     the drop must never be cropped to its tip (see the price-page .wm note). */
  body.cover .wm{
    right:auto; bottom:auto; left:${mm(58)}px; top:50%;
    transform:translateY(-52%); height:${mm(260)}px; opacity:.05;
  }
  .cover-mark{position:relative; z-index:2}
  .cover-headline{
    position:relative; z-index:2; margin-top:${mm(22)}px;
    font-size:${mm(15)}px; font-weight:700; line-height:1.06;
    letter-spacing:-.02em; max-width:${mm(150)}px;
  }
  .cover-sub{
    position:relative; z-index:2; margin-top:${mm(10)}px;
    font-size:${mm(5.4)}px; font-weight:400; line-height:1.5;
    color:rgba(242,245,251,.6); max-width:${mm(140)}px;
  }
  /* When there is no headline the sub follows the lockup directly and needs
     the gap the headline would otherwise have carried. */
  .cover-mark + .cover-sub{margin-top:${mm(22)}px}
  /* Sits at the foot, above the accent bar - the fact people photograph. */
  .cover-foot{
    position:absolute; left:${SAFE}px; bottom:${mm(BLEED + 8 + 10)}px; z-index:2;
    font-size:${mm(4.6)}px; font-weight:500; letter-spacing:.02em;
    color:rgba(242,245,251,.72);
  }
`;

const row = (it) => `<div class="row">
    <div>
      <div class="name">${it.name}</div>
      ${it.note ? `<div class="item-note">${it.note}</div>` : ""}
    </div>
    <div class="price">${naira(it.price)}${it.unit ? `<span class="unit">${it.unit}</span>` : ""}</div>
  </div>`;

const section = (s) => `<div class="section">
  ${s.title ? `<div class="section-title">${s.title}</div>` : ""}
  ${s.items.map(row).join("\n  ")}
</div>`;

/* Shared page shell - the font links and the wrapping html are identical for
   the price page and the front, so only the body class and content differ. */
const page = (cls, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=block" rel="stylesheet">
<style>${CSS}</style></head><body class="${cls}">
${body}
<div class="bar"></div>
</body></html>`;

const listBody = (l) => `<div class="dots"></div>
${watermark()}
<div class="head">
  ${mark(l.lockup, mm(26))}
  <span class="kicker">${l.kicker}</span>
</div>
<div class="list">
${l.sections.map(section).join("\n")}
</div>
<div class="foot">
  <span>${l.footer.left}</span>
  <span class="right">${l.footer.right}</span>
</div>
${l.note ? `<p class="note">${l.note}</p>` : ""}`;

const coverBody = (l) => `<div class="dots"></div>
${watermark()}
<div class="cover-mark">${mark(l.lockup, mm(30))}</div>
${l.cover.headline ? `<h1 class="cover-headline">${l.cover.headline}</h1>` : ""}
<p class="cover-sub">${l.cover.sub}</p>
<div class="cover-foot">${l.footer.left}</div>`;

for (const l of LISTS) {
    fs.writeFileSync(path.join(OUT, "html", `${l.file}.html`), page("", listBody(l)));
    const rows = l.sections.reduce((n, s) => n + s.items.length, 0);
    console.log(`template  ${l.file}.html  ${rows} rows`);

    if (l.cover) {
        fs.writeFileSync(path.join(OUT, "html", `${l.file}-front.html`), page("cover", coverBody(l)));
        console.log(`template  ${l.file}-front.html  cover`);
    }
}

console.log(`\n${LISTS.length} lists written to ${path.join(OUT, "html")}`);
console.log(`page ${PAGE_W}x${PAGE_H}px = A4 210x297mm trim + ${BLEED}mm bleed @ ${DPI}dpi`);
