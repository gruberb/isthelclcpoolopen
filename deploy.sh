#!/usr/bin/env bash

# Create a temporary deployment directory
DEPLOY_DIR="dist/deploy"
echo "🔧 Setting up deployment directory..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/js"
mkdir -p "$DEPLOY_DIR/data"  # Create data directory for JSON files

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
    cp src/styles.css "$DEPLOY_DIR/styles.css"
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
        cp src/$file "$DEPLOY_DIR/"
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
    cp -rf src/skating/* "$DEPLOY_DIR/skating/"
    echo "    ✓ Copied skating directory"
elif [ -d "skating" ]; then
    echo "  • Copying skating directory from root..."
    mkdir -p "$DEPLOY_DIR/skating"
    cp -rf skating/* "$DEPLOY_DIR/skating/"
    echo "    ✓ Copied skating directory from root"
fi

# Copy the libraries directory if it exists
if [ -d "src/libraries" ]; then
    echo "  • Copying libraries directory..."
    mkdir -p "$DEPLOY_DIR/libraries"
    cp -rf src/libraries/* "$DEPLOY_DIR/libraries/"
    echo "    ✓ Copied libraries directory"
elif [ -d "libraries" ]; then
    echo "  • Copying libraries directory from root..."
    mkdir -p "$DEPLOY_DIR/libraries"
    cp -rf libraries/* "$DEPLOY_DIR/libraries/"
    echo "    ✓ Copied libraries directory from root"
fi

# Create local data directory if it doesn't exist
mkdir -p "data"

echo "  • Copying data files..."
if [ -f "scrapers/data/pool.json" ]; then
    cp scrapers/data/pool.json "$DEPLOY_DIR/data/"
    echo "    ✓ Copied pool.json"
fi
if [ -f "scrapers/data/skating.json" ]; then
    cp scrapers/data/skating.json "$DEPLOY_DIR/data/"
    echo "    ✓ Copied skating.json"
fi
if [ -f "scrapers/data/libraries.json" ]; then
    cp scrapers/data/libraries.json "$DEPLOY_DIR/data/"
    echo "    ✓ Copied libraries.json"
fi

# Define server and path
SERVER="france"
REMOTE_PATH="/var/www/isthelclcpoolopen.ca/html/"
REMOTE_SCRAPERS_PATH="/home/gruberb/scrapers"

echo "📦 Syncing optimized files → $SERVER:$REMOTE_PATH …"

# Show what will be deployed
echo "Files to be deployed:"
find "$DEPLOY_DIR" -type f | sort

# Prepare server for deployment
echo "Preparing server for deployment..."
ssh $SERVER "chmod -R 755 $REMOTE_PATH"
ssh $SERVER "rm -f $REMOTE_PATH/index.html"
ssh $SERVER "rm -f $REMOTE_PATH/skating/index.html"
ssh $SERVER "rm -f $REMOTE_PATH/libraries/index.html"

# Push only the optimized files to the remote web root
rsync -avz --delete --force "$DEPLOY_DIR/" "$SERVER:$REMOTE_PATH"

echo "Setting proper permissions..."
ssh $SERVER "chmod -R 755 $REMOTE_PATH"
ssh $SERVER "find $REMOTE_PATH -type f -exec chmod 644 {} \;"

# Deploy scrapers to the server
echo "📦 Deploying scrapers to $SERVER:$REMOTE_SCRAPERS_PATH..."
if [ -d "scrapers" ]; then
    # Make sure the remote directory exists
    ssh $SERVER "mkdir -p $REMOTE_SCRAPERS_PATH/logs $REMOTE_SCRAPERS_PATH/data"

    # Copy scraper files
    rsync -avz --exclude="node_modules" --exclude="data/*.json" scrapers/ "$SERVER:$REMOTE_SCRAPERS_PATH/"

    # Install dependencies on the remote server
    ssh $SERVER "cd $REMOTE_SCRAPERS_PATH && npm install"

    # Make scripts executable
    ssh $SERVER "chmod +x $REMOTE_SCRAPERS_PATH/*.js"

    # Set up crontab if not already set up
    echo "Setting up crontab..."
    ssh $SERVER "crontab -l > /tmp/current_crontab 2>/dev/null || echo '# LCLC Scrapers' > /tmp/current_crontab"

    # Check if crontab entries already exist
    if ! ssh $SERVER "grep -q 'pool-scraper.js' /tmp/current_crontab"; then
        ssh $SERVER "echo '# LCLC Pool - run every 30 minutes' >> /tmp/current_crontab"
        ssh $SERVER "echo '*/30 * * * * cd /home/gruberb/scrapers && /usr/bin/node pool-scraper.js >> /home/gruberb/scrapers/logs/pool-scraper.log 2>&1' >> /tmp/current_crontab"
    fi

    if ! ssh $SERVER "grep -q 'skating-scraper.js' /tmp/current_crontab"; then
        ssh $SERVER "echo '# LCLC Skating - run once a day at 1AM' >> /tmp/current_crontab"
        ssh $SERVER "echo '0 1 * * * cd /home/gruberb/scrapers && /usr/bin/node skating-scraper.js >> /home/gruberb/scrapers/logs/skating-scraper.log 2>&1' >> /tmp/current_crontab"
    fi

    if ! ssh $SERVER "grep -q 'libraries-scraper.js' /tmp/current_crontab"; then
        ssh $SERVER "echo '# South Shore Libraries - run once a day at 2AM' >> /tmp/current_crontab"
        ssh $SERVER "echo '0 2 * * * cd /home/gruberb/scrapers && /usr/bin/node libraries-scraper.js >> /home/gruberb/scrapers/logs/libraries-scraper.log 2>&1' >> /tmp/current_crontab"
    fi

    # Update copy step to move JSON files to web directory
    if ! ssh $SERVER "grep -q 'copy-data-files' /tmp/current_crontab"; then
        ssh $SERVER "echo '# Copy data files to web directory' >> /tmp/current_crontab"
        ssh $SERVER "echo '*/31 * * * * cp /home/gruberb/scrapers/data/*.json /var/www/isthelclcpoolopen.ca/html/data/' >> /tmp/current_crontab"
    fi

    # Install the updated crontab
    ssh $SERVER "crontab /tmp/current_crontab"
    ssh $SERVER "rm /tmp/current_crontab"

    echo "✅ Scrapers deployed and crontab set up!"

    # Run scrapers manually first time to generate initial data
    echo "Running scrapers for initial data..."
    ssh $SERVER "cd $REMOTE_SCRAPERS_PATH && node pool-scraper.js && node skating-scraper.js && node libraries-scraper.js"

    # Copy initial data files to web directory
    ssh $SERVER "cp $REMOTE_SCRAPERS_PATH/data/*.json $REMOTE_PATH/data/"
    ssh $SERVER "chmod 644 $REMOTE_PATH/data/*.json"
else
    echo "⚠️ Warning: scrapers directory not found, skipping scraper deployment"
fi

echo "✅ Deployment of optimized files to $SERVER:$REMOTE_PATH completed!"
