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
# THE MANIFEST HAS SIX COLUMNS - base, window width, window height, device scale
# factor, tile count and tile width - because the back wall is 24,464px wide and
# headless Chrome clears neither of its two ceilings at that size. It will not
# OPEN a window past ~16,384px, so gen-bay.js authors that page at half the unit
# and flags dsf=2; Chrome renders the smaller window at 2x and the screenshot
# comes out at full size. Read all the columns and pass the scale through -
# dropping it silently halves the back wall's resolution.
#
# The scale factor does NOT fix the second ceiling. Chrome also will not PAINT a
# surface that wide, and it fails silently rather than erroring: the PNG is the
# right size, a band at the top left has artwork in it and everything else is
# flat background - no headline, no lockup, no accent bar. The surface is sized
# in device pixels, which is precisely what the scale factor multiplies. So such
# a page is emitted as TILES (<base>.t0.html, .t1.html, ...), each shot inside
# both ceilings, and joined here by stitch-png.js into the one file the printer
# gets. A tiled panel is still ONE banner - the tiles are a rendering detail and
# never reach the print shop.
#
# Tiles are tileW wide except the last, which takes the remainder. If a panel
# ever comes back part-painted, lower PAINT_MAX in gen-bay.js and re-run both.
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
TILEDIR="$(mktemp -d)"
trap 'rm -rf "$TILEDIR"' EXIT

# shoot <html> <png> <window width> <window height> <device scale factor>
shoot() {
  [ -f "$1" ] || { echo "missing $1" >&2; exit 1; }
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --force-device-scale-factor="$5" \
    --window-size="$3,$4" \
    --virtual-time-budget=12000 \
    --screenshot="$2" "file://$1" >/dev/null 2>&1 </dev/null
}

while read -r base w h dsf tiles tileW; do
  [ -n "$base" ] || continue
  dsf="${dsf:-1}"; tiles="${tiles:-1}"; tileW="${tileW:-$w}"

  if [ "$tiles" -le 1 ]; then
    shoot "$HTMLDIR/$base.html" "$PNGDIR/$base.png" "$w" "$h" "$dsf"
    echo "$base.png  $((w * dsf))x$((h * dsf))$([ "$dsf" -gt 1 ] && echo "  (${w}x${h} @${dsf}x)")"
  else
    parts=()
    i=0
    while [ "$i" -lt "$tiles" ]; do
      # Every tile is tileW wide but the last, which takes what is left over.
      x=$((i * tileW))
      tw=$tileW
      if [ $((x + tw)) -gt "$w" ]; then tw=$((w - x)); fi
      shoot "$HTMLDIR/$base.t$i.html" "$TILEDIR/$base.t$i.png" "$tw" "$h" "$dsf"
      parts[$i]="$TILEDIR/$base.t$i.png"
      i=$((i + 1))
    done
    echo "$base.png  $((w * dsf))x$((h * dsf))  ($tiles tiles @${dsf}x, joined)"
    node "$ROOT/stitch-png.js" "$PNGDIR/$base.png" "${parts[@]}" </dev/null
  fi
done < "$SIZES"

echo
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') files to $PNGDIR"
