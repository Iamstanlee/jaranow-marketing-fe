#!/bin/bash
# Render the staff documents in docs/ to print-ready A4 PDFs via headless Chrome.
#
#   docs/rasterize-docs.sh                      # every docs/*.html -> docs/pdf/
#   docs/rasterize-docs.sh employee-handbook    # just that one
#   docs/rasterize-docs.sh docs/cashier-guide.html
#
# These HTML files are Artifact sources, so they carry no <!doctype>, <head> or
# <body> - the Artifact host supplies those at publish time. This script wraps
# each one in that skeleton plus an @page rule before printing, which is the only
# reason a plain `chrome --print-to-pdf` on them comes out unpaginated.
#
# Type is pulled from Google Fonts at render time, so this needs network access.
# A failed font load silently falls back to system sans, so the run checks each
# finished PDF for embedded Rubik/Archivo Black and warns rather than handing
# back a document that quietly lost its typography.
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/pdf"

PAGE_SIZE="${PAGE_SIZE:-A4}"
PAGE_MARGIN="${PAGE_MARGIN:-14mm 16mm}"
# Google Fonts uses display=swap here, but the faces still need time to land;
# printing early is how a document ends up in system sans.
BUDGET="${BUDGET:-15000}"

[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME" >&2
                      echo "Set CHROME=/path/to/chrome to override." >&2; exit 1; }

# Collect targets: explicit args (bare name or path) or every html in docs/.
targets=()
if [ "$#" -gt 0 ]; then
  for a in "$@"; do
    for cand in "$a" "$ROOT/$a" "$ROOT/$a.html"; do
      [ -f "$cand" ] && { targets+=("$cand"); continue 2; }
    done
    echo "No such document: $a" >&2; exit 1
  done
else
  for f in "$ROOT"/*.html; do [ -e "$f" ] && targets+=("$f"); done
fi
[ "${#targets[@]}" -gt 0 ] || { echo "No HTML documents in $ROOT" >&2; exit 1; }

mkdir -p "$OUT"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

fail=0
for html in "${targets[@]}"; do
  base="$(basename "$html" .html)"
  src="$work/$base.html"

  # A file that already carries its own document skeleton is printed as-is; its
  # own @page (if any) wins. Otherwise wrap it the way the Artifact host does.
  if head -c 400 "$html" | grep -qiE '<!doctype|<html'; then
    cp "$html" "$src"
  else
    { printf '%s\n' '<!doctype html><html lang="en"><head><meta charset="utf-8">'
      printf '<style>@page{size:%s;margin:%s}html,body{margin:0}</style>\n' \
             "$PAGE_SIZE" "$PAGE_MARGIN"
      printf '%s\n' '</head><body>'
      cat "$html"
      printf '%s\n' '</body></html>'
    } > "$src"
  fi

  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget="$BUDGET" \
    --print-to-pdf="$OUT/$base.pdf" "file://$src" >/dev/null 2>&1

  [ -s "$OUT/$base.pdf" ] || { echo "  $base.pdf FAILED to render" >&2; fail=1; continue; }

  pages="?"
  if command -v python3 >/dev/null; then
    pages=$(python3 -c "
import re,sys
d=open(sys.argv[1],'rb').read()
m=re.search(rb'/Count\s+(\d+)',d)
print(m.group(1).decode() if m else '?')" "$OUT/$base.pdf")
  fi

  size=$(du -h "$OUT/$base.pdf" | cut -f1 | tr -d ' ')
  printf '  %-28s %s pages, %s\n' "$base.pdf" "$pages" "$size"

  # grep -c, not grep -q: -q exits on the first match and SIGPIPEs strings,
  # which under `set -o pipefail` fails the pipeline on success.
  faces=$(strings "$OUT/$base.pdf" | grep -cE 'Rubik|ArchivoBlack' || true)
  if [ "$faces" -eq 0 ]; then
    echo "    warning: no Rubik/Archivo Black embedded - the fonts did not load," >&2
    echo "             so this PDF is set in system sans. Check network and re-run." >&2
    fail=1
  fi
done

echo
echo "PDFs in ${OUT#"$(cd "$ROOT/.." && pwd)"/}"
[ "$fail" -eq 0 ] || { echo "One or more documents need attention (see warnings above)." >&2; exit 1; }
