#!/bin/bash
# Copy rasterized OG cards to their served paths. Names differ, so this mapping
# is the authority - keep it in step with ogImage in src/seo/routes.json.
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
PNGDIR="$ROOT/og/png"
PUBLIC="$(cd "$ROOT/.." && pwd)/public"

copy () { # $1=generated name  $2=served path (relative to public/)
  local src="$PNGDIR/$1.png"
  local dst="$PUBLIC/$2"
  [ -f "$src" ] || { echo "missing $src - run brand/rasterize-og.sh first" >&2; exit 1; }
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  echo "$1.png  ->  public/$2"
}

copy opengraph-jaranow  jaranow/opengraph.png
copy opengraph-carwash  carwash/opengraph.png
copy opengraph-laundry  wash/opengraph.png
copy opengraph-pricing  jaranow/opengraph-pricing.png
copy opengraph-business business/opengraph.png
copy opengraph-rugs     rugs/opengraph.png
