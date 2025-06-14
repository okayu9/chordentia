#!/usr/bin/env node

/**
 * Find songs with frequent slash augmented chords (e.g., Gaug/F) or equivalent structures
 */

const fs = require('fs');
const path = require('path');

// Augmented chord intervals: [0, 4, 8] (root, major 3rd, augmented 5th)
// We need to find chords that contain these intervals in any inversion

function getNoteNumber(note) {
  const noteMap = {
    'C': 0, 'C#': 1, 'Cs': 1, 'Db': 1, 
    'D': 2, 'D#': 3, 'Ds': 3, 'Eb': 3, 
    'E': 4, 'F': 5,
    'F#': 6, 'Fs': 6, 'Gb': 6, 
    'G': 7, 'G#': 8, 'Gs': 8, 'Ab': 8, 
    'A': 9, 'A#': 10, 'As': 10, 'Bb': 10, 
    'B': 11,
    // Additional enharmonic equivalents
    'Cb': 11, 'Fb': 4, 'E#': 5, 'B#': 0,
    // Double flats and sharps
    'Abb': 7, 'Bbb': 9, 'Cbb': 10, 'Dbb': 0, 'Ebb': 2, 'Gbb': 5,
    'C##': 2, 'D##': 4, 'F##': 7, 'G##': 10, 'A##': 0
  };
  return noteMap[note] !== undefined ? noteMap[note] : -1;
}

function parseChord(chord) {
  // Extract root note and bass note if it's a slash chord
  // ChordWiki uses both / and 'on' notation
  let slashIndex = chord.indexOf('/');
  let onIndex = chord.indexOf('on');
  let rootChord = chord;
  let bassNote = null;
  
  if (slashIndex !== -1) {
    rootChord = chord.substring(0, slashIndex);
    bassNote = chord.substring(slashIndex + 1);
  } else if (onIndex !== -1) {
    rootChord = chord.substring(0, onIndex);
    bassNote = chord.substring(onIndex + 2);
  }
  
  // Extract root note from chord
  const match = rootChord.match(/^([A-G][#b]?)/);
  if (!match) return null;
  
  const root = match[1];
  const quality = rootChord.substring(match[1].length);
  
  // Clean up bass note if it exists
  if (bassNote) {
    // Extract just the note from bass note (remove any quality)
    // Handle double flats/sharps as well
    const bassMatch = bassNote.match(/^([A-G][#b]*)/);
    if (bassMatch) {
      bassNote = bassMatch[1];
    } else {
      bassNote = null; // Invalid bass note
    }
  }
  
  return { root, quality, bassNote, isSlash: bassNote !== null };
}

function isSlashAugmentedStructure(root, quality, bassNote = null) {
  // Only accept slash chords (must have bass note)
  if (!bassNote) {
    return false;
  }
  
  const rootNum = getNoteNumber(root);
  const bassNum = getNoteNumber(bassNote);
  if (rootNum === -1 || bassNum === -1) return false;
  
  // ONLY accept explicit slash augmented chords (e.g., Gaug/F, CaugonE)
  // We want to be strict and only include true augmented chords in slash notation
  if (quality === 'aug' || quality === '+' || quality === '+5' || quality === '#5') {
    return true;
  }
  
  return false;
}

function extractChordsFromFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const chords = [];
    
    // Extract chord names from onclick attributes
    const CHORD_REGEX = /onclick="javascript:popupImage\('\/cd\/([^.]+)\.png'/g;
    let match;
    
    while ((match = CHORD_REGEX.exec(content)) !== null) {
      const rawChord = match[1];
      let chord = decodeURIComponent(rawChord)
        .replace(/&quot;/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      
      // Skip non-chord elements
      if (chord.length > 0 && /^[A-G]/.test(chord) && !chord.includes('>') && !chord.includes('<')) {
        chords.push(chord);
      }
    }
    
    return chords;
  } catch (error) {
    return [];
  }
}

function analyzeSongForSlashAugChords(filePath, fileName) {
  const chords = extractChordsFromFile(filePath, fileName);
  if (chords.length === 0) return null;
  
  const slashAugChords = [];
  const allChords = new Set();
  
  for (const chord of chords) {
    allChords.add(chord);
    const parsed = parseChord(chord);
    
    if (parsed && isSlashAugmentedStructure(parsed.root, parsed.quality, parsed.bassNote)) {
      slashAugChords.push(chord);
    }
  }
  
  const uniqueSlashAugChords = [...new Set(slashAugChords)];
  const slashAugFrequency = slashAugChords.length / chords.length;
  
  if (uniqueSlashAugChords.length > 0) {
    let displayName = fileName;
    try {
      displayName = decodeURIComponent(fileName);
    } catch (e) {
      // Keep original filename if decoding fails
    }
    
    return {
      fileName: displayName,
      totalChords: chords.length,
      slashAugmentedChords: uniqueSlashAugChords,
      slashAugmentedCount: slashAugChords.length,
      slashAugmentedFrequency: slashAugFrequency,
      allUniqueChords: [...allChords]
    };
  }
  
  return null;
}

function findSlashAugmentedSongs() {
  const sampleDir = path.join(process.cwd(), 'sample');
  const files = fs.readdirSync(sampleDir);
  
  console.log('🔍 分数augコード（例：Gaug/F）または同等構造のコードを検索中...\n');
  
  const slashAugSongs = [];
  let processedCount = 0;
  
  for (const file of files) {
    if (file.startsWith('.')) continue;
    
    const filePath = path.join(sampleDir, file);
    const result = analyzeSongForSlashAugChords(filePath, file);
    
    if (result) {
      slashAugSongs.push(result);
    }
    
    processedCount++;
    if (processedCount % 1000 === 0) {
      console.log(`処理済み: ${processedCount}曲...`);
    }
  }
  
  // Sort by slash augmented chord frequency, then by count
  slashAugSongs.sort((a, b) => {
    if (Math.abs(a.slashAugmentedFrequency - b.slashAugmentedFrequency) > 0.01) {
      return b.slashAugmentedFrequency - a.slashAugmentedFrequency;
    }
    return b.slashAugmentedCount - a.slashAugmentedCount;
  });
  
  // Also create a ranking by absolute count
  const slashAugSongsByCount = [...slashAugSongs].sort((a, b) => b.slashAugmentedCount - a.slashAugmentedCount);
  
  console.log(`\n📊 分析完了: ${processedCount}曲中 ${slashAugSongs.length}曲で分数augコードを発見\n`);
  
  // Show top results by frequency
  console.log('=== 分数augコード使用頻度ランキング（割合順・上位50曲） ===\n');
  
  for (let i = 0; i < Math.min(50, slashAugSongs.length); i++) {
    const song = slashAugSongs[i];
    const percentage = (song.slashAugmentedFrequency * 100).toFixed(1);
    
    console.log(`${(i + 1).toString().padStart(2)}. ${song.fileName}`);
    console.log(`    使用コード: ${song.slashAugmentedChords.join(', ')}`);
    console.log(`    頻度: ${song.slashAugmentedCount}回/${song.totalChords}回 (${percentage}%)`);
    console.log('');
  }
  
  // Show top results by absolute count
  console.log('\n=== 分数augコード使用回数ランキング（回数順・上位50曲） ===\n');
  
  for (let i = 0; i < Math.min(50, slashAugSongsByCount.length); i++) {
    const song = slashAugSongsByCount[i];
    const percentage = (song.slashAugmentedFrequency * 100).toFixed(1);
    
    console.log(`${(i + 1).toString().padStart(2)}. ${song.fileName}`);
    console.log(`    使用コード: ${song.slashAugmentedChords.join(', ')}`);
    console.log(`    頻度: ${song.slashAugmentedCount}回/${song.totalChords}回 (${percentage}%)`);
    console.log('');
  }
  
  // Show songs with specific patterns
  console.log('\n=== 特徴的な分数augコード使用パターン ===\n');
  
  // Songs with high slash aug usage (>5%)
  const highSlashAugSongs = slashAugSongs.filter(s => s.slashAugmentedFrequency > 0.05);
  console.log(`🔥 高頻度使用曲 (5%以上): ${highSlashAugSongs.length}曲`);
  
  // Songs with many different slash aug chords
  const diverseSlashAugSongs = slashAugSongs.filter(s => s.slashAugmentedChords.length >= 2);
  console.log(`🎵 多様な分数augコード使用曲 (2種類以上): ${diverseSlashAugSongs.length}曲`);
  
  // Show some examples of diverse usage
  if (diverseSlashAugSongs.length > 0) {
    console.log('\n多様な分数augコード使用例:');
    for (let i = 0; i < Math.min(10, diverseSlashAugSongs.length); i++) {
      const song = diverseSlashAugSongs[i];
      console.log(`- ${song.fileName}`);
      console.log(`  使用コード: ${song.slashAugmentedChords.join(', ')}`);
    }
  }
  
  // Analyze common slash aug chord patterns and count total occurrences
  const allSlashAugChords = {};
  const allSlashAugChordsCount = {};
  
  // Re-process all files to get accurate total counts
  for (const file of files) {
    if (file.startsWith('.')) continue;
    
    const filePath = path.join(sampleDir, file);
    const chords = extractChordsFromFile(filePath, file);
    
    const uniqueSlashAugInSong = new Set();
    
    for (const chord of chords) {
      const parsed = parseChord(chord);
      if (parsed && isSlashAugmentedStructure(parsed.root, parsed.quality, parsed.bassNote)) {
        // Count unique chords per song
        uniqueSlashAugInSong.add(chord);
        // Count total occurrences
        allSlashAugChordsCount[chord] = (allSlashAugChordsCount[chord] || 0) + 1;
      }
    }
    
    // Count songs that use each chord
    for (const chord of uniqueSlashAugInSong) {
      allSlashAugChords[chord] = (allSlashAugChords[chord] || 0) + 1;
    }
  }
  
  const sortedSlashAugChords = Object.entries(allSlashAugChords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
    
  const sortedSlashAugChordsCount = Object.entries(allSlashAugChordsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  console.log('\n=== よく使われる分数augコード（楽曲数順・上位20） ===');
  for (const [chord, count] of sortedSlashAugChords) {
    console.log(`${chord}: ${count}曲`);
  }
  
  console.log('\n=== よく使われる分数augコード（総出現回数順・上位20） ===');
  for (const [chord, count] of sortedSlashAugChordsCount) {
    console.log(`${chord}: ${count}回`);
  }
  
  return slashAugSongs;
}

if (require.main === module) {
  findSlashAugmentedSongs();
}