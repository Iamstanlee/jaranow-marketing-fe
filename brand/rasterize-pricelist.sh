#!/bin/bash
# Rasterize the generated price lists to 300dpi PNGs via headless Chrome.
#
# Run gen-pricelist.js first - this only screenshots what is already in
# pricelist/html.
#
#   node brand/gen-pricelist.js && brand/rasterize-pricelist.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The font stylesheet uses display=block, meaning Chrome will not paint fallback
# type while it waits - a generous virtual-time budget keeps the pages from
# rendering in system sans. The naira sign comes from Rubik's latin-ext subset,
# so a failed font load shows up there first.
#
# Output is 2551x3579px = A4 210x297mm trim plus 3mm bleed on all four sides.
# Hand the PNGs to the printer as-is; they trim at the crop line.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/pricelist/html"
PNGDIR="$ROOT/pricelist/png"
W=2551
H=3579

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -d "$HTMLDIR" ] || { echo "No templates at $HTMLDIR - run: node brand/gen-pricelist.js" >&2; exit 1; }

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
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') lists to $PNGDIR"
