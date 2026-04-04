#!/usr/bin/env bash
set -euo pipefail

# Build script: combines the landing page + Expo web app into a single output
# Output structure:
#   dist/
#     index.html          <- landing page (vitrine)
#     BukhariScript.ttf   <- font for landing
#     app/                <- Expo web build (PWA)
#       index.html
#       manifest.json
#       sw.js
#       ...

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

echo "==> Cleaning dist/"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

echo "==> Building Expo web app..."
cd "$ROOT_DIR/Front"
npx expo export --platform web

echo "==> Assembling final output..."

# 1. Copy landing page to root of dist/
cp "$ROOT_DIR/landing/index.html" "$DIST_DIR/index.html"
cp "$ROOT_DIR/landing/BukhariScript.ttf" "$DIST_DIR/BukhariScript.ttf"

# 2. Copy Expo build output into dist/app/
mkdir -p "$DIST_DIR/app"
cp -r "$ROOT_DIR/Front/dist/"* "$DIST_DIR/app/"

echo "==> Build complete! Output in dist/"
echo "    Landing page: dist/index.html"
echo "    App (PWA):    dist/app/"
