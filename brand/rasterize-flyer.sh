#!/bin/bash
# Rasterize the generated A5 flyers to 300dpi PNGs via headless Chrome.
#
# Run gen-flyer.js first - this only screenshots what is already in flyer/html.
#
#   node brand/gen-flyer.js && brand/rasterize-flyer.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The font stylesheet uses display=block, meaning Chrome will not paint fallback
# type while it waits - a generous virtual-time budget keeps the pages from
# rendering in system sans. The naira sign comes from Rubik's latin-ext subset,
# so a failed font load shows up there first.
#
# Output is 1819x2551px = A5 148x210mm trim plus 3mm bleed on all four sides.
# Hand the PNGs to the printer as-is; they trim at the crop line.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/flyer/html"
PNGDIR="$ROOT/flyer/png"
W=1819
H=2551

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -d "$HTMLDIR" ] || { echo "No templates at $HTMLDIR - run: node brand/gen-flyer.js" >&2; exit 1; }

mkdir -p "$PNGDIR"

for html in "$HTMLDIR"/*.html; do
  base=$(basename "$html" .html)
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --force-device-scale-factor=1 \
    --window-size=$W,$H \
    --virtual-time-budget=8000 \
    --screenshot="$PNGDIR/$base.png" "file://$html" >/dev/null 2>&1
  echo "$base.png  ${W}x${H}"
done

echo
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') flyers to $PNGDIR"
