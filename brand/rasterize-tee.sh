#!/bin/bash
# Rasterize the generated tee mockup sheets to PNG via headless Chrome.
#
# Run gen-tee.js first - this only screenshots what is already in tee/html.
#
#   node brand/gen-tee.js && brand/rasterize-tee.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The font stylesheet uses display=block, meaning Chrome will not paint fallback
# type while it waits - a generous virtual-time budget keeps the sheets from
# rendering in system sans.
#
# Output is 1800x1100 presentation sheets. These are for approving placement and
# colourway - they are NOT print artwork. Send a printer the lockup SVGs from
# jaranow-blue/svg plus the millimetre figures in the captions.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/tee/html"
PNGDIR="$ROOT/tee/png"
W=1800
H=1100

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -d "$HTMLDIR" ] || { echo "No templates at $HTMLDIR - run: node brand/gen-tee.js" >&2; exit 1; }

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
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') sheets to $PNGDIR"
