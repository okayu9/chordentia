#!/usr/bin/env node

/**
 * Simple Chord Coverage Analysis
 * 
 * Analyzes coverage by directly comparing chord qualities
 */

const fs = require('fs');
const path = require('path');

// Known chord qualities from our current implementation
const SUPPORTED_QUALITIES = new Set([
  '', 'maj', 'm', 'min', '7', 'maj7', 'm7', 'min7',
  'dim', 'dim7', 'm7b5', 'aug', '+5',
  'sus2', 'sus4', 'sus', '7sus4', '9sus4',
  '6', 'm6', '6/9', 'maj6/9',
  '9', 'maj9', 'm9', 'add9',
  'm11', 'add11', 'add#11',
  '13', 'm13', 'add13', 'add#13',
  'maj7+5', '7+5',
  'omit5', 'm(omit5)', '7omit5', 'maj7omit5', 'm7omit5',
  'omit3', '5', 'maj7(omit3)', '7omit3',
  'sus2omit5', 'sus4omit5', '7sus4omit5',
  '9omit5', 'm9omit5',
  '7b9', '7#9', '7b5', '7alt',
  '7(9)', '7(13)', '7(9,13)', '7(b9,b13)', '7(b5,#9)', '7(#5,b9)',
  '7(#9,#11)', '7(b9,#11)', '7(9,#11,13)',
  'mM7', 'mM9', 'mM11', 'mM13',
  'm7(9)', 'm7(11)', 'm7(9,11)', 'm7b5(11)',
  'maj7(9)', 'maj7(13)', 'maj7(9,13)',
  'aug7(b9)', 'aug9(#11)', 'aug7#9',
  '9b5', '(9)', '(11)', '(13)',
  'add2', 'add4', 'add6'
]);

// Chord quality normalization mapping (from our normalization file)
const NORMALIZATION_MAP = {
  '+5': 'aug', 'augmented': 'aug', '+': 'aug', '#5': 'aug',
  'min': 'm', 'minor': 'm', 'mi': 'm', '-': 'm',
  'min7': 'm7', 'minor7': 'm7', 'mi7': 'm7', '-7': 'm7',
  'M7': 'maj7', 'major7': 'maj7', 'Maj7': 'maj7', 'MA7': 'maj7', 'Ma7': 'maj7', '△7': 'maj7', 'j7': 'maj7',
  'M9': 'maj9', 'M7(9)': 'maj7(9)', '△': 'maj7',
  'mM7': 'mM7', 'minmaj7': 'mM7', 'mmaj7': 'mM7', 'mMA7': 'mM7',
  'mM13': 'mM13', 'minmaj13': 'mM13', 'mmaj13': 'mM13', 'mMA13': 'mM13',
  'mM9': 'mM9', 'minmaj9': 'mM9', 'mmaj9': 'mM9', 'mMA9': 'mM9',
  'mM11': 'mM11', 'minmaj11': 'mM11', 'mmaj11': 'mM11', 'mMA11': 'mM11',
  'diminished': 'dim', 'o': 'dim', '°': 'dim',
  'dim7': 'dim7', 'diminished7': 'dim7', 'o7': 'dim7', '°7': 'dim7',
  'half-dim': 'm7b5', 'ø': 'm7b5', 'm7♭5': 'm7b5', 'm7-5': 'm7b5', 'ø7': 'm7b5',
  'sus': 'sus4', 'suspended4': 'sus4', 'suspended2': 'sus2', 'suspended': 'sus4',
  'dom7': '7', 'dominant7': '7',
  '69': '6/9', '6add9': '6/9', 'maj69': 'maj6/9', 'M69': 'maj6/9',
  'no3': 'omit3', 'no5': 'omit5'
};

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

function normalizeQuality(quality) {
  // First apply the normalization mapping
  if (NORMALIZATION_MAP[quality]) {
    return NORMALIZATION_MAP[quality];
  }
  
  // If not found in mapping, apply regex-based normalization
  return quality
    .replace(/maj7/g, 'maj7')
    .replace(/MA7/g, 'maj7')
    .replace(/Ma7/g, 'maj7')
    .replace(/△7/g, 'maj7')
    .replace(/∆7/g, 'maj7')
    .replace(/maj(?!7)/g, 'maj')
    .replace(/MA(?!7)/g, 'maj')
    .replace(/Ma(?!7)/g, 'maj')
    .replace(/△(?!7)/g, 'maj7')
    .replace(/∆(?!7)/g, 'maj7')
    .replace(/min/g, 'm')
    .replace(/mi(?!n)/g, 'm')
    .replace(/-(?!5)/g, 'm')
    .replace(/dim/g, 'dim')
    .replace(/°/g, 'dim')
    .replace(/o/g, 'dim')
    .replace(/ø/g, 'm7b5')
    .replace(/m7-5/g, 'm7b5')
    .replace(/m7♭5/g, 'm7b5')
    .replace(/aug/g, 'aug')
    .replace(/\+5/g, 'aug')
    .replace(/#5/g, 'aug')
    .replace(/\(([^)]+)\)/g, '$1')
    .replace(/\s+/g, '');
}

function analyzeSimpleCoverage() {
  // Load extracted chords
  const extractedPath = path.join(process.cwd(), 'extracted-chords.json');
  if (!fs.existsSync(extractedPath)) {
    console.error('extracted-chords.json not found. Please run: npm run extract-chords');
    process.exit(1);
  }
  
  const extractedData = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
  
  console.log('=== Simple Chord Coverage Analysis ===');
  console.log(`Total unique chords in sample data: ${extractedData.uniqueChords}`);
  console.log(`Total supported chord qualities: ${SUPPORTED_QUALITIES.size}`);
  
  // Analyze coverage
  const supported = [];
  const unsupported = [];
  const qualityFrequency = new Map();
  
  for (const { chord, frequency } of extractedData.allChords) {
    const parsed = parseChord(chord);
    if (parsed) {
      let { quality } = parsed;
      
      // Normalize the quality
      const normalizedQuality = normalizeQuality(quality);
      
      // Count quality frequency
      if (qualityFrequency.has(normalizedQuality)) {
        qualityFrequency.set(normalizedQuality, qualityFrequency.get(normalizedQuality) + frequency);
      } else {
        qualityFrequency.set(normalizedQuality, frequency);
      }
      
      // Check if supported (check both original and normalized)
      if (SUPPORTED_QUALITIES.has(quality) || SUPPORTED_QUALITIES.has(normalizedQuality)) {
        supported.push({ chord, frequency, originalQuality: quality, normalizedQuality });
      } else {
        unsupported.push({ chord, frequency, originalQuality: quality, normalizedQuality });
      }
    }
  }
  
  console.log(`\nSupported chords: ${supported.length} (${((supported.length / extractedData.uniqueChords) * 100).toFixed(1)}%)`);
  console.log(`Unsupported chords: ${unsupported.length} (${((unsupported.length / extractedData.uniqueChords) * 100).toFixed(1)}%)`);
  
  // Calculate coverage by frequency
  const totalInstances = extractedData.allChords.reduce((sum, c) => sum + c.frequency, 0);
  const supportedInstances = supported.reduce((sum, c) => sum + c.frequency, 0);
  const coverageByFrequency = (supportedInstances / totalInstances) * 100;
  
  console.log(`\nCoverage by frequency: ${coverageByFrequency.toFixed(1)}%`);
  console.log(`(${supportedInstances.toLocaleString()} of ${totalInstances.toLocaleString()} chord instances are supported)`);
  
  // Show most common unsupported chord qualities
  const unsupportedQualities = new Map();
  unsupported.forEach(({ normalizedQuality, frequency }) => {
    if (unsupportedQualities.has(normalizedQuality)) {
      unsupportedQualities.set(normalizedQuality, unsupportedQualities.get(normalizedQuality) + frequency);
    } else {
      unsupportedQualities.set(normalizedQuality, frequency);
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
  
  // Show some example unsupported chords with high frequency
  console.log('\n=== High-Frequency Unsupported Chords ===');
  const exampleUnsupported = unsupported
    .filter(c => c.frequency > 50)
    .slice(0, 10);
  
  exampleUnsupported.forEach(({ chord, frequency, normalizedQuality }) => {
    console.log(`  ${chord} (${frequency} songs) - quality: "${normalizedQuality}"`);
  });
  
  // Show most used chord qualities overall
  console.log('\n=== Most Used Chord Qualities (Top 15) ===');
  const sortedQualities = Array.from(qualityFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  sortedQualities.forEach(([quality, frequency], index) => {
    const displayQuality = quality || '(major)';
    const isSupported = SUPPORTED_QUALITIES.has(quality) ? '✅' : '❌';
    console.log(`${(index + 1).toString().padStart(2)}. "${displayQuality}" ${isSupported} - ${frequency} instances`);
  });
  
  // Recommendations
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
  } else {
    console.log('✅ All high-frequency chord qualities are already supported!');
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
  
  console.log(`\n=== Summary ===`);
  console.log(`✅ Good coverage! ${coverageByFrequency.toFixed(1)}% of chord instances are supported`);
  if (coverageByFrequency > 95) {
    console.log('🎉 Excellent coverage - the chord database is very comprehensive!');
  } else if (coverageByFrequency > 90) {
    console.log('👍 Very good coverage - only minor gaps remain');
  } else if (coverageByFrequency > 80) {
    console.log('👌 Good coverage - some common chords could be added');
  } else {
    console.log('🔧 Coverage could be improved by adding more chord types');
  }
}

if (require.main === module) {
  analyzeSimpleCoverage();
}