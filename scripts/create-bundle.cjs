const fs = require('fs');
const path = require('path');

function createBundle() {
  try {
    const distPath = path.join(__dirname, '..', 'dist');
    
    // Read all compiled modules
    const musicTheoryContent = fs.readFileSync(path.join(distPath, 'music-theory.js'), 'utf8');
    const audioPlayerContent = fs.readFileSync(path.join(distPath, 'audio-player.js'), 'utf8');
    const appContent = fs.readFileSync(path.join(distPath, 'app.js'), 'utf8');
    
    // Process music-theory.js - remove export, keep everything else
    const musicTheoryModule = musicTheoryContent
      .replace(/export\s+const\s+MusicTheory\s*=\s*/gm, 'const MusicTheory = ')
      .replace(/export\s*{\s*MusicTheory\s*}\s*;?\s*$/gm, '');
    
    // Process audio-player.js - remove import and export
    const audioPlayerModule = audioPlayerContent
      .replace(/import\s*{\s*MusicTheory\s*}\s*from\s*['"][^'"]*['"];?\s*/gm, '')
      .replace(/export\s+const\s+AudioPlayer\s*=\s*/gm, 'const AudioPlayer = ')
      .replace(/export\s*{\s*AudioPlayer\s*}\s*;?\s*$/gm, '');
    
    // Process app.js - remove imports
    const appModule = appContent
      .replace(/import\s*{\s*MusicTheory\s*}\s*from\s*['"][^'"]*['"];?\s*/gm, '')
      .replace(/import\s*{\s*AudioPlayer\s*}\s*from\s*['"][^'"]*['"];?\s*/gm, '');
    
    // Create bundled JavaScript with IIFE to avoid global scope pollution
    const bundledJs = `(function() {
'use strict';

// Music Theory Module
${musicTheoryModule}

// Audio Player Module  
${audioPlayerModule}

// Main App
${appModule}

})();`;
    
    // Write bundled file
    const bundlePath = path.join(distPath, 'bundle.js');
    fs.writeFileSync(bundlePath, bundledJs);
    console.log('✓ Created bundled JavaScript file');
  } catch (err) {
    console.error('Error creating bundle:', err);
    process.exit(1);
  }
}

createBundle();