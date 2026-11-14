#!/bin/bash
# Screenshot sign/html via headless Chrome, sized from sizes.txt.
#   node brand/gen-sign.js && brand/rasterize-sign.sh
# Needs network (Google Fonts); a failed load falls back silently - eyeball the PNGs.
# 2px/mm (~51dpi) is correct for large format. Sign shops usually want vector -
# send the lockup SVGs from jaranow-blue/svg/ alongside.
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
