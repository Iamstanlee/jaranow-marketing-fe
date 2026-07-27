#!/bin/bash
# Rasterize the Business Desk app icons via headless Chrome.
#
# Run gen-appicon.js first - this only screenshots what is already in
# appicon/html.
#
#   node brand/gen-appicon.js && brand/rasterize-appicon.sh
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# The stylesheet uses display=block, so Chrome will not paint fallback type while
# it waits - but always eyeball the PNGs, because a failed font load silently
# gives you a system-sans J instead of Rubik 900.
#
# Each variant is rendered ONCE at RENDER px and then resampled to the sizes in
# sizes.txt. Do not screenshot at the target size instead: headless Chrome will
# not open a window below roughly 500px, and rather than failing it returns a
# crop of a larger viewport - which looks like a J with most of it missing.
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

# One render per variant, at a size Chrome will actually honour.
for variant in $(awk '{print $2}' "$SIZES" | sort -u); do
  html="$HTMLDIR/icon-$variant.html"
  [ -f "$html" ] || { echo "missing $html" >&2; exit 1; }
  # Transparent default background so the rounded build keeps its corners; the
  # maskable build paints the full square itself.
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
  # sips ships with macOS, as does the Chrome path above; -z keeps the alpha.
  sips -z "$px" "$px" "$PNGDIR/$out.png" >/dev/null
  echo "$out.png  ${px}x${px}"
done < "$SIZES"

echo
echo "Wrote $(ls -1 "$PNGDIR"/*.png | wc -l | tr -d ' ') icons to $PNGDIR"
