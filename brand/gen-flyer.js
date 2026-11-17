/* Jaranow — A5 hand-out flyer, 148x210mm trim + 3mm bleed at 300dpi;
   rasterize-flyer.sh shoots it. General, no prices, no service list - deliberate,
   see CLAUDE.md "A5 flyer". Fixed height with fixed blocks: copy that outgrows a
   block collides with the car or the bar, so eyeball the PNG after any copy change.

   Usage: node gen-flyer.js <outdir>
*/
const fs = require("fs");
const path = require("path");
const {sparkle, car, bubbles, DROP} = require("./art");

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
// The accent field's depth. Its bottom edge is the ground the car stands on.
const FIELD = BLEED + 128;

/* headline: two lines, breaks only at \n. sub: three lines against 56mm or it runs
   into the car. points: three, each exactly two lines broken at \n (~12 characters
   a line) so the row sits level. Plain and spoken - read in seconds, one hand on
   a steering wheel. Voice: everyday Nigerian English ("a proper wash", "chat
   us", "every day"), direct, never Pidgin - "well well" was tried as the headline
   and read as a joke.
   loyalty: five washes then the sixth free, never "a free fifth" (CLAUDE.md
   "Pocket cards") - the slot row draws exactly that. */
const FLYERS = [
    {
        file: "flyer-carwash",
        lockup: "jaranow-carwash-by-jaranow-white",
        headline: "Your car deserves\na proper wash.",
        sub: "Tyres, glass, door edges, everywhere. We don't rush and we don't skip.",
        points: [
            {icon: "clock", text: "We don't\nrush your car"},
            {icon: "sparkle", text: "We clean\nevery corner"},
            {icon: "shield", text: "Your things\nare safe"},
        ],
        loyalty: {title: "Wash 5 times. Get 1 free wash.", sub: "Ask us for your loyalty card."},
        contact: {
            label: "Chat us on WhatsApp",
            whatsapp: "0903 862 2012",
            place: "6th Avenue, Gwarinpa",
            lines: ["Opp. Royal Care Specialist Hospital", "Open every day · 8am–7pm", "jaranow.com · @jara_now"],
        },
    },
];

function mark(name, height) {
    let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

const stroke = `fill="none" stroke="${PAPER}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
const ICONS = {
    clock: `<circle cx="12" cy="12" r="8.5" ${stroke}/><path d="M12 7.5V12l3.2 2" ${stroke}/>`,
    sparkle: `${sparkle(10.5, 12.5, 7.5, PAPER)}${sparkle(18.5, 6, 3.4, PAPER)}`,
    shield: `<path d="M12 3.2l7 2.6v5.4c0 4.4-2.9 7.9-7 9.6-4.1-1.7-7-5.2-7-9.6V5.8z" ${stroke}/><path d="M8.6 12.2l2.5 2.5 4.4-5" ${stroke}/>`,
};

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden}
  body{background:${PAPER}; color:${INK}; font-family:'Rubik',system-ui,sans-serif; position:relative}

  /* A full accent field with the car standing on its bottom edge: the sheet is
     the wash, not a notice about one. The only piece that leads on accent. */
  .field{
    position:relative; height:${mm(FIELD)}px; overflow:hidden;
    background:${ACCENT}; color:${PAPER};
    padding:${SAFE}px ${SAFE}px 0;
  }
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(rgba(242,245,251,.16) ${mm(0.38)}px, transparent ${mm(0.38)}px);
    background-size:${mm(6)}px ${mm(6)}px;
  }
  .field > *:not(.dots):not(.car){position:relative; z-index:2}
  /* Archivo Black is far wider than Rubik: two lines against the 128mm measure. */
  .headline{
    margin-top:${mm(11)}px;
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-size:${mm(12.6)}px; font-weight:${HEADLINE.weight}; line-height:1.02;
    letter-spacing:-.012em; white-space:pre;
  }
  .sub{
    margin-top:${mm(4.4)}px; max-width:${mm(56)}px;
    font-size:${mm(4.2)}px; font-weight:400; line-height:1.42; color:rgba(242,245,251,.88);
  }
  .car{position:absolute; right:${mm(BLEED + 5)}px; bottom:${-mm(1.2)}px; width:${mm(70)}px; height:auto; display:block; z-index:1}

  .rest{padding:${mm(7)}px ${SAFE}px 0}
  .points{display:grid; grid-template-columns:repeat(3,1fr); gap:${mm(4)}px}
  .point{display:flex; align-items:center; gap:${mm(2.6)}px; font-size:${mm(3.9)}px; font-weight:500; line-height:1.18}
  .icon{
    flex:none; width:${mm(10.5)}px; height:${mm(10.5)}px; border-radius:50%; background:${INK};
    display:flex; align-items:center; justify-content:center;
  }
  .icon svg{width:58%; height:58%}

  /* The loyalty card drawn as itself - five stamps then the free one - so the
     offer is read off the picture. The reason the sheet gets kept. */
  .loyalty{
    margin-top:${mm(6.5)}px; padding:${mm(4.4)}px ${mm(5)}px;
    background:${INK}; color:${PAPER}; border-radius:${mm(4)}px;
    display:flex; align-items:center; justify-content:space-between; gap:${mm(4)}px;
  }
  .loyalty .t{font-size:${mm(4.2)}px; font-weight:700; letter-spacing:-.01em; line-height:1.15; white-space:nowrap}
  .loyalty .d{margin-top:${mm(1.2)}px; font-size:${mm(3.4)}px; color:rgba(242,245,251,.66)}
  .slots{display:flex; flex:none; gap:${mm(1.4)}px}
  .slot{
    width:${mm(6.8)}px; height:${mm(6.8)}px; border-radius:50%;
    border:${mm(0.5)}px solid rgba(242,245,251,.4);
    display:flex; align-items:center; justify-content:center;
    font-size:${mm(3.2)}px; font-weight:500; color:rgba(242,245,251,.6);
  }
  .slot.free{border-color:${ACCENT}; background:${ACCENT}}
  .slot.free svg{width:58%; height:58%}

  /* The block people photograph or keep. */
  .contact{margin-top:${mm(6.5)}px; display:flex; align-items:flex-end; justify-content:space-between; gap:${mm(4)}px}
  .wa .via{
    display:block; font-size:${mm(2.9)}px; font-weight:500; letter-spacing:.22em;
    text-transform:uppercase; color:${ACCENT};
  }
  /* The number has to carry across a forecourt, so it takes the headline face too. */
  .wa .num{
    display:block; margin-top:${mm(1)}px;
    font-family:'${HEADLINE.family}',system-ui,sans-serif;
    font-size:${mm(7.6)}px; font-weight:${HEADLINE.weight}; letter-spacing:-.01em; line-height:1;
  }
  .where{text-align:right; font-size:${mm(3.3)}px; line-height:1.4; color:rgba(14,21,38,.66); white-space:nowrap}
  .where b{display:block; font-size:${mm(4)}px; font-weight:700; color:${INK}}

  /* 10mm prints as a 7mm band: the bar must be taller than the bleed. Ink here,
     because the accent is already the top of the sheet. */
  .bar{position:absolute; left:0; right:0; bottom:0; height:${mm(BLEED + 7)}px; background:${INK}}
`;

// Washed and gleaming, no lather: suds only make sense with someone working them.
const carArt = () => `<svg class="car" viewBox="462 104 476 392" xmlns="http://www.w3.org/2000/svg">
  ${car()}
  ${bubbles([[900, 150, 7], [916, 124, 4], [488, 250, 5]])}
  ${sparkle(766, 196, 13, "#fff")}${sparkle(846, 278, 9, "#fff")}${sparkle(590, 330, 10, "#fff")}${sparkle(770, 372, 8, "#fff")}
  ${sparkle(512, 150, 13, PAPER)}${sparkle(880, 210, 9, PAPER)}
</svg>`;

const slots = () =>
    [1, 2, 3, 4, 5].map((n) => `<span class="slot">${n}</span>`).join("") +
    `<span class="slot free"><svg viewBox="12 2 76 100"><path fill-rule="evenodd" fill="${PAPER}" d="${DROP}"/></svg></span>`;

const flyerBody = (f) => `<div class="field">
  <div class="dots"></div>
  ${mark(f.lockup, mm(16))}
  <h1 class="headline">${f.headline}</h1>
  <p class="sub">${f.sub}</p>
  ${carArt()}
</div>
<div class="rest">
  <div class="points">
${f.points.map((p) => `    <div class="point"><span class="icon"><svg viewBox="0 0 24 24">${ICONS[p.icon]}</svg></span><span>${p.text.replace("\n", "<br>")}</span></div>`).join("\n")}
  </div>
  <div class="loyalty">
    <div><p class="t">${f.loyalty.title}</p><p class="d">${f.loyalty.sub}</p></div>
    <div class="slots">${slots()}</div>
  </div>
  <div class="contact">
    <div class="wa">
      <span class="via">${f.contact.label}</span>
      <span class="num">${f.contact.whatsapp}</span>
    </div>
    <div class="where"><b>${f.contact.place}</b>${f.contact.lines.join("<br>")}</div>
  </div>
</div>`;

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
    console.log(`template  ${f.file}.html  ${f.points.length} points`);
}

console.log(`\n${FLYERS.length} flyers written to ${path.join(OUT, "html")}`);
console.log(`page ${PAGE_W}x${PAGE_H}px = A5 148x210mm trim + ${BLEED}mm bleed @ ${DPI}dpi`);
