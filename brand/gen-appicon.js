/* Jaranow - app icon generator for the Business Desk PWA.
   Usage:  node brand/gen-appicon.js [outdir]

   The books app is an internal tool, not a marketing surface, and it sits on the
   same home screen as the Jaranow app. It therefore takes the "j" tile from the
   dashboard sidebar rather than the drop symbol, so the launcher icon and the
   thing you see once it opens are the same object. Everything public keeps the
   symbol (BRAND-STANDARD 2.4) - do not reach for this monogram anywhere else.

   "Ink desk": an Ink tile with the word "BOOK" in Paper, set from the wordmark's
   own drawn letters, as large as the tile allows. No full stop - the word is
   the whole mark. Ink rather than blue so the books app cannot be mistaken for the blue
   Jaranow drop beside it on a home screen. The letters are glyphs from gen-marks.js (the capitals
   were drawn for this), set with its 12-unit gap - drawn, not typed (2.1): no font
   is loaded, so nothing can silently fall back. src/book/components/BookMark.tsx
   draws the same tile for the sidebar - change one, change both.

   Emits one HTML file per variant plus a sizes.txt manifest for the rasterizer.
   Authored in vw/vh, so one file covers every icon size: the rasterizer renders
   it once at RENDER_PX and resamples down. Do not "simplify" that by screenshotting
   at the target size directly - headless Chrome will not open a window below about
   500px, so a 192px shot silently comes back as a 192px crop of a larger tile.

     node brand/gen-appicon.js     # -> brand/appicon/html/*.html + sizes.txt
     brand/rasterize-appicon.sh    # html -> brand/appicon/png/*.png
     brand/sync-appicon.sh         # png  -> public/book/
*/
const fs = require("fs");
const path = require("path");

const INK = "#0E1526";
const PAPER = "#F2F5FB";

/* "BOOK", copied from the G table in gen-marks.js (this script cannot import it -
   gen-marks writes files on load). Coordinates are stroke centres; `w` is the
   advance at the face's own 14-unit stroke.

   The icon sets them heavier than the face. At 14 the word reads thin on a
   home screen next to filled icons, so SW thickens the stroke around the SAME
   centre lines - every corner, radius and proportion stays as drawn, only the
   ink grows by (SW-14)/2 on each side. Two things follow from that and are
   handled here rather than by hand: the spacing widens by the same amount so the
   gap between letters stays the face's 12 units of clear space. Past about
   22 the B's upper counter closes to a slit at 40px; keep SW at or under 20. */
const SW = 20;
const H = SW / 2;
const CLEAR = 12;              // clear space between letters, ink to ink
const GAP = CLEAR - 14 + SW;   // advance gap that keeps CLEAR at this stroke
const GLYPHS = {
  B: { w: 61, d: "M7 93 V16 H33 A14 14 0 0 1 47 30 V40 A14 14 0 0 1 33 54 H7 M7 54 H40 A14 14 0 0 1 54 68 V79 A14 14 0 0 1 40 93 H7" },
  O: { w: 68, d: "M7 30 A14 14 0 0 1 21 16 H47 A14 14 0 0 1 61 30 V79 A14 14 0 0 1 47 93 H21 A14 14 0 0 1 7 79 Z" },
  K: { w: 57, d: "M7 16 V100 M50 16 L7 64 M21 48.4 L50 100" }
};
const WORD = "BOOK";
let pen = 0, right = 0;
const WORD_D = [...WORD].map(ch => {
  const g = GLYPHS[ch];
  /* Offset each glyph's path by the pen position; every command here is absolute. */
  const d = g.d.replace(/([MLHVA])([^MLHVAZ]*)/g, (m, cmd, args) => {
    const n = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd === "H") return `H${n[0] + pen}`;
    if (cmd === "V") return m;
    if (cmd === "A") return `A${n.slice(0, 5).join(" ")} ${n[5] + pen} ${n[6]}`;
    return `${cmd}${n[0] + pen} ${n[1]}`;
  });
  right = pen + g.w - 7 + H;   // this glyph's right ink edge at stroke SW
  pen += g.w + GAP;
  return d;
}).join(" ");
/* Ink bounds at stroke SW: from the B's stem edge to the K's terminals, and from
   the ascender's cap (16 - H) to the K's stem cap (100 + H). Centred on that box. */
const WORD_BOX = { x0: 7 - H, x1: right, y0: 16 - H, y1: 100 + H };
WORD_BOX.w = WORD_BOX.x1 - WORD_BOX.x0;
WORD_BOX.cx = (WORD_BOX.x0 + WORD_BOX.x1) / 2;
WORD_BOX.cy = (WORD_BOX.y0 + WORD_BOX.y1) / 2;

/* Two builds, and they are not interchangeable (BRAND-STANDARD 6.2):

   any       22.37% corner radius, drawn as the tile the OS shows as-is.
   maskable  square corners and the mark pulled well inside the 80% safe
             circle, because Android applies its own mask. A rounded tile
             inside a rounded mask gives clipped squircle-in-squircle edges.

   `type` is the word's width as a share of the tile: the maskable one is
   smaller so the whole word stays inside the 80% safe circle (at 72 its corners
   sit at radius ~38 of 40 - that is the ceiling, do not raise it). `any` leaves
   6 units of side margin; the word sits in the middle band, clear of the
   rounded corners. */
const VARIANTS = {
  any: { radius: 22.37, type: 88 },
  maskable: { radius: 0, type: 72 }
};

/* 192 and 512 are the manifest pair; 180 is the iOS apple-touch-icon, which is
   never masked, so it takes the rounded build. */
const SIZES = { any: [192, 512, 180], maskable: [192, 512] };

const page = (v) => {
  const k = v.type / WORD_BOX.w;
  const tx = (50 - WORD_BOX.cx * k).toFixed(3), ty = (50 - WORD_BOX.cy * k).toFixed(3);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:transparent}
  svg{display:block;width:100vw;height:100vh}
</style>
</head>
<body><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="${v.radius}" fill="${INK}"/>
  <g transform="translate(${tx} ${ty}) scale(${k.toFixed(5)})">
    <path d="${WORD_D}" fill="none" stroke="${PAPER}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg></body>
</html>
`;
};

const OUT = process.argv[2] || path.join(__dirname, "appicon");
fs.mkdirSync(path.join(OUT, "html"), { recursive: true });

/* One HTML per variant; the sizes come out of the manifest, not the filename. */
const sizes = [];
for (const [name, v] of Object.entries(VARIANTS)) {
  fs.writeFileSync(path.join(OUT, "html", `icon-${name}.html`), page(v));
  for (const px of SIZES[name]) {
    sizes.push(`${name === "any" ? `icon-${px}` : `icon-${px}-maskable`} ${name} ${px}`);
  }
}

/* outname, source variant, pixel size - the rasterizer reads dimensions from
   here rather than hardcoding them. */
fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");

console.log(`${sizes.length} icons from ${Object.keys(VARIANTS).length} variants -> ${path.relative(process.cwd(), path.join(OUT, "html"))}`);
for (const line of sizes) {
  const [out, variant, px] = line.split(" ");
  console.log(`  ${out.padEnd(22)} ${variant.padEnd(10)} ${px}x${px}`);
}
