#!/usr/bin/env bash

# Define directories
SRC_DIR="src"
DIST_DIR="dist"
JS_DIR="$SRC_DIR/js"

# Make sure the directories exist
mkdir -p $DIST_DIR
mkdir -p $JS_DIR

# Start with clean output file
echo "" > dev-script.log

# Function to log messages to console and file
log() {
  echo "$1" | tee -a dev-script.log
}

# Function to clean up on exit
cleanup() {
  log "🧹 Cleaning up..."

  # Restore original index.html from backup if it exists
  if [ -f "$SRC_DIR/index.html.orig" ]; then
    cp "$SRC_DIR/index.html.orig" "$SRC_DIR/index.html"
    log "✅ Restored original index.html"
  fi

  # Kill background processes
  if [ ! -z "$ROLLUP_PID" ]; then
    kill $ROLLUP_PID 2>/dev/null
  fi
  if [ ! -z "$SERVE_PID" ]; then
    kill $SERVE_PID 2>/dev/null
  fi

  # Remove temporary files
  rm -f "$JS_DIR/bundle.js"

  log "✅ Done!"
  exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM EXIT

# Back up the original index.html
cp "$SRC_DIR/index.html" "$SRC_DIR/index.html.orig"
log "✅ Backed up original index.html"

# Run Rollup to generate the initial bundle
log "🔄 Generating initial bundle..."
npx rollup -c
if [ ! -f "$DIST_DIR/bundle.js" ]; then
  log "❌ Failed to generate bundle. Check Rollup configuration."
  exit 1
fi

# Copy the bundle to the js directory
log "📋 Copying bundle to $JS_DIR..."
cp "$DIST_DIR/bundle.js" "$JS_DIR/"
log "✅ Bundle copied to $JS_DIR/bundle.js"

# Update the script tag in index.html
log "📝 Updating index.html to use bundled script..."
# Use different sed syntax for different operating systems
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' 's|<script type="module" src="app.js"></script>|<script src="js/bundle.js"></script>|g' "$SRC_DIR/index.html"
else
  # Linux and others
  sed -i 's|<script type="module" src="app.js"></script>|<script src="js/bundle.js"></script>|g' "$SRC_DIR/index.html"
fi

# Start Rollup in watch mode
log "🔄 Starting Rollup in watch mode..."
npx rollup -c -w > rollup.log 2>&1 &
ROLLUP_PID=$!
log "✅ Rollup started with PID $ROLLUP_PID"

# Set up a file watcher to copy the bundle when it changes
log "👀 Setting up file watcher for bundle updates..."
(
  while true; do
    if [ -f "$DIST_DIR/bundle.js" ]; then
      LAST_MODIFIED=$(stat -c %Y "$DIST_DIR/bundle.js" 2>/dev/null || stat -f %m "$DIST_DIR/bundle.js")
      cp "$DIST_DIR/bundle.js" "$JS_DIR/"
      log "🔄 Bundle updated at $(date)"

      # Wait for changes
      while true; do
        sleep 1
        if [ -f "$DIST_DIR/bundle.js" ]; then
          NEW_MODIFIED=$(stat -c %Y "$DIST_DIR/bundle.js" 2>/dev/null || stat -f %m "$DIST_DIR/bundle.js")
          if [ "$NEW_MODIFIED" != "$LAST_MODIFIED" ]; then
            LAST_MODIFIED=$NEW_MODIFIED
            break
          fi
        fi
      done
    else
      sleep 1
    fi
  done
) &
WATCHER_PID=$!
log "✅ File watcher started with PID $WATCHER_PID"

# Start development server
log "🌐 Starting development server..."
npx serve "$SRC_DIR" &
SERVE_PID=$!
log "✅ Server started with PID $SERVE_PID"

# Keep script running
log "⚡ Development environment is running. Press Ctrl+C to stop."
log "🌐 Server is available at http://localhost:3000"

# Wait for everything to finish
wait $SERVE_PID
