/* Jaranow - app icon generator for the Business Desk PWA.
   Usage:  node brand/gen-appicon.js [outdir]

   The books app is an internal tool, not a marketing surface, and it sits on the
   same home screen as the Jaranow app. It therefore takes the "J" tile from the
   dashboard sidebar rather than the drop symbol, so the launcher icon and the
   thing you see once it opens are the same object. Everything public keeps the
   symbol (BRAND-STANDARD 3.2) - do not reach for this monogram anywhere else.

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

const ACCENT = "#2563EB";
const PAPER = "#FFFFFF";

/* Two builds, and they are not interchangeable (BRAND-STANDARD 6.2):

   any       22.37% corner radius, drawn as the tile the OS shows as-is.
   maskable  square corners and the mark pulled well inside the 80% safe
             circle, because Android applies its own mask. A rounded tile
             inside a rounded mask gives clipped squircle-in-squircle edges.

   `type` is cap height as a share of the tile: the maskable one is smaller so
   the letter survives an aggressive circular crop. */
const VARIANTS = {
  any: { radius: 22.37, type: 62 },
  maskable: { radius: 0, type: 50 }
};

/* 192 and 512 are the manifest pair; 180 is the iOS apple-touch-icon, which is
   never masked, so it takes the rounded build. */
const SIZES = { any: [192, 512, 180], maskable: [192, 512] };

const page = (v) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@900&display=block" rel="stylesheet">
<style>
  html,body{margin:0;padding:0;background:transparent}
  .tile{
    width:100vw;height:100vh;border-radius:${v.radius}vw;background:${ACCENT};
    display:flex;align-items:center;justify-content:center;overflow:hidden;
  }
  /* Optical, not metric: the J's tail hangs below the baseline, so centring the
     line box leaves the letter sitting low. Nudge it back up by 4% of the tile. */
  .j{
    font-family:'Rubik',system-ui,sans-serif;font-weight:900;color:${PAPER};
    font-size:${v.type}vw;line-height:1;letter-spacing:0;
    transform:translateY(-4%);
  }
</style>
</head>
<body><div class="tile"><span class="j">J</span></div></body>
</html>
`;

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
