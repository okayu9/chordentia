#!/usr/bin/env ts-node

/**
 * Chord Extraction Script for Chordentia
 * 
 * This script extracts all chord progressions from the sample directory,
 * which contains ChordWiki HTML files with embedded chord progressions.
 * 
 * Usage: npm run extract-chords
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ChordData {
  chord: string;
  frequency: number;
  songs: string[];
}

interface ExtractionResult {
  totalSongs: number;
  totalChords: number;
  uniqueChords: number;
  chords: ChordData[];
}

// Regex to extract chord names from onclick attributes
const CHORD_REGEX = /onclick="javascript:popupImage\('\/cd\/([^.]+)\.png'/g;

// Regex to clean chord names (remove special characters used in ChordWiki)
const CLEAN_CHORD_REGEX = /^([A-G][#b]?(?:maj|min|m|dim|aug|sus|add|omit|\+|-|7|9|11|13|M|°|ø|\/|∆|△|\(|\)|#|b|\d)*)/;

function extractChordsFromFile(filePath: string, fileName: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const chords: string[] = [];
    let match;

    // Extract all chord names from onclick attributes
    while ((match = CHORD_REGEX.exec(content)) !== null) {
      const rawChord = match[1];
      
      // Skip special markers and non-chord elements
      if (isValidChord(rawChord)) {
        const cleanedChord = cleanChordName(rawChord);
        if (cleanedChord) {
          chords.push(cleanedChord);
        }
      }
    }

    return chords;
  } catch (error) {
    console.warn(`Warning: Could not read file ${fileName}: ${error}`);
    return [];
  }
}

function isValidChord(chord: string): boolean {
  // Skip special markers, images, and non-musical elements
  const skipPatterns = [
    '>', '<', '(↓)', '(↑)', 'rit', 'accel', 'Fine', 'D.C.', 'D.S.',
    'Coda', 'Intro', 'Outro', 'Verse', 'Chorus', 'Bridge',
    'Solo', 'Interlude', 'Break', 'Fill', 'Riff'
  ];
  
  return !skipPatterns.some(pattern => chord.includes(pattern)) &&
         chord.length > 0 &&
         /^[A-G]/.test(chord); // Must start with a note name
}

function cleanChordName(rawChord: string): string | null {
  // Decode URL-encoded characters
  let chord = decodeURIComponent(rawChord);
  
  // Remove HTML entities and special formatting
  chord = chord
    .replace(/&quot;/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, '')
    .trim();
  
  // Extract the actual chord part using regex
  const match = chord.match(CLEAN_CHORD_REGEX);
  if (match) {
    let cleanChord = match[1];
    
    // Normalize common chord notation variations
    cleanChord = normalizeChordNotation(cleanChord);
    
    return cleanChord;
  }
  
  return null;
}

function normalizeChordNotation(chord: string): string {
  return chord
    // Normalize major 7th notations
    .replace(/maj7/g, 'M7')
    .replace(/MA7/g, 'M7')
    .replace(/Ma7/g, 'M7')
    .replace(/△7/g, 'M7')
    .replace(/∆7/g, 'M7')
    
    // Normalize major chord notations
    .replace(/maj(?!7)/g, 'M')
    .replace(/MA(?!7)/g, 'M')
    .replace(/Ma(?!7)/g, 'M')
    .replace(/△(?!7)/g, 'M')
    .replace(/∆(?!7)/g, 'M')
    
    // Normalize minor notations
    .replace(/min/g, 'm')
    .replace(/mi(?!n)/g, 'm')
    .replace(/-(?!5)/g, 'm')
    
    // Normalize diminished notations
    .replace(/dim/g, 'dim')
    .replace(/°/g, 'dim')
    .replace(/o/g, 'dim')
    
    // Normalize half-diminished notations
    .replace(/ø/g, 'm7b5')
    .replace(/m7-5/g, 'm7b5')
    .replace(/m7♭5/g, 'm7b5')
    
    // Normalize augmented notations
    .replace(/aug/g, '+')
    .replace(/\+5/g, '+')
    .replace(/#5/g, '+')
    
    // Clean up parentheses around extensions
    .replace(/\(([^)]+)\)/g, '$1')
    
    // Remove extra spaces
    .replace(/\s+/g, '');
}

function extractAllChords(): ExtractionResult {
  const sampleDir = join(process.cwd(), 'sample');
  const files = readdirSync(sampleDir);
  
  const chordFrequency = new Map<string, ChordData>();
  let totalChords = 0;
  let processedSongs = 0;
  
  console.log(`Processing ${files.length} files...`);
  
  for (const file of files) {
    if (file.startsWith('.')) continue; // Skip hidden files
    
    const filePath = join(sampleDir, file);
    const chords = extractChordsFromFile(filePath, file);
    
    if (chords.length > 0) {
      processedSongs++;
      totalChords += chords.length;
      
      // Track unique chords and their frequencies
      const uniqueChordsInSong = new Set(chords);
      
      for (const chord of uniqueChordsInSong) {
        if (chordFrequency.has(chord)) {
          const data = chordFrequency.get(chord)!;
          data.frequency++;
          data.songs.push(file);
        } else {
          chordFrequency.set(chord, {
            chord,
            frequency: 1,
            songs: [file]
          });
        }
      }
    }
    
    // Progress indicator for large datasets
    if ((processedSongs % 100) === 0) {
      console.log(`Processed ${processedSongs} songs...`);
    }
  }
  
  // Sort chords by frequency (most common first)
  const sortedChords = Array.from(chordFrequency.values())
    .sort((a, b) => b.frequency - a.frequency);
  
  return {
    totalSongs: processedSongs,
    totalChords,
    uniqueChords: sortedChords.length,
    chords: sortedChords
  };
}

function generateReport(result: ExtractionResult): void {
  const { totalSongs, totalChords, uniqueChords, chords } = result;
  
  console.log('\n=== Chord Extraction Report ===');
  console.log(`Total songs processed: ${totalSongs}`);
  console.log(`Total chord instances: ${totalChords}`);
  console.log(`Unique chords found: ${uniqueChords}`);
  console.log(`Average chords per song: ${(totalChords / totalSongs).toFixed(2)}`);
  
  console.log('\n=== Most Common Chords ===');
  const top20 = chords.slice(0, 20);
  for (let i = 0; i < top20.length; i++) {
    const { chord, frequency } = top20[i];
    const percentage = ((frequency / totalSongs) * 100).toFixed(1);
    console.log(`${(i + 1).toString().padStart(2)}. ${chord.padEnd(10)} - ${frequency.toString().padStart(4)} songs (${percentage}%)`);
  }
  
  console.log('\n=== Rare Chords (appearing in only 1 song) ===');
  const rareChords = chords.filter(c => c.frequency === 1);
  console.log(`Found ${rareChords.length} chords that appear in only one song:`);
  const rareChordNames = rareChords.slice(0, 20).map(c => c.chord);
  console.log(rareChordNames.join(', '));
  if (rareChords.length > 20) {
    console.log(`... and ${rareChords.length - 20} more`);
  }
}

function saveResults(result: ExtractionResult): void {
  const outputPath = join(process.cwd(), 'extracted-chords.json');
  
  // Create a summary for easier consumption
  const summary = {
    metadata: {
      extractedAt: new Date().toISOString(),
      totalSongs: result.totalSongs,
      totalChords: result.totalChords,
      uniqueChords: result.uniqueChords,
      averageChordsPerSong: Math.round((result.totalChords / result.totalSongs) * 100) / 100
    },
    
    // All unique chords, sorted by frequency
    allChords: result.chords.map(({ chord, frequency }) => ({ chord, frequency })),
    
    // Just the chord names for easy integration
    chordNames: result.chords.map(c => c.chord),
    
    // Most common chords (appearing in >10% of songs)
    commonChords: result.chords
      .filter(c => c.frequency / result.totalSongs > 0.1)
      .map(c => c.chord),
    
    // Rare chords (appearing in only 1-2 songs)
    rareChords: result.chords
      .filter(c => c.frequency <= 2)
      .map(c => c.chord)
  };
  
  writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\nResults saved to: ${outputPath}`);
}

// Main execution
function main(): void {
  console.log('Starting chord extraction from sample directory...\n');
  
  try {
    const result = extractAllChords();
    generateReport(result);
    saveResults(result);
    
    console.log('\n✅ Chord extraction completed successfully!');
    
    // Suggest next steps for improving Chordentia coverage
    console.log('\n=== Integration Suggestions ===');
    console.log('1. Review rare chords to ensure they are properly supported in CHORD_FORMULAS');
    console.log('2. Check if any common chord notations are missing from CHORD_QUALITY_NORMALIZATION');
    console.log('3. Consider adding the most common chords to test cases');
    console.log('4. Use extracted-chords.json to validate chord parsing accuracy');
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

export { extractAllChords, type ExtractionResult };