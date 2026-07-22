# Jaranow Marketing Website - Claude Context

## Project Overview
This is the marketing website for Jaranow, featuring multiple landing pages for different services:
- Main homepage (/)
- Car wash service (/carwash)
- Laundry service (/laundry)
- Pitch deck (/pitch-deck)
- Pricing page (/pricing)

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS with custom configuration
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **SEO**: React Helmet Async
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
src/
├── components/
│   ├── common/          # Header, Footer, OptimizedImage, PreloadImages
│   ├── home/            # Homepage components
│   ├── carwash/         # Car wash components
│   └── wash/            # Laundry components (folder name predates the rename)
├── pages/
│   ├── Home.tsx            # Homepage
│   ├── CarwashLanding.tsx  # Car wash landing
│   ├── WashLanding.tsx     # Laundry landing
│   ├── WashRecommendation.tsx  # Laundry plan recommender
│   ├── Deck.tsx            # Pitch deck
│   └── Pricing.tsx         # Pricing page
├── App.tsx              # Main app with routing
└── index.tsx            # Entry point

brand/                   # Identity system — see brand/BRAND-STANDARD.md
public/brand/            # Logo SVGs served by the site
```

## Key Patterns

### Page Structure
Each page typically includes:
1. **Helmet** component for SEO metadata
2. **Header** component (shared, from `components/common/`)
3. **Main content sections** (Hero, Features, Pricing, FAQ, etc.)
4. **Footer** component (shared)

### Component Organization
- Components are organized by feature/service (home, carwash, wash)
- Common components are in `components/common/`
- **Header and Footer are shared across all pages** via `components/common/Header.tsx` and `components/common/Footer.tsx` (single design system: primary blue + cyan accent).
- `Header` props: `ctaLabel`, `onCtaClick`/`ctaTo`, and `logo`.
- `logo` selects the lockup: `'master' | 'carwash' | 'laundry'` (default `'master'`).
  Service pages pass their own line; the homepage, pricing page and anything
  cross-service use the master. Adding a fourth line is one entry in the
  `LOGOS` map plus the SVG in `public/brand/` — no layout changes.
- Header logo heights differ per variant **on purpose** (`h-11` master, `h-14`
  sub-brand). This keeps the `jaranow` wordmark the same optical size in every
  variant. Do not "normalise" them.
- Each service still has its own Hero and content sections

### Styling
- Tailwind CSS for all styling
- Brand colors:
  - Primary Blue: `#2563eb` (primary-600) — the brand accent
  - Ink `#0E1526`, Paper `#F2F5FB` (blue-biased neutrals, not plain grey)
  - Gradients and utility classes from Tailwind
- Responsive design with mobile-first approach

### Brand identity

**`brand/BRAND-STANDARD.md` is the authority.** Read it before touching any
logo, lockup or brand colour.

- Direction "Drop": custom-drawn `jaranow` wordmark + abstract water-drop symbol.
  The wordmark is **drawn geometry, not a font** — never re-set it in a typeface.
- Marks are generated, not hand-edited. Source: `brand/gen-marks.js`.
  Regenerate with `node gen-marks.js blue jaranow-blue`; hand edits to the SVGs
  get overwritten.
- **Open Graph share cards are generated too.** The copy lives in the `CARDS`
  array in `brand/gen-og.js` — never edit `brand/og/html/*.html` or the PNGs by
  hand, they are build output. Full regeneration is three steps:

  ```bash
  node brand/gen-og.js      # CARDS  -> brand/og/html/*.html
  brand/rasterize-og.sh     # html   -> brand/og/png/*.png  (1200x630, headless Chrome)
  brand/sync-og.sh          # png    -> public/{jaranow,carwash,wash}/...
  ```

  `sync-og.sh` holds the generated-name → served-path mapping (the names differ,
  e.g. `opengraph-laundry.png` → `public/wash/opengraph.png`); keep it in step
  with `ogImage` in `src/seo/routes.json`. Rasterizing pulls Rubik from Google
  Fonts, so it needs network — always eyeball the PNGs afterwards, because a
  failed font load silently falls back to system sans. Watch for orphaned words:
  the headline is capped at `15ch`, so a long one wraps badly.
- **Print cards are generated too.** `brand/gen-card.js` emits both pocket cards
  (front + back each) as HTML; `brand/rasterize-card.sh` screenshots them to
  300dpi PNGs in `brand/card/png/`:

  - `card-carwash-account-*` — complimentary card carrying the bank details
  - `card-carwash-loyalty-*` — stamp card, 5 washes then one on us

  Both are 85×55mm so they share one press setup and one rasterizer. A third
  card is a new entry in the `CARDS` array, not a new script.

  ```bash
  node brand/gen-card.js       # -> brand/card/html/*.html
  brand/rasterize-card.sh      # html -> brand/card/png/*.png  (1075x720)
  ```

  Output is **85×55mm trim plus 3mm bleed** — hand the PNGs to the printer as-is,
  they add crop marks at the trim line. Two things bite here: the accent bar has
  to be *taller* than the bleed or the cut removes all of it, and the body is a
  fixed 55mm with `overflow:hidden`, so content that outgrows the padded box
  silently slides under the bar instead of making the page taller. Always eyeball
  the PNGs after changing a size. Like the OG cards, rasterizing pulls Rubik from
  Google Fonts, so it needs network.

  The bank details live in the `ACCOUNT` object at the top of `gen-card.js` —
  change them there and regenerate; do not edit the HTML or PNGs by hand. A
  10-digit NUBAN is auto-grouped 3-3-4 for reading aloud; anything else prints
  verbatim.

  **The loyalty card has six slots: five stampable, then the reward.** The offer
  is *5 points = 1 free wash*, so slots 1–5 get stamped and the sixth — accent
  filled, carrying the drop symbol — is the free wash those points buy. It is
  never stamped. Drop a numbered slot and the card silently becomes "buy 4, get
  the 5th free", a different and more expensive offer. The free wash is the
  **sixth** visit, so never write copy promising a free *fifth* wash.

  Loyalty cards carry a **printed serial** (`JC-001`…), so there is no write-in
  field. Generate a numbered run with:

  ```bash
  node brand/gen-card.js brand/card --batch=100   # -> card/batch/html
  brand/rasterize-card.sh batch                   # -> card/batch/png
  ```

  Only the **back** varies — every front is identical, so the press runs one
  static front and N variable backs. `--batch` wipes `card/batch/` first, so
  re-running it with a different N will not leave stale serials behind. Reprinting
  the same range reissues numbers that are already in customers' hands; start the
  next run where the last one ended rather than regenerating from 1.

  The serial is a handle for the ledger, not an enforcement mechanism — nothing
  stops a card being stamped twice or a number being reused. Whoever holds the
  ledger is the actual system.
- **Price lists are generated too.** `brand/gen-pricelist.js` +
  `brand/rasterize-pricelist.sh` emit `brand/pricelist/png/pricelist-{carwash,laundry}.png`
  — A4 portrait (210×297mm trim + 3mm bleed, 300dpi), for printing and
  laminating at the forecourt or counter.

  ```bash
  node brand/gen-pricelist.js   # -> brand/pricelist/html/*.html
  brand/rasterize-pricelist.sh  # html -> brand/pricelist/png/*.png (2551x3579)
  ```

  **Services and prices are data, not markup** — they live in the `LISTS` array
  at the top of `gen-pricelist.js`. A new service is a row in `items`; a new
  list is an entry in `LISTS`. Nothing below `LISTS` needs touching to change
  what a list says. `price` takes a number (grouped and prefixed with ₦) or a
  string, printed verbatim for anything that is not a flat figure; `unit`
  ("/month", "/item") and per-item `note` lines are optional, as is a section
  `title`.

  Keep the figures in step with `/pricing` and the "Pricing Information"
  section below — a laminated sheet on a wall outlives a deploy, so a drift
  here is visible to customers far longer than one on the site.

  Each list can also carry a `cover` (`{ headline, sub }`). When present, a
  matching **front sheet** is emitted as `<file>-front.png` — a cover to sit
  ahead of the prices, same Ink field / dots / accent bar, with a large centred
  lockup and the drop scaled up behind the copy. A list with no `cover` is
  prices-only. The cover headline sells on **care and detail, never on price**
  — same positioning rule as everything else — and its foot reuses
  `footer.left`, so don't repeat that address in `sub`.

  Two things to know: the list block is centred in the space between header and
  footer, so a two-row card (carwash) sits with a lot of air around it by
  design — that is a property of a short list on A4, not a layout bug. And the
  drop watermark bleeds off the **right edge only** on the price page; crop it
  top or bottom as well and only the tip stays on the page, which reads as a
  triangular smudge rather than a drop. (The front sheet keeps the whole drop on
  the page for the same reason.) Like the OG and pocket cards, rasterizing pulls Rubik
  from Google Fonts, so it needs network — the ₦ (U+20A6) comes from the
  latin-ext subset and is where a failed font load shows up first.
- **Roadside signage**: `brand/gen-sign.js` + `brand/rasterize-sign.sh` emit
  `brand/sign/png/sign-carwash-{portrait,landscape}-{ink,blue,paper}.png` — six
  panels, two orientations × three grounds, each plus 20mm bleed:

  | ground | field | band | lockup |
  |---|---|---|---|
  | `ink` | Ink | accent | `-white` |
  | `blue` | accent | Ink | `-white` |
  | `paper` | Paper | accent | `-duo` |

  The lockup and watermark colourway are **per ground**, not fixed — a knockout
  mark vanishes on a light field. Per BRAND-STANDARD §7.8 dark grounds take
  `-white` and light grounds take `-duo`; the accent colourway never sits on a
  dark ground. Watermark opacity is per ground too, since .04 that reads as a
  ghost on Ink is invisible in blue on Paper. Prefer the Ink panels in direct
  sun; the Paper panel is for under cover or against a dark wall.

  | orientation | trim | px | headline |
  |---|---|---|---|
  | portrait | 900×1800mm | 1880×3680 | 230mm, stacked `CAR / WASH` |
  | landscape | 2400×1200mm | 4880×2480 | 300mm, one line |

  The two orientations are **not** the same design scaled. Portrait is width-
  constrained, so the headline stacks; landscape has the width to set it on one
  line *and* larger, which is why it reads from ~26m against portrait's ~20m.
  Prefer landscape where the site allows it.

  Panels differ in pixel size, so `rasterize-sign.sh` reads dimensions from the
  `sizes.txt` manifest `gen-sign.js` writes — do not hardcode a window size.

  The `CAR WASH` headline is set in **Archivo Black**, not Rubik — at 20m what
  carries is stroke weight and letter width, and Rubik's 700 is a text bold.
  Everything else on the panel stays Rubik. This is not a wordmark substitution
  (BRAND-STANDARD §7.1): the lockup beside it is still the drawn SVG. Two
  things to keep in mind — Archivo Black ships **one weight (400)**, so asking
  for 700 gets a synthetic bold that goes soft at size; and each face carries
  its own `capRatio`, because the legibility table is computed from it, so
  swapping the face without the metric silently reports wrong distances.

  Rendered at **2px/mm (~51dpi at full size)**. That is correct for large format
  and not a bug — do not "fix" it to 300dpi, which is a 10630×21260px file for no
  gain at a viewing distance of metres.

  **Type is sized from viewing distance, not by eye.** The rule is ~25mm of cap
  height per 3m of comfortable reading; the script prints a table of what each
  element resolves at, so read it after changing any size. Two things this
  discipline caught, both worth preserving:

  - The `carwash` line inside the lockup is only ~30mm cap (≈3.6m). The lockup
    says *who* but not *what* at road distance, so `CAR WASH` is the headline in
    its own right. Removing it makes the sign unreadable as a car wash.
  - On portrait the headline is stacked `CAR / WASH`. One line caps at ~140mm
    against the 780mm content width, where two lines fit 230mm — roughly 20m of
    comfortable read instead of 12m. Unstacking it costs ~8m of range. Landscape
    does not have this problem and sets it on one line.

  The services line comes from the `SERVICES` array, **grouped rather than
  flat** because the panels have very different room: portrait sets one group
  per line (all four on one line overruns its 780mm content width at 56mm type
  and wraps where the design did not choose), landscape runs them together on
  one line. Keep the groups balanced at two each — a group of one orphans on
  portrait. These must stay in step with `gen-pricelist.js` and
  `src/components/carwash/Pricing.tsx`.

  Hours (`Open daily · 8am–7pm`) match the carwash OG card. Prices are
  deliberately absent — see "Brand positioning". There is no "drive in" line on
  either panel; it was dropped deliberately, so re-adding it is a decision, not
  a fix.
- **Tee mockups** work the same way: `brand/gen-tee.js` +
  `brand/rasterize-tee.sh` emit `brand/tee/png/mockup-carwash-tee-{ink,paper}.png`,
  each an 1800×1100 sheet showing front and back.

  These are **mockups, not print artwork** — they exist to approve placement and
  colourway. A printer gets the lockup SVGs from `brand/jaranow-blue/svg/` plus
  the millimetre figures in the sheet captions. The garment is drawn at real
  size-L proportions (530mm pit to pit) and every print size derives from
  `CHEST_UNITS`, so the millimetres are honest — change the geometry and the
  captions stay true automatically.

  The soft shading is on the *cloth*. The mark itself stays flat, per
  BRAND-STANDARD §4.2 — do not let a gradient or shadow reach the lockup.
- Live assets are served from `public/brand/`:
  `jaranow-logo-white.svg` (master, knockout), `jaranow-logo.svg` (master, duo),
  `jaranow-carwash-white.svg`, `jaranow-laundry-white.svg`,
  `jaranow-symbol.svg`, `favicon.svg`.
- Sub-brand rule: the service name sits under the wordmark, flush left, at 40%
  and tracked wide. Read as "Laundry by Jaranow" — the word "by" is never drawn.
- Symbol minimum size is 24px; the favicon build uses a tighter crop to keep the
  counter open at 16px. App icon and favicon builds are **not** interchangeable.
- Flat only: no gradients, shadows, bevels or outlines on the mark.
- `theme_color` is `#2563EB` in both `manifest.json` and `wash-manifest.json`;
  keep them in sync with the accent.

### Animations
Motion is deliberately limited. **Do not reintroduce scroll-reveal animation.**

Keep motion only for:
- **Hero sections** (`components/{home,carwash,wash}/Hero.tsx`) — entrance animation
- **Interactions** — `whileHover` / `whileTap` on buttons and cards
- **Open/close** — `AnimatePresence` + `exit` for the mobile menu, accordions,
  and multi-step forms

Everything else renders immediately. `whileInView`/`viewport` scroll reveals were
removed across all content sections; content stuck at `initial` opacity is the
failure mode to watch for.

### SEO

**Per-route social metadata lives in `src/seo/routes.json` — edit it there and
nowhere else.** Two consumers read that one file:

1. `src/seo/SeoTags.tsx` — a `<SeoTags route="/carwash"/>` component each page
   renders. Handles title, description, canonical, OpenGraph and Twitter tags
   at runtime (correct title during client-side navigation).
2. `scripts/prerender-meta.js` — runs after `react-scripts build` and writes one
   static HTML file per route (`build/carwash/index.html`, etc.) with those tags
   baked in.

**Why the prerender step exists:** this is a client-rendered CRA SPA, so
`react-helmet-async` only sets the head once JavaScript runs. Facebook, WhatsApp,
Twitter and LinkedIn crawlers *don't run JavaScript* — they read the raw HTML.
Every route used to be served the same `public/index.html`, so every share
preview fell back to the homepage's tags. Adding tags to a page's `<Helmet>`
alone will **not** fix a broken share preview.

To add a route: add an entry to `routes.json` (including its `file`), render
`<SeoTags route="/new" />` in the page. No script changes needed.

`vercel.json` has a catch-all rewrite to `/index.html`; Vercel checks the
filesystem *before* rewrites, so the prerendered files win and everything else
falls through to the SPA. Verify a change with:
`npm run build && npx serve build` then
`curl -A facebookexternalhit http://localhost:3000/carwash | grep og:`

Page-specific extras (JSON-LD, per-service favicons/manifests) stay in the
page's own `<Helmet>`. Keep JSON-LD in sync with the visible page.

`public/_redirect` is a leftover Netlify file — singular, so it was never valid
even on Netlify, and it is inert on Vercel. Ignore it.

## Development Commands

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## Brand positioning — core values

Jaranow sells on **attention to detail, care, convenience and integrity**.
**Price is never the pitch.**

Marketing copy must not use price as a selling point. Specifically, do not
reintroduce: "fixed price", "no negotiation", "no hidden charges/fees",
"transparent pricing", "X% cheaper", "cost savings", "best value", "worth every
naira", or comparisons to competitors' prices. These were stripped from every
hero, feature card, FAQ, testimonial, meta description and JSON-LD description
in July 2026 — a reviewer re-adding one is a regression, not an improvement.

Prices themselves are still shown as **plain fact**, not persuasion:
- `/pricing` is the reference page listing what things cost.
- `src/components/carwash/Pricing.tsx` and `src/components/wash/PricingPlans.tsx`
  still display figures and plan tiers.
- Plan figures in `PlanRecommendation.tsx` and WhatsApp order messages stay.

The rule is about *framing*, not about hiding numbers: state the price, never
argue from it. When you need a benefit line, reach for one of the four values.

## Contact & CTA Patterns

### WhatsApp Integration
The site uses WhatsApp for orders:
```typescript
const phoneNumber = "2349038622012";
const message = "Your message here";
const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
window.open(whatsappURL, '_blank');
```

### Email
- support@jaranow.com

### Social Media
- Twitter: @jara_now
- Instagram: @jara_now
- Facebook: /jaranow

## Best Practices

1. **Always use TypeScript** - Define proper types for props
2. **Lazy load pages** - Use React.lazy() for code splitting
3. **Optimize images** - Use OptimizedImage component when available
4. **SEO first** - Include Helmet with comprehensive metadata
5. **Mobile responsive** - Test on mobile breakpoints (sm, md, lg, xl)
6. **Animations** - Keep them smooth and purposeful
7. **Accessibility** - Use semantic HTML and proper ARIA labels

## Common Components

### Header
One shared `Header` for every page (there is no per-service Navigation any more):
- Logo — master or sub-brand lockup via the `logo` prop
- Menu items
- CTA button (configurable per page)
- Mobile menu (`AnimatePresence`)

### Footer
Contains:
- Contact information
- Social media links
- Copyright notice
- Additional links

### Pricing
Displays pricing information with:
- Service breakdown
- Payment methods
- Benefits/features
- Value proposition

## Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.tsx` with lazy loading
3. Include Helmet for SEO
4. Follow existing page structure pattern
5. Add to navigation menus if needed

## Service Areas

Current focus:
- Gwarinpa, Abuja (Primary)
- Expanding to: Lagos, Port Harcourt, Ibadan

## Pricing Information

**Carwash by Jaranow:**
- Exterior Wash: ₦2,000 (body, wheels, glass)
- Full Wash: ₦3,000 (exterior wash + interior cleaned)
- Vacuum Wash: ₦4,000 (exterior wash + interior machine-vacuumed)
- Buffing: ₦20,000 (full wash + paintwork machine-polished)
- Location: 6th Avenue, Gwarinpa, Abuja
- Pay to the Jaranow business account after the wash

The four carwash services are listed in five places that must stay in step:
`src/components/carwash/Pricing.tsx` (the component), `src/pages/Pricing.tsx`
(`carwashOptions`), the JSON-LD `OfferCatalog` in `src/pages/CarwashLanding.tsx`,
the `washTypes` dropdown in `src/components/carwash/BookingForm.tsx`, and the
`brand/gen-pricelist.js` `LISTS` array. Change one, change all five.

**Laundry by Jaranow:**
- Lite Plan: ₦14,999/month (2 washes, up to 12 clothes each)
- Premium Plan: ₦24,999/month (3 washes, up to 15 clothes each)
- Custom Pricing:
  - Regular items: ₦700/item (shirts, trousers, dresses, skirts, tops, etc.)
  - Special items: ₦2,000/item (suits, long dresses, towels, duvet sets, curtains)
- Turnaround: 48 hours from pickup
- Pickup windows: Tuesday & Saturday (Lite); Tuesday, Thursday & Saturday (Premium)

### Not offered — do not reintroduce

- **Priority / same-day service.** Discontinued. It was removed from the plans
  but survived in the FAQ, the plan recommender and the pricing badges for a
  while; all references are now gone. Do not add it back without confirmation.
- **Voice ordering, app download, grocery delivery.** These belong to an
  unshipped product. The site must not imply they exist.
- **Waitlist.** The laundry service is live; there is no waitlist. The
  `WaitlistForm` and `Products` components were deleted.

### Copy rules

- Never state a price, turnaround or capability that is not confirmed here.
- Never use price as a selling point — see "Brand positioning — core values".
- Keep structured data (JSON-LD) prices in sync with the visible page — they
  drifted once (₦15,999 vs ₦14,999) and search results showed the wrong figure.
- The car wash is **drive-in** at 6th Avenue, Gwarinpa. Do not describe it as
  doorstep or pickup. Only laundry is collected and delivered.
- Unverified social proof ("Trusted by 1000+ customers", "100% satisfaction
  guarantee", "follow up within 2 hours") is inherited copy — confirm before
  repeating or expanding it.

## URL Parameters

**Pricing Page** (`/pricing`):
- Default: Shows car wash pricing first
- `/pricing?service=carwash` - Shows car wash pricing
- `/pricing?service=wash` - Shows wash service pricing
- `/pricing?service=delivery` - Legacy value, redirects to the car wash tab
