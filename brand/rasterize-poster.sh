#!/bin/bash
# Rasterize the generated recruitment posters via headless Chrome.
#
# Run gen-poster.js first - this only screenshots what is already in
# poster/html.
#
#   node brand/gen-poster.js && brand/rasterize-poster.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The font stylesheet uses display=block, meaning Chrome will not paint fallback
# type while it waits - a generous virtual-time budget keeps the pages from
# rendering in system sans. Eyeball the PNGs afterwards: a failed font load
# falls back to system sans silently.
#
# Each posting is emitted in several formats at different pixel sizes, so
# dimensions come from the sizes.txt manifest gen-poster.js writes - do not
# hardcode one window size here.
#
#   -a4     2551x3579  A4 210x297mm trim + 3mm bleed @ 300dpi. Hand this to the
#                      printer as-is; they trim at the crop line.
#   -feed   1080x1350  Meta feed, 4:5
#   -story  1080x1920  Meta stories / Reels, 9:16
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/poster/html"
PNGDIR="$ROOT/poster/png"
SIZES="$HTMLDIR/sizes.txt"

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -f "$SIZES" ] || { echo "No manifest at $SIZES - run: node brand/gen-poster.js" >&2; exit 1; }

mkdir -p "$PNGDIR"

while read -r base w h; do
  [ -n "$base" ] || continue
  html="$HTMLDIR/$base.html"
  [ -f "$html" ] || { echo "missing $html" >&2; exit 1; }
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --force-device-scale-factor=1 \
    --window-size="$w,$h" \
    --virtual-time-budget=8000 \
    --screenshot="$PNGDIR/$base.png" "file://$html" >/dev/null 2>&1
  echo "$base.png  ${w}x${h}"
done < "$SIZES"

echo
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') posters to $PNGDIR"
