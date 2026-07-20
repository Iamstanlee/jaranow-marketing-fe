#!/bin/bash
# Rasterize the generated SVGs to transparent PNGs via headless Chrome.
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$1"
SVGDIR="$ROOT/svg"
PNGDIR="$ROOT/png"
TMP="$2"
mkdir -p "$PNGDIR" "$TMP"

shoot () { # $1=svg path  $2=out png  $3=width px  $4=height px
  local html="$TMP/w.html"
  cat > "$html" <<EOF
<style>html,body{margin:0;padding:0;background:transparent}
img{display:block;width:${3}px;height:${4}px}</style>
<img src="file://$1">
EOF
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --default-background-color=00000000 \
    --force-device-scale-factor=1 \
    --window-size=$3,$4 \
    --virtual-time-budget=2000 \
    --screenshot="$2" "file://$html" >/dev/null 2>&1
}

for f in "$SVGDIR"/*.svg; do
  base=$(basename "$f" .svg)
  # intrinsic size from the svg attributes
  W=$(grep -o 'width="[0-9.]*"' "$f" | head -1 | grep -o '[0-9.]*')
  H=$(grep -o 'height="[0-9.]*"' "$f" | head -1 | grep -o '[0-9.]*')

  case "$base" in
    *symbol*|*app-icon*) TW=1024 ;;
    *)                   TW=2048 ;;
  esac
  TH=$(python3 -c "print(max(1,round($H*$TW/$W)))")
  shoot "$f" "$PNGDIR/$base.png" "$TW" "$TH"
  echo "$base.png  ${TW}x${TH}"
done

# favicon / launcher sizes from the ink app icon
for s in 512 256 180 128 64 32 16; do
  shoot "$SVGDIR/jaranow-favicon.svg" "$PNGDIR/jaranow-icon-${s}.png" "$s" "$s"
  echo "jaranow-icon-${s}.png  ${s}x${s}"
done
