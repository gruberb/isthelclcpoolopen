#!/usr/bin/env bash
set -euo pipefail

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SERVER="france"                                      # SSH host alias
REMOTE_WEB="/var/www/isthelclcpoolopen.ca/html"      # Web root on server
REMOTE_SCRAPERS="/home/gruberb/scrapers"              # Scrapers dir under your home

BUILD_DIR="build"            # CRA’s default output
APP_TAR="app.tar.gz"
SCRAPERS_TAR="scrapers.tar.gz"

# ─── CLEANUP ON EXIT ───────────────────────────────────────────────────────────
cleanup() {
  rm -f "$APP_TAR" "$SCRAPERS_TAR"
}
trap cleanup EXIT

# ─── 1) BUILD ──────────────────────────────────────────────────────────────────
echo "🔧 Running React build…"
npm run build
[ -d "$BUILD_DIR" ] || { echo "❌ Build failed: '$BUILD_DIR' not found"; exit 1; }

# ─── 2) PACKAGE TARBALLS ───────────────────────────────────────────────────────
echo "📦 Packaging web app → $APP_TAR"
tar -C "$BUILD_DIR" -czf "$APP_TAR" .

echo "📦 Packaging scrapers → $SCRAPERS_TAR"
tar --exclude='node_modules' --exclude='data/*.json' -C scrapers -czf "$SCRAPERS_TAR" .

# ─── 3) UPLOAD ─────────────────────────────────────────────────────────────────
echo "🚀 Uploading artifacts to $SERVER..."
scp "$APP_TAR" "$SCRAPERS_TAR" "$SERVER":/tmp/

# ─── 4) REMOTE DEPLOY ─────────────────────────────────────────────────────────
ssh "$SERVER" bash <<EOF
# First, bring your variables into this remote shell:
REMOTE_WEB="$REMOTE_WEB"
REMOTE_SCRAPERS="$REMOTE_SCRAPERS"
APP_TAR="$APP_TAR"
SCRAPERS_TAR="$SCRAPERS_TAR"

set -euo pipefail

echo "👉 Clearing & extracting web app…"
rm -rf "\$REMOTE_WEB"/*
mkdir -p "\$REMOTE_WEB"
tar -xzf /tmp/\$APP_TAR -C "\$REMOTE_WEB"
rm /tmp/\$APP_TAR
chmod -R 775 "\$REMOTE_WEB"

echo "👉 Deploying scrapers…"
rm -rf "\$REMOTE_SCRAPERS"
mkdir -p "\$REMOTE_SCRAPERS/logs" "\$REMOTE_SCRAPERS/data"
tar -xzf /tmp/\$SCRAPERS_TAR -C "\$REMOTE_SCRAPERS"
rm /tmp/\$SCRAPERS_TAR

cd "\$REMOTE_SCRAPERS"
npm install --production
chmod +x *.js

echo "👉 Ensuring crontab entries…"
declare -a CRONS=(
  "*/30 * * * * cd \$REMOTE_SCRAPERS && node pool-scraper.js >> \$REMOTE_SCRAPERS/logs/pool-scraper.log 2>&1"
  "0 1 * * *  cd \$REMOTE_SCRAPERS && node skating-scraper.js >> \$REMOTE_SCRAPERS/logs/skating-scraper.log 2>&1"
  "0 2 * * *  cd \$REMOTE_SCRAPERS && node libraries-scraper.js >> \$REMOTE_SCRAPERS/logs/libraries-scraper.log 2>&1"
  "*/31 * * * * cp \$REMOTE_SCRAPERS/data/*.json \$REMOTE_WEB/data/"
)

# Rebuild crontab without duplicates
( crontab -l 2>/dev/null \
    | grep -Fv -f <(printf "%s\n" "\${CRONS[@]}") \
  ; printf "%s\n" "\${CRONS[@]}" ) \
  | crontab -

echo "✅ Deployment complete!"
EOF

echo "🎉 All done!"
