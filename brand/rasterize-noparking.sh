#!/bin/bash
# Rasterize the generated "No parking" notices via headless Chrome.
#
# Run gen-noparking.js first - this only screenshots what is already in
# noparking/html.
#
#   node brand/gen-noparking.js && brand/rasterize-noparking.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The stylesheet uses display=block, so Chrome waits rather than painting
# fallback type - a generous virtual-time budget keeps the plates out of system
# sans. Archivo Black is where a failed load shows up first, on NO PARKING.
#
# 300dpi with 3mm bleed, same as the other print pieces - these are plates, not
# large format. Hand the PNGs to the printer as-is; they trim at the crop line.
#
#   -a3     3579x5031   297x420mm  wall plate beside the bay
#   -a2     5031x7087   420x594mm  frontage plate
#   -gate  10701x3614   900x300mm  strip for a gate, rail or bay head
#   -formats 5031x3579  A3 landscape, all three at 1:5 - for choosing, not printing
#
# Formats differ in pixel size, so dimensions come from the sizes.txt manifest
# gen-noparking.js writes. Do not hardcode one window size here.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/noparking/html"
PNGDIR="$ROOT/noparking/png"
SIZES="$HTMLDIR/sizes.txt"

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -f "$SIZES" ] || { echo "No manifest at $SIZES - run: node brand/gen-noparking.js" >&2; exit 1; }

mkdir -p "$PNGDIR"

while read -r base w h; do
  [ -n "$base" ] || continue
  html="$HTMLDIR/$base.html"
  [ -f "$html" ] || { echo "missing $html" >&2; exit 1; }
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --force-device-scale-factor=1 \
    --window-size="$w,$h" \
    --virtual-time-budget=9000 \
    --screenshot="$PNGDIR/$base.png" "file://$html" >/dev/null 2>&1
  echo "$base.png  ${w}x${h}"
done < "$SIZES"

echo
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') files to $PNGDIR"
