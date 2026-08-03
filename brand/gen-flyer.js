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
   accent bar. A5 has about a third of A4's area, so a fourth point, a headline
   long enough to run to three lines, or a second line of `sub` will do it.
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

/* ---- headline face ----
   The prominent type - headline and phone number - is Archivo Black, the same
   face the roadside panels use for CAR WASH, so a sheet in someone's hand and
   the sign they drove past read as one thing. Everything else stays Rubik.

   Archivo Black ships ONE weight (400): asking for 700 gets a synthetic bold
   that smears the outline. Leave the weight alone.

   Not a wordmark substitution (BRAND-STANDARD §8.1) - the lockup at the top of
   the sheet is still the drawn SVG, and this is body copy set loud. */
const HEADLINE = {family: "Archivo Black", weight: 400};

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
     headline  the promise. ~40 characters, set in Archivo Black - it is read
               from a hand, in a few seconds, by someone who did not ask for it.
     sub       one sentence under it
     points    three short lines about HOW THE WORK IS DONE. Three or four
               words each, no second line, no explanation.
     offer     optional accent line - the one thing worth asking about at the desk
     contact   { whatsapp, web?, social? }
     note      closing line above the bar

   IT SELLS THE QUALITY OF THE WORK, NOT A MENU. This sheet used to carry the
   wash types with their inclusions under each. That is a price list with the
   figures taken out - it made someone in a car park read three rows to work out
   what to choose, and it said nothing about why they should choose us. The
   washes are on the wall list at the forecourt (gen-pricelist.js) and on
   /pricing, which is where a person who has already decided goes looking. Here
   the job is to make them want to come at all: care, attention, integrity. Do
   not re-add the service rows.

   LANGUAGE: plain, spoken, local. Short words, short sentences, the way it
   would be said across the desk at Gwarinpa - "we wash your car well", not
   "meticulous attention to detail". Someone reads this in a few seconds with
   one hand on a steering wheel. Anything that needs a second pass is too
   clever for this sheet.

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
        headline: "We wash your car well.",
        sub: "Bring your car to us and we will take our time with it.",
        points: [
            "We don't rush your car",
            "We clean inside and outside",
            "You see it before you pay",
        ],
        offer: "Ask for a loyalty card. Wash five times and the sixth one is on us.",
        contact: {whatsapp: "0903 862 2012", web: "jaranow.com", social: "@jara_now"},
        note: "Drive in any day, 8am–7pm.",
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
  /* With the service rows gone the headline is what the sheet is, so it takes
     the space they were using. 13mm in Archivo Black sets this headline on two
     lines against the 124mm measure - the face is far wider than Rubik at the
     same size, so a longer headline wraps to three and the block starts
     crowding the points. Check the PNG if you lengthen it. */
  .headline{
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-size:${mm(13)}px; font-weight:${HEADLINE.weight}; line-height:1.02;
    /* Looser than the Rubik setting was: heavy letters need air between them. */
    letter-spacing:-.008em; max-width:${mm(124)}px;
    /* Evens the lines. Without it the last word hangs on its own. */
    text-wrap:balance;
  }
  .sub{
    font-size:${mm(4.6)}px; font-weight:400; line-height:1.5;
    color:rgba(242,245,251,.72); max-width:${mm(120)}px;
  }

  /* How the work is done - three short lines, no rules, no second line under
     each. What was here before was the wash list, which read as a menu and
     answered a question nobody in a car park is asking yet. These sell the
     work; the figures and the wash types live on the wall list and /pricing. */
  .points{margin-top:${mm(6)}px; display:flex; flex-direction:column; gap:${mm(4.4)}px}
  .point{
    position:relative; padding-left:${mm(7)}px;
    font-size:${mm(5.6)}px; font-weight:500; line-height:1.2;
  }
  /* Square accent tick rather than a bullet glyph - the dot is the drop's job. */
  .point::before{
    content:""; position:absolute; left:0; top:${mm(2)}px;
    width:${mm(2.4)}px; height:${mm(2.4)}px; background:${ACCENT};
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
  /* The number is the other thing on the sheet that has to carry across a
     forecourt, so it takes the headline face too. */
  .wa .num{
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-size:${mm(7.6)}px; font-weight:${HEADLINE.weight}; letter-spacing:-.01em;
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

const flyerBody = (f) => `<div class="dots"></div>
${watermark()}
<div class="head">
  ${mark(f.lockup, mm(15))}
  <span class="kicker">${f.kicker}</span>
</div>
<div class="body">
  <h1 class="headline">${f.headline}</h1>
  <p class="sub">${f.sub}</p>
  <div class="points">
${(f.points || []).map((p) => `    <div class="point">${p}</div>`).join("\n")}
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
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Archivo+Black&display=block" rel="stylesheet">
<style>${CSS}</style></head><body>
${body}
<div class="bar"></div>
</body></html>`;

for (const f of FLYERS) {
    fs.writeFileSync(path.join(OUT, "html", `${f.file}.html`), page(flyerBody(f)));
    console.log(`template  ${f.file}.html  ${(f.points || []).length} points`);
}

console.log(`\n${FLYERS.length} flyers written to ${path.join(OUT, "html")}`);
console.log(`page ${PAGE_W}x${PAGE_H}px = A5 148x210mm trim + ${BLEED}mm bleed @ ${DPI}dpi`);
