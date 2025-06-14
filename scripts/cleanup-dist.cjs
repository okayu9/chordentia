const fs = require('fs');
const path = require('path');

function cleanupDist() {
  const distPath = path.join(__dirname, '..', 'dist');
  
  try {
    // Read all files in dist directory
    const files = fs.readdirSync(distPath);
    
    // Keep only index.html, remove everything else
    files.forEach(file => {
      if (file !== 'index.html') {
        const filePath = path.join(distPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Remove directory recursively
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`✓ Removed directory ${file}`);
        } else {
          // Remove file
          fs.unlinkSync(filePath);
          console.log(`✓ Removed ${file}`);
        }
      }
    });
    
    console.log('✓ Cleanup completed - dist/ now contains only index.html');
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanupDist();