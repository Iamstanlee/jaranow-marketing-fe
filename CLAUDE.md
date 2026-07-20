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
- Each page has comprehensive meta tags
- OpenGraph and Twitter card metadata
- Structured data (JSON-LD) for rich snippets
- Canonical URLs and social media tags

## Development Commands

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

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
- Fixed price, no negotiation, no hidden charges
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
