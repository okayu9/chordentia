const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

async function createProdHtml() {
  try {
    // Read the original HTML file
    const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Read minified assets
    const distPath = path.join(__dirname, '..', 'dist');
    const cssContent = fs.readFileSync(path.join(distPath, 'styles.min.css'), 'utf8');
    const jsContent = fs.readFileSync(path.join(distPath, 'bundle.min.js'), 'utf8');
    
    // Read favicon SVG content
    const srcPath = path.join(__dirname, '..', 'src');
    const faviconPath = path.join(srcPath, 'favicon.svg');
    let faviconContent = '';
    if (fs.existsSync(faviconPath)) {
      faviconContent = fs.readFileSync(faviconPath, 'utf8');
    }

    // Inline CSS
    html = html.replace(
      '<link rel="stylesheet" href="styles.css">',
      `<style>${cssContent}</style>`
    );

    // Inline JavaScript
    html = html.replace(
      '<script type="module" src="dist/app.js"></script>',
      `<script>${jsContent}</script>`
    );
    
    // Inline favicon SVG as data URI and remove external favicon references
    if (faviconContent) {
      const faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(faviconContent).toString('base64')}`;
      
      // Replace SVG favicon link
      html = html.replace(
        '<link rel="icon" type="image/svg+xml" href="favicon.svg">',
        `<link rel="icon" type="image/svg+xml" href="${faviconDataUri}">`
      );
      
      // Remove PNG favicon references since we don't have them yet
      html = html.replace(/<link rel="icon" type="image\/png"[^>]*>/g, '');
      html = html.replace(/<link rel="apple-touch-icon"[^>]*>/g, '');
    }

    // Minify the HTML with inlined assets
    const minifiedHtml = await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    });

    // Write to dist directory
    const outputPath = path.join(__dirname, '..', 'dist', 'index.html');
    fs.writeFileSync(outputPath, minifiedHtml);
    console.log('✓ Created minified index.html with inlined assets');
  } catch (err) {
    console.error('Error creating HTML with inlined assets:', err);
    process.exit(1);
  }
}

createProdHtml();