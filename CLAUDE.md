# Jaranow Marketing Website — Claude Context

Marketing site for Jaranow: home (`/`), car wash (`/carwash`), laundry
(`/laundry`), pricing (`/pricing`), pitch deck (`/pitch-deck`), internal books
app (`/__/book`).

## Tech stack

React 18 + TypeScript (CRA) · React Router v7 · Tailwind · Framer Motion ·
React Hook Form · React Helmet Async · Lucide · Axios.

```bash
npm start   # dev server
npm run build
npm test
```

## Structure

```
src/
├── components/
│   ├── common/    # Header, Footer, OptimizedImage, PreloadImages
│   ├── home/  carwash/  wash/     # "wash" = laundry; folder predates the rename
├── pages/         # Home, CarwashLanding, WashLanding, WashRecommendation, Deck, Pricing
├── seo/           # routes.json + SeoTags.tsx
└── App.tsx        # routing, lazy-loaded pages

brand/             # identity system — see brand/BRAND-STANDARD.md
public/brand/      # logo SVGs served by the site
docs/              # staff documents (HTML) + rasterize-docs.sh — see "Staff documents"
scripts/           # prerender-meta.js
```

**Adding a page:** component in `src/pages/`, lazy route in `App.tsx`, entry in
`src/seo/routes.json`, render `<SeoTags route="/new" />`.

## Conventions

- TypeScript throughout; type your props.
- Lazy-load pages with `React.lazy()`.
- Mobile-first; test at sm/md/lg/xl.
- Semantic HTML and real ARIA labels.

### Header and Footer

One shared `Header`/`Footer` for every page (no per-service Navigation).
`Header` props: `ctaLabel`, `onCtaClick`/`ctaTo`, `logo`.

`logo` selects the lockup: `'master' | 'carwash' | 'laundry'` (default
`master`). Service pages pass their own line; homepage, pricing and anything
cross-service use master. A fourth line is one entry in the `LOGOS` map plus the
SVG in `public/brand/`.

Header logo heights differ per variant **on purpose** (`h-11` master, `h-14`
sub-brand) so the `jaranow` wordmark stays the same optical size. Do not
normalise them.

### Styling

Tailwind. Primary Blue `#2563eb`, Ink `#0E1526`, Paper `#F2F5FB` — blue-biased
neutrals, not plain grey.

### Animation

Motion is deliberately limited. **Do not reintroduce scroll-reveal animation.**
Keep motion only for hero entrances (`components/{home,carwash,wash}/Hero.tsx`),
`whileHover`/`whileTap` on buttons and cards, and `AnimatePresence` + `exit` for
the mobile menu, accordions and multi-step forms.

`whileInView`/`viewport` reveals were removed across all content sections.
Content stuck at `initial` opacity is the failure mode to watch for.

## SEO

**Per-route metadata lives in `src/seo/routes.json` — edit it there and nowhere
else.** Two consumers read it:

1. `src/seo/SeoTags.tsx` — `<SeoTags route="/carwash"/>` rendered by each page;
   handles title, description, canonical, OpenGraph and Twitter at runtime.
2. `scripts/prerender-meta.js` — runs after `react-scripts build`, writing one
   static HTML file per route (`build/carwash/index.html`) with tags baked in.

**Why prerendering exists:** this is a client-rendered CRA SPA, so
`react-helmet-async` only sets the head once JS runs. Facebook, WhatsApp,
Twitter and LinkedIn crawlers don't run JS. Every route used to be served the
same `public/index.html`, so every share preview fell back to the homepage's
tags. **Adding tags to a page's `<Helmet>` alone will not fix a broken share
preview.**

Four fields are handled by the prerender step only (head plumbing, not social
metadata, so `SeoTags` ignores them): `manifest`, `themeColor`,
`appleTouchIcon`, `noindex`. Each *replaces* the tag inherited from
`public/index.html`, for that route only.

**A route that installs as its own PWA must set `manifest`** — `/__/book` does.
Swapping `<link rel="manifest">` from a React effect is too late: the browser
reads the manifest as the document loads, so an install captured before the swap
gets `/manifest.json`, whose `start_url` is `/`, and the installed app launches
on the marketing homepage. The effect in `Bookkeeping.tsx` only covers
client-side navigation into the route. Changing a `start_url` does not fix an
already-installed app — it must be uninstalled and reinstalled.

`vercel.json` has a catch-all rewrite to `/index.html`; Vercel checks the
filesystem *before* rewrites, so prerendered files win and everything else falls
through to the SPA. Verify with:

```bash
npm run build && npx serve build
curl -A facebookexternalhit http://localhost:3000/carwash | grep og:
```

Page-specific JSON-LD stays in the page's own `<Helmet>`; keep it in sync with
the visible page. `theme_color` is `#2563EB` in both `manifest.json` and
`wash-manifest.json` — keep them in step with the accent.

`public/_redirect` is an inert leftover (singular, so never valid even on
Netlify). Ignore it.

## Staff documents

`docs/` holds the documents staff read, as HTML rather than Markdown because they
are published as Artifacts and printed:

| Document | File |
|---|---|
| Employee Handbook — work rules, offences and sanctions, revenue sharing | `employee-handbook.html` |
| Attendant Guide | `attendant-guide.html` |
| Cashier Guide | `cashier-guide.html` |

They share one token set with the print pieces (Ink / Paper / accent, Archivo
Black over Rubik), so a document and a wall sheet read as the same brand.

**These are Artifact sources**, so they carry no `<!doctype>`, `<head>` or
`<body>` — the Artifact host supplies that skeleton at publish time. Each file is
published to a fixed URL; to update one, edit the file and republish **passing
that artifact's URL**, or a new publish silently creates a second artifact and the
link already in circulation keeps showing the old version.

The handbook is a signed document: the acknowledgement is against the version in
its masthead and footer, so bump both whenever a rule or a fine changes — people
who signed the old one need to sign the new one.

```bash
docs/rasterize-docs.sh                    # every docs/*.html -> docs/pdf/
docs/rasterize-docs.sh employee-handbook  # just one
```

A4 with a 14×16mm margin (`PAGE_SIZE` / `PAGE_MARGIN` override). Output is
gitignored — regenerate rather than commit. Like the brand rasterizers this pulls
Rubik and Archivo Black from Google Fonts and so needs network; unlike them it
**checks the finished PDF for embedded faces and fails the run** if the fonts did
not load, because a silent fallback to system sans is otherwise invisible in a
PDF.

Loyalty card serials in the cashier guide are `LOY-001…`, matching `SERIAL` in
`brand/gen-card.js`. Keep the two in step.

---

## Brand identity

**`brand/BRAND-STANDARD.md` is the authority.** Read it before touching any
logo, lockup or brand colour.

Direction "Drop": custom-drawn `jaranow` wordmark + abstract water-drop symbol.
The wordmark is **drawn geometry, not a font** — never re-set it in a typeface.

**The letterforms are a small alphabet, not a font.** `gen-marks.js`'s glyph
table carries only what the assets need — `jaranow`, the service names, and the
carwash address. Setting anything else means *drawing* the missing glyphs on the
documented construction (coordinates are stroke centres, every curve radius 14).
See BRAND-STANDARD §2.1, including the inherited quirk to preserve: straight
stems end at y=100 and overhang to 107, curved bottoms stop at 93.

Live assets served from `public/brand/`: `jaranow-logo-white.svg` (master
knockout), `jaranow-logo.svg` (master duo), `jaranow-carwash-white.svg`,
`jaranow-laundry-white.svg`, `jaranow-symbol.svg`, `favicon.svg`.

Sub-brand rule: service name under the wordmark, flush left, 40%, tracked wide —
read as "Laundry by Jaranow"; the word "by" is never drawn. Symbol minimum 24px;
the favicon build uses a tighter crop to hold the counter open at 16px. App icon
and favicon builds are **not** interchangeable. Flat only: no gradients,
shadows, bevels or outlines on the mark.

### Generated assets

Everything below is **generated, not hand-drawn**. Copy and geometry live in a
data array at the top of each script; the HTML and PNGs are build output and a
hand edit is silently overwritten on the next run.

| Piece | Script + rasterizer | Output | Data |
|---|---|---|---|
| Marks, lockups | `gen-marks.js` | `jaranow-blue/svg/` | glyph table |
| OG share cards | `gen-og.js` · `rasterize-og.sh` · `sync-og.sh` | `public/{jaranow,carwash,wash}/` | `CARDS` |
| Pocket cards | `gen-card.js` · `rasterize-card.sh` | `card/png/` | `CARDS`, `ACCOUNT`, `SERIAL` |
| Price lists | `gen-pricelist.js` · `rasterize-pricelist.sh` | `pricelist/png/` | `LISTS` |
| A5 flyer | `gen-flyer.js` · `rasterize-flyer.sh` | `flyer/png/` | `FLYERS` |
| Recruitment posters | `gen-poster.js` · `rasterize-poster.sh` | `poster/png/` | `JOBS`, `FORMATS` |
| Roadside signage | `gen-sign.js` · `rasterize-sign.sh` | `sign/png/` | panels, `SERVICES` |
| Wash-bay banners | `gen-bay.js` · `rasterize-bay.sh` | `bay/png/` | `BAY`, zones |
| No-parking notices | `gen-noparking.js` · `rasterize-noparking.sh` | `noparking/png/` | `COPY` |
| Tee mockups | `gen-tee.js` · `rasterize-tee.sh` | `tee/png/` | `CHEST_UNITS` |
| Book app icon | `gen-appicon.js` · `rasterize-appicon.sh` · `sync-appicon.sh` | `public/book/` | `sizes.txt` |

Regenerate marks with `node gen-marks.js blue jaranow-blue`. Every other piece
is `node brand/gen-X.js && brand/rasterize-X.sh`.

**Rules that apply to every generated piece:**

- **Rasterizing needs network** — Rubik and Archivo Black are pulled from Google
  Fonts at render time. A failed load silently falls back to system sans. The ₦
  (U+20A6) comes from the latin-ext subset and is where it shows first. Always
  eyeball the PNGs afterwards.
- **Pages are fixed-size with `overflow:hidden`.** Copy that outgrows its box is
  clipped, or slides under the accent bar, rather than making the page taller.
  Read the legibility table a script prints after changing any size.
- **Print pieces are 300dpi with 3mm bleed**; hand PNGs to the printer as-is,
  they add crop marks at the trim line. **Large format is 2px/mm (~51dpi)**,
  which is correct for the viewing distance — do not "fix" it to 300dpi.
- **Scripts emitting several canvas sizes write a `sizes.txt` manifest**; the
  rasterizer reads it rather than hardcoding a window size.
- **Headless Chrome will not open a window below ~500px or above ~16,384px.**
  Below, it silently screenshots a crop of a larger viewport — so render big and
  resample (`gen-appicon.js`). Above, author at half scale and shoot with
  `--force-device-scale-factor=2` (the `dsf` column in `sizes.txt`, used by the
  40ft bay back wall). Dropping the `dsf` column silently halves resolution.
- **Type is sized from viewing distance, not by eye** — roughly 25mm of cap
  height per 3m of comfortable reading.

### Per-piece constraints

**OG cards.** `sync-og.sh` holds the generated-name → served-path mapping (names
differ, e.g. `opengraph-laundry.png` → `public/wash/opengraph.png`); keep it in
step with `ogImage` in `src/seo/routes.json`. Headline caps at `15ch` — watch
for orphaned words.

**Pocket cards.** 85×55mm trim + 3mm bleed, so both share one press setup. The
accent bar must be *taller* than the bleed or the cut removes all of it. Bank
details live in `ACCOUNT`; a 10-digit NUBAN is auto-grouped 3-3-4 for reading
aloud.

*Loyalty card — six slots: five stampable, then the reward.* The offer is
**5 points = 1 free wash**, so slots 1–5 get stamped and the sixth (accent
filled, carrying the drop) is the free wash those points buy, never stamped.
Drop a numbered slot and the card silently becomes "buy 4, get the 5th free".
The free wash is the **sixth** visit — never write copy promising a free *fifth*
wash.

Cards carry a printed serial (`LOY-001`…, from `SERIAL`), so there is no
write-in field. It is a handle for the ledger, not an enforcement mechanism —
whoever holds the ledger is the actual system.

```bash
node brand/gen-card.js --batch=100       # LOY-001..LOY-100
node brand/gen-card.js --batch=101-200   # the next run
brand/rasterize-card.sh batch            # -> card/batch/png
```

`--batch` takes a count (starting at 1) or an **inclusive range**. Use the range
form on every run after the first: regenerating from 1 reissues serials already
in customers' hands and puts two people on one balance. The generator prints the
next run's flags after each batch — copy that. It also wipes `card/batch/` first,
so copy an earlier run out before generating the next. Past `SERIAL.pad` digits
serials get wider and the run mixes widths; the generator warns.

Only the **back** varies — every front is identical, so the press runs one static
front and N variable backs. Output directory is an optional first argument
defaulting to `brand/card`, which is where the rasterizer looks.

**Price lists.** A4 portrait, for laminating at the forecourt or counter. `price`
takes a number (grouped, ₦-prefixed) or a string printed verbatim; `unit` and
per-item `note` are optional, as is a section `title`. Keep figures in step with
`/pricing` and "Pricing information" below — a laminated sheet outlives a deploy.

A list may carry a `cover` (`{ headline, sub }`), which emits a matching front
sheet as `<file>-front.png`. The cover sells on **care and detail, never price**,
and its foot reuses `footer.left` — don't repeat the address in `sub`.

Two things that look like bugs and are not: the list block is centred between
header and footer, so a two-row card sits with a lot of air around it; and the
drop watermark bleeds off the **right edge only** on the price page (crop it top
or bottom too and only the tip stays, reading as a triangular smudge).

**A5 flyer.** **It sells Jaranow, and it is general** — the same sheet must work
handed over at the desk, at the market, through a door, or left on a counter, so
nothing on it may be true of only one place, campaign or day. A market-specific
pitch was removed deliberately; re-adding a campaign line is a regression, and
something that specific wants its own entry in `FLYERS`.

**No prices, and no service list.** It sells *how the work is done* — a headline,
one sentence, three `points` about the care taken. It used to carry the wash
types with inclusions, which is a price list with the figures removed. The wash
types and figures live on the laminated wall list and `/pricing`, where someone
who has already decided goes looking; this sheet's job is to make them want to
come at all. **The flyer is therefore not one of the places the carwash services
must stay in step.**

Headline and WhatsApp number are **Archivo Black** — the face the roadside panels
use for `CAR WASH`, so the sheet in a hand and the sign they drove past read as
one thing. A5 has a third of A4's area: a fourth point, a second line of `sub`,
or a three-line headline pushes the closing note under the bar.

**Recruitment posters.** One sheet, three canvases: `a4` 2551×3579 (print),
`feed` 1080×1350 (Meta 4:5 — the one to run if you run one), `story` 1080×1920
(Stories/Reels). Every format is authored in one design-mm space 216mm wide and
rendered at its own px/mm.

A posting is `role`, optional `blurb`, the `meta` chip row, optional `pay`, the
bulleted `sections`, and the `apply` band. **Keep it short** — what ships is one
section of three bullets, no blurb, one contact. The first draft carried two
sections of four and read as a busy job spec.

Per-format knobs: `type` multiplies every type size (a4 1.18, feed 1.12, story
1.32 — a phone reads a 1080px image at a fraction of its size); `cols` sets
section columns (story uses 1). `story` carries big `padTop`/`padBottom` to clear
Meta's UI. Print pins an exact `pxH` because rounding 216mm to a whole 2551px
loses half a pixel.

4:5 runs out of room first — if you grow a posting, that is where it breaks and
its `type` has to come back toward 1. Chip values never wrap by design, so keep
them short ("6th Avenue, Gwarinpa" is about the longest that works on 9:16).
Three chips sit in a row; four go 2×2. `pay` is optional and printed verbatim in
accent (carwash roles: ₦50,000–70,000/month). **Do not print a wage, shift
pattern or benefit that has not been confirmed** — a sheet on a wall outlives the
conversation that set it. Meta throttles text-heavy creative; pair these with
short primary text rather than adding copy to the image.

**Roadside signage.** 21 panels — seven layouts × three grounds, each plus 20mm
bleed (a fabrication allowance, not a proportion). The last four are alternative
treatments of one XL sheet, **not a set to print together**; a site gets one.

| ground | field | band | lockup |
|---|---|---|---|
| `ink` | Ink | accent | `-white` |
| `blue` | accent | Ink | `-white` |
| `paper` | Paper | accent | `-duo` |

Lockup colourway and watermark opacity are **per ground** — a knockout mark
vanishes on a light field, and .04 that ghosts on Ink is invisible on Paper. Per
§8.8 dark grounds take `-white`, light take `-duo`; the accent colourway never
sits on a dark ground. Prefer Ink in direct sun; Paper for under cover or against
a dark wall.

| layout | trim | headline | reads at |
|---|---|---|---|
| portrait | 900×1800mm | 230mm, stacked `CAR / WASH` | ~20m |
| landscape | 2400×1200mm | 300mm, one line | ~26m |
| landscape-minimal | 2400×1200mm | 355mm, one line | ~31m |
| landscape-minimal-xl | 4800×2400mm | 1130mm, stacked | ~98m |
| ...-xl-split | 4800×2400mm | 810mm, stacked in a 60% column | ~70m |
| ...-xl-band | 4800×2400mm | 730mm, one line under a band | ~63m |
| ...-xl-block | 4800×2400mm | 920mm, `CAR` on field / `WASH` knocked out | ~79m |

The two orientations are **not the same design scaled**. Portrait is
width-constrained so the headline stacks; landscape has room for one line *and*
larger. Prefer landscape where the site allows.

`landscape-minimal` is the lockup and `CAR WASH` and nothing else — a different
job, not a stripped panel. Use full landscape where people are stopped or walking
and can read a phone number, this one where they are driving. Dropping those
lines is what pays for the size, and they resolved at ~7m anyway. The dot field,
drop and accent bar stay: they are construction, not content.

`landscape-minimal-xl` is for a gantry, wall or hoarding. Scaling the smaller
panel was the first cut and wasted what the size buys, so **the headline is the
panel**: `CAR / WASH` stacked flush left, lockup reduced to a signature, no drop
(`edge: true`). Sizes are solved from measured Archivo Black widths — `CAR WASH`
5.960× its font size, `CAR` 2.319×, `WASH` 3.313×. One line would be width-bound
at 765mm; stacking removes the width bind and makes it height-bound, giving
1130mm. Stacking is worth ~37m here, the *opposite* of portrait. `WASH` fills 82%
of content width, ragged right by design — do not track the lines to justify both
edges, since `CAR` needs ~200mm of letter-spacing and that opens the counters at
exactly the distance the panel exists for. The lockup is 640mm because below ~600
it looks forgotten, and every millimetre above comes off the type.

Three alternative XL treatments, selected per panel with `style`. Choose on the
site, not on taste:

| style | what it is | pick it when |
|---|---|---|
| `edge` | headline fills the sheet, lockup a signature | distance is everything (~98m) |
| `split` | type in a 60% column, solid drop anchoring the right | seen obliquely or in passing — the only one recognisably Jaranow with the type covered. Costs ~28m |
| `band` | full-bleed accent band holding the lockup, one line below | the sign competes with others — 440mm of blue across 4.8m reads before any letter. Weakest at distance (~63m) |
| `block` | `CAR` on field, `WASH` knocked out of a full-bleed block | boldest graphic without giving up much distance (~79m) |

Gotchas in those: `split`'s drop is the **only** build where the symbol is not
cropped (a cropped drop reads as a watermark; here it must read as an object),
and its opacity derives from the ground's `wmOpacity` × 4. `band`'s lockup is
always `-white`, never `g.lockup` — that variable is the colourway for the
*field*, and on paper it disappears against the band. `block` has **no accent
bar**: the block is the bar grown until it holds type, and two accent edges make
the sheet a sandwich; its `CAR` sits hard against the block so the colour boundary
falls inside one headline. The bottom-weighted result is deliberate.

The drop is sized off the panel (`h*1.25`, cropped `w*.125` past the right edge)
rather than hardcoded, and the dot field takes a per-panel `dot: {pitch, size}`
override (60/3.0 on XL, not a doubled 68 — doubling is optically identical at
twice the distance, but this panel is walked past too, and at 68mm the field
reads as discs rather than texture).

`CAR WASH` is **Archivo Black**, not Rubik — at 20m what carries is stroke weight
and letter width, and Rubik 700 is a text bold. Everything else stays Rubik. This
is not a wordmark substitution (§8.1): the lockup beside it is the drawn SVG.
Each face carries its own `capRatio`, because the legibility table is computed
from it — swapping the face without the metric silently reports wrong distances.

Two things the distance discipline caught, worth preserving: the `carwash` line
inside the lockup is only ~30mm cap (≈3.6m), so the lockup says *who* but not
*what* at road distance and `CAR WASH` must be the headline in its own right; and
unstacking portrait's headline costs ~8m of range.

`SERVICES` is **grouped rather than flat** because panels have different room:
portrait sets one group per line (all four on one line overruns its 780mm width
and wraps where the design did not choose), landscape runs them together. Keep
groups balanced at two each — a group of one orphans on portrait. Must stay in
step with `gen-pricelist.js` and `src/components/carwash/Pricing.tsx`.

Hours (`Open daily · 8am–7pm`) match the carwash OG card. Prices are deliberately
absent. There is no "drive in" line on either panel — it was dropped
deliberately, so re-adding it is a decision, not a fix.

**Wash-bay banners.** The inside of the bay: `back` 40×7ft (one piece, 3 zones),
`left` and `right` 17×7ft (1 zone each), plus a 3D mockup for placement approval
(**not artwork**) and an A3 print-spec sheet. The bay is **wide, not deep** — four
cars side by side, so the back is the long wall. All three are the same height,
which lets the room use one construction: dot field, ghost drop per zone, centred
copy, accent bar. `BAY` carries the geometry; re-measure for a second site and
everything follows.

**All three hang with tops on one line at 2700mm AFL** (bottom edge 566) — that
single line is what makes three surfaces read as one room. Copy is centred in the
panel, so the block's optical centre lands at ~1660mm, about standing eye height.
A parked saloon masks the wall to roughly 1380mm seen from outside, so a tall
block's last line can fall behind a car when the bay is full. Accepted; the fix
where it bites is to raise the banner, not shuffle copy upward.

**The back wall's three zones are thirds of the wall, not one per bay.** Four bays
at 3048mm pitch against three zones at 4064mm means boundaries fall mid-bay and
the centre zone serves the two middle cars — the right trade, because it puts the
lockup dead centre, which is the shot every finished car is photographed in front
of. **The lockup appears once in the whole room**; other zones carry the ghost
drop only.

**The four values are spread one per zone and never repeated** — "WE TAKE OUR
TIME" already says "we don't rush your car", so only one is on a wall. The right
wall used to carry the wash names and a pointer to the price board; that was a
price list with the figures taken out and is deliberately gone.

**Every heading is Archivo Black, a documented departure from §8.12** ("more than
once on a surface" is listed as misuse). The back wall is one banner carrying two.
The reasoning: §8.12 exists so one line is the loudest thing a viewer takes in,
and a 12m wall read from four bays is three surfaces in every sense except how it
is printed — a driver in bay 1 never sees zone 3 as competition. **Hierarchy is
therefore carried by size, not face**: zone 1 at 430mm leads, statements sit at
310–360, Rubik 700 is left to sub lines and the phone number. Keep any new zone
below 430mm. On a smaller surface §8.12 still applies as written — this is not a
precedent for a flyer or a card.

Alternative copy for both statements is kept in the `zones` data as commented
lists beside the line in use. Archivo Black runs roughly 0.67 × font size per
capital, so a longer line must come down in size; re-check width against the zone
(3824mm back, 4662mm return). Every line is `white-space:nowrap`, so overlong copy
is clipped rather than wrapped.

**Ink or Paper, one ground for the whole room.** No blue field — a whole room of
accent has no accent (§9). Ink for an open or sunlit bay, and it is what makes a
wet car read as clean; Paper for a covered or dim one. A mixed set reads as three
separate signs.

**No-parking notices.** `a3` 297×420mm (50mm headline, ~4.3m, wall plate beside
the bay), `a2` 420×594mm (71mm, ~6.1m, frontage), `gate` 900×300mm (110mm, **one
line**, ~9.5m, gate or bay head). Plus `noparking-formats.png`, an A3 comparison
sheet at 1:5.

**This is a private-property notice, not a statutory traffic sign.** No legal
force, and it deliberately does not imitate one: no red, no circle-and-bar
roundel, no reflective spec. Red is a second accent hue (§4.2) and a blue roundel
is a counterfeit road sign — it reads as one at a glance, carries none of the
authority, and looks worse the closer you get. Anything enforceable (tow-away,
clamping) is a regulated artefact and does not belong here.

**The lockup, the headline, the bar, and nothing else.** An earlier version
carried a reason line and a number to call; both were removed deliberately and the
copy is parked in `COPY` rather than deleted. A notice read from a moving car has
one job. It is also the only piece in the system with no sentence on it at all,
which is its own signal — anything on that wall with a paragraph is marketing, and
this is not. Re-adding a line is a decision, not a fix, and must be re-solved
against the height table: the strip's headline is 110mm *because* nothing sits
under the block, and was 98mm when something did.

**The headline is knocked out of a full-bleed accent block**, unlike every other
piece, which sets type on the field. A colour block spanning the full width has
the visual grammar of a sign, and this must be distinguishable at a glance from
marketing on the same wall — anyone who reads it as an advert ignores it. The
block carries less side padding than the field (0.6 × safe), because knockout type
can sit closer to the trim; that margin pays for the headline size.

**The strip reads furthest despite being the smallest sheet** — "NO PARKING" fits
on one line, so the headline is not width-bound by "PARKING". Prefer it wherever
there is somewhere to fix it. It still runs out of room first, on height: at 240mm
usable the block alone takes 158.

**The block sits on the plate's centre line, and that is arithmetic.** On the
portrait plates the lockup sits above the block, so the gap *below* is set to the
lockup's height plus the gap above, or the block rides high and the sheet reads
bottom-heavy. Lockup height comes from `LOCKUP_RATIO` (207/625.7, the §3
sub-brand frame), so it stays correct if the lockup is resized. The strip keeps a
symmetric gap instead. Headline sizes are solved against a measured metric —
Archivo Black runs ~0.706 × font size per capital at this tracking, so "PARKING"
is 4.94× and "NO PARKING" 7.06×. Every size leaves ~10% slack either side; do not
spend it.

**Tee mockups.** Two 1800×1100 sheets showing front and back. **Mockups, not
print artwork** — they approve placement and colourway. A printer gets the SVGs
from `brand/jaranow-blue/svg/` plus the millimetre figures in the captions:

| print | artwork | size |
|---|---|---|
| front, left chest | `jaranow-carwash-by-jaranow-<way>.svg` | 90mm |
| back, across shoulders | `jaranow-carwash-address-<way>.svg` | 280mm |

Both prints are whole SVGs inlined as-is, and **the back carries its address
inside the artwork** rather than as text beside it — a caption in a mockup is not
something a printer can reproduce, and the two drift the moment the address
changes. Do not re-add a separate address line. The garment is drawn at real
size-L proportions (530mm pit to pit) and every print size derives from
`CHEST_UNITS`, so the millimetres stay honest. Soft shading is on the *cloth*; the
mark stays flat (§4.2).

**Address lockup.** `jaranow-carwash-address-<way>.svg` is the sub-brand block
with a rule and `6th avenue · gwarinpa` locked under it — for garment backs,
vehicle panels and anything that must say *where* as well as *who*. A separate
asset, not a lockup variant: §3's 625.7 × 207 frame is fixed, so this extends to
625.7 × 314.3 and leaves the block above untouched. The address is drawn, so a
printer needs no font. Its tracking is **solved, not chosen** — the line justifies
to the block width and re-justifies if the address changes; a string too long
stops the generator rather than setting a cramped line. Only the carwash has one,
because only the carwash is a place you drive to. See §3.1.

**Book app icon.** The **one** asset using the "J" monogram instead of the drop,
and only because the books app is an internal tool sharing a home screen with the
Jaranow app — the launcher icon matches the tile in its own sidebar. Anything
public keeps the symbol (§2.4). Do not reach for the monogram elsewhere, and do
not point the site manifests at `public/book/`.

Two builds, not interchangeable (§7.2): `any` carries the 22.37% radius,
`maskable` is square-cornered with the letter inside the 80% safe circle. Both are
authored in `vw`/`vh`, rendered **once at 1024px** and resampled with `sips`.
`sync-appicon.sh` holds the generated-name → served-path mapping; keep it in step
with the `icons` array in `public/bookkeeping-manifest.json` and `appleTouchIcon`
for `/__/book` in `src/seo/routes.json`.

## Brand positioning — core values

Jaranow sells on **attention to detail, care, convenience and integrity**.

**Marketing copy must not use price as a selling point.** Do not reintroduce:
"fixed price", "no negotiation", "no hidden charges/fees", "transparent pricing",
"X% cheaper", "cost savings", "best value", "worth every naira", or comparisons to
competitors' prices. These were stripped from every hero, feature card, FAQ,
testimonial, meta description and JSON-LD description in July 2026 — re-adding one
is a regression, not an improvement.

Prices themselves are still shown as **plain fact**, not persuasion: `/pricing` is
the reference page, and `carwash/Pricing.tsx`, `wash/PricingPlans.tsx`,
`PlanRecommendation.tsx` and WhatsApp order messages all keep their figures. The
rule is about *framing*: state the price, never argue from it. When you need a
benefit line, reach for one of the four values.

## Pricing information

**Carwash by Jaranow** — drive-in at 6th Avenue, Gwarinpa, Abuja. Pay to the
Jaranow business account after the wash.

| Service | Price | Includes |
|---|---|---|
| Exterior Wash | ₦2,000 | Body, wheels, glass |
| Full Wash | ₦3,000 | Exterior + interior cleaned |
| Vacuum Wash | ₦4,000 | Exterior + interior machine-vacuumed |

The three carwash services are listed in **five places that must stay in step**
(the A5 flyer is not one — it lists no services):
`src/components/carwash/Pricing.tsx`, `src/pages/Pricing.tsx` (`carwashOptions`),
the JSON-LD `OfferCatalog` in `src/pages/CarwashLanding.tsx`, the `washTypes`
dropdown in `src/components/carwash/BookingForm.tsx`, and `gen-pricelist.js`'s
`LISTS`. Change one, change all five.

**Buffing (₦20,000) was withdrawn in August 2026** and removed from all five. Do
not reintroduce without confirmation. The grids are sized for three cards
(`lg:grid-cols-3`) — a fourth service means revisiting them. `gen-sign.js`'s
`SERVICES` still advertises "Detailing" in buffing's old slot; confirm it is
offered before reprinting a panel.

**Laundry by Jaranow** — collected and delivered; 48-hour turnaround from pickup.

| Plan | Price | Includes | Pickups |
|---|---|---|---|
| Lite | ₦14,999/month | 2 washes, up to 12 clothes each | Tue, Sat |
| Premium | ₦24,999/month | 3 washes, up to 15 clothes each | Tue, Thu, Sat |

Custom pricing: regular items ₦700/item (shirts, trousers, dresses, skirts,
tops); special items ₦2,000/item (suits, long dresses, towels, duvet sets,
curtains).

### Not offered — do not reintroduce

- **Priority / same-day service.** Discontinued. It survived in the FAQ, the plan
  recommender and the pricing badges for a while; all references are now gone.
- **Voice ordering, app download, grocery delivery.** These belong to an unshipped
  product. The site must not imply they exist.
- **Waitlist.** The laundry service is live. `WaitlistForm` and `Products` were
  deleted.

### Copy rules

- Never state a price, turnaround or capability not confirmed above.
- Never use price as a selling point.
- Keep JSON-LD prices in sync with the visible page — they drifted once (₦15,999
  vs ₦14,999) and search results showed the wrong figure.
- The car wash is **drive-in**. Do not describe it as doorstep or pickup. Only
  laundry is collected and delivered.
- Unverified social proof ("Trusted by 1000+ customers", "100% satisfaction
  guarantee", "follow up within 2 hours") is inherited copy — confirm before
  repeating or expanding it.

## Contact

- **WhatsApp orders:** `2349038622012`

  ```typescript
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
  ```

- **Email:** support@jaranow.com
- **Social:** Twitter/Instagram @jara_now · Facebook /jaranow
- **Service areas:** Gwarinpa, Abuja (primary). Expanding to Lagos, Port
  Harcourt, Ibadan.

## URL parameters

`/pricing` defaults to car wash. `?service=carwash` · `?service=wash` ·
`?service=delivery` (legacy, redirects to the car wash tab).
