#!/bin/bash

# Crisp Favicon Generator using Inkscape
# Uses Inkscape for pixel-perfect SVG rendering

# Check for required tools
if ! command -v inkscape &> /dev/null; then
    echo "❌ Inkscape is required but not installed."
    echo "Please install it with:"
    echo "  - Ubuntu/Debian: sudo apt install inkscape"
    echo "  - Mac: brew install inkscape or download from https://inkscape.org/"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is required but not installed."
    echo "Please install it with:"
    echo "  - Ubuntu/Debian: sudo apt install imagemagick"
    echo "  - Mac: brew install imagemagick"
    exit 1
fi

# Set up directories
SRC_DIR="src"
TEMP_DIR="temp_favicon"
mkdir -p "$TEMP_DIR"

# Create the optimized SVG file with pixel-perfect settings
echo "💡 Creating optimized SVG favicon..."
cat > "$TEMP_DIR/favicon-source.svg" << 'EOF'
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns="http://www.w3.org/2000/svg"
   width="100"
   height="100"
   viewBox="0 0 100 100"
   version="1.1"
   shape-rendering="crispEdges"
   image-rendering="optimizeSpeed">
  <circle cx="50" cy="50" r="45" fill="#0056b3"/>
  <path d="M25 42q12.5-18 25-5t25-5" fill="none" stroke="white" stroke-linecap="round" stroke-width="8"/>
  <path d="M25 62q12.5-18 25-5t25-5" fill="none" stroke="white" stroke-linecap="round" stroke-width="8"/>
</svg>
EOF

cp "$TEMP_DIR/favicon-source.svg" "$SRC_DIR/favicon.svg"
echo "✅ Created optimized SVG favicon at $SRC_DIR/favicon.svg"

# Generate PNGs with Inkscape for pixel-perfect rendering
echo "🖼️ Generating pixel-perfect PNG versions..."
for size in 16 32 48 64 128 192 512; do
    echo "  • Creating $size x $size PNG..."

    # Use Inkscape's export with specific settings for pixel-perfect rendering
    inkscape --export-type=png \
             --export-filename="$TEMP_DIR/favicon-$size.png" \
             --export-width=$size \
             --export-height=$size \
             --export-background-opacity=0 \
             --without-gui \
             "$TEMP_DIR/favicon-source.svg"

    # Verify the file was created
    if [ -f "$TEMP_DIR/favicon-$size.png" ]; then
        echo "    ✓ Created $size x $size PNG"
    else
        echo "    ❌ Failed to create $size x $size PNG"
    fi

    # Copy specific sizes to src directory
    if [ "$size" == "192" ] || [ "$size" == "512" ]; then
        cp "$TEMP_DIR/favicon-$size.png" "$SRC_DIR/favicon-$size.png"
    fi
done

# Create apple-touch-icon.png (180x180 is standard for Apple)
echo "🍎 Creating Apple Touch Icon..."
inkscape --export-type=png \
         --export-filename="$SRC_DIR/apple-touch-icon.png" \
         --export-width=180 \
         --export-height=180 \
         --export-background-opacity=0 \
         --without-gui \
         "$TEMP_DIR/favicon-source.svg"

# Create favicon.ico with multiple sizes
echo "🌐 Creating multi-size favicon.ico..."
convert "$TEMP_DIR/favicon-16.png" \
    "$TEMP_DIR/favicon-32.png" \
    "$TEMP_DIR/favicon-48.png" \
    "$TEMP_DIR/favicon-64.png" \
    -colors 256 "$SRC_DIR/favicon.ico"

# Create web manifest
if [ ! -f "$SRC_DIR/site.webmanifest" ]; then
    echo "📝 Creating web manifest..."
    cat > "$SRC_DIR/site.webmanifest" << 'EOF'
{
  "name": "LCLC Pool Status",
  "short_name": "Pool Status",
  "description": "Check real-time lane & kids swimming status at the LCLC Pool in Bridgewater, Nova Scotia",
  "icons": [
    {
      "src": "favicon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "favicon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0056b3",
  "background_color": "#f5f5f5",
  "display": "standalone",
  "start_url": "/"
}
EOF
    echo "✅ Created web manifest at $SRC_DIR/site.webmanifest"
fi

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "🎉 Favicon generation complete!"
echo "The following files have been created with pixel-perfect rendering:"
echo "  • $SRC_DIR/favicon.svg (Vector version)"
echo "  • $SRC_DIR/favicon.ico (Multi-size ICO for browsers)"
echo "  • $SRC_DIR/apple-touch-icon.png (For iOS)"
echo "  • $SRC_DIR/favicon-192.png (For Android/PWA)"
echo "  • $SRC_DIR/favicon-512.png (For Android/PWA)"
echo "  • $SRC_DIR/site.webmanifest (Web app manifest)"
