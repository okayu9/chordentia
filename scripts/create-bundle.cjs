const fs = require('fs');
const path = require('path');

function readModuleContent(distPath, filePath) {
  const fullPath = path.join(distPath, filePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return '';
}

function processImports(content, moduleMap, inlinedModules = new Set()) {
  // Remove all import statements (we'll include modules at the top level)
  return content.replace(/import\s*{[^}]*}\s*from\s*['"]([^'"]*)['"]\s*;?\s*/gm, (match, importPath) => {
    // Just remove the import statement - modules are included separately
    return `// Import removed: ${importPath}\n`;
  });
}

function removeExports(content) {
  return content
    .replace(/export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/gm, 'const $1 =')
    .replace(/export\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm, 'class $1')
    .replace(/export\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm, 'function $1')
    .replace(/export\s*{\s*[^}]*\s*}\s*;?\s*$/gm, '')
    .replace(/export\s*{\s*[^}]*\s*}\s*from\s*['"][^'"]*['"];?\s*/gm, '');
}

function createBundle() {
  try {
    const distPath = path.join(__dirname, '..', 'dist');
    
    // Read all modules including constants
    const moduleMap = {
      'constants/music-constants': readModuleContent(distPath, 'constants/music-constants.js'),
      'constants/audio-constants': readModuleContent(distPath, 'constants/audio-constants.js'),
      'constants/ui-constants': readModuleContent(distPath, 'constants/ui-constants.js'),
      'chord-registry-complete': readModuleContent(distPath, 'chord-registry-complete.js'),
      'utils/dom-utils': readModuleContent(distPath, 'utils/dom-utils.js'),
      'utils/error-handling': readModuleContent(distPath, 'utils/error-handling.js'),
      'types': readModuleContent(distPath, 'types.js'),
    };
    
    // Remove exports from constants and utils
    Object.keys(moduleMap).forEach(key => {
      moduleMap[key] = removeExports(moduleMap[key]);
    });
    
    // Read main modules
    const musicTheoryContent = readModuleContent(distPath, 'music-theory.js');
    const audioPlayerContent = readModuleContent(distPath, 'audio-player.js');
    const appContent = readModuleContent(distPath, 'app.js');
    
    // Process main modules - resolve imports and remove exports
    const musicTheoryModule = removeExports(processImports(musicTheoryContent, moduleMap));
    const audioPlayerModule = removeExports(processImports(audioPlayerContent, moduleMap));
    const appModule = processImports(appContent, moduleMap);
    
    // Create the bundle content in dependency order
    const bundledModules = [
      '// Constants modules',
      moduleMap['constants/music-constants'],
      moduleMap['constants/audio-constants'],
      moduleMap['constants/ui-constants'],
      '',
      '// Chord registry',
      moduleMap['chord-registry-complete'],
      '',
      '// Utility modules',
      moduleMap['utils/dom-utils'],
      moduleMap['utils/error-handling'],
      '',
      '// Core modules',
      musicTheoryModule,
      '',
      audioPlayerModule,
      '',
      '// Main application',
      appModule
    ].filter(Boolean).join('\n');
    
    // Create bundled JavaScript with IIFE
    const bundledJs = `(function() {
'use strict';

${bundledModules}

})();`;
    
    // Write bundled file
    const bundlePath = path.join(distPath, 'bundle.js');
    fs.writeFileSync(bundlePath, bundledJs);
    console.log('✓ Created bundled JavaScript file');
  } catch (err) {
    console.error('Error creating bundle:', err);
    console.error(err.stack);
    process.exit(1);
  }
}

createBundle();