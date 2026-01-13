# Jaranow Marketing Website - Claude Context

## Project Overview
This is the marketing website for Jaranow, featuring multiple landing pages for different services:
- Main homepage (/)
- Grocery delivery service (/delivery)
- Wash/laundry service (/wash)
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
│   ├── common/          # Shared components (OptimizedImage, PreloadImages)
│   ├── home/            # Homepage components
│   ├── jaranow/         # Grocery delivery components
│   └── wash/            # Wash service components
├── pages/
│   ├── Home.tsx         # Homepage
│   ├── JaranowLanding.tsx  # Grocery delivery landing
│   ├── WashLanding.tsx     # Wash service landing
│   ├── Deck.tsx            # Pitch deck
│   └── Pricing.tsx         # Pricing page
├── App.tsx              # Main app with routing
└── index.tsx            # Entry point
```

## Key Patterns

### Page Structure
Each page typically includes:
1. **Helmet** component for SEO metadata
2. **Navigation** component
3. **Main content sections** (Hero, Features, Pricing, FAQ, etc.)
4. **Footer** component

### Component Organization
- Components are organized by feature/service (home, jaranow, wash)
- Common components are in `components/common/`
- Each service has its own Navigation, Hero, Footer, etc.

### Styling
- Tailwind CSS for all styling
- Brand colors:
  - Primary Blue: `#2563eb` (primary-600)
  - Gradients and utility classes from Tailwind
- Responsive design with mobile-first approach

### Animations
- Framer Motion for scroll animations
- Common pattern: `initial`, `whileInView`, `transition`, `viewport` props
- Stagger animations for lists

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

### Navigation
Each service has its own Navigation component with:
- Logo
- Menu items
- CTA button
- Mobile menu

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

**Jaranow Delivery:**
- Service Charge: ₦500
- Delivery Fee: ₦500
- Total: ₦1,000 per order
- No markup on groceries

**Jaranow Wash:**
- Lite Plan: ₦14,999/month (2 washes, up to 12 clothes each)
- Premium Plan: ₦24,999/month (3 washes, up to 15 clothes each)
- Custom Pricing:
  - Regular items: ₦700/item (shirts, trousers, dresses, skirts, tops, etc.)
  - Special items: ₦2,000/item (suits, long dresses, towels, duvet sets, curtains)

## URL Parameters

**Pricing Page** (`/pricing`):
- Default: Shows grocery delivery pricing first
- `/pricing?service=delivery` - Shows grocery delivery pricing
- `/pricing?service=wash` - Shows wash service pricing
