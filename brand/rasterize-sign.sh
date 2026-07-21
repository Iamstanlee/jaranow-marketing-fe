#!/bin/bash
# Rasterize the generated roadside signage panels via headless Chrome.
#
# Run gen-sign.js first - this only screenshots what is already in sign/html.
#
#   node brand/gen-sign.js && brand/rasterize-sign.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The font stylesheet uses display=block, meaning Chrome will not paint fallback
# type while it waits - a generous virtual-time budget keeps the panels from
# rendering in system sans.
#
# Panels are 2px/mm (~51dpi at full size, which is correct for large format).
# Portrait and landscape are different pixel sizes, so dimensions come from the
# sizes.txt manifest gen-sign.js writes - do not hardcode one window size here.
#
# These are proofs and a usable starting point, but a sign shop will normally
# want vector - hand them the lockup SVGs from jaranow-blue/svg/ alongside.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/sign/html"
PNGDIR="$ROOT/sign/png"
SIZES="$HTMLDIR/sizes.txt"

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -f "$SIZES" ] || { echo "No manifest at $SIZES - run: node brand/gen-sign.js" >&2; exit 1; }

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
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') panels to $PNGDIR"
