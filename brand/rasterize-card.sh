#!/bin/bash
# Rasterize the generated complimentary-card templates to 300dpi PNGs via
# headless Chrome.
#
# Run gen-card.js first - this only screenshots what is already in card/html.
#
#   node brand/gen-card.js && brand/rasterize-card.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The font stylesheet uses display=block, meaning Chrome will not paint fallback
# type while it waits - a generous virtual-time budget keeps the cards from
# rendering in system sans.
#
# Output is 1075x720px = 85x55mm trim plus 3mm bleed on all four sides. Hand the
# PNGs to the printer as-is; they add their own crop marks at the trim line.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
# Optional first arg is a subdirectory under card/, e.g. `rasterize-card.sh batch`
# renders card/batch/html -> card/batch/png. No arg renders the base templates.
SUB="${1:+/$1}"
HTMLDIR="$ROOT/card${SUB}/html"
PNGDIR="$ROOT/card${SUB}/png"
W=1075
H=720

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -d "$HTMLDIR" ] || { echo "No templates at $HTMLDIR - run: node brand/gen-card.js${1:+ --batch}" >&2; exit 1; }

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
