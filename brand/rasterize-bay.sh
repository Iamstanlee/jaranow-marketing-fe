#!/bin/bash
# Screenshot bay/html via headless Chrome; tiled panels are joined by stitch-png.js.
#   node brand/gen-bay.js && brand/rasterize-bay.sh
# Needs network (Google Fonts); a failed load falls back silently - eyeball the PNGs.
#
# sizes.txt has SIX columns: base winW winH dsf tiles tileW. Pass dsf through -
# dropping it silently halves the back wall. Tiles exist because Chrome silently
# won't paint a surface that wide (CLAUDE.md "Generated assets"); if a panel comes
# back part-painted, lower PAINT_MAX in gen-bay.js and re-run both.
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
