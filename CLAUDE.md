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
- Exterior Wash: ₦2,000
- Full Wash (interior + exterior): ₦3,000
- Location: 6th Avenue, Gwarinpa, Abuja
- Pay to the Jaranow business account after the wash

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
