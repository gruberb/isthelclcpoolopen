module.exports = {
  input: "src/app.js",
  output: {
    file: "dist/bundle.js",
    format: "iife",
    sourcemap: false,
    // Ensure proper handling of import/export
    inlineDynamicImports: true,
  },
  // Add this to make sure Rollup can resolve relative imports
  onwarn(warning, warn) {
    // Suppress circular dependency warnings
    if (warning.code === "CIRCULAR_DEPENDENCY") return;
    warn(warning);
  },
};
