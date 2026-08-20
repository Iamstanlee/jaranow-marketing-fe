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

   Usage: node gen-card.js [outdir] [--batch[=SPEC]]
          outdir defaults to brand/card, which is where rasterize-card.sh looks.
          SPEC is a count (100) or an inclusive serial range (101-200).
*/
const fs = require("fs");
const path = require("path");

/* Output directory: optional, positional, and defaults to brand/card - which is
   what rasterize-card.sh reads, so there is rarely a reason to pass it.
   Flags are skipped when looking for it. Taking argv[2] blindly meant
   `gen-card.js --batch=100` read the flag as the path and quietly wrote a
   directory literally named "--batch=100" into the cwd. */
const OUT =
  process.argv.slice(2).find((a) => !a.startsWith("-")) || path.join(__dirname, "card");
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
  bank: "MONIEPOINT",
  name: "BEANSLABS TECHNOLOGIES",
  number: "5298331307",
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
const SERIAL = { prefix: "LOY", pad: 3 };
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
   `node gen-card.js <outdir> --batch[=SPEC]` writes serialised loyalty backs to
   <outdir>/batch/html. Only the BACK varies - every front is identical, so the
   press runs one static front and N variable backs.

   SPEC is either a count, which starts at 1, or an explicit inclusive range:

     --batch           LOY-001..LOY-100   (the default run)
     --batch=250       LOY-001..LOY-250
     --batch=101-200   LOY-101..LOY-200   <- the second run of 100
     --batch=101..200  same, if you prefer the other separator

   The range form is the one to reach for on a reprint. A serial is the handle
   the ledger keys a customer's balance off, so regenerating from 1 reissues
   numbers that are already in customers' hands and silently puts two people on
   one balance. Start where the last run ended: after 1-100, print 101-200.

   Nothing here knows what has already been printed - that is the ledger's job,
   not the generator's. It will happily reissue a range if you ask it to.
-------------------------------------------------------------------------- */

/* A count ("250") or an inclusive range ("101-200" / "101..200"). Returns null
   for anything else so the caller can print usage rather than guess. */
function parseBatch(spec) {
  if (!spec) return { from: 1, to: 100 };
  const range = spec.match(/^(\d+)(?:-|\.\.)(\d+)$/);
  if (range) return { from: Number(range[1]), to: Number(range[2]) };
  if (/^\d+$/.test(spec)) return { from: 1, to: Number(spec) };
  return null;
}

const batchArg = process.argv.find((a) => a.startsWith("--batch"));
if (batchArg) {
  const spec = batchArg.includes("=") ? batchArg.split("=").slice(1).join("=") : "";
  const batch = parseBatch(spec);
  if (!batch) {
    console.error(`--batch needs a count or a range, got: ${batchArg}`);
    console.error(`  --batch=250      LOY-001..LOY-250`);
    console.error(`  --batch=101-200  LOY-101..LOY-200`);
    process.exit(1);
  }
  const { from, to } = batch;
  /* Serial 0 is the specimen back written above, so a run starts at 1. */
  if (from < 1) {
    console.error(`--batch starts at 1 (LOY-000 is the specimen), got: ${from}`);
    process.exit(1);
  }
  if (to < from) {
    console.error(`--batch range runs backwards: ${cardNo(from)}..${cardNo(to)}`);
    process.exit(1);
  }
  const count = to - from + 1;

  const dir = path.join(OUT, "batch", "html");
  /* Wiped first, so a re-run never leaves last run's serials behind to be
     printed twice. One directory is one press run: to keep an earlier run,
     copy it out before generating the next range. */
  fs.rmSync(path.join(OUT, "batch"), { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  for (let n = from; n <= to; n++) {
    const no = cardNo(n);
    fs.writeFileSync(
      path.join(dir, `card-carwash-loyalty-back-${no}.html`),
      page("back loyalty", loyaltyBack(no))
    );
  }
  console.log(
    `\nbatch: ${count} numbered backs (${cardNo(from)}..${cardNo(to)}) -> ${dir}`
  );
  console.log(`fronts are identical - print card-carwash-loyalty-front once, x${count}`);
  /* Past the pad width the serials get wider (LOY-999 -> LOY-1000), so a run
     that straddles the boundary prints two different-looking cards. Not fatal,
     but it is the kind of thing you want to hear before the press does. */
  if (to >= 10 ** SERIAL.pad) {
    console.warn(
      `\nnote: ${cardNo(to)} is wider than ${SERIAL.pad} digits - this run mixes serial widths.`
    );
    console.warn(`      raise SERIAL.pad if the whole run should line up.`);
  }
  console.log(`next run starts at --batch=${to + 1}-${to + count}`);
}
