#!/usr/bin/env node

/**
 * Chord Coverage Analysis Script
 * 
 * Analyzes how well the current Chordentia chord formulas cover
 * the chords found in the extracted sample data.
 */

const fs = require('fs');
const path = require('path');

// Import the chord formulas (we'll read the compiled JS)
function loadChordFormulas() {
  try {
    // Read the compiled music-theory.js to extract CHORD_FORMULAS
    const musicTheoryPath = path.join(process.cwd(), 'dist', 'music-theory.js');
    if (!fs.existsSync(musicTheoryPath)) {
      console.log('Building TypeScript first...');
      require('child_process').execSync('npm run build:dev', { stdio: 'inherit' });
    }
    
    const content = fs.readFileSync(musicTheoryPath, 'utf-8');
    
    // Extract CHORD_FORMULAS object (this is a simple regex approach)
    const formulasMatch = content.match(/export const CHORD_FORMULAS = ({[\s\S]*?});/);
    if (formulasMatch) {
      // Evaluate the object (unsafe but ok for our controlled environment)
      const formulasStr = formulasMatch[1];
      return eval(`(${formulasStr})`);
    }
    
    return {};
  } catch (error) {
    console.error('Could not load chord formulas from dist/music-theory.js');
    console.error('Please run: npm run build:dev');
    return {};
  }
}

function parseChord(chord) {
  // Simple chord parsing to extract root and quality
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (match) {
    return {
      root: match[1],
      quality: match[2] || ''
    };
  }
  return null;
}

function analyzeChordCoverage() {
  // Load extracted chords
  const extractedPath = path.join(process.cwd(), 'extracted-chords.json');
  if (!fs.existsSync(extractedPath)) {
    console.error('extracted-chords.json not found. Please run: npm run extract-chords');
    process.exit(1);
  }
  
  const extractedData = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
  const chordFormulas = loadChordFormulas();
  
  console.log('=== Chord Coverage Analysis ===');
  console.log(`Total unique chords in sample data: ${extractedData.uniqueChords}`);
  console.log(`Total chord qualities in Chordentia: ${Object.keys(chordFormulas).length}`);
  
  // Analyze coverage
  const supportedQualities = new Set(Object.keys(chordFormulas));
  const supported = [];
  const unsupported = [];
  const qualityFrequency = new Map();
  
  for (const { chord, frequency } of extractedData.allChords) {
    const parsed = parseChord(chord);
    if (parsed) {
      const { quality } = parsed;
      
      // Count quality frequency
      if (qualityFrequency.has(quality)) {
        qualityFrequency.set(quality, qualityFrequency.get(quality) + frequency);
      } else {
        qualityFrequency.set(quality, frequency);
      }
      
      if (supportedQualities.has(quality)) {
        supported.push({ chord, frequency, quality });
      } else {
        unsupported.push({ chord, frequency, quality });
      }
    }
  }
  
  console.log(`\nSupported chords: ${supported.length} (${((supported.length / extractedData.uniqueChords) * 100).toFixed(1)}%)`);
  console.log(`Unsupported chords: ${unsupported.length} (${((unsupported.length / extractedData.uniqueChords) * 100).toFixed(1)}%)`);
  
  // Show most common unsupported chord qualities
  const unsupportedQualities = new Map();
  unsupported.forEach(({ quality, frequency }) => {
    if (unsupportedQualities.has(quality)) {
      unsupportedQualities.set(quality, unsupportedQualities.get(quality) + frequency);
    } else {
      unsupportedQualities.set(quality, frequency);
    }
  });
  
  const sortedUnsupported = Array.from(unsupportedQualities.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  console.log('\n=== Most Common Unsupported Chord Qualities ===');
  sortedUnsupported.forEach(([quality, frequency], index) => {
    const displayQuality = quality || '(major)';
    console.log(`${(index + 1).toString().padStart(2)}. "${displayQuality}" - ${frequency} instances`);
  });
  
  // Show some example unsupported chords
  console.log('\n=== Examples of Unsupported Chords ===');
  const exampleUnsupported = unsupported
    .filter(c => c.frequency > 10) // Only show reasonably common ones
    .slice(0, 15);
  
  exampleUnsupported.forEach(({ chord, frequency }) => {
    console.log(`  ${chord} (${frequency} songs)`);
  });
  
  console.log('\n=== Most Used Chord Qualities (Top 20) ===');
  const sortedQualities = Array.from(qualityFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  sortedQualities.forEach(([quality, frequency], index) => {
    const displayQuality = quality || '(major)';
    const isSupported = supportedQualities.has(quality) ? '✅' : '❌';
    console.log(`${(index + 1).toString().padStart(2)}. "${displayQuality}" ${isSupported} - ${frequency} instances`);
  });
  
  // Coverage recommendations
  console.log('\n=== Recommendations ===');
  
  const highPriorityUnsupported = sortedUnsupported
    .filter(([, frequency]) => frequency > 100)
    .map(([quality]) => quality);
  
  if (highPriorityUnsupported.length > 0) {
    console.log('High Priority - Add support for these common chord qualities:');
    highPriorityUnsupported.forEach(quality => {
      const displayQuality = quality || '(major)';
      console.log(`  - "${displayQuality}"`);
    });
  }
  
  const mediumPriorityUnsupported = sortedUnsupported
    .filter(([, frequency]) => frequency > 10 && frequency <= 100)
    .map(([quality]) => quality)
    .slice(0, 10);
  
  if (mediumPriorityUnsupported.length > 0) {
    console.log('\nMedium Priority - Consider adding support for:');
    mediumPriorityUnsupported.forEach(quality => {
      const displayQuality = quality || '(major)';
      console.log(`  - "${displayQuality}"`);
    });
  }
  
  // Calculate total coverage by frequency (how many chord instances are supported)
  const totalInstances = extractedData.allChords.reduce((sum, c) => sum + c.frequency, 0);
  const supportedInstances = supported.reduce((sum, c) => sum + c.frequency, 0);
  const coverageByFrequency = (supportedInstances / totalInstances) * 100;
  
  console.log(`\n=== Overall Coverage ===`);
  console.log(`Coverage by chord types: ${((supported.length / extractedData.uniqueChords) * 100).toFixed(1)}%`);
  console.log(`Coverage by frequency: ${coverageByFrequency.toFixed(1)}%`);
  console.log(`(${supportedInstances.toLocaleString()} of ${totalInstances.toLocaleString()} chord instances are supported)`);
}

if (require.main === module) {
  analyzeChordCoverage();
}