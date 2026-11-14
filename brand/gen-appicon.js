/* Jaranow - books app icon. Ink tile, "BOOK" in Paper; the one place a monogram
   replaces the drop (CLAUDE.md "Book app icon", BRAND-STANDARD 2.4). Same tile as
   src/book/components/BookMark.tsx - change both.
   Authored in vw/vh and rendered once at RENDER_PX then resampled: headless Chrome
   won't open a window below ~500px, so a 192px shot comes back as a crop.

     node brand/gen-appicon.js     # -> brand/appicon/html/*.html + sizes.txt
     brand/rasterize-appicon.sh    # html -> brand/appicon/png/*.png
     brand/sync-appicon.sh         # png  -> public/book/
*/
const fs = require("fs");
const path = require("path");

const INK = "#0E1526";
const PAPER = "#F2F5FB";

/* Copied from gen-marks.js's G table (can't import it - it writes files on load).
   SW thickens the stroke around the same centre lines (14 reads thin on a home
   screen). Keep SW <= 20: past ~22 the B's upper counter closes at 40px. */
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
const WORD_BOX = { x0: 7 - H, x1: right, y0: 16 - H, y1: 100 + H };
WORD_BOX.w = WORD_BOX.x1 - WORD_BOX.x0;
WORD_BOX.cx = (WORD_BOX.x0 + WORD_BOX.x1) / 2;
WORD_BOX.cy = (WORD_BOX.y0 + WORD_BOX.y1) / 2;

/* Not interchangeable (BRAND-STANDARD §7): maskable is square because Android
   applies its own mask. `type` = word width as % of tile; maskable 72 puts the
   word's corners at radius ~38 of the 40 safe circle - the ceiling, don't raise. */
const VARIANTS = {
  any: { radius: 22.37, type: 88 },
  maskable: { radius: 0, type: 72 }
};

// 180 is the iOS apple-touch-icon: never masked, so it takes the rounded build.
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

const sizes = [];
for (const [name, v] of Object.entries(VARIANTS)) {
  fs.writeFileSync(path.join(OUT, "html", `icon-${name}.html`), page(v));
  for (const px of SIZES[name]) {
    sizes.push(`${name === "any" ? `icon-${px}` : `icon-${px}-maskable`} ${name} ${px}`);
  }
}

// sizes.txt: outname, variant, px
fs.writeFileSync(path.join(OUT, "html", "sizes.txt"), sizes.join("\n") + "\n");

console.log(`${sizes.length} icons from ${Object.keys(VARIANTS).length} variants -> ${path.relative(process.cwd(), path.join(OUT, "html"))}`);
for (const line of sizes) {
  const [out, variant, px] = line.split(" ");
  console.log(`  ${out.padEnd(22)} ${variant.padEnd(10)} ${px}x${px}`);
}
