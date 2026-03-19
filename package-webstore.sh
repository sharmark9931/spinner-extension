#!/usr/bin/env bash
# Chrome Web Store requires manifest.json at the ROOT of the zip — not inside a subfolder.
# Run from this directory: ./package-webstore.sh
set -e
cd "$(dirname "$0")"
OUT="spinner-extension-store.zip"
rm -f "$OUT"
zip -r "$OUT" \
  manifest.json \
  popup.html \
  popup.css \
  popup.js \
  google-apps.js \
  frequent-sites.js \
  icons/
echo "Created: $(pwd)/$OUT"
echo "First entries (manifest must be at root, no parent folder):"
unzip -l "$OUT" | head -20
