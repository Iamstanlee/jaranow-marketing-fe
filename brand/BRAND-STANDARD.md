# Jaranow — Brand Standard

**Version 1.1 · Direction "Drop"**

Source of truth for anyone producing a sign, a shirt, a receipt, an app screen or
a new service line. Where this document and a designer's instinct disagree, this
document wins — the point of a system is that it survives people.

It covers *what* the brand is and how it is applied, not how the asset files are
produced; see §10.

---

## 1. What the brand is

Jaranow handles the recurring upkeep of a home and a car in urban Nigeria. Two
service lines are live — **Carwash by Jaranow** and **Laundry by Jaranow** — and
more will follow.

**Tone:** straight-dealing, competent, calm. Premium but accessible. The customer
should feel respected, confident and unbothered.

**Never:** flashy, playful, corporate-generic, or startup-y.

**The brand sells care, attention to detail, convenience and integrity. It never
sells on price.** State a price as plain fact wherever a customer needs it; never
argue from it. "Cheaper", "best value", "no hidden charges" and comparisons to a
competitor's prices are off-brand, not merely off-message.

Everything below protects that. A logo that gets stretched, tinted or crowded
stops signalling competence and starts signalling the opposite.

---

## 2. The marks

### 2.1 Wordmark

`jaranow`, always lowercase. **Drawn, not typed** — there is no font file to
install and no system font that substitutes. Never re-set it in another typeface,
and never type "Jaranow" in a display face and call it a logo.

Soft-square letterforms: rounded-rectangle bowls, round terminals, monoline
14-unit stroke on a 100-unit baseline with a 54-unit x-height. Warm without being
playful.

**Not a font, but a small alphabet.** Only the characters the brand needs exist:
`jaranow`, the service names, the carwash address. Setting a new word means
*drawing* the missing characters on the same construction — matching stroke
weight, curve radius, and the way straight stems overhang (ending at y=100,
overhanging to 107) while curved bottoms stop short (at 93).

Needing a character that does not exist is a design decision, not a small change.
Draw it properly, or change the words.

### 2.2 Symbol

A drop reduced to one sharp corner and three soft ones, with the wordmark's `o`
punched out. Water is the one thing every Jaranow service has in common, which is
why the same symbol serves every line — it is never re-drawn per service.

**The counter (the hole) is load-bearing.** It stops the mark reading as a generic
blob at small sizes. Never fill it in.

### 2.3 Lockups

| Lockup | Use |
|---|---|
| **Horizontal** | Default. Site headers, letterheads, anything wider than tall. |
| **Stacked** | Square and narrow formats, social avatars, stamps. |
| **Symbol alone** | Only where the name is already established — app icon, favicon, avatar. |

### 2.4 Monogram

A `J` in the wordmark's letterforms, for **internal tools only** — the back-office
app whose launcher icon has to match its own interface. Not part of the public
identity.

Anything a customer sees uses the symbol. Do not reach for the monogram because a
layout is tight; that is what the symbol is for.

---

## 3. The sub-brand system

**This is the part that matters most.** Adding a service line must not require a
designer.

The rule: the service name sits **directly under the wordmark, flush to the same
left edge, at 40% scale, tracked wide**. The symbol sits left, vertically centred
on the whole block.

```
   ◗   jaranow
       l a u n d r y
```

Read aloud, that is "Laundry by Jaranow". The word "by" is never drawn — the
hierarchy carries it.

**Fixed properties — do not change these to fit a longer word:**

- Both sub-brand lockups occupy an identical **625.7 × 207** frame.
- The service baseline sits at **176 units**. Not arbitrary: it clears the `j`
  descender, which matters the moment a service name opens with an ascender.
  `laundry` does. So would `logistics`.
- The master wordmark never shrinks to make room for a service name.

**To add a third line:** the new word is set in the existing system and nothing
else moves. If a proposed name forces a layout change, the name is the problem.

**Hierarchy:** the service name is always subordinate — smaller, lower, lighter in
the visual field. If a stakeholder asks to make "Carwash" as prominent as
"jaranow", the answer is no. That builds two brands, not one.

### 3.1 The address lockup

The sub-brand block with a rule and the street address locked under it — for
garment backs, vehicle panels and anything that must say **where** as well as who.

A **separate asset, not a lockup variant**. The 625.7 × 207 frame is fixed, so an
address cannot be added inside it; this one extends downward to **625.7 × 314.3**
and leaves the block above untouched.

- The address is **drawn** in the letterforms of §2.1. No font is referenced, so a
  printer needs nothing installed — the point of handing over this file rather
  than a mockup with a caption beside it.
- Set lowercase and **tracked to sit flush with both edges of the block above**.
  The tracking is solved from the address, not chosen: change the address and the
  line re-justifies. An address too long to fit does not get a tightened line — it
  gets shortened.
- The rule is the one place a stroke other than the 14-unit monoline appears (5
  units). It is a separator, not a letterform.

Only the carwash has one. Laundry is collected and delivered and has no forecourt,
so it deliberately has no address lockup — do not add one to fill in the matrix.

---

## 4. Colour

| Role | Name | Hex | Notes |
|---|---|---|---|
| Accent | Jaranow Blue | `#2563EB` | The single accent. |
| Near-black | Ink | `#0E1526` | Blue-biased, not neutral grey. |
| Off-white | Paper | `#F2F5FB` | Blue-biased. Use instead of pure white for knockouts. |

Blue is the category's default hue, so the **mark** carries all of the brand's
differentiation — clear space, hierarchy and the symbol's counter are what make
Jaranow recognisable at a glance, not the colour. Apply them exactly.

### 4.2 Rules

- **One accent at a time.** Never introduce a second accent hue.
- **Never gradients, shadows, bevels, outlines or 3D** on the mark. It is flat by
  design so it survives flat-printed vinyl in hard daylight.
- **Never recolour the mark** to an off-palette hue to match a campaign.
- Neutrals are hue-biased toward the accent. Do not substitute pure `#000`/`#FFF`
  greys — they read as unconsidered next to the drawn letterforms.

---

## 5. Colourways

Four, and only four:

| Colourway | Composition | Use |
|---|---|---|
| **Accent** (`-blue`) | Everything in the accent | Light grounds, single-colour accent print |
| **Duo** (`-duo`) | Wordmark in ink; symbol + service name in accent | **Preferred on light grounds.** Strongest hierarchy. |
| **Black** (`-black`) | All ink | Receipts, stamps, fax, one-colour print |
| **White** (`-white`) | All paper | Signage, embroidery, dark grounds |

**Accent vs duo:** duo wherever two elements exist to differentiate — it makes the
service name read as subordinate rather than equal. Use flat accent only where a
single ink is a hard constraint.

**On dark grounds use `-white`, not duo.** The accent does not carry enough
contrast against a dark blue field, and hierarchy is preserved by scale and
position regardless.

---

## 6. Typography

Two faces, and only two. Both open-licence (SIL OFL), so they may be embedded in
print artwork, on the web and in an app without a licence purchase.

| Face | Weights | Role |
|---|---|---|
| **Rubik** | 400, 500, 700 | Everything: body, UI, labels, prices, contact details, most headings. |
| **Archivo Black** | 400 only | Display. The single loudest line on a surface, and nothing else. |

### 6.1 Rubik — the voice

Rubik's slightly rounded terminals and even geometric skeleton echo the drawn
wordmark, so text sits beside the mark without arguing with it.

- Body 400; emphasis and labels 500; headings 700.
- Headings track slightly tight (≈ −0.02em). Body tracks normally.
- Small all-caps labels — kickers, band text, section eyebrows — are 500 with wide
  tracking (0.12–0.3em). **Never all-caps at 400**, which reads as weak.

### 6.2 Archivo Black — the shout

For one job: a line that has to carry at distance or dominate a page. Roadside
panels, poster headlines, the flyer headline, a phone number on print, a landing
page's opening statement.

- **It ships one weight (400).** Never request bold — a synthetic bold smears the
  outline, worst at exactly the sizes this face is used at.
- **One per surface.** Two Archivo Black elements on a piece and neither is the
  headline any more. A scrolling web page is not one surface: the opening
  statement and each section heading may take it, because only one is on screen at
  a time. A heading and its own sub-heading may not.
- **Never for body copy, captions, labels or anything running to a paragraph.** It
  has no reading rhythm; it is a face for four words.
- Tracking runs tight at display size (−0.005 to −0.015em). Do not track it out to
  justify a line — that opens the counters at exactly the distance the type exists
  for.
- It sets **much wider** than Rubik at the same size. Always check a headline
  against its measure before committing to a size.
- Sentence case for page and print headlines; all caps for signage, where stroke
  weight and letter width are what carry.

### 6.3 Neither face is the wordmark

`jaranow` is drawn (§2.1). Setting it in Archivo Black — or Rubik, or anything
else — is a misuse (§8.1), however large or convenient. Using Archivo Black for
`CAR WASH` beside the lockup is not a substitution: that is a service descriptor
set in type, next to the real drawn mark.

### 6.4 Fallbacks

Both faces fall back to `system-ui, sans-serif`. On any surface where the type may
not load — an emailed HTML template, a printer's machine — the layout must still
hold at the fallback's proportions, or the type has to be outlined.

---

## 7. Clear space and minimum size

**Clear space equals half the height of the `o`** on all four sides. It is already
baked into every exported file. Do not crop it back to "tighten" a layout, and do
not add a border that sits inside it.

| Asset | Minimum | Why |
|---|---|---|
| Symbol | **24 px** | Below this the counter starts closing. |
| Symbol (favicon build) | **16 px** | Tighter fill specifically to hold the counter open. |
| Horizontal lockup | **96 px** wide | Below this the service name stops resolving. |

Two icon builds, **not** interchangeable:

- **App icon** — smaller symbol fill, rounded corners. For launchers, where the OS
  expects breathing room inside the tile.
- **Favicon** — larger fill, tighter crop. At 16 px the tile edge does no work, so
  the symbol takes the space instead.

Maskable Android icons use **square corners** — the system applies its own mask,
and a rounded icon inside a rounded mask produces clipped edges.

---

## 8. Misuse

Do not:

1. Re-set the wordmark in any typeface.
2. Stretch, condense, skew, rotate or arc any mark.
3. Add gradients, drop shadows, glows, strokes or 3D effects.
4. Recolour outside the palette.
5. Fill in the symbol's counter.
6. Reposition the service name, or set it at equal weight to the wordmark.
7. Crop into the clear space.
8. Place the accent colourway on a dark ground (use `-white`).
9. Rebuild a lockup by hand from separate symbol and wordmark files — the spacing
   is part of the design.
10. Edit the exported files directly. They are generated and will be overwritten
    (§10).
11. Introduce a third typeface, or substitute a "similar" one for either face.
12. Set Archivo Black in a synthetic bold, in body copy, or more than once on a
    surface.
13. Use the monogram anywhere a customer can see it (§2.4).

---

## 9. Applications

The identity is applied consistently, not identically — a sign read at 30 m and a
receipt read at 30 cm are different problems. Three rules hold across all of them:

- **The wordmark leads.** On a sub-brand piece the lockup still says Jaranow
  first, service second.
- **Ink and Paper are the grounds; the accent is the punctuation.** A surface that
  is mostly accent has no accent.
- **Type is sized from viewing distance, not by eye.** For large format, about
  25 mm of cap height per 3 m of comfortable reading distance.

| Surface | Lockup | Notes |
|---|---|---|
| Site header | Master, or the page's service line | Contextual to the page. |
| Site footer | **Always master** | The footer is corporate, the header is contextual. |
| Signage | Sub-brand, knockout on dark grounds | The lockup says who, not what — pair it with the service in type. |
| Bay interior | Sub-brand once, on the back wall | Three walls are one room. All copy in the 1500–2700 mm band — below that is behind a parked car. |
| Print (price lists, flyers, cards) | Sub-brand | Prices are stated as fact; the sheet sells the care (§1). |
| Garments | Sub-brand small on the chest, address lockup across the back | The address is inside the artwork, never a caption beside it. |
| App icon / favicon | Symbol (monogram for internal tools only) | Separate builds — see §7.2. |

Lockup sizing across variants is **optical, not mechanical**: master and sub-brand
lockups have different frame heights, so matching box heights would visibly shrink
the wordmark on service pages. Match the **wordmark**, not the box.

---

## 10. Assets

Every mark, lockup and icon is **generated from a single source**, not drawn by
hand in an editor. The exported SVGs and PNGs are build output: a hand edit
survives until the next regeneration and then disappears silently.

To change anything — a colour, a service line, spacing, the address — the
generator changes and everything re-exports together. That is what keeps a lockup
on a shirt identical to the one in the site header.

**Naming:** `jaranow-<asset>-<colourway>.svg`, e.g.
`jaranow-laundry-by-jaranow-duo.svg`.

**Formats:** SVG is the master and the only thing to hand a printer or sign shop.
PNGs are provided for contexts that cannot take vector; they are never a
substitute for the SVG in a digital context.

Production instructions — the generators, their commands, and the per-asset
constraints — live with the code, in the repository's `CLAUDE.md`. This document
does not duplicate them, because a brand standard that goes stale with the build
is worse than no brand standard.
