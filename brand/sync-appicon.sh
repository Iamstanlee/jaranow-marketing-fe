#!/bin/bash
# Copy the rasterized Business Desk icons into the paths the site serves them from.
#
# Keep this mapping in step with the icons array in public/bookkeeping-manifest.json
# and the appleTouchIcon field for /__/book in src/seo/routes.json.
#
# These live under public/book/ and never overwrite public/jaranow/ - that set is
# the Jaranow app's own icons and is a different install.
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
PNGDIR="$ROOT/appicon/png"
PUBLIC="$(cd "$ROOT/.." && pwd)/public"

copy () { # $1=generated name  $2=served path (relative to public/)
  local src="$PNGDIR/$1.png"
  local dst="$PUBLIC/$2"
  [ -f "$src" ] || { echo "missing $src - run brand/rasterize-appicon.sh first" >&2; exit 1; }
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  echo "$1.png  ->  public/$2"
}

copy icon-192           book/icon-192.png
copy icon-512           book/icon-512.png
copy icon-192-maskable  book/icon-192-maskable.png
copy icon-512-maskable  book/icon-512-maskable.png
copy icon-180           book/apple-touch-icon.png
