/* Jaranow — laminated A4 price lists, 210x297mm trim + 3mm bleed at 300dpi;
   rasterize-pricelist.sh shoots them. Edit LISTS. Prices as plain fact only -
   keep in step with /pricing and src/data/carwashPrices.ts (CLAUDE.md "Price lists").

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
const SAFE_MM = BLEED + 12; // bleed + 12mm quiet margin from trim
const FOOT_MM = BLEED + 8 + 10; // bottom padding: clears the accent bar too
const HEAD_GAP = 12; // fixed air between the header block and the first row
const SAFE = mm(SAFE_MM);

/* Figures are Archivo 900, NOT Archivo Black: Archivo Black's font file has no
   U+20A6 (₦) despite its latin-ext unicode-range, so ₦ silently falls back.
   Archivo 900 is a measured metric match (digit 0.667em, stem 0.221em, cap
   0.688 vs 0.686). It is variable - request wght 900 explicitly. */
const BODY = {family: "Rubik", stack: "'Rubik',system-ui,sans-serif"};
const FIGURE = {
    family: "Archivo",
    weight: 900,
    // Rubik before system-ui so a missing glyph lands on a brand face.
    stack: "'Archivo','Rubik',system-ui,sans-serif",
};
const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Archivo:wght@900&display=block";

/* `cards` sets a section as a row of cards (the three everyday washes, as
   /pricing shows them).
   `cover` ({headline?, sub}) also emits <file>-front.html; it sells on care,
   never price. An empty section is skipped with a warning, so one can be stubbed
   before its prices are confirmed. `price`: number (grouped) or string (verbatim).
   `badge` names a tier; it is not a sales line. */
const LISTS = [
    {
        file: "pricelist-carwash",
        lockup: "jaranow-carwash-by-jaranow-white",
        kicker: "Price list",
        sections: [
            {
                title: "Everyday washes",
                cards: true,
                items: [
                    {
                        name: "Body wash",
                        note: "Body, tyres and glass",
                        price: 2000,
                    },
                    {
                        name: "Full wash",
                        note: "Body wash · inside cleaned",
                        price: 3000,
                    },
                    {
                        name: "Wash & vacuum",
                        note: "Body wash · inside vacuumed",
                        price: 4000,
                    },
                ],
            },
            {
                title: "More car care",
                items: [
                    {
                        name: "Full wash + engine",
                        note: "Body wash · inside cleaned · engine area washed · note: engine wash is 100% at owners risk",
                        price: 7000,
                    },
                    {
                        name: "Deep wash",
                        note: "Body wash · deep interior cleaning & vacuum",
                        price: 10000,
                        badge: "Premium",
                    },
                    {
                        name: "Buffing & polish",
                        note: "Body wash · inside cleaned · paint correction · scratch removal · shine restoration",
                        price: 20000,
                        badge: "Premium",
                    },
                    {
                        name: "Premium detailing",
                        note: "Body wash · deep interior cleaning & vacuum · engine area · polish & wax",
                        price: 35000,
                        badge: "Premium",
                    },
                ],
            },
            {
                title: "Rug",
                items: [
                    {name: "Small rug", note: "Bedside or centre rug", price: 10000},
                    {name: "Medium rug", note: "Big bedside or centre rug", price: 15000},
                    {name: "Large rug", note: "Sitting room size rug", price: 20000},
                ],
            },
        ],
        note: "We treat every car like it's the only one we're washing today.",
        cover: {
            sub: "",
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
                    // "Gown" = dress in Nigerian English; same items as the site's lists.
                    {
                        name: "Regular items",
                        note: "Shirts, trousers, gowns, skirts, tops",
                        price: 700,
                        unit: "/item",
                    },
                    {
                        name: "Special items",
                        note: "Suits, long gowns, towels, duvet sets, curtains",
                        price: 2000,
                        unit: "/item",
                    },
                ],
            },
        ],
        note: "Pickup windows: Tuesday & Saturday (Lite) · Tuesday, Thursday & Saturday (Premium).",
        cover: {
            sub: "Picked up, cleaned and returned within 48 hours.",
        },
    },
];

// Measured from the font files; used only by the fit solver and legibility table.
const METRIC = {
    // Rubik 400 average advance over the real note strings - enough to predict a wrap.
    bodyAdvance: 0.47,
    // ₦ is much wider than a digit; approximating it underestimates the price column.
    digit: 0.667,
    comma: 0.333,
    naira: 0.873,
    // Swap a face without its cap ratio and the legibility table lies.
    capBody: 0.7,
    capFigure: 0.686, /* Archivo 900 */
};

// mm at density 1. Only this block scales, so headers/footers match across sheets.
const BASE = {
    type: {name: 9, note: 4.4, price: 11, unit: 4.6, badge: 3.4, title: 4.4},
    space: {rowPad: 6, gap: 16},
};

/* Below COMFORT warns; the solver keeps shrinking to MIN rather than overflow,
   because overflow:hidden clips the footer and note first, not the last row. */
const DENSITY_COMFORT = 0.7;
const DENSITY_MIN = 0.45;

// 25mm cap per 3m - the repo's sizing rule, same units as gen-sign.js.
const readDistance = (sizeMm, capRatio) => (sizeMm * capRatio * 3) / 25;

/* Type scales with k, space with k² - whitespace gives way before legibility.
   That makes height non-linear in k, hence bisection rather than division. */
const metrics = (k) => ({
    ...Object.fromEntries(Object.entries(BASE.type).map(([n, v]) => [n, v * k])),
    ...Object.fromEntries(Object.entries(BASE.space).map(([n, v]) => [n, v * k * k])),
});

/* ₦ (U+20A6) is in the latin-ext subset. A box means it didn't load - check the
   network, don't swap in "N". A ₦ lighter than its digits means Archivo failed. */
const naira = (n) =>
    typeof n === "number" ? `${n.toLocaleString("en-NG")}` : n;

function mark(name, height) {
    let s = fs.readFileSync(path.join(SVG, `${name}.svg`), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    return s.replace("<svg ", `<svg style="height:${height}px;width:auto;display:block" `);
}

function watermark(fill = PAPER) {
    let s = fs.readFileSync(path.join(SVG, "jaranow-symbol-white.svg"), "utf8").trim();
    s = s.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    s = s.replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${fill}"`);
    return s.replace("<svg ", '<svg class="wm" ');
}

/* Fit solver: estimates list height so overflow (silent under overflow:hidden)
   is caught here. Estimates only - always eyeball the PNG. */

function priceWidth(it, m) {
    const s = naira(it.price);
    const digits = (s.match(/\d/g) || []).length;
    const commas = (s.match(/,/g) || []).length;
    const other = s.replace(/[\d,₦]/g, "").length;
    const figure =
        m.price *
        (digits * METRIC.digit + commas * METRIC.comma + other * METRIC.bodyAdvance);
    const cur = (s.match(/₦/g) || []).length * m.price * METRIC.naira;
    const unit = it.unit ? m.unit * it.unit.length * METRIC.bodyAdvance : 0;
    return figure + cur + unit;
}

function listHeight(l, m) {
    const contentW = 210 - (SAFE_MM - BLEED) * 2; // 186mm inside the trim
    const widest = Math.max(...l.sections.flatMap((s) => s.items.map((it) => priceWidth(it, m))), 0);
    const nameW = contentW - widest - 10; // the .row gap is a fixed 10mm

    let h = 0;
    let n = 0;
    for (const s of l.sections) {
        if (!s.items.length) continue;
        if (n) h += m.gap;
        n++;
        if (s.title) h += m.title * 1.25 + 4 + 2; // line + padding + margin
        if (s.cards) {
            // one row of cards, as tall as its longest note (49mm inside a card)
            const lines = Math.max(...s.items.map((it) => Math.ceil(((it.note || "").length * METRIC.bodyAdvance * m.note) / 49)), 1);
            h += 3 + m.rowPad * 2 + m.name * 0.8 * 1.15 + 2 + m.note * 1.4 * lines + 5 + m.price;
            continue;
        }
        for (const it of s.items) {
            let row = m.rowPad * 2 + m.name * 1.15;
            if (it.note) {
                // Badge narrows the name line, not the note, so it's not in the wrap estimate.
                const w = it.note.length * METRIC.bodyAdvance * m.note;
                const lines = Math.max(1, Math.ceil(w / nameW));
                row += 2 + m.note * 1.4 * lines;
            }
            h += row;
        }
    }
    return h;
}

function listSpace(l) {
    const content = 297 + BLEED * 2 - SAFE_MM - FOOT_MM;
    const header = 26 + 9 + 4.6 * 1.25 + HEAD_GAP; // lockup + kicker + the gap below it
    let foot = 6 + 5 * 1.3; // border padding + footer line
    if (l.note) foot += 4 + 4 * 1.45;
    return content - header - foot;
}

// Largest k in [DENSITY_MIN, 1] that fits.
function density(l) {
    const space = listSpace(l);
    const natural = listHeight(l, metrics(1));

    let k = 1;
    if (natural > space) {
        let lo = DENSITY_MIN;
        let hi = 1;
        for (let i = 0; i < 30; i++) {
            const mid = (lo + hi) / 2;
            if (listHeight(l, metrics(mid)) <= space) lo = mid;
            else hi = mid;
        }
        k = lo;
    }

    const m = metrics(k);
    const height = listHeight(l, m);
    return {
        natural,
        space,
        k,
        m,
        height,
        cramped: k < DENSITY_COMFORT,
        overflows: height > space + 0.5, // only possible at DENSITY_MIN
    };
}

const vars = (m) =>
    Object.entries(m)
        .map(([key, v]) => `--${key}:${mm(v)}px`)
        .join(";");

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden}
  body{
    --fg:242,245,251; --bg:${INK};
    background:var(--bg); color:rgb(var(--fg));
    font-family:${BODY.stack};
    position:relative;
    display:flex; flex-direction:column;
    /* Bottom clears the accent bar as well as the bleed. */
    padding:${SAFE}px ${SAFE}px ${mm(FOOT_MM)}px;
  }

  /* dot field — echoes the site hero, the share cards and the pocket cards */
  .dots{
    position:absolute; inset:0;
    background-image:radial-gradient(rgba(var(--fg),.10) ${mm(0.5)}px, transparent ${mm(0.5)}px);
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
    gap:var(--gap);
    /* A long list centres itself right up against the kicker, and a section
       title landing under "PRICE LIST" reads as a second kicker rather than as
       a heading. This gap is the separation between the two, so it does not
       scale with density - it is what stops the header and the list touching.
       It is charged to the budget in listSpace(). */
    margin-top:${mm(HEAD_GAP)}px;
  }
  .section-title{
    font-size:var(--title); font-weight:500; letter-spacing:.26em;
    text-transform:uppercase; color:rgba(var(--fg),.5);
    padding-bottom:${mm(4)}px; margin-bottom:${mm(2)}px;
    border-bottom:${mm(0.3)}px solid rgba(var(--fg),.16);
  }
  .row{
    display:flex; align-items:baseline; justify-content:space-between;
    gap:${mm(10)}px;
    padding:var(--rowPad) 0;
    border-bottom:${mm(0.3)}px solid rgba(var(--fg),.10);
  }
  .row:last-child{border-bottom:none}
  .name{font-size:var(--name); font-weight:500; line-height:1.15}
  /* Sized to hold the longest confirmed note ("Suits, long dresses, towels,
     duvet sets, curtains") on one line against the price column. */
  .item-note{
    font-size:var(--note); font-weight:400; line-height:1.4;
    color:rgba(var(--fg),.56); margin-top:${mm(2)}px;
  }

  /* Tier marker. Accent fill, Paper text - the same "this one is the special
     slot" move the loyalty card's sixth stamp makes, so the two pieces agree.
     It rides beside the name rather than over the price: the price is a fact,
     the badge is a category, and putting a coloured pill on the figure would
     read as promoting the number. Baseline-aligned type would hang it off the
     name's baseline, so it is nudged up to sit against the cap line instead. */
  .badge{
    display:inline-block; vertical-align:baseline;
    position:relative; top:${-mm(0.8)}px;
    margin-left:${mm(3)}px;
    padding:${mm(1.3)}px ${mm(2.4)}px ${mm(1.1)}px;
    border-radius:${mm(1.6)}px;
    background:${ACCENT}; color:${PAPER};
    font-size:var(--badge); font-weight:500; line-height:1;
    letter-spacing:.16em; text-transform:uppercase;
    white-space:nowrap;
  }

  /* The figure is the loudest thing in the row. One face for the whole string,
     ₦ included - see the FIGURE note for why it is Archivo 900 and not Archivo
     Black. */
  .price{
    font-family:${FIGURE.stack};
    font-size:var(--price); font-weight:${FIGURE.weight}; line-height:1;
    letter-spacing:-.01em; font-variant-numeric:tabular-nums;
    white-space:nowrap; text-align:right;
  }
  .unit{
    font-family:${BODY.stack};
    font-size:var(--unit); font-weight:400; letter-spacing:0;
    color:rgba(var(--fg),.56);
  }

  /* Paper cards on the Ink sheet - the one light block, so the eye starts here. */
  .cards{display:grid; grid-template-columns:repeat(3,1fr); gap:${mm(4)}px; margin-top:${mm(3)}px}
  .card{
    display:flex; flex-direction:column;
    background:${PAPER}; color:${INK};
    border-top:${mm(1.4)}px solid ${ACCENT}; border-radius:${mm(3)}px;
    padding:var(--rowPad) ${mm(5)}px;
  }
  .card .name{font-size:calc(var(--name) * .8)}
  .card .item-note{flex:1; color:rgba(14,21,38,.62)}
  .card .price{text-align:left; margin-top:${mm(5)}px}

  .foot{
    position:relative; z-index:2;
    border-top:${mm(0.3)}px solid rgba(var(--fg),.16);
    padding-top:${mm(6)}px;
    display:flex; align-items:baseline; justify-content:space-between; gap:${mm(10)}px;
  }
  .foot span{font-size:${mm(5)}px; font-weight:500; letter-spacing:.02em}
  .foot .right{color:rgba(var(--fg),.62); font-weight:400; text-align:right}
  .note{
    position:relative; z-index:2; margin-top:${mm(4)}px;
    font-size:${mm(4)}px; line-height:1.45; color:rgba(var(--fg),.5);
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
    color:rgba(var(--fg),.6); max-width:${mm(140)}px;
  }
  /* When there is no headline the sub follows the lockup directly and needs
     the gap the headline would otherwise have carried. */
  .cover-mark + .cover-sub{margin-top:${mm(22)}px}
  /* Sits at the foot, above the accent bar - the fact people photograph. */
  .cover-foot{
    position:absolute; left:${SAFE}px; bottom:${mm(FOOT_MM)}px; z-index:2;
    font-size:${mm(4.6)}px; font-weight:500; letter-spacing:.02em;
    color:rgba(var(--fg),.72);
  }
`;

const row = (it) => `<div class="row">
    <div>
      <div class="name">${it.name}${it.badge ? `<span class="badge">${it.badge}</span>` : ""}</div>
      ${it.note ? `<div class="item-note">${it.note}</div>` : ""}
    </div>
    <div class="price">${naira(it.price)}${it.unit ? `<span class="unit">${it.unit}</span>` : ""}</div>
  </div>`;

const card = (it) => `<div class="card">
    <div class="name">${it.name}</div>
    ${it.note ? `<div class="item-note">${it.note}</div>` : ""}
    <div class="price">${naira(it.price)}</div>
  </div>`;

const section = (s) =>
    !s.items.length
        ? ""
        : `<div class="section">
  ${s.title ? `<div class="section-title">${s.title}</div>` : ""}
  ${s.cards ? `<div class="cards">${s.items.map(card).join("\n  ")}</div>` : s.items.map(row).join("\n  ")}
</div>`;

const page = (cls, body, m = metrics(1)) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_HREF}" rel="stylesheet">
<style>:root{${vars(m)}}${CSS}</style></head><body class="${cls}">
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
${l.sections.map(section).filter(Boolean).join("\n")}
</div>
${l.note ? `<p class="note">${l.note}</p>` : ""}`;

const coverBody = (l) => `<div class="dots"></div>
${watermark()}
<div class="cover-mark">${mark(l.lockup, mm(30))}</div>
${l.cover.headline ? `<h1 class="cover-headline">${l.cover.headline}</h1>` : ""}
<p class="cover-sub">${l.cover.sub}</p>`;

let warnings = 0;

for (const l of LISTS) {
    const d = density(l);
    fs.writeFileSync(path.join(OUT, "html", `${l.file}.html`), page("", listBody(l), d.m));

    const live = l.sections.filter((s) => s.items.length);
    const rows = live.reduce((n, s) => n + s.items.length, 0);
    const names = live.map((s) => s.title || "untitled").join(" + ");
    console.log(
        `template  ${l.file}.html  ${rows} rows in ${live.length} section(s) [${names}]` +
        `  density ${d.k.toFixed(2)}  ${Math.round(d.height)}mm into ${Math.round(d.space)}mm`
    );

    // Read this after changing a list.
    for (const [label, key, cap] of [
        ["price", "price", METRIC.capFigure],
        ["name ", "name", METRIC.capBody],
        ["note ", "note", METRIC.capBody],
    ]) {
        const size = d.m[key];
        console.log(
            `    ${label}  ${size.toFixed(1)}mm  cap ${(size * cap).toFixed(1)}mm` +
            `  reads at ~${readDistance(size, cap).toFixed(2)}m`
        );
    }

    for (const s of l.sections) {
        if (!s.items.length) {
            warnings++;
            console.log(`  ! section "${s.title || "untitled"}" has no items - skipped`);
        }
    }
    if (d.cramped) {
        warnings++;
        console.log(
            `  ! squeezed to ${d.k.toFixed(2)} to fit ${rows} rows - below the ${DENSITY_COMFORT}` +
            ` comfort floor, so names now resolve at only` +
            ` ~${readDistance(d.m.name, METRIC.capBody).toFixed(2)}m.` +
            ` Nothing is clipped, but this sheet wants fewer rows or a second page.`
        );
    }
    if (d.overflows) {
        warnings++;
        console.log(
            `  !! list is still ~${Math.round(d.height - d.space)}mm too tall at the hard` +
            ` ${DENSITY_MIN} floor. Content WILL be clipped - the footer band and the` +
            ` closing note go first. Do not print this; split the sheet.`
        );
    }

    if (l.cover) {
        fs.writeFileSync(path.join(OUT, "html", `${l.file}-front.html`), page("cover", coverBody(l)));
        console.log(`template  ${l.file}-front.html  cover`);
    }
}

console.log(`\n${LISTS.length} lists written to ${path.join(OUT, "html")}`);
console.log(`page ${PAGE_W}x${PAGE_H}px = A4 210x297mm trim + ${BLEED}mm bleed @ ${DPI}dpi`);
console.log(`figures ${FIGURE.family} ${FIGURE.weight} (₦ included) · body ${BODY.family}`);
if (warnings) console.log(`${warnings} warning(s) above - read them before printing.`);
