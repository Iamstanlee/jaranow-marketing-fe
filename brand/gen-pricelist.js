/* Jaranow — printed price list.
   Emits one HTML page per list; rasterize-pricelist.sh turns them into 300dpi
   PNGs. Body type is Rubik (the site face); prices are set in Archivo 900,
   which matches the Archivo Black of the signs and the flyer but, unlike it,
   actually has a naira sign - see FACES below. Both are pulled from Google
   Fonts at render time. The lockups are the real brand SVGs, inlined.

   A4 portrait, 210x297mm trim + 3mm bleed, at 300dpi:
     trim  2480 x 3508 px
     bleed 2551 x 3579 px  <- the emitted page size
   Content sits 12mm inside the trim. Intended to be printed and laminated for
   the forecourt wall or the counter - a sheet you walk up to and stand in front
   of, not a poster. On a short list the names resolve at about 0.75m and the
   figures at about 0.9m; the generator prints the actual figures per sheet, and
   they fall as rows are added. See gen-sign.js if you need something
   road-legible.

   WHAT TO EDIT: the LISTS array. Services and prices are data, not markup - a
   new service is a row in `items`, a new section is an entry in `sections`, a
   new list is an entry in LISTS. Nothing below LISTS should need touching to
   change what a list says.

   Prices are stated as plain fact here. Do not add persuasion around them
   ("best value", "no hidden fees", comparisons) - see the brand positioning
   note in CLAUDE.md. A `badge` is a category marker, not a sales line: it says
   which tier a row belongs to, it does not argue for it.

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

/* ---------------------------------------------------------------------------
   FACES

   Body copy is Rubik. Figures are Archivo at weight 900 - so the number is the
   loudest thing in a row, which is what a price list is for.

   WHY NOT ARCHIVO BLACK, which is what the roadside panels and the A5 flyer
   set their headlines in: Archivo Black has NO naira glyph. Google serves it
   with the standard latin-ext unicode-range (which claims U+20A0-20AB), but the
   font file only carries U+20A3 U+20A4 U+20A7 - no U+20A6. Set "₦2,000" in
   Archivo Black and the browser silently falls back for that one character, so
   the symbol arrives from whatever is next in the stack. On a sheet whose whole
   job is naira figures, that is the wrong face.

   Archivo 900 is the same superfamily from the same foundry, it carries ₦, and
   it is a metric match rather than merely a near one - measured off the font
   files:

     digit advance   0.667em both          <- identical, so figures set the same
     stem width (I)  0.221em both          <- identical, so the colour matches
     cap height      0.688 vs 0.686        <- 0.3% apart
     x-height        0.528 vs 0.526

   So this is the same figure the signs draw, with a naira sign. Because the
   face now covers the whole string there is no split span and no size trick:
   the ₦ is simply part of the price.

   Archivo is a VARIABLE font - ask for wght 900 explicitly. (Archivo Black, by
   contrast, ships one weight, 400; that is why the two are numbered so
   differently for the same colour.)
--------------------------------------------------------------------------- */
const BODY = {family: "Rubik", stack: "'Rubik',system-ui,sans-serif"};
const FIGURE = {
    family: "Archivo",
    weight: 900,
    /* Rubik is the fallback rather than system-ui so that anything Archivo is
       missing lands on the other brand face, not on Helvetica. */
    stack: "'Archivo','Rubik',system-ui,sans-serif",
};
const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=Archivo:wght@900&display=block";

/* ---------------------------------------------------------------------------
   THE LISTS — this is the input to the design.

   Each list emits the price page (`<file>.html`). If it also carries a `cover`,
   it emits a matching front (`<file>-front.html`) - a cover sheet to sit ahead
   of the prices, same construction as the pocket cards' front/back. A list with
   no `cover` is prices-only.

   list:
     file     output basename (price page; the front adds `-front`)
     lockup   sub-brand lockup SVG (white, knockout - the page is Ink)
     kicker   small line under the lockup
     sections [{ title?, items }]  - title is optional; one untitled section
                                     reads as a plain list. A section with no
                                     items is skipped (and warned about), so a
                                     section can be stubbed before its prices
                                     are confirmed without emitting a heading
                                     with nothing under it.
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
     badge    optional short marker set in a pill beside the name, e.g.
              "Premium". Names the tier; it is not a sales line.

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
                title: "Car",
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
                        price: 25000,
                        badge: "Premium",
                    },
                ],
            },
            {
                title: "Rug",
                items: [
                    {name: "Small rug", note: "Up to 3ft · bedside or centre rug", price: 10000},
                    {name: "Medium rug", note: "Up to 5ft · large bedside or centre rug", price: 15000},
                    {name: "Large rug", note: "Over 7ft · sitting room size rug", price: 20000},
                ],
            },
        ],
        footer: {left: "", right: ""},
        note: "We treat every car like it's the only one we're washing today.",
        cover: {
            sub: "Exterior, full and vacuum washes - done properly.",
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
                    /* "Gown" is what a dress is called here; the rest already
                       read the same in Nigerian English. The item lists are
                       unchanged in scope - only the words differ, so nothing
                       moves between the regular and special bands. */
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
        footer: {left: "Pickup and delivery", right: "48-hour turnaround"},
        note: "Pickup windows: Tuesday & Saturday (Lite) · Tuesday, Thursday & Saturday (Premium).",
        cover: {
            sub: "Picked up, cleaned and returned within 48 hours.",
        },
    },
];

/* ---------------------------------------------------------------------------
   Type metrics, measured from the actual font files rather than guessed. Used
   only by the fit solver below - nothing here changes what the page looks like,
   it changes what the generator can tell you about it.
--------------------------------------------------------------------------- */
const METRIC = {
    /* Rubik 400, average advance per character over the confirmed note and
       footnote strings. Good enough to predict a wrap, not a kerning table. */
    bodyAdvance: 0.47,
    /* Archivo 900 figures are tabular: every digit is 0.667em, comma 0.333em.
       The naira sign is wide - 0.873em, appreciably more than a digit - so it
       has to be measured rather than approximated, or the price column comes
       out narrower than it prints. */
    digit: 0.667,
    comma: 0.333,
    naira: 0.873,
    /* Cap height as a fraction of font size, read off the font files. The two
       faces are within 2% of each other, which is why a price can sit beside a
       name at different sizes and still look aligned. Used for the legibility
       table - swap a face without swapping its ratio and the table lies. */
    capBody: 0.7,
    capFigure: 0.686, /* Archivo 900 */
};

/* Base sizes in mm, at density 1. The solver scales this block - and only this
   block - so the header, footer and lockup stay identical across sheets and the
   family still reads as one thing.

   Split into `type` and `space` on purpose: they do NOT shrink at the same
   rate. See metrics() below. */
const BASE = {
    type: {name: 9, note: 4.4, price: 11, unit: 4.6, badge: 3.4, title: 4.4},
    space: {rowPad: 6, gap: 16},
};

/* Two thresholds, not one, because "too small" and "unprintable" are different
   problems and only one of them is a disaster.

   COMFORT is the density below which the sheet stops being as legible as it
   should be: at .70 the name is ~6.3mm (cap 4.4mm, comfortable at about half a
   metre). Going under it is a real cost and gets a loud warning.

   MIN is the hard stop. Between the two the solver keeps shrinking rather than
   letting content overflow, because clipping is strictly worse than small type:
   the page is overflow:hidden and the list is followed by the footer band, so
   an overlong list does not lose its own last row first - it silently throws
   away the address, the opening hours and the closing note, which are the whole
   reason someone photographs the sheet. Small type is a compromise; a sheet
   with no address on it is wastepaper. */
const DENSITY_COMFORT = 0.7;
const DENSITY_MIN = 0.45;

/* The repo's sizing rule, from gen-sign.js: about 25mm of cap height per 3m of
   comfortable reading. Held here so the price list reports its read distance in
   the same units the signs do. */
const readDistance = (sizeMm, capRatio) => (sizeMm * capRatio * 3) / 25;

/* Type shrinks with k; air shrinks with k squared.

   This is the whole trick. When a list is too long the first thing to give up
   is whitespace, not legibility - halving the gap between rows costs a reader
   nothing, and dropping the name from 9mm to 6mm costs them the sheet. Scaling
   both together (the obvious thing) spends most of the squeeze on padding the
   reader cannot see anyway, and still lands the type smaller than it needed to
   be. Squaring the spacing term buys back roughly a millimetre of name on a
   full sheet.

   It also makes the height non-linear in k, which is why the solver bisects
   rather than dividing. */
const metrics = (k) => ({
    ...Object.fromEntries(Object.entries(BASE.type).map(([n, v]) => [n, v * k])),
    ...Object.fromEntries(Object.entries(BASE.space).map(([n, v]) => [n, v * k * k])),
});

/* ₦ lives at U+20A6, which Google Fonts serves in the latin-ext subset of both
   Rubik and Archivo. If a render comes back with a box or a mismatched glyph,
   the subset did not load - check the network, do not swap the symbol for "N".
   A ₦ that arrives noticeably lighter than the digits beside it means Archivo
   failed and Rubik caught the fallback. */
const naira = (n) =>
    typeof n === "number" ? `${n.toLocaleString("en-NG")}` : n;

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

/* ---------------------------------------------------------------------------
   THE FIT SOLVER

   The page is fixed-height with overflow:hidden, so a list that outgrows its
   box does not make the sheet taller - it silently slides under the accent bar,
   and nothing in the output says so. That failure mode has bitten every print
   piece in this repo, so here it is solved rather than eyeballed: estimate the
   natural height of the list in mm, compare it to the space between the header
   and the footer, and scale the row block to fit.

   Everything in BASE scales linearly, so the natural height scales linearly too
   and the density is just a ratio. Adding a row therefore re-tightens the sheet
   on its own - no hand-tuning when the rug prices land.

   These are estimates. They exist to catch an overflow, not to replace looking
   at the PNG - always eyeball the output.
--------------------------------------------------------------------------- */

/* Width of the price column in mm at the given metrics - needed to know how
   much room the name and note actually have, and therefore whether a note
   wraps. */
function priceWidth(it, m) {
    const s = naira(it.price);
    const digits = (s.match(/\d/g) || []).length;
    const commas = (s.match(/,/g) || []).length;
    /* Anything that is not a digit, comma or ₦ is set in Archivo too, and is
       body-ish copy, so measure it at the body advance. */
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
        for (const it of s.items) {
            let row = m.rowPad * 2 + m.name * 1.15;
            if (it.note) {
                /* A badge steals width from the name, not from the note, so it
                   does not enter the wrap estimate. */
                const w = it.note.length * METRIC.bodyAdvance * m.note;
                const lines = Math.max(1, Math.ceil(w / nameW));
                row += 2 + m.note * 1.4 * lines;
            }
            h += row;
        }
    }
    return h;
}

/* The space the list gets: the page, less its padding, less the header block
   and the footer band. Header and footer do not scale, so this is a constant
   per list (it only varies on whether the list carries a `note`). */
function listSpace(l) {
    const content = 297 + BLEED * 2 - SAFE_MM - FOOT_MM;
    const header = 26 + 9 + 4.6 * 1.25 + HEAD_GAP; // lockup + kicker + the gap below it
    let foot = 6 + 5 * 1.3; // border padding + footer line
    if (l.note) foot += 4 + 4 * 1.45;
    return content - header - foot;
}

/* Largest k in [FLOOR, 1] whose list still fits. Height is monotonic in k, so
   30 rounds of bisection lands well inside a tenth of a millimetre. */
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

/* The scaled block, emitted as custom properties so one stylesheet drives every
   sheet at whatever density it needs. */
const vars = (m) =>
    Object.entries(m)
        .map(([key, v]) => `--${key}:${mm(v)}px`)
        .join(";");

const CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden}
  body{
    background:${INK}; color:${PAPER};
    font-family:${BODY.stack};
    position:relative;
    display:flex; flex-direction:column;
    /* Bottom clears the accent bar as well as the bleed. */
    padding:${SAFE}px ${SAFE}px ${mm(FOOT_MM)}px;
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
    text-transform:uppercase; color:rgba(242,245,251,.5);
    padding-bottom:${mm(4)}px; margin-bottom:${mm(2)}px;
    border-bottom:${mm(0.3)}px solid rgba(242,245,251,.16);
  }
  .row{
    display:flex; align-items:baseline; justify-content:space-between;
    gap:${mm(10)}px;
    padding:var(--rowPad) 0;
    border-bottom:${mm(0.3)}px solid rgba(242,245,251,.10);
  }
  .row:last-child{border-bottom:none}
  .name{font-size:var(--name); font-weight:500; line-height:1.15}
  /* Sized to hold the longest confirmed note ("Suits, long dresses, towels,
     duvet sets, curtains") on one line against the price column. */
  .item-note{
    font-size:var(--note); font-weight:400; line-height:1.4;
    color:rgba(242,245,251,.56); margin-top:${mm(2)}px;
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
    color:rgba(242,245,251,.56);
  }

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
    position:absolute; left:${SAFE}px; bottom:${mm(FOOT_MM)}px; z-index:2;
    font-size:${mm(4.6)}px; font-weight:500; letter-spacing:.02em;
    color:rgba(242,245,251,.72);
  }
`;

const row = (it) => `<div class="row">
    <div>
      <div class="name">${it.name}${it.badge ? `<span class="badge">${it.badge}</span>` : ""}</div>
      ${it.note ? `<div class="item-note">${it.note}</div>` : ""}
    </div>
    <div class="price">${naira(it.price)}${it.unit ? `<span class="unit">${it.unit}</span>` : ""}</div>
  </div>`;

/* An empty section emits nothing - see the `sections` note in LISTS. */
const section = (s) =>
    !s.items.length
        ? ""
        : `<div class="section">
  ${s.title ? `<div class="section-title">${s.title}</div>` : ""}
  ${s.items.map(row).join("\n  ")}
</div>`;

/* Shared page shell - the font links and the wrapping html are identical for
   the price page and the front, so only the body class, the density and the
   content differ. */
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

    /* What the reader actually gets, in the same units gen-sign.js reports.
       Read this after changing a list - it is the whole point of the solver. */
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
