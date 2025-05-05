#!/usr/bin/env bash
set -euo pipefail

# ─── CONFIG ────────────────────────────────────────────────────────────────────
SERVER="france"
REMOTE_WEB="/var/www/isthelclcpoolopen.ca/html"
# On the remote side, use the SSH user’s $HOME
REMOTE_SCRAPERS="\$HOME/scrapers"

BUILD_DIR="build"
APP_TAR="app.tar.gz"
SCRAPERS_TAR="scrapers.tar.gz"

# ─── CLEANUP ON EXIT ───────────────────────────────────────────────────────────
cleanup(){
  rm -f "$APP_TAR" "$SCRAPERS_TAR"
}
trap cleanup EXIT

# ─── 1) BUILD ──────────────────────────────────────────────────────────────────
echo "🔧 Running React build…"
npm run build
[ -d "$BUILD_DIR" ] || { echo "❌ Build failed: '$BUILD_DIR' not found"; exit 1; }

# ─── 2) PACKAGE TARBALLS (no xattrs) ────────────────────────────────────────────
echo "📦 Packaging web app → $APP_TAR"
COPYFILE_DISABLE=1 tar -C "$BUILD_DIR" -czf "$APP_TAR" .

echo "📦 Packaging scrapers → $SCRAPERS_TAR"
COPYFILE_DISABLE=1 tar \
  --exclude='node_modules' \
  --exclude='data/*.json' \
  -C scrapers -czf "$SCRAPERS_TAR" .

# ─── 3) UPLOAD ─────────────────────────────────────────────────────────────────
echo "🚀 Uploading artifacts to $SERVER…"
scp "$APP_TAR" "$SCRAPERS_TAR" "$SERVER":/tmp/

# ─── 4) REMOTE DEPLOY ─────────────────────────────────────────────────────────
ssh "$SERVER" bash <<'EOF'
set -euo pipefail

# Remote‐side variables:
REMOTE_WEB="/var/www/isthelclcpoolopen.ca/html"
REMOTE_DATA="/var/www/isthelclcpoolopen.ca/data"
REMOTE_SCRAPERS="\$HOME/scrapers"
APP_TAR="app.tar.gz"
SCRAPERS_TAR="scrapers.tar.gz"

echo "👉 Clearing & extracting web app…"
rm -rf "\$REMOTE_WEB"/*
mkdir -p "\$REMOTE_WEB"
tar --warning=no-unknown-keyword -xzf /tmp/\$APP_TAR -C "\$REMOTE_WEB" 2>/dev/null
rm /tmp/\$APP_TAR
chmod -R 775 "\$REMOTE_WEB"

echo "👉 Deploying scrapers…"
rm -rf "\$REMOTE_SCRAPERS"
mkdir -p "\$REMOTE_SCRAPERS/logs" "\$REMOTE_SCRAPERS/data"
tar --warning=no-unknown-keyword -xzf /tmp/\$SCRAPERS_TAR -C "\$REMOTE_SCRAPERS" 2>/dev/null
rm /tmp/\$SCRAPERS_TAR

cd "\$REMOTE_SCRAPERS"
npm install --omit=dev --no-audit --no-fund --loglevel=error

echo "👉 Ensuring data directory exists…"
mkdir -p "\$REMOTE_DATA"
chmod 775 "\$REMOTE_DATA"

echo "👉 Ensuring crontab entries…"
declare -a CRONS=(
  # pool scraper every 30m
  "*/30 * * * *  cd \$REMOTE_SCRAPERS && DATA_PATH=\$REMOTE_DATA node pool-scraper.js >> \$REMOTE_SCRAPERS/logs/pool-scraper.log 2>&1"
  # skating scraper daily at 01:00
  "0 1 * * *     cd \$REMOTE_SCRAPERS && DATA_PATH=\$REMOTE_DATA node skating-scraper.js >> \$REMOTE_SCRAPERS/logs/skating-scraper.log 2>&1"
  # libraries scraper daily at 02:00
  "0 2 * * *     cd \$REMOTE_SCRAPERS && DATA_PATH=\$REMOTE_DATA node libraries-scraper.js >> \$REMOTE_SCRAPERS/logs/libraries-scraper.log 2>&1"
)

( crontab -l 2>/dev/null \
    | grep -Fv -f <(printf "%s\n" "\${CRONS[@]}") \
  ; printf "%s\n" "\${CRONS[@]}" ) \
  | crontab -

echo "✅ Deployment complete!"
EOF

echo "🎉 All done!"
