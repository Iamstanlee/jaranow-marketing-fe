# Jaranow — Brand Standard

**Version 1.0 · Direction "Drop"**

This document governs the Jaranow identity. It is the source of truth for
anyone producing a sign, a shirt, a receipt, an app screen or a new service
line. Where this document and a designer's instinct disagree, this document
wins — the point of a system is that it survives people.

---

## 1. What the brand is

Jaranow handles recurring chores for urban Nigeria. Two service lines are live
— **Carwash by Jaranow** and **Laundry by Jaranow** — and more will follow.

**Tone:** straight-dealing, competent, calm. Premium but accessible.
The customer should feel respected, confident and unbothered.

**Never:** flashy, playful, corporate-generic, or startup-y.

Everything below exists to protect that. A logo that gets stretched, tinted or
crowded stops signalling competence and starts signalling the opposite.

---

## 2. The marks

### 2.1 Wordmark

`jaranow`, always lowercase. It is drawn, not typed — there is no font file to
install and no system font that substitutes for it. Never re-set the wordmark
in another typeface, and never type "Jaranow" in a display face and call it a
logo.

The letterforms are soft-square: rounded-rectangle bowls, round terminals,
monoline 14-unit stroke on a 100-unit baseline with a 54-unit x-height. Warm
without being playful.

### 2.2 Symbol

A drop reduced to one sharp corner and three soft ones, with the wordmark's `o`
punched out of it. Water is the one thing every Jaranow service has in common,
which is why the same symbol serves every line — it is never re-drawn per
service.

The counter (the hole) is load-bearing. It is what stops the mark reading as a
generic blob at small sizes. Never fill it in.

### 2.3 Lockups

| Lockup | Use |
|---|---|
| **Horizontal** | Default. Site headers, letterheads, anything wider than tall. |
| **Stacked** | Square and narrow formats, social avatars, stamps. |
| **Symbol alone** | Only where the name is already established — app icon, favicon, avatar. |

---

## 3. The sub-brand system

**This is the part that matters most.** Adding a service line must not require
a designer.

The rule: the service name sits **directly under the wordmark, flush to the
same left edge, at 40% scale, tracked wide**. The symbol sits left, vertically
centred on the whole block.

```
   ◗   jaranow
       l a u n d r y
```

Read aloud, that is "Laundry by Jaranow". The word "by" is never drawn — the
hierarchy carries it.

**Fixed properties — do not change these to fit a longer word:**

- Both sub-brand lockups occupy an identical **625.7 × 207** frame.
- The service baseline sits at **176 units**. This is not arbitrary: it clears
  the `j` descender, which matters the moment a service name opens with an
  ascender. `laundry` does. So would `logistics`.
- The master wordmark never shrinks to make room for a service name.

**To add a third line:** pass the new word to the generator (§8). Nothing else
moves. If a proposed service name forces a layout change, the name is the
problem, not the system.

**Hierarchy:** the service name is always subordinate — smaller, lower, lighter
in the visual field. If a stakeholder asks to make "Carwash" as prominent as
"jaranow", the answer is no. That builds two brands, not one.

---

## 4. Colour

### 4.1 Palette

| Role | Name | Hex | Notes |
|---|---|---|---|
| Accent | Jaranow Blue | `#2563EB` | Tailwind `primary-600`. |
| Near-black | Ink | `#0E1526` | Blue-biased, not neutral grey. |
| Off-white | Paper | `#F2F5FB` | Blue-biased. Use instead of pure white for knockouts. |

Blue is the category's default hue. That means the **mark** carries all of the
brand's differentiation — clear space, hierarchy and the symbol's counter are
what make Jaranow recognisable at a glance, not the colour. Apply them exactly.

### 4.2 Rules

- **One accent at a time.** Never introduce a second accent hue.
- **Never gradients, shadows, bevels, outlines or 3D** on the mark. It is flat
  by design so it survives flat-printed vinyl in hard daylight.
- **Never recolour the mark** to an off-palette hue to match a campaign.
- Neutrals are hue-biased toward the accent. Do not substitute pure `#000` /
  `#FFF` greys — they read as unconsidered next to the drawn letterforms.

---

## 5. Colourways

Four, and only four:

| Colourway | Composition | Use |
|---|---|---|
| **Accent** (`-blue`) | Everything in the accent | Light grounds, single-colour accent print |
| **Duo** (`-duo`) | Wordmark in ink; symbol + service name in accent | **Preferred on light grounds.** Strongest hierarchy. |
| **Black** (`-black`) | All ink | Receipts, stamps, fax, one-colour print |
| **White** (`-white`) | All paper | Signage, embroidery, dark grounds |

**Choosing between accent and duo:** duo wherever two elements exist to
differentiate — it makes the service name read as subordinate rather than
equal. Use flat accent only where a single ink is a hard constraint.

**On dark grounds use `-white`, not duo.** The accent does not carry enough
contrast against a dark blue field, and hierarchy is preserved by scale and
position regardless.

---

## 6. Clear space and minimum size

### 6.1 Clear space

Clear space equals **half the height of the `o`** on all four sides. It is
already baked into every exported file. Do not crop it back to "tighten" a
layout, and do not add a border that sits inside it.

### 6.2 Minimum sizes

| Asset | Minimum | Why |
|---|---|---|
| Symbol | **24 px** | Below this the counter starts closing. |
| Symbol (favicon build) | **16 px** | Uses a tighter 76% fill specifically to hold the counter open. |
| Horizontal lockup | **96 px** wide | Below this the service name stops resolving. |

Note there are two icon builds and they are not interchangeable:

- **App icon** — 52% symbol fill, 22.37% corner radius. Correct for iOS/Android
  launchers, where the OS expects breathing room.
- **Favicon** — 76% fill, 16% radius. At 16 px the tile edge does no work, so
  the symbol takes the space instead.

Maskable Android icons use **square corners** — the OS applies its own mask,
and a rounded icon inside a rounded mask produces clipped, squircle-in-squircle
edges.

---

## 7. Misuse

Do not:

1. Re-set the wordmark in any typeface.
2. Stretch, condense, skew, rotate or arc any mark.
3. Add gradients, drop shadows, glows, strokes or 3D effects.
4. Recolour outside the palette.
5. Fill in the symbol's counter.
6. Reposition the service name, or set it at equal weight to the wordmark.
7. Crop into the clear space.
8. Place the accent colourway on a dark ground (use `-white`).
9. Rebuild a lockup by hand from separate symbol and wordmark files — the
   spacing is part of the design.
10. Edit the SVGs directly. They are generated and will be overwritten (§8).

---

## 8. Asset library and regeneration

### 8.1 Structure

```
brand/
├── BRAND-STANDARD.md     this document
├── gen-marks.js          generator — the actual source of truth
├── rasterize.sh          SVG → transparent PNG via headless Chrome
└── jaranow-blue/         svg/ + png/
```

**The SVGs are build output, not source.** Hand-edits get overwritten. To
change anything — a colour, a service line, spacing — edit `gen-marks.js` and
regenerate:

```bash
node gen-marks.js blue jaranow-blue
bash rasterize.sh "$PWD/jaranow-blue" /tmp/rast
```

Adding a service line is one entry in the generator's asset list.

### 8.2 Naming

`jaranow-<asset>-<colourway>.svg` — e.g. `jaranow-laundry-by-jaranow-duo.svg`.

### 8.3 Raster sizes

Lockups export at 2048 px wide; symbol and icons at 1024 px square; favicon
set at 512/256/180/128/64/32/16. PNGs carry transparency — they are not a
substitute for the SVG in any digital context.

---

## 9. Website implementation

Live assets are served from `public/brand/`:

| File | Purpose |
|---|---|
| `jaranow-logo-white.svg` | Master lockup, knockout — header + footer |
| `jaranow-logo.svg` | Master lockup, duo — light grounds |
| `jaranow-carwash-white.svg` | Carwash sub-brand, knockout |
| `jaranow-laundry-white.svg` | Laundry sub-brand, knockout |
| `jaranow-symbol.svg` | Symbol alone |
| `favicon.svg` | Browser favicon |

### 9.1 Header

The shared `Header` component takes a `logo` prop:

```tsx
<Header logo="laundry" ctaLabel="Schedule pickup" onCtaClick={scrollToPricing} />
```

`'master' | 'carwash' | 'laundry'`, defaulting to `'master'`. Service pages use
their own line; the homepage, pricing page and anything cross-service use the
master.

**Adding a fourth line is one entry in the `LOGOS` map** plus the matching SVG
in `public/brand/`. No layout changes.

### 9.2 Sizing

Header heights differ by variant **on purpose**: master `h-11`, sub-brands
`h-14`. The master lockup is a 625.7 × 160 frame and the sub-brands are
625.7 × 207; the taller class keeps the `jaranow` wordmark at the same optical
size in every variant. Setting them to the same height would visibly shrink the
master wordmark on service pages.

The footer always uses the **master** lockup regardless of page — the footer is
corporate, the header is contextual.

### 9.3 PWA

`theme_color` is `#2563EB` in both `manifest.json` and `wash-manifest.json`.
Keep these in sync with the accent if the palette ever changes.

---

## 10. Open items

- **Carwash has no PWA manifest** of its own, unlike laundry. Add one if the
  carwash line gets an installable experience.
- **`public/logo-white.png` and `logo-wash.png` are orphaned** — superseded by
  the SVG assets and no longer referenced. Safe to delete.
