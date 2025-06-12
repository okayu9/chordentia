const fs = require('fs');
const path = require('path');

function validateBuild() {
  const distPath = path.join(__dirname, '..', 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  try {
    // Check if dist directory exists
    if (!fs.existsSync(distPath)) {
      throw new Error('dist directory not found');
    }
    
    // Check if index.html exists
    if (!fs.existsSync(indexPath)) {
      throw new Error('index.html not found in dist directory');
    }
    
    // Check file size (should be reasonable)
    const stats = fs.statSync(indexPath);
    const fileSizeKB = stats.size / 1024;
    
    if (fileSizeKB < 5) {
      throw new Error(`File too small: ${fileSizeKB.toFixed(1)}KB (expected 10-20KB)`);
    }
    
    if (fileSizeKB > 50) {
      console.warn(`⚠️  File larger than expected: ${fileSizeKB.toFixed(1)}KB`);
    }
    
    // Check if HTML contains required elements
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const requiredElements = [
      '<style>', // Inlined CSS
      '<script type="module">', // Inlined JS
      'Chordentia', // Title
      'chord-input', // Main input
      'note-button' // Note buttons
    ];
    
    for (const element of requiredElements) {
      if (!content.includes(element)) {
        throw new Error(`Missing required element: ${element}`);
      }
    }
    
    // Check for leftover references to separate files
    const problematicRefs = [
      'src="dist/',
      'href="styles.css"',
      'src="app.js"'
    ];
    
    for (const ref of problematicRefs) {
      if (content.includes(ref)) {
        throw new Error(`Found reference to separate file: ${ref}`);
      }
    }
    
    console.log(`✅ Build validation passed`);
    console.log(`📦 File size: ${fileSizeKB.toFixed(1)}KB`);
    console.log(`🔍 All required elements found`);
    console.log(`🎯 No external file references found`);
    
  } catch (err) {
    console.error('❌ Build validation failed:', err.message);
    process.exit(1);
  }
}

validateBuild();