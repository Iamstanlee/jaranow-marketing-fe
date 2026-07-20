#!/bin/bash
# Rasterize the generated Open Graph templates to 1200x630 PNGs via headless Chrome.
#
# Run gen-og.js first - this only screenshots what is already in og/html.
#
#   node brand/gen-og.js && brand/rasterize-og.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The font stylesheet uses display=block, meaning Chrome will not paint fallback
# type while it waits - a generous virtual-time budget keeps the cards from
# rendering in system sans.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/og/html"
PNGDIR="$ROOT/og/png"
W=1200
H=630

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -d "$HTMLDIR" ] || { echo "No templates at $HTMLDIR - run: node brand/gen-og.js" >&2; exit 1; }

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
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') cards to $PNGDIR"
echo "Copy into the site with: brand/sync-og.sh"
