const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function buildWithEsbuild() {
  try {
    console.log('🚀 Building with esbuild...');
    
    // Build JavaScript bundle
    const result = await esbuild.build({
      entryPoints: ['src/app.ts'],
      bundle: true,
      minify: true,
      outfile: 'dist/bundle.min.js',
      format: 'iife',
      target: 'es2020',
      sourcemap: false,
      treeShaking: true,
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      banner: {
        js: '// Chordentia - Built with esbuild'
      }
    });

    if (result.errors.length > 0) {
      console.error('Build errors:', result.errors);
      process.exit(1);
    }

    if (result.warnings.length > 0) {
      console.warn('Build warnings:', result.warnings);
    }

    // Get bundle size
    const bundleStats = fs.statSync('dist/bundle.min.js');
    const bundleSize = (bundleStats.size / 1024).toFixed(1);
    
    console.log(`✓ JavaScript bundle created: ${bundleSize}KB`);

    return result;
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildWithEsbuild();