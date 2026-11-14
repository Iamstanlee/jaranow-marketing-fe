/* Jaranow — A5 hand-out flyer, 148x210mm trim + 3mm bleed at 300dpi;
   rasterize-flyer.sh shoots it. General, no prices, no service list - deliberate,
   see CLAUDE.md "A5 flyer". Fixed height: copy that outgrows A5 slides the note
   under the bar, so eyeball the PNG after any copy change.

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

// Archivo Black ships ONE weight; 700 gets a synthetic bold that smears the outline.
const HEADLINE = {family: "Archivo Black", weight: 400};

const BLEED = 3;
const PAGE_W = mm(148 + BLEED * 2); // 1819
const PAGE_H = mm(210 + BLEED * 2); // 2551
// 10mm, not the A4 sheets' 12: same optical margin at A5.
const SAFE = mm(BLEED + 10);

/* headline ~40 chars; points: three lines of 3-4 words, no second line.
   Language: plain and spoken ("we wash your car well", not "meticulous attention
   to detail") - read in seconds, one hand on a steering wheel. */
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

function mark(name, height) {
    let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

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
