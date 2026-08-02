/* Jaranow — A5 hand-out flyer.
   Emits one HTML page per flyer; rasterize-flyer.sh turns them into 300dpi
   PNGs. Type is Rubik (the site face, pulled from Google Fonts at render time);
   the lockups are the real brand SVGs, inlined.

   A5 portrait, 148x210mm trim + 3mm bleed, at 300dpi:
     trim  1748 x 2480 px
     bleed 1819 x 2551 px  <- the emitted page size
   Same construction as gen-pricelist.js and gen-poster.js - Ink field, dot
   grid, drop bleeding off the right edge, accent bar - so what someone is
   handed reads as the same thing as the sheet on the wall behind the desk.

   THIS SELLS JARANOW, NOT ONE ERRAND. It is the general carwash hand-out, so
   the same sheet works for every offline use: handed over at the desk, given
   out at the market, dropped through a door, left on a counter. That generality
   is the design constraint - nothing on it may be true only of one place, one
   campaign or one day, because a flyer outlives all three. It carries no
   market-specific pitch for that reason.

   The sub-brand lockup leads and the wordmark leads within it (BRAND-STANDARD
   §3), so this sells Jaranow while being unambiguously about the carwash.

   NO PRICES. Not a positioning nicety here but a practical one: this sheet is
   printed in quantity and handed out for months, and a figure on it goes stale
   in a way the wall list does not. /pricing and gen-pricelist.js are where
   figures live. The pitch is care, detail, convenience and integrity - see the
   brand positioning note in CLAUDE.md, and do not reintroduce "cheap", "best
   value", "no hidden charges" or a competitor comparison.

   WHAT TO EDIT: the FLYERS array. Copy is data, not markup.

   The page is fixed-height with overflow:hidden, so copy that outgrows it does
   NOT make the page taller - it silently slides the closing note under the
   accent bar. A5 has about a third of A4's area and this sheet is already
   close to full, so a third service block or a third line of `sub` will do it.
   Always eyeball the PNG after changing the copy.

   Usage: node gen-flyer.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "flyer");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), {recursive: true});

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

const DPI = 300;
const mm = (n) => Math.round((n * DPI) / 25.4);

const BLEED = 3;
const PAGE_W = mm(148 + BLEED * 2); // 1819
const PAGE_H = mm(210 + BLEED * 2); // 2551
/* A5 is 70% of A4 linearly, so the A4 sheets' 12mm quiet margin would eat the
   page. 10mm from the trim keeps the same optical breathing room. */
const SAFE = mm(BLEED + 10);

/* ---------------------------------------------------------------------------
   THE FLYERS — this is the input to the design.

   flyer:
     file      output basename
     lockup    lockup SVG (white, knockout - the page is Ink)
     kicker    small accent line under the lockup
     headline  the promise. ~40 characters - it is read from a hand, in a few
               seconds, by someone who did not ask for it.
     sub       one or two sentences under it
     services  [{name, note}] - the washes, WITHOUT figures. These are the same
               four services as gen-pricelist.js and the components listed in
               CLAUDE.md, and must stay in step with them. Four fit; a fifth
               does not, and the page will not tell you so (see the overflow
               note above).
     offer     optional accent line - the one thing worth asking about at the desk
     contact   { whatsapp, web?, social? }
     note      closing line above the bar

   Every fact is from CLAUDE.md. Do not state a price, a turnaround or a
   capability that is not confirmed there. In particular: the carwash is
   DRIVE-IN and only laundry is collected and delivered; and there is no app,
   no voice ordering, no same-day service and no waitlist to refer to.
--------------------------------------------------------------------------- */
const FLYERS = [
    {
        file: "flyer-carwash",
        lockup: "jaranow-carwash-by-jaranow-white",
        kicker: "6th Avenue, Gwarinpa",
        headline: "Your car, properly looked after.",
        sub: "Every car gets the same attention — paint, wheels, glass and the inside — from people who take it seriously.",
        services: [
            {name: "Exterior wash", note: "Body, wheels and glass"},
            {name: "Full wash", note: "Exterior wash · interior cleaned"},
            {name: "Deep/Vacuum wash", note: "Exterior wash · interior machine-vacuumed"},
        ],
        offer: "Ask for a loyalty card — five washes, and the sixth is on us.",
        contact: {whatsapp: "0903 862 2012", web: "jaranow.com", social: "@jara_now"},
        note: "Drive in any day, 8am–7pm. Pay after your wash.",
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

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden}
  body{
    background:${INK}; color:${PAPER};
    font-family:'Rubik',system-ui,sans-serif;
    position:relative;
    display:flex; flex-direction:column;
    /* Bottom clears the accent bar as well as the bleed. */
    padding:${SAFE}px ${SAFE}px ${mm(BLEED + 7 + 8)}px;
  }

  /* dot field — echoes the site hero, the share cards and the price lists */
  .dots{
    position:absolute; inset:0;
    /* Finer and fainter than the A4 sheets': at A5 the same dot sits over the
       headline as visible noise rather than as a field behind it. */
    background-image:radial-gradient(rgba(242,245,251,.09) ${mm(0.38)}px, transparent ${mm(0.38)}px);
    background-size:${mm(6)}px ${mm(6)}px;
  }
  /* Bleeds off the right edge only. Cropping it top or bottom as well leaves
     the tip on the page, which reads as a triangular smudge, not a drop. */
  .wm{
    position:absolute; right:${-mm(38)}px; bottom:${mm(14)}px;
    height:${mm(104)}px; width:auto; opacity:.05;
  }

  .head{position:relative; z-index:2}
  .kicker{
    display:block; margin-top:${mm(6)}px;
    font-size:${mm(3.6)}px; font-weight:500; letter-spacing:.3em;
    text-transform:uppercase; color:${ACCENT};
  }

  /* Everything between the lockup and the contact block centres in the space
     left, so the page sits properly whether the copy runs short or long. */
  .body{
    position:relative; z-index:2; flex:1;
    display:flex; flex-direction:column; justify-content:center;
    gap:${mm(5)}px;
  }
  .headline{
    font-size:${mm(11)}px; font-weight:700; line-height:1.06;
    letter-spacing:-.025em; max-width:${mm(118)}px;
    /* Evens the lines. Without it the last word hangs on its own. */
    text-wrap:balance;
  }
  .sub{
    font-size:${mm(4.3)}px; font-weight:400; line-height:1.5;
    color:rgba(242,245,251,.62); max-width:${mm(122)}px;
  }

  /* The washes. A plain list, deliberately reading as facts rather than as a
     menu with the figures taken out - no price column means no ragged right
     edge to explain. */
  .services{margin-top:${mm(3)}px}
  .service{
    position:relative; padding:${mm(2.6)}px 0 ${mm(2.6)}px ${mm(6)}px;
    border-bottom:${mm(0.3)}px solid rgba(242,245,251,.12);
  }
  .service:first-child{border-top:${mm(0.3)}px solid rgba(242,245,251,.12)}
  /* Square accent tick rather than a bullet glyph - the dot is the drop's job. */
  .service::before{
    content:""; position:absolute; left:0; top:${mm(5)}px;
    width:${mm(2)}px; height:${mm(2)}px; background:${ACCENT};
  }
  .service .name{font-size:${mm(5.4)}px; font-weight:500; line-height:1.15}
  .service .svc-note{
    font-size:${mm(3.5)}px; font-weight:400; line-height:1.4;
    color:rgba(242,245,251,.55); margin-top:${mm(1.2)}px;
  }

  /* The loyalty line. Accent, so it reads as the one thing on the page worth
     asking about at the desk - and the reason the sheet gets kept. */
  .offer{
    position:relative; z-index:2; margin-top:${mm(4)}px;
    font-size:${mm(4.1)}px; font-weight:500; line-height:1.4;
    color:${ACCENT};
  }

  /* The block people photograph or keep. */
  .contact{
    position:relative; z-index:2; margin-top:${mm(4)}px;
    border-top:${mm(0.3)}px solid rgba(242,245,251,.16);
    padding-top:${mm(4)}px;
  }
  .wa{display:flex; align-items:baseline; gap:${mm(3)}px}
  .wa .via{
    font-size:${mm(3.4)}px; font-weight:500; letter-spacing:.22em;
    text-transform:uppercase; color:${ACCENT};
  }
  .wa .num{
    font-size:${mm(7.2)}px; font-weight:700; letter-spacing:-.01em;
    font-variant-numeric:tabular-nums;
  }
  .rest{
    margin-top:${mm(2.4)}px;
    font-size:${mm(4.1)}px; font-weight:500; color:rgba(242,245,251,.72);
  }
  .note{
    position:relative; z-index:2; margin-top:${mm(3)}px;
    font-size:${mm(3.5)}px; line-height:1.45; color:rgba(242,245,251,.5);
  }

  /* The bar must survive the cut: BLEED of its height is trimmed away, so it
     has to be taller than the bleed to leave anything on the finished page.
     10mm here prints as a 7mm band along the bottom edge. */
  .bar{position:absolute; left:0; right:0; bottom:0; height:${mm(BLEED + 7)}px; background:${ACCENT}}
`;

const service = (s) => `<div class="service">
    <div class="name">${s.name}</div>
    ${s.note ? `<div class="svc-note">${s.note}</div>` : ""}
  </div>`;

const flyerBody = (f) => `<div class="dots"></div>
${watermark()}
<div class="head">
  ${mark(f.lockup, mm(15))}
  <span class="kicker">${f.kicker}</span>
</div>
<div class="body">
  <h1 class="headline">${f.headline}</h1>
  <p class="sub">${f.sub}</p>
  <div class="services">
${f.services.map(service).join("\n")}
  </div>
</div>
${f.offer ? `<p class="offer">${f.offer}</p>` : ""}
<div class="contact">
  <div class="wa">
    <span class="via">WhatsApp</span>
    <span class="num">${f.contact.whatsapp}</span>
  </div>
  <div class="rest">${[f.contact.web, f.contact.social].filter(Boolean).join(" · ")}</div>
</div>
${f.note ? `<p class="note">${f.note}</p>` : ""}`;

const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=block" rel="stylesheet">
<style>${CSS}</style></head><body>
${body}
<div class="bar"></div>
</body></html>`;

for (const f of FLYERS) {
    fs.writeFileSync(path.join(OUT, "html", `${f.file}.html`), page(flyerBody(f)));
    console.log(`template  ${f.file}.html  ${f.services.length} service lines`);
}

console.log(`\n${FLYERS.length} flyers written to ${path.join(OUT, "html")}`);
console.log(`page ${PAGE_W}x${PAGE_H}px = A5 148x210mm trim + ${BLEED}mm bleed @ ${DPI}dpi`);
