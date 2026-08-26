#!/bin/bash
# Rasterize the generated wash-bay banner set via headless Chrome.
#
# Run gen-bay.js first - this only screenshots what is already in bay/html.
#
#   node brand/gen-bay.js && brand/rasterize-bay.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The stylesheet uses display=block, so Chrome waits rather than painting
# fallback type - a generous virtual-time budget keeps the panels out of system
# sans. Archivo Black is where a failed load shows up first, on the two
# headlines.
#
# Panels are 2px/mm (~51dpi at full size, correct for large format).
#
# The manifest carries FOUR columns - base, window width, window height and a
# device scale factor - because the back wall is 25,680px wide and headless
# Chrome will not open a window past ~16,384. gen-bay.js authors that page at
# half the unit and flags dsf=2; Chrome renders the smaller window at 2x and the
# screenshot comes out at full size. Read all four columns and pass the scale
# through - dropping it silently halves the back wall's resolution.
#
# The PNGs are production files for a banner printer; the mockup and spec sheet
# are not - hand those over as reference, and send the lockup SVGs from
# jaranow-blue/svg/ alongside if the shop would rather set the marks in vector.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/bay/html"
PNGDIR="$ROOT/bay/png"
SIZES="$HTMLDIR/sizes.txt"

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -f "$SIZES" ] || { echo "No manifest at $SIZES - run: node brand/gen-bay.js" >&2; exit 1; }

mkdir -p "$PNGDIR"

while read -r base w h dsf; do
  [ -n "$base" ] || continue
  dsf="${dsf:-1}"
  html="$HTMLDIR/$base.html"
  [ -f "$html" ] || { echo "missing $html" >&2; exit 1; }
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --force-device-scale-factor="$dsf" \
    --window-size="$w,$h" \
    --virtual-time-budget=12000 \
    --screenshot="$PNGDIR/$base.png" "file://$html" >/dev/null 2>&1
  echo "$base.png  $((w * dsf))x$((h * dsf))$([ "$dsf" -gt 1 ] && echo "  (${w}x${h} @${dsf}x)")"
done < "$SIZES"

echo
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') files to $PNGDIR"
