#!/usr/bin/env bash

# Create a temporary deployment directory
DEPLOY_DIR="dist/deploy"
echo "🔧 Setting up deployment directory..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/js"

# Run Rollup to generate the bundle
echo "🔄 Running Rollup to generate bundle.js..."
npx rollup -c

# Check if bundle generation was successful
if [ ! -f "dist/bundle.js" ]; then
    echo "❌ Bundle generation failed! dist/bundle.js not found."
    exit 1
fi

# Copy only the essential files to the deployment directory
echo "📋 Copying essential files to deployment directory..."

# Copy and minify the bundle
echo "  • Processing JavaScript bundle..."
npx terser dist/bundle.js -c -m -o "$DEPLOY_DIR/js/bundle.js"

# Copy and minify CSS
echo "  • Processing CSS..."
if [ -f "src/styles.css" ]; then
    # Simple CSS minification
    cat src/styles.css | \
        sed 's/\/\*.*\*\///g' | \
        sed 's/^\s*//g' | \
        sed 's/\s*$//g' | \
        sed 's/\s*{\s*/\{/g' | \
        sed 's/\s*}\s*/\}/g' | \
        sed 's/\s*;\s*/;/g' | \
        sed 's/\s*:\s*/:/g' | \
        sed 's/,\s*/,/g' | \
        tr -d '\n' > "$DEPLOY_DIR/styles.css"
fi

# Copy index.html and just update script reference
echo "  • Processing HTML..."
if [ -f "src/index.html" ]; then
    # Copy the file
    cp src/index.html "$DEPLOY_DIR/index.html"

    # Update to use the bundled script
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's|<script type="module" src="app.js"></script>|<script src="js/bundle.js"></script>|g' "$DEPLOY_DIR/index.html"
    else
        # Linux and others
        sed -i 's|<script type="module" src="app.js"></script>|<script src="js/bundle.js"></script>|g' "$DEPLOY_DIR/index.html"
    fi
fi

# Copy favicon files directly from src root
echo "  • Copying favicon files..."
for file in favicon.svg favicon.ico favicon-192.png favicon-512.png apple-touch-icon.png site.webmanifest; do
    if [ -f "src/$file" ]; then
        cp "src/$file" "$DEPLOY_DIR/"
        echo "    ✓ Copied $file"
    else
        echo "    ⚠️ Warning: $file not found in src directory"
    fi
done

# Copy any other essential files
echo "  • Copying additional essential files..."

# Copy google verification file if it exists
if [ -f "src/google43b27a4636390494.html" ]; then
    cp src/google43b27a4636390494.html "$DEPLOY_DIR/"
    echo "    ✓ Copied Google verification file"
fi

# Copy robots.txt if it exists
if [ -f "src/robots.txt" ]; then
    cp src/robots.txt "$DEPLOY_DIR/"
    echo "    ✓ Copied robots.txt"
fi

# Copy the skating directory if it exists
if [ -d "src/skating" ]; then
    echo "  • Copying skating directory..."
    mkdir -p "$DEPLOY_DIR/skating"
    cp -r src/skating/* "$DEPLOY_DIR/skating/"
    echo "    ✓ Copied skating directory"
fi

# Define server and path
SERVER="france"
REMOTE_PATH="/var/www/isthelclcpoolopen.ca/html/"

echo "📦 Syncing optimized files → $SERVER:$REMOTE_PATH …"

# Show what will be deployed
echo "Files to be deployed:"
find "$DEPLOY_DIR" -type f | sort

# Push only the optimized files to the remote web root
rsync -avz --delete "$DEPLOY_DIR/" "$SERVER:$REMOTE_PATH"

echo "Setting proper permissions..."
ssh $SERVER "chmod -R 755 $REMOTE_PATH"
ssh $SERVER "find $REMOTE_PATH -type f -exec chmod 644 {} \;"

echo "✅ Deployment of optimized files to $SERVER:$REMOTE_PATH completed!"
