#!/bin/bash
# Screenshot pricelist/html to 300dpi PNGs (A4 + 3mm bleed) via headless Chrome.
#   node brand/gen-pricelist.js && brand/rasterize-pricelist.sh
# Needs network (Google Fonts); a failed load falls back silently - eyeball the PNGs.
# The ₦ (latin-ext subset) is where a failed load shows first.
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
