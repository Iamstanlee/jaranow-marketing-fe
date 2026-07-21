/* Jaranow — pocket card generator.
   Emits print-ready HTML templates; rasterize-card.sh turns them into 300dpi
   PNGs. Type is Rubik (the site face, pulled from Google Fonts at render time);
   the lockups are the real brand SVGs, inlined.

   Two cards live here, both 85x55mm so they share one press setup and one
   rasterizer:
     card-carwash-account-*   complimentary card carrying the bank details
     card-carwash-loyalty-*   stamp card, 5 washes then one on us

   Geometry is 85x55mm trim + 3mm bleed on all four sides, at 300dpi:
     trim  1004 x 650 px
     bleed 1075 x 721 px  <- the emitted page size
   Content sits 4mm inside the trim, so nothing important lands near a blade.

   Usage: node gen-card.js <outdir>
*/
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2] || path.join(__dirname, "card");
const SVG = path.join(__dirname, "jaranow-blue", "svg");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });

const INK = "#0E1526";
const ACCENT = "#2563EB";
const PAPER = "#F2F5FB";

const DPI = 300;
const mm = (n) => Math.round((n * DPI) / 25.4);

const BLEED = 3;
const PAGE_W = mm(85 + BLEED * 2); // 1075
const PAGE_H = mm(55 + BLEED * 2); // 721
const SAFE = mm(BLEED + 4); // bleed + 4mm quiet margin from trim

/* ---------------------------------------------------------------------------
   PLACEHOLDERS — replace these three values with the real account, then
   regenerate. They are deliberately obvious so a proof never reads as real.
--------------------------------------------------------------------------- */
const ACCOUNT = {
  bank: "OPAY",
  name: "JARANOW TECHNOLOGIES",
  number: "9038622012",
};

/* group a 10-digit NUBAN as 3-3-4 for reading aloud over a forecourt */
const groupNuban = (n) =>
  /^\d{10}$/.test(n) ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : n;

/* inline a brand SVG at a fixed height */
function mark(name, height) {
  let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

/* the symbol, oversized and faint, bleeding off an edge */
function watermark(colourway, opacity) {
  let s = fs.readFileSync(path.join(SVG, `jaranow-symbol-${colourway}.svg`), "utf8").trim();
  s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
  return s.replace("<svg ", `<svg class="wm" style="opacity:${opacity}" `);
}

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden}
  body{
    font-family:'Rubik',system-ui,sans-serif;
    position:relative;
    display:flex; flex-direction:column;
    /* Bottom clears the accent bar as well as the bleed, so the footer never
       sits on top of it. */
    padding:${SAFE}px ${SAFE}px ${mm(BLEED + 3 + 4)}px;
  }
  body.front{background:${INK}; color:${PAPER}; justify-content:center; align-items:center}
  body.back{background:${PAPER}; color:${INK}; justify-content:space-between}

  /* dot field — echoes the site hero and the share cards */
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(rgba(242,245,251,.11) 1.5px, transparent 1.5px);
    background-size:${mm(2.9)}px ${mm(2.9)}px;
  }
  .wm{
    position:absolute; right:${-mm(14)}px; top:50%; transform:translateY(-50%);
    height:${mm(78)}px; width:auto;
  }

  /* ---- front ---- */
  .front .stack{position:relative; z-index:2; display:flex; flex-direction:column; align-items:center}
  .front .tag{
    font-size:${mm(2.5)}px; font-weight:500; letter-spacing:.34em; text-transform:uppercase;
    color:rgba(242,245,251,.56); margin-top:${mm(6)}px;
  }

  /* ---- back ---- */
  .back .head{position:relative; z-index:2; display:flex; align-items:flex-start; justify-content:space-between}
  .back .kicker{
    font-size:${mm(2.3)}px; font-weight:500; letter-spacing:.28em; text-transform:uppercase;
    color:rgba(14,21,38,.45); text-align:right; line-height:1.7;
  }
  /* Everything below is sized so head + pay + foot stays inside the padded box
     (55mm trim less the margins). Overflow does not push the page taller - the
     body is a fixed 55mm and overflow:hidden - it silently slides the footer
     down under the accent bar. Re-check the render after changing any size. */
  .pay{position:relative; z-index:2; margin-top:${mm(3)}px}
  .label{
    font-size:${mm(2.2)}px; font-weight:500; letter-spacing:.22em; text-transform:uppercase;
    color:${ACCENT};
  }
  .number{
    font-size:${mm(8)}px; font-weight:700; letter-spacing:-.01em; line-height:1;
    font-variant-numeric:tabular-nums; margin-top:${mm(2)}px;
  }
  .holder{
    font-size:${mm(3)}px; font-weight:500; line-height:1.45; margin-top:${mm(2.4)}px;
  }
  .holder .bank{color:rgba(14,21,38,.62); font-weight:400}

  .foot{
    position:relative; z-index:2;
    border-top:1px solid rgba(14,21,38,.14);
    padding-top:${mm(3)}px;
    display:flex; align-items:flex-end; justify-content:space-between; gap:${mm(5)}px;
  }
  .thanks{font-size:${mm(2.8)}px; line-height:1.5; color:rgba(14,21,38,.66)}
  .contact{font-size:${mm(2.6)}px; line-height:1.6; color:rgba(14,21,38,.66); text-align:right; white-space:nowrap}

  /* ---- loyalty back ---- */
  /* Six slots across the 77mm content width: 6 x 11mm plus five 2.2mm gaps.
     11mm is the floor - below that a rubber stamp will not sit inside the ring,
     so adding a seventh slot means rethinking the row, not shrinking further. */
  .slots{
    position:relative; z-index:2;
    display:flex; align-items:center; justify-content:space-between;
  }
  .slot{
    width:${mm(11)}px; height:${mm(11)}px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    border:${mm(0.4)}px solid rgba(14,21,38,.22);
    font-size:${mm(3.2)}px; font-weight:500; color:rgba(14,21,38,.26);
  }
  /* Slots 1-5 get stamped; the sixth is the reward and is never stamped - it is
     the free wash those five points buy. Keep five numbered slots: drop one and
     the card silently becomes "buy 4, get the 5th free". */
  .slot.reward{background:${ACCENT}; border-color:${ACCENT}}

  /* Sized to hold one line beside the serial - it orphans badly if it wraps. */
  .terms{font-size:${mm(2.3)}px; line-height:1.45; color:rgba(14,21,38,.58)}
  /* Printed per card by the batch run, so there is no write-in field for it. */
  .cardno{
    font-size:${mm(2.6)}px; font-weight:500; letter-spacing:.1em;
    font-variant-numeric:tabular-nums; color:rgba(14,21,38,.62); white-space:nowrap;
  }

  /* The bar must survive the cut: BLEED of its height is trimmed away, so it
     needs to be taller than the bleed to leave anything on the finished card.
     6mm here prints as a 3mm band along the bottom edge. */
  .bar{position:absolute; left:0; right:0; bottom:0; height:${mm(BLEED + 3)}px; background:${ACCENT}}
`;

const page = (cls, body) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=block" rel="stylesheet">
<style>${CSS}</style></head><body class="${cls}">
${body}
<div class="bar"></div>
</body></html>`;

/* ---------------------------------------------------------------------------
   Loyalty card numbering. Each card carries a printed serial so a stamped card
   can be tied back to a customer in the ledger - the card itself enforces
   nothing, the number is just the handle.
--------------------------------------------------------------------------- */
const SERIAL = { prefix: "JC", pad: 3 };
const cardNo = (n) => `${SERIAL.prefix}-${String(n).padStart(SERIAL.pad, "0")}`;

function loyaltyBack(no) {
  return `${watermark("blue", ".05")}
<div class="head">
  ${mark("jaranow-lockup-horizontal-duo", mm(8))}
  <span class="kicker">Five stamps<br>one free wash</span>
</div>
<div class="slots">
  ${[1, 2, 3, 4, 5]
    .map((n) => `<div class="slot">${n}</div>`)
    .join("\n  ")}
  <div class="slot reward">${mark("jaranow-symbol-white", mm(5.5))}</div>
</div>
<div class="foot">
  <p class="terms">A stamp for every wash. Five stamps = 1 free wash</p>
  <span class="cardno">${no}</span>
</div>`;
}

const CARDS = [
  {
    file: "card-carwash-account-front",
    cls: "front",
    body: `<div class="dots"></div>
${watermark("white", ".06")}
<div class="stack">
  ${mark("jaranow-carwash-by-jaranow-white", mm(17))}
  <span class="tag">6th Avenue · Gwarinpa · Abuja</span>
</div>`,
  },
  {
    file: "card-carwash-account-back",
    cls: "back",
    body: `${watermark("blue", ".05")}
<div class="head">
  ${mark("jaranow-lockup-horizontal-duo", mm(9))}
  <span class="kicker">Pay after<br>your wash</span>
</div>
<div class="pay">
  <div class="label">Account number</div>
  <div class="number">${groupNuban(ACCOUNT.number)}</div>
  <div class="holder">${ACCOUNT.name}<br><span class="bank">${ACCOUNT.bank}</span></div>
</div>
<div class="foot">
  <p class="thanks">Thank you for trusting us with your car.</p>
  <span class="contact">jaranow.com</span>
</div>`,
  },
  {
    file: "card-carwash-loyalty-front",
    cls: "front",
    body: `<div class="dots"></div>
${watermark("white", ".06")}
<div class="stack">
  ${mark("jaranow-carwash-by-jaranow-white", mm(15))}
  <span class="tag">Loyalty card</span>
</div>`,
  },
  {
    file: "card-carwash-loyalty-back",
    cls: "back loyalty",
    body: loyaltyBack(cardNo(0)), // specimen - the real run comes from --batch
  },
];

for (const c of CARDS) {
  fs.writeFileSync(path.join(OUT, "html", `${c.file}.html`), page(c.cls, c.body));
  console.log(`template  ${c.file}.html`);
}
console.log(`\n${CARDS.length} templates written to ${path.join(OUT, "html")}`);
console.log(`page ${PAGE_W}x${PAGE_H}px = 85x55mm trim + ${BLEED}mm bleed @ ${DPI}dpi`);

/* ---- numbered batch ------------------------------------------------------
   `node gen-card.js <outdir> --batch[=N]` writes N serialised loyalty backs to
   <outdir>/batch/html. Only the BACK varies - every front is identical, so the
   press runs one static front and N variable backs.
-------------------------------------------------------------------------- */
const batchArg = process.argv.find((a) => a.startsWith("--batch"));
if (batchArg) {
  const count = Number(batchArg.split("=")[1] || 100);
  if (!Number.isInteger(count) || count < 1) {
    console.error(`--batch needs a positive whole number, got: ${batchArg}`);
    process.exit(1);
  }
  const dir = path.join(OUT, "batch", "html");
  fs.rmSync(path.join(OUT, "batch"), { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  for (let n = 1; n <= count; n++) {
    const no = cardNo(n);
    fs.writeFileSync(
      path.join(dir, `card-carwash-loyalty-back-${no}.html`),
      page("back loyalty", loyaltyBack(no))
    );
  }
  console.log(
    `\nbatch: ${count} numbered backs (${cardNo(1)}..${cardNo(count)}) -> ${dir}`
  );
  console.log(`fronts are identical - print card-carwash-loyalty-front once, x${count}`);
}
