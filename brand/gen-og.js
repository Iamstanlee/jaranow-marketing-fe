/* Jaranow — Open Graph image generator.
   Emits one HTML template per share card; rasterize.sh-style Chrome pass turns
   them into 1200x630 PNGs. Type is Rubik (the site face, pulled from Google
   Fonts at render time); the lockups are the real brand SVGs, inlined.

   Usage: node gen-og.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "og");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

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

const CARDS = [
  {
    file: "opengraph-jaranow",
    lockup: "jaranow-lockup-horizontal-white",
    lockupH: 62,
    headline: "Your chores, handled.",
    sub: "Fixed-price car wash and subscription laundry in Abuja.",
    meta: "jaranow.com",
  },
  {
    file: "opengraph-carwash",
    lockup: "jaranow-carwash-by-jaranow-white",
    lockupH: 80,
    headline: "Your car, handled.",
    sub: "Drive in, we wash, you drive off. No negotiation, no hidden charges.",
    meta: "Exterior ₦2,000 · Full wash ₦3,000 · 6th Avenue, Gwarinpa",
  },
  {
    file: "opengraph-laundry",
    lockup: "jaranow-laundry-by-jaranow-white",
    lockupH: 80,
    headline: "Never worry about laundry again.",
    sub: "We collect, wash, iron and bring it back folded.",
    meta: "Plans from ₦14,999/month · 48-hour turnaround · Abuja",
  },
  {
    file: "opengraph-pricing",
    lockup: "jaranow-lockup-horizontal-white",
    lockupH: 62,
    headline: "The price you see is the price you pay.",
    sub: "Car wash from ₦2,000. Laundry plans from ₦14,999/month.",
    meta: "No negotiation · No hidden charges",
  },
];

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{
    background:${INK};
    font-family:'Rubik',system-ui,sans-serif;
    color:${PAPER};
    position:relative;
    display:flex; flex-direction:column; justify-content:space-between;
    padding:72px 76px 0;
  }
  /* dot field — echoes the site hero */
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(rgba(242,245,251,.11) 1.5px, transparent 1.5px);
    background-size:34px 34px;
  }
  .wm{
    position:absolute; right:-118px; top:50%; transform:translateY(-50%);
    height:660px; width:auto; opacity:.06;
  }
  .row{position:relative; z-index:2}
  h1{
    font-size:76px; line-height:1.04; font-weight:700; letter-spacing:-.028em;
    max-width:15ch; margin-top:64px;
  }
  .sub{
    font-size:29px; line-height:1.42; font-weight:400;
    color:rgba(242,245,251,.74); max-width:26ch; margin-top:26px;
  }
  .foot{
    position:relative; z-index:2;
    display:flex; align-items:center; justify-content:space-between;
    border-top:1px solid rgba(242,245,251,.14);
    padding:26px 0 30px; margin-top:56px;
  }
  .meta{font-size:23px; font-weight:500; color:rgba(242,245,251,.86)}
  .bar{position:absolute; left:0; right:0; bottom:0; height:10px; background:${ACCENT}}
`;

for (const c of CARDS) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=block" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="dots"></div>
${watermark()}
<div class="row">
  ${mark(c.lockup, c.lockupH)}
  <h1>${c.headline}</h1>
  <p class="sub">${c.sub}</p>
</div>
<div class="foot"><span class="meta">${c.meta}</span></div>
<div class="bar"></div>
</body></html>`;
  fs.writeFileSync(path.join(OUT, "html", `${c.file}.html`), html);
  console.log(`template  ${c.file}.html`);
}
console.log(`\n${CARDS.length} templates written to ${path.join(OUT, "html")}`);
