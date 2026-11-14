#!/bin/bash
# Screenshot card/html to 300dpi PNGs (85x55mm + 3mm bleed) via headless Chrome.
#   node brand/gen-card.js && brand/rasterize-card.sh
#   brand/rasterize-card.sh batch      # card/batch/html -> card/batch/png
# Needs network (Google Fonts); a failed load falls back silently - eyeball the PNGs.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
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
