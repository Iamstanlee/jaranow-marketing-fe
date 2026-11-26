/* Jaranow - books app icon. Ink tile, a "B" in Paper; the one place a monogram
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

/* B copied from gen-marks.js's G table (can't import it - it writes files on load).
   One letter is set large, so it keeps the face's own 14 stroke. */
const SW = 14;
const H = SW / 2;
const B = "M7 93 V16 H33 A14 14 0 0 1 47 30 V40 A14 14 0 0 1 33 54 H7 M7 54 H40 A14 14 0 0 1 54 68 V79 A14 14 0 0 1 40 93 H7";
const BOX = { x0: 7 - H, x1: 54 + H, y0: 16 - H, y1: 93 + H };
BOX.h = BOX.y1 - BOX.y0;
BOX.cx = (BOX.x0 + BOX.x1) / 2;
BOX.cy = (BOX.y0 + BOX.y1) / 2;

/* Not interchangeable (BRAND-STANDARD §7): maskable is square because Android
   applies its own mask. `type` = letter height as % of tile; maskable 58 puts the
   B's corners at radius ~35 of the 40 safe circle. */
const VARIANTS = {
  any: { radius: 22.37, type: 66 },
  maskable: { radius: 0, type: 58 }
};

// 180 is the iOS apple-touch-icon: never masked, so it takes the rounded build.
const SIZES = { any: [192, 512, 180], maskable: [192, 512] };

const page = (v) => {
  const k = v.type / BOX.h;
  const tx = (50 - BOX.cx * k).toFixed(3), ty = (50 - BOX.cy * k).toFixed(3);
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
    <path d="${B}" fill="none" stroke="${PAPER}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/>
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
