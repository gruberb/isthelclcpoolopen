// build.js - A simple build script
const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const zlib = require("zlib");

// Directories
const SRC_DIR = "src";
const DIST_DIR = "dist";

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Create subdirectories in dist
["api", "components", "state", "utils", "skating", "js", "favicon"].forEach(
  (dir) => {
    const distSubDir = path.join(DIST_DIR, dir);
    if (!fs.existsSync(distSubDir)) {
      fs.mkdirSync(distSubDir, { recursive: true });
    }
  },
);

// Process JS files with minification
async function processJSFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(SRC_DIR, filePath);
  const outputPath = path.join(DIST_DIR, relativePath);

  try {
    // Minify JS
    const minified = await minify(content, {
      toplevel: true,
      compress: {
        passes: 2,
      },
      mangle: true,
    });

    // Write minified file
    fs.writeFileSync(outputPath, minified.code);

    // Create gzipped version for servers that can use pre-compressed assets
    const gzipped = zlib.gzipSync(minified.code, { level: 9 });
    fs.writeFileSync(`${outputPath}.gz`, gzipped);

    console.log(
      `Processed: ${relativePath} (${content.length} → ${minified.code.length} bytes, gzipped: ${gzipped.length} bytes)`,
    );
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    // Fall back to copying the original file if minification fails
    fs.copyFileSync(filePath, outputPath);
  }
}

// Process CSS files with minification
function processCSSFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(SRC_DIR, filePath);
  const outputPath = path.join(DIST_DIR, relativePath);

  // Simple CSS minification (replace with more robust library if needed)
  const minified = content
    .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "") // Remove comments and whitespace
    .replace(/ {2,}/g, " ") // Remove extra spaces
    .replace(/: /g, ":")
    .replace(/ \{/g, "{")
    .replace(/; /g, ";");

  // Write minified file
  fs.writeFileSync(outputPath, minified);

  // Create gzipped version
  const gzipped = zlib.gzipSync(minified, { level: 9 });
  fs.writeFileSync(`${outputPath}.gz`, gzipped);

  console.log(
    `Processed: ${relativePath} (${content.length} → ${minified.length} bytes, gzipped: ${gzipped.length} bytes)`,
  );
}

// Process HTML files with minimal minification
function processHTMLFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(SRC_DIR, filePath);
  const outputPath = path.join(DIST_DIR, relativePath);

  // Simple HTML minification (replace with more robust library if needed)
  const minified = content
    .replace(/<!--(?:(?!-->)[\s\S])*-->/g, "") // Remove comments
    .replace(/\s{2,}/g, " ") // Reduce multiple spaces to single space
    .replace(/>\s+</g, "><"); // Remove whitespace between tags

  // Write minified file
  fs.writeFileSync(outputPath, minified);

  // Create gzipped version
  const gzipped = zlib.gzipSync(minified, { level: 9 });
  fs.writeFileSync(`${outputPath}.gz`, gzipped);

  console.log(
    `Processed: ${relativePath} (${content.length} → ${minified.length} bytes, gzipped: ${gzipped.length} bytes)`,
  );
}

// Copy other files as is
function copyFile(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);
  const outputPath = path.join(DIST_DIR, relativePath);

  // Ensure the directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.copyFileSync(filePath, outputPath);
  console.log(`Copied: ${relativePath}`);
}

// Process all files in the src directory
function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else {
      const ext = path.extname(entry.name).toLowerCase();

      if (ext === ".js") {
        processJSFile(fullPath);
      } else if (ext === ".css") {
        processCSSFile(fullPath);
      } else if (ext === ".html") {
        processHTMLFile(fullPath);
      } else {
        copyFile(fullPath);
      }
    }
  }
}

// Start processing
console.log("Building optimized files...");
processDirectory(SRC_DIR);
console.log("Build complete!");
