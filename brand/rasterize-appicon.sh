#!/bin/bash
# Screenshot appicon/html via headless Chrome, then resample per sizes.txt.
#   node brand/gen-appicon.js && brand/rasterize-appicon.sh
# Drawn geometry, no fonts, so no network needed.
# Rendered once at RENDER and resampled: Chrome won't open a window below ~500px
# and silently returns a crop instead.
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")" && pwd)"
HTMLDIR="$ROOT/appicon/html"
PNGDIR="$ROOT/appicon/png"
SIZES="$HTMLDIR/sizes.txt"
RENDER=1024

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2; exit 1; }
[ -f "$SIZES" ] || { echo "No manifest at $SIZES - run: node brand/gen-appicon.js" >&2; exit 1; }

mkdir -p "$PNGDIR"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

for variant in $(awk '{print $2}' "$SIZES" | sort -u); do
  html="$HTMLDIR/icon-$variant.html"
  [ -f "$html" ] || { echo "missing $html" >&2; exit 1; }
  # Transparent background so the rounded build keeps its corners.
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --default-background-color=00000000 \
    --force-device-scale-factor=1 \
    --window-size="$RENDER,$RENDER" \
    --virtual-time-budget=8000 \
    --screenshot="$TMP/$variant.png" "file://$html" >/dev/null 2>&1
  echo "rendered $variant at ${RENDER}x${RENDER}"
done

while read -r out variant px; do
  [ -n "$out" ] || continue
  cp "$TMP/$variant.png" "$PNGDIR/$out.png"
  sips -z "$px" "$px" "$PNGDIR/$out.png" >/dev/null
  echo "$out.png  ${px}x${px}"
done < "$SIZES"

echo
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') icons to $PNGDIR"
